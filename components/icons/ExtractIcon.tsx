
import React from 'react';

export const ExtractIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.964 2.286a.75.75 0 00-1.071 1.052l.793 1.029-.982.982a.75.75 0 101.06 1.06l.982-.982 1.029.793a.75.75 0 101.052-1.071l-1.029-.793.982-.982a.75.75 0 10-1.06-1.06l-.982.982-.793-1.029z" />
    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm1.5 0a1.5 1.5 0 011.5-1.5h12a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 18V6z" clipRule="evenodd" />
  </svg>
);