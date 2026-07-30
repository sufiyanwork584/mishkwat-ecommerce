import React from 'react';
import { motion } from 'framer-motion';

const WhatsAppWidget = () => {
  const phoneNumber = import.meta.env.VITE_ADMIN_PHONE || '917770032919';
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
      {/* Official WhatsApp icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        className="w-7 h-7"
      >
        <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.72.7 5.3 2.03 7.6L.5 31.5l8.13-2.01A15.44 15.44 0 0016 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5zm0 28.3a12.76 12.76 0 01-6.53-1.8l-.47-.28-4.83 1.2 1.25-4.67-.31-.49A12.72 12.72 0 013.2 16C3.2 9.48 8.48 4.2 16 4.2c7.52 0 12.8 5.28 12.8 11.8 0 6.52-5.28 11.8-12.8 11.8zm7.02-8.83c-.38-.19-2.27-1.12-2.62-1.25-.35-.13-.61-.19-.87.19s-1 1.25-1.22 1.5c-.23.26-.45.29-.83.1a10.5 10.5 0 01-3.1-1.92 11.6 11.6 0 01-2.14-2.67c-.23-.38-.02-.59.17-.78.17-.17.38-.45.57-.67.19-.22.26-.38.38-.64.13-.26.06-.48-.03-.67-.1-.19-.87-2.1-1.19-2.88-.32-.75-.64-.65-.87-.66l-.74-.01c-.26 0-.67.1-.99.45-.35.38-1.3 1.27-1.3 3.1s1.33 3.6 1.52 3.85c.19.26 2.62 4 6.35 5.61.89.38 1.58.61 2.12.78.89.28 1.7.24 2.34.15.71-.1 2.2-.9 2.51-1.76.32-.87.32-1.61.22-1.76-.1-.16-.35-.26-.74-.45z" />
      </svg>
    </motion.button>
  );
};

export default WhatsAppWidget;
