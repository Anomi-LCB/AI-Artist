
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface HeaderProps {
    onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="relative w-full text-center py-6 md:py-8 border-b border-purple-900/50 bg-gray-900/50 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-4">
        <SparklesIcon className="w-8 h-8 text-purple-400" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-300">
          AI 캐리커쳐 아티스트
        </h1>
      </div>
      <p className="mt-3 text-lg text-gray-400">시그니처 스타일을 가진 아티스트.</p>
      <button 
        onClick={onSettingsClick}
        title="설정"
        className="absolute top-1/2 right-4 -translate-y-1/2 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
        >
        <SettingsIcon className="w-6 h-6" />
      </button>
    </header>
  );
};
