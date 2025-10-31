
import React, { useState, useEffect, useRef } from 'react';
import { SettingsIcon } from './icons/SettingsIcon';
import { UserIcon } from './icons/UserIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
    onSettingsClick: () => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSettingsClick = () => {
    onSettingsClick();
    setIsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        {/* Left side: Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-300">
            AI 캐리커쳐 아티스트
          </h1>
        </div>

        {/* Right side: User info and settings */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* User info dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <UserIcon className="w-6 h-6" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 panel-glass rounded-md shadow-lg py-1 animate-fade-in-fast">
                <button
                  onClick={handleSettingsClick}
                  className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span>설정</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <LogoutIcon className="w-5 h-5" />
                  <span>로그아웃</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};