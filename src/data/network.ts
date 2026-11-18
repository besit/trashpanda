// M4.3 (Ivan: "comparing Toronto to Amsterdam/Copenhagen is very broad when we didn't change the bike infrastructure
// to their level... change the city with every mission so that more streets have bike lanes, until every street has a
// protected bike lane or the cars have to go slow and the bikes can take up the full lane").
// THE BIKE NETWORK: every street on the five maps, and the mission that fixes it. PROTECTED = a curb-separated lane
// each way; SLOW = humps + sharrows, cars at cycling speed, bikes take the lane (King: through traffic gone).
// The geometry + tile patches live in the district generators (tools/map/*.mjs: netEW / netNS / netStreet); a street
// whose mission payoff already does it (Queen, Bloor, Parkside, King, Lake Shore) names that patch instead.
// This is the game's plan (RACCOON TRANSIT PLAN, fiction); what each street is like today is simplified.
import type { DistrictId } from './missions';

export type NetKind = 'protected' | 'slow';
export interface NetStreet {
  id: string; district: DistrictId; name: string; kind: NetKind;
  /** the mission that adds it to the network; null = it's there from the start (the Martin Goodman Trail) */
  by: string | null;
}

const S = (id: string, district: DistrictId, name: string, kind: NetKind, by: string | null): NetStreet => ({ id, district, name, kind, by });

export const NETWORK: NetStreet[] = [
  S('wf_queensquay', 'waterfront', 'QUEENS QUAY', 'protected', null),
  // 1 the Bike Lane War: Queen, right across town
  S('qw_queen', 'queenwest', 'QUEEN ST W', 'protected', 'bike_lane_war'),
  S('dt_queen', 'downtown', 'QUEEN ST W', 'protected', 'bike_lane_war'),
  // 2 Let the Streetcar Through: Trinity Bellwoods' side streets
  S('qw_ossington', 'queenwest', 'OSSINGTON AVE', 'slow', 'streetcar_through'),
  S('qw_bellwoods', 'queenwest', 'BELLWOODS AVE', 'slow', 'streetcar_through'),
  // 3 King of the Street
  S('dt_king', 'downtown', 'KING ST W', 'slow', 'king_of_street'),
  S('dt_john', 'downtown', 'JOHN ST', 'slow', 'king_of_street'),
  // 4 Slow Down, Dog
  S('hp_parkside', 'highpark', 'PARKSIDE DR', 'slow', 'slow_down_dog'),
  S('hp_ronc', 'highpark', 'RONCESVALLES AVE', 'protected', 'slow_down_dog'),
  // 5 the Lane Eater
  S('hp_bloor', 'highpark', 'BLOOR ST W', 'protected', 'lane_eater'),
  S('hp_queensway', 'highpark', 'THE QUEENSWAY', 'protected', 'lane_eater'),
  // 6 the Great Parking Lot
  S('ee_gerrard', 'eastend', 'GERRARD ST E', 'protected', 'great_parking_lot'),
  S('ee_carlaw', 'eastend', 'CARLAW AVE', 'slow', 'great_parking_lot'),
  // 7 the Waterfront Heist: Strachan's painted lanes become protected, all the way down to the lake
  S('qw_strachan', 'queenwest', 'STRACHAN AVE', 'protected', 'waterfront_heist'),
  S('wf_strachan', 'waterfront', 'STRACHAN AVE', 'protected', 'waterfront_heist'),
  // 8 Save the Science
  S('dt_spadina', 'downtown', 'SPADINA AVE', 'protected', 'save_the_science'),
  S('wf_spadina', 'waterfront', 'SPADINA AVE', 'protected', 'save_the_science'),
  // 9 Dock Drop (bike share needs somewhere safe to ride)
  S('dt_university', 'downtown', 'UNIVERSITY AVE', 'protected', 'dock_drop'),
  S('wf_university', 'waterfront', 'UNIVERSITY AVE', 'protected', 'dock_drop'),
  // 10 Finish the Line
  S('dt_bay', 'downtown', 'BAY ST', 'protected', 'finish_the_line'),
  S('wf_bay', 'waterfront', 'BAY ST', 'protected', 'finish_the_line'),
  // 11 Grounded: out to the Spit
  S('ee_leslie', 'eastend', 'LESLIE ST', 'protected', 'island_airport'),
  S('ee_queen', 'eastend', 'QUEEN ST E', 'protected', 'island_airport'),
  // 12 the Bike Bus
  S('ee_broadview', 'eastend', 'BROADVIEW AVE', 'protected', 'bike_bus'),
  S('ee_dundas', 'eastend', 'DUNDAS ST E', 'protected', 'bike_bus'),
  // 13 Death by Highway: Lake Shore, and Dundas across the west end
  S('wf_lakeshore', 'waterfront', 'LAKE SHORE BLVD', 'protected', 'death_by_highway'),
  S('qw_dundas', 'queenwest', 'DUNDAS ST W', 'protected', 'death_by_highway'),
  S('dt_dundas', 'downtown', 'DUNDAS ST W', 'protected', 'death_by_highway'),
];

export const NETWORK_TOTAL = NETWORK.length;

/** the streets on the network after these missions */
export function networkDone(completed: readonly string[]): NetStreet[] {
  return NETWORK.filter((s) => s.by === null || completed.includes(s.by));
}
/** improvement ids to apply on the maps (`net_<id>`) for these missions; patch-backed streets have none of their own */
export function networkPatches(completed: readonly string[]): string[] {
  return networkDone(completed).map((s) => `net_${s.id}`);
}
/** what a mission adds */
export function missionNetwork(id: string): NetStreet[] { return NETWORK.filter((s) => s.by === id); }
/** "BIKE NETWORK 7/28" */
export function networkLabel(completed: readonly string[]): string { return `BIKE NETWORK ${networkDone(completed).length}/${NETWORK_TOTAL}`; }
