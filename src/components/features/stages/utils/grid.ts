import { Point, GRID_SIZE } from './geometry';

export interface GridConfig {
  size: number;
  color: string;
  opacity: number;
  showMajor: boolean;
  majorInterval: number;
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  size: GRID_SIZE,
  color: '#333333',
  opacity: 0.3,
  showMajor: true,
  majorInterval: 5, // Major grid line every 5 yards
};

// Draw grid on canvas context
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GridConfig = DEFAULT_GRID_CONFIG
): void {
  ctx.save();
  ctx.globalAlpha = config.opacity;
  
  // Minor grid lines
  ctx.strokeStyle = config.color;
  ctx.lineWidth = 0.5;
  
  for (let x = 0; x <= width; x += config.size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= height; y += config.size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Major grid lines
  if (config.showMajor) {
    ctx.lineWidth = 1;
    ctx.globalAlpha = config.opacity * 2;
    
    const majorSize = config.size * config.majorInterval;
    
    for (let x = 0; x <= width; x += majorSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += majorSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Get nearest grid intersection
export function getNearestGridPoint(point: Point, gridSize: number = GRID_SIZE): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

// Check if snapping is enabled (could be toggled by user)
export function shouldSnapToGrid(ctrlKey: boolean = false): boolean {
  // Holding Ctrl temporarily disables snapping
  return !ctrlKey;
}