

import React from 'react';

export const SendToCanvasIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
    >
    <path d="M21.75 6.75V15a3 3 0 01-3 3h-5.25a.75.75 0 010-1.5h5.25a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H16.5a.75.75 0 010-1.5h1.5a3 3 0 013 3z" />
    <path d="M6.75 3.75A3 3 0 003.75 6.75v8.25a3 3 0 003 3H15a3 3 0 003-3V9.75a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H6.75z" />
    <path d="M12.97 3.97a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06L14.25 6.31V12a.75.75 0 01-1.5 0V6.31L10.28 8.78a.75.75 0 01-1.06-1.06l3.75-3.75z" />
  </svg>
);