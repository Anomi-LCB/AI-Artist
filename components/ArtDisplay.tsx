
import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';


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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length > 0) {
      setCurrentIndex(0);
    }
  }, [images]);

  const handleDownload = () => {
    const image = images[currentIndex];
    if (!image) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image}`;
    link.download = `ai-artist-creation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    const image = images[currentIndex];
    if (image) {
      onSave(image);
    }
  };

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const hasContent = images.length > 0;
  const currentImage = images[currentIndex];

  return (
    <div className="w-full lg:w-1/2 flex flex-col gap-4">
      <div className="relative w-full aspect-square bg-gray-900/50 rounded-2xl flex items-center justify-center p-4 border border-gray-700 shadow-2xl shadow-purple-900/20">
        {isLoading ? (
          <LoadingSpinner message={loadingMessage} />
        ) : error ? (
          <div className="text-center text-red-400">
            <h3 className="text-xl font-bold">오류가 발생했습니다</h3>
            <p>{error}</p>
          </div>
        ) : hasContent && currentImage ? (
          <>
            <img
              src={`data:image/png;base64,${currentImage}`}
              alt={`생성된 아트 ${currentIndex + 1}`}
              className="object-contain w-full h-full rounded-lg animate-fade-in"
            />
            {images.length > 1 && (
              <>
                <button onClick={goToPrevious} aria-label="이전 이미지" className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400">
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button onClick={goToNext} aria-label="다음 이미지" className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400">
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full pointer-events-none">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </>
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
            <span>다운로드</span>
          </button>
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-teal-600 transition-all duration-300"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>워크스페이스에 저장</span>
          </button>
        </div>
      )}
    </div>
  );
};
