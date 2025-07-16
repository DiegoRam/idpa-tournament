"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Target,
  Circle,
  Square,
  Minus,
  Flag,
  FootprintsIcon,
  MoveIcon,
  EyeOff,
  Type,
  Ruler,
} from 'lucide-react';
import { ElementType } from '@/types/stage-designer';

interface ElementLibraryProps {
  onSelectElement: (type: ElementType | 'select' | 'measure') => void;
  selectedTool: ElementType | 'select' | 'pan' | 'measure';
}

interface ElementCategory {
  name: string;
  elements: {
    type: ElementType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[];
}

const elementCategories: ElementCategory[] = [
  {
    name: 'Targets',
    elements: [
      {
        type: 'idpa-target',
        label: 'IDPA Target',
        icon: <Target className="h-4 w-4" />,
        description: 'Standard IDPA cardboard target',
      },
      {
        type: 'steel-target',
        label: 'Steel Target',
        icon: <Circle className="h-4 w-4" />,
        description: 'Popper, plate, or mini-popper',
      },
    ],
  },
  {
    name: 'Cover',
    elements: [
      {
        type: 'hard-cover',
        label: 'Hard Cover',
        icon: <Square className="h-4 w-4 fill-black" />,
        description: 'Impenetrable cover (black)',
      },
      {
        type: 'soft-cover',
        label: 'Soft Cover',
        icon: <Square className="h-4 w-4" />,
        description: 'Penetrable cover (white)',
      },
    ],
  },
  {
    name: 'Structures',
    elements: [
      {
        type: 'wall',
        label: 'Wall',
        icon: <Minus className="h-4 w-4" />,
        description: 'Barrier or wall section',
      },
      {
        type: 'vision-barrier',
        label: 'Vision Barrier',
        icon: <EyeOff className="h-4 w-4" />,
        description: 'View obstruction',
      },
    ],
  },
  {
    name: 'Markers',
    elements: [
      {
        type: 'fault-line',
        label: 'Fault Line',
        icon: <Flag className="h-4 w-4" />,
        description: 'Boundary line',
      },
      {
        type: 'start-position',
        label: 'Start Position',
        icon: <FootprintsIcon className="h-4 w-4" />,
        description: 'Shooter start location',
      },
      {
        type: 'movement-arrow',
        label: 'Movement',
        icon: <MoveIcon className="h-4 w-4" />,
        description: 'Movement path indicator',
      },
    ],
  },
  {
    name: 'Annotations',
    elements: [
      {
        type: 'text',
        label: 'Text',
        icon: <Type className="h-4 w-4" />,
        description: 'Add text label',
      },
    ],
  },
];

export function ElementLibrary({ onSelectElement, selectedTool }: ElementLibraryProps) {
  return (
    <Card className="w-64 h-full bg-gray-900/50 border-gray-800">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-green-400 mb-2">Elements</h3>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {/* Special tools */}
            <div>
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Tools</p>
              <div className="space-y-1">
                <Button
                  variant={selectedTool === 'select' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onSelectElement('select')}
                >
                  <div className="w-4 h-4 mr-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                    </svg>
                  </div>
                  Select
                </Button>
                <Button
                  variant={selectedTool === 'measure' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onSelectElement('measure')}
                >
                  <Ruler className="h-4 w-4 mr-2" />
                  Measure
                </Button>
              </div>
            </div>
            
            <Separator className="bg-gray-800" />
            
            {/* Element categories */}
            {elementCategories.map((category) => (
              <div key={category.name}>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  {category.name}
                </p>
                <div className="space-y-1">
                  {category.elements.map((element) => (
                    <Button
                      key={element.type}
                      variant={selectedTool === element.type ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onSelectElement(element.type)}
                    >
                      <span className="mr-2">{element.icon}</span>
                      <span className="text-xs">{element.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}