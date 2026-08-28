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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-lg glass-panel border border-emerald-500/30 p-6 shadow-lg scale-100 transition-transform duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button 
            className="material-symbols-outlined text-on-surface-variant hover:text-white hover:bg-white/5 p-1 rounded-lg transition-colors" 
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

