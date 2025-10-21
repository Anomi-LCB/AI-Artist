
import React from 'react';

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M15.75 3h-9A2.25 2.25 0 004.5 5.25v9A2.25 2.25 0 006.75 16.5h9A2.25 2.25 0 0018 14.25v-9A2.25 2.25 0 0015.75 3z" />
    <path d="M19.5 6.75A2.25 2.25 0 0121.75 9v9A2.25 2.25 0 0119.5 20.25h-9A2.25 2.25 0 018.25 18V17.25a.75.75 0 011.5 0v.75a.75.75 0 00.75.75h9a.75.75 0 00.75-.75v-9a.75.75 0 00-.75-.75H18a.75.75 0 010-1.5h1.5z" />
  </svg>
);
