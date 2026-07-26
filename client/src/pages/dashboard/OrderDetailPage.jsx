import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import { selectUser } from '../../features/authSlice';
import { FiFileText, FiChevronLeft, FiAlertCircle, FiPrinter, FiCalendar, FiClock, FiPackage, FiTruck, FiCheckCircle, FiMapPin, FiCopy, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { motion } from 'framer-motion';

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

const statusSteps = [
  { key: 'pending',          label: 'Order Placed',       icon: FiClock,       desc: 'Your order has been received and is being verified.' },
  { key: 'processing',       label: 'Processing',         icon: FiPackage,     desc: 'Your order is being processed.' },
  { key: 'packed',           label: 'Packed',             icon: FiPackage,     desc: 'Your items have been packed and are ready for shipment.' },
  { key: 'shipped',          label: 'Shipped',            icon: FiTruck,       desc: 'Your package is on its way to the delivery hub.' },
  { key: 'outfordelivery',   label: 'Out For Delivery',   icon: FiMapPin,      desc: 'Your package is out for delivery today.' },
  { key: 'delivered',        label: 'Delivered',           icon: FiCheckCircle, desc: 'Your package has been delivered successfully.' },
];

const getStepIndex = (status) => {
  return statusSteps.findIndex(s => s.key === status?.toLowerCase());
};

const getStatusColorClass = (status) => {
  const map = {
    pending: 'status-pending',
    processing: 'status-processing',
    packed: 'status-processing',
    shipped: 'status-shipped',
    outfordelivery: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  };
  return map[status?.toLowerCase()] || '';
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const { data: orderResult, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrder(id)
  });

  const order = orderResult?.data?.order;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [payingOrder, setPayingOrder] = useState(false);
  const user = useSelector(selectUser);

  const handlePayNow = async () => {
    setPayingOrder(true);
    const toastId = toast.loading('Initializing payment...');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load.', { id: toastId });
        return;
      }

      const payOrderRes = await paymentApi.createOrder(order._id);
      const { razorpayOrderId, amount, currency, keyId } = payOrderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'NexaBuy Store',
        description: `Payment for Order #${order.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          const verifyToastId = toast.loading('Verifying payment...', { id: toastId });
          try {
            await paymentApi.verifyPayment({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            
            toast.success('Payment completed successfully!', { id: verifyToastId });
            queryClient.invalidateQueries({ queryKey: ['order', id] });
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed', { id: verifyToastId });
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: order.shippingAddress?.phone || ''
        },
        theme: {
          color: '#6C5CE7'
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled by user.', { id: toastId });
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment', { id: toastId });
    } finally {
      setPayingOrder(false);
    }
  };

  const handleRefreshTracking = async () => {
    setIsRefreshing(true);
    const toastId = toast.loading('Refreshing live shipment status...');
    try {
      await orderApi.refreshShipment(order._id);
      toast.success('Shipment tracking updated successfully!', { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to refresh tracking status.', { id: toastId });
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('AWB Number copied to clipboard!');
  };

  const handleDownloadInvoice = async () => {
    try {
      toast.loading('Generating PDF Invoice...');
      const data = await orderApi.downloadInvoice(order._id);
      toast.dismiss();

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order.orderNumber || order._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded successfully');
    } catch {
      toast.dismiss();
      toast.error('Failed to download invoice');
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.error('Please specify a cancel reason');
      return;
    }

    setCancellingOrder(true);
    try {
      await orderApi.cancelOrder(order._id, cancelReason);
      toast.success('Order cancelled successfully');
      setIsCancelModalOpen(false);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-custom section min-h-[70vh] flex flex-col items-center justify-center text-left">
        <FiAlertCircle className="w-16 h-16 text-text-muted mb-4" />
        <h2 className="text-2xl font-bold text-text mb-2">Order Not Found</h2>
        <p className="text-text-muted mb-6">We could not locate this order in your transaction records.</p>
        <Link to="/dashboard/orders">
          <Button variant="primary">Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.orderStatus);
  const isCancelled = order.orderStatus?.toLowerCase() === 'cancelled';

  return (
    <div className="bg-background text-text py-6 text-left space-y-8">
      {/* Header breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <Link to="/dashboard/orders" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors mb-2">
            <FiChevronLeft /> Back to History
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-text">
            Order Details
          </h1>
          <p className="text-xs text-text-muted mt-1 font-mono">ID: #{order._id}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {order.paymentStatus === 'pending' && order.paymentMethod === 'razorpay' && !isCancelled && (
            <Button
              onClick={handlePayNow}
              variant="primary"
              size="sm"
              isLoading={payingOrder}
              className="py-2"
            >
              Pay Now
            </Button>
          )}
          {order.paymentStatus === 'paid' && (
            <Button
              onClick={handleDownloadInvoice}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 py-2"
            >
              <FiPrinter /> Get Invoice PDF
            </Button>
          )}
          {!isCancelled && ['pending', 'processing'].includes(order.orderStatus?.toLowerCase()) && (
            <Button
              onClick={() => setIsCancelModalOpen(true)}
              variant="danger"
              size="sm"
              className="py-2"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Grid: Delivery summary & stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card 1: Meta details */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Order Metadata</h3>
          <div className="space-y-3 text-xs text-text-muted">
            <div className="flex items-center justify-between">
              <span>Placed Date</span>
              <span className="font-bold text-text">
                {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Order Number</span>
              <span className="font-mono text-text font-bold">#{order.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment Mode</span>
              <span className="uppercase text-text font-bold">{order.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment Status</span>
              <span className={`capitalize px-2 py-0.5 rounded font-bold ${
                order.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>{order.paymentStatus}</span>
            </div>
          </div>
        </div>

        {/* Info card 2: Shipping Destination */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Shipping Address</h3>
          {order.shippingAddress ? (
            <div className="text-xs text-text-muted space-y-1 leading-relaxed">
              <p className="font-bold text-text text-sm">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}{order.shippingAddress.area ? `, ${order.shippingAddress.area}` : ''}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
              <p className="text-text-muted font-semibold mt-1">📞 {order.shippingAddress.phone}</p>
            </div>
          ) : (
            <p className="text-xs text-text-muted">Address detail not found.</p>
          )}
        </div>
      </div>

      {/* Shiprocket Live Tracking Info Card */}
      {order.awbCode && (
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Live Shipping Tracking</h3>
              <p className="text-xs text-text-muted mt-1">Real-time status from our courier network.</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefreshTracking}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 py-1 px-3 text-xs"
                disabled={isRefreshing}
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                >
                  Track on Courier <FiExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs text-text-muted">
            <div className="space-y-1">
              <span className="block font-semibold uppercase text-text-muted tracking-wider text-[10px]">Courier Partner</span>
              <p className="text-sm font-bold text-text">{order.courierName || 'Shiprocket Partner'}</p>
            </div>
            <div className="space-y-1">
              <span className="block font-semibold uppercase text-text-muted tracking-wider text-[10px]">AWB / Tracking ID</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-text">{order.awbCode}</span>
                <button
                  onClick={() => copyToClipboard(order.awbCode)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-text transition-colors"
                  title="Copy Tracking ID"
                >
                  <FiCopy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <span className="block font-semibold uppercase text-text-muted tracking-wider text-[10px]">Shipping Status</span>
              <p className="text-sm font-bold text-primary capitalize">{order.trackingStatus || order.shippingStatus || 'In Transit'}</p>
            </div>
            <div className="space-y-1">
              <span className="block font-semibold uppercase text-text-muted tracking-wider text-[10px]">Estimated Delivery</span>
              <p className="text-sm font-bold text-text">
                {order.estimatedDelivery
                  ? new Date(order.estimatedDelivery).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'Pending update'}
              </p>
            </div>
          </div>

          {/* Detailed Timeline Logs if they exist */}
          {order.trackingTimeline && order.trackingTimeline.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Detailed Shipment Activities</h4>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {order.trackingTimeline.map((log, lIdx) => (
                  <div key={lIdx} className="flex gap-3 text-xs items-start border-l border-white/5 pl-4 relative">
                    <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary/20 border-2 border-primary" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-text">{log.activity || log.status}</p>
                      {log.location && <p className="text-text-muted text-[10px] mt-0.5">Location: {log.location}</p>}
                    </div>
                    {log.date && (
                      <span className="text-[10px] font-mono text-text-muted">
                        {new Date(log.date).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vertical Timeline Tracker */}
      <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Tracking Progress</h3>
        
        {isCancelled ? (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400">
            <FiAlertCircle size={18} />
            <div className="text-left">
              <span className="font-bold">Order Cancelled</span>
              <p className="text-text-muted mt-0.5">Reason: {order.statusHistory?.find(h => h.status === 'cancelled')?.note || 'Not specified'}</p>
            </div>
          </div>
        ) : (
          <div className="relative pl-4">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isUpcoming = idx > currentStepIdx;
              const Icon = step.icon;
              const historyEntry = order.statusHistory?.find(h => h.status?.toLowerCase() === step.key);

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative flex gap-5 pb-8 last:pb-0"
                >
                  {/* Vertical line */}
                  {idx < statusSteps.length - 1 && (
                    <div className={`absolute left-[19px] top-10 w-0.5 h-[calc(100%-24px)] ${
                      isCompleted ? 'bg-gradient-to-b from-[#6C5CE7] to-[#6C5CE7]/40' : 'bg-dark-border'
                    }`} />
                  )}

                  {/* Icon circle */}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'border-[#6C5CE7] bg-[#6C5CE7] text-text shadow-[0_0_20px_rgba(108,92,231,0.4)]'
                      : isCompleted
                        ? 'border-[#6C5CE7] bg-[#6C5CE7]/20 text-[#a29bfe]'
                        : 'border-dark-border bg-dark-surface text-gray-600'
                  }`}>
                    <Icon size={18} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className={`text-sm font-bold ${isUpcoming ? 'text-gray-500' : 'text-text'}`}>
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6C5CE7]/20 text-[#a29bfe] uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-pulse" />
                          Current
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${isUpcoming ? 'text-gray-600' : 'text-text-muted'}`}>
                      {step.desc}
                    </p>
                    {(historyEntry?.date || historyEntry?.timestamp) && (
                      <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
                        {new Date(historyEntry.date || historyEntry.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Purchased Items</h3>
        <div className="space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-4 items-center justify-between border-b border-white/5 last:border-0 pb-4 last:pb-0">
              <div className="flex gap-4 items-center min-w-0">
                <div className="w-16 h-16 rounded-xl bg-surface/50 p-1 flex-shrink-0 flex items-center justify-center border border-white/5">
                  <img src={item.image} alt={item.title} className="max-h-full object-contain" />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="text-sm font-bold text-text truncate">{item.title}</h4>
                  <p className="text-xs text-text-muted mt-0.5">Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-bold text-text font-[Outfit]">
                  ₹{new Intl.NumberFormat('en-IN').format(item.price * item.quantity)}
                </span>
                <p className="text-[10px] text-text-muted font-[Outfit]">({item.quantity} × ₹{new Intl.NumberFormat('en-IN').format(item.price)})</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-start-3 glass-card rounded-2xl p-6 border border-white/5 space-y-4 text-xs">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted text-left mb-2">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-muted">Items Subtotal</span>
              <span className="font-semibold text-text font-[Outfit]">₹{new Intl.NumberFormat('en-IN').format(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">GST Tax (18%)</span>
              <span className="font-semibold text-text font-[Outfit]">₹{new Intl.NumberFormat('en-IN').format(order.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Shipping Fees</span>
              <span className={`font-semibold font-[Outfit] ${order.shippingCost === 0 ? 'text-green-400' : 'text-text'}`}>
                {order.shippingCost === 0 ? 'FREE' : `₹${new Intl.NumberFormat('en-IN').format(order.shippingCost)}`}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-400 font-bold">
                <span>Coupon Discount</span>
                <span className="font-[Outfit] font-extrabold">-₹{new Intl.NumberFormat('en-IN').format(order.discount)}</span>
              </div>
            )}
            <hr className="border-white/5" />
            <div className="flex justify-between text-sm">
              <span className="font-bold text-text">Grand Total</span>
              <span className="font-extrabold text-text font-[Outfit] text-base">₹{new Intl.NumberFormat('en-IN').format(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal Form */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order"
      >
        <form onSubmit={handleCancelOrder} className="space-y-4 text-left">
          <p className="text-sm text-text-muted">
            Please let us know why you would like to cancel your order. Once cancelled, this action cannot be undone.
          </p>
          <div>
            <label htmlFor="cancel-reason-input" className="block text-xs font-semibold text-text-muted mb-1.5">Reason for Cancellation</label>
            <textarea
              id="cancel-reason-input"
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="E.g., Changed my mind, found a better deal elsewhere..."
              className="w-full bg-surface/50 border border-slate-700 rounded-xl text-text placeholder-slate-500 p-3 text-xs focus:border-primary outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCancelModalOpen(false)}>
              Back
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={cancellingOrder}
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
            >
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default OrderDetailPage;
