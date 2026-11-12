// The districts of the city map, west to east. Each is its own generated map; streets that cross a
// district edge continue on the neighbour at the same rows (see tools/map/common.mjs `exit`).
export interface DistrictDef { id: string; name: string; sub: string; order: number; song?: string }

export const DISTRICTS: Record<string, DistrictDef> = {
  highpark: { id: 'highpark', name: 'HIGH PARK', sub: 'RONCESVALLES - PARKSIDE - BLOOR WEST', order: 0 },
  queenwest: { id: 'queenwest', name: 'QUEEN WEST', sub: 'TRINITY BELLWOODS - LITTLE PORTUGAL', order: 1 },
  downtown: { id: 'downtown', name: 'DOWNTOWN', sub: 'KING ST - CITY HALL - CHINATOWN', order: 2 },
  eastend: { id: 'eastend', name: 'EAST END', sub: 'THE DON - RIVERSIDE - LESLIEVILLE', order: 3 },
  waterfront: { id: 'waterfront', name: 'WATERFRONT', sub: 'QUEENS QUAY - HARBOURFRONT - SUGAR BEACH', order: 4 },
};
export const DISTRICT_ORDER = Object.values(DISTRICTS).sort((a, b) => a.order - b.order).map((d) => d.id);
