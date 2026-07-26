import React from 'react';
import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

const Rating = ({ value, text, color = '#FDCB6E', size = 16, interactive = false, onChange }) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <button
            key={i}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => onChange && onChange(i)}
          >
            {value >= i ? (
              <FaStar color={color} size={size} />
            ) : (
              <FiStar color={color} size={size} />
            )}
          </button>
        );
      } else {
        stars.push(
          <span key={i}>
            {value >= i ? (
              <FaStar color={color} size={size} />
            ) : value >= i - 0.5 ? (
              <FaStarHalfAlt color={color} size={size} />
            ) : (
              <FiStar color={color} size={size} />
            )}
          </span>
        );
      }
    }
    return stars;
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-0.5">
        {renderStars()}
      </div>
      {text && <span className="text-sm text-text-muted ml-2">{text}</span>}
    </div>
  );
};

export default Rating;
