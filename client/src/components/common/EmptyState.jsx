import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction, 
  actionLink 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      {Icon && (
        <div className="w-24 h-24 rounded-full bg-[#6C5CE7]/10 flex items-center justify-center mb-6">
          <Icon className="w-12 h-12 text-[#6C5CE7]" />
        </div>
      )}
      <h3 className="text-2xl font-bold text-text mb-2">{title}</h3>
      <p className="text-text-muted max-w-md mb-8">{description}</p>
      
      {actionText && (
        actionLink ? (
          <Button as="a" href={actionLink}>{actionText}</Button>
        ) : (
          <Button onClick={onAction}>{actionText}</Button>
        )
      )}
    </motion.div>
  );
};

export default EmptyState;
