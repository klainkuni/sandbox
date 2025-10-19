export enum ElementType {
  EMPTY,
  SAND,
  WATER,
  STONE,
  PLANT,
  FIRE,
  OIL,
  WOOD,
  ACID,
  LAVA,
  STEAM,
  GRASS,
}

export interface ElementConfig {
  name: string;
  color: string;
  flammable?: boolean;
}
