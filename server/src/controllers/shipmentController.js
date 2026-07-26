import Order from "../models/Order.js";
import { asyncHandler, AppError } from "../middleware/errorMiddleware.js";
import {
  trackShipment,
  cancelShipment,
  downloadLabel,
  downloadInvoice as downloadInvoiceService,
  generateManifest as generateManifestService,
} from "../services/shiprocket.js";
import { processOrderShipment } from "../services/shipmentService.js";

/* ==========================================================
   HELPERS
========================================================== */

/**
 * Parse Shiprocket tracking_data and extract a clean timeline array
 */
const parseTrackingTimeline = (trackingData) => {
  const activities =
    trackingData?.shipment_track_activities ||
    trackingData?.tracking_data?.shipment_track_activities ||
    [];

  return activities.map((a) => ({
    status:   a.status || a["sr-status-label"] || "",
    activity: a.activity || a["sr-status-label"] || "",
    date:     a.date ? new Date(a.date) : null,
    location: a.location || "",
  }));
};

/**
 * Map a Shiprocket status string to our orderStatus enum value
 */
const mapShiprocketStatusToOrderStatus = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("pickup scheduled"))     return "pickupScheduled";
  if (s.includes("picked up"))            return "shipped";
  if (s.includes("in transit"))           return "shipped";
  if (s.includes("reached hub"))          return "shipped";
  if (s.includes("out for delivery"))     return "outForDelivery";
  if (s.includes("delivered"))            return "delivered";
  if (s.includes("rto"))                  return null; // handled separately
  if (s.includes("cancelled"))            return "cancelled";
  return null; // no mapping — keep existing
};

/* ==========================================================
   TRACK ORDER (Customer)
========================================================== */

export const trackOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) throw new AppError("Order not found", 404);
  if (!order.awbCode) throw new AppError("Shipment has not been created yet.", 400);

  const tracking = await trackShipment(order.awbCode);

  const trackingData =
    tracking?.tracking_data ||
    tracking?.data ||
    tracking;

  const shipment = trackingData?.shipment_track?.[0];

  if (shipment?.current_status) {
    order.trackingStatus = shipment.current_status;
    order.shippingStatus = shipment.current_status;
    order.lastTrackingUpdate = new Date();

    const mappedStatus = mapShiprocketStatusToOrderStatus(shipment.current_status);
    if (mappedStatus) order.orderStatus = mappedStatus;

    if (shipment.current_status.toLowerCase().includes("rto")) {
      order.rtoStatus = shipment.current_status;
    }
  }

  if (shipment?.delivered_date && !order.deliveredAt) {
    order.deliveredAt = new Date(shipment.delivered_date);
    order.deliveryDate = new Date(shipment.delivered_date);
    order.orderStatus  = "delivered";
  }

  const timeline = parseTrackingTimeline(trackingData);
  if (timeline.length > 0) {
    order.trackingTimeline = timeline;
  }

  await order.save();

  res.status(200).json({ success: true, data: trackingData });
});

/* ==========================================================
   REFRESH SHIPMENT (Customer + Admin)
========================================================== */

export const refreshShipment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (!order.awbCode) throw new AppError("Shipment not created.", 400);

  const tracking = await trackShipment(order.awbCode);

  const trackingData =
    tracking?.tracking_data ||
    tracking?.data ||
    tracking;

  const shipment = trackingData?.shipment_track?.[0];

  if (shipment?.current_status) {
    order.trackingStatus    = shipment.current_status;
    order.shippingStatus    = shipment.current_status;
    order.lastTrackingUpdate = new Date();

    const mappedStatus = mapShiprocketStatusToOrderStatus(shipment.current_status);
    if (mappedStatus) order.orderStatus = mappedStatus;

    if (shipment.current_status.toLowerCase().includes("rto")) {
      order.rtoStatus = shipment.current_status;
    }
  }

  if (shipment?.delivered_date && !order.deliveredAt) {
    order.deliveredAt = new Date(shipment.delivered_date);
    order.deliveryDate = new Date(shipment.delivered_date);
    order.orderStatus  = "delivered";
  }

  const timeline = parseTrackingTimeline(trackingData);
  if (timeline.length > 0) {
    order.trackingTimeline = timeline;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Shipment refreshed successfully.",
    data: trackingData,
  });
});

/* ==========================================================
   GET SHIPMENT STATUS (stored data — no external call)
========================================================== */

export const getShipmentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).select(
    "shipmentId shiprocketOrderId awbCode trackingStatus shippingStatus " +
    "trackingUrl courierName courierCompanyId estimatedDelivery deliveryDate " +
    "shippingLabelUrl labelUrl invoiceUrl manifestUrl shipmentCreated " +
    "rtoStatus lastTrackingUpdate trackingTimeline orderStatus"
  );

  if (!order) throw new AppError("Order not found", 404);

  res.status(200).json({ success: true, data: order });
});

/* ==========================================================
   SYNC TRACKING TIMELINE (Admin — stores full timeline)
========================================================== */

export const syncTrackingTimeline = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (!order.awbCode) throw new AppError("No AWB found on this order.", 400);

  const tracking = await trackShipment(order.awbCode);

  const trackingData =
    tracking?.tracking_data ||
    tracking?.data ||
    tracking;

  const timeline = parseTrackingTimeline(trackingData);
  order.trackingTimeline   = timeline;
  order.lastTrackingUpdate = new Date();

  const shipment = trackingData?.shipment_track?.[0];
  if (shipment?.current_status) {
    order.trackingStatus = shipment.current_status;
    order.shippingStatus = shipment.current_status;

    const mappedStatus = mapShiprocketStatusToOrderStatus(shipment.current_status);
    if (mappedStatus) order.orderStatus = mappedStatus;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: `Synced ${timeline.length} tracking events.`,
    data: { timeline, trackingStatus: order.trackingStatus },
  });
});

