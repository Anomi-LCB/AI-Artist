

import React from 'react';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface GettingStartedPageProps {
  onStart: () => void;
}

export const GettingStartedPage: React.FC<GettingStartedPageProps> = ({ onStart }) => {
  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-lg text-center panel-glass rounded-2xl p-8 md:p-12 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-300 leading-tight mb-6">
          <span className="block">AI 캐리커쳐</span>
          <span className="block">아티스트</span>
        </h1>

        <p className="mb-10 text-lg text-gray-300 max-w-md mx-auto">
          당신의 상상력을 독특하고 일관된 스타일의 예술로 바꿔보세요.
        </p>

        <button
          onClick={onStart}
          className="group w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
        >
          <span>시작하기</span>
          <ChevronRightIcon className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
      
      {/* Adding keyframes for blob animation */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};