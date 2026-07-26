// ------------------------------------------------------------------
// Pincode Lookup Controller
// Proxies India Post API with an in-memory LRU cache so pincode
// lookups are fast, reliable, and don't hit CORS issues on the client.
// ------------------------------------------------------------------

/** Simple in-memory LRU cache */
class PincodeCache {
  constructor(maxSize = 5000, ttlMs = 24 * 60 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.cache = new Map();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    // Move to end (most-recently-used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key, data) {
    if (this.cache.has(key)) this.cache.delete(key);
    if (this.cache.size >= this.maxSize) {
      // Evict oldest entry
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    this.cache.set(key, { data, ts: Date.now() });
  }
}

const pincodeCache = new PincodeCache();

/**
 * GET /api/v1/pincode/:code
 * Public endpoint — no auth required.
 * Returns all post offices for the given 6-digit Indian pincode.
 */
export const lookupPincode = async (req, res) => {
  try {
    const { code } = req.params;

    // Validate: must be exactly 6 digits
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must be exactly 6 digits',
      });
    }

    // Check cache first
    const cached = pincodeCache.get(code);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        pincode: code,
        ...cached,
      });
    }

    // Fetch from India Post API
    const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
    const data = await response.json();

    if (!data?.[0] || data[0].Status !== 'Success' || !data[0].PostOffice?.length) {
      return res.status(404).json({
        success: false,
        message: 'Invalid pincode or no results found. Please check and try again.',
      });
    }

    const rawPostOffices = data[0].PostOffice;

    // Map to a cleaner, structured format
    const postOffices = rawPostOffices.map((po) => ({
      name: po.Name,               // e.g. "Bandra West"
      branchType: po.BranchType,    // e.g. "Sub Post Office"
      deliveryStatus: po.DeliveryStatus, // e.g. "Delivery"
      circle: po.Circle,           // e.g. "Mumbai"
      district: po.District,       // e.g. "Mumbai"
      division: po.Division,       // e.g. "Mumbai"
      region: po.Region,           // e.g. "Mumbai"
      block: po.Block,             // e.g. "Mumbai"
      state: po.State,             // e.g. "Maharashtra"
      country: po.Country,         // e.g. "India"
    }));

    // Extract common fields from the first PO (all POs share district/state/country)
    const first = postOffices[0];

    const result = {
      count: postOffices.length,
      city: first.district,
      state: first.state,
      region: first.region,
      country: first.country,
      postOffices,
    };

    // Cache the result
    pincodeCache.set(code, result);

    return res.status(200).json({
      success: true,
      source: 'api',
      pincode: code,
      ...result,
    });
  } catch (error) {
    console.error('Pincode lookup error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to look up pincode. Please try again later.',
    });
  }
};
