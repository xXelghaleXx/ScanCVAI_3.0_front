import React from 'react';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: { width: '16px', height: '16px' },
    md: { width: '24px', height: '24px' },
    lg: { width: '32px', height: '32px' },
    xl: { width: '48px', height: '48px' }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex flex-col items-center justify-center gap-md">
      <div 
        className="loading-spinner"
        style={currentSize}
      />
      {text && (
        <p style={{ 
          fontSize: 'var(--font-size-sm)', 
          color: 'var(--gray-600)' 
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;