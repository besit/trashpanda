// Mission definitions (data-driven). Side-view content lives in the mission's `action` block;
// ActionScene composes it from beats: ride, arena waves (rats + SUV Rats), a boss, the streetcar escort,
// the camera chase and the build-the-street arena.
import type { RatKind } from '../action/Rat';
import type { EscortDef } from '../action/Escort';
import type { ChaseDef, BuildDef } from '../action/Parkside';
import type { PatrolDef } from '../action/Science';
import type { BossKind } from '../action/Boss';
import type { AutoScrollDef } from '../action/LaneEater';
import type { DepaveDef } from '../action/ParkingLot';

export type DistrictId = 'queenwest' | 'downtown' | 'waterfront' | 'highpark' | 'eastend';
export type SideBg = 'queen' | 'king' | 'parkside' | 'bigbox' | 'lake' | 'science' | 'gardiner';

export interface Wave { at: number; rats: RatKind[]; suvs?: number }
export interface MissionDef {
  id: string;
  title: string;
  district: DistrictId;
  upgrades: string[];
  /** missions that must be complete before this one's marker appears */
  requires?: string[];
  /** cutscene played before the side-view action / after winning (before the map payoff) */
  briefing?: string;
  debrief?: string;
  /** map y the payoff camera frames (the street that changes); focusX: where the sweep starts */
  focusY?: number;
  focusX?: number;
  /** pan the payoff camera vertically (N-S streets) instead of along x */
  focusAxis?: 'x' | 'y';
  /** M4.1: a top-down mission played on the map itself (the Bike Bus); its route is in the district's map data */
  explore?: { kind: 'bikebus'; time: number };
  /** the side-view mission (every mission but the explore ones) */
  action?: {
    bg: SideBg;
    street: 'plain' | 'paint' | 'protected' | 'escort' | 'king' | 'parkside' | 'lot' | 'quay';
    sky: 'day' | 'dusk';
    length: number; // px of street
    intro: string;
    /** a controls line under the title card (keyboard / touch) */
    hint?: [string, string];
    groundY?: number;
    waves: Wave[];
    boss?: { at: number; kind: BossKind | 'laneeater' | 'monstersuv' | 'spadigger' | 'jettug' | 'wrecker' | 'highwaymech' };
    /** M4: street dressing (construction hoardings along the sidewalk) */
    decor?: 'hoarding';
    /** M4 (mission 6): guards on watch with flashlights, and crates to hide behind */
    patrols?: PatrolDef[];
    crates?: number[];
    /** M3 (The Great Parking Lot): break up asphalt patches in a locked arena */
    depave?: DepaveDef;
    /** M3 (The Lane Eater): the screen scrolls on its own; riders to rally; ambushes */
    autoscroll?: AutoScrollDef;
    escort?: EscortDef;
    chase?: ChaseDef;
    /** the wave fought when the chase ends (the haulers drop the camera) */
    caughtWave?: RatKind[];
    build?: BuildDef & { rats: RatKind[] };
    /** combat missions: hearts shown; escort: the schedule meter instead */
    noCombat?: boolean;
  };
}

