import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiArrowRight, FiFileText, FiShoppingBag } from 'react-icons/fi';
import Button from '../../components/common/Button';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || '';

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 py-12 text-left">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center space-y-6 glass-card rounded-3xl p-8 border border-white/5 relative overflow-hidden"
      >
        {/* Glow spots */}
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-success/10 rounded-full blur-[80px]"></div>

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto text-4xl border border-success/30 glow-secondary"
        >
          <FiCheckCircle />
        </motion.div>

        <div className="space-y-2 relative">
          <h1 className="text-3xl font-display font-extrabold text-text">Order Confirmed!</h1>
          <p className="text-sm text-text-muted">
            Thank you for shopping at Mishkwat. Your order has been registered and is being processed.
          </p>
        </div>

        {orderId && (
          <div className="bg-surface/40 border border-white/5 rounded-2xl p-4 text-xs space-y-1">
            <span className="text-text-muted font-medium">Transaction Reference</span>
            <p className="font-mono text-text text-[13px] tracking-wide select-all mt-1">{orderId}</p>
          </div>
        )}

        <div className="space-y-3 pt-2 relative">
          <Link to="/dashboard/orders" className="block">
            <Button variant="primary" fullWidth className="py-3 flex items-center justify-center gap-2">
              <FiShoppingBag /> View My Orders <FiArrowRight />
            </Button>
          </Link>
          <Link to="/products" className="block">
            <Button variant="outline" fullWidth className="py-3">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
