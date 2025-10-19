import React, { useState, useCallback, useRef, useEffect } from 'react';
import Canvas from './components/Canvas';
import Controls from './components/Controls';
import { ElementType } from './types';
import { SIZES, ELEMENT_TYPES } from './constants';
import { updateGrid } from './services/simulation';
import { soundService } from './services/sound';

type GridSize = { width: number; height: number };

const createEmptyGrid = (width: number, height: number) => {
  return Array(height)
      .fill(null)
      .map(() => Array(width).fill(ElementType.EMPTY));
}

const resizeGrid = (grid: ElementType[][], newWidth: number, newHeight: number): ElementType[][] => {
    const newGrid: ElementType[][] = [];
    for (let y = 0; y < newHeight; y++) {
        const newRow: ElementType[] = [];
        const oldRow = grid[y] || [];
        for (let x = 0; x < newWidth; x++) {
            newRow.push(oldRow[x] !== undefined ? oldRow[x] : ElementType.EMPTY);
        }
        newGrid.push(newRow);
    }
    return newGrid;
}

const App: React.FC = () => {
  const [gridSize, setGridSize] = useState<GridSize>({ width: SIZES.medium.width, height: SIZES.medium.height });
  
  const [grid, setGrid] = useState<ElementType[][]>(() =>
    createEmptyGrid(gridSize.width, gridSize.height)
  );

  const [selectedElement, setSelectedElement] = useState<ElementType>(
    ElementType.SAND
  );
  const [brushSize, setBrushSize] = useState<number>(5);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    let animationFrameId: number;
    let lastUpdateTime = 0;
    const simulationInterval = 1000 / 60; // 60 FPS

    const runSimulation = (timestamp: number) => {
      if (timestamp - lastUpdateTime >= simulationInterval) {
        lastUpdateTime = timestamp;
        setGrid(prevGrid => {
          const height = prevGrid.length;
          if (!height) return prevGrid;
          const width = prevGrid[0].length;
          if (!width) return prevGrid;
          return updateGrid(prevGrid, width, height);
        });
      }
      animationFrameId = requestAnimationFrame(runSimulation);
    };

    animationFrameId = requestAnimationFrame(runSimulation);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning]);

  useEffect(() => {
    const checkScroll = () => {
      if (document.documentElement.scrollHeight > window.innerHeight) {
        setShowScrollButtons(true);
      } else {
        setShowScrollButtons(false);
      }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    checkScroll();

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handlePaint = (x: number, y: number) => {
    setGrid((prevGrid) => {
      const height = prevGrid.length;
      if (!height) return prevGrid;
      const width = prevGrid[0].length;
      if (!width) return prevGrid;

      const newGrid = prevGrid.map((row) => [...row]);
      for (
        let i = -brushSize;
        i <= brushSize;
        i++
      ) {
        for (
          let j = -brushSize;
          j <= brushSize;
          j++
        ) {
          if (i * i + j * j < brushSize * brushSize) {
            const newY = y + i;
            const newX = x + j;
            if (
              newY >= 0 &&
              newY < height &&
              newX >= 0 &&
              newX < width
            ) {
              const existingElement = newGrid[newY][newX];
              if (selectedElement === ElementType.EMPTY) {
                if(existingElement !== ElementType.EMPTY) newGrid[newY][newX] = selectedElement;
              } else if (selectedElement === ElementType.PLANT) {
                // Plants can only be placed on grass
                if (existingElement === ElementType.GRASS) {
                  newGrid[newY][newX] = selectedElement;
                }
              }
               else if (existingElement !== ElementType.STONE && existingElement !== ElementType.WOOD && existingElement !== ElementType.GRASS) {
                newGrid[newY][newX] = selectedElement;
              }
            }
          }
        }
      }
      return newGrid;
    });
  };

  const clearGrid = () => {
    soundService.playSound('erase');
    setGrid(
      createEmptyGrid(gridSize.width, gridSize.height)
    );
  };

  const toggleMute = () => {
    const newMutedState = soundService.toggleMute();
    setIsMuted(newMutedState);
  };

  const handleElementChange = (element: ElementType) => {
    soundService.playSound('select');
    setSelectedElement(element);
  };
  
  const handleSizeChange = (newSize: { width: number, height: number }) => {
    setGridSize(newSize);
    setGrid(prevGrid => resizeGrid(prevGrid, newSize.width, newSize.height));
  }

  const toggleRun = () => {
    soundService.playSound('select');
    setIsRunning(!isRunning);
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 lg:p-8 font-sans">
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-cyan-300 tracking-widest uppercase">
          Falling Sand
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          A digital physics sandbox
        </p>
      </header>
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-7xl">
        <div className="w-full lg:w-96 bg-gray-900/40 backdrop-blur-md p-5 rounded-2xl border border-cyan-300/20 shadow-lg">
           <Controls
                elements={ELEMENT_TYPES}
                selectedElement={selectedElement}
                onElementChange={handleElementChange}
                brushSize={brushSize}
                onBrushSizeChange={setBrushSize}
                onClear={clearGrid}
                isRunning={isRunning}
                onToggleRun={toggleRun}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                onSizeChange={handleSizeChange}
                currentSize={gridSize}
           />
        </div>
        <div className="flex-1 rounded-lg shadow-glow-cyan overflow-hidden border-2 border-cyan-400">
             <Canvas grid={grid} onPaint={handlePaint} selectedElement={selectedElement} width={gridSize.width} height={gridSize.height} />
        </div>
      </div>
       <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Experiment and create. What will you discover?</p>
      </footer>

      {showScrollButtons && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <button onClick={scrollToTop} aria-label="Scroll to top" className="w-12 h-12 rounded-full bg-cyan-600/50 hover:bg-cyan-600/80 border border-cyan-400 text-cyan-50 flex items-center justify-center transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
            </button>
            <button onClick={scrollToBottom} aria-label="Scroll to bottom" className="w-12 h-12 rounded-full bg-cyan-600/50 hover:bg-cyan-600/80 border border-cyan-400 text-cyan-50 flex items-center justify-center transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
        </div>
      )}
    </div>
  );
};

export default App;