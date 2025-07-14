import React from 'react';
import { Line, Group, Circle } from 'react-konva';
import { FaultLineElement } from '@/types/stage-designer';

interface FaultLineProps {
  element: FaultLineElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (element: FaultLineElement) => void;
}

export function FaultLine({ element, isSelected, onSelect, onChange }: FaultLineProps) {
  const { position, properties } = element;
  const { points, style } = properties;
  
  // Convert points to flat array for Konva
  const flatPoints = points.reduce<number[]>((acc, point) => {
    acc.push(point.x, point.y);
    return acc;
  }, []);
  
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
            points: points.map(p => ({
              x: p.x + deltaX,
              y: p.y + deltaY,
            })),
          },
        });
        
        // Reset position after updating points
        node.position({ x: 0, y: 0 });
      }}
    >
      {/* Main fault line */}
      <Line
        points={flatPoints}
        stroke={isSelected ? '#00FF00' : '#FF0000'}
        strokeWidth={isSelected ? 4 : 3}
        dash={style === 'dashed' ? [10, 5] : undefined}
        lineCap="round"
        lineJoin="round"
        shadowBlur={isSelected ? 10 : 0}
        shadowColor="#00FF00"
      />
      
      {/* End markers */}
      {points.length >= 2 && (
        <>
          <Circle
            x={points[0].x}
            y={points[0].y}
            radius={4}
            fill="#FF0000"
            stroke="#FFFFFF"
            strokeWidth={1}
          />
          <Circle
            x={points[points.length - 1].x}
            y={points[points.length - 1].y}
            radius={4}
            fill="#FF0000"
            stroke="#FFFFFF"
            strokeWidth={1}
          />
        </>
      )}
      
      {/* Control points when selected */}
      {isSelected && points.map((point, index) => (
        <Circle
          key={index}
          x={point.x}
          y={point.y}
          radius={6}
          fill="#00FF00"
          stroke="#FFFFFF"
          strokeWidth={2}
          draggable
          onDragEnd={(e) => {
            const newPoints = [...points];
            newPoints[index] = {
              x: e.target.x(),
              y: e.target.y(),
            };
            onChange({
              ...element,
              properties: {
                ...properties,
                points: newPoints,
              },
            });
          }}
        />
      ))}
    </Group>
  );
}