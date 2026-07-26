import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  trackOrder,
  refreshShipment,
  downloadShippingLabel,
  downloadInvoice,
  cancelShipmentController,
  createShipmentForOrder,
  generateManifestController,
  getShipmentStatus,
  syncTrackingTimeline,
  shiprocketWebhook,
} from "../controllers/shipmentController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC — Shiprocket Webhook (no auth — Shiprocket POSTs here)
|--------------------------------------------------------------------------
*/
router.post("/webhook", shiprocketWebhook);

/*
|--------------------------------------------------------------------------
| CUSTOMER ROUTES (protect only)
|--------------------------------------------------------------------------
*/

// Track order by order ID (fetches live from Shiprocket)
router.get("/track/:orderId", protect, trackOrder);

// Refresh shipment status and timeline
router.post("/refresh/:orderId", protect, refreshShipment);

// Get stored shipment data from DB (no external API call)
router.get("/status/:orderId", protect, getShipmentStatus);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES (protect + admin role)
|--------------------------------------------------------------------------
*/

// Manually create a Shiprocket shipment for an already-paid order
router.post("/create/:orderId", protect, authorize("admin"), createShipmentForOrder);

// Generate shipping label and store URL
router.get("/label/:orderId", protect, authorize("admin"), downloadShippingLabel);

// Generate Shiprocket invoice and store URL
router.get("/invoice/:orderId", protect, authorize("admin"), downloadInvoice);

// Generate manifest and store URL
router.post("/manifest/:orderId", protect, authorize("admin"), generateManifestController);

// Full sync of tracking timeline from Shiprocket
router.post("/sync/:orderId", protect, authorize("admin"), syncTrackingTimeline);

// Cancel shipment on Shiprocket
router.post("/cancel/:orderId", protect, authorize("admin"), cancelShipmentController);

export default router;