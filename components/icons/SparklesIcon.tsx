
import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-7.19c0-1.76-1.44-3.218-3.218-3.218H3.375a.75.75 0 01-.75-.75 6.75 6.75 0 017.69-6.657z"
      clipRule="evenodd"
    />
    <path d="M6 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 016 3zM3.87.87a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06L3.87 1.93a.75.75 0 010-1.06zM1.5 6a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 011.5 6z" />
  </svg>
);
