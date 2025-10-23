

import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ArtDisplayProps {
  images: string[];
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
  onSave: (image: string) => void;
}

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
        <p className="text-gray-400 font-semibold text-lg">{message || '아티스트가 그림을 그리고 있습니다...'}</p>
    </div>
);

export const ArtDisplay: React.FC<ArtDisplayProps> = ({ images, isLoading, error, loadingMessage, onSave }) => {
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
          <LoadingSpinner message={loadingMessage} />
        ) : error ? (
          <div className="text-center text-red-400">
            <h3 className="text-xl font-bold">오류가 발생했습니다</h3>
            <p>{error}</p>
          </div>
        ) : hasContent ? (
          <div className={`w-full grid gap-4 ${images.length > 1 ? 'grid-cols-2 items-start' : 'grid-cols-1'}`}>
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative rounded-lg overflow-hidden focus:outline-none transition-all duration-300 ${
                  selectedIndex === index 
                    ? 'ring-4 ring-purple-500 shadow-lg' 
                    : 'ring-2 ring-transparent hover:ring-purple-400'
                }`}
              >
                <img
                  src={`data:image/png;base64,${image}`}
                  alt={`생성된 아트 ${index + 1}`}
                  className="w-full h-auto object-contain"
                />
                 {selectedIndex === index && images.length > 1 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-lg font-bold bg-purple-600/80 px-4 py-2 rounded-full">
                            선택됨
                        </div>
                    </div>
                )}
              </button>
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
