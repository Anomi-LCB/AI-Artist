
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface GettingStartedPageProps {
  onStart: () => void;
}

export const GettingStartedPage: React.FC<GettingStartedPageProps> = ({ onStart }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-2xl text-center bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl shadow-purple-900/20 p-8 md:p-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-300 mb-4 pt-12">
          AI 캐리커쳐 아티스트에 오신 것을 환영합니다!
        </h1>
        <p className="mb-8 text-lg text-gray-300">
          당신만의 시그니처 스타일을 가진 AI 아티스트가 당신의 아이디어를 현실로 만들어 드립니다. 텍스트 프롬프트나 기존 이미지를 사용하여 아티스트의 독특한 해석을 확인해 보세요.
        </p>
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-600 mb-8 text-left space-y-4">
            <h2 className="text-xl font-semibold text-teal-300 text-center">주요 기능</h2>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li><strong>일관된 아트 스타일:</strong> 클래식, 사이버펑크 등 다양한 변형이 가능한 독특한 시그니처 스타일.</li>
                <li><strong>이미지 리메이크 & 편집:</strong> 기존 이미지를 업로드하여 아티스트의 스타일로 재창조하거나 특정 수정을 요청하세요.</li>
                <li><strong>비디오 생성 (VEO):</strong> 이미지를 기반으로 짧은 애니메이션 비디오를 만들어보세요.</li>
                <li><strong>개인 워크스페이스:</strong> 마음에 드는 창작물을 저장하고 언제든지 다시 편집하거나 다운로드하세요.</li>
            </ul>
        </div>
        <button
          onClick={onStart}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <SparklesIcon className="w-6 h-6" />
          <span>창작 시작하기</span>
        </button>
      </div>
    </div>
  );
};
