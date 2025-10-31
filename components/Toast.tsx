
import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 4700);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const baseClasses = "flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse text-gray-200 divide-x rtl:divide-x-reverse divide-gray-700 rounded-lg shadow space-x panel-glass transition-all duration-300";
  const animationClasses = isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0";

  const typeStyles = {
    success: {
      icon: (
        <svg className="w-5 h-5 text-green-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
        </svg>
      ),
      borderColor: 'border-green-500'
    },
    error: {
      icon: (
         <svg className="w-5 h-5 text-red-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
        </svg>
      ),
      borderColor: 'border-red-500'
    },
  };

  return (
    <div className={`${baseClasses} ${animationClasses} border-l-4 ${typeStyles[type].borderColor}`} role="alert">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        {typeStyles[type].icon}
      </div>
      <div className="ps-4 text-sm font-normal">{message}</div>
       <button 
          onClick={handleClose} 
          className="p-1.5 -m-1.5 ml-auto text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
          aria-label="Close"
        >
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};