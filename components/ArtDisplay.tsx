

import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ArtDisplayProps {
  images: string[];
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
  onSave: (image: string) => void;
  onImageClick: (image: string) => void;
}

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-6 text-center">
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease-in-out_infinite]"></div>
        <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease-in-out_0.2s_infinite]"></div>
        <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease-in-out_0.4s_infinite]"></div>
    </div>
    <p className="text-gray-400 font-semibold text-lg px-4">{message || '아티스트가 그림을 그리고 있습니다...'}</p>
    <style>{`
      @keyframes pulse {
        0%, 80%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        40% {
          transform: scale(0.5);
          opacity: 0.5;
        }
      }
    `}</style>
  </div>
);

export const ArtDisplay: React.FC<ArtDisplayProps> = ({ images, isLoading, error, loadingMessage, onSave, onImageClick }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (images.length > 0) {
      setSelectedIndex(0);
    }
  }, [images]);

  const handleDownload = () => {
    const image = images[selectedIndex];
    if (!image) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image}`;
    link.download = `ai-artist-creation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    const image = images[selectedIndex];
    if (image) {
      onSave(image);
    }
  };

  const hasContent = images.length > 0;
  
  return (
    <div className="w-full lg:w-1/2 flex flex-col gap-4">
      <div className="w-full bg-gray-900/50 rounded-2xl flex items-center justify-center p-4 border border-gray-700 shadow-2xl shadow-purple-900/20 min-h-[32rem]">
        {isLoading ? (
          <LoadingIndicator message={loadingMessage} />
        ) : error ? (
          <div className="text-center text-red-400">
            <h3 className="text-xl font-bold">오류가 발생했습니다</h3>
            <p>{error}</p>
          </div>
        ) : hasContent ? (
          <div className={`w-full grid gap-4 ${images.length > 1 ? 'grid-cols-2 items-start' : 'grid-cols-1'}`}>
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <button
                  onClick={() => onImageClick(image)}
                  className={`w-full block rounded-lg overflow-hidden focus:outline-none transition-all duration-300`}
                >
                  <img
                    src={`data:image/png;base64,${image}`}
                    alt={`생성된 아트 ${index + 1}`}
                    className="w-full h-auto object-contain"
                  />
                </button>
                 {images.length > 1 && (
                    <button 
                      onClick={() => setSelectedIndex(index)}
                      className={`absolute top-2 left-2 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors duration-300
                        ${selectedIndex === index 
                          ? 'bg-purple-600 text-white shadow-md' 
                          : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700'
                        }`
                      }
                    >
                       <span className={`w-2.5 h-2.5 rounded-full border-2 ${selectedIndex === index ? 'border-white bg-purple-400' : 'border-gray-500'}`}></span>
                       선택
                    </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <h3 className="text-2xl font-semibold mb-2">아트 갤러리</h3>
            <p>생성된 아트워크가 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
      {hasContent && !isLoading && !error && (
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
           <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-gray-700 text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-all duration-300"
          >
            <DownloadIcon className="w-5 h-5" />
            <span>{images.length > 1 ? '선택한 이미지 다운로드' : '다운로드'}</span>
          </button>
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-teal-600 transition-all duration-300"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>{images.length > 1 ? '선택한 이미지 저장' : '워크스페이스에 저장'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
