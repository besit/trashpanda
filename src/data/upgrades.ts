// Civic upgrades. Livability effects are game abstractions; evidence lives in docs/URBAN_RESEARCH.md.
export type Category = 'cycling' | 'transit' | 'walking' | 'greenPublic' | 'safety' | 'carDependence';

export const CATEGORY_LABELS: Record<Category, string> = {
  cycling: 'CYCLING',
  transit: 'TRANSIT',
  walking: 'WALKING',
  greenPublic: 'GREEN + PUBLIC SPACE',
  safety: 'SAFETY',
  carDependence: 'LESS CAR DEPENDENCE',
};

/** Starting category scores (0-100). Toronto starts "good but frustrating". */
export const BASE_CATEGORIES: Record<Category, number> = {
  cycling: 55, transit: 62, walking: 66, greenPublic: 64, safety: 58, carDependence: 50,
};

export interface Upgrade {
  id: string;
  name: string;
  tree: 'cycling' | 'transit' | 'walking' | 'publicSpace' | 'environment' | 'autoDependence';
  /** Points added to headline Livability */
  livability: number;
  categories: Partial<Record<Category, number>>;
  /** Map improvement patch ids applied when unlocked */
  mapPatches: string[];
  /** Short in-game blurb. Must be backed by URBAN_RESEARCH.md */
  blurb: string;
  stat?: { key: keyof EndStats; amount: number };
}

export interface EndStats {
  bikeLanes: number;
  protectedIntersections: number;
  parksCreated: number;
  transitUpgrades: number;
  treesPlanted: number;
  lanesRemoved: number;
}

export const UPGRADES: Record<string, Upgrade> = {
  queen_protected_lanes: {
    id: 'queen_protected_lanes',
    name: 'PROTECTED BIKE LANES',
    tree: 'cycling',
    livability: 4,
    categories: { cycling: 14, safety: 8, walking: 2, carDependence: 4 },
    mapPatches: ['queen_protected_lanes'],
    blurb: 'PHYSICAL SEPARATION MAKES PEOPLE OF ALL AGES FEEL SAFE ENOUGH TO RIDE.',
    stat: { key: 'bikeLanes', amount: 2 },
  },
};
