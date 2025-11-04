import React from 'react';

export const ResolutionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M3 3.75A1.75 1.75 0 014.75 2h4.5a.75.75 0 010 1.5h-4.5a.25.25 0 00-.25.25v4.5a.75.75 0 01-1.5 0v-4.5zM21 3.75A1.75 1.75 0 0019.25 2h-4.5a.75.75 0 000 1.5h4.5a.25.25 0 01.25.25v4.5a.75.75 0 001.5 0v-4.5zM3 20.25A1.75 1.75 0 004.75 22h4.5a.75.75 0 000-1.5h-4.5a.25.25 0 01-.25-.25v-4.5a.75.75 0 00-1.5 0v4.5zM19.25 22a1.75 1.75 0 001.75-1.75v-4.5a.75.75 0 00-1.5 0v4.5a.25.25 0 01-.25.25h-4.5a.75.75 0 000 1.5h4.5z" clipRule="evenodd" />
  </svg>
);