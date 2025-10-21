
import React from 'react';

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.5h4.5v-.5a.75.75 0 011.5 0v.5h1.75a.75.75 0 010 1.5H4.25a.75.75 0 010-1.5H6v-.5a.75.75 0 01.75-.75h2.5V2A.75.75 0 0110 2zM5.057 6h13.886l-.881 12.334a2 2 0 01-1.993 1.666H7.943a2 2 0 01-1.993-1.666L5.057 6z" clipRule="evenodd" />
  </svg>
);