export const MISSIONS: Record<string, MissionDef> = {
  bike_lane_war: {
    id: 'bike_lane_war',
    title: 'THE BIKE LANE WAR',
    district: 'queenwest',
    upgrades: ['queen_protected_lanes'],
    briefing: 'bwl_before',
    debrief: 'bwl_after',
    focusY: 56 * 16,
    action: {
      bg: 'queen', street: 'plain', sky: 'day', length: 1750,
      intro: 'CLEAR THE RATS SO QUEEN CAN GET ITS BIKE LANE!',
      waves: [
        { at: 260, rats: ['basic', 'basic'] },
        { at: 700, rats: ['construction', 'basic'] },
        { at: 1150, rats: ['traffic', 'construction', 'basic'] },
      ],
      // M2.1 (Ivan): a boss makes the first mission feel won. Easier than the Bureaucrat.
      boss: { at: 1500, kind: 'foreman' },
    },
  },

  streetcar_through: {
    id: 'streetcar_through',
    title: 'LET THE STREETCAR THROUGH',
    district: 'queenwest',
    upgrades: ['queen_tsp'],
    requires: ['bike_lane_war'],
    briefing: 'tsp_before',
    debrief: 'tsp_after',
    focusY: 56 * 16,
    action: {
      bg: 'queen', street: 'escort', sky: 'day', length: 3300, groundY: 198, noCombat: true,
      intro: 'GET THE 501 THROUGH ON TIME!',
      hint: ['E: PUMP SIGNAL BUTTONS, CARS + CONES   SPACE: JUMP', 'RED: PUMP BUTTONS, CARS + CONES'],
      waves: [],
      escort: {
        // M2.1: "not super challenging": a 4th signal, a 2nd van, one more cone rat, less slack
        signals: [620, 1300, 2050, 2650],
        blockers: [{ at: 980, kind: 'van' }, { at: 1760, kind: 'turner' }, { at: 2420, kind: 'van' }],
        coneRats: [330, 1100, 1550, 2150, 2800],
        stops: [1500],
        end: 3150,
        allowDelay: 12,
      },
    },
  },

  king_of_street: {
    id: 'king_of_street',
    title: 'KING OF THE STREET',
    district: 'downtown',
    upgrades: ['king_transit_corridor'],
    requires: ['bike_lane_war'],
    briefing: 'king_before',
    debrief: 'king_after',
    focusY: 86 * 16,
    action: {
      bg: 'king', street: 'king', sky: 'day', length: 2500,
      intro: 'CLEAR THE THROUGH-TRAFFIC OFF KING!',
      hint: ['STOMP SUV ROOFS OR PUMP THEIR BUMPERS', 'JUMP ON SUV ROOFS, OR PUMP THEM'],
      waves: [
        { at: 280, rats: ['basic', 'basic', 'construction'] },
        { at: 860, rats: [], suvs: 3 },
        { at: 1460, rats: ['traffic', 'construction', 'basic'], suvs: 1 },
      ],
      boss: { at: 2050, kind: 'bureaucrat' },
    },
  },

  slow_down_dog: {
    id: 'slow_down_dog',
    title: 'SLOW DOWN, DOG',
    district: 'highpark',
    upgrades: ['parkside_calming'],
    requires: ['bike_lane_war'],
    briefing: 'calm_before',
    debrief: 'calm_after',
    focusX: 66 * 16,
    focusY: 20 * 16,
    focusAxis: 'y',
    action: {
      bg: 'parkside', street: 'parkside', sky: 'day', length: 2950,
      intro: 'CATCH THE RATS BEFORE THE CAMERA HITS THE POND!',
      hint: ['HOLD SHIFT TO BOOST   SPACE: JUMP THE CONES', 'YELLOW: BOOST   GREEN: JUMP THE CONES'],
      waves: [],
      chase: { lead: 210, speed: 140, pondAt: 1760, cones: [520, 860, 1180, 1420] },
      caughtWave: ['traffic', 'basic'],
      build: { at: 2250, spots: [90, 200, 310], suvs: 4, rats: ['construction', 'basic'] },
    },
  },
};

MISSIONS.lane_eater = {
  id: 'lane_eater',
  title: 'THE LANE EATER',
  district: 'highpark',
  upgrades: ['bloor_lanes_kept'],
  requires: ['slow_down_dog'],
  briefing: 'lane_before',
  debrief: 'lane_after',
  focusY: 13 * 16,
  action: {
    bg: 'queen', street: 'protected', sky: 'day', length: 3300,
    intro: 'OUTRIDE THE LANE EATER! RING YOUR BELL AT EVERY RIDER!',
    hint: ["E NEAR A RIDER, THEN STAY BESIDE THEM TILL THEY'RE ROLLING", "RED NEAR A RIDER, THEN STAY BESIDE THEM TILL THEY'RE ROLLING"],
    waves: [],
    autoscroll: {
      speed: 62, end: 2950,
      riders: [330, 560, 800, 1040, 1300, 1560, 1820, 2100, 2380, 2650],
      ambush: [{ at: 700, rats: ['construction'] }, { at: 1250, rats: ['basic', 'construction'] }, { at: 1900, rats: ['traffic', 'basic'] }, { at: 2500, rats: ['construction', 'basic'] }],
    },
    boss: { at: 2950, kind: 'laneeater' },
  },
};

MISSIONS.great_parking_lot = {
  id: 'great_parking_lot',
  title: 'THE GREAT PARKING LOT',
  district: 'eastend',
  upgrades: ['parking_to_park'],
  requires: ['king_of_street'],
  briefing: 'lot_before',
  debrief: 'lot_after',
  focusX: 70 * 16,
  focusY: 90 * 16, // M3.1: the East End was re-laid (Queen moved south)
  action: {
    bg: 'bigbox', street: 'lot', sky: 'day', length: 2300,
    intro: 'DEPAVE MEGAMART\'S LOT. TOW THE MONSTER SUV!',
    hint: ['PUMP THE CRACKED ASPHALT   STOMP SUV ROOFS', 'RED: PUMP ASPHALT   GREEN: STOMP ROOFS'],
    waves: [
      { at: 260, rats: ['basic', 'basic', 'construction'] },
      { at: 760, rats: ['traffic', 'construction'], suvs: 1 },
    ],
    depave: { at: 1250, patches: [70, 140, 210, 280, 340], rats: ['construction', 'basic', 'construction'] },
    boss: { at: 1850, kind: 'monstersuv' },
  },
};

