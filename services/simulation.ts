import { ElementType } from '../types';
import { soundService } from './sound';

const isWithinBounds = (x: number, y: number, width: number, height: number) => {
    return x >= 0 && x < width && y >= 0 && y < height;
}

export const updateGrid = (grid: ElementType[][], width: number, height: number): ElementType[][] => {
  const newGrid = grid.map(row => [...row]);

  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const currentElement = newGrid[y][x];

      if (currentElement === ElementType.EMPTY || currentElement === ElementType.STONE || currentElement === ElementType.WOOD || currentElement === ElementType.GRASS) {
        continue;
      }
      
      const down = isWithinBounds(x, y + 1, width, height) ? newGrid[y + 1][x] : ElementType.STONE;
      const downLeft = isWithinBounds(x - 1, y + 1, width, height) ? newGrid[y + 1][x - 1] : ElementType.STONE;
      const downRight = isWithinBounds(x + 1, y + 1, width, height) ? newGrid[y + 1][x + 1] : ElementType.STONE;
      let moved = false;

      if (currentElement === ElementType.SAND || currentElement === ElementType.OIL) {
        const density = currentElement === ElementType.OIL ? 0.9 : 1.0;
        const downIsLighter = down === ElementType.WATER && density < 1.0;

        if (down === ElementType.EMPTY || downIsLighter) {
          newGrid[y][x] = down;
          newGrid[y + 1][x] = currentElement;
          moved = true;
        } else {
          const goLeft = downLeft === ElementType.EMPTY || (downLeft === ElementType.WATER && density < 1.0);
          const goRight = downRight === ElementType.EMPTY || (downRight === ElementType.WATER && density < 1.0);

          if (goLeft && goRight) {
            if (Math.random() < 0.5) {
              newGrid[y][x] = downLeft;
              newGrid[y + 1][x - 1] = currentElement;
            } else {
              newGrid[y][x] = downRight;
              newGrid[y + 1][x + 1] = currentElement;
            }
            moved = true;
          } else if (goLeft) {
            newGrid[y][x] = downLeft;
            newGrid[y + 1][x - 1] = currentElement;
            moved = true;
          } else if (goRight) {
            newGrid[y][x] = downRight;
            newGrid[y + 1][x + 1] = currentElement;
            moved = true;
          }
        }
        if (moved && Math.random() < 0.005) soundService.playSound('sand_fall');
      } else if (currentElement === ElementType.WATER || currentElement === ElementType.ACID) {
        if (down === ElementType.EMPTY) {
            newGrid[y][x] = ElementType.EMPTY;
            newGrid[y+1][x] = currentElement;
            moved = true;
        } else if (downLeft === ElementType.EMPTY) {
            newGrid[y][x] = ElementType.EMPTY;
            newGrid[y+1][x-1] = currentElement;
            moved = true;
        } else if (downRight === ElementType.EMPTY) {
            newGrid[y][x] = ElementType.EMPTY;
            newGrid[y+1][x+1] = currentElement;
            moved = true;
        } else {
            const left = isWithinBounds(x - 1, y, width, height) ? newGrid[y][x - 1] : ElementType.STONE;
            const right = isWithinBounds(x + 1, y, width, height) ? newGrid[y][x + 1] : ElementType.STONE;
            if (left === ElementType.EMPTY && right === ElementType.EMPTY) {
                if (Math.random() < 0.5) {
                    newGrid[y][x] = ElementType.EMPTY;
                    newGrid[y][x-1] = currentElement;
                } else {
                    newGrid[y][x] = ElementType.EMPTY;
                    newGrid[y][x+1] = currentElement;
                }
                moved = true;
            } else if (left === ElementType.EMPTY) {
                newGrid[y][x] = ElementType.EMPTY;
                newGrid[y][x-1] = currentElement;
                moved = true;
            } else if (right === ElementType.EMPTY) {
                newGrid[y][x] = ElementType.EMPTY;
                newGrid[y][x+1] = currentElement;
                moved = true;
            }
        }
        if (moved && Math.random() < 0.01) soundService.playSound('water');

        // Acid dissolving
        if (currentElement === ElementType.ACID) {
            let dissolved = false;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx; const ny = y + dy;
                    if(isWithinBounds(nx, ny, width, height)) {
                        const neighbor = newGrid[ny][nx];
                        if (neighbor === ElementType.PLANT || neighbor === ElementType.WOOD || neighbor === ElementType.SAND || neighbor === ElementType.GRASS) {
                            newGrid[ny][nx] = ElementType.EMPTY;
                            dissolved = true;
                        } else if (neighbor === ElementType.STONE && Math.random() < 0.01) {
                            newGrid[ny][nx] = ElementType.EMPTY;
                            dissolved = true;
                        }
                    }
                }
            }
            if (dissolved && Math.random() < 0.1) soundService.playSound('acid');
        }
      } else if (currentElement === ElementType.LAVA) {
         let lavaMoved = false;
         for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx; const ny = y + dy;
                if (isWithinBounds(nx, ny, width, height)) {
                    const neighbor = newGrid[ny][nx];
                    if (neighbor === ElementType.WATER) {
                        soundService.playSound('steam_hiss');
                        newGrid[ny][nx] = ElementType.STEAM;
                        if (Math.random() < 0.5) newGrid[y][x] = ElementType.STONE;
                        break;
                    }
                    if ((neighbor === ElementType.PLANT || neighbor === ElementType.WOOD || neighbor === ElementType.OIL || neighbor === ElementType.GRASS) && Math.random() < 0.2) {
                       soundService.playSound('fire');
                       newGrid[ny][nx] = ElementType.FIRE;
                    }
                }
            }
         }
         if (newGrid[y][x] === ElementType.LAVA) { // Check if not turned to stone
            if (down === ElementType.EMPTY || down === ElementType.WATER) {
                newGrid[y][x] = down; newGrid[y+1][x] = ElementType.LAVA; lavaMoved = true;
            } else if (downLeft === ElementType.EMPTY || downLeft === ElementType.WATER) {
                newGrid[y][x] = downLeft; newGrid[y+1][x-1] = ElementType.LAVA; lavaMoved = true;
            } else if (downRight === ElementType.EMPTY || downRight === ElementType.WATER) {
                newGrid[y][x] = downRight; newGrid[y+1][x+1] = ElementType.LAVA; lavaMoved = true;
            }
         }
         if(lavaMoved && Math.random() < 0.05) soundService.playSound('lava');
      } else if (currentElement === ElementType.STEAM) {
          if (Math.random() < 0.05) { newGrid[y][x] = ElementType.EMPTY; continue; }
          const up = isWithinBounds(x, y - 1, width, height) ? newGrid[y - 1][x] : ElementType.STONE;
          const upLeft = isWithinBounds(x - 1, y - 1, width, height) ? newGrid[y - 1][x - 1] : ElementType.STONE;
          const upRight = isWithinBounds(x + 1, y - 1, width, height) ? newGrid[y - 1][x + 1] : ElementType.STONE;
          
          const goUp = (dir: number) => {
              newGrid[y][x] = ElementType.EMPTY;
              newGrid[y-1][x+dir] = ElementType.STEAM;
          };

          if (up === ElementType.EMPTY) goUp(0);
          else if (upLeft === ElementType.EMPTY && upRight === ElementType.EMPTY) goUp(Math.random() < 0.5 ? -1 : 1);
          else if (upLeft === ElementType.EMPTY) goUp(-1);
          else if (upRight === ElementType.EMPTY) goUp(1);
          else {
              const left = isWithinBounds(x - 1, y, width, height) ? newGrid[y][x - 1] : ElementType.STONE;
              const right = isWithinBounds(x + 1, y, width, height) ? newGrid[y][x + 1] : ElementType.STONE;
              if (left === ElementType.EMPTY && right === ElementType.EMPTY) {
                  newGrid[y][x] = ElementType.EMPTY; newGrid[y][x + (Math.random() < 0.5 ? -1 : 1)] = ElementType.STEAM;
              } else if (left === ElementType.EMPTY) {
                  newGrid[y][x] = ElementType.EMPTY; newGrid[y][x-1] = ElementType.STEAM;
              } else if (right === ElementType.EMPTY) {
                  newGrid[y][x] = ElementType.EMPTY; newGrid[y][x+1] = ElementType.STEAM;
              }
          }
      } else if (currentElement === ElementType.PLANT) {
          const ground = isWithinBounds(x, y + 1, width, height) ? newGrid[y + 1][x] : null;
          if (ground !== ElementType.GRASS && ground !== ElementType.PLANT) {
              newGrid[y][x] = ElementType.EMPTY; // Die if not on grass
          } else if (Math.random() < 0.01) {
              // Spread to the side if there's an empty spot on top of grass
              const dir = Math.random() < 0.5 ? -1 : 1;
              const nx = x + dir;
              if (isWithinBounds(nx, y, width, height) && newGrid[y][nx] === ElementType.EMPTY && isWithinBounds(nx, y + 1, width, height) && newGrid[y+1][nx] === ElementType.GRASS) {
                  newGrid[y][nx] = ElementType.PLANT;
              }
          }
      } else if (currentElement === ElementType.FIRE) {
          if(Math.random() < 0.05) soundService.playSound('fire');
          if (Math.random() < 0.1) { newGrid[y][x] = ElementType.EMPTY; continue; }
          for (let dx = -1; dx <= 1; dx++) {
              for (let dy = -1; dy <= 1; dy++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = x + dx; const ny = y + dy;
                  if (isWithinBounds(nx, ny, width, height)) {
                      const neighbor = newGrid[ny][nx];
                      if ((neighbor === ElementType.PLANT || neighbor === ElementType.OIL || neighbor === ElementType.WOOD || neighbor === ElementType.GRASS) && Math.random() < 0.3) {
                          newGrid[ny][nx] = ElementType.FIRE;
                      }
                  }
              }
          }
           if (isWithinBounds(x, y - 1, width, height) && newGrid[y - 1][x] === ElementType.EMPTY && Math.random() < 0.2) {
              newGrid[y][x] = ElementType.EMPTY; newGrid[y - 1][x] = ElementType.FIRE;
           }
      }
    }
  }

  return newGrid;
};