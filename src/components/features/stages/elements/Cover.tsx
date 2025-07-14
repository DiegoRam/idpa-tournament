import React from 'react';
import { Group, Rect } from 'react-konva';
import { CoverElement } from '@/types/stage-designer';

interface CoverProps {
  element: CoverElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (element: CoverElement) => void;
}

export function Cover({ element, isSelected, onSelect, onChange }: CoverProps) {
  const { position, rotation, type, properties } = element;
  const { width, height } = properties;
  
  // Colors based on cover type
  const fillColor = type === 'hard-cover' ? '#000000' : '#FFFFFF';
  const strokeColor = type === 'hard-cover' ? '#FFFFFF' : '#000000';
  
  return (
    <Group
      x={position.x}
      y={position.y}
      rotation={rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        const node = e.target;
        onChange({
          ...element,
          position: {
            x: node.x(),
            y: node.y(),
          },
        });
      }}
    >
      {/* Main cover rectangle */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill={fillColor}
        stroke={isSelected ? '#00FF00' : strokeColor}
        strokeWidth={isSelected ? 3 : 2}
        shadowBlur={isSelected ? 10 : 0}
        shadowColor="#00FF00"
      />
      
      {/* Pattern for hard cover */}
      {type === 'hard-cover' && (
        <>
          {/* Diagonal lines pattern */}
          {Array.from({ length: Math.ceil((width + height) / 20) }).map((_, i) => (
            <Rect
              key={i}
              x={-width / 2 + i * 20 - height}
              y={-height / 2}
              width={2}
              height={height * 2}
              fill="#333333"
              rotation={45}
            />
          ))}
        </>
      )}
      
      {/* Pattern for soft cover */}
      {type === 'soft-cover' && (
        <>
          {/* Dot pattern */}
          {Array.from({ length: Math.ceil(width / 15) }).map((_, i) =>
            Array.from({ length: Math.ceil(height / 15) }).map((_, j) => (
              <Rect
                key={`${i}-${j}`}
                x={-width / 2 + 7.5 + i * 15}
                y={-height / 2 + 7.5 + j * 15}
                width={3}
                height={3}
                fill="#CCCCCC"
              />
            ))
          )}
        </>
      )}
    </Group>
  );
}