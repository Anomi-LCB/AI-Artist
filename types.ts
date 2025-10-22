export type ArtStyleId = '클래식' | '모노크롬 잉크' | '파스텔 수채화' | '우키요에' | '아르누보' | '사이버펑크 글리치';
export type QualityId = 'Standard' | 'High';
export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

export interface ArtStyleOption {
  id: ArtStyleId;
  label: string;
}

export interface QualityOption {
  id: QualityId;
  label: string;
}

export interface WorkspaceCreation {
  id: number;
  base64: string;
  createdAt: Date;
}

export interface AppSettings {
  apiKey: string;
  defaultArtStyle: ArtStyleId;
  defaultQuality: QualityId;
  defaultNumOutputs: number;
}
