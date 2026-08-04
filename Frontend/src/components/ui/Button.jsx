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
    primary: 'bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-glow-purple hover:shadow-[0_0_40px_rgba(110,92,255,0.6)] hover:-translate-y-1 hover:brightness-110',
    cyan: 'bg-gradient-to-r from-neon-purple to-neon-cyan text-white shadow-glow-cyan hover:shadow-[0_0_40px_rgba(0,229,255,0.6)] hover:-translate-y-1 hover:brightness-110',
    mint: 'bg-gradient-to-r from-neon-mint to-neon-cyan text-[#002018] shadow-glow-mint hover:shadow-[0_0_40px_rgba(85,245,198,0.6)] hover:-translate-y-1 hover:brightness-110',
    outline: 'border border-outline text-on-surface hover:bg-surface-container-high hover:border-neon-purple/50 hover:shadow-glow-purple',
    ghost: 'text-on-surface-variant hover:text-white hover:bg-white/10',
    danger: 'bg-gradient-to-r from-neon-red to-neon-pink text-white shadow-glow-pink hover:shadow-[0_0_40px_rgba(255,90,122,0.6)] hover:-translate-y-1',
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

