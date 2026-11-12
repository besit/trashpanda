// The districts of the city map, west to east. Each is its own generated map; streets that cross a
// district edge continue on the neighbour at the same rows (see tools/map/common.mjs `exit`).
/** short: the name in the city map's district strip when the full names don't fit */
export interface DistrictDef { id: string; name: string; short: string; sub: string; order: number; song?: string }

export const DISTRICTS: Record<string, DistrictDef> = {
  highpark: { id: 'highpark', name: 'HIGH PARK', short: 'HIGH PK', sub: 'RONCESVALLES - PARKSIDE - BLOOR WEST', order: 0 },
  queenwest: { id: 'queenwest', name: 'QUEEN WEST', short: 'QUEEN W', sub: 'TRINITY BELLWOODS - LITTLE PORTUGAL', order: 1 },
  downtown: { id: 'downtown', name: 'DOWNTOWN', short: 'DOWNTOWN', sub: 'KING ST - CITY HALL - CHINATOWN', order: 2 },
  eastend: { id: 'eastend', name: 'EAST END', short: 'EAST END', sub: 'THE DON - RIVERSIDE - LESLIEVILLE', order: 3 },
  waterfront: { id: 'waterfront', name: 'WATERFRONT', short: 'LAKE', sub: 'QUEENS QUAY - HARBOURFRONT - SUGAR BEACH', order: 4 },
};
export const DISTRICT_ORDER = Object.values(DISTRICTS).sort((a, b) => a.order - b.order).map((d) => d.id);
