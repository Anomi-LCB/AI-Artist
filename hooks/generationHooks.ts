import { useState, useCallback, useReducer, useEffect } from 'react';
import { generateArt, generateVideo, expandPrompt } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { ArtStyleId, QualityId, AppSettings, ImageAspectRatio, AspectRatio, Resolution } from '../types';
import { inspirationalPrompts } from '../constants';

// --- IMAGE GENERATION HOOK ---

interface ImageGenState {
  prompt: string;
  originalPrompt: string;
  negativePrompt: string;
  artStyle: ArtStyleId;
  quality: QualityId;
  imageAspectRatio: ImageAspectRatio;
  numOutputs: number;
  isPromptExpansionEnabled: boolean;
}

type ImageGenAction =
  | { type: 'SET_FIELD'; field: keyof ImageGenState; value: any }
  | { type: 'SET_PROMPT_EXPANSION'; prompt: string; originalPrompt: string }
  | { type: 'REVERT_PROMPT' }
  | { type: 'RESET_TO_DEFAULTS'; defaults: AppSettings };

const imageGenerationReducer = (state: ImageGenState, action: ImageGenAction): ImageGenState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_PROMPT_EXPANSION':
      return { ...state, prompt: action.prompt, originalPrompt: action.originalPrompt };
    case 'REVERT_PROMPT':
      return { ...state, prompt: state.originalPrompt, originalPrompt: '' };
    case 'RESET_TO_DEFAULTS':
      return {
        ...state,
        artStyle: action.defaults.defaultArtStyle,
        quality: action.defaults.defaultQuality,
        numOutputs: action.defaults.defaultNumOutputs,
        imageAspectRatio: action.defaults.defaultImageAspectRatio,
      };
    default:
      return state;
  }
};

interface UseImageGenerationProps {
  appSettings: AppSettings;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLoadingMessage: (message: string) => void;
  // FIX: Removed setGeneratedImages prop to make the hook self-contained
}

