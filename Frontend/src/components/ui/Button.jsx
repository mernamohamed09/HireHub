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
    primary: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-none hover:bg-emerald-500/20 hover:text-white hover:-translate-y-1 transition-all',
    secondary: 'bg-surface-container-highest text-white border border-white/10 hover:border-emerald-500 hover:text-emerald-400 hover:-translate-y-1 shadow-none',
    mint: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-none hover:bg-emerald-500/20 hover:-translate-y-1 transition-all',
    ghost: 'bg-transparent text-on-surface-variant hover:text-white hover:bg-white/5',
    outline: 'bg-transparent border border-white/20 text-white hover:border-emerald-500 hover:text-emerald-400 shadow-none',
    danger: 'bg-red-500/10 border border-red-500/30 text-red-400 shadow-none hover:bg-red-500/20 hover:text-white hover:-translate-y-1 transition-all',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    default: 'px-5 py-2',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2'
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
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

