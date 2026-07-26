import Order from "../models/Order.js";
import { trackShipment } from "../services/shiprocket.js";

const mapShiprocketStatusToOrderStatus = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("pickup scheduled"))     return "pickupScheduled";
  if (s.includes("picked up"))            return "shipped";
  if (s.includes("in transit"))           return "shipped";
  if (s.includes("reached hub"))          return "shipped";
  if (s.includes("out for delivery"))     return "outForDelivery";
  if (s.includes("delivered"))            return "delivered";
  if (s.includes("cancelled"))            return "cancelled";
  return null;
};

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

export const syncAllActiveShipments = async () => {
  console.log("🚚 [Shiprocket Sync] Starting automatic tracking sync...");

  try {
    // Find orders currently in active delivery stages with an AWB code
    const activeOrders = await Order.find({
      orderStatus: {
        $in: ["processing", "packed", "pickupScheduled", "shipped", "outForDelivery"],
      },
      awbCode: { $ne: "" },
    });

    console.log(`🚚 [Shiprocket Sync] Found ${activeOrders.length} active shipments to track.`);

    for (const order of activeOrders) {
      try {
        console.log(`🚚 [Shiprocket Sync] Tracking Order #${order.orderNumber} (AWB: ${order.awbCode})`);
        
        const tracking = await trackShipment(order.awbCode);
        const trackingData = tracking?.tracking_data || tracking?.data || tracking;
        const shipment = trackingData?.shipment_track?.[0];

        if (shipment?.current_status) {
          order.trackingStatus = shipment.current_status;
          order.shippingStatus = shipment.current_status;
          order.lastTrackingUpdate = new Date();

          const mappedStatus = mapShiprocketStatusToOrderStatus(shipment.current_status);
          if (mappedStatus) {
            order.orderStatus = mappedStatus;
          }

          if (shipment.current_status.toLowerCase().includes("rto")) {
            order.rtoStatus = shipment.current_status;
          }
        }

        if (shipment?.delivered_date && !order.deliveredAt) {
          order.deliveredAt = new Date(shipment.delivered_date);
          order.deliveryDate = new Date(shipment.delivered_date);
          order.orderStatus = "delivered";
        }

        const timeline = parseTrackingTimeline(trackingData);
        if (timeline.length > 0) {
          order.trackingTimeline = timeline;
        }

        await order.save();
        console.log(`🚚 [Shiprocket Sync] Order #${order.orderNumber} successfully updated to status: ${order.trackingStatus}`);
      } catch (orderError) {
        console.error(`❌ [Shiprocket Sync] Error tracking Order #${order.orderNumber}:`, orderError.message);
      }
    }

    console.log("🚚 [Shiprocket Sync] Automatic tracking sync completed.");
  } catch (err) {
    console.error("❌ [Shiprocket Sync] Fatal error during sync job:", err);
  }
};

// Scheduler helper using setInterval
export const startTrackingSyncCron = (intervalMs = 30 * 60 * 1000) => {
  // Run once immediately on startup
  syncAllActiveShipments();
  
  // Set interval
  setInterval(syncAllActiveShipments, intervalMs);
  console.log(`🚚 [Shiprocket Sync] Tracking sync scheduler started (running every ${intervalMs / 1000 / 60} minutes).`);
};
