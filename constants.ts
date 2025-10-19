import { ElementType, ElementConfig } from './types';

export const CELL_SIZE = 4;

export const SIZES = {
  small: { width: 150, height: 112, name: 'Small' },
  medium: { width: 300, height: 225, name: 'Medium' },
  large: { width: 400, height: 300, name: 'Large' },
};

export const ELEMENT_COLORS: { [key in ElementType]: string } = {
  [ElementType.EMPTY]: '#111827', // A dark color from the new bg
  [ElementType.SAND]: '#f4d35e',
  [ElementType.WATER]: '#43a0e8',
  [ElementType.STONE]: '#8d99ae',
  [ElementType.PLANT]: '#6a994e',
  [ElementType.FIRE]: '#f07167',
  [ElementType.OIL]: '#3d2b56',
  [ElementType.WOOD]: '#854d0e',
  [ElementType.ACID]: '#a3e635',
  [ElementType.LAVA]: '#f97316',
  [ElementType.STEAM]: '#e5e7eb',
  [ElementType.GRASS]: '#55a630',
};

export const ELEMENT_TYPES: { type: ElementType, config: ElementConfig }[] = [
    // Solids & Grounds
    { type: ElementType.STONE, config: { name: "Stone", color: "bg-gray-500" } },
    { type: ElementType.WOOD, config: { name: "Wood", color: "bg-amber-800", flammable: true } },
    { type: ElementType.GRASS, config: { name: "Grass", color: "bg-lime-600", flammable: true } },
    { type: ElementType.PLANT, config: { name: "Plant", color: "bg-green-600", flammable: true } },
    
    // Powders & Liquids
    { type: ElementType.SAND, config: { name: "Sand", color: "bg-yellow-400" } },
    { type: ElementType.WATER, config: { name: "Water", color: "bg-blue-500" } },
    { type: ElementType.OIL, config: { name: "Oil", color: "bg-purple-800", flammable: true } },
    { type: ElementType.ACID, config: { name: "Acid", color: "bg-lime-400" } },
    
    // Special & Gasses
    { type: ElementType.LAVA, config: { name: "Lava", color: "bg-orange-500" } },
    { type: ElementType.FIRE, config: { name: "Fire", color: "bg-red-500" } },
    { type: ElementType.STEAM, config: { name: "Steam", color: "bg-gray-300" } },

    // Tool
    { type: ElementType.EMPTY, config: { name: "Eraser", color: "bg-gray-600" } },
];