import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  
  // Logic to show limited pages with ellipsis
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text hover:bg-surface/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <FiChevronLeft size={20} />
      </button>
      
      {pages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-text-muted">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-lg font-medium transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-surface border border-border text-text-muted hover:text-text hover:bg-surface/80'
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text hover:bg-surface/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