/* ==========================================================
   CREATE SHIPMENT FOR ORDER (Admin — manual trigger)
========================================================== */

export const createShipmentForOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate("items.product")
    .populate("user", "email");

  if (!order) throw new AppError("Order not found", 404);
  if (order.paymentStatus !== "paid") throw new AppError("Order is not paid yet.", 400);
  if (order.shipmentCreated) throw new AppError("Shipment already created for this order.", 400);

  // Process shipment creation using unified shipment service (throwing errors on failure for admin actions)
  const updatedOrder = await processOrderShipment(order, true);

  res.status(200).json({
    success: true,
    message: "Shipment created successfully.",
    data:    { 
      shipmentId: updatedOrder.shipmentId, 
      shiprocketOrderId: updatedOrder.shiprocketOrderId, 
      awbCode: updatedOrder.awbCode, 
      courierName: updatedOrder.courierName 
    },
  });
});

/* ==========================================================
   GENERATE MANIFEST (Admin)
========================================================== */

export const generateManifestController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (!order.shipmentId) throw new AppError("Shipment not created for this order.", 400);

  const result = await generateManifestService(order.shipmentId);

  const manifestUrl =
    result?.manifest_url ||
    result?.data?.manifest_url ||
    result?.url ||
    "";

  order.manifestUrl = manifestUrl;
  await order.save();

  res.status(200).json({
    success: true,
    message: "Manifest generated successfully.",
    data: { manifestUrl, raw: result },
  });
});

/* ==========================================================
   DOWNLOAD SHIPPING LABEL (Admin)
========================================================== */

export const downloadShippingLabel = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (!order.shipmentId) throw new AppError("Shipment not found", 400);

  const label = await downloadLabel(order.shipmentId);

  const labelUrl =
    label?.label_url ||
    label?.response?.label_url ||
    order.shippingLabelUrl ||
    "";

  if (labelUrl) {
    order.labelUrl         = labelUrl;
    order.shippingLabelUrl = labelUrl;
    await order.save();
  }

  res.status(200).json({ success: true, data: { labelUrl, raw: label } });
});

/* ==========================================================
   DOWNLOAD INVOICE (Admin)
========================================================== */

export const downloadInvoice = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (!order.shiprocketOrderId) throw new AppError("Shiprocket order not found", 400);

  const invoice = await downloadInvoiceService(order.shiprocketOrderId);

  const invoiceUrl =
    invoice?.invoice_url ||
    invoice?.data?.invoice_url ||
    "";

  if (invoiceUrl) {
    order.invoiceUrl = invoiceUrl;
    await order.save();
  }

  res.status(200).json({ success: true, data: { invoiceUrl, raw: invoice } });
});

/* ==========================================================
   CANCEL SHIPMENT (Admin)
========================================================== */

export const cancelShipmentController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (!order.shiprocketOrderId) throw new AppError("Shiprocket order not found", 400);

  // Shiprocket cancel API takes the Shiprocket order ID (not shipment ID)
  const response = await cancelShipment(order.shiprocketOrderId);

  order.orderStatus  = "cancelled";
  order.cancelledAt  = new Date();
  order.shippingStatus = "Cancelled";
  order.trackingStatus = "Cancelled";

  order.statusHistory.push({
    status: "cancelled",
    note:   "Shipment cancelled through Shiprocket",
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: "Shipment cancelled successfully.",
    data: response,
  });
});

/* ==========================================================
   SHIPROCKET WEBHOOK (public — no auth)
========================================================== */

export const shiprocketWebhook = asyncHandler(async (req, res) => {
  const payload = req.body;

  // Shiprocket sends AWB in different fields depending on webhook type
  const awb =
    payload?.awb ||
    payload?.awb_code ||
    payload?.AWB ||
    payload?.shipment?.awb;

  if (!awb) {
    // Acknowledge but do nothing
    return res.status(200).json({ success: true, message: "No AWB in payload." });
  }

  const order = await Order.findOne({ awbCode: awb });

  if (!order) {
    // Order not found — acknowledge to avoid Shiprocket retries
    return res.status(200).json({ success: true, message: "Order not found for AWB." });
  }

  const currentStatus =
    payload?.current_status ||
    payload?.status ||
    payload?.shipment_status ||
    "";

  if (currentStatus) {
    order.trackingStatus    = currentStatus;
    order.shippingStatus    = currentStatus;
    order.lastTrackingUpdate = new Date();

    const mappedStatus = mapShiprocketStatusToOrderStatus(currentStatus);
    if (mappedStatus) order.orderStatus = mappedStatus;

    if (currentStatus.toLowerCase().includes("rto")) {
      order.rtoStatus = currentStatus;
    }

    if (
      currentStatus.toLowerCase().includes("delivered") &&
      !order.deliveredAt
    ) {
      order.deliveredAt  = new Date();
      order.deliveryDate = new Date();
      order.orderStatus  = "delivered";
    }

    order.statusHistory.push({
      status: order.orderStatus,
      note:   `Shiprocket webhook: ${currentStatus}`,
    });

    // Append to timeline
    order.trackingTimeline.push({
      status:   currentStatus,
      activity: currentStatus,
      date:     new Date(),
      location: payload?.location || "",
    });

    await order.save();
  }

  res.status(200).json({ success: true, message: "Webhook processed." });
});