"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import Konva from 'konva';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ElementLibrary } from './ElementLibrary';
import { DesignerTools } from './DesignerTools';
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
  Tool,
  IdpaTargetElement,
  SteelTargetElement,
  CoverElement,
  WallElement,
  FaultLineElement,
  StartPositionElement,
} from '@/types/stage-designer';
import { GRID_SIZE, snapToGrid, pixelsToYards } from './utils/geometry';
import { Save, ZoomIn, ZoomOut, Grid3x3 } from 'lucide-react';

interface StageDesignerProps {
  diagram: StageDiagram;
  onChange: (diagram: StageDiagram) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

export function StageDesigner({
  diagram,
  onChange,
  onSave,
  readOnly = false,
}: StageDesignerProps) {
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null);
  const [measureEnd, setMeasureEnd] = useState<{ x: number; y: number } | null>(null);
  
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const gridLayerRef = useRef<Konva.Layer>(null);
  
  // Generate unique ID for new elements
  const generateId = () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle canvas click
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (readOnly) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    const position = snapToGrid({
      x: pointerPosition.x / zoom,
      y: pointerPosition.y / zoom,
    });
    
    // Handle different tools
    if (selectedTool === 'select') {
      // Clicking on empty space deselects all
      if (e.target === stage) {
        setSelectedElements([]);
      }
    } else if (selectedTool === 'measure') {
      if (!measureStart) {
        setMeasureStart(position);
        setMeasureEnd(position);
      } else {
        setMeasureStart(null);
        setMeasureEnd(null);
      }
    } else if (selectedTool !== 'pan') {
      // Create new element
      let newElement: StageElement | null = null;
      
      switch (selectedTool) {
        case 'idpa-target':
          newElement = {
            id: generateId(),
            type: 'idpa-target',
            position,
            rotation: 0,
            properties: {
              targetNumber: diagram.elements.filter(e => e.type === 'idpa-target').length + 1,
              isThreat: true,
              hardCoverZones: [],
            },
          } as IdpaTargetElement;
          break;
          
        case 'steel-target':
          newElement = {
            id: generateId(),
            type: 'steel-target',
            position,
            rotation: 0,
            properties: {
              shape: 'popper',
              mustFall: false,
            },
          } as SteelTargetElement;
          break;
          
        case 'hard-cover':
        case 'soft-cover':
          newElement = {
            id: generateId(),
            type: selectedTool,
            position,
            rotation: 0,
            properties: {
              width: 60,
              height: 90,
            },
          } as CoverElement;
          break;
          
        case 'wall':
          newElement = {
            id: generateId(),
            type: 'wall',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: {
              startPoint: position,
              endPoint: { x: position.x + 120, y: position.y },
              thickness: 10,
            },
          } as WallElement;
          break;
          
        case 'fault-line':
          newElement = {
            id: generateId(),
            type: 'fault-line',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: {
              points: [
                position,
                { x: position.x + 90, y: position.y },
              ],
              style: 'solid',
            },
          } as FaultLineElement;
          break;
          
        case 'start-position':
          newElement = {
            id: generateId(),
            type: 'start-position',
            position,
            rotation: 0,
            properties: {
              variant: 'box',
            },
          } as StartPositionElement;
          break;
      }
      
      if (newElement) {
        onChange({
          ...diagram,
          elements: [...diagram.elements, newElement],
        });
        setSelectedElements([newElement.id]);
        setSelectedTool('select');
      }
    }
  }, [selectedTool, diagram, onChange, zoom, readOnly, measureStart]);
  
  // Handle mouse move for measuring
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedTool === 'measure' && measureStart) {
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      const position = snapToGrid({
        x: pointerPosition.x / zoom,
        y: pointerPosition.y / zoom,
      });
      
      setMeasureEnd(position);
    }
  }, [selectedTool, measureStart, zoom]);
  
  // Handle element selection
  const handleElementSelect = useCallback((elementId: string) => {
    if (readOnly) return;
    setSelectedElements([elementId]);
  }, [readOnly]);
  
  // Handle element change
  const handleElementChange = useCallback((updatedElement: StageElement) => {
    onChange({
      ...diagram,
      elements: diagram.elements.map(el =>
        el.id === updatedElement.id ? updatedElement : el
      ),
    });
  }, [diagram, onChange]);
  
  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    const newZoom = Math.max(0.25, Math.min(2, zoom + delta));
    setZoom(newZoom);
  }, [zoom]);
  
  // Render element based on type
  const renderElement = (element: StageElement) => {
    const isSelected = selectedElements.includes(element.id);
    const commonProps = {
      key: element.id,
      element,
      isSelected,
      onSelect: () => handleElementSelect(element.id),
      onChange: handleElementChange,
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
  
  return (
    <div className="flex gap-4 h-full">
      {/* Left sidebar - Element Library */}
      {!readOnly && (
        <ElementLibrary
          onSelectElement={(type) => setSelectedTool(type as Tool)}
          selectedTool={selectedTool}
        />
      )}
      
      {/* Main canvas area */}
      <div className="flex-1 relative">
        <Card className="h-full bg-gray-900/50 border-gray-800 overflow-hidden">
          {/* Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <DesignerTools
              selectedElements={selectedElements}
              onDelete={() => {
                onChange({
                  ...diagram,
                  elements: diagram.elements.filter(
                    el => !selectedElements.includes(el.id)
                  ),
                });
                setSelectedElements([]);
              }}
              onDuplicate={() => {
                const newElements = selectedElements
                  .map(id => diagram.elements.find(el => el.id === id))
                  .filter(Boolean)
                  .map(el => ({
                    ...el!,
                    id: generateId(),
                    position: {
                      x: el!.position.x + 30,
                      y: el!.position.y + 30,
                    },
                  }));
                
                onChange({
                  ...diagram,
                  elements: [...diagram.elements, ...newElements],
                });
                
                setSelectedElements(newElements.map(el => el.id));
              }}
              onRotate={(angle) => {
                onChange({
                  ...diagram,
                  elements: diagram.elements.map(el =>
                    selectedElements.includes(el.id)
                      ? { ...el, rotation: (el.rotation || 0) + angle }
                      : el
                  ),
                });
              }}
            />
          </div>
          
          {/* Zoom and view controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setShowGrid(!showGrid)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => handleZoom(0.1)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => handleZoom(-0.1)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            {onSave && (
              <Button
                size="icon"
                variant="secondary"
                onClick={onSave}
                className="bg-green-700 hover:bg-green-600"
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Canvas */}
          <Stage
            ref={stageRef}
            width={diagram.dimensions.width}
            height={diagram.dimensions.height}
            scaleX={zoom}
            scaleY={zoom}
            onClick={handleStageClick}
            onMouseMove={handleMouseMove}
            className="cursor-crosshair"
          >
            {/* Grid layer */}
            {showGrid && (
              <Layer ref={gridLayerRef} listening={false}>
                {/* Grid lines */}
                {Array.from({ length: Math.ceil(diagram.dimensions.width / GRID_SIZE) + 1 }).map((_, i) => (
                  <Line
                    key={`v-${i}`}
                    points={[i * GRID_SIZE, 0, i * GRID_SIZE, diagram.dimensions.height]}
                    stroke="#333333"
                    strokeWidth={i % 5 === 0 ? 1 : 0.5}
                    opacity={0.3}
                  />
                ))}
                {Array.from({ length: Math.ceil(diagram.dimensions.height / GRID_SIZE) + 1 }).map((_, i) => (
                  <Line
                    key={`h-${i}`}
                    points={[0, i * GRID_SIZE, diagram.dimensions.width, i * GRID_SIZE]}
                    stroke="#333333"
                    strokeWidth={i % 5 === 0 ? 1 : 0.5}
                    opacity={0.3}
                  />
                ))}
              </Layer>
            )}
            
            {/* Elements layer */}
            <Layer ref={layerRef}>
              {diagram.elements.map(renderElement)}
              
              {/* Measurement line */}
              {measureStart && measureEnd && (
                <>
                  <Line
                    points={[measureStart.x, measureStart.y, measureEnd.x, measureEnd.y]}
                    stroke="#00FF00"
                    strokeWidth={2}
                    dash={[5, 5]}
                  />
                  <Text
                    x={(measureStart.x + measureEnd.x) / 2 - 30}
                    y={(measureStart.y + measureEnd.y) / 2 - 10}
                    text={`${pixelsToYards(
                      Math.sqrt(
                        Math.pow(measureEnd.x - measureStart.x, 2) +
                        Math.pow(measureEnd.y - measureStart.y, 2)
                      )
                    ).toFixed(1)} yards`}
                    fontSize={14}
                    fill="#00FF00"
                    fontFamily="monospace"
                  />
                </>
              )}
            </Layer>
          </Stage>
        </Card>
      </div>
    </div>
  );
}