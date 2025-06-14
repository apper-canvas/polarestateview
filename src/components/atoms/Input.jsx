import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = ({ 
  label, 
  type = 'text', 
  error, 
  icon, 
  iconPosition = 'left',
  placeholder,
  className = '',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(props.value || props.defaultValue || '');

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value);
    if (props.onBlur) props.onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(e.target.value);
    if (props.onChange) props.onChange(e);
  };

  const inputClasses = `
    w-full px-4 py-3 border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50
    ${icon && iconPosition === 'left' ? 'pl-11' : ''}
    ${icon && iconPosition === 'right' ? 'pr-11' : ''}
    ${error 
      ? 'border-error focus:border-error' 
      : 'border-surface-300 focus:border-accent'
    }
    ${className}
  `.trim();

  const labelClasses = `
    absolute left-4 transition-all duration-200 pointer-events-none
    ${icon && iconPosition === 'left' ? 'left-11' : ''}
    ${isFocused || hasValue 
      ? 'top-1 text-xs text-surface-500' 
      : 'top-3 text-surface-400'
    }
  `.trim();

  return (
    <div className="relative">
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <ApperIcon 
            name={icon} 
            size={18} 
            className="absolute left-3 top-3 text-surface-400" 
          />
        )}
        
        <input
          type={type}
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder={!label ? placeholder : ''}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <ApperIcon 
            name={icon} 
            size={18} 
            className="absolute right-3 top-3 text-surface-400" 
          />
        )}
        
        {label && (
          <label className={labelClasses}>
            {label}
          </label>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default Input;