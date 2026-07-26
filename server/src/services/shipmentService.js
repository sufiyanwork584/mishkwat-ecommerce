import {
  createShiprocketOrder,
  checkServiceability,
  generateAWB,
  generatePickup,
} from "./shiprocket.js";
import { AppError } from "../middleware/errorMiddleware.js";

/**
 * Unified, idempotent helper to process Shiprocket shipment for an order.
 * Can be called during payment verification, webhooks, or manual admin triggers.
 * 
 * @param {Object} order - Mongoose order document (populated with items.product and user)
 * @param {boolean} throwOnError - Whether to throw errors (e.g. for manual admin actions) or suppress/log them (e.g. for payment capture)
 */
export const processOrderShipment = async (order, throwOnError = false) => {
  if (order.shipmentCreated || order.shipmentId || order.awbCode) {
    console.log(`🚚 [Shipment Service] Shipment already created for Order #${order.orderNumber}. Skipping.`);
    return order;
  }

  try {
    /* ===========================================
       Build Shiprocket Order Items
    =========================================== */
    const orderItems = order.items.map((item) => ({
      name: item.title,
      sku: item.product?.sku || item.product?._id?.toString() || item.title,
      units: item.quantity,
      selling_price: item.price,
    }));

    /* ===========================================
       Calculate Package Weight & Dimensions
    =========================================== */
    let totalWeight = 0;
    for (const item of order.items) {
      const weight = item.product?.weight > 0 ? item.product.weight : 0.5;
      totalWeight += weight * item.quantity;
    }
    if (totalWeight <= 0) {
      totalWeight = 0.5;
    }

    let length = 20;
    let breadth = 20;
    let height = 10;
    if (order.items.length && order.items[0].product?.dimensions) {
      const dim = order.items[0].product.dimensions;
      length = dim.length || 20;
      breadth = dim.width || 20;
      height = dim.height || 10;
    }

    /* ===========================================
       Shipment Payload
    =========================================== */
    const shipmentPayload = {
      order_id: order.orderNumber,
      order_date: new Date().toISOString().split("T")[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
      billing_customer_name: order.shippingAddress.fullName,
      billing_last_name: "",
      billing_address: order.shippingAddress.street,
      billing_city: order.shippingAddress.city,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country,
      billing_pincode: order.shippingAddress.zipCode,
      billing_phone: order.shippingAddress.phone,
      billing_email: order.user?.email || "customer@nexabuy.com",
      shipping_is_billing: true,
      payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
      sub_total: order.totalAmount,
      order_items: orderItems,
      length,
      breadth,
      height,
      weight: totalWeight,
    };

    /* ===========================================
       Create Shiprocket Order
    =========================================== */
    const shipment = await createShiprocketOrder(shipmentPayload);
    console.log("🚚 [Shipment Service] Shiprocket Order Created:", shipment);

    let shipmentId = shipment?.shipment_id || shipment?.shipment_details?.shipment_id || "";
    let shiprocketOrderId = shipment?.order_id || shipment?.shipment_details?.order_id || "";

    if (shipmentId) shipmentId = shipmentId.toString();
    if (shiprocketOrderId) shiprocketOrderId = shiprocketOrderId.toString();

    order.shiprocketOrderId = shiprocketOrderId;
    order.shipmentId = shipmentId;
    order.shipmentCreated = true;

    /* ===========================================
       Find Courier Serviceability
    =========================================== */
    let courierCompanyId = null;
    try {
      const courierResponse = await checkServiceability({
        pickupPostcode: process.env.SHIPROCKET_PICKUP_PINCODE || "400001",
        deliveryPostcode: order.shippingAddress.zipCode,
        weight: totalWeight,
        cod: order.paymentMethod === "cod" ? 1 : 0,
      });

      if (courierResponse?.data?.available_courier_companies?.length) {
        const topCourier = courierResponse.data.available_courier_companies[0];
        courierCompanyId = topCourier.courier_company_id;
        order.courierName = topCourier.courier_name;
        order.estimatedDelivery = topCourier.etd ? new Date(topCourier.etd) : null;
      }
    } catch (err) {
      console.log("🚚 [Shipment Service] Courier auto-selection skipped.");
    }

    /* ===========================================
       Generate AWB (Air Waybill) & Pickup
    =========================================== */
    if (shipmentId) {
      try {
        const awb = await generateAWB(shipmentId, courierCompanyId);
        const awbData = awb?.response?.data || awb?.response || awb?.data || awb;

        order.awbCode = awbData?.awb_code || "";
        order.courierCompanyId = awbData?.courier_company_id || courierCompanyId;
        order.shippingLabelUrl = awbData?.label_url || "";
        order.labelUrl = awbData?.label_url || "";

        if (order.awbCode) {
          order.trackingUrl = `https://shiprocket.co/tracking/${order.awbCode}`;
        }

        console.log("🚚 [Shipment Service] AWB Generated:", order.awbCode);
      } catch (awbError) {
        console.error("🚚 [Shipment Service] AWB Generation failed:", awbError.message);
      }

      try {
        await generatePickup(shipmentId);
        console.log("🚚 [Shipment Service] Pickup request generated successfully");
      } catch (pickupError) {
        console.log("🚚 [Shipment Service] Pickup generation skipped.");
      }
    }

    await order.save();
    return order;
  } catch (error) {
    console.error("❌ [Shipment Service] Error creating Shiprocket shipment:", error.response?.data || error.message);
    if (throwOnError) {
      throw new AppError(
        `Shiprocket error: ${error.response?.data?.message || error.message}`,
        error.response?.status || 500
      );
    }
  }
};
