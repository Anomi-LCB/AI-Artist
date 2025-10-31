
import React, { useEffect } from 'react';
import { LightboxContent } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SendToCanvasIcon } from './icons/SendToCanvasIcon';

interface LightboxProps {
  content: LightboxContent | null;
  onClose: () => void;
  onSave: (content: LightboxContent) => void;
  onUse: (content: LightboxContent) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ content, onClose, onSave, onUse }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!content) {
    return null;
  }

  const handleDownload = () => {
    if (!content) return;
    const link = document.createElement('a');
    link.href = content.base64;
    link.download = content.downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    if (content) {
      onSave(content);
    }
  };
  
  const handleUse = () => {
    if (content) {
      onUse(content);
    }
  };


  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full h-full max-w-4xl max-h-[85vh]"
        onClick={(e) => e.stopPropagation()} 
      >
        {content.type === 'image' || content.type === 'decomposed' ? (
          <img
            src={content.base64}
            alt="Enlarged content"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            src={content.base64}
            controls
            autoPlay
            loop
            className="w-full h-full object-contain"
          />
        )}
      </div>
      <div className="flex-shrink-0 mt-4 flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          {content.type === 'decomposed' && (
             <button
                onClick={handleUse}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-purple-700 shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                <SendToCanvasIcon className="w-5 h-5" />
                <span>생성에 사용</span>
              </button>
          )}
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-gray-700/50 text-gray-200 font-semibold py-2 px-5 rounded-lg hover:bg-gray-600/50 border border-gray-600 transition-all duration-300"
          >
            <DownloadIcon className="w-5 h-5" />
            <span>다운로드</span>
          </button>
           {(content.type === 'image' || content.type === 'decomposed') && (
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-2 px-5 rounded-lg hover:from-purple-700 hover:to-teal-600 shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                <SparklesIcon className="w-5 h-5" />
                <span>워크스페이스에 저장</span>
              </button>
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