import React from 'react';
import { Group, Rect, Circle, Text, Line } from 'react-konva';
import { IdpaTargetElement } from '@/types/stage-designer';

interface IdpaTargetProps {
  element: IdpaTargetElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (element: IdpaTargetElement) => void;
  draggable?: boolean;
}

export function IdpaTarget({ element, isSelected, onSelect, onChange }: IdpaTargetProps) {
  const { position, rotation, properties } = element;
  const { targetNumber, isThreat, hardCoverZones = [] } = properties;
  
  // IDPA target dimensions (in pixels)
  const WIDTH = 45;
  const HEIGHT = 75;
  const HEAD_RADIUS = 10;
  const BODY_WIDTH = 35;
  const BODY_HEIGHT = 40;
  
  // Colors
  const targetColor = isThreat ? '#D4A574' : '#FFFFFF'; // Tan for threat, white for non-threat
  const zoneColors = {
    '-0': '#D4A574',
    '-1': '#8B7355',
    '-3': '#5D4E37',
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
      {/* Target outline */}
      <Rect
        x={-WIDTH / 2}
        y={-HEIGHT / 2}
        width={WIDTH}
        height={HEIGHT}
        fill={targetColor}
        stroke={isSelected ? '#00FF00' : '#000000'}
        strokeWidth={isSelected ? 2 : 1}
        shadowBlur={isSelected ? 10 : 0}
        shadowColor="#00FF00"
        cornerRadius={5}
      />
      
      {/* Head zone */}
      <Circle
        x={0}
        y={-HEIGHT / 2 + HEAD_RADIUS + 5}
        radius={HEAD_RADIUS}
        fill={hardCoverZones.includes('head') ? '#000000' : zoneColors['-0']}
        stroke="#000000"
        strokeWidth={0.5}
      />
      
      {/* Body zones */}
      <Group y={-5}>
        {/* -0 zone (center) */}
        <Rect
          x={-BODY_WIDTH / 2 + 5}
          y={-BODY_HEIGHT / 2 + 10}
          width={BODY_WIDTH - 10}
          height={BODY_HEIGHT - 20}
          fill={hardCoverZones.includes('body') ? '#000000' : zoneColors['-0']}
          stroke="#000000"
          strokeWidth={0.5}
        />
        
        {/* -1 zone (middle ring) */}
        <Rect
          x={-BODY_WIDTH / 2 + 2}
          y={-BODY_HEIGHT / 2 + 5}
          width={BODY_WIDTH - 4}
          height={BODY_HEIGHT - 10}
          fill={hardCoverZones.includes('body') ? '#000000' : zoneColors['-1']}
          stroke="#000000"
          strokeWidth={0.5}
        />
        
        {/* -3 zone (outer) */}
        <Rect
          x={-BODY_WIDTH / 2}
          y={-BODY_HEIGHT / 2}
          width={BODY_WIDTH}
          height={BODY_HEIGHT}
          fill={hardCoverZones.includes('body') ? '#000000' : zoneColors['-3']}
          stroke="#000000"
          strokeWidth={0.5}
        />
      </Group>
      
      {/* Target number */}
      <Text
        x={-10}
        y={HEIGHT / 2 - 20}
        text={`T${targetNumber}`}
        fontSize={12}
        fontFamily="monospace"
        fill="#000000"
        width={20}
        align="center"
      />
      
      {/* Non-threat indicator */}
      {!isThreat && (
        <Group>
          <Line
            points={[-WIDTH / 2 + 5, -HEIGHT / 2 + 5, WIDTH / 2 - 5, HEIGHT / 2 - 5]}
            stroke="#FF0000"
            strokeWidth={3}
          />
          <Line
            points={[WIDTH / 2 - 5, -HEIGHT / 2 + 5, -WIDTH / 2 + 5, HEIGHT / 2 - 5]}
            stroke="#FF0000"
            strokeWidth={3}
          />
        </Group>
      )}
    </Group>
  );
}