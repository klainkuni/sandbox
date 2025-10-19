import React from 'react';
import { ElementType, ElementConfig } from '../types';

interface ControlsProps {
  elements: { type: ElementType, config: ElementConfig }[];
  selectedElement: ElementType;
  onElementChange: (element: ElementType) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onClear: () => void;
  isRunning: boolean;
  onToggleRun: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  currentSize: { width: number; height: number };
}

const Controls: React.FC<ControlsProps> = ({
  elements,
  selectedElement,
  onElementChange,
  brushSize,
  onBrushSizeChange,
  onClear,
  isRunning,
  onToggleRun,
  isMuted,
  onToggleMute,
  onSizeChange,
  currentSize,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h3 className="text-lg font-semibold mb-3 text-cyan-300 tracking-wide">Elements</h3>
        <div className="grid grid-cols-4 gap-2">
          {elements.map(({ type, config }) => (
            <button
              key={config.name}
              onClick={() => onElementChange(type)}
              className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 flex flex-col items-center gap-1.5 bg-black/20 hover:bg-black/40 ${
                selectedElement === type
                  ? 'ring-2 ring-cyan-300'
                  : 'ring-1 ring-white/10'
              }`}
            >
              <div className={`w-5 h-5 rounded-full ${config.color} border-2 ${selectedElement === type ? 'border-white' : 'border-transparent'}`}></div>
              <span className="text-xs">{config.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3 text-cyan-300 tracking-wide">Brush</h3>
        <div className="flex items-center gap-3">
            <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer range-slider"
            />
             <span className="font-mono text-cyan-300 w-8 text-center bg-black/30 py-1 rounded-md">{brushSize}</span>
        </div>
      </div>
       <div>
        <h3 className="text-lg font-semibold mb-3 text-cyan-300 tracking-wide">Canvas Size</h3>
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <label htmlFor="width-slider" className="text-sm font-medium w-12">Width</label>
                <input
                    id="width-slider"
                    type="range"
                    min="50"
                    max="500"
                    step="2"
                    value={currentSize.width}
                    onChange={(e) => onSizeChange({ width: Number(e.target.value), height: currentSize.height })}
                    className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer range-slider"
                />
                <span className="font-mono text-cyan-300 w-12 text-center bg-black/30 py-1 rounded-md">{currentSize.width}</span>
            </div>
            <div className="flex items-center gap-3">
                <label htmlFor="height-slider" className="text-sm font-medium w-12">Height</label>
                <input
                    id="height-slider"
                    type="range"
                    min="50"
                    max="400"
                    step="2"
                    value={currentSize.height}
                    onChange={(e) => onSizeChange({ width: currentSize.width, height: Number(e.target.value) })}
                    className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer range-slider"
                />
                <span className="font-mono text-cyan-300 w-12 text-center bg-black/30 py-1 rounded-md">{currentSize.height}</span>
            </div>
        </div>
      </div>
       <div>
        <h3 className="text-lg font-semibold mb-3 text-cyan-300 tracking-wide">Simulation</h3>
        <div className="grid grid-cols-2 gap-2">
            <button onClick={onToggleRun} className="w-full bg-cyan-600/50 hover:bg-cyan-600/80 border border-cyan-400 text-cyan-50 font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                 {isRunning ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                 )}
                <span>{isRunning ? 'Pause' : 'Play'}</span>
            </button>
            <button onClick={onClear} className="w-full bg-red-600/50 hover:bg-red-600/80 border border-red-400 text-red-50 font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
               <span>Clear</span>
            </button>
             <button onClick={onToggleMute} className="col-span-2 w-full bg-gray-600/50 hover:bg-gray-600/80 border border-gray-400 text-gray-50 font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                )}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;