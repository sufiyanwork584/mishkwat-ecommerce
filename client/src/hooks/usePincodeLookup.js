import { useState, useCallback, useRef } from 'react';
import { userApi } from '../api/userApi';

/**
 * Shared hook for Indian pincode → city/state/area auto-fill.
 * Uses our server-side proxy (with LRU cache) to avoid CORS and speed issues.
 *
 * Returns:
 *  - lookupPincode(code): triggers the lookup
 *  - loading: boolean — true while the API call is in-flight
 *  - postOffices: array of all post offices returned for the pincode
 *  - selectedArea: the currently selected post office name (locality)
 *  - setSelectedArea: setter for user-chosen area
 *  - autoFilled: boolean — true when city/state were auto-filled from pincode
 *  - locationData: { city, state, country, region } — common location fields
 *  - reset: clears all state
 *  - error: error message if lookup failed
 */
const usePincodeLookup = () => {
  const [loading, setLoading] = useState(false);
  const [postOffices, setPostOffices] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState('');

  // Track the latest lookup to prevent stale responses
  const latestLookupRef = useRef(null);

  const lookupPincode = useCallback(async (code) => {
    // Validate: must be exactly 6 digits
    if (!/^\d{6}$/.test(code)) return;

    setLoading(true);
    setError('');
    latestLookupRef.current = code;

    try {
      const data = await userApi.lookupPincode(code);

      // Discard if a newer lookup was triggered while this one was in-flight
      if (latestLookupRef.current !== code) return;

      if (data.success && data.postOffices?.length > 0) {
        setPostOffices(data.postOffices);

        const location = {
          city: data.city,
          state: data.state,
          country: data.country,
          region: data.region || '',
        };
        setLocationData(location);

        // If only 1 post office, auto-select it
        if (data.postOffices.length === 1) {
          setSelectedArea(data.postOffices[0].name);
        } else {
          setSelectedArea(''); // user must pick from dropdown
        }

        setAutoFilled(true);
      } else {
        setError('Invalid pincode or no results found.');
        setAutoFilled(false);
        setPostOffices([]);
        setLocationData(null);
      }
    } catch (err) {
      if (latestLookupRef.current !== code) return;
      setError(err.response?.data?.message || 'Failed to look up pincode.');
      setAutoFilled(false);
      setPostOffices([]);
      setLocationData(null);
    } finally {
      if (latestLookupRef.current === code) {
        setLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setPostOffices([]);
    setSelectedArea('');
    setAutoFilled(false);
    setLocationData(null);
    setError('');
    latestLookupRef.current = null;
  }, []);

  return {
    lookupPincode,
    loading,
    postOffices,
    selectedArea,
    setSelectedArea,
    autoFilled,
    locationData,
    reset,
    error,
  };
};

export default usePincodeLookup;
