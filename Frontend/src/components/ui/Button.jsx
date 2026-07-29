import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'default', 
  children, 
  ...props 
}, ref) => {
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container shadow-sm shadow-primary/20',
    outline: 'border-2 border-outline-variant text-on-surface hover:bg-surface-container-high',
    ghost: 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high',
    danger: 'bg-error text-on-error hover:bg-error-container',
  };

  const sizes = {
    sm: 'px-md py-xs text-sm',
    default: 'px-lg py-sm',
    lg: 'px-xl py-md text-lg',
    icon: 'p-sm'
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