MISSIONS.waterfront_heist = {
  id: 'waterfront_heist',
  title: 'THE WATERFRONT HEIST',
  district: 'waterfront',
  upgrades: ['public_waterfront'],
  requires: ['king_of_street'],
  briefing: 'wf_before',
  debrief: 'wf_after',
  focusX: 20 * 16, // M3.1: the re-laid Waterfront (the island is further south)
  focusY: 70 * 16,
  action: {
    bg: 'lake', street: 'quay', sky: 'dusk', length: 2450,
    intro: 'THE MEGA SPA IS FENCING OFF THE SHORE. TEAR IT DOWN!',
    // M3.1 (Ivan: "relatively easy"): bigger waves, a lobbyist guarding the fences, and a boss at the end
    hint: ['TAKE OUT THE LOBBYISTS FIRST   PUMP THE FENCES', 'GOLD RATS ARE LOBBIED: CATCH THE LOBBYIST'],
    waves: [
      { at: 300, rats: ['basic', 'lobbyist', 'basic', 'traffic'] },
      { at: 820, rats: ['construction', 'traffic', 'lobbyist', 'basic', 'basic'] },
      { at: 1700, rats: ['basic', 'construction', 'lobbyist', 'traffic', 'lobbyist', 'basic'] },
    ],
    depave: { at: 1250, patches: [70, 150, 230, 310], rats: ['basic', 'lobbyist', 'construction', 'traffic'], style: 'fence' },
    boss: { at: 2150, kind: 'spadigger' },
  },
};

// M4: SAVE THE SCIENCE. M4.1 moved it from the dropped North district to the Waterfront: a Queens Quay warehouse
// of the closed Science Centre's exhibits. Sneak past the guards' flashlights, catch the rats carrying the
// exhibits to the moving truck, then the Wrecker. The real story is URBAN_RESEARCH section 5.
MISSIONS.save_the_science = {
  id: 'save_the_science',
  title: 'SAVE THE SCIENCE',
  district: 'waterfront',
  upgrades: ['science_reopened'],
  requires: ['king_of_street'],
  briefing: 'sci_before',
  debrief: 'sci_after',
  focusX: 57 * 16,
  focusY: 47 * 16,
  action: {
    bg: 'science', street: 'plain', sky: 'day', length: 2950,
    intro: 'SNEAK PAST THE GUARDS. GET THE EXHIBITS BACK!',
    hint: ['STAY OUT OF THE BEAMS: PASS WHILE A GUARD LOOKS AWAY, OR STAND BEHIND A CRATE', 'STAY OUT OF THE BEAMS: PASS WHILE A GUARD LOOKS AWAY, OR STAND BEHIND A CRATE'],
    waves: [],
    patrols: [{ at: 470 }, { at: 820 }, { at: 1170 }],
    crates: [400, 740, 1090],
    chase: { startAt: 1350, lead: 200, speed: 118, pondAt: 2250, cones: [1650, 1900, 2080], hp: 8, goal: 'truck' },
    caughtWave: ['guard', 'basic', 'construction'],
    boss: { at: 2560, kind: 'wrecker' },
  },
};

// M4: FINISH THE LINE (Downtown). Lay the Ontario Line's track through the rats' paperwork; the Mega Rat.
MISSIONS.finish_the_line = {
  id: 'finish_the_line',
  title: 'FINISH THE LINE',
  district: 'downtown',
  upgrades: ['ontario_line'],
  requires: ['king_of_street', 'great_parking_lot'],
  briefing: 'line_before',
  debrief: 'line_after',
  focusX: 22 * 16,
  focusY: 54 * 16,
  action: {
    bg: 'king', street: 'plain', sky: 'day', length: 2650, decor: 'hoarding',
    intro: 'LAY THE TRACK. FINISH THE ONTARIO LINE!',
    hint: ['PUMP THE RAIL PILES INTO TRACK   JUMP THE MEGA RAT\'S SHOCKWAVES', 'PUMP THE RAILS   JUMP THE SHOCKWAVES'],
    waves: [
      { at: 300, rats: ['basic', 'construction', 'basic'] },
      { at: 1550, rats: ['lobbyist', 'basic', 'construction', 'traffic'] },
    ],
    depave: { at: 850, patches: [60, 130, 200, 270, 340], rats: ['traffic', 'basic', 'barrier'], style: 'rail' },
    boss: { at: 2150, kind: 'megarat' },
  },
};

