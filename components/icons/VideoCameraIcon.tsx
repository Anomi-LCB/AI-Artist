import React from 'react';

export const VideoCameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
    >
    <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 9.75a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v3.44a.75.75 0 001.5 0v-4.5a.75.75 0 00-.72-.75z" />
  </svg>
);
