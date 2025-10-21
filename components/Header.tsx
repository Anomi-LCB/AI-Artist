import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="w-full text-center py-6 md:py-8 border-b border-purple-900/50 bg-gray-900/50 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-4">
        <SparklesIcon className="w-10 h-10 text-purple-400" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-300">
          AI 캐리커쳐 아티스트
        </h1>
      </div>
      <p className="mt-3 text-lg text-gray-400">시그니처 스타일을 가진 아티스트.</p>
    </header>
  );
};