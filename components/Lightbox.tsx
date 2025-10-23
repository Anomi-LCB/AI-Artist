import React, { useEffect } from 'react';
import { WorkspaceCreation } from '../types';

interface LightboxProps {
  creation: WorkspaceCreation | null;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ creation, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!creation) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full h-full max-w-4xl max-h-[90vh] p-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the content
      >
        {creation.type === 'image' ? (
          <img
            src={creation.base64} // base64 is already a data URL for images from workspace
            alt="Enlarged creation"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            src={creation.base64}
            controls
            autoPlay
            loop
            className="w-full h-full object-contain"
          />
        )}
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors"
        aria-label="닫기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};