import React from 'react';

export const ColorPaletteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3a9 9 0 00-9 9 9 9 0 008.25 8.95c.29.04.54.26.58.55l.26 1.7a.75.75 0 001.42 0l.26-1.7a.64.64 0 01.58-.55 9 9 0 008.25-8.95A9 9 0 0012 3zm4.25 10.25a.75.75 0 01-1.5 0V12a.75.75 0 011.5 0v1.25zM12 11.25a.75.75 0 01-.75-.75V9a.75.75 0 011.5 0v1.5a.75.75 0 01-.75.75zm-3.75.75a.75.75 0 01-1.5 0V9.75a.75.75 0 011.5 0v2.25z" />
  </svg>
);