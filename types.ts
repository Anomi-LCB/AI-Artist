

export type ArtStyleId = '클래식' | '모노크롬 잉크' | '파스텔 수채화' | '우키요에' | '아르누보' | '사이버펑크 글리치' | '카툰';
export type QualityId = 'Standard' | 'High';
export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';
export type ImageAspectRatio = '1:1' | '16:9' | '9:16';
export type Mode = 'image' | 'composition' | 'video' | 'decomposition' | 'edit';
export type EditSubMode = 'remove-bg' | 'style-remix' | 'resize' | 'colorize';
export type ResizeOption = '2x' | '4x' | 'hd' | '0.5x' | '0.25x';


export interface ArtStyleOption {
  id: ArtStyleId;
  label: string;
}

export interface QualityOption {
  id: QualityId;
  label: string;
}

export interface ImageAspectRatioOption {
  id: ImageAspectRatio;
  label: string;
}

export interface WorkspaceCreation {
  id: number;
  base64: string;
  type: 'image' | 'video';
  createdAt: Date;
}

export interface AppSettings {
  defaultArtStyle: ArtStyleId;
  defaultQuality: QualityId;
  defaultNumOutputs: number;
  defaultImageAspectRatio: ImageAspectRatio;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface DecomposedImageElement {
  name: string;
  base64: string;
}

export interface DecomposedLayer {
  id: number;
  name: string;
  base64: string;
  isVisible: boolean;
}

export interface LightboxContent {
    id: number;
    base64: string;
    type: 'image' | 'video' | 'decomposed';
    createdAt: Date;
    downloadName: string;
    saveData?: any; 
}

export interface EditState {
  inputFile: File | null;
  resultImage: string | null;
  activeEditor: EditSubMode | null;
  resizeOption: ResizeOption;
  remixStyle: ArtStyleId;
}


// AI Studio 연동을 위한 전역 타입 선언
declare global {
  export interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}