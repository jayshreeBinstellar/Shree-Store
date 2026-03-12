import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";

const Modal = forwardRef(({ 
  isOpen, 
  onClose, 
  title, 
  size = 'md', 
  className = '', 
  children,
  hideClose = false,
  onBackdropClick = true 
}, ref) => {
  const contentRef = useRef(null);

  useImperativeHandle(ref, () => ({
    close: onClose
  }));

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // Modal lock: prevent background interactions and scroll
    const lockBody = () => {
      document.body.classList.add('modal-open');
    };

    const unlockBody = () => {
      document.body.classList.remove('modal-open');
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      lockBody();
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      unlockBody();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  }[size] || 'max-w-2xl';

  const handleBackdropClick = (e) => {
    if (onBackdropClick && e.target === e.currentTarget && contentRef.current !== e.target) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm modal-backdrop" 
      onClick={handleBackdropClick}
    >
      <div 
        ref={contentRef}
        className={`bg-white rounded-[24px] shadow-2xl w-full ${sizeClasses} max-h-[90vh]  animate-in fade-in zoom-in duration-300 ${className}`}
      >
        {title && (
          <div className="p-6 | border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm z-10">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">
              {title}
            </h3>
            {!hideClose && (
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-200 rounded-full transition-all"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        )}
        <div className="p-6 | overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
});

export default Modal;

