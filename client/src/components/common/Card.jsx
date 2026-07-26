import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  to,
  onClick
}) => {
  const baseClasses = `glass-card rounded-2xl overflow-hidden ${hover ? 'card-hover' : ''} ${className}`;
  
  const content = (
    <div className="h-full flex flex-col">
      {children}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className={`block h-full ${baseClasses}`}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <motion.button 
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        className={`w-full text-left text-inherit h-full ${baseClasses}`}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <div className={baseClasses}>
      {content}
    </div>
  );
};

export default Card;
