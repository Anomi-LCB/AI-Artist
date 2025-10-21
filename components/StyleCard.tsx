import React from 'react';

interface StyleCardProps {
  id: string;
  label: string;
  isSelected: boolean;
  onClick: (id: string) => void;
  disabled: boolean;
}

const styleVisuals: { [key: string]: string } = {
  '클래식': 'from-amber-200 via-amber-300 to-amber-500',
  '모노크롬 잉크': 'from-slate-300 via-slate-400 to-slate-600',
  '파스텔 수채화': 'from-pink-300 via-sky-300 to-violet-300',
  '우키요에': 'from-red-400 via-cyan-300 to-amber-200',
  '아르누보': 'from-emerald-400 via-yellow-300 to-emerald-600',
  '사이버펑크 글리치': 'from-fuchsia-600 via-blue-500 to-cyan-400',
};

export const StyleCard: React.FC<StyleCardProps> = ({ id, label, isSelected, onClick, disabled }) => {
  const visualClass = styleVisuals[id] || 'from-gray-500 to-gray-700';

  const ringClass = isSelected ? 'ring-4 ring-purple-500' : 'ring-2 ring-transparent group-hover:ring-purple-400';
  const textClass = isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white';

  return (
    <button
      onClick={() => onClick(id)}
      disabled={disabled}
      aria-pressed={isSelected}
      className={`group relative flex-shrink-0 w-16 h-20 rounded-lg focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${ringClass}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${visualClass} rounded-lg opacity-80 group-hover:opacity-100 transition-opacity`}></div>
      <div className="relative w-full h-full flex items-end justify-center p-1 text-center">
        <span className={`text-xs font-bold leading-tight drop-shadow-md ${textClass}`}>{label}</span>
      </div>
    </button>
  );
};