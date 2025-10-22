import React from 'react';

export const PhotoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
    >
    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V6c0-.414.336-.75.75-.75h16.5c.414 0 .75.336.75.75v10.06l-3.572-3.572a.75.75 0 00-1.06 0l-3.955 3.955a.75.75 0 01-1.06 0l-2.122-2.121a.75.75 0 00-1.06 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
  </svg>
);
