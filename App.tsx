import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageInput } from './components/ImageInput';
import { ArtDisplay } from './components/ArtDisplay';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { generateArt } from './services/geminiService';
import { fileToBase64, base64ToFile } from './utils/fileUtils';
import { Workspace } from './components/Workspace';

const inspirationalPrompts = [
  "별빛 아래에서 책을 읽는 어린 왕자",
  "미래 도시의 골목길을 탐험하는 고양이",
  "숲 속 오두막의 벽난로 앞",
  "구름 위를 항해하는 비행선",
  "마법의 숲에서 길을 잃은 기사",
  "밤하늘의 은하수를 그리는 여우",
  "수정 동굴 속에서 빛나는 꽃",
  "고대 유적을 지키는 기계 골렘",
  "시간을 여행하는 낡은 기차",
  "바다 깊은 곳의 숨겨진 도시",
];

const artStyleOptions = [
  { id: '클래식', label: '클래식' },
  { id: '모노크롬 잉크', label: '모노크롬 잉크' },
  { id: '파스텔 수채화', label: '파스텔 수채화' },
  { id: '우키요에', label: '우키요에' },
  { id: '아르누보', label: '아르누보' },
  { id: '사이버펑크 글리치', label: '사이버펑크' },
];

const qualityOptions = [
  { id: 'Standard', label: '표준' },
  { id: 'High', label: '고품질' },
];


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [baseImageFiles, setBaseImageFiles] = useState<File[]>([]);
  const [referenceImageFiles, setReferenceImageFiles] = useState<File[]>([]);
  
  const [artStyle, setArtStyle] = useState<string>(artStyleOptions[0].id);
  const [quality, setQuality] = useState<string>(qualityOptions[0].id);
  const [numOutputs, setNumOutputs] = useState<number>(1);

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const [savedCreations, setSavedCreations] = useState<string[]>([]);

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const storedCreations = localStorage.getItem('ai-artist-workspace');
      if (storedCreations) {
        setSavedCreations(JSON.parse(storedCreations));
      }
    } catch (error) {
      console.error("Failed to load creations from localStorage", error);
    }
  }, []);

  // Save to localStorage whenever creations change
  useEffect(() => {
    try {
      localStorage.setItem('ai-artist-workspace', JSON.stringify(savedCreations));
    } catch (error) {
      console.error("Failed to save creations to localStorage", error);
    }
  }, [savedCreations]);


  const handleInspireMe = useCallback(() => {
    const randomPrompt = inspirationalPrompts[Math.floor(Math.random() * inspirationalPrompts.length)];
    setPrompt(randomPrompt);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() && baseImageFiles.length === 0 && referenceImageFiles.length === 0) {
      setError('비전을 설명하거나 이미지를 업로드해주세요.');
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
      
      const results = await generateArt(prompt, baseImageUploads, referenceImageUploads, setLoadingMessage, artStyle, numOutputs, quality, negativePrompt);
      setGeneratedImages(results);
      
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [prompt, baseImageFiles, referenceImageFiles, artStyle, numOutputs, quality, negativePrompt]);

  const handleSaveCreation = useCallback((imageToSave: string) => {
    if (imageToSave && !savedCreations.includes(imageToSave)) {
      setSavedCreations(prev => [imageToSave, ...prev]);
    }
  }, [savedCreations]);

  const handleDeleteCreation = useCallback((indexToDelete: number) => {
    setSavedCreations(prev => prev.filter((_, index) => index !== indexToDelete));
  }, []);

  const handleSelectForEditing = useCallback(async (base64: string) => {
    try {
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
  
  const isGenerateButtonDisabled = isLoading || (!prompt.trim() && baseImageFiles.length === 0 && referenceImageFiles.length === 0);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full flex flex-col items-center gap-8">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8">
          {/* Left Panel: Controls */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 p-6 bg-gray-800/50 border border-gray-700 rounded-2xl shadow-lg">
            
            <div className="flex flex-col gap-6 flex-grow">
              
              <div>
                <label className="block text-lg font-semibold mb-2 text-teal-300">아트 스타일</label>
                <div className="flex flex-wrap gap-2">
                  {artStyleOptions.map(option => (
                    <button key={option.id} onClick={() => setArtStyle(option.id)} disabled={isLoading}
                      className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${artStyle === option.id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="prompt" className="block text-lg font-semibold mb-2 text-teal-300">
                  {baseImageFiles.length > 0 ? "이미지 수정하기" : "비전 설명하기"}
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
                <label className="block text-lg font-semibold mb-2 text-teal-300">품질</label>
                <div className="flex flex-wrap gap-2">
                  {qualityOptions.map(option => (
                    <button key={option.id} onClick={() => setQuality(option.id)} disabled={isLoading}
                      className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 border-2 ${quality === option.id ? 'bg-teal-500 border-teal-500 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500 text-gray-300 disabled:opacity-50'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="num-outputs" className="text-sm font-medium text-gray-300">생성 개수:</label>
                <select id="num-outputs" value={numOutputs} onChange={(e) => setNumOutputs(Number(e.target.value))} disabled={isLoading}
                    className="bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                    <option value={1}>1개</option>
                    <option value={3}>3개</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerateButtonDisabled}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>{isLoading ? loadingMessage : '아트 생성'}</span>
            </button>
          </div>

          {/* Right Panel: Display */}
          <ArtDisplay 
            images={generatedImages} 
            isLoading={isLoading} 
            error={error} 
            loadingMessage={loadingMessage}
            onSave={handleSaveCreation} 
          />
        </div>
        
        <Workspace 
          creations={savedCreations} 
          onSelectForEditing={handleSelectForEditing}
          onDelete={handleDeleteCreation} 
        />

      </main>
    </div>
  );
};

export default App;