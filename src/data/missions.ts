// Mission definitions (data-driven). Side-view content lives in the mission's `action` block;
// ActionScene composes it from beats: ride, arena waves (rats + SUV Rats), a boss, the streetcar escort,
// the camera chase and the build-the-street arena.
import type { RatKind } from '../action/Rat';
import type { EscortDef } from '../action/Escort';
import type { ChaseDef, BuildDef } from '../action/Parkside';

export type DistrictId = 'queenwest' | 'downtown' | 'north' | 'waterfront' | 'highpark' | 'eastend';

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
  action: {
    bg: 'queen' | 'king' | 'parkside';
    street: 'plain' | 'paint' | 'protected' | 'escort' | 'king' | 'parkside';
    sky: 'day' | 'dusk';
    length: number; // px of street
    intro: string;
    /** a controls line under the title card (keyboard / touch) */
    hint?: [string, string];
    groundY?: number;
    waves: Wave[];
    boss?: { at: number; kind: 'bureaucrat' };
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
      bg: 'queen', street: 'plain', sky: 'day', length: 1400,
      intro: 'CLEAR THE RATS SO QUEEN CAN GET ITS BIKE LANE!',
      waves: [
        { at: 260, rats: ['basic', 'basic'] },
        { at: 700, rats: ['construction', 'basic'] },
        { at: 1150, rats: ['traffic', 'construction', 'basic'] },
      ],
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
      bg: 'queen', street: 'escort', sky: 'day', length: 2900, groundY: 212, noCombat: true,
      intro: 'GET THE 501 THROUGH ON TIME!',
      hint: ['E: PUMP SIGNAL BUTTONS, CARS + CONES   SPACE: JUMP', 'RED: PUMP BUTTONS, CARS + CONES'],
      waves: [],
      escort: {
        signals: [620, 1380, 2180],
        blockers: [{ at: 1000, kind: 'van' }, { at: 1820, kind: 'turner' }],
        coneRats: [330, 1150, 1950, 2400],
        stops: [1600],
        end: 2760,
        allowDelay: 15,
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
    focusY: 78 * 16,
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

/** Missions whose markers should show: not done, prerequisites met. */
export function missionAvailable(id: string, completed: string[]) {
  const m = MISSIONS[id];
  return !!m && (m.requires ?? []).every((r) => completed.includes(r));
}
