
import React from 'react';
import { ArtStyleId } from '../types';

interface StyleCardProps {
  id: ArtStyleId;
  label: string;
  isSelected: boolean;
  onClick: (id: ArtStyleId) => void;
  disabled: boolean;
}

const styleVisuals: { [key in ArtStyleId]: string } = {
  '클래식': 'from-amber-200 via-amber-300 to-amber-500',
  '모노크롬 잉크': 'from-slate-300 via-slate-400 to-slate-600',
  '파스텔 수채화': 'from-pink-300 via-sky-300 to-violet-300',
  '우키요에': 'from-red-400 via-cyan-300 to-amber-200',
  '아르누보': 'from-emerald-400 via-yellow-300 to-emerald-600',
  '사이버펑크 글리치': 'from-fuchsia-600 via-blue-500 to-cyan-400',
};

export const StyleCard: React.FC<StyleCardProps> = ({ id, label, isSelected, onClick, disabled }) => {
  const visualClass = styleVisuals[id] || 'from-gray-500 to-gray-700';
  const textClass = isSelected ? 'text-white' : 'text-gray-200';
  const gradientOpacityClass = isSelected ? 'opacity-100' : 'opacity-80 group-hover:opacity-100';

  return (
    <button
      onClick={() => onClick(id)}
      disabled={disabled}
      aria-pressed={isSelected}
      title={id}
      className={`
        group relative p-0.5 flex-shrink-0 w-14 h-16 rounded-lg focus:outline-none 
        transition-all duration-300 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isSelected ? 'bg-gradient-to-br from-purple-500 to-teal-400' : 'bg-transparent'}
      `}
    >
      <div className="relative w-full h-full bg-gray-800 rounded-[5px] flex items-center justify-center p-1 text-center transition-colors group-hover:bg-gray-700">
        <div className={`absolute inset-0 bg-gradient-to-br ${visualClass} rounded-[5px] ${gradientOpacityClass} transition-opacity duration-300`}></div>
        <span className={`relative text-xs font-bold leading-tight drop-shadow-md whitespace-pre-line ${textClass}`}>{label}</span>
      </div>
    </button>
  );
};
