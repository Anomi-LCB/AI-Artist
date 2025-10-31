

import { useState, useCallback, useReducer, useEffect } from 'react';
import { generateArt, generateVideo, expandPrompt, decomposeImage, composeImages } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { ArtStyleId, QualityId, AppSettings, ImageAspectRatio, AspectRatio, Resolution, DecomposedImageElement } from '../types';

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
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleImageGenerate = useCallback(async () => {
    if (!imageGenState.prompt.trim() && baseImageFiles.length === 0 && referenceImageFiles.length === 0) {
      setError('프롬프트를 입력하거나 이미지를 업로드해주세요.');
      return;
    }
    setError(null);
    setGeneratedImages([]);
    setIsLoading(true);
    setIsBaseImageHighlighted(false);
    
    try {
      let finalPrompt = imageGenState.prompt;

      if (imageGenState.isPromptExpansionEnabled && imageGenState.prompt.trim() && !imageGenState.originalPrompt) {
        const expanded = await expandPrompt(imageGenState.prompt, setLoadingMessage);
        finalPrompt = expanded;
        dispatchImageGenState({ type: 'SET_PROMPT_EXPANSION', prompt: expanded, originalPrompt: imageGenState.prompt });
      } else {
        setLoadingMessage('생성을 시작합니다...');
      }

      const baseImageUploads = await Promise.all(baseImageFiles.map(async (file) => ({ mimeType: file.type, data: await fileToBase64(file) })));
      const referenceImageUploads = await Promise.all(referenceImageFiles.map(async (file) => ({ mimeType: file.type, data: await fileToBase64(file) })));
      const results = await generateArt(finalPrompt, baseImageUploads, referenceImageUploads, setLoadingMessage, imageGenState.artStyle, imageGenState.numOutputs, imageGenState.quality, imageGenState.negativePrompt, imageGenState.imageAspectRatio);
      setGeneratedImages(results);
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [imageGenState, baseImageFiles, referenceImageFiles, setIsLoading, setError, setLoadingMessage]);

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
    setGeneratedImages,
    handleImageGenerate,
    isImageGenerateDisabled,
  };
};


// --- VIDEO GENERATION HOOK ---

interface VideoGenState {
    prompt: string;
    referenceImageFiles: File[];
    generatedVideoUrl: string | null;
    aspectRatio: AspectRatio;
    resolution: Resolution;
    isMultiImageMode: boolean;
}

interface UseVideoGenerationProps {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setLoadingMessage: (message: string) => void;
    setGeneratedVideoUrl: (url: string | null) => void;
}

