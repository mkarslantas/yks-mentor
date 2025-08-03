import React from 'react';

const SkeletonLoader = ({ 
  type = 'text', 
  lines = 3, 
  className = '', 
  width = 'w-full',
  height = 'h-4'
}) => {
  const baseClasses = 'bg-gray-200 rounded animate-pulse';

  if (type === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${height} ${
              index === lines - 1 ? 'w-3/4' : width
            }`}
          ></div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
          
          {/* Footer */}
          <div className="flex space-x-2 mt-4">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
        <div className="animate-pulse">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 rounded flex-1"></div>
              ))}
            </div>
          </div>
          
          {/* Table Rows */}
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4 border-b border-gray-200">
              <div className="flex space-x-4">
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 space-y-2 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default skeleton
  return (
    <div className={`${baseClasses} ${width} ${height} ${className}`}></div>
  );
};

export default SkeletonLoader;