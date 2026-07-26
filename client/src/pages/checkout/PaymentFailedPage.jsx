import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import Button from '../../components/common/Button';

const PaymentFailedPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 py-12 text-left">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center space-y-6 glass-card rounded-3xl p-8 border border-white/5 relative overflow-hidden"
      >
        {/* Glow spots */}
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[80px]"></div>

        <motion.div
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-20 h-20 bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mx-auto text-4xl border border-red-500/30 glow-accent"
        >
          <FiAlertTriangle />
        </motion.div>

        <div className="space-y-2 relative">
          <h1 className="text-3xl font-display font-extrabold text-text">Payment Unsuccessful</h1>
          <p className="text-sm text-text-muted">
            The transaction was interrupted or declined. No money was deducted from your account. If it was, a refund will be processed automatically within 2-3 business days.
          </p>
        </div>

        <div className="space-y-3 pt-2 relative">
          <Link to="/cart" className="block">
            <Button variant="primary" fullWidth className="py-3 flex items-center justify-center gap-2">
              <FiShoppingCart /> Return to Cart
            </Button>
          </Link>
          <Link to="/contact" className="block">
            <Button variant="outline" fullWidth className="py-3 flex items-center justify-center gap-2">
              Get Support Assistance
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailedPage;
