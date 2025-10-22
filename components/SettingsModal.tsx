import React, { useState, useEffect } from 'react';
import { AppSettings, ArtStyleId, QualityId } from '../types';
import { artStyleOptions, qualityOptions } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  currentSettings: AppSettings;
  onClearWorkspace: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings, onClearWorkspace }) => {
  const [localSettings, setLocalSettings] = useState(currentSettings);

  useEffect(() => {
    setLocalSettings(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const handleInputChange = (field: keyof AppSettings, value: string | number) => {
    setLocalSettings(prev => ({...prev, [field]: value}));
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700 m-4 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-teal-300">설정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="닫기">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6 overflow-y-auto pr-2 -mr-2">
          <div>
            <label htmlFor="api-key" className="block text-lg font-semibold mb-2 text-gray-200">
              Google Gemini API 키
            </label>
            <input
              id="api-key"
              type="password"
              value={localSettings.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              placeholder="API 키를 여기에 붙여넣으세요"
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
            <p className="text-sm text-gray-400 mt-2">
              API 키는 브라우저에 로컬로 저장됩니다. 
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline ml-1"
              >
                여기서 키를 발급받으세요.
              </a>
            </p>
          </div>
          
          <div className="border-t border-gray-700 pt-6">
             <h3 className="text-lg font-semibold text-gray-200 mb-4">기본 생성 설정</h3>
             <div className="space-y-4">
                <div>
                    <label htmlFor="default-art-style" className="block text-sm font-medium text-gray-300 mb-1">기본 아트 스타일</label>
                    <select
                        id="default-art-style"
                        value={localSettings.defaultArtStyle}
                        onChange={(e) => handleInputChange('defaultArtStyle', e.target.value as ArtStyleId)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-purple-500 transition"
                    >
                        {artStyleOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.id}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="default-quality" className="block text-sm font-medium text-gray-300 mb-1">기본 품질</label>
                    <select
                        id="default-quality"
                        value={localSettings.defaultQuality}
                        onChange={(e) => handleInputChange('defaultQuality', e.target.value as QualityId)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-purple-500 transition"
                    >
                        {qualityOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="default-num-outputs" className="block text-sm font-medium text-gray-300 mb-1">기본 생성 개수</label>
                    <select
                        id="default-num-outputs"
                        value={localSettings.defaultNumOutputs}
                        onChange={(e) => handleInputChange('defaultNumOutputs', Number(e.target.value))}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-purple-500 transition"
                    >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                    </select>
                </div>
             </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">위험 구역</h3>
            <p className="text-sm text-gray-400 mb-4">
              이 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
            </p>
            <button
              onClick={onClearWorkspace}
              className="w-full px-4 py-2 font-bold text-white bg-red-800 rounded-lg hover:bg-red-700 transition-colors border border-red-600"
            >
              워크스페이스 비우기
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 font-bold text-white bg-gradient-to-r from-purple-600 to-teal-500 rounded-lg hover:from-purple-700 hover:to-teal-600 transition-all"
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};
