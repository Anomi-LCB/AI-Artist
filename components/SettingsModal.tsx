import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { apiKey: string }) => void;
  currentApiKey: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentApiKey }) => {
  const [localApiKey, setLocalApiKey] = useState(currentApiKey);

  useEffect(() => {
    setLocalApiKey(currentApiKey);
  }, [currentApiKey, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave({ apiKey: localApiKey });
    onClose();
  };
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-teal-300">설정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="닫기">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="api-key" className="block text-lg font-semibold mb-2 text-gray-200">
              Google Gemini API 키
            </label>
            <input
              id="api-key"
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
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
          {/* 향후 다른 설정을 추가할 수 있는 공간 */}
          <div className="border-t border-gray-700 pt-6">
             <h3 className="text-lg font-semibold text-gray-200 mb-2">기타 설정</h3>
             <p className="text-sm text-gray-500">향후 추가될 설정들이 여기에 표시됩니다.</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
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
