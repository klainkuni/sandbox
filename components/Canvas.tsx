import React, { useRef, useEffect, useState } from 'react';
import { ElementType } from '../types';
import { CELL_SIZE, ELEMENT_COLORS } from '../constants';
import { soundService } from '../services/sound';

interface CanvasProps {
  grid: ElementType[][];
  onPaint: (x: number, y: number) => void;
  selectedElement: ElementType;
  width: number;
  height: number;
}

const Canvas: React.FC<CanvasProps> = ({ grid, onPaint, selectedElement, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = ELEMENT_COLORS[ElementType.EMPTY];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const element = grid[y][x];
        if (element !== ElementType.EMPTY) {
          ctx.fillStyle = ELEMENT_COLORS[element];
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }, [grid, width, height]);

  const handleMouseEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (x >= 0 && x < width && y >= 0 && y < height) {
      onPaint(x, y);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    soundService.playSound(selectedElement === ElementType.EMPTY ? 'erase' : 'place');
    handleMouseEvent(e);
  };
  
  const handleMouseUp = () => {
    setIsMouseDown(false);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMouseDown) {
      handleMouseEvent(e);
    }
  };
  
  const handleMouseLeave = () => {
      setIsMouseDown(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width * CELL_SIZE}
      height={height * CELL_SIZE}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-crosshair block"
    />
  );
};

export default Canvas;