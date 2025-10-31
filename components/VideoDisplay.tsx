
import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';

interface VideoDisplayProps {
  videoUrl: string | null;
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
}

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        const increment = prev < 40 ? 1 : (prev < 80 ? 2 : 1.5);
        return Math.min(prev + increment, 95);
      });
    }, 500); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center w-full max-w-sm">
        <p className="text-gray-300 font-semibold text-lg px-4">{message || '비디오를 생성하고 있습니다...'}</p>
        <div className="w-full bg-gray-700/50 rounded-full h-2.5">
            <div 
                className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2.5 rounded-full transition-all duration-500 ease-linear" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        <p className="text-sm text-gray-400">이 과정은 몇 분 정도 소요될 수 있습니다. 잠시만 기다려주세요.</p>
    </div>
  );
};


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
      <div className="relative w-full aspect-square panel-glass rounded-2xl flex items-center justify-center p-4">
        {isLoading ? (
          <LoadingIndicator message={loadingMessage} />
        ) : error ? (
          <div className="text-center text-red-400 p-4">
            <h3 className="text-xl font-bold mb-2">오류가 발생했습니다</h3>
            <p className="text-sm">{error}</p>
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
            <VideoCameraIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-2xl font-semibold mb-2">비디오 캔버스</h3>
            <p>생성된 비디오가 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
      {hasContent && !isLoading && !error && (
        <div className="grid grid-cols-1 gap-4 animate-fade-in">
           <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-gray-700/50 text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-600/50 border border-gray-600 transition-all duration-300"
          >
            <DownloadIcon className="w-5 h-5" />
            <span>비디오 다운로드</span>
          </button>
        </div>
      )}
    </div>
  );
};