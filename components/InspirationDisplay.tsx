

import React, { useMemo } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { inspirationalPrompts } from '../constants';

interface InspirationDisplayProps {
  onSelect: (prompt: string) => void;
  onClose: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const InspirationDisplay: React.FC<InspirationDisplayProps> = ({ onSelect, onClose }) => {
  const displayedPrompts = useMemo(() => {
    return shuffleArray(inspirationalPrompts).slice(0, 5);
  }, []);

  return (
    <div className="absolute top-full left-0 z-20 mt-2 w-full" onClick={(e) => e.stopPropagation()}>
      <div className="panel-glass rounded-lg p-4 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h4 className="flex items-center gap-2 font-semibold text-teal-300">
            <SparklesIcon className="w-5 h-5" />
            <span>프롬프트 아이디어</span>
          </h4>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {displayedPrompts.map((prompt, index) => (
            <li key={index}>
              <button
                onClick={() => onSelect(prompt)}
                className="w-full text-left text-sm text-gray-300 hover:text-purple-400 p-2 rounded-md hover:bg-white/5 transition-colors"
              >
                {prompt}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};