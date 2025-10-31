
import React, { useState, useCallback } from 'react';
import { inspirationalPrompts } from '../constants';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { UndoIcon } from './icons/UndoIcon';

interface InspirationDisplayProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

// Helper to shuffle array and get N items
const getShuffledPrompts = (count: number): string[] => {
    const shuffled = [...inspirationalPrompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};


export const InspirationDisplay: React.FC<InspirationDisplayProps> = ({ onSelectPrompt, disabled }) => {
    const [prompts, setPrompts] = useState(() => getShuffledPrompts(4));

    const handleRefresh = useCallback(() => {
        setPrompts(getShuffledPrompts(4));
    }, []);

    return (
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-lg font-semibold text-teal-300">
                    <LightbulbIcon className="w-6 h-6" />
                    <span>영감이 필요하신가요?</span>
                </div>
                <button 
                    onClick={handleRefresh} 
                    disabled={disabled}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"
                    title="새로운 아이디어"
                >
                    <UndoIcon className="w-4 h-4" />
                    <span>새로고침</span>
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {prompts.map((prompt, index) => (
                    <button 
                        key={index}
                        onClick={() => onSelectPrompt(prompt)}
                        disabled={disabled}
                        className="p-3 text-left text-sm text-gray-300 bg-gray-700/50 rounded-md hover:bg-purple-800/50 hover:text-white transition-all duration-200 border border-transparent hover:border-purple-600 disabled:opacity-50"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
};
