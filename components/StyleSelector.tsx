import React from 'react';
import { StyleCard } from './StyleCard';

interface StyleOption {
  id: string;
  label: string;
}

interface StyleSelectorProps {
  styles: StyleOption[];
  selectedStyle: string;
  onSelect: (id: string) => void;
  disabled: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyle, onSelect, disabled }) => {
  return (
    <div>
      <label className="block text-lg font-semibold mb-2 text-teal-300">아트 스타일</label>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {styles.map(style => (
          <StyleCard
            key={style.id}
            id={style.id}
            label={style.label}
            isSelected={selectedStyle === style.id}
            onClick={onSelect}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};