export const useImageGeneration = ({ appSettings, setIsLoading, setError, setLoadingMessage }: UseImageGenerationProps) => {
  const initialImageGenState: ImageGenState = {
    prompt: '',
    originalPrompt: '',
    negativePrompt: '',
    artStyle: appSettings.defaultArtStyle,
    quality: appSettings.defaultQuality,
    imageAspectRatio: appSettings.defaultImageAspectRatio,
    numOutputs: appSettings.defaultNumOutputs,
    isPromptExpansionEnabled: false,
  };

  const [imageGenState, dispatchImageGenState] = useReducer(imageGenerationReducer, initialImageGenState);
  const [baseImageFiles, setBaseImageFiles] = useState<File[]>([]);
  const [isBaseImageHighlighted, setIsBaseImageHighlighted] = useState<boolean>(false);
  const [referenceImageFiles, setReferenceImageFiles] = useState<File[]>([]);
  const [generatedImages, _setGeneratedImages] = useState<string[]>([]);

  const handlePromptExpansion = useCallback(async () => {
    if (!imageGenState.prompt.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      const expanded = await expandPrompt(imageGenState.prompt, setLoadingMessage);
      dispatchImageGenState({ type: 'SET_PROMPT_EXPANSION', prompt: expanded, originalPrompt: imageGenState.prompt });
    } catch (err) {
      setError((err as Error).message || '프롬프트 확장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [imageGenState.prompt, setIsLoading, setError, setLoadingMessage]);

  const handleImageGenerate = useCallback(async () => {
    if (!imageGenState.prompt.trim() && baseImageFiles.length === 0 && referenceImageFiles.length === 0) {
      setError('프롬프트를 입력하거나 이미지를 업로드해주세요.');
      return;
    }
    setError(null);
    // FIX: Use internal state setter `_setGeneratedImages`
    _setGeneratedImages([]);
    setIsLoading(true);
    setIsBaseImageHighlighted(false);
    setLoadingMessage('생성을 시작합니다...');
    try {
      const baseImageUploads = await Promise.all(baseImageFiles.map(async (file) => ({ mimeType: file.type, data: await fileToBase64(file) })));
      const referenceImageUploads = await Promise.all(referenceImageFiles.map(async (file) => ({ mimeType: file.type, data: await fileToBase64(file) })));
      const results = await generateArt(imageGenState.prompt, baseImageUploads, referenceImageUploads, setLoadingMessage, imageGenState.artStyle, imageGenState.numOutputs, imageGenState.quality, imageGenState.negativePrompt, imageGenState.imageAspectRatio);
      // FIX: Use internal state setter `_setGeneratedImages`
      _setGeneratedImages(results);
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
    // FIX: Update dependency array to use `_setGeneratedImages`
  }, [imageGenState, baseImageFiles, referenceImageFiles, setIsLoading, setError, setLoadingMessage, _setGeneratedImages]);

  const isImageGenerateDisabled = !imageGenState.prompt.trim() && baseImageFiles.length === 0 && referenceImageFiles.length === 0;

  return {
    imageGenState,
    dispatchImageGenState,
    baseImageFiles,
    setBaseImageFiles,
    isBaseImageHighlighted,
    setIsBaseImageHighlighted,
    referenceImageFiles,
    setReferenceImageFiles,
    generatedImages,
    handleImageGenerate,
    handlePromptExpansion,
    isImageGenerateDisabled,
    setGeneratedImages: _setGeneratedImages
  };
};


// --- VIDEO GENERATION HOOK ---

interface VideoGenState {
    prompt: string;
    backgroundImageFile: File[];
    characterImageFile: File[];
    otherImageFile: File[];
    otherImageComment: string;
    generatedVideoUrl: string | null;
    aspectRatio: AspectRatio;
    resolution: Resolution;
    isMultiImageMode: boolean;
}

interface UseVideoGenerationProps {
    // FIX: Add isLoading to props
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setLoadingMessage: (message: string) => void;
    setGeneratedVideoUrl: (url: string | null) => void;
}

export const useVideoGeneration = ({ isLoading, setIsLoading, setError, setLoadingMessage, setGeneratedVideoUrl }: UseVideoGenerationProps) => {
    const [videoState, setVideoState] = useState<VideoGenState>({
        prompt: '',
        backgroundImageFile: [],
        characterImageFile: [],
        otherImageFile: [],
        otherImageComment: '',
        generatedVideoUrl: null,
        aspectRatio: '16:9',
        resolution: '1080p',
        isMultiImageMode: false,
    });
    const [isVeoKeyReady, setIsVeoKeyReady] = useState(false);
    
    const allVideoImageFiles = [...videoState.backgroundImageFile, ...videoState.characterImageFile, ...videoState.otherImageFile];

    useEffect(() => {
        const multiImage = allVideoImageFiles.length > 1;
        setVideoState(prev => ({
            ...prev,
            isMultiImageMode: multiImage,
            aspectRatio: multiImage ? '16:9' : prev.aspectRatio,
            resolution: multiImage ? '720p' : prev.resolution,
        }));
    }, [allVideoImageFiles.length]);

    const handleVideoGenerate = useCallback(async () => {
        if (!isVeoKeyReady) {
            setError('비디오 생성을 계속하려면 VEO API 키를 선택해야 합니다.');
            return;
        }
        if (allVideoImageFiles.length === 0 && !videoState.prompt.trim()) {
            setError('비디오를 생성하려면 참고 이미지를 업로드하거나 시나리오를 입력해야 합니다.');
            return;
        }
        setError(null);
        setGeneratedVideoUrl(null);
        setIsLoading(true);
        setLoadingMessage('생성을 시작합니다...');
        try {
            const imageUploads = await Promise.all(allVideoImageFiles.map(async (file) => ({ mimeType: file.type, data: await fileToBase64(file) })));
            let finalPrompt: string;

            if (videoState.isMultiImageMode) {
              let promptSegments: string[] = [];
              if (videoState.characterImageFile.length > 0) promptSegments.push("featuring the provided character image(s) as the main character");
              if (videoState.backgroundImageFile.length > 0) promptSegments.push("set within the provided background image(s)");
              if (videoState.otherImageFile.length > 0) {
                  const comment = videoState.otherImageComment.trim() ? ` (noted as: '${videoState.otherImageComment.trim()}')` : '';
                  promptSegments.push(`utilizing elements from the other provided image(s)${comment}`);
              }
              const imageDescription = promptSegments.length > 0 ? `Animate a video based on the provided images. ` : '';
              const userScenario = videoState.prompt || 'Animate these images together creatively.';
              finalPrompt = `${imageDescription}The video's narrative should follow this scenario: "${userScenario}"`;
            } else {
                finalPrompt = videoState.prompt || 'Bring this image to life.';
            }

            const resultBlob = await generateVideo(finalPrompt, imageUploads, videoState.aspectRatio, videoState.resolution, setLoadingMessage);
            const videoDataUrl = URL.createObjectURL(resultBlob);
            setGeneratedVideoUrl(videoDataUrl);
        } catch (err: any) {
            if (err.message.includes("다른 키를 선택해주세요")) {
              setIsVeoKeyReady(false);
            }
            setError(err.message || '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [isVeoKeyReady, allVideoImageFiles, videoState, setIsLoading, setError, setLoadingMessage, setGeneratedVideoUrl]);

    // FIX: Use `isLoading` from props to correctly calculate disabled state.
    const isVideoGenerateDisabled = isLoading || !isVeoKeyReady || (allVideoImageFiles.length === 0 && !videoState.prompt.trim());

    return {
        videoState,
        setVideoState,
        handleVideoGenerate,
        isVeoKeyReady,
        setIsVeoKeyReady,
        isVideoGenerateDisabled,
    }
};