

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageInput } from './components/ImageInput';
import { ArtDisplay } from './components/ArtDisplay';
import { VideoDisplay } from './components/VideoDisplay';
import { ExtractionDisplay } from './components/ExtractionDisplay';
import { CompositionDisplay } from './components/CompositionDisplay';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { PhotoIcon } from './components/icons/PhotoIcon';
import { VideoCameraIcon } from './components/icons/VideoCameraIcon';
import { ExtractIcon } from './components/icons/ExtractIcon';
import { CombineIcon } from './components/icons/CombineIcon';
import { UndoIcon } from './components/icons/UndoIcon';
import { InfoIcon } from './components/icons/InfoIcon';
import { useImageGeneration, useVideoGeneration, useImageDecomposition, useImageComposition } from './hooks/generationHooks';
import { base64ToFile } from './utils/fileUtils';
import { Workspace } from './components/Workspace';
import { StyleSelector } from './components/StyleSelector';
import { SettingsModal } from './components/SettingsModal';
import { Lightbox } from './components/Lightbox';
import { WorkspaceCreation, AppSettings, ToastMessage, DecomposedImageElement, LightboxContent } from './types';
import { artStyleOptions, qualityOptions, imageAspectRatioOptions, inspirationalPrompts } from './constants';
import { getAllCreations, addCreation, deleteCreation, clearAllCreations } from './lib/db';
import { GettingStartedPage } from './components/GettingStartedPage';
import { Toast } from './components/Toast';
import { InspirationDisplay } from './components/InspirationDisplay';
import { LightbulbIcon } from './components/icons/LightbulbIcon';
import { TrashIcon } from './components/icons/TrashIcon';

type Mode = 'image' | 'composition' | 'video' | 'decomposition';

const SETTINGS_STORAGE_KEY = 'gemini-artist-settings';

