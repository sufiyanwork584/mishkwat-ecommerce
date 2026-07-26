import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-transparent border-t-[#6C5CE7] border-r-[#00CEC9] rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-transparent border-t-[#FD79A8] border-l-[#6C5CE7] rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
      </div>
      <div className="text-sm font-medium text-text-muted animate-pulse">Loading...</div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
        {loaderContent}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{loaderContent}</div>;
};

export default Loader;
