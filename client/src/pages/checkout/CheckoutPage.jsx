import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiTag, FiShoppingBag, FiPlus, FiCheck, FiPercent, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

import { userApi } from '../../api/userApi';
import { cartApi } from '../../api/cartApi';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import axiosInstance from '../../api/axios';
import { setCart, selectCartItems } from '../../features/cartSlice';
import { selectUser } from '../../features/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import usePincodeLookup from '../../hooks/usePincodeLookup';
import { FREE_DELIVERY_THRESHOLD, DEFAULT_SHIPPING_CHARGE } from '../../utils/constants';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};



const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);

  // States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // razorpay | cod
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [autoCoupon, setAutoCoupon] = useState(null);
  const [autoDiscountAmount, setAutoDiscountAmount] = useState(0);

  // Address creation form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    area: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Phone validation state
  const [phoneError, setPhoneError] = useState('');

  // Pincode auto-fill hook
  const pincode = usePincodeLookup();

  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isAutoCouponDismissed, setIsAutoCouponDismissed] = useState(false);

  const fetchData = async () => {
    try {
      const [addrRes, cartRes] = await Promise.all([
        userApi.getAddresses(),
        cartApi.getCart()
      ]);
      setAddresses(addrRes.data?.addresses || []);
      
      const defaultAddr = addrRes.data?.addresses?.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      else if (addrRes.data?.addresses?.length > 0) setSelectedAddressId(addrRes.data.addresses[0]._id);

      dispatch(setCart(cartRes.data.cart));
      if (!cartRes.data.cart?.items || cartRes.data.cart.items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
      } else {
        // Compute subtotal to find best auto coupon
        const currentItems = cartRes.data.cart.items;
        const currentSubtotal = currentItems.reduce((sum, item) => {
          const price = item.product?.salePrice > 0 && item.product?.salePrice < item.product?.price
            ? item.product.salePrice : item.product?.price || 0;
          return sum + price * item.quantity;
        }, 0);
        
        try {
          const bestCouponRes = await axiosInstance.get(`/coupons/best?orderTotal=${currentSubtotal}`);
          if (bestCouponRes.data?.data?.coupon) {
            setAutoCoupon(bestCouponRes.data.data.coupon);
            setAutoDiscountAmount(bestCouponRes.data.data.discount);
          }
        } catch (e) {
          console.error("Failed to fetch best coupon", e);
        }
      }
    } catch {
      toast.error('Failed to load checkout details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Automatically clear coupons if user selects COD payment method
  useEffect(() => {
    if (paymentMethod === 'cod') {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponCode('');
    }
  }, [paymentMethod]);

  // --- PIN Code → City/State Auto-Detection ---
  // Sync hook's auto-filled data back into the address form
  useEffect(() => {
    if (pincode.autoFilled && pincode.locationData) {
      setNewAddress(prev => ({
        ...prev,
        city: pincode.locationData.city,
        state: pincode.locationData.state,
        country: pincode.locationData.country || 'India',
        area: pincode.postOffices.length === 1 ? pincode.selectedArea : prev.area,
      }));
    }
  }, [pincode.autoFilled, pincode.locationData, pincode.selectedArea]);

  // Sync area dropdown selection
  const handleAreaChange = (e) => {
    const area = e.target.value;
    pincode.setSelectedArea(area);
    setNewAddress(prev => ({ ...prev, area }));
  };

  const handleZipCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setNewAddress(prev => ({ ...prev, zipCode: value }));
    
    // Reset auto-fill if PIN is shortened
    if (pincode.autoFilled && value.length < 6) {
      pincode.reset();
      setNewAddress(prev => ({ ...prev, zipCode: value, city: '', state: '', area: '' }));
    }
    
    // Trigger lookup when 6 digits entered
    if (value.length === 6) {
      pincode.lookupPincode(value);
    }
  };

  // --- Phone Validation ---
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setNewAddress({ ...newAddress, phone: value });
    
    if (value.length > 0) {
      if (value.length < 10) {
        setPhoneError('Mobile number must be exactly 10 digits');
      } else if (!/^[6-9]/.test(value)) {
        setPhoneError('Mobile number must start with 6, 7, 8, or 9');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  const handleOpenEditAddress = (addr, e) => {
    e.stopPropagation();
    setEditingAddressId(addr._id);
    setNewAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      area: addr.area || '',
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country || 'India'
    });
    setPhoneError('');
    pincode.reset();
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await userApi.deleteAddress(id);
      setAddresses(res.data.addresses || []);
      toast.success('Address deleted successfully');
      
      if (selectedAddressId === id) {
        const remaining = res.data.addresses || [];
        const nextDefault = remaining.find(a => a.isDefault);
        if (nextDefault) setSelectedAddressId(nextDefault._id);
        else if (remaining.length > 0) setSelectedAddressId(remaining[0]._id);
        else setSelectedAddressId('');
      }
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Please fill all address fields');
      return;
    }

    // Validate phone
    if (newAddress.phone.length !== 10) {
      setPhoneError('Mobile number must be exactly 10 digits');
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }
    if (!/^[6-9]/.test(newAddress.phone)) {
      setPhoneError('Mobile number must start with 6, 7, 8, or 9');
      toast.error('Mobile number must start with 6, 7, 8, or 9');
      return;
    }

    try {
      let res;
      if (editingAddressId) {
        res = await userApi.updateAddress(editingAddressId, newAddress);
        toast.success('Address updated successfully');
      } else {
        res = await userApi.addAddress(newAddress);
        toast.success('Address added successfully');
      }
      setAddresses(res.data.addresses || []);
      
      if (!editingAddressId) {
        const added = res.data.addresses[res.data.addresses.length - 1];
        if (added) setSelectedAddressId(added._id);
      } else {
        const editedExists = res.data.addresses.some(a => a._id === selectedAddressId);
        if (!editedExists && res.data.addresses.length > 0) {
          setSelectedAddressId(res.data.addresses[0]._id);
        }
      }
      
      setShowAddressForm(false);
      setEditingAddressId(null);
      setNewAddress({
        fullName: '',
        phone: '',
        street: '',
        area: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      });
      setPhoneError('');
      pincode.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    
    setValidatingCoupon(true);
    try {
      const response = await axiosInstance.post('/coupons/validate', {
        code: couponCode,
        orderTotal: subtotal
      });
      
      setAppliedCoupon(response.data.data.coupon);
      setCouponDiscount(response.data.data.discount);
      toast.success('Coupon applied successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setIsAutoCouponDismissed(false);
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.salePrice > 0 && item.product?.salePrice < item.product?.price
      ? item.product.salePrice
      : item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_SHIPPING_CHARGE;

  // Active coupon/discount computed states
  const isOnline = paymentMethod === 'razorpay';
  const effectiveAutoCoupon = isOnline && !isAutoCouponDismissed ? autoCoupon : null;
  const effectiveAutoDiscount = isOnline && !isAutoCouponDismissed ? autoDiscountAmount : 0;

  const activeCoupon = appliedCoupon || effectiveAutoCoupon;
  const activeDiscount = appliedCoupon ? couponDiscount : effectiveAutoDiscount;
  const isAutoApplied = !appliedCoupon && !!effectiveAutoCoupon;

  const grandTotal = Math.max(subtotal + tax + shipping - activeDiscount, 0);
  const activeTotal = grandTotal;

  // Scenario totals for payment selection display
  const onlineTotal = Math.max(subtotal + tax + shipping - (appliedCoupon ? couponDiscount : effectiveAutoDiscount), 0);
  const codTotal = Math.max(subtotal + tax + shipping - (appliedCoupon ? couponDiscount : 0), 0);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    setProcessingOrder(true);
    let createdOrder = null;

    try {
      // 1. Create order in Backend
      const orderResponse = await orderApi.createOrder({
        shippingAddressId: selectedAddressId,
        paymentMethod,
        couponCode: activeCoupon?.code || ''
      });

      createdOrder = orderResponse.data.order;
      
      // Clear frontend cart since backend cart is cleared
      dispatch(setCart({ items: [] }));

      // 2. Handle payment routing
      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        navigate('/payment-success', { state: { orderId: createdOrder._id } });
      } else {
        // Online Payment - Razorpay
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Razorpay SDK failed to load. Please try again.');
          navigate('/payment-failed');
          return;
        }

        // Create payment session order
        let payOrderRes;
        try {
          payOrderRes = await paymentApi.createOrder(createdOrder._id);
        } catch (payErr) {
          toast.error('Failed to initialize payment gateway.');
          navigate('/payment-failed');
          return;
        }

        const { razorpayOrderId, amount, currency, keyId } = payOrderRes.data;
        const activeAddr = addresses.find(a => a._id === selectedAddressId);

        const options = {
          key: keyId,
          amount,
          currency,
          name: 'Mishkwat Store',
          description: `Payment for Order #${createdOrder.orderNumber}`,
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              setProcessingOrder(true);
              await paymentApi.verifyPayment({
                orderId: createdOrder._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
              
              toast.success('Payment completed successfully!');
              queryClient.invalidateQueries({ queryKey: ['my-orders'] });
              navigate('/payment-success', { state: { orderId: createdOrder._id } });
            } catch (err) {
              toast.error(err.response?.data?.message || 'Payment verification failed');
              navigate('/payment-failed');
            } finally {
              setProcessingOrder(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: activeAddr?.phone || ''
          },
          theme: {
            color: '#6C5CE7'
          },
          modal: {
            ondismiss: () => {
              toast.error('Payment cancelled by user.');
              navigate('/payment-failed');
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      if (createdOrder) {
         navigate('/payment-failed');
      }
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-background text-text min-h-screen py-8 text-left">
      <div className="container-custom">
        <h1 className="text-3xl font-display font-extrabold text-text mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Steps Form */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Shipping Address Selection */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-lg font-display font-extrabold text-text flex items-center gap-2">
                  <FiMapPin className="text-primary" /> Shipping Address
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => {
                      setEditingAddressId(null);
                      setNewAddress({
                        fullName: '',
                        phone: '',
                        street: '',
                        area: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: 'India'
                      });
                      setPhoneError('');
                      pincode.reset();
                      setShowAddressForm(true);
                    }}
                    className="text-xs text-secondary hover:underline flex items-center gap-1 font-bold"
                  >
                    <FiPlus /> Add New
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <div className="space-y-4 w-full">
                  <h3 className="text-sm font-bold text-text-muted">{editingAddressId ? 'Edit Shipping Address' : 'Add New Shipping Address'}</h3>
                  <form onSubmit={handleSaveAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                  <div>
                    <Input
                      label="Phone Number"
                      value={newAddress.phone}
                      onChange={handlePhoneChange}
                      placeholder="10 digit number (e.g. 9876543210)"
                      required
                      maxLength={10}
                      error={phoneError}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label="Street Address"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      placeholder="Flat, House no., Apartment, Street"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="PIN Code"
                      value={newAddress.zipCode}
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
                          onClick={() => { pincode.reset(); setNewAddress(prev => ({ ...prev, city: '', state: '', area: '' })); }}
                          className="text-text-muted hover:text-text underline ml-1"
                        >Clear</button>
                      </p>
                    )}
                  </div>

                  {/* Area dropdown — appears when multiple post offices match the pincode */}
                  {pincode.autoFilled && pincode.postOffices.length > 1 && (
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
                  )}

                  {/* If single post office, show auto-selected area as read-only */}
                  {pincode.autoFilled && pincode.postOffices.length === 1 && (
                    <Input
                      label="Area / Locality"
                      value={pincode.selectedArea}
                      readOnly
                      className="bg-green-500/5 border-green-500/20"
                    />
                  )}

                  <Input
                    label="City"
                    value={newAddress.city}
                    onChange={(e) => {
                      if (!pincode.autoFilled) setNewAddress({ ...newAddress, city: e.target.value });
                    }}
                    placeholder={pincode.autoFilled ? '' : 'Mumbai'}
                    required
                    readOnly={pincode.autoFilled}
                    className={pincode.autoFilled ? 'bg-green-500/5 border-green-500/20' : ''}
                  />
                  <Input
                    label="State"
                    value={newAddress.state}
                    onChange={(e) => {
                      if (!pincode.autoFilled) setNewAddress({ ...newAddress, state: e.target.value });
                    }}
                    placeholder={pincode.autoFilled ? '' : 'Maharashtra'}
                    required
                    readOnly={pincode.autoFilled}
                    className={pincode.autoFilled ? 'bg-green-500/5 border-green-500/20' : ''}
                  />
                  <Input
                    label="Country"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    placeholder="India"
                    required
                  />
                  <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => { setShowAddressForm(false); setEditingAddressId(null); setPhoneError(''); pincode.reset(); }}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </Button>
                  </div>
                </form>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-6 text-text-muted text-sm">
                  No addresses saved. Click "Add New" to add shipping destination.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative pr-20 ${
                        selectedAddressId === addr._id
                          ? 'border-primary bg-primary/5'
                          : 'border-white/5 bg-surface/20 hover:border-white/10'
                      }`}
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditAddress(addr, e)}
                          className="text-text-muted hover:text-secondary p-1 rounded-lg hover:bg-white/5 transition-colors"
                          title="Edit Address"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAddress(addr._id, e)}
                          className="text-text-muted hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
                          title="Delete Address"
                        >
                          <FiTrash2 size={13} />
                        </button>
                        {selectedAddressId === addr._id && (
                          <span className="text-primary-light ml-0.5">
                            <FiCheck size={16} />
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-text text-sm pr-12 truncate">{addr.fullName}</p>
                      <p className="text-xs text-text-muted mt-1">{addr.street}{addr.area ? `, ${addr.area}` : ''}</p>
                      <p className="text-xs text-text-muted">{addr.city}, {addr.state} - {addr.zipCode}</p>
                      <p className="text-xs text-text-muted font-semibold mt-2">📞 {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Payment Method Selection */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
              <h2 className="text-lg font-display font-extrabold text-text flex items-center gap-2 border-b border-white/5 pb-3">
                <FiCreditCard className="text-primary" /> Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Online Payment Option */}
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4.5 rounded-xl border-2 cursor-pointer transition-all ${ 
                    paymentMethod === 'razorpay'
                      ? 'border-primary bg-primary/5'
                      : 'border-white/5 bg-surface/20 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'razorpay' ? 'border-primary' : 'border-slate-500'
                    }`}>
                      {paymentMethod === 'razorpay' && <div className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-text text-sm">Online Payment</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Cards, Netbanking, UPI, Wallets</p>
                    </div>
                  </div>
                  {/* Payable amount for online payment */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs font-semibold text-text font-[Outfit]">
                      Pay {formatPrice(onlineTotal)}
                      {effectiveAutoDiscount > 0 && (
                        <span className="text-green-400 ml-1">(After Discount)</span>
                      )}
                    </p>
                    {effectiveAutoDiscount > 0 && (
                      <p className="text-[10px] text-green-400/70 mt-0.5">
                        You save {formatPrice(effectiveAutoDiscount)} with {effectiveAutoCoupon?.code}!
                      </p>
                    )}
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4.5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-primary/5'
                      : 'border-white/5 bg-surface/20 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'cod' ? 'border-primary' : 'border-slate-500'
                    }`}>
                      {paymentMethod === 'cod' && <div className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-text text-sm">Cash On Delivery (COD)</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Pay in cash when package arrives</p>
                    </div>
                  </div>
                  {/* Payable amount for COD */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs font-semibold text-text font-[Outfit]">
                      Pay {formatPrice(codTotal)}
                      {effectiveAutoDiscount > 0 && (
                        <span className="text-text-muted ml-1">(No Discount)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Totals Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Promo Code Coupon Widget */}
            {paymentMethod === 'cod' ? (
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-2 opacity-60">
                <h3 className="text-sm font-display font-bold text-text-muted flex items-center gap-2">
                  <FiTag /> Have a promo code?
                </h3>
                <p className="text-xs text-amber-400">Promo codes are only applicable for Online Payments.</p>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                <h3 className="text-sm font-display font-bold text-text-muted flex items-center gap-2">
                  <FiTag /> Have a promo code?
                </h3>
                {activeCoupon ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-left animate-fade-in">
                    <div>
                      <span className="text-xs text-green-400 font-bold tracking-widest">{activeCoupon.code}</span>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Applied discount: {formatPrice(activeDiscount)} {isAutoApplied ? '(Auto-applied)' : ''}
                      </p>
                    </div>
                    <button
                      onClick={isAutoApplied ? (() => { setIsAutoCouponDismissed(true); toast.success('Auto-applied coupon removed'); }) : handleRemoveCoupon}
                      className="text-red-400 hover:text-red-300 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="WELCOME10"
                      className="flex-1 bg-surface/50 border border-slate-700 rounded-xl text-text placeholder-slate-500 px-3.5 py-2 text-xs focus:border-primary outline-none"
                    />
                    <Button type="submit" variant="secondary" size="sm" isLoading={validatingCoupon}>
                      Apply
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Totals Summary */}
            <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-6">
              <h3 className="text-lg font-display font-extrabold text-text">Order Details</h3>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Items Subtotal</span>
                  <span className="font-semibold text-text font-[Outfit]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">GST (18%)</span>
                  <span className="font-semibold text-text font-[Outfit]">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Shipping Fees</span>
                  <span className={`font-semibold font-[Outfit] ${shipping === 0 ? 'text-green-400' : 'text-text'}`}>
                    {shipping === 0 ? 'FREE (Free Delivery Applied)' : formatPrice(shipping)}
                  </span>
                </div>
                {activeDiscount > 0 && (
                  <div className="flex justify-between text-green-400 animate-fade-in">
                    <span className="flex items-center gap-1">
                      {isAutoApplied && <FiPercent size={12} />}
                      Promo Discount {activeCoupon ? `(${activeCoupon.code})` : ''}
                    </span>
                    <span className="font-bold font-[Outfit]">-{formatPrice(activeDiscount)}</span>
                  </div>
                )}

                <hr className="border-white/5 my-2" />

                <div className="flex justify-between text-base">
                  <span className="font-bold text-text">
                    {paymentMethod === 'razorpay' ? 'Payable Amount' : 'Grand Total'}
                  </span>
                  <span className="font-extrabold text-text font-[Outfit]">{formatPrice(activeTotal)}</span>
                </div>

                {isOnline && effectiveAutoDiscount > 0 && (
                  <p className="text-[10px] text-green-400/70 text-right">
                    You save {formatPrice(effectiveAutoDiscount)} with Online Payment!
                  </p>
                )}
              </div>

              <Button
                onClick={handlePlaceOrder}
                variant="primary"
                fullWidth
                isLoading={processingOrder}
                className="py-3.5 text-sm flex items-center justify-center gap-2"
              >
                {paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Online'} — {formatPrice(activeTotal)}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