const DEFAULT_SETTINGS: AppSettings = {
  defaultArtStyle: artStyleOptions[0].id,
  defaultQuality: qualityOptions[0].id,
  defaultNumOutputs: 1,
  defaultImageAspectRatio: '1:1',
};

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>('image');
  
  // Shared state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lightboxContent, setLightboxContent] = useState<LightboxContent | null>(null);
  const [savedCreations, setSavedCreations] = useState<WorkspaceCreation[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [editingCreationId, setEditingCreationId] = useState<number | null>(null);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  // Image Generation Hook
  const {
    imageGenState,
    dispatchImageGenState,
    baseImageFiles,
    setBaseImageFiles,
    isBaseImageHighlighted,
    setIsBaseImageHighlighted,
    referenceImageFiles,
    setReferenceImageFiles,
    generatedImages,
    setGeneratedImages,
    handleImageGenerate,
    isImageGenerateDisabled
  } = useImageGeneration({ appSettings, setIsLoading, setError, setLoadingMessage });
  
  // Video Generation Hook
  const {
    videoState,
    setVideoState,
    handleVideoGenerate,
    isVeoKeyReady,
    setIsVeoKeyReady,
    isVideoGenerateDisabled
  } = useVideoGeneration({ isLoading, setIsLoading, setError, setLoadingMessage, setGeneratedVideoUrl: (url) => {
    if(url) {
        fetch(url).then(res => res.blob()).then(blob => handleSaveCreation(blob, 'video', true));
    }
    setVideoState(prev => ({ ...prev, generatedVideoUrl: url }));
  }});

  // Image Decomposition Hook
  const {
    decompositionState,
    handleDecompose,
    setDecompositionInputFile,
    isDecompositionDisabled
  } = useImageDecomposition({ setIsLoading, setError, setLoadingMessage });

  // Image Composition Hook
  const {
    compositionState,
    setCompositionInputFiles,
    handleCompose,
    isCompositionDisabled,
  } = useImageComposition({ setIsLoading, setError, setLoadingMessage });

  const handleUseDecomposedElement = useCallback(async (element: DecomposedImageElement) => {
    try {
        setMode('image');
        const file = await base64ToFile(element.base64, `${element.name}.png`, 'image/png');
        setBaseImageFiles([file]);
        setIsBaseImageHighlighted(true);
        setReferenceImageFiles([]);
        dispatchImageGenState({ type: 'SET_FIELD', field: 'prompt', value: `배경에 ${element.name}을(를) 활용한 장면` });
        setGeneratedImages([]);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        addToast('분해된 요소를 편집용으로 불러왔습니다.', 'success');
    } catch (err) {
        addToast('요소를 불러오지 못했습니다.', 'error');
    }
  }, [setBaseImageFiles, dispatchImageGenState, setGeneratedImages, setIsBaseImageHighlighted, addToast]);

  const handleUseFromLightbox = (content: LightboxContent) => {
    if (content.type === 'decomposed' && content.saveData) {
      handleUseDecomposedElement(content.saveData);
      setLightboxContent(null);
    }
  };


  // Check for session on mount
  useEffect(() => {
    const started = sessionStorage.getItem('hasStarted');
    if (started === 'true') {
      setHasStarted(true);
    }
  }, []);

  // Check for VEO key when mode changes
  useEffect(() => {
    const checkVeoKey = async () => {
      if (mode === 'video') {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
          setIsVeoKeyReady(true);
        } else {
          setIsVeoKeyReady(false);
        }
      }
    };
    checkVeoKey();
  }, [mode, setIsVeoKeyReady]);
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (isLoading) {
            e.preventDefault();
            e.returnValue = '생성 작업이 진행 중입니다. 페이지를 나가시면 결과가 사라질 수 있습니다. 정말로 나가시겠습니까?';
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLoading]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedSettingsString = localStorage.getItem(SETTINGS_STORAGE_KEY);
        const savedSettings = savedSettingsString ? JSON.parse(savedSettingsString) as AppSettings : DEFAULT_SETTINGS;
        setAppSettings(savedSettings);
        dispatchImageGenState({ type: 'RESET_TO_DEFAULTS', defaults: savedSettings });
      } catch (err) {
        console.error("Failed to load settings", err);
      }
      try {
        const creations = await getAllCreations();
        setSavedCreations(creations);
      } catch (err) {
        console.error("Failed to load creations", err);
        addToast("워크스페이스를 불러오는 데 실패했습니다.", "error");
      }
    };
    loadData();
  }, [dispatchImageGenState, addToast]);

  
  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    dispatchImageGenState({ type: 'RESET_TO_DEFAULTS', defaults: newSettings });
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    addToast("설정이 저장되었습니다.", "success");
  };

  const handleClearWorkspace = async () => {
    try {
        await clearAllCreations();
        setSavedCreations([]);
        setIsSettingsOpen(false);
        addToast("워크스페이스가 비워졌습니다.", "success");
    } catch (err) {
        console.error("Failed to clear workspace", err);
        addToast("워크스페이스를 비우는 데 실패했습니다.", "error");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setHasStarted(false);
    setSavedCreations([]);
  };

  const handleStart = () => {
    sessionStorage.setItem('hasStarted', 'true');
    setHasStarted(true);
  };

  const handleInspireMe = useCallback(() => {
    const randomPrompt = inspirationalPrompts[Math.floor(Math.random() * inspirationalPrompts.length)];
    if (mode === 'image') {
      dispatchImageGenState({ type: 'SET_FIELD', field: 'prompt', value: randomPrompt });
    } else {
      setVideoState(prev => ({...prev, prompt: randomPrompt}));
    }
  }, [mode, dispatchImageGenState, setVideoState]);

  const handleSaveCreation = useCallback(async (data: string | Blob, type: 'image' | 'video', silent = false) => {
      try {
        await addCreation(data, type);
        const updatedCreations = await getAllCreations();
        setSavedCreations(updatedCreations);
        if (!silent) addToast("워크스페이스에 저장되었습니다!", "success");
      } catch (err) {
        console.error("Failed to save creation", err);
        addToast("워크스페이스에 저장하지 못했습니다.", "error");
      }
  }, [addToast]);
  
  const handleSaveDecomposedElement = useCallback(async (element: DecomposedImageElement) => {
    await handleSaveCreation(element.base64, 'image');
  }, [handleSaveCreation]);

  const handleDeleteCreation = useCallback(async (idToDelete: number) => {
    try {
      await deleteCreation(idToDelete);
      setSavedCreations(prev => prev.filter(creation => creation.id !== idToDelete));
      addToast("삭제되었습니다.", "success");
    } catch (err) {
      console.error("Failed to delete creation", err);
      addToast("워크스페이스에서 삭제하지 못했습니다.", "error");
    }
  }, [addToast]);

  const handleSelectForEditing = useCallback(async (creation: WorkspaceCreation) => {
    try {
        setMode('image');
        const file = await base64ToFile(creation.base64.split(',')[1], `editing-${Date.now()}.png`, 'image/png');
        setBaseImageFiles([file]);
        setIsBaseImageHighlighted(true);
        setReferenceImageFiles([]);
        dispatchImageGenState({ type: 'SET_FIELD', field: 'prompt', value: '' });
        setGeneratedImages([]);
        setError(null);
        setEditingCreationId(creation.id);
        setTimeout(() => setEditingCreationId(null), 1500);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        addToast('편집할 이미지를 불러왔습니다.', 'success');
    } catch (err) {
        addToast('편집할 이미지를 불러오지 못했습니다.', 'error');
    }
  }, [setBaseImageFiles, setReferenceImageFiles, dispatchImageGenState, setGeneratedImages, setIsBaseImageHighlighted, addToast]);
  
  const handleSelectVeoKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setIsVeoKeyReady(true);
        setError(null);
      }
    } catch (e) {
      console.error("API key selection failed", e);
      addToast("VEO API 키 선택에 실패했습니다.", "error");
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setIsBaseImageHighlighted(false);
  };

  const handleDecomposedElementClick = useCallback((element: DecomposedImageElement) => {
    setLightboxContent({
        id: 0, 
        base64: `data:image/png;base64,${element.base64}`,
        type: 'decomposed',
        createdAt: new Date(),
        downloadName: `${element.name.replace(/\s+/g, '_')}.png`,
        saveData: element,
    });
  }, []);
  
  const onImageClick = (content: LightboxContent) => {
    const data = typeof content.saveData === 'string' ? content.saveData : content.base64.split(',')[1];
    setLightboxContent({
      id: content.id,
      base64: `data:image/png;base64,${data}`,
      type: 'image',
      createdAt: content.createdAt,
      downloadName: content.downloadName,
      saveData: data,
    });
  };

  const ModeButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button onClick={onClick} disabled={isLoading} className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-2 md:px-4 py-3 font-semibold transition-all duration-300 rounded-t-lg relative text-xs sm:text-sm ${active ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
        {children}
        {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-teal-400"></div>}
    </button>
  );

  const SettingButton: React.FC<{ active: boolean, onClick: () => void, disabled?: boolean, children: React.ReactNode}> = ({ active, onClick, disabled, children }) => (
     <button onClick={onClick} disabled={disabled} className={`flex-1 text-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2 ${active ? 'bg-teal-500 border-teal-500 text-white shadow-[0_0_10px_rgba(56,178,172,0.7)]' : 'bg-gray-700/50 border-gray-600 hover:border-purple-500 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
        {children}
    </button>
  );

  const LabeledSection: React.FC<{ title: string; tooltip: string; children: React.ReactNode }> = ({ title, tooltip, children }) => (
    <div className="flex items-center gap-2 text-lg font-semibold text-teal-300">
      <label>{title}</label>
      <div className="relative group">
        <InfoIcon className="w-5 h-5 text-gray-400" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {tooltip}
        </div>
      </div>
    </div>
  );
  
  const VeoApiKeyBanner = () => (
     <div className="text-center p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
        <p className="font-semibold mb-2">VEO API 키 선택 필요</p>
        <p className="text-sm mb-3">비디오 생성을 위해서는 VEO 모델에 액세스할 수 있는 API 키를 선택해야 합니다. 선택한 키는 이 세션에만 사용됩니다.</p>
        <p className="text-xs text-gray-400 mb-3">
            프로젝트에 결제가 활성화되어 있어야 합니다. 
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline ml-1">
                자세히 알아보기
            </a>
        </p>
        <button onClick={handleSelectVeoKey} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
            API 키 선택하기
        </button>
    </div>
  );

  const imageGenerationButtonText = (() => {
    if (baseImageFiles.length > 0 && referenceImageFiles.length > 0) {
        return "이미지 결합 / 리메이크";
    }
    if (baseImageFiles.length > 0) {
        return "이미지 수정 / 리메이크";
    }
    if (referenceImageFiles.length > 0) {
        return "참고하여 아트 생성";
    }
    return "아트 생성";
  })();

  if (!hasStarted) return <GettingStartedPage onStart={handleStart} />;

  const rightPanelContent = () => {
    switch(mode) {
      case 'image':
        return <ArtDisplay images={generatedImages} isLoading={isLoading} error={error} loadingMessage={loadingMessage} onSave={(image) => handleSaveCreation(image, 'image')} onImageClick={onImageClick}/>;
      case 'composition':
        return <CompositionDisplay 
                    image={compositionState.composedImage} 
                    isLoading={isLoading} 
                    error={error} 
                    loadingMessage={loadingMessage} 
                    onSave={(image) => handleSaveCreation(image, 'image')} 
                    onImageClick={onImageClick}
                />;
      case 'video':
        return <VideoDisplay videoUrl={videoState.generatedVideoUrl} isLoading={isLoading} error={error} loadingMessage={loadingMessage}/>;
      case 'decomposition':
        return <ExtractionDisplay 
                  originalImage={decompositionState.inputFile}
                  decomposedElements={decompositionState.decomposedElements}
                  isLoading={isLoading}
                  error={error}
                  loadingMessage={loadingMessage}
                  onUseElement={handleUseDecomposedElement}
                  onSaveElement={handleSaveDecomposedElement}
                  onElementClick={handleDecomposedElementClick}
               />;
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen flex flex-col">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} onLogout={handleLogout} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={handleSaveSettings} currentSettings={appSettings} onClearWorkspace={handleClearWorkspace} />
      <Lightbox 
        content={lightboxContent} 
        onClose={() => setLightboxContent(null)} 
        onSave={(content) => {
          if (content.type === 'decomposed' && content.saveData) {
            handleSaveDecomposedElement(content.saveData);
          } else if ((content.type === 'image' || content.type === 'video') && content.saveData) {
              const rawBase64 = typeof content.saveData === 'string' ? content.saveData : content.base64.split(',')[1];
              if (rawBase64) {
                  handleSaveCreation(rawBase64, content.type);
              }
          }
          setLightboxContent(null);
        }}
        onUse={handleUseFromLightbox}
      />
      
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(t => t.filter(t_ => t_.id !== toast.id))} />
        ))}
      </div>

      <main className="container mx-auto p-4 md:p-8 flex-grow w-full flex flex-col items-center gap-8">
        <div className="w-full text-center mb-4">
             <p className="mt-3 text-lg text-gray-400">시그니처 스타일을 가진 아티스트.</p>
        </div>
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">
          {/* Left Panel: Controls */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="grid grid-cols-4 panel-glass rounded-t-2xl border-b-0">
                <ModeButton active={mode === 'image'} onClick={() => handleModeChange('image')}><PhotoIcon className="w-5 h-5" /><span className="whitespace-nowrap">이미지 생성</span></ModeButton>
                <ModeButton active={mode === 'composition'} onClick={() => handleModeChange('composition')}><CombineIcon className="w-5 h-5" /><span className="whitespace-nowrap">이미지 합성</span></ModeButton>
                <ModeButton active={mode === 'decomposition'} onClick={() => handleModeChange('decomposition')}><ExtractIcon className="w-5 h-5" /><span className="whitespace-nowrap">이미지 분해</span></ModeButton>
                <ModeButton active={mode === 'video'} onClick={() => handleModeChange('video')}><VideoCameraIcon className="w-5 h-5" /><span className="whitespace-nowrap">비디오 생성</span></ModeButton>
            </div>
            
            <div className="flex flex-col gap-6 p-6 panel-glass rounded-b-2xl shadow-lg flex-grow">
              {mode === 'image' && (
                <>
                  <StyleSelector styles={artStyleOptions} selectedStyle={imageGenState.artStyle} onSelect={(value) => dispatchImageGenState({ type: 'SET_FIELD', field: 'artStyle', value })} disabled={isLoading}/>
                  
                  <div>
                    <label htmlFor="prompt" className="block text-lg font-semibold mb-2 text-teal-300">{baseImageFiles.length > 0 ? "이미지 수정하기" : "프롬프트"}</label>
                    <div className="relative">
                      <textarea id="prompt" value={imageGenState.prompt} onChange={(e) => dispatchImageGenState({ type: 'SET_FIELD', field: 'prompt', value: e.target.value })} placeholder={baseImageFiles.length > 0 ? "예: 캐릭터에게 왕관을 씌워주세요..." : "예: 폭풍우가 치는 바다 위의 노아의 방주..."} className="w-full h-36 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" disabled={isLoading}/>
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        {imageGenState.originalPrompt && (<button onClick={() => dispatchImageGenState({ type: 'REVERT_PROMPT' })} disabled={isLoading} title="원래대로" className="text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"><UndoIcon className="w-5 h-5" /></button>)}
                        <button onClick={handleInspireMe} disabled={isLoading} title="영감 얻기" className="text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"><LightbulbIcon className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </div>

                  {!imageGenState.prompt.trim() && baseImageFiles.length === 0 && referenceImageFiles.length === 0 && (
                    <InspirationDisplay 
                        onSelectPrompt={(prompt) => dispatchImageGenState({ type: 'SET_FIELD', field: 'prompt', value: prompt })} 
                        disabled={isLoading} 
                    />
                  )}
                  
                  <div>
                    <label htmlFor="negative-prompt" className="block text-lg font-semibold mb-2 text-teal-300">제외할 내용 <span className="text-sm text-gray-400 font-normal">(선택 사항)</span></label>
                    <textarea id="negative-prompt" value={imageGenState.negativePrompt} onChange={(e) => dispatchImageGenState({ type: 'SET_FIELD', field: 'negativePrompt', value: e.target.value })} placeholder="예: 텍스트, 흐릿함, 6개 이상의 손가락..." className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" disabled={isLoading}/>
                  </div>

                  <div>
                    <div className="mb-2">
                      <LabeledSection title="이미지 편집 / 리메이크" tooltip="여기에 업로드된 이미지를 직접 수정, 변형, 또는 리메이크합니다." />
                    </div>
                    <ImageInput files={baseImageFiles} onFilesChange={(files) => { setBaseImageFiles(files); setIsBaseImageHighlighted(false); }} isLoading={isLoading} maxFiles={5} highlight={isBaseImageHighlighted} />
                  </div>

                  <div>
                     <div className="mb-2">
                      <LabeledSection title="참고 (스타일 / 영감)" tooltip="영감을 주거나 스타일, 캐릭터, 특정 요소를 추가하는 데 사용됩니다. 이 이미지는 직접 수정되지 않습니다." />
                    </div>
                    <ImageInput files={referenceImageFiles} onFilesChange={setReferenceImageFiles} isLoading={isLoading} maxFiles={10} />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-teal-300 mb-2">생성 옵션</label>
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-300 mb-1">품질</label><div className="flex gap-2">{qualityOptions.map(option => (<SettingButton key={option.id} onClick={() => dispatchImageGenState({ type: 'SET_FIELD', field: 'quality', value: option.id })} disabled={isLoading} active={imageGenState.quality === option.id}><span className="whitespace-nowrap">{option.label}</span></SettingButton>))}</div></div>
                            <div className="sm:col-span-3"><label className="block text-sm font-medium text-gray-300 mb-1">이미지 규격</label><div className="flex gap-2">{imageAspectRatioOptions.map(option => (<SettingButton key={option.id} onClick={() => dispatchImageGenState({ type: 'SET_FIELD', field: 'imageAspectRatio', value: option.id })} disabled={isLoading} active={imageGenState.imageAspectRatio === option.id}><div className="flex flex-col items-center justify-center leading-tight"><span>{option.label.split('\n')[0]}</span>{option.label.split('\n')[1] && <span className="text-xs">{option.label.split('\n')[1]}</span>}</div></SettingButton>))}</div></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            <div><label htmlFor="num-outputs" className="block text-sm font-medium text-gray-300 mb-1">생성 개수</label><select id="num-outputs" value={imageGenState.numOutputs} onChange={(e) => dispatchImageGenState({ type: 'SET_FIELD', field: 'numOutputs', value: Number(e.target.value)})} disabled={isLoading} className="bg-gray-700/50 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-purple-500 disabled:opacity-50"><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">프롬프트 확장</label>
                                <label className={`relative inline-flex items-center ${isLoading || !imageGenState.prompt.trim() ? 'cursor-not-allowed' : 'cursor-pointer'}`} title={!imageGenState.prompt.trim() ? "프롬프트를 입력해야 확장을 사용할 수 있습니다." : "AI가 프롬프트를 더 창의적으로 개선합니다."}><input type="checkbox" checked={imageGenState.isPromptExpansionEnabled} onChange={() => dispatchImageGenState({ type: 'SET_FIELD', field: 'isPromptExpansionEnabled', value: !imageGenState.isPromptExpansionEnabled })} className="sr-only peer" disabled={isLoading || !imageGenState.prompt.trim()}/><div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 peer-disabled:opacity-50"></div></label>
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  <button onClick={handleImageGenerate} disabled={isImageGenerateDisabled} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-teal-600 shadow-lg hover:shadow-purple-500/50">
                    <SparklesIcon className="w-6 h-6" />
                    <span>{imageGenerationButtonText}</span>
                  </button>
                  {imageGenState.originalPrompt && (<p className="text-xs text-center text-gray-400">프롬프트가 확장되었습니다. <button onClick={() => dispatchImageGenState({ type: 'REVERT_PROMPT' })} className="underline hover:text-purple-400">되돌리기</button></p>)}
                </>
              )}
              {mode === 'composition' && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <LabeledSection title="이미지 합성하기" tooltip="합성할 여러 이미지를 업로드하세요 (최대 12개). AI가 각 이미지의 원본 형태를 그대로 유지하면서 하나의 자연스러운 장면으로 조합합니다." />
                        {compositionState.inputFiles.length > 0 && (
                            <button 
                              onClick={() => setCompositionInputFiles([])} 
                              disabled={isLoading}
                              className="flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>전체 삭제</span>
                            </button>
                        )}
                    </div>
                    <ImageInput 
                      files={compositionState.inputFiles} 
                      onFilesChange={setCompositionInputFiles} 
                      isLoading={isLoading} 
                      maxFiles={12}
                    />
                  </div>
                  <button 
                    onClick={handleCompose} 
                    disabled={isLoading || isCompositionDisabled}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-600 shadow-lg hover:shadow-purple-500/50"
                  >
                    <CombineIcon className="w-6 h-6" />
                    <span>이미지 합성 실행</span>
                  </button>
                  {(compositionState.inputFiles.length > 0 && compositionState.inputFiles.length < 2) && (
                      <p className="text-xs text-center text-yellow-400">합성을 위해 2개 이상의 이미지를 업로드해주세요.</p>
                  )}
                </>
              )}
              {mode === 'decomposition' && (
                <>
                  <div>
                    <div className="mb-2">
                      <LabeledSection title="이미지 분해하기" tooltip="분해할 이미지를 업로드하세요. AI가 이미지의 핵심 요소를 분리하고, 가려진 부분을 복원합니다." />
                    </div>
                    <ImageInput 
                      files={decompositionState.inputFile ? [decompositionState.inputFile] : []} 
                      onFilesChange={(files) => setDecompositionInputFile(files[0] || null)} 
                      isLoading={isLoading} 
                      maxFiles={1}
                      replace
                    />
                  </div>
                  <button 
                    onClick={handleDecompose} 
                    disabled={isDecompositionDisabled}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-600 shadow-lg hover:shadow-purple-500/50"
                  >
                    <ExtractIcon className="w-6 h-6" />
                    <span>이미지 분해 실행</span>
                  </button>
                </>
              )}
              {mode === 'video' && (
                <>
                    {!isVeoKeyReady && <VeoApiKeyBanner />}
                    <div><label htmlFor="video-prompt" className="block text-lg font-semibold mb-2 text-teal-300">비디오 시나리오</label><div className="relative"><textarea id="video-prompt" value={videoState.prompt} onChange={(e) => setVideoState(p=>({...p, prompt: e.target.value}))} placeholder="예: 캐릭터가 배경 숲을 탐험합니다..." className="w-full h-36 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" disabled={isLoading}/><button onClick={handleInspireMe} disabled={isLoading} title="영감 얻기" className="absolute bottom-3 right-3 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"><LightbulbIcon className="w-5 h-5" /></button></div></div>
                    <div>
                        <div className="mb-2">
                          <LabeledSection title="참고 이미지" tooltip="비디오 생성에 사용할 이미지를 업로드하세요. (최대 3개)" />
                        </div>
                        <ImageInput files={videoState.referenceImageFiles} onFilesChange={files => setVideoState(p=>({...p, referenceImageFiles: files}))} isLoading={isLoading} maxFiles={3}/>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-lg font-semibold text-teal-300">비디오 설정</label>
                        {videoState.isMultiImageMode && (<p className="text-sm text-yellow-400 mb-2 bg-yellow-900/50 p-3 rounded-md border border-yellow-700">다중 이미지 모드에서는 <strong>16:9 비율</strong>과 <strong>720p 해상도</strong>로 고정됩니다.</p>)}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><span className="text-sm font-medium text-gray-300">화면 비율</span><div className="flex gap-2 mt-1"><SettingButton onClick={() => setVideoState(p=>({...p, aspectRatio: '16:9'}))} disabled={isLoading || videoState.isMultiImageMode} active={videoState.aspectRatio === '16:9'}><div className="flex flex-col items-center justify-center leading-tight"><span>16:9</span><span className="text-xs">(가로)</span></div></SettingButton><SettingButton onClick={() => setVideoState(p=>({...p, aspectRatio: '9:16'}))} disabled={isLoading || videoState.isMultiImageMode} active={videoState.aspectRatio === '9:16'}><div className="flex flex-col items-center justify-center leading-tight"><span>9:16</span><span className="text-xs">(세로)</span></div></SettingButton></div></div>
                            <div><span className="text-sm font-medium text-gray-300">해상도</span><div className="flex gap-2 mt-1"><SettingButton onClick={() => setVideoState(p=>({...p, resolution: '1080p'}))} disabled={isLoading || videoState.isMultiImageMode} active={videoState.resolution === '1080p'}><div className="flex flex-col items-center justify-center leading-tight"><span>1080p</span><span className="text-xs">(고화질)</span></div></SettingButton><SettingButton onClick={() => setVideoState(p=>({...p, resolution: '720p'}))} disabled={isLoading || videoState.isMultiImageMode} active={videoState.resolution === '720p'}><div className="flex flex-col items-center justify-center leading-tight"><span>720p</span><span className="text-xs">(표준)</span></div></SettingButton></div></div>
                        </div>
                    </div>
                    <button onClick={handleVideoGenerate} disabled={isVideoGenerateDisabled} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-700 hover:to-cyan-600 shadow-lg hover:shadow-cyan-500/50"><VideoCameraIcon className="w-6 h-6" /><span>비디오 생성</span></button>
                </>
              )}
            </div>
          </div>

          {/* Right Panel: Display */}
          {rightPanelContent()}
        </div>

        <Workspace creations={savedCreations} onSelectForEditing={handleSelectForEditing} onDelete={handleDeleteCreation} onCreationClick={(creation) => setLightboxContent({ ...creation, type: creation.type, downloadName: `creation-${creation.id}.${creation.type === 'video' ? 'mp4' : 'png'}`})} editingCreationId={editingCreationId} />
      </main>
    </div>
  );
};

export default App;