import axios from "axios";
import { SHIPROCKET_BASE_URL } from "../config/shiprocket.js";

let token = "";
let tokenExpiry = 0;

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export const loginShiprocket = async () => {
  try {
    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/auth/login`,
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    token = response.data.token;
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days

    console.log("✅ Shiprocket Logged In");
    return token;
  } catch (error) {
    console.error(
      "Shiprocket Login Error",
      error.response?.data || error.message
    );
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| GET TOKEN (auto-refresh)
|--------------------------------------------------------------------------
*/

export const getShiprocketToken = async () => {
  if (!token || Date.now() >= tokenExpiry) {
    await loginShiprocket();
  }
  return token;
};

/*
|--------------------------------------------------------------------------
| INTERNAL: Axios request with auto-retry on 401
|--------------------------------------------------------------------------
*/

const shiprocketRequest = async (config, retry = true) => {
  const currentToken = await getShiprocketToken();

  try {
    const response = await axios({
      ...config,
      headers: {
        ...(config.headers || {}),
        Authorization: `Bearer ${currentToken}`,
      },
    });
    return response.data;
  } catch (error) {
    const status = error.response?.status;

    // Token expired — force re-login once and retry
    if (status === 401 && retry) {
      token = "";
      tokenExpiry = 0;
      return shiprocketRequest(config, false);
    }

    console.error(
      `Shiprocket API Error [${config.method?.toUpperCase()} ${config.url}]`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

export const createShiprocketOrder = async (shipmentData) => {
  return shiprocketRequest({
    method: "post",
    url: `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
    data: shipmentData,
  });
};

/*
|--------------------------------------------------------------------------
| ASSIGN AWB
|--------------------------------------------------------------------------
*/

export const generateAWB = async (shipmentId, courierId = null) => {
  const payload = { shipment_id: shipmentId };
  if (courierId) payload.courier_id = courierId;

  return shiprocketRequest({
    method: "post",
    url: `${SHIPROCKET_BASE_URL}/courier/assign/awb`,
    data: payload,
  });
};

/*
|--------------------------------------------------------------------------
| CHECK SERVICEABILITY
|--------------------------------------------------------------------------
*/

export const checkServiceability = async ({
  pickupPostcode,
  deliveryPostcode,
  weight,
  cod = 0,
}) => {
  return shiprocketRequest({
    method: "get",
    url: `${SHIPROCKET_BASE_URL}/courier/serviceability`,
    params: {
      pickup_postcode: pickupPostcode,
      delivery_postcode: deliveryPostcode,
      cod,
      weight,
    },
  });
};

/*
|--------------------------------------------------------------------------
| GENERATE PICKUP
|--------------------------------------------------------------------------
*/

export const generatePickup = async (shipmentId) => {
  return shiprocketRequest({
    method: "post",
    url: `${SHIPROCKET_BASE_URL}/courier/generate/pickup`,
    data: { shipment_id: [shipmentId] },
  });
};

/*
|--------------------------------------------------------------------------
| TRACK SHIPMENT
|--------------------------------------------------------------------------
*/

export const trackShipment = async (awb) => {
  return shiprocketRequest({
    method: "get",
    url: `${SHIPROCKET_BASE_URL}/courier/track/awb/${awb}`,
  });
};

/*
|--------------------------------------------------------------------------
| CANCEL ORDER
|--------------------------------------------------------------------------
*/

export const cancelShipment = async (shiprocketOrderId) => {
  return shiprocketRequest({
    method: "post",
    url: `${SHIPROCKET_BASE_URL}/orders/cancel`,
    data: { ids: [shiprocketOrderId] },
  });
};

/*
|--------------------------------------------------------------------------
| DOWNLOAD SHIPPING LABEL
|--------------------------------------------------------------------------
*/

export const downloadLabel = async (shipmentId) => {
  return shiprocketRequest({
    method: "post",
    url: `${SHIPROCKET_BASE_URL}/courier/generate/label`,
    data: { shipment_id: [shipmentId] },
  });
};

/*
|--------------------------------------------------------------------------
| DOWNLOAD INVOICE
|--------------------------------------------------------------------------
*/

export const downloadInvoice = async (shiprocketOrderId) => {
  return shiprocketRequest({
    method: "post",
    url: `${SHIPROCKET_BASE_URL}/orders/print/invoice`,
    data: { ids: [shiprocketOrderId] },
  });
};

/*
|--------------------------------------------------------------------------
| GENERATE MANIFEST
|--------------------------------------------------------------------------
*/

export const generateManifest = async (shipmentId) => {
  return shiprocketRequest({
    method: "post",
    url: `${SHIPROCKET_BASE_URL}/manifests/generate`,
    data: { shipment_id: [shipmentId] },
  });
};

/*
|--------------------------------------------------------------------------
| GET SHIPMENT DETAILS
|--------------------------------------------------------------------------
*/

export const getShipmentDetails = async (shipmentId) => {
  return shiprocketRequest({
    method: "get",
    url: `${SHIPROCKET_BASE_URL}/shipments/${shipmentId}`,
  });
};

/*
|--------------------------------------------------------------------------
| GET PICKUP LOCATIONS
|--------------------------------------------------------------------------
*/

export const getPickupLocations = async () => {
  return shiprocketRequest({
    method: "get",
    url: `${SHIPROCKET_BASE_URL}/settings/company/pickup`,
  });
};