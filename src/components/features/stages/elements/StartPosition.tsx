import React from 'react';
import { Group, Rect, Path, Text } from 'react-konva';
import { StartPositionElement } from '@/types/stage-designer';

interface StartPositionProps {
  element: StartPositionElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (element: StartPositionElement) => void;
}

export function StartPosition({ element, isSelected, onSelect, onChange }: StartPositionProps) {
  const { position, rotation, properties } = element;
  const { variant } = properties;
  
  const renderVariant = () => {
    switch (variant) {
      case 'box':
        return (
          <>
            <Rect
              x={-30}
              y={-30}
              width={60}
              height={60}
              fill="transparent"
              stroke={isSelected ? '#00FF00' : '#00FF00'}
              strokeWidth={isSelected ? 4 : 3}
              dash={[5, 5]}
            />
            <Text
              x={-30}
              y={-45}
              text="START"
              fontSize={12}
              fontFamily="monospace"
              fill="#00FF00"
              fontStyle="bold"
              width={60}
              align="center"
            />
          </>
        );
        
      case 'feet':
        return (
          <>
            {/* Left foot */}
            <Path
              data="M -15 -20 L -10 0 L -5 5 L -20 5 L -25 0 L -20 -20 Z"
              fill="#00FF00"
              stroke={isSelected ? '#FFFFFF' : '#000000'}
              strokeWidth={isSelected ? 2 : 1}
            />
            {/* Right foot */}
            <Path
              data="M 15 -20 L 20 0 L 25 5 L 10 5 L 5 0 L 10 -20 Z"
              fill="#00FF00"
              stroke={isSelected ? '#FFFFFF' : '#000000'}
              strokeWidth={isSelected ? 2 : 1}
            />
            <Text
              x={-30}
              y={-35}
              text="START"
              fontSize={12}
              fontFamily="monospace"
              fill="#00FF00"
              fontStyle="bold"
              width={60}
              align="center"
            />
          </>
        );
        
      case 'point':
        return (
          <>
            <Path
              data="M 0 -20 L 10 10 L -10 10 Z"
              fill="#00FF00"
              stroke={isSelected ? '#FFFFFF' : '#000000'}
              strokeWidth={isSelected ? 2 : 1}
              closed
            />
            <Text
              x={-30}
              y={-35}
              text="START"
              fontSize={12}
              fontFamily="monospace"
              fill="#00FF00"
              fontStyle="bold"
              width={60}
              align="center"
            />
          </>
        );
    }
  };
  
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
      {renderVariant()}
      
      {/* Selection highlight */}
      {isSelected && (
        <Rect
          x={-40}
          y={-50}
          width={80}
          height={70}
          stroke="#00FF00"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
        />
      )}
    </Group>
  );
}