export const useVideoGeneration = ({ isLoading, setIsLoading, setError, setLoadingMessage, setGeneratedVideoUrl }: UseVideoGenerationProps) => {
    const [videoState, setVideoState] = useState<VideoGenState>({
        prompt: '',
        referenceImageFiles: [],
        generatedVideoUrl: null,
        aspectRatio: '16:9',
        resolution: '1080p',
        isMultiImageMode: false,
    });
    const [isVeoKeyReady, setIsVeoKeyReady] = useState(false);
    
    useEffect(() => {
        const multiImage = videoState.referenceImageFiles.length > 1;
        setVideoState(prev => ({
            ...prev,
            isMultiImageMode: multiImage,
            aspectRatio: multiImage ? '16:9' : prev.aspectRatio,
            resolution: multiImage ? '720p' : prev.resolution,
        }));
    }, [videoState.referenceImageFiles.length]);

    const handleVideoGenerate = useCallback(async () => {
        if (!isVeoKeyReady) {
            setError('비디오 생성을 계속하려면 VEO API 키를 선택해야 합니다.');
            return;
        }
        if (videoState.referenceImageFiles.length === 0 && !videoState.prompt.trim()) {
            setError('비디오를 생성하려면 참고 이미지를 업로드하거나 시나리오를 입력해야 합니다.');
            return;
        }
        setError(null);
        setGeneratedVideoUrl(null);
        setIsLoading(true);
        setLoadingMessage('생성을 시작합니다...');
        try {
            const imageUploads = await Promise.all(videoState.referenceImageFiles.map(async (file) => ({ mimeType: file.type, data: await fileToBase64(file) })));
            const finalPrompt = videoState.prompt || 'Bring this image to life, animating it creatively.';

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
    }, [isVeoKeyReady, videoState, setIsLoading, setError, setLoadingMessage, setGeneratedVideoUrl]);

    const isVideoGenerateDisabled = isLoading || !isVeoKeyReady || (videoState.referenceImageFiles.length === 0 && !videoState.prompt.trim());

    return {
        videoState,
        setVideoState,
        handleVideoGenerate,
        isVeoKeyReady,
        setIsVeoKeyReady,
        isVideoGenerateDisabled,
    }
};

// --- IMAGE DECOMPOSITION HOOK ---

interface DecompositionState {
  inputFile: File | null;
  decomposedElements: DecomposedImageElement[];
}

interface UseImageDecompositionProps {
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLoadingMessage: (message: string) => void;
}

export const useImageDecomposition = ({ setIsLoading, setError, setLoadingMessage }: UseImageDecompositionProps) => {
  const [decompositionState, setDecompositionState] = useState<DecompositionState>({
    inputFile: null,
    decomposedElements: [],
  });

  const setDecompositionInputFile = (file: File | null) => {
    setDecompositionState({ inputFile: file, decomposedElements: [] });
    setError(null);
  };

  const handleDecompose = useCallback(async () => {
    if (!decompositionState.inputFile) {
      setError('분해할 이미지를 업로드해주세요.');
      return;
    }
    setError(null);
    setDecompositionState(prev => ({ ...prev, decomposedElements: [] }));
    setIsLoading(true);
    setLoadingMessage('분해 작업을 준비 중입니다...');

    try {
      const baseImage = {
        mimeType: decompositionState.inputFile.type,
        data: await fileToBase64(decompositionState.inputFile),
      };

      const elements = await decomposeImage(baseImage, setLoadingMessage);
      setDecompositionState(prev => ({ ...prev, decomposedElements: elements }));

    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
      setDecompositionState(prev => ({ ...prev, decomposedElements: [] }));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [decompositionState.inputFile, setIsLoading, setError, setLoadingMessage]);

  const isDecompositionDisabled = !decompositionState.inputFile;

  return {
    decompositionState,
    setDecompositionInputFile,
    handleDecompose,
    isDecompositionDisabled,
  };
};

// --- IMAGE COMPOSITION HOOK ---

interface CompositionState {
  inputFiles: File[];
  composedImage: string | null;
}

interface UseImageCompositionProps {
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLoadingMessage: (message: string) => void;
}

export const useImageComposition = ({ setIsLoading, setError, setLoadingMessage }: UseImageCompositionProps) => {
  const [compositionState, setCompositionState] = useState<CompositionState>({
    inputFiles: [],
    composedImage: null,
  });

  const setCompositionInputFiles = (files: File[]) => {
    setCompositionState({ inputFiles: files, composedImage: null });
    setError(null);
  };

  const handleCompose = useCallback(async () => {
    if (compositionState.inputFiles.length < 2) {
      setError('합성하려면 2개 이상의 이미지를 업로드해주세요.');
      return;
    }
    setError(null);
    setCompositionState(prev => ({ ...prev, composedImage: null }));
    setIsLoading(true);
    setLoadingMessage('합성 작업을 준비 중입니다...');

    try {
      const imageUploads = await Promise.all(
        compositionState.inputFiles.map(async (file) => ({
          mimeType: file.type,
          data: await fileToBase64(file),
        }))
      );

      const [result] = await composeImages(imageUploads, setLoadingMessage);
      
      if (result) {
        setCompositionState(prev => ({ ...prev, composedImage: result }));
      } else {
        throw new Error('AI가 합성된 이미지를 반환하지 않았습니다.');
      }

    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
      setCompositionState(prev => ({ ...prev, composedImage: null }));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [compositionState.inputFiles, setIsLoading, setError, setLoadingMessage]);

  const isCompositionDisabled = compositionState.inputFiles.length < 2;

  return {
    compositionState,
    setCompositionInputFiles,
    handleCompose,
    isCompositionDisabled,
  };
};
