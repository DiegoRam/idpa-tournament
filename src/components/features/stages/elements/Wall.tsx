import React from 'react';
import { Line, Group } from 'react-konva';
import { WallElement } from '@/types/stage-designer';

interface WallProps {
  element: WallElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (element: WallElement) => void;
}

export function Wall({ element, isSelected, onSelect, onChange }: WallProps) {
  const { position, properties } = element;
  const { startPoint, endPoint, thickness } = properties;
  
  // Calculate wall points based on thickness
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const perpX = (-dy / length) * (thickness / 2);
  const perpY = (dx / length) * (thickness / 2);
  
  const points = [
    startPoint.x + perpX,
    startPoint.y + perpY,
    endPoint.x + perpX,
    endPoint.y + perpY,
    endPoint.x - perpX,
    endPoint.y - perpY,
    startPoint.x - perpX,
    startPoint.y - perpY,
  ];
  
  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        const node = e.target;
        const deltaX = node.x() - position.x;
        const deltaY = node.y() - position.y;
        
        onChange({
          ...element,
          position: {
            x: node.x(),
            y: node.y(),
          },
          properties: {
            ...properties,
            startPoint: {
              x: startPoint.x + deltaX,
              y: startPoint.y + deltaY,
            },
            endPoint: {
              x: endPoint.x + deltaX,
              y: endPoint.y + deltaY,
            },
          },
        });
        
        // Reset position after updating points
        node.position({ x: 0, y: 0 });
      }}
    >
      {/* Wall body */}
      <Line
        points={points}
        closed
        fill="#8B4513"
        stroke={isSelected ? '#00FF00' : '#654321'}
        strokeWidth={isSelected ? 3 : 2}
        shadowBlur={isSelected ? 10 : 0}
        shadowColor="#00FF00"
      />
      
      {/* Wood grain pattern */}
      {Array.from({ length: Math.floor(length / 20) }).map((_, i) => (
        <Line
          key={i}
          points={[
            startPoint.x + (dx / length) * i * 20,
            startPoint.y + (dy / length) * i * 20,
            startPoint.x + (dx / length) * (i * 20 + 15),
            startPoint.y + (dy / length) * (i * 20 + 15),
          ]}
          stroke="#654321"
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}
    </Group>
  );
}