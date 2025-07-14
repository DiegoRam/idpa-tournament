"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Copy,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DesignerToolsProps {
  selectedElements: string[];
  onDelete: () => void;
  onDuplicate: () => void;
  onRotate: (angle: number) => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
  onBringToFront?: () => void;
}

export function DesignerTools({
  selectedElements,
  onDelete,
  onDuplicate,
  onRotate,
  onFlipHorizontal,
  onFlipVertical,
  onBringToFront,
}: DesignerToolsProps) {
  const hasSelection = selectedElements.length > 0;
  
  return (
    <TooltipProvider>
      <div className="flex gap-1 p-2 bg-gray-800 rounded-lg shadow-lg">
        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              disabled={!hasSelection}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete (Del)</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Duplicate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDuplicate}
              disabled={!hasSelection}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Duplicate (Ctrl+D)</p>
          </TooltipContent>
        </Tooltip>
        
        <div className="w-px bg-gray-700 mx-1" />
        
        {/* Rotate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRotate(45)}
              disabled={!hasSelection}
              className="h-8 w-8"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rotate 45° (R)</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Flip Horizontal */}
        {onFlipHorizontal && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={onFlipHorizontal}
                disabled={!hasSelection}
                className="h-8 w-8"
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip Horizontal</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Flip Vertical */}
        {onFlipVertical && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={onFlipVertical}
                disabled={!hasSelection}
                className="h-8 w-8"
              >
                <FlipVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip Vertical</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        <div className="w-px bg-gray-700 mx-1" />
        
        {/* Layer controls */}
        {onBringToFront && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={onBringToFront}
                disabled={!hasSelection}
                className="h-8 w-8"
              >
                <Layers className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bring to Front</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}