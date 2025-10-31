
import React from 'react';

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.052A3.75 3.75 0 0115.75 6h1.5a.75.75 0 000-1.5h-1.5a2.25 2.25 0 00-2.25-2.25a.75.75 0 00-.537-.214zM15.75 12c0-.414.336-.75.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    <path d="M3.75 3A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21h10.5A2.25 2.25 0 0016.5 18.75v-3.368a.75.75 0 00-1.5 0v3.368a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V5.25a.75.75 0 01.75-.75h3.368a.75.75 0 000-1.5H3.75z" />
  </svg>
);