import React from 'react';
import { Group, Circle, Rect, Text } from 'react-konva';
import { SteelTargetElement } from '@/types/stage-designer';

interface SteelTargetProps {
  element: SteelTargetElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (element: SteelTargetElement) => void;
}

export function SteelTarget({ element, isSelected, onSelect, onChange }: SteelTargetProps) {
  const { position, rotation, properties } = element;
  const { shape, mustFall } = properties;
  
  const renderShape = () => {
    switch (shape) {
      case 'popper':
        return (
          <>
            {/* Popper body */}
            <Rect
              x={-15}
              y={-40}
              width={30}
              height={60}
              fill="#C0C0C0"
              stroke={isSelected ? '#00FF00' : '#000000'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={[15, 15, 5, 5]}
            />
            {/* Base */}
            <Rect
              x={-20}
              y={20}
              width={40}
              height={10}
              fill="#808080"
              stroke="#000000"
              strokeWidth={1}
            />
          </>
        );
        
      case 'plate':
        return (
          <Circle
            x={0}
            y={0}
            radius={20}
            fill="#C0C0C0"
            stroke={isSelected ? '#00FF00' : '#000000'}
            strokeWidth={isSelected ? 2 : 1}
          />
        );
        
      case 'mini-popper':
        return (
          <>
            {/* Mini popper body */}
            <Rect
              x={-10}
              y={-25}
              width={20}
              height={35}
              fill="#C0C0C0"
              stroke={isSelected ? '#00FF00' : '#000000'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={[10, 10, 3, 3]}
            />
            {/* Base */}
            <Rect
              x={-15}
              y={10}
              width={30}
              height={8}
              fill="#808080"
              stroke="#000000"
              strokeWidth={1}
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
      {renderShape()}
      
      {/* Selection highlight */}
      {isSelected && (
        <Circle
          x={0}
          y={0}
          radius={35}
          stroke="#00FF00"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
        />
      )}
      
      {/* Must fall indicator */}
      {mustFall && (
        <Text
          x={-20}
          y={-50}
          text="MUST\nFALL"
          fontSize={10}
          fontFamily="monospace"
          fill="#FF0000"
          fontStyle="bold"
          width={40}
          align="center"
        />
      )}
    </Group>
  );
}