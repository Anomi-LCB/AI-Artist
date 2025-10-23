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
  const selectedIndex = styles.findIndex(style => style.id === selectedStyle);

  // Card width (w-14 = 3.5rem = 56px)
  const cardWidth = 56;
  // Gap between cards (gap-3 = 0.75rem = 12px)
  const gapWidth = 12;
  // The width of the indicator itself
  const indicatorWidth = 24;

  // The total width of one item slot (card + gap)
  const itemSlotWidth = cardWidth + gapWidth;
  // Calculate offset to center the indicator under the card: (card width - indicator width) / 2
  const indicatorOffset = (cardWidth - indicatorWidth) / 2;

  // Calculate the final transform value
  const transformX = selectedIndex * itemSlotWidth + indicatorOffset;

  return (
    <div>
      <label className="block text-lg font-semibold mb-2 text-teal-300">아트 스타일</label>
      <div className="relative pb-2"> {/* Add padding to container for the indicator */}
        <div className="flex flex-nowrap gap-3 overflow-x-auto">
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
        {/* Animated indicator */}
        {selectedIndex >= 0 && (
            <div
                className="absolute h-1 bg-purple-500 rounded-full transition-transform duration-300 ease-in-out"
                style={{
                    width: `${indicatorWidth}px`,
                    transform: `translateX(${transformX}px)`,
                    bottom: 0, // Position at the bottom of the padded container
                }}
                aria-hidden="true"
            />
        )}
      </div>
    </div>
  );
};