// M4: DEATH BY HIGHWAY (Waterfront), the finale. Under the Gardiner: three waves, then the Highway Mech.
// Needs every other mission first; the ending follows its payoff.
MISSIONS.death_by_highway = {
  id: 'death_by_highway',
  title: 'DEATH BY HIGHWAY',
  district: 'waterfront',
  upgrades: ['gardiner_down'],
  requires: ['bike_lane_war', 'streetcar_through', 'king_of_street', 'slow_down_dog', 'lane_eater', 'great_parking_lot', 'waterfront_heist', 'island_airport', 'save_the_science', 'finish_the_line', 'bike_bus'],
  briefing: 'hw_before',
  debrief: 'hw_after',
  focusX: 60 * 16,
  focusY: 26 * 16,
  action: {
    bg: 'gardiner', street: 'plain', sky: 'dusk', length: 2650,
    intro: 'THE LAST LANE. BRING THE GARDINER DOWN!',
    hint: ['JUMP THE SHOCKWAVES   PUMP THE VENT WHEN IT OVERHEATS', 'JUMP THE SHOCKWAVES   PUMP THE VENT WHEN IT GLOWS'],
    waves: [
      { at: 300, rats: ['traffic', 'construction', 'basic', 'barrier'] },
      { at: 950, rats: ['baggage', 'lobbyist', 'basic', 'construction'] },
      { at: 1550, rats: ['guard', 'barrier', 'basic'], suvs: 2 },
    ],
    boss: { at: 2150, kind: 'highwaymech' },
  },
};

// M3.4 (Ivan: "a mission about the airport war"): GROUNDED. Dog Fjord's rats stake a jet runway through Little
// Norway Park (fiction); you pull the stakes and ground the Jet Tug. The real story is URBAN_RESEARCH section 23.
MISSIONS.island_airport = {
  id: 'island_airport',
  title: 'GROUNDED',
  district: 'waterfront',
  upgrades: ['quiet_airport'],
  requires: ['waterfront_heist'],
  briefing: 'air_before',
  debrief: 'air_after',
  focusX: 33 * 16,
  focusY: 66 * 16,
  action: {
    bg: 'lake', street: 'quay', sky: 'day', length: 2450,
    intro: 'KEEP THE RUNWAY OFF THE PARK! PULL THE STAKES!',
    hint: ['JUMP THE ROLLING SUITCASES   GET BEHIND THE BARRIER RATS', 'JUMP THE SUITCASES   GET BEHIND THE BARRIER RATS'],
    waves: [
      { at: 300, rats: ['baggage', 'basic', 'baggage'] },
      { at: 1500, rats: ['barrier', 'baggage', 'basic', 'barrier'] },
    ],
    depave: { at: 900, patches: [60, 140, 220, 300], rats: ['baggage', 'barrier', 'basic'], style: 'stakes' },
    boss: { at: 2100, kind: 'jettug' },
  },
};

/** Missions whose markers should show: not done, prerequisites met. */
/** M4.2 (Ivan): the missions in the order they open up: by the length of their chain of prerequisites, then as defined */
export function missionOrder(): string[] {
  const memo = new Map<string, number>();
  const depth = (id: string, guard = 0): number => {
    if (memo.has(id)) return memo.get(id)!;
    const d = guard > 20 ? 0 : Math.max(0, ...(MISSIONS[id]?.requires ?? []).map((r) => depth(r, guard + 1) + 1));
    memo.set(id, d);
    return d;
  };
  const ids = Object.keys(MISSIONS);
  return ids.map((id, i) => ({ id, i, d: depth(id) })).sort((a, b) => a.d - b.d || a.i - b.i).map((x) => x.id);
}

export function missionAvailable(id: string, completed: string[]) {
  const m = MISSIONS[id];
  return !!m && (m.requires ?? []).every((r) => completed.includes(r));
}

// M4.1 (Ivan): THE BIKE BUS (East End), the first mission played on the map: lead a bike bus along its route,
// stop for the kids at each stop, ring the SUVs out of the bike lane, reach the school before the bell.
// What a bike bus is, and the School Street it earns: URBAN_RESEARCH section 24.
MISSIONS.bike_bus = {
  id: 'bike_bus',
  title: 'THE BIKE BUS',
  district: 'eastend',
  upgrades: ['school_street'],
  requires: ['great_parking_lot'],
  briefing: 'bus_before',
  debrief: 'bus_after',
  focusX: 86 * 16,
  focusY: 49 * 16,
  explore: { kind: 'bikebus', time: 75 },
};
