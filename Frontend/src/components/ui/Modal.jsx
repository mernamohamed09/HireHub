import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md transition-all duration-300">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-lg glass-card rounded-xl p-xl shadow-2xl scale-100 transition-transform duration-300">
        <div className="flex justify-between items-center mb-xl">
          <h2 className="font-h2 text-h2 text-on-surface">{title}</h2>
          <button 
            className="material-symbols-outlined text-on-surface-variant hover:text-on-surface" 
            onClick={onClose}
          >
            close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
