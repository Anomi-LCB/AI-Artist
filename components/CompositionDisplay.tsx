
import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { LightboxContent } from '../types';
import { CombineIcon } from './icons/CombineIcon';

interface CompositionDisplayProps {
  image: string | null;
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
  onSave: (image: string) => void;
  onImageClick: (content: LightboxContent) => void;
}

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease-in-out_infinite]"></div>
          <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease-in-out_0.2s_infinite]"></div>
          <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease-in-out_0.4s_infinite]"></div>
      </div>
      <p className="text-gray-300 font-semibold text-lg px-4">{message || '이미지를 합성하고 있습니다...'}</p>
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
  
export const CompositionDisplay: React.FC<CompositionDisplayProps> = ({ image, isLoading, error, loadingMessage, onSave, onImageClick }) => {

    const handleImageClick = () => {
      if (!image) return;
      onImageClick({
        id: 0,
        base64: `data:image/png;base64,${image}`,
        type: 'image',
        createdAt: new Date(),
        downloadName: `ai-composition-${Date.now()}.png`,
        saveData: image,
      });
    };
  
    const handleDownload = () => {
      if (!image) return;
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${image}`;
      link.download = `ai-composition-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    const handleSave = () => {
      if (image) {
        onSave(image);
      }
    };
  
    const hasContent = !!image;
    
    return (
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <div className="w-full panel-glass rounded-2xl flex items-center justify-center p-4 min-h-[32rem]">
          {isLoading ? (
            <LoadingIndicator message={loadingMessage} />
          ) : error ? (
            <div className="text-center text-red-400 p-4">
              <h3 className="text-xl font-bold mb-2">오류가 발생했습니다</h3>
              <p className="text-sm">{error}</p>
            </div>
          ) : hasContent ? (
            <div className="relative group">
              <button onClick={handleImageClick} className="w-full block rounded-lg overflow-hidden focus:outline-none">
                <img
                  src={`data:image/png;base64,${image}`}
                  alt="합성된 이미지"
                  className="w-full h-auto object-contain"
                />
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <CombineIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-2xl font-semibold mb-2">이미지 합성 갤러리</h3>
              <p>합성된 이미지가 여기에 표시됩니다.</p>
            </div>
          )}
        </div>
        {hasContent && !isLoading && !error && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
             <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-gray-700/50 text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-600/50 border border-gray-600 transition-all duration-300"
            >
              <DownloadIcon className="w-5 h-5" />
              <span>다운로드</span>
            </button>
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-teal-600 shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>워크스페이스에 저장</span>
            </button>
          </div>
        )}
      </div>
    );
};
