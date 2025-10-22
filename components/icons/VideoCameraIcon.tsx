import React from 'react';

export const VideoCameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-2.845l3.44 3.44a.75.75 0 001.26-.53V8.895a.75.75 0 00-1.26-.53l-3.44 3.44V7.5a3 3 0 00-3-3H4.5z" />
  </svg>
);
