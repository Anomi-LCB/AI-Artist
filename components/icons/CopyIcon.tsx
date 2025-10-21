
import React from 'react';

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10.5 3A2.25 2.25 0 008.25 5.25v2.25a.75.75 0 001.5 0V5.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75V16.5a.75.75 0 00-1.5 0v2.25A2.25 2.25 0 0010.5 21h4.5A2.25 2.25 0 0017.25 18.75V5.25A2.25 2.25 0 0015 3h-4.5z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M6.75 6.75A.75.75 0 017.5 6h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM6.75 9.75A.75.75 0 017.5 9h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM6.75 12.75a.75.75 0 017.5 12h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM4.5 6.75A2.25 2.25 0 002.25 9v9.75A2.25 2.25 0 004.5 21h4.5a2.25 2.25 0 002.25-2.25V18a.75.75 0 00-1.5 0v.75a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75V9a.75.75 0 01.75-.75h2.25a.75.75 0 000-1.5H4.5z"
      clipRule="evenodd"
    />
  </svg>
);
