


import React, { useState, useEffect, MouseEvent, useRef } from 'react';
import { DecomposedImageElement, DecomposedLayer } from '../types';
import { PhotoIcon } from './icons/PhotoIcon';
import { SendToCanvasIcon } from './icons/SendToCanvasIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';

interface ExtractionDisplayProps {
  originalImage: File | null;
  decomposedElements: DecomposedImageElement[];
  decomposedLayers: DecomposedLayer[];
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
  onUseElement: (element: DecomposedImageElement) => void;
  onSaveElement: (element: DecomposedImageElement) => void;
  onElementClick: (element: DecomposedImageElement) => void;
  subMode: 'auto' | 'interactive' | 'layer';
  onInteractiveClick: (event: MouseEvent<HTMLImageElement>) => void;
  onLayersChange: (layers: DecomposedLayer[]) => void;
  onSave: (data: string, type: 'image' | 'video') => void;
}

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-6 text-center">
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease_in_out_infinite]"></div>
        <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease_in_out_0.2s_infinite]"></div>
        <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.4s_ease_in_out_0.4s_infinite]"></div>
    </div>
    <p className="text-gray-300 font-semibold text-lg px-4">{message || '이미지를 분해하고 있습니다...'}</p>
  </div>
);

const OriginalImageViewer: React.FC<{ imageFile: File, isInteractive?: boolean, onClick?: (e: MouseEvent<HTMLImageElement>) => void }> = ({ imageFile, isInteractive = false, onClick }) => {
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        const objectUrl = URL.createObjectURL(imageFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const imageClasses = `w-full max-h-64 object-contain rounded-md ${isInteractive ? 'cursor-crosshair' : ''}`;
    const containerClasses = `bg-black/20 p-2 rounded-lg ${isInteractive ? 'border-2 border-dashed border-purple-400' : ''}`;

    return (
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-2">{isInteractive ? '클릭하여 추출' : '원본 이미지'}</h3>
            <div className={containerClasses} onClick={isInteractive ? (e) => e.stopPropagation() : undefined}>
                <img src={previewUrl} alt="원본 이미지" className={imageClasses} onClick={isInteractive ? onClick : undefined} />
            </div>
        </div>
    );
};

const LayerStudio: React.FC<{ layers: DecomposedLayer[], onLayersChange: (layers: DecomposedLayer[]) => void, originalImage: File | null, canvasRef: React.RefObject<HTMLCanvasElement> }> = ({ layers, onLayersChange, originalImage, canvasRef }) => {
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const visibleLayers = [...layers].reverse().filter(l => l.isVisible);
        
        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = `data:image/png;base64,${src}`;
            });
        };

        const drawLayers = async () => {
          const images = await Promise.all(visibleLayers.map(l => loadImage(l.base64)));
          if (images.length > 0) {
              canvas.width = images[0].width;
              canvas.height = images[0].height;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              images.forEach(img => {
                  ctx.drawImage(img, 0, 0);
              });
          } else if (originalImage) {
               const originalImg = new Image();
               originalImg.onload = () => {
                   canvas.width = originalImg.width;
                   canvas.height = originalImg.height;
                   ctx.clearRect(0, 0, canvas.width, canvas.height);
               };
               originalImg.src = URL.createObjectURL(originalImage);
          }
        };

        drawLayers();

    }, [layers, originalImage, canvasRef]);

    const toggleVisibility = (id: number) => {
        onLayersChange(layers.map(l => l.id === id ? { ...l, isVisible: !l.isVisible } : l));
    };
    
    const handleDownloadIndividualLayer = (layer: DecomposedLayer) => {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${layer.base64}`;
        link.download = `${layer.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 h-full">
            <div className="flex-grow bg-black/20 p-2 rounded-lg flex items-center justify-center min-h-[20rem]">
                <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="w-full md:w-64 flex-shrink-0 bg-black/20 p-2 rounded-lg">
                <h4 className="text-base font-semibold text-center text-teal-300 mb-2">레이어</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {layers.map(layer => (
                        <div key={layer.id} className="flex items-center gap-2 p-1.5 bg-gray-700/50 rounded-md">
                           <button onClick={() => toggleVisibility(layer.id)} title="가시성 토글" className="p-1 text-gray-300 hover:text-white">
                                {layer.isVisible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5"/>}
                           </button>
                           <img src={`data:image/png;base64,${layer.base64}`} className="w-10 h-10 object-contain bg-black/20 rounded" alt={layer.name} />
                           <span className="text-sm truncate flex-grow">{layer.name}</span>
                           <button onClick={() => handleDownloadIndividualLayer(layer)} title={`${layer.name} 다운로드`} className="p-1 text-gray-300 hover:text-white">
                               <DownloadIcon className="w-5 h-5" />
                           </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};


export const ExtractionDisplay: React.FC<ExtractionDisplayProps> = ({
  originalImage,
  decomposedElements,
  decomposedLayers,
  isLoading,
  error,
  loadingMessage,
  onUseElement,
  onSaveElement,
  onElementClick,
  subMode,
  onInteractiveClick,
  onLayersChange,
  onSave
}) => {
  const hasContent = decomposedElements.length > 0;
  const hasLayers = decomposedLayers.length > 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = (element: DecomposedImageElement) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${element.base64}`;
    link.download = `${element.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleSaveComposed = () => {
      if (canvasRef.current) {
          const dataUrl = canvasRef.current.toDataURL('image/png');
          const base64 = dataUrl.split(',')[1];
          if (base64) {
              onSave(base64, 'image');
          }
      }
  };

  const handleDownloadComposed = () => {
      if (canvasRef.current) {
          const link = document.createElement('a');
          link.href = canvasRef.current.toDataURL('image/png');
          link.download = `ai-layer-composition-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  };
  
  const handleDownloadAllVisibleLayers = () => {
    const visibleLayers = decomposedLayers.filter(l => l.isVisible);
    if (visibleLayers.length === 0) return;

    visibleLayers.forEach((layer, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${layer.base64}`;
            link.download = `${layer.name.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, index * 200);
    });
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

  const renderContent = () => {
    if (isLoading && !hasContent && !hasLayers) {
        return <div className="flex-grow flex items-center justify-center"><LoadingIndicator message={loadingMessage} /></div>;
    }
    if (error) {
        return <div className="flex-grow flex items-center justify-center text-center text-red-400 p-4"><div><h3 className="text-xl font-bold mb-2">오류가 발생했습니다</h3><p className="text-sm">{error}</p></div></div>;
    }
    if (subMode === 'layer') {
        if (hasLayers) return <LayerStudio layers={decomposedLayers} onLayersChange={onLayersChange} originalImage={originalImage} canvasRef={canvasRef}/>;
        return <div className="flex-grow flex items-center justify-center text-center text-gray-500"><div><PhotoIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" /><h3 className="text-2xl font-semibold mb-2">레이어 스튜디오</h3><p>분해된 레이어가 여기에 표시됩니다.</p></div></div>;
    }
    if ((subMode === 'interactive' && originalImage) || hasContent) {
        return (
            <div className="flex flex-col h-full animate-fade-in">
                {originalImage && <OriginalImageViewer imageFile={originalImage} isInteractive={subMode === 'interactive'} onClick={onInteractiveClick}/>}
                <h3 className="text-lg font-semibold text-teal-300 mb-2">분해된 요소</h3>
                {isLoading && <p className="text-sm text-center text-gray-300 mb-2">{loadingMessage}</p>}
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    {hasContent ? (
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {decomposedElements.map((element, index) => (
                                <div key={`${element.name}-${index}`} className="relative group bg-black/30 rounded-lg aspect-square flex items-center justify-center cursor-pointer" onClick={() => onElementClick(element)}>
                                    <img src={`data:image/png;base64,${element.base64}`} alt={element.name} className="w-full h-full object-contain rounded-lg p-1"/>
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
                    ) : (
                       subMode === 'interactive' && <div className="text-center py-4 text-gray-500">추출된 요소가 여기에 표시됩니다.</div>
                    )}
                </div>
            </div>
        );
    }
    return <div className="flex-grow flex items-center justify-center text-center text-gray-500"><div><PhotoIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" /><h3 className="text-2xl font-semibold mb-2">이미지 분해 결과</h3><p>분해된 이미지 요소가 여기에 표시됩니다.</p></div></div>;
  }

  return (
    <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <div className="w-full panel-glass rounded-2xl flex flex-col p-4 min-h-[32rem]">
            {renderContent()}
        </div>
        {subMode === 'layer' && hasLayers && !isLoading && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
                <button
                onClick={handleDownloadComposed}
                className="w-full flex items-center justify-center gap-2 bg-gray-700/50 text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-600/50 border border-gray-600 transition-all duration-300"
                >
                <DownloadIcon className="w-5 h-5" />
                <span>결과 다운로드</span>
                </button>
                <button
                onClick={handleSaveComposed}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-teal-600 shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                <SparklesIcon className="w-5 h-5" />
                <span>워크스페이스에 저장</span>
                </button>
            </div>
             <button
              onClick={handleDownloadAllVisibleLayers}
              className="w-full flex items-center justify-center gap-2 bg-gray-700/50 text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-600/50 border border-gray-600 transition-all duration-300"
            >
              <DownloadIcon className="w-5 h-5" />
              <span>모든 보이는 레이어 다운로드</span>
            </button>
          </div>
        )}
    </div>
  );
};