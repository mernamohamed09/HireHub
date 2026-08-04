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
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={cn(
          'w-full bg-surface-container-high/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-neon-purple/50 focus:shadow-[0_0_15px_rgba(110,92,255,0.15)] transition-all duration-200',
          error && 'border-neon-red/50 focus:border-neon-red/50 focus:shadow-[0_0_15px_rgba(255,90,122,0.15)]',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-neon-red text-xs">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

