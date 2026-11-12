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
  /** the payoff headline on the map (M2.1: shown fitted to the screen, then the blurb in a box) */
  headline?: string;
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
    headline: 'QUEEN GETS PROTECTED BIKE LANES',
    blurb: 'IN A TORONTO + VANCOUVER STUDY, SEPARATED CYCLE TRACKS HAD ABOUT 1/9 THE INJURY RISK OF BUSY STREETS WITH PARKED CARS.',
    stat: { key: 'bikeLanes', amount: 2 },
  },
  queen_tsp: {
    id: 'queen_tsp',
    name: 'TRANSIT SIGNAL PRIORITY',
    tree: 'transit',
    livability: 3,
    categories: { transit: 10, carDependence: 3 },
    mapPatches: ['queen_tsp'],
    headline: 'TORONTO SWITCHES ON TRANSIT SIGNAL PRIORITY',
    blurb: 'WHEN TORONTO TESTED STREETCAR SIGNAL PRIORITY AT SIX INTERSECTIONS, STREETCAR DELAY THERE FELL ABOUT 35%.',
    stat: { key: 'transitUpgrades', amount: 1 },
  },
  king_transit_corridor: {
    id: 'king_transit_corridor',
    name: 'KING ST TRANSIT CORRIDOR',
    tree: 'transit',
    livability: 4,
    categories: { transit: 12, walking: 6, greenPublic: 4, carDependence: 5 },
    mapPatches: ['king_transit_corridor'],
    headline: 'KING ST BECOMES A TRANSIT CORRIDOR',
    blurb: 'THE KING ST PILOT CUT RUSH-HOUR STREETCAR TRIPS BY ABOUT 4 MINUTES, AND RIDERSHIP GREW. COUNCIL MADE IT PERMANENT IN 2019.',
    stat: { key: 'transitUpgrades', amount: 1 },
  },
  parkside_calming: {
    id: 'parkside_calming',
    name: 'SCHOOL ZONE, SLOWED BY DESIGN',
    tree: 'walking',
    livability: 3,
    categories: { safety: 12, walking: 5 },
    mapPatches: ['parkside_calming'],
    // game fiction (Ivan, M2 review): in the game the camera ban is lifted; in reality it stands (URBAN_RESEARCH §2)
    headline: 'THE CAMERA BAN IS LIFTED. PARKSIDE IS SLOW BY DESIGN.',
    blurb: 'TORONTO SCHOOL-ZONE CAMERAS CUT SPEEDING 45%... AND IT CAME BACK WHEN THEY WENT. HUMPS AND RAISED CROSSINGS DON\'T GO AWAY.',
    stat: { key: 'protectedIntersections', amount: 1 },
  },
};
