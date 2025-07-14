"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  IdpaTarget,
  SteelTarget,
  Cover,
  Wall,
  FaultLine,
  StartPosition,
} from './elements';
import {
  StageElement,
  StageDiagram,
  IdpaTargetElement,
  SteelTargetElement,
  CoverElement,
  WallElement,
  FaultLineElement,
  StartPositionElement,
} from '@/types/stage-designer';
import { GRID_SIZE } from './utils/geometry';
import { ZoomIn, ZoomOut, Maximize, Download } from 'lucide-react';

interface StageViewerProps {
  diagram: StageDiagram;
  stageInfo?: {
    name: string;
    description: string;
    stageNumber: number;
  };
  showInfo?: boolean;
  onExport?: () => void;
}

export function StageViewer({
  diagram,
  stageInfo,
  showInfo = true,
  onExport,
}: StageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  
  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.min(width - 32, diagram.dimensions.width),
          height: Math.min(height - 32, diagram.dimensions.height),
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [diagram.dimensions]);
  
  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    const newZoom = Math.max(0.25, Math.min(2, zoom + delta));
    setZoom(newZoom);
  }, [zoom]);
  
  // Handle pinch zoom on mobile
  useEffect(() => {
    if (!stageRef.current) return;
    
    const stage = stageRef.current;
    let lastDist = 0;
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dist = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        if (lastDist > 0) {
          const scale = dist / lastDist;
          const newZoom = Math.max(0.25, Math.min(2, zoom * scale));
          setZoom(newZoom);
        }
        
        lastDist = dist;
      }
    };
    
    const handleTouchEnd = () => {
      lastDist = 0;
    };
    
    const container = stage.container();
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoom]);
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
  
  // Render element based on type
  const renderElement = (element: StageElement) => {
    const commonProps = {
      key: element.id,
      element,
      isSelected: false,
      onSelect: () => {},
      onChange: () => {},
    };
    
    switch (element.type) {
      case 'idpa-target':
        return <IdpaTarget {...commonProps} element={element as IdpaTargetElement} />;
      case 'steel-target':
        return <SteelTarget {...commonProps} element={element as SteelTargetElement} />;
      case 'hard-cover':
      case 'soft-cover':
        return <Cover {...commonProps} element={element as CoverElement} />;
      case 'wall':
        return <Wall {...commonProps} element={element as WallElement} />;
      case 'fault-line':
        return <FaultLine {...commonProps} element={element as FaultLineElement} />;
      case 'start-position':
        return <StartPosition {...commonProps} element={element as StartPositionElement} />;
      default:
        return null;
    }
  };
  
  // Calculate stage bounds to center the view
  const calculateBounds = () => {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    diagram.elements.forEach(element => {
      const x = element.position.x;
      const y = element.position.y;
      
      minX = Math.min(minX, x - 50);
      minY = Math.min(minY, y - 50);
      maxX = Math.max(maxX, x + 50);
      maxY = Math.max(maxY, y + 50);
    });
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };
  
  const bounds = calculateBounds();
  const scale = Math.min(
    dimensions.width / bounds.width,
    dimensions.height / bounds.height
  ) * 0.9;
  
  return (
    <div ref={containerRef} className="relative h-full w-full">
      <Card className="h-full bg-gray-900/50 border-gray-800 overflow-hidden">
        {/* Header with stage info */}
        {showInfo && stageInfo && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 max-w-sm">
              <h3 className="text-lg font-bold text-green-400">
                Stage {stageInfo.stageNumber}: {stageInfo.name}
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                {stageInfo.description}
              </p>
            </div>
          </div>
        )}
        
        {/* Controls */}
        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => handleZoom(0.1)}
            className="bg-gray-800/90 hover:bg-gray-700"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => handleZoom(-0.1)}
            className="bg-gray-800/90 hover:bg-gray-700"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={toggleFullscreen}
            className="bg-gray-800/90 hover:bg-gray-700"
          >
            <Maximize className="h-4 w-4" />
          </Button>
          {onExport && (
            <Button
              size="icon"
              variant="secondary"
              onClick={onExport}
              className="bg-green-700/90 hover:bg-green-600"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Canvas */}
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          scaleX={zoom * scale}
          scaleY={zoom * scale}
          x={(dimensions.width - bounds.width * zoom * scale) / 2}
          y={(dimensions.height - bounds.height * zoom * scale) / 2}
          draggable
          className="touch-none"
        >
          {/* Background */}
          <Layer>
            <Line
              points={[
                bounds.x - 100,
                bounds.y - 100,
                bounds.x + bounds.width + 100,
                bounds.y - 100,
                bounds.x + bounds.width + 100,
                bounds.y + bounds.height + 100,
                bounds.x - 100,
                bounds.y + bounds.height + 100,
              ]}
              closed
              fill="#1a1a1a"
            />
          </Layer>
          
          {/* Elements layer */}
          <Layer>
            {diagram.elements.map(renderElement)}
            
            {/* Grid for reference (faint) */}
            {Array.from({ length: Math.ceil(bounds.width / GRID_SIZE) + 1 }).map((_, i) => (
              <Line
                key={`v-${i}`}
                points={[
                  bounds.x + i * GRID_SIZE,
                  bounds.y,
                  bounds.x + i * GRID_SIZE,
                  bounds.y + bounds.height,
                ]}
                stroke="#333333"
                strokeWidth={0.25}
                opacity={0.2}
              />
            ))}
            {Array.from({ length: Math.ceil(bounds.height / GRID_SIZE) + 1 }).map((_, i) => (
              <Line
                key={`h-${i}`}
                points={[
                  bounds.x,
                  bounds.y + i * GRID_SIZE,
                  bounds.x + bounds.width,
                  bounds.y + i * GRID_SIZE,
                ]}
                stroke="#333333"
                strokeWidth={0.25}
                opacity={0.2}
              />
            ))}
          </Layer>
        </Stage>
      </Card>
    </div>
  );
}