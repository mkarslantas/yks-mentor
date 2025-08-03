import React from 'react';
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon } from 'lucide-react';

const FormField = ({ 
  label, 
  error, 
  success, 
  warning,
  children, 
  required = false,
  helpText = null,
  className = ''
}) => {
  const getStatusIcon = () => {
    if (error) {
      return <XCircleIcon className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />;
    }
    if (success) {
      return <CheckCircleIcon className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />;
    }
    if (warning) {
      return <AlertCircleIcon className="absolute right-3 top-2.5 h-5 w-5 text-yellow-500" />;
    }
    return null;
  };

  const getInputClasses = () => {
    let baseClasses = 'input transition-all duration-200';
    
    if (error) {
      baseClasses += ' border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50';
    } else if (success) {
      baseClasses += ' border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50';
    } else if (warning) {
      baseClasses += ' border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 bg-yellow-50';
    }
    
    return baseClasses;
  };

  const getMessageClasses = () => {
    if (error) return 'text-red-600';
    if (success) return 'text-green-600';
    if (warning) return 'text-yellow-600';
    return 'text-gray-500';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="label flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {React.cloneElement(children, {
          className: `${children.props.className || ''} ${getInputClasses()}`.trim()
        })}
        {getStatusIcon()}
      </div>
      
      {/* Messages */}
      <div className="min-h-[1rem]">
        {error && (
          <p className={`text-sm flex items-center gap-1 ${getMessageClasses()}`}>
            <XCircleIcon className="h-4 w-4 flex-shrink-0" />
            {error}
          </p>
        )}
        {success && !error && (
          <p className={`text-sm flex items-center gap-1 ${getMessageClasses()}`}>
            <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
            {success}
          </p>
        )}
        {warning && !error && !success && (
          <p className={`text-sm flex items-center gap-1 ${getMessageClasses()}`}>
            <AlertCircleIcon className="h-4 w-4 flex-shrink-0" />
            {warning}
          </p>
        )}
        {helpText && !error && !success && !warning && (
          <p className="text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    </div>
  );
};

export default FormField;