import React from 'react';

export const PhotoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
    >
    <path fillRule="evenodd" d="M2.25 4.5A2.25 2.25 0 014.5 2.25h15A2.25 2.25 0 0121.75 4.5v15a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 19.5v-15Zm1.5 1.5v12a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5v-12a1.5 1.5 0 00-1.5-1.5h-12a1.5 1.5 0 00-1.5 1.5Zm10.5 3a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0Z" clipRule="evenodd" />
    <path d="M5.043 14.15l2.427-2.427a1.5 1.5 0 012.122 0l2.121 2.121a.75.75 0 001.06-1.06l-2.12-2.121a3 3 0 00-4.243 0L3.983 15.21a.75.75 0 001.06 1.06l.001-1.12Z" />
  </svg>
);
