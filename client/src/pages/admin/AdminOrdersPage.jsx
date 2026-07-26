import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { orderApi } from '../../api/orderApi';
import Loader from '../../components/common/Loader';
import { FiEye, FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const formatCurrency = (amount) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const statusColors = {
  'pending': 'bg-yellow-500/10 text-yellow-400',
  'processing': 'bg-blue-500/10 text-blue-400',
  'packed': 'bg-[#FD79A8]/10 text-[#FD79A8]',
  'shipped': 'bg-indigo-500/10 text-indigo-400',
  'outForDelivery': 'bg-purple-500/10 text-purple-400',
  'delivered': 'bg-green-500/10 text-green-400',
  'cancelled': 'bg-red-500/10 text-red-400',
};

const AdminOrdersPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isShipmentActionPending, setIsShipmentActionPending] = useState(false);
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrders', page, statusFilter],
    queryFn: () => orderApi.getAllOrders({ page, limit: 10, status: statusFilter }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, statusData }) => orderApi.updateOrderStatus(id, statusData),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    const status = e.target.status.value;
    updateStatusMutation.mutate({ id: selectedOrder._id, statusData: { status } });
  };

  const handleCreateShipment = async (orderId) => {
    setIsShipmentActionPending(true);
    const toastId = toast.loading('Creating Shiprocket shipment...');
    try {
      const res = await orderApi.createShipment(orderId);
      toast.success(res.message || 'Shipment created successfully!', { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setSelectedOrder(prev => ({ ...prev, ...res.data, shipmentCreated: true }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shipment.', { id: toastId });
    } finally {
      setIsShipmentActionPending(false);
    }
  };

  const handleRefreshShipment = async (orderId) => {
    setIsShipmentActionPending(true);
    const toastId = toast.loading('Refreshing live tracking...');
    try {
      const res = await orderApi.refreshShipment(orderId);
      toast.success('Live tracking updated successfully!', { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setSelectedOrder(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to refresh tracking.', { id: toastId });
    } finally {
      setIsShipmentActionPending(false);
    }
  };

  const handleDownloadLabel = async (orderId) => {
    setIsShipmentActionPending(true);
    const toastId = toast.loading('Fetching shipping label...');
    try {
      const res = await orderApi.downloadShiprocketLabel(orderId);
      const url = res.data?.labelUrl || res.data?.label_url;
      if (url) {
        window.open(url, '_blank');
        toast.success('Shipping label opened!', { id: toastId });
      } else {
        throw new Error('Label URL not generated yet.');
      }
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || 'Failed to download shipping label.', { id: toastId });
    } finally {
      setIsShipmentActionPending(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    setIsShipmentActionPending(true);
    const toastId = toast.loading('Fetching Shiprocket invoice...');
    try {
      const res = await orderApi.downloadShiprocketInvoice(orderId);
      const url = res.data?.invoiceUrl || res.data?.invoice_url;
      if (url) {
        window.open(url, '_blank');
        toast.success('Shiprocket invoice opened!', { id: toastId });
      } else {
        throw new Error('Invoice URL not found.');
      }
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || 'Failed to download Shiprocket invoice.', { id: toastId });
    } finally {
      setIsShipmentActionPending(false);
    }
  };

  const handleGenerateManifest = async (orderId) => {
    setIsShipmentActionPending(true);
    const toastId = toast.loading('Generating Manifest...');
    try {
      const res = await orderApi.generateShiprocketManifest(orderId);
      const url = res.data?.manifestUrl || res.data?.manifest_url;
      if (url) {
        window.open(url, '_blank');
        toast.success('Manifest generated and opened!', { id: toastId });
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        setSelectedOrder(prev => ({ ...prev, manifestUrl: url }));
      } else {
        throw new Error('Manifest URL not found.');
      }
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || 'Failed to generate manifest.', { id: toastId });
    } finally {
      setIsShipmentActionPending(false);
    }
  };

  const handleCancelShipment = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this Shiprocket shipment? This cannot be undone.')) return;
    setIsShipmentActionPending(true);
    const toastId = toast.loading('Cancelling Shiprocket shipment...');
    try {
      await orderApi.cancelShipment(orderId);
      toast.success('Shipment cancelled successfully!', { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setSelectedOrder(prev => ({ ...prev, orderStatus: 'cancelled', shippingStatus: 'Cancelled' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel shipment.', { id: toastId });
    } finally {
      setIsShipmentActionPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-text">Orders Management</h2>
        <div className="flex gap-4 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 bg-dark-card border border-dark-border rounded-xl px-4 py-2 text-text focus:outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="outForDelivery">Out For Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-dark-surface/50 text-xs uppercase text-text-muted border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <Loader size="md" />
                  </td>
                </tr>
              ) : data?.data?.orders?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-text-muted">
                    No orders found.
                  </td>
                </tr>
              ) : (
                data?.data?.orders?.map((order) => (
                  <tr key={order._id} className="hover:bg-dark-surface/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-text-muted">{order._id}</td>
                    <td className="px-6 py-4">
                      <div className="text-text font-medium">{order.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{order.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-text">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-text-muted hover:text-[#00CEC9] transition-colors"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {data?.data?.pages > 1 && (
          <div className="p-4 border-t border-dark-border flex items-center justify-between">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-text disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-text-muted">Page {page} of {data.data.pages}</span>
            <button 
              disabled={page === data.data.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-text disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-dark-bg border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-dark-border">
                <div>
                  <h2 className="text-xl font-bold text-text">Update Order Status</h2>
                  <p className="text-sm text-text-muted mt-1 font-mono">Order ID: {selectedOrder._id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-text-muted hover:text-text transition-colors">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
                    <h3 className="text-sm font-medium text-text-muted mb-2">Customer Details</h3>
                    <p className="text-text">{selectedOrder.shippingAddress?.fullName}</p>
                    <p className="text-gray-300 text-sm">
                      {selectedOrder.shippingAddress?.street}
                      {selectedOrder.shippingAddress?.area ? `, ${selectedOrder.shippingAddress?.area}` : ''}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zipCode}
                    </p>
                    <p className="text-gray-300 text-sm mt-1">Phone: {selectedOrder.shippingAddress?.phone}</p>
                  </div>
                  
                  <form id="status-form" onSubmit={handleStatusUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">New Status</label>
                      <select
                        name="status"
                        defaultValue={selectedOrder.orderStatus}
                        className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="outForDelivery">Out For Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </form>

                  {/* Shiprocket Shipping Management Panel */}
                  <div className="p-4 bg-dark-card border border-dark-border rounded-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-dark-border pb-2">
                      <h3 className="text-sm font-semibold text-text">Shiprocket Fulfillment</h3>
                      {selectedOrder.awbCode && (
                        <button
                          onClick={() => handleRefreshShipment(selectedOrder._id)}
                          disabled={isShipmentActionPending}
                          className="text-[10px] text-primary hover:underline flex items-center gap-1"
                        >
                          Refresh Tracking
                        </button>
                      )}
                    </div>

                    {!selectedOrder.shipmentId && !selectedOrder.awbCode ? (
                      <div className="space-y-3">
                        <p className="text-xs text-text-muted">
                          No active Shiprocket shipment has been created for this order yet.
                        </p>
                        {selectedOrder.paymentStatus === 'paid' ? (
                          <button
                            type="button"
                            disabled={isShipmentActionPending}
                            onClick={() => handleCreateShipment(selectedOrder._id)}
                            className="w-full text-center text-xs font-semibold py-2 px-3 rounded-lg bg-primary hover:bg-primary-dark text-white transition-all"
                          >
                            {isShipmentActionPending ? 'Creating Shipment...' : 'Create Shiprocket Shipment'}
                          </button>
                        ) : (
                          <p className="text-[10px] text-yellow-500 font-semibold bg-yellow-500/10 p-2 rounded-lg">
                            ⚠️ Shipment can only be created once the payment status is marked as 'paid'.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3 text-[11px] text-text-muted">
                          <div>
                            <span className="block text-[9px] uppercase font-semibold text-text-muted">Courier / AWB</span>
                            <p className="text-text font-semibold mt-0.5">
                              {selectedOrder.courierName || 'Shiprocket'} ({selectedOrder.awbCode || 'AWB Pending'})
                            </p>
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase font-semibold text-text-muted">Status</span>
                            <p className="text-primary font-semibold mt-0.5 capitalize">
                              {selectedOrder.trackingStatus || selectedOrder.shippingStatus || 'Order Created'}
                            </p>
                          </div>
                        </div>

                        {/* Shipment Action Buttons Grid */}
                        <div className="grid grid-cols-2 gap-2 pt-1.5">
                          <button
                            type="button"
                            disabled={isShipmentActionPending}
                            onClick={() => handleDownloadLabel(selectedOrder._id)}
                            className="text-center font-medium py-1.5 px-2 bg-white/5 hover:bg-white/10 text-text rounded border border-dark-border"
                          >
                            Print Label
                          </button>
                          <button
                            type="button"
                            disabled={isShipmentActionPending}
                            onClick={() => handleDownloadInvoice(selectedOrder._id)}
                            className="text-center font-medium py-1.5 px-2 bg-white/5 hover:bg-white/10 text-text rounded border border-dark-border"
                          >
                            Print Invoice
                          </button>
                          <button
                            type="button"
                            disabled={isShipmentActionPending}
                            onClick={() => handleGenerateManifest(selectedOrder._id)}
                            className="text-center font-medium py-1.5 px-2 bg-white/5 hover:bg-white/10 text-text rounded border border-dark-border col-span-2"
                          >
                            {selectedOrder.manifestUrl ? 'Manifest (Generated)' : 'Generate Manifest'}
                          </button>
                          <button
                            type="button"
                            disabled={isShipmentActionPending}
                            onClick={() => handleCancelShipment(selectedOrder._id)}
                            className="text-center font-medium py-1.5 px-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/20 col-span-2 mt-1"
                          >
                            Cancel Shipment
                          </button>
                        </div>

                        {/* Stored Tracking Timeline inside admin modal */}
                        {selectedOrder.trackingTimeline && selectedOrder.trackingTimeline.length > 0 && (
                          <div className="border-t border-dark-border pt-2.5 mt-2 space-y-2">
                            <span className="block text-[9px] uppercase font-semibold text-text-muted">Transit Log</span>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                              {selectedOrder.trackingTimeline.map((log, lIdx) => (
                                <div key={lIdx} className="flex justify-between items-start text-[10px] text-text-muted">
                                  <div className="text-left max-w-[70%]">
                                    <span className="font-semibold text-text block">{log.activity || log.status}</span>
                                    {log.location && <span className="text-[9px] text-text-muted">Loc: {log.location}</span>}
                                  </div>
                                  {log.date && (
                                    <span className="text-[9px] font-mono whitespace-nowrap">
                                      {new Date(log.date).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-dark-border flex justify-end gap-4 bg-dark-surface/30">
                <button type="button" onClick={() => setSelectedOrder(null)} className="btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="status-form" 
                  className="btn-primary"
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrdersPage;
