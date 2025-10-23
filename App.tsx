import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageInput } from './components/ImageInput';
import { ArtDisplay } from './components/ArtDisplay';
import { VideoDisplay } from './components/VideoDisplay';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { PhotoIcon } from './components/icons/PhotoIcon';
import { VideoCameraIcon } from './components/icons/VideoCameraIcon';
import { generateArt, generateVideo } from './services/geminiService';
import { fileToBase64, base64ToFile } from './utils/fileUtils';
import { Workspace } from './components/Workspace';
import { StyleSelector } from './components/StyleSelector';
import { SettingsModal } from './components/SettingsModal';
import { ArtStyleId, QualityId, WorkspaceCreation, AspectRatio, Resolution, AppSettings, ImageAspectRatio } from './types';
import { artStyleOptions, qualityOptions, inspirationalPrompts, imageAspectRatioOptions } from './constants';
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

  // Image Generation State
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [baseImageFiles, setBaseImageFiles] = useState<File[]>([]);
  const [referenceImageFiles, setReferenceImageFiles] = useState<File[]>([]);
  const [artStyle, setArtStyle] = useState<ArtStyleId>(DEFAULT_SETTINGS.defaultArtStyle);
  const [quality, setQuality] = useState<QualityId>(DEFAULT_SETTINGS.defaultQuality);
  const [imageAspectRatio, setImageAspectRatio] = useState<ImageAspectRatio>(DEFAULT_SETTINGS.defaultImageAspectRatio);
  const [numOutputs, setNumOutputs] = useState<number>(DEFAULT_SETTINGS.defaultNumOutputs);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [savedCreations, setSavedCreations] = useState<WorkspaceCreation[]>([]);

  // Video Generation State
  const [videoPrompt, setVideoPrompt] = useState<string>('');
  const [backgroundImageFile, setBackgroundImageFile] = useState<File[]>([]);
  const [characterImageFile, setCharacterImageFile] = useState<File[]>([]);
  const [otherImageFile, setOtherImageFile] = useState<File[]>([]);
  const [otherImageComment, setOtherImageComment] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<AspectRatio>('16:9');
  const [videoResolution, setVideoResolution] = useState<Resolution>('1080p');
  const [isVeoKeyReady, setIsVeoKeyReady] = useState(false);

  const allVideoImageFiles = [...backgroundImageFile, ...characterImageFile, ...otherImageFile];
  const isMultiImageMode = allVideoImageFiles.length > 1;

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

  useEffect(() => {
    if (isMultiImageMode) {
      setVideoAspectRatio('16:9');
      setVideoResolution('720p');
    }
  }, [isMultiImageMode]);
  
  useEffect(() => {
    const checkVeoKey = async () => {
      if (mode === 'video' && isAuthenticated) {
        // @ts-ignore - aistudio is available in the execution environment
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
          setIsVeoKeyReady(true);
        } else {
          setIsVeoKeyReady(false);
        }
      }
    };
    checkVeoKey();
  }, [mode, isAuthenticated]);


  // Load from storage on initial mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      // Load Settings
      try {
        const savedSettingsString = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettingsString) {
          const savedSettings = JSON.parse(savedSettingsString) as AppSettings;
          setAppSettings(savedSettings);
          // Apply loaded settings to state
          setArtStyle(savedSettings.defaultArtStyle);
          setQuality(savedSettings.defaultQuality);
          setNumOutputs(savedSettings.defaultNumOutputs);
          setImageAspectRatio(savedSettings.defaultImageAspectRatio || DEFAULT_SETTINGS.defaultImageAspectRatio);
        }
      } catch (err) {
        console.error("Failed to load settings from LocalStorage", err);
        // Fallback to default
        setAppSettings(DEFAULT_SETTINGS);
      }

      // Load creations from IndexedDB
      try {
        const creations = await getAllCreations();
        setSavedCreations(creations);
      } catch (err) {
        console.error("Failed to load creations from IndexedDB", err);
        setError("워크스페이스를 불러오는 데 실패했습니다.");
      }
    };
    loadData();
  }, [isAuthenticated]);
  
  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    // Apply new default settings to the current state if they haven't been changed by the user
    setArtStyle(newSettings.defaultArtStyle);
    setQuality(newSettings.defaultQuality);
    setNumOutputs(newSettings.defaultNumOutputs);
    setImageAspectRatio(newSettings.defaultImageAspectRatio);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
  };

  const handleClearWorkspace = async () => {
    try {
        await clearAllCreations();
        setSavedCreations([]);
        setIsSettingsOpen(false); // Close modal on success
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
      setPrompt(randomPrompt);
    } else {
      setVideoPrompt(randomPrompt)
    }
  }, [mode]);

  const handleImageGenerate = useCallback(async () => {
    if (!prompt.trim() && baseImageFiles.length === 0 && referenceImageFiles.length === 0) {
      setError('프롬프트를 입력하거나 이미지를 업로드해주세요.');
      return;
    }
    
    setError(null);
    setGeneratedImages([]);
    setIsLoading(true);
    setLoadingMessage('생성을 시작합니다...');

    try {
      const baseImageUploads = await Promise.all(
        baseImageFiles.map(async (file) => ({
          mimeType: file.type,
          data: await fileToBase64(file),
        }))
      );

      const referenceImageUploads = await Promise.all(
        referenceImageFiles.map(async (file) => ({
          mimeType: file.type,
          data: await fileToBase64(file),
        }))
      );
      
      const results = await generateArt(prompt, baseImageUploads, referenceImageUploads, setLoadingMessage, artStyle, numOutputs, quality, negativePrompt, imageAspectRatio);
      setGeneratedImages(results);
      
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [prompt, baseImageFiles, referenceImageFiles, artStyle, numOutputs, quality, negativePrompt, imageAspectRatio]);
  
  const handleVideoGenerate = useCallback(async () => {
    if (!isVeoKeyReady) {
        setError('비디오 생성을 계속하려면 VEO API 키를 선택해야 합니다.');
        return;
    }
    if (allVideoImageFiles.length === 0 && !videoPrompt.trim()) {
        setError('비디오를 생성하려면 참고 이미지를 업로드하거나 시나리오를 입력해야 합니다.');
        return;
    }
    
    setError(null);
    setGeneratedVideoUrl(null);
    setIsLoading(true);
    setLoadingMessage('생성을 시작합니다...');

    try {
        const imageUploads = await Promise.all(
            allVideoImageFiles.map(async (file) => ({
                mimeType: file.type,
                data: await fileToBase64(file),
            }))
        );
        
        let finalPrompt: string;
        if (isMultiImageMode) {
          const promptParts = [];
          if (characterImageFile.length > 0) promptParts.push('제공된 캐릭터 이미지를 주인공으로');
          if (backgroundImageFile.length > 0) promptParts.push('제공된 배경 이미지 안에서');
          if (otherImageFile.length > 0) {
              const comment = otherImageComment.trim() ? `(${otherImageComment.trim()})` : '';
              promptParts.push(`제공된 기타 이미지${comment}의 요소를 활용하여`);
          }
          const descriptivePrefix = promptParts.length > 0 ? `${promptParts.join(', ')}, ` : '';
          finalPrompt = `${descriptivePrefix}다음 시나리오의 비디오를 만들어주세요: "${videoPrompt || '이미지들을 창의적으로 조합하여 애니메이션으로 만들어주세요.'}"`;
        } else {
          finalPrompt = videoPrompt || '이 이미지를 생동감 있게 만들어주세요.';
        }

        const resultUrl = await generateVideo(finalPrompt, imageUploads, videoAspectRatio, videoResolution, setLoadingMessage);
        setGeneratedVideoUrl(resultUrl);

    } catch (err: any) {
        if (err.message.includes("다른 키를 선택해주세요")) {
          setIsVeoKeyReady(false); // Reset key state to prompt user to select again.
        }
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [videoPrompt, backgroundImageFile, characterImageFile, otherImageFile, otherImageComment, videoAspectRatio, videoResolution, allVideoImageFiles, isMultiImageMode, isVeoKeyReady]);

  const handleSaveCreation = useCallback(async (imageToSave: string) => {
    if (imageToSave && !savedCreations.some(c => c.base64 === imageToSave)) {
      try {
        await addCreation(imageToSave);
        const updatedCreations = await getAllCreations(); // Re-fetch to get the new item with its ID
        setSavedCreations(updatedCreations);
      } catch (err) {
        console.error("Failed to save creation to IndexedDB", err);
        setError("워크스페이스에 저장하지 못했습니다.");
      }
    }
  }, [savedCreations]);

  const handleDeleteCreation = useCallback(async (idToDelete: number) => {
    try {
      await deleteCreation(idToDelete);
      setSavedCreations(prev => prev.filter(creation => creation.id !== idToDelete));
    } catch (err) {
      console.error("Failed to delete creation from IndexedDB", err);
      setError("워크스페이스에서 삭제하지 못했습니다.");
    }
  }, []);

  const handleSelectForEditing = useCallback(async (base64: string) => {
    try {
        setMode('image');
        const file = await base64ToFile(base64, `editing-${Date.now()}.png`, 'image/png');
        setBaseImageFiles([file]);
        setReferenceImageFiles([]);
        setPrompt(''); // Clear prompt for new editing instructions
        setGeneratedImages([]); // Clear previous generation
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        setError('편집할 이미지를 불러오지 못했습니다.');
    }
  }, []);
  
  const handleSelectVeoKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success and update state to allow generation.
      setIsVeoKeyReady(true);
      setError(null);
    } catch (e) {
      console.error("API key selection failed", e);
      setError("VEO API 키 선택에 실패했습니다.");
    }
  };

  const isImageGenerateDisabled = isLoading || (!prompt.trim() && baseImageFiles.length === 0 && referenceImageFiles.length === 0);
  const isVideoGenerateDisabled = isLoading || !isVeoKeyReady || (allVideoImageFiles.length === 0 && !videoPrompt.trim());

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
  };
  
  const ModeButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors duration-300 rounded-t-lg
        ${active 
            ? 'bg-gray-800/50 text-white border-b-2 border-purple-500' 
            : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800/30'
        }`}
    >
        {children}
    </button>
  );

  const SettingButton: React.FC<{ active: boolean, onClick: () => void, disabled?: boolean, children: React.ReactNode}> = ({ active, onClick, disabled, children }) => (
     <button onClick={onClick} disabled={disabled}
        className={`flex-1 text-center px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 border-2 ${
            active 
                ? 'bg-teal-500 border-teal-500 text-white' 
                : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {children}
    </button>
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

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (!hasStarted) {
    return <GettingStartedPage onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header 
        userName={userName}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={appSettings}
        onClearWorkspace={handleClearWorkspace}
      />
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full flex flex-col items-center gap-8">
        <div className="w-full text-center mb-4">
             <p className="mt-3 text-lg text-gray-400">시그니처 스타일을 가진 아티스트.</p>
        </div>
        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8">
          {/* Left Panel: Controls */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="grid grid-cols-2">
                <ModeButton active={mode === 'image'} onClick={() => handleModeChange('image')}>
                    <PhotoIcon className="w-5 h-5" />
                    <span>이미지 생성</span>
                </ModeButton>
                <ModeButton active={mode === 'video'} onClick={() => handleModeChange('video')}>
                    <VideoCameraIcon className="w-5 h-5" />
                    <span>비디오 생성</span>
                </ModeButton>
            </div>
            
            <div className="flex flex-col gap-6 p-6 bg-gray-800/50 border border-t-0 border-gray-700 rounded-b-2xl shadow-lg flex-grow">
              {mode === 'image' && (
                <>
                  <StyleSelector
                    styles={artStyleOptions}
                    selectedStyle={artStyle}
                    onSelect={setArtStyle}
                    disabled={isLoading}
                  />
                  
                  <div>
                    <label htmlFor="prompt" className="block text-lg font-semibold mb-2 text-teal-300">
                      {baseImageFiles.length > 0 ? "이미지 수정하기" : "프롬프트"}
                    </label>
                    <div className="relative">
                      <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={baseImageFiles.length > 0 ? "예: 캐릭터에게 왕관을 씌워주세요..." : "예: 폭풍우가 치는 바다 위의 노아의 방주..."}
                        className="w-full h-36 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        disabled={isLoading}
                      />
                      <button onClick={handleInspireMe} disabled={isLoading} title="영감 얻기"
                        className="absolute bottom-3 right-3 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"
                      >
                        <SparklesIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="negative-prompt" className="block text-lg font-semibold mb-2 text-teal-300">
                      제외할 내용 <span className="text-sm text-gray-400 font-normal">(선택 사항)</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="negative-prompt"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="예: 텍스트, 흐릿함, 6개 이상의 손가락..."
                        className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-2 text-teal-300">
                      변경할 이미지 <span className="text-sm text-gray-400 font-normal">(기반)</span>
                    </label>
                    <p className="text-sm text-gray-400 mb-2 -mt-1">여기에 업로드된 이미지를 직접 수정, 변형, 또는 리메이크합니다.</p>
                    <ImageInput 
                      files={baseImageFiles} 
                      onFilesChange={setBaseImageFiles} 
                      isLoading={isLoading} 
                      maxFiles={5}
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-2 text-teal-300">
                      참고 이미지 <span className="text-sm text-gray-400 font-normal">(영감/스타일)</span>
                    </label>
                    <p className="text-sm text-gray-400 mb-2 -mt-1">영감을 주거나 스타일, 캐릭터, 요소를 추가하는 데 사용됩니다.</p>
                    <ImageInput 
                      files={referenceImageFiles} 
                      onFilesChange={setReferenceImageFiles} 
                      isLoading={isLoading}
                      maxFiles={10}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-teal-300 mb-2">생성 옵션</label>
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-1">품질</label>
                                <div className="flex gap-2">
                                    {qualityOptions.map(option => (
                                        <SettingButton key={option.id} onClick={() => setQuality(option.id)} disabled={isLoading} active={quality === option.id}>
                                            <span className="whitespace-nowrap">{option.label}</span>
                                        </SettingButton>
                                    ))}
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-300 mb-1">이미지 규격</label>
                                <div className="flex gap-2">
                                    {imageAspectRatioOptions.map(option => (
                                        <SettingButton key={option.id} onClick={() => setImageAspectRatio(option.id)} disabled={isLoading} active={imageAspectRatio === option.id}>
                                            <div className="flex flex-col items-center justify-center leading-tight">
                                                <span>{option.label.split('\n')[0]}</span>
                                                {option.label.split('\n')[1] && <span className="text-xs">{option.label.split('\n')[1]}</span>}
                                            </div>
                                        </SettingButton>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="num-outputs" className="block text-sm font-medium text-gray-300 mb-1">생성 개수</label>
                            <select id="num-outputs" value={numOutputs} onChange={(e) => setNumOutputs(Number(e.target.value))} disabled={isLoading}
                              className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                            >
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                              <option value={4}>4</option>
                            </select>
                        </div>
                    </div>
                  </div>
                  
                  <button onClick={handleImageGenerate} disabled={isImageGenerateDisabled}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-teal-600"
                  >
                    <SparklesIcon className="w-6 h-6" />
                    <span>{isImageGenerateDisabled && (baseImageFiles.length > 0 || referenceImageFiles.length > 0) ? "비전을 입력하세요" : "아트 생성"}</span>
                  </button>
                </>
              )}
              {mode === 'video' && (
                <>
                    {!isVeoKeyReady && <VeoApiKeyBanner />}
                    <div>
                    <label htmlFor="video-prompt" className="block text-lg font-semibold mb-2 text-teal-300">
                        비디오 시나리오
                    </label>
                    <div className="relative">
                        <textarea
                        id="video-prompt"
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="예: 캐릭터가 배경 숲을 탐험합니다..."
                        className="w-full h-36 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        disabled={isLoading}
                        />
                        <button onClick={handleInspireMe} disabled={isLoading} title="영감 얻기"
                        className="absolute bottom-3 right-3 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"
                        >
                        <SparklesIcon className="w-5 h-5" />
                        </button>
                    </div>
                    </div>
                    
                    <div>
                    <label className="block text-lg font-semibold mb-2 text-teal-300">
                        배경 이미지 <span className="text-sm text-gray-400 font-normal">(최대 3개)</span>
                    </label>
                    <ImageInput 
                        files={backgroundImageFile} 
                        onFilesChange={setBackgroundImageFile} 
                        isLoading={isLoading}
                        maxFiles={3}
                    />
                    </div>

                    <div>
                    <label className="block text-lg font-semibold mb-2 text-teal-300">
                        캐릭터 이미지 <span className="text-sm text-gray-400 font-normal">(최대 10개)</span>
                    </label>
                    <ImageInput 
                        files={characterImageFile} 
                        onFilesChange={setCharacterImageFile} 
                        isLoading={isLoading}
                        maxFiles={10}
                    />
                    </div>

                    <div>
                    <label className="block text-lg font-semibold mb-2 text-teal-300">
                        기타 이미지 <span className="text-sm text-gray-400 font-normal">(최대 5개)</span>
                    </label>
                    <p className="text-sm text-gray-400 mb-2 -mt-1">참고할 특정 아이템이나 컨셉을 추가하세요.</p>
                    <ImageInput 
                        files={otherImageFile} 
                        onFilesChange={setOtherImageFile} 
                        isLoading={isLoading}
                        maxFiles={5}
                    />
                    <input
                        type="text"
                        value={otherImageComment}
                        onChange={(e) => setOtherImageComment(e.target.value)}
                        placeholder="이 이미지는 '마법 검'입니다 (선택 사항)"
                        className="w-full mt-2 p-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-1 focus:ring-purple-500 transition"
                        disabled={isLoading}
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="block text-lg font-semibold text-teal-300">비디오 설정</label>
                    {isMultiImageMode && (
                        <p className="text-sm text-yellow-400 mb-2 bg-yellow-900/50 p-2 rounded-md">
                        다중 이미지 모드에서는 16:9 비율과 720p 해상도로 고정됩니다.
                        </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm font-medium text-gray-300">화면 비율</span>
                            <div className="flex gap-2 mt-1">
                                <SettingButton onClick={() => setVideoAspectRatio('16:9')} disabled={isLoading || isMultiImageMode} active={videoAspectRatio === '16:9'}>
                                    <div className="flex flex-col items-center justify-center leading-tight">
                                        <span>16:9</span>
                                        <span className="text-xs">(가로)</span>
                                    </div>
                                </SettingButton>
                                <SettingButton onClick={() => setVideoAspectRatio('9:16')} disabled={isLoading || isMultiImageMode} active={videoAspectRatio === '9:16'}>
                                    <div className="flex flex-col items-center justify-center leading-tight">
                                        <span>9:16</span>
                                        <span className="text-xs">(세로)</span>
                                    </div>
                                </SettingButton>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-300">해상도</span>
                            <div className="flex gap-2 mt-1">
                                <SettingButton onClick={() => setVideoResolution('1080p')} disabled={isLoading || isMultiImageMode} active={videoResolution === '1080p'}>
                                    <div className="flex flex-col items-center justify-center leading-tight">
                                        <span>1080p</span>
                                        <span className="text-xs">(고화질)</span>
                                    </div>
                                </SettingButton>
                                <SettingButton onClick={() => setVideoResolution('720p')} disabled={isLoading || isMultiImageMode} active={videoResolution === '720p'}>
                                    <div className="flex flex-col items-center justify-center leading-tight">
                                        <span>720p</span>
                                        <span className="text-xs">(표준)</span>
                                    </div>
                                </SettingButton>
                            </div>
                        </div>
                    </div>
                    </div>
                    
                    <button onClick={handleVideoGenerate} disabled={isVideoGenerateDisabled}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-700 hover:to-cyan-600"
                    >
                    <VideoCameraIcon className="w-6 h-6" />
                    <span>비디오 생성</span>
                    </button>
                </>
              )}
            </div>
          </div>

          {/* Right Panel: Display */}
          {mode === 'image' ? (
            <ArtDisplay 
              images={generatedImages} 
              isLoading={isLoading} 
              error={error} 
              loadingMessage={loadingMessage}
              onSave={handleSaveCreation}
            />
          ) : (
            <VideoDisplay
                videoUrl={generatedVideoUrl}
                isLoading={isLoading}
                error={error}
                loadingMessage={loadingMessage}
            />
          )}
        </div>

        <Workspace 
          userName={userName}
          creations={savedCreations}
          onSelectForEditing={handleSelectForEditing}
          onDelete={handleDeleteCreation}
        />
      </main>
    </div>
  );
};

export default App;