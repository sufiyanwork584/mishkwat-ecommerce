import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiTrash2, FiEdit2, FiCheck, FiPlus, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { userApi } from '../../api/userApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import usePincodeLookup from '../../hooks/usePincodeLookup';

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Address form state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null for create, ID for edit
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });

  const [submitting, setSubmitting] = useState(false);

  // Pincode auto-fill hook
  const pincode = usePincodeLookup();

  // Sync hook's auto-filled data into form
  useEffect(() => {
    if (pincode.autoFilled && pincode.locationData) {
      setFormData(prev => ({
        ...prev,
        city: pincode.locationData.city,
        state: pincode.locationData.state,
        country: pincode.locationData.country || 'India',
        area: pincode.postOffices.length === 1 ? pincode.selectedArea : prev.area || '',
      }));
    }
  }, [pincode.autoFilled, pincode.locationData, pincode.selectedArea]);

  const handleZipCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, zipCode: value }));

    if (pincode.autoFilled && value.length < 6) {
      pincode.reset();
      setFormData(prev => ({ ...prev, zipCode: value, city: '', state: '', area: '' }));
    }

    if (value.length === 6) {
      pincode.lookupPincode(value);
    }
  };

  const handleAreaChange = (e) => {
    const area = e.target.value;
    pincode.setSelectedArea(area);
    setFormData(prev => ({ ...prev, area }));
  };

  const fetchAddresses = async () => {
    try {
      const res = await userApi.getAddresses();
      setAddresses(res.data.addresses || []);
    } catch {
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      fullName: '',
      phone: '',
      street: '',
      area: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false
    });
    pincode.reset();
    setIsOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr._id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      area: addr.area || '',
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      isDefault: addr.isDefault
    });
    pincode.reset();
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        // Edit address
        const res = await userApi.updateAddress(editingId, formData);
        setAddresses(res.data.addresses);
        toast.success('Address updated successfully');
      } else {
        // Add address
        const res = await userApi.addAddress(formData);
        setAddresses(res.data.addresses);
        toast.success('Address added successfully');
      }
      setIsOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await userApi.deleteAddress(id);
      setAddresses(res.data.addresses);
      toast.success('Address deleted successfully');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const target = addresses.find((a) => a._id === id);
      if (!target) return;
      const res = await userApi.updateAddress(id, { ...target, isDefault: true });
      setAddresses(res.data.addresses);
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to update default address');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-background text-text py-6 text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors mb-2">
            <FiChevronLeft /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-text">My Addresses</h1>
          <p className="text-xs text-text-muted mt-1">Manage billing and delivery address destinations.</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5 py-2 self-start sm:self-auto"
        >
          <FiPlus /> Add New Address
        </Button>
      </div>

      {/* Grid of address cards */}
      {addresses.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 border border-white/5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-text-muted mx-auto text-2xl mb-4">
            <FiMapPin />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">No Saved Addresses</h2>
          <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
            Add a shipping destination address to make checkout faster during your next order.
          </p>
          <Button onClick={handleOpenAdd} variant="primary">
            Add First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`glass-card rounded-2xl p-5 border flex flex-col justify-between h-48 relative transition-all ${
                addr.isDefault ? 'border-primary bg-primary/5' : 'border-white/5'
              }`}
            >
              {addr.isDefault && (
                <span className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider text-primary-light bg-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FiCheck /> Default
                </span>
              )}
              <div className="space-y-1.5 pr-20 text-left">
                <p className="font-bold text-text text-base truncate">{addr.fullName}</p>
                <p className="text-xs text-text-muted line-clamp-2 mt-1">{addr.street}{addr.area ? `, ${addr.area}` : ''}</p>
                <p className="text-xs text-text-muted truncate">{addr.city}, {addr.state} - {addr.zipCode}</p>
                <p className="text-xs text-text-muted font-semibold mt-2.5">📞 {addr.phone}</p>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3.5 mt-4 text-xs">
                <div>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-secondary hover:underline font-semibold"
                    >
                      Make Default
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="text-text-muted hover:text-text flex items-center gap-1 font-semibold"
                  >
                    <FiEdit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="text-text-muted hover:text-red-400 flex items-center gap-1 font-semibold"
                  >
                    <FiTrash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingId ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="John Doe"
            required
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              setFormData({ ...formData, phone: value });
            }}
            placeholder="10 digit number"
            required
            maxLength={10}
          />
          <div className="sm:col-span-2">
            <Input
              label="Street Address"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="Flat, House no., Street, Area"
              required
            />
          </div>
          <div>
            <Input
              label="PIN Code"
              value={formData.zipCode}
              onChange={handleZipCodeChange}
              placeholder="400001"
              required
              maxLength={6}
            />
            {pincode.loading && (
              <p className="text-xs text-primary mt-1 animate-pulse">🔍 Looking up pincode...</p>
            )}
            {pincode.error && (
              <p className="text-xs text-red-400 mt-1">⚠ {pincode.error}</p>
            )}
            {pincode.autoFilled && !pincode.loading && (
              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                ✓ Location auto-detected
                <button
                  type="button"
                  onClick={() => { pincode.reset(); setFormData(prev => ({ ...prev, city: '', state: '', area: '' })); }}
                  className="text-text-muted hover:text-text underline ml-1"
                >Clear</button>
              </p>
            )}
          </div>

          {/* Area dropdown when multiple post offices match */}
          {pincode.autoFilled && pincode.postOffices.length > 1 ? (
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Area / Locality</label>
              <select
                value={pincode.selectedArea}
                onChange={handleAreaChange}
                className="w-full bg-surface/50 border border-slate-700 rounded-lg text-text pl-4 pr-4 py-2.5 input-focus"
                required
              >
                <option value="">Select your area...</option>
                {pincode.postOffices.map((po) => (
                  <option key={po.name} value={po.name}>{po.name}</option>
                ))}
              </select>
            </div>
          ) : pincode.autoFilled && pincode.postOffices.length === 1 ? (
            <Input
              label="Area / Locality"
              value={pincode.selectedArea}
              readOnly
              className="bg-green-500/5 border-green-500/20"
            />
          ) : null}

          <Input
            label="City"
            value={formData.city}
            onChange={(e) => {
              if (!pincode.autoFilled) setFormData({ ...formData, city: e.target.value });
            }}
            placeholder={pincode.autoFilled ? '' : 'Mumbai'}
            required
            readOnly={pincode.autoFilled}
            className={pincode.autoFilled ? 'bg-green-500/5 border-green-500/20' : ''}
          />
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => {
              if (!pincode.autoFilled) setFormData({ ...formData, state: e.target.value });
            }}
            placeholder={pincode.autoFilled ? '' : 'Maharashtra'}
            required
            readOnly={pincode.autoFilled}
            className={pincode.autoFilled ? 'bg-green-500/5 border-green-500/20' : ''}
          />
          <Input
            label="Country"
            value={formData.country}
            readOnly
            className="bg-green-500/5 border-green-500/20"
          />
          <div className="sm:col-span-2 flex items-center py-1.5">
            <label className="flex items-center text-text-muted cursor-pointer select-none text-xs font-semibold">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 rounded text-primary bg-surface border-slate-700 focus:ring-0 mr-2"
              />
              Set as my default shipping address
            </label>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); pincode.reset(); }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              {editingId ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default AddressesPage;
