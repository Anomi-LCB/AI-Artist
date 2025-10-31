

import React, { useState, useEffect } from 'react';
import { DecomposedImageElement } from '../types';
import { PhotoIcon } from './icons/PhotoIcon';
import { SendToCanvasIcon } from './icons/SendToCanvasIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ExtractionDisplayProps {
  originalImage: File | null;
  decomposedElements: DecomposedImageElement[];
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
  onUseElement: (element: DecomposedImageElement) => void;
  onSaveElement: (element: DecomposedImageElement) => void;
  onElementClick: (element: DecomposedImageElement) => void;
}

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-6 text-center">
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease-in-out_infinite]"></div>
        <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease-in-out_0.2s_infinite]"></div>
        <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease-in-out_0.4s_infinite]"></div>
    </div>
    <p className="text-gray-300 font-semibold text-lg px-4">{message || '이미지를 분해하고 있습니다...'}</p>
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

const OriginalImageViewer: React.FC<{ imageFile: File }> = ({ imageFile }) => {
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        const objectUrl = URL.createObjectURL(imageFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    return (
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-2">원본 이미지</h3>
            <div className="bg-black/20 p-2 rounded-lg">
                <img src={previewUrl} alt="원본 이미지" className="w-full max-h-64 object-contain rounded-md"/>
            </div>
        </div>
    );
};

export const ExtractionDisplay: React.FC<ExtractionDisplayProps> = ({
  originalImage,
  decomposedElements,
  isLoading,
  error,
  loadingMessage,
  onUseElement,
  onSaveElement,
  onElementClick,
}) => {
  const hasContent = decomposedElements.length > 0;

  const handleDownload = (element: DecomposedImageElement) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${element.base64}`;
    link.download = `${element.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const ActionButton: React.FC<{ onClick: (e: React.MouseEvent) => void; title: string; children: React.ReactNode; className?: string }> = ({ onClick, title, children, className }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      title={title}
      className={`p-2 rounded-full bg-black/50 backdrop-blur-sm text-white transition-all duration-200 ease-in-out transform hover:scale-110 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <div className="w-full panel-glass rounded-2xl flex flex-col p-4 min-h-[32rem]">
            {isLoading ? (
                <div className="flex-grow flex items-center justify-center">
                    <LoadingIndicator message={loadingMessage} />
                </div>
            ) : error ? (
                <div className="flex-grow flex items-center justify-center text-center text-red-400 p-4">
                    <div>
                        <h3 className="text-xl font-bold mb-2">오류가 발생했습니다</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            ) : hasContent ? (
                <div className="flex flex-col h-full animate-fade-in">
                    {originalImage && <OriginalImageViewer imageFile={originalImage} />}
                    <h3 className="text-lg font-semibold text-teal-300 mb-2">분해된 요소</h3>
                    <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {decomposedElements.map((element, index) => (
                                <div 
                                    key={`${element.name}-${index}`} 
                                    className="relative group bg-black/30 rounded-lg aspect-square flex items-center justify-center cursor-pointer"
                                    onClick={() => onElementClick(element)}
                                >
                                    <img
                                        src={`data:image/png;base64,${element.base64}`}
                                        alt={element.name}
                                        className="w-full h-full object-contain rounded-lg p-1"
                                    />
                                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                                       <p className="text-sm font-semibold text-white absolute top-2 left-2 right-2 truncate px-1">{element.name}</p>
                                       <div className="flex items-center justify-center gap-2">
                                          <ActionButton onClick={() => onUseElement(element)} title="사용" className="hover:bg-purple-600"><SendToCanvasIcon className="w-5 h-5" /></ActionButton>
                                          <ActionButton onClick={() => onSaveElement(element)} title="저장" className="hover:bg-teal-600"><SparklesIcon className="w-5 h-5" /></ActionButton>
                                          <ActionButton onClick={() => handleDownload(element)} title="다운로드" className="hover:bg-blue-600"><DownloadIcon className="w-5 h-5" /></ActionButton>
                                       </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center text-center text-gray-500">
                    <div>
                        <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-2xl font-semibold mb-2">이미지 분해 결과</h3>
                        <p>분해된 이미지 요소가 여기에 표시됩니다.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};