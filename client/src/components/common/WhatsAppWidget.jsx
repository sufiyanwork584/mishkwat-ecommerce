import React from 'react';
import { motion } from 'framer-motion';

const WhatsAppWidget = () => {
  const phoneNumber = import.meta.env.VITE_ADMIN_PHONE || '919999999999';
  const message = 'Hello Mishkwat! I have a question about your premium products.';

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      aria-label="Chat on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-8 h-8"
      >
        <path
          fillRule="evenodd"
          d="M1.051 23l2.846-10.4A11.758 11.758 0 0 1 2.4 6.786 11.96 11.96 0 1 1 12.015 24h-.012a11.832 11.832 0 0 1-5.717-1.464L1.05 23zm4.072-3.834l.322.193a9.851 9.851 0 0 0 6.558 2.455c5.445 0 9.873-4.428 9.873-9.874S17.448 2.067 12 2.067 2.127 6.495 2.127 11.94a9.845 9.845 0 0 0 2.68 6.643l.215.341-1.688 6.166 6.302-1.66z"
          clipRule="evenodd"
        />
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.27-.099-.47-.148-.667.148-.198.297-.767.967-.94 1.164-.173.199-.347.223-.644.075a8.214 8.214 0 0 1-2.428-1.503 9.08 9.08 0 0 1-1.68-2.09c-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.667-1.609-.915-2.203-.242-.579-.487-.5-.667-.51h-.57c-.198 0-.52.074-.792.372s-1.04 1.015-1.04 2.476 1.064 2.872 1.213 3.07 2.094 3.196 5.074 4.482c.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.572-.086 1.758-.718 2.005-1.411.248-.694.248-1.289.173-1.412-.074-.124-.272-.198-.57-.347z" />
      </svg>
    </motion.button>
  );
};

export default WhatsAppWidget;
