import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface VideoDisplayProps {
  videoUrl: string | null;
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
}

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-6 text-center">
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 rounded-full bg-teal-400 animate-[pulse_1.4s_ease-in-out_infinite]"></div>
      <div className="w-4 h-4 rounded-full bg-teal-400 animate-[pulse_1.4s_ease-in-out_0.2s_infinite]"></div>
      <div className="w-4 h-4 rounded-full bg-teal-400 animate-[pulse_1.4s_ease-in-out_0.4s_infinite]"></div>
    </div>
    <p className="text-gray-400 font-semibold text-lg px-4">{message || '비디오를 생성하고 있습니다...'}</p>
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


export const VideoDisplay: React.FC<VideoDisplayProps> = ({ videoUrl, isLoading, error, loadingMessage }) => {
  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `ai-video-creation-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const hasContent = !!videoUrl;

  return (
    <div className="w-full lg:w-1/2 flex flex-col gap-4">
      <div className="relative w-full aspect-square bg-gray-900/50 rounded-2xl flex items-center justify-center p-4 border border-gray-700 shadow-2xl shadow-teal-900/20">
        {isLoading ? (
          <LoadingIndicator message={loadingMessage} />
        ) : error ? (
          <div className="text-center text-red-400">
            <h3 className="text-xl font-bold">오류가 발생했습니다</h3>
            <p>{error}</p>
          </div>
        ) : hasContent ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            className="object-contain w-full h-full rounded-lg animate-fade-in"
            />
        ) : (
          <div className="text-center text-gray-500">
            <h3 className="text-2xl font-semibold mb-2">비디오 캔버스</h3>
            <p>생성된 비디오가 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
      {hasContent && !isLoading && !error && (
        <div className="grid grid-cols-1 gap-4 animate-fade-in">
           <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-gray-700 text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-all duration-300"
          >
            <DownloadIcon className="w-5 h-5" />
            <span>비디오 다운로드</span>
          </button>
        </div>
      )}
    </div>
  );
};
