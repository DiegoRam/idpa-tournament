import { Point } from '@/components/features/stages/utils/geometry';

export type ElementType = 
  | 'idpa-target'
  | 'steel-target'
  | 'hard-cover'
  | 'soft-cover'
  | 'wall'
  | 'fault-line'
  | 'start-position'
  | 'movement-arrow'
  | 'vision-barrier'
  | 'text';

export interface BaseElement {
  id: string;
  type: ElementType;
  position: Point;
  rotation: number;
  selected?: boolean;
  locked?: boolean;
}

export interface IdpaTargetElement extends BaseElement {
  type: 'idpa-target';
  properties: {
    targetNumber: number;
    isThreat: boolean;
    hardCoverZones?: ('head' | 'body' | 'lower')[];
    requiredHits?: number;
  };
}

export interface SteelTargetElement extends BaseElement {
  type: 'steel-target';
  properties: {
    shape: 'popper' | 'plate' | 'mini-popper';
    mustFall: boolean;
  };
}

export interface CoverElement extends BaseElement {
  type: 'hard-cover' | 'soft-cover';
  properties: {
    width: number;
    height: number;
  };
}

export interface WallElement extends BaseElement {
  type: 'wall';
  properties: {
    startPoint: Point;
    endPoint: Point;
    thickness: number;
  };
}

export interface FaultLineElement extends BaseElement {
  type: 'fault-line';
  properties: {
    points: Point[];
    style: 'solid' | 'dashed';
  };
}

export interface StartPositionElement extends BaseElement {
  type: 'start-position';
  properties: {
    variant: 'box' | 'feet' | 'point';
  };
}

export interface MovementArrowElement extends BaseElement {
  type: 'movement-arrow';
  properties: {
    points: Point[];
    label?: string;
  };
}

export interface VisionBarrierElement extends BaseElement {
  type: 'vision-barrier';
  properties: {
    width: number;
    height: number;
  };
}

export interface TextElement extends BaseElement {
  type: 'text';
  properties: {
    text: string;
    fontSize: number;
    fontWeight?: 'normal' | 'bold';
  };
}

export type StageElement = 
  | IdpaTargetElement
  | SteelTargetElement
  | CoverElement
  | WallElement
  | FaultLineElement
  | StartPositionElement
  | MovementArrowElement
  | VisionBarrierElement
  | TextElement;

export interface StageDiagram {
  elements: StageElement[];
  dimensions: {
    width: number;
    height: number;
  };
  gridConfig?: {
    size: number;
    visible: boolean;
  };
}

export type Tool = 
  | 'select'
  | 'pan'
  | 'idpa-target'
  | 'steel-target'
  | 'hard-cover'
  | 'soft-cover'
  | 'wall'
  | 'fault-line'
  | 'start-position'
  | 'movement-arrow'
  | 'vision-barrier'
  | 'text'
  | 'measure';

export interface DesignerState {
  selectedTool: Tool;
  selectedElements: string[];
  zoom: number;
  pan: Point;
  showGrid: boolean;
  snapToGrid: boolean;
  showRuler: boolean;
}