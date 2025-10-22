import React from 'react';
import { StyleCard } from './StyleCard';
import { ArtStyleId, ArtStyleOption } from '../types';

interface StyleSelectorProps {
  styles: ArtStyleOption[];
  selectedStyle: ArtStyleId;
  onSelect: (id: ArtStyleId) => void;
  disabled: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyle, onSelect, disabled }) => {
  return (
    <div>
      <label className="block text-lg font-semibold mb-2 text-teal-300">아트 스타일</label>
      <div className="flex flex-wrap justify-center gap-2">
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