import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({ 
  className, 
  label, 
  error, 
  id, 
  ...props 
}, ref) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  return (
    <div className="flex flex-col gap-xs w-full">
      {label && (
        <label htmlFor={inputId} className="font-label-tag text-label-tag uppercase text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={cn(
          'w-full bg-surface-container-high border border-outline-variant rounded-lg px-md py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all',
          error && 'border-error focus:border-error focus:ring-error',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-error text-caption">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
