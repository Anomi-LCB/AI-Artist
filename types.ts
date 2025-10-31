

export type ArtStyleId = '클래식' | '모노크롬 잉크' | '파스텔 수채화' | '우키요에' | '아르누보' | '사이버펑크 글리치';
export type QualityId = 'Standard' | 'High';
export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';
export type ImageAspectRatio = '1:1' | '16:9' | '9:16';

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

export interface LightboxContent {
    id: number;
    base64: string;
    type: 'image' | 'video' | 'decomposed';
    createdAt: Date;
    downloadName: string;
    saveData?: any; 
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