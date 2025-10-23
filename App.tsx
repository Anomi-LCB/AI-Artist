

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageInput } from './components/ImageInput';
import { ArtDisplay } from './components/ArtDisplay';
import { VideoDisplay } from './components/VideoDisplay';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { PhotoIcon } from './components/icons/PhotoIcon';
import { VideoCameraIcon } from './components/icons/VideoCameraIcon';
import { UndoIcon } from './components/icons/UndoIcon';
import { InfoIcon } from './components/icons/InfoIcon';
import { useImageGeneration, useVideoGeneration } from './hooks/generationHooks';
import { base64ToFile } from './utils/fileUtils';
import { Workspace } from './components/Workspace';
import { StyleSelector } from './components/StyleSelector';
import { SettingsModal } from './components/SettingsModal';
import { Lightbox } from './components/Lightbox';
import { WorkspaceCreation, AppSettings } from './types';
// FIX: import inspirationalPrompts
import { artStyleOptions, qualityOptions, imageAspectRatioOptions, inspirationalPrompts } from './constants';
import { getAllCreations, addCreation, deleteCreation, clearAllCreations } from './lib/db';
import { LoginPage } from './components/LoginPage';
import { GettingStartedPage } from './components/GettingStartedPage';

type Mode = 'image' | 'video';

const SETTINGS_STORAGE_KEY = 'gemini-artist-settings';

const DEFAULT_SETTINGS: AppSettings = {
  defaultArtStyle: artStyleOptions[0].id,
  defaultQuality: qualityOptions[0].id,
  defaultNumOutputs: 1,
  defaultImageAspectRatio: '1:1',
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>('image');
  
  // Shared state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lightboxContent, setLightboxContent] = useState<WorkspaceCreation | null>(null);
  const [savedCreations, setSavedCreations] = useState<WorkspaceCreation[]>([]);

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
    // FIX: Destructure setGeneratedImages from the hook to manage state correctly
    setGeneratedImages,
    handleImageGenerate,
    handlePromptExpansion,
    isImageGenerateDisabled
    // FIX: Remove the incorrect setGeneratedImages prop. The hook now manages its own state.
  } = useImageGeneration({ appSettings, setIsLoading, setError, setLoadingMessage });
  
  // Video Generation Hook
  const {
    videoState,
    setVideoState,
    handleVideoGenerate,
    isVeoKeyReady,
    setIsVeoKeyReady,
    isVideoGenerateDisabled
    // FIX: Pass isLoading state to the hook for correct disabled logic
  } = useVideoGeneration({ isLoading, setIsLoading, setError, setLoadingMessage, setGeneratedVideoUrl: (url) => {
    if(url) {
        // We get a blob URL which we need to save to IndexedDB
        fetch(url).then(res => res.blob()).then(blob => handleSaveCreation(blob, 'video'));
    }
    setVideoState(prev => ({ ...prev, generatedVideoUrl: url }));
  }});


  // Check for session on mount
  useEffect(() => {
    const loggedIn = sessionStorage.getItem('isAuthenticated');
    const name = localStorage.getItem('userName');
    if (loggedIn === 'true' && name) {
      setIsAuthenticated(true);
      setUserName(name);
    }
    const started = sessionStorage.getItem('hasStarted');
    if (started === 'true') {
      setHasStarted(true);
    }
  }, []);

  // Check for VEO key when mode changes
  useEffect(() => {
    const checkVeoKey = async () => {
      if (mode === 'video' && isAuthenticated) {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
          setIsVeoKeyReady(true);
        } else {
          setIsVeoKeyReady(false);
        }
      }
    };
    checkVeoKey();
  }, [mode, isAuthenticated, setIsVeoKeyReady]);
  
  // Warn user before leaving page if generation is in progress
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


  // Load settings and creations on auth
  useEffect(() => {
    if (!isAuthenticated) return;

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
        setError("워크스페이스를 불러오는 데 실패했습니다.");
      }
    };
    loadData();
  }, [isAuthenticated, dispatchImageGenState]);
  
  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    dispatchImageGenState({ type: 'RESET_TO_DEFAULTS', defaults: newSettings });
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
  };

  const handleClearWorkspace = async () => {
    try {
        await clearAllCreations();
        setSavedCreations([]);
        setIsSettingsOpen(false);
    } catch (err) {
        console.error("Failed to clear workspace", err);
        setError("워크스페이스를 비우는 데 실패했습니다.");
    }
  };

  const handleLoginSuccess = (name: string) => {
    sessionStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userName', name);
    setIsAuthenticated(true);
    setUserName(name);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserName('');
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

  const handleSaveCreation = useCallback(async (data: string | Blob, type: 'image' | 'video') => {
      try {
        await addCreation(data, type);
        const updatedCreations = await getAllCreations();
        setSavedCreations(updatedCreations);
      } catch (err) {
        console.error("Failed to save creation", err);
        setError("워크스페이스에 저장하지 못했습니다.");
      }
  }, []);

  const handleDeleteCreation = useCallback(async (idToDelete: number) => {
    try {
      await deleteCreation(idToDelete);
      setSavedCreations(prev => prev.filter(creation => creation.id !== idToDelete));
    } catch (err) {
      console.error("Failed to delete creation", err);
      setError("워크스페이스에서 삭제하지 못했습니다.");
    }
  }, []);

  const handleSelectForEditing = useCallback(async (base64DataUrl: string) => {
    try {
        setMode('image');
        const file = await base64ToFile(base64DataUrl.split(',')[1], `editing-${Date.now()}.png`, 'image/png');
        setBaseImageFiles([file]);
        setIsBaseImageHighlighted(true);
        setReferenceImageFiles([]);
        dispatchImageGenState({ type: 'SET_FIELD', field: 'prompt', value: '' });
        setGeneratedImages([]);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        setError('편집할 이미지를 불러오지 못했습니다.');
    }
  }, [setBaseImageFiles, setReferenceImageFiles, dispatchImageGenState, setGeneratedImages, setIsBaseImageHighlighted]);
  
  const handleSelectVeoKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setIsVeoKeyReady(true);
        setError(null);
      }
    } catch (e) {
      console.error("API key selection failed", e);
      setError("VEO API 키 선택에 실패했습니다.");
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setIsBaseImageHighlighted(false);
  };
  
  const ModeButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button onClick={onClick} disabled={isLoading} className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors duration-300 rounded-t-lg ${active ? 'bg-gray-800/50 text-white border-b-2 border-purple-500' : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800/30'}`}>
        {children}
    </button>
  );

  const SettingButton: React.FC<{ active: boolean, onClick: () => void, disabled?: boolean, children: React.ReactNode}> = ({ active, onClick, disabled, children }) => (
     <button onClick={onClick} disabled={disabled} className={`flex-1 text-center px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 border-2 ${active ? 'bg-teal-500 border-teal-500 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
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

  if (!isAuthenticated) return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  if (!hasStarted) return <GettingStartedPage onStart={handleStart} />;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header userName={userName} onSettingsClick={() => setIsSettingsOpen(true)} onLogout={handleLogout} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={handleSaveSettings} currentSettings={appSettings} onClearWorkspace={handleClearWorkspace} />
      <Lightbox creation={lightboxContent} onClose={() => setLightboxContent(null)} />
      
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full flex flex-col items-center gap-8">
        <div className="w-full text-center mb-4">
             <p className="mt-3 text-lg text-gray-400">시그니처 스타일을 가진 아티스트.</p>
        </div>
        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8">
          {/* Left Panel: Controls */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="grid grid-cols-2">
                <ModeButton active={mode === 'image'} onClick={() => handleModeChange('image')}><PhotoIcon className="w-5 h-5" /><span>이미지 생성</span></ModeButton>
                <ModeButton active={mode === 'video'} onClick={() => handleModeChange('video')}><VideoCameraIcon className="w-5 h-5" /><span>비디오 생성</span></ModeButton>
            </div>
            
            <div className="flex flex-col gap-6 p-6 bg-gray-800/50 border border-t-0 border-gray-700 rounded-b-2xl shadow-lg flex-grow">
              {mode === 'image' && (
                <>
                  <StyleSelector styles={artStyleOptions} selectedStyle={imageGenState.artStyle} onSelect={(value) => dispatchImageGenState({ type: 'SET_FIELD', field: 'artStyle', value })} disabled={isLoading}/>
                  
                  <div>
                    <label htmlFor="prompt" className="block text-lg font-semibold mb-2 text-teal-300">{baseImageFiles.length > 0 ? "이미지 수정하기" : "프롬프트"}</label>
                    <div className="relative">
                      <textarea id="prompt" value={imageGenState.prompt} onChange={(e) => dispatchImageGenState({ type: 'SET_FIELD', field: 'prompt', value: e.target.value })} placeholder={baseImageFiles.length > 0 ? "예: 캐릭터에게 왕관을 씌워주세요..." : "예: 폭풍우가 치는 바다 위의 노아의 방주..."} className="w-full h-36 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" disabled={isLoading}/>
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        {imageGenState.originalPrompt && (<button onClick={() => dispatchImageGenState({ type: 'REVERT_PROMPT' })} disabled={isLoading} title="원래대로" className="text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"><UndoIcon className="w-5 h-5" /></button>)}
                        <button onClick={handleInspireMe} disabled={isLoading} title="영감 얻기" className="text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"><SparklesIcon className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </div>
                  
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
                            <div><label htmlFor="num-outputs" className="block text-sm font-medium text-gray-300 mb-1">생성 개수</label><select id="num-outputs" value={imageGenState.numOutputs} onChange={(e) => dispatchImageGenState({ type: 'SET_FIELD', field: 'numOutputs', value: Number(e.target.value)})} disabled={isLoading} className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-purple-500 disabled:opacity-50"><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">프롬프트 확장</label>
                                <label className={`relative inline-flex items-center ${isLoading || !imageGenState.prompt.trim() ? 'cursor-not-allowed' : 'cursor-pointer'}`} title={!imageGenState.prompt.trim() ? "프롬프트를 입력해야 확장을 사용할 수 있습니다." : "AI가 프롬프트를 더 창의적으로 개선합니다."}><input type="checkbox" checked={imageGenState.isPromptExpansionEnabled} onChange={() => dispatchImageGenState({ type: 'SET_FIELD', field: 'isPromptExpansionEnabled', value: !imageGenState.isPromptExpansionEnabled })} className="sr-only peer" disabled={isLoading || !imageGenState.prompt.trim()}/><div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 peer-disabled:opacity-50"></div></label>
                                <p className="text-xs text-gray-500 mt-1">AI가 프롬프트를 창의적으로 개선합니다.</p>
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  {imageGenState.isPromptExpansionEnabled ? (<button onClick={handlePromptExpansion} disabled={isLoading || !imageGenState.prompt.trim()} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-600"><SparklesIcon className="w-6 h-6" /><span>프롬프트 제안받기</span></button>) : (<button onClick={handleImageGenerate} disabled={isImageGenerateDisabled} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-teal-600"><SparklesIcon className="w-6 h-6" /><span>{isImageGenerateDisabled && (baseImageFiles.length > 0 || referenceImageFiles.length > 0) ? "비전을 입력하세요" : "아트 생성"}</span></button>)}
                  {imageGenState.originalPrompt && (<button onClick={handleImageGenerate} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-teal-600"><SparklesIcon className="w-6 h-6" /><span>제안된 프롬프트로 아트 생성</span></button>)}
                </>
              )}
              {mode === 'video' && (
                <>
                    {!isVeoKeyReady && <VeoApiKeyBanner />}
                    <div><label htmlFor="video-prompt" className="block text-lg font-semibold mb-2 text-teal-300">비디오 시나리오</label><div className="relative"><textarea id="video-prompt" value={videoState.prompt} onChange={(e) => setVideoState(p=>({...p, prompt: e.target.value}))} placeholder="예: 캐릭터가 배경 숲을 탐험합니다..." className="w-full h-36 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" disabled={isLoading}/><button onClick={handleInspireMe} disabled={isLoading} title="영감 얻기" className="absolute bottom-3 right-3 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"><SparklesIcon className="w-5 h-5" /></button></div></div>
                    <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700"><h3 className="text-lg font-semibold text-teal-300 -mb-2">비디오 에셋</h3><p className="text-sm text-gray-400">비디오에 포함될 이미지를 업로드하세요. 모든 이미지는 선택 사항입니다.</p><div><label className="block font-medium mb-1 text-gray-300">배경 이미지 <span className="text-sm text-gray-400 font-normal">(최대 3개)</span></label><ImageInput files={videoState.backgroundImageFile} onFilesChange={files => setVideoState(p=>({...p, backgroundImageFile: files}))} isLoading={isLoading} maxFiles={3}/></div><div><label className="block font-medium mb-1 text-gray-300">캐릭터 이미지 <span className="text-sm text-gray-400 font-normal">(최대 10개)</span></label><ImageInput files={videoState.characterImageFile} onFilesChange={files => setVideoState(p=>({...p, characterImageFile: files}))} isLoading={isLoading} maxFiles={10}/></div><div><label className="block font-medium mb-1 text-gray-300">기타 이미지 <span className="text-sm text-gray-400 font-normal">(최대 5개, 예: 소품)</span></label><ImageInput files={videoState.otherImageFile} onFilesChange={files => setVideoState(p=>({...p, otherImageFile: files}))} isLoading={isLoading} maxFiles={5}/><input type="text" value={videoState.otherImageComment} onChange={(e) => setVideoState(p=>({...p, otherImageComment: e.target.value}))} placeholder="이 이미지는 '마법 검'입니다 (선택 사항)" className="w-full mt-2 p-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-1 focus:ring-purple-500 transition" disabled={isLoading}/></div></div>
                    <div className="space-y-2">
                        <label className="block text-lg font-semibold text-teal-300">비디오 설정</label>
                        {videoState.isMultiImageMode && (<p className="text-sm text-yellow-400 mb-2 bg-yellow-900/50 p-3 rounded-md border border-yellow-700">다중 이미지 모드에서는 <strong>16:9 비율</strong>과 <strong>720p 해상도</strong>로 고정됩니다.</p>)}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><span className="text-sm font-medium text-gray-300">화면 비율</span><div className="flex gap-2 mt-1"><SettingButton onClick={() => setVideoState(p=>({...p, aspectRatio: '16:9'}))} disabled={isLoading || videoState.isMultiImageMode} active={videoState.aspectRatio === '16:9'}><div className="flex flex-col items-center justify-center leading-tight"><span>16:9</span><span className="text-xs">(가로)</span></div></SettingButton><SettingButton onClick={() => setVideoState(p=>({...p, aspectRatio: '9:16'}))} disabled={isLoading || videoState.isMultiImageMode} active={videoState.aspectRatio === '9:16'}><div className="flex flex-col items-center justify-center leading-tight"><span>9:16</span><span className="text-xs">(세로)</span></div></SettingButton></div></div>
                            <div><span className="text-sm font-medium text-gray-300">해상도</span><div className="flex gap-2 mt-1"><SettingButton onClick={() => setVideoState(p=>({...p, resolution: '1080p'}))} disabled={isLoading || videoState.isMultiImageMode} active={videoState.resolution === '1080p'}><div className="flex flex-col items-center justify-center leading-tight"><span>1080p</span><span className="text-xs">(고화질)</span></div></SettingButton><SettingButton onClick={() => setVideoState(p=>({...p, resolution: '720p'}))} disabled={isLoading || videoState.isMultiImageMode} active={videoState.resolution === '720p'}><div className="flex flex-col items-center justify-center leading-tight"><span>720p</span><span className="text-xs">(표준)</span></div></SettingButton></div></div>
                        </div>
                    </div>
                    <button onClick={handleVideoGenerate} disabled={isVideoGenerateDisabled} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-700 hover:to-cyan-600"><VideoCameraIcon className="w-6 h-6" /><span>비디오 생성</span></button>
                </>
              )}
            </div>
          </div>

          {/* Right Panel: Display */}
          {mode === 'image' ? (
            <ArtDisplay images={generatedImages} isLoading={isLoading} error={error} loadingMessage={loadingMessage} onSave={(image) => handleSaveCreation(image, 'image')} onImageClick={(image) => setLightboxContent({ id: 0, base64: `data:image/png;base64,${image}`, type: 'image', createdAt: new Date() })}/>
          ) : (
            <VideoDisplay videoUrl={videoState.generatedVideoUrl} isLoading={isLoading} error={error} loadingMessage={loadingMessage}/>
          )}
        </div>

        <Workspace userName={userName} creations={savedCreations} onSelectForEditing={handleSelectForEditing} onDelete={handleDeleteCreation} onCreationClick={setLightboxContent}/>
      </main>
    </div>
  );
};

export default App;