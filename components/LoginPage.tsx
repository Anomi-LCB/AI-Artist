
import React, { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess: (name: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLoginSuccess(name.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-md text-center bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl shadow-purple-900/20 p-8 animate-fade-in">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-300">
            AI 캐리커쳐 아티스트
          </h1>
        </div>
        <p className="mb-8 text-lg text-gray-400 leading-relaxed">
          시작하기 전에, 당신의 워크스페이스에
          <br />
          사용할 이름을 알려주세요.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full p-3 mb-6 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-center"
            required
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>내 워크스페이스 시작하기</span>
          </button>
        </form>
        <p className="mt-6 text-xs text-gray-500">
          입력한 이름은 이 브라우저에만 저장됩니다.
        </p>
      </div>
    </div>
  );
};
