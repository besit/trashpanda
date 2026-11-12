// Cutscene timelines (data). Interpreted by CutsceneScene.
// Coordinates for actors are in a 384-wide "stage" that is centred on wider screens.
export type Expr = 'grin' | 'laugh' | 'shock';
export type Step =
  | { t: 'bg'; sky: 'day' | 'dusk' }
  /** pan: tracking speed in px/s (facades, street, furniture and world actors scroll together); parked: curb parking */
  | { t: 'side'; sky: 'day' | 'dusk'; street: 'plain' | 'protected' | 'paint' | 'escort' | 'king' | 'parkside' | 'lot' | 'quay'; bg?: 'queen' | 'king' | 'parkside' | 'bigbox' | 'lake'; pan?: number; parked?: boolean; patios?: boolean }
  | { t: 'pan'; to: number; ms?: number }
  | { t: 'caption'; text: string; y?: number; font?: 'font_outline' | 'font_big' | 'font_red'; hold?: number }
  | { t: 'clear' }
  | { t: 'darken'; to: number; ms?: number }
  | { t: 'music'; song: 'main' | 'dogfraud' | 'action' | 'improve' | 'none' }
  | { t: 'sfx'; name: 'laugh' | 'rumble' | 'bell' | 'construction' | 'ding' | 'streetcarBell' | 'carHonk' | 'squeak' | 'hurt' | 'signal' | 'stamp' | 'brake' | 'splash' | 'hammer' }
  | { t: 'portrait'; expr: Expr; action: 'rise' | 'set' | 'drop' }
  | { t: 'say'; who: string; text: string; expr?: Expr }
  | { t: 'shake'; ms?: number }
  | { t: 'wait'; ms: number }
  | { t: 'title'; text: string; sub?: string }
  | { t: 'dvp'; lanes: number }
  | { t: 'dvpAdd' }
  | { t: 'actor'; id: string; frame: string; anim?: string; x: number; y: number; flip?: boolean; depth?: number; atlas?: 'chars' | 'world'; sign?: string; scale?: number; /** stands on the street and scrolls with it */ world?: boolean;
      /** drives in rising from below the screen edge */ rise?: boolean;
      /** switch frame when actor `by` (or screen x) reaches this actor */ turnOn?: { frame: string; atScreenX: number; by?: string; ahead?: number; sfx?: 'signal' | 'ding' | 'bell' } }
  | { t: 'frame'; id: string; frame: string; anim?: string }
  | { t: 'move'; id: string; x: number; ms: number; wait?: boolean; ease?: string; anim?: string; y?: number; keepAnim?: boolean }
  | { t: 'hop'; id: string; dy?: number; ms?: number }
  | { t: 'rotate'; id: string; angle: number; ms?: number; ease?: string; wait?: boolean }
  | { t: 'wobble'; id: string }
  | { t: 'bang'; id: string; text?: string }
  | { t: 'clearActors' };

import { STREET_Y } from '../ui/sideLayout';

// Side-view stage lines (M2.1: everything moved up with the side view; streetcars sit on their rails)
const GROUND = STREET_Y + 28;     // the curb lane: the raccoon, rats, cars
const LANE = STREET_Y + 34;       // a cyclist riding beside the parked cars (no bike lane yet)
const BIKELANE = STREET_Y + 22;   // in the protected bike lane
const SIDEWALK = STREET_Y + 10;   // people on the far sidewalk
const PATIO = STREET_Y + 22;      // people at King St's curb-lane patios
const POLE = STREET_Y + 16;       // traffic-signal poles at the curb
const SC = { plain: STREET_Y + 46, protected: STREET_Y + 50, king: STREET_Y + 32 }; // streetcar wheels on the near rail

export const CUTSCENES: Record<string, Step[]> = {
  intro: [
    { t: 'bg', sky: 'dusk' },
    { t: 'music', song: 'none' },
    { t: 'wait', ms: 500 },
    { t: 'caption', text: 'TORONTO.', font: 'font_big', hold: 1200 },
    { t: 'caption', text: 'A PRETTY GOOD CITY.', hold: 1300 },
    { t: 'caption', text: 'WITH A FEW... PROBLEMS.', hold: 1300 },
    { t: 'clear' },
    { t: 'sfx', name: 'rumble' },
    { t: 'darken', to: 0.65, ms: 1000 },
    { t: 'music', song: 'dogfraud' },
    { t: 'portrait', expr: 'grin', action: 'rise' },
    { t: 'wait', ms: 300 },
    { t: 'portrait', expr: 'laugh', action: 'set' },
    { t: 'sfx', name: 'laugh' },
    { t: 'shake', ms: 900 },
    { t: 'caption', text: 'FRA-HA-HA-HA-HA!', font: 'font_red', y: 30, hold: 1200 },
    { t: 'clear' },
    { t: 'say', who: 'DOG FRAUD', text: 'CITIZENS! YOUR FAVOURITE DOG HAS A HISTORIC PLAN!', expr: 'grin' },
    { t: 'say', who: 'DOG FRAUD', text: 'STUCK IN TRAFFIC? I HAVE THE SOLUTION.', expr: 'grin' },
    { t: 'portrait', expr: 'grin', action: 'drop' },
    { t: 'dvp', lanes: 5 },
    { t: 'wait', ms: 2200 },
    { t: 'portrait', expr: 'grin', action: 'rise' },
    { t: 'say', who: 'DOG FRAUD', text: 'TORONTO NEEDS...', expr: 'grin' },
    { t: 'say', who: 'DOG FRAUD', text: '...ANOTHER CAR LANE!', expr: 'laugh' },
    { t: 'portrait', expr: 'laugh', action: 'drop' },
    { t: 'dvpAdd' },
    { t: 'wait', ms: 2600 },
    { t: 'title', text: 'ANOTHER CAR LANE', sub: 'DOG FRAUD\'S ANSWER TO EVERYTHING' },
    { t: 'side', sky: 'dusk', street: 'plain', parked: true },
    { t: 'darken', to: 0, ms: 10 },
    { t: 'caption', text: 'SOMEONE HAS TO STOP HIM.', y: 40, hold: 1100 },
    { t: 'caption', text: 'SOMEONE SMALL. SOMEONE FAST.', y: 54, hold: 900 },
    { t: 'music', song: 'main' },
    // tracking shot: the street streams past as the raccoon rides in, then both brake together
    { t: 'pan', to: 150 },
    { t: 'actor', id: 'tp', frame: 'rs_2', anim: 'rs_ride', x: -30, y: GROUND + 2 },
    { t: 'pan', to: 0, ms: 1500 },
    { t: 'move', id: 'tp', x: 192, ms: 1400, ease: 'Cubic.easeOut', wait: true, anim: 'rs_idle' },
    { t: 'sfx', name: 'bell' },
    { t: 'caption', text: 'SOMEONE... STRIPED.', y: 74, font: 'font_big', hold: 1600 },
  ],

  // ---- The Bike Lane War: before ----
  // Tracking shots (Ivan, M1.1): facades, sidewalk and parked cars scroll as one layer; riders hold their place.
  bwl_before: [
    { t: 'side', sky: 'day', street: 'plain', parked: true },
    { t: 'music', song: 'none' },
    { t: 'caption', text: 'QUEEN STREET WEST. 8:14 AM.', y: 18, hold: 600 },
    { t: 'actor', id: 'mom', frame: 'cys_c_0', anim: 'cys_c', x: -30, y: LANE, depth: 60 },
    { t: 'pan', to: 70, ms: 1800 },
    { t: 'move', id: 'mom', x: 150, ms: 2400, ease: 'Sine.easeOut' },
    { t: 'wait', ms: 1300 },
    { t: 'actor', id: 'sc', frame: 'streetcarside', atlas: 'world', x: -260, y: SC.plain, depth: 80 },
    { t: 'sfx', name: 'streetcarBell' },
    { t: 'move', id: 'sc', x: 120, ms: 2000, ease: 'Sine.easeOut' },
    { t: 'wait', ms: 1300 },
    { t: 'wobble', id: 'mom' },
    { t: 'bang', id: 'mom', text: '!' },
    { t: 'sfx', name: 'carHonk' },
    { t: 'wait', ms: 700 },
    { t: 'clear' },
    { t: 'caption', text: 'NO BIKE LANE. JUST STREETCAR TRACKS,', y: 20, hold: 200 },
    { t: 'caption', text: 'PARKED CARS... AND A LOT OF NERVE.', y: 32, hold: 1600 },
    { t: 'clear' },
    { t: 'move', id: 'sc', x: 640, ms: 2200, ease: 'Sine.easeIn' },
    { t: 'pan', to: 0, ms: 1800 },
    { t: 'move', id: 'mom', x: 520, ms: 2600, ease: 'Sine.easeIn', keepAnim: true },
    { t: 'music', song: 'dogfraud' },
    { t: 'wait', ms: 1500 },
    { t: 'actor', id: 'rat1', frame: 'rat_construction_0', anim: 'rat_construction_walk', x: 430, y: GROUND, flip: true, depth: 50, sign: 'ANOTHER\nCAR LANE', world: true },
    { t: 'actor', id: 'rat2', frame: 'rat_basic_0', anim: 'rat_basic_walk', x: 460, y: GROUND, flip: true, depth: 50, world: true },
    { t: 'move', id: 'rat1', x: 290, ms: 1600 },
    { t: 'move', id: 'rat2', x: 320, ms: 1600, wait: true },
    { t: 'sfx', name: 'squeak' },
    { t: 'say', who: 'RAT', text: 'BOSS SAYS THIS CURB LANE IS NOW... ANOTHER CAR LANE! SQUEAK!' },
    { t: 'actor', id: 'tp', frame: 'rs_2', anim: 'rs_ride', x: -30, y: GROUND + 2, depth: 70 },
    { t: 'move', id: 'tp', x: 90, ms: 1000, ease: 'Cubic.easeOut', wait: true, anim: 'rs_idle' },
    { t: 'sfx', name: 'bell' },
    { t: 'say', who: 'TRASH PANDA', text: 'NOPE. WHAT QUEEN NEEDS IS A BIKE LANE. A REAL ONE, WITH A CURB.' },
    { t: 'say', who: 'TRASH PANDA', text: 'CLEAR OUT THE RATS, AND THE CITY CAN BUILD IT.' },
  ],

  // ---- The Bike Lane War: after ----
  bwl_after: [
    { t: 'side', sky: 'day', street: 'protected' },
    { t: 'music', song: 'improve' },
    { t: 'caption', text: 'ONE WEEK LATER.', y: 18, hold: 500 },
    { t: 'actor', id: 'mom', frame: 'cys_c_0', anim: 'cys_c', x: -30, y: BIKELANE, depth: 60 },
    { t: 'actor', id: 'bs', frame: 'cys_a_0', anim: 'cys_a', x: -110, y: BIKELANE, depth: 59 },
    { t: 'actor', id: 'sc', frame: 'streetcarside', atlas: 'world', x: -300, y: SC.protected, depth: 80 },
    { t: 'pan', to: 60, ms: 2200 },
    { t: 'move', id: 'mom', x: 220, ms: 3200, ease: 'Sine.easeOut' },
    { t: 'move', id: 'bs', x: 120, ms: 3400, ease: 'Sine.easeOut' },
    { t: 'move', id: 'sc', x: 640, ms: 6000 },
    { t: 'wait', ms: 1600 },
    { t: 'clear' },
    { t: 'caption', text: 'SAME STREET.', y: 26, hold: 700 },
    { t: 'caption', text: 'NOW A KID CAN RIDE IT.', y: 44, font: 'font_big', hold: 1900 },
    { t: 'sfx', name: 'bell' },
    { t: 'wait', ms: 500 },
  ],

  // ---- Let the Streetcar Through: before ----
  tsp_before: [
    { t: 'side', sky: 'day', street: 'protected' },
    { t: 'music', song: 'none' },
    { t: 'caption', text: 'QUEEN ST W. RUSH HOUR.', y: 18, hold: 600 },
    { t: 'actor', id: 'sig', frame: 'sigpole_red', atlas: 'world', x: 300, y: POLE, depth: 30, world: true },
    { t: 'actor', id: 'turner', frame: 'carside_blue_r', atlas: 'world', x: 260, y: SC.protected, depth: 81, world: true },
    { t: 'actor', id: 'sc', frame: 'streetcarside', atlas: 'world', x: -260, y: SC.protected, depth: 80 },
    { t: 'sfx', name: 'streetcarBell' },
    { t: 'move', id: 'sc', x: 60, ms: 2200, ease: 'Sine.easeOut', wait: true },
    { t: 'sfx', name: 'brake' },
    { t: 'wait', ms: 500 },
    { t: 'sfx', name: 'streetcarBell' },
    { t: 'bang', id: 'turner', text: '...' },
    { t: 'caption', text: 'ONE CAR WAITING TO TURN LEFT.', y: 20, hold: 400 },
    { t: 'caption', text: 'A WHOLE STREETCAR WAITING BEHIND IT.', y: 32, hold: 1500 },
    { t: 'clear' },
    { t: 'music', song: 'dogfraud' },
    { t: 'actor', id: 'rat', frame: 'rat_traffic_0', anim: 'rat_traffic_walk', x: 440, y: BIKELANE, flip: true, depth: 50, sign: 'CARS\nFIRST', world: true },
    { t: 'move', id: 'rat', x: 350, ms: 1300, wait: true },
    { t: 'sfx', name: 'squeak' },
    { t: 'say', who: 'RAT', text: 'BOSS SAYS STREETCARS CAN WAIT. THE LIGHTS ARE FOR CARS! SQUEAK!' },
    { t: 'actor', id: 'tp', frame: 'rs_2', anim: 'rs_ride', x: -30, y: BIKELANE, depth: 90 },
    { t: 'move', id: 'tp', x: 170, ms: 1100, ease: 'Cubic.easeOut', wait: true, anim: 'rs_idle' },
    { t: 'sfx', name: 'bell' },
    { t: 'say', who: 'TRASH PANDA', text: 'BACKWARDS. THE LIGHT SHOULD WAIT FOR THE STREETCAR.' },
    { t: 'say', who: 'TRASH PANDA', text: 'STAY CLOSE, 501. I\'LL CLEAR THE WAY.' },
  ],

  // ---- Let the Streetcar Through: after ----
  // Ivan: show the streetcar sailing through green lights without stopping, each one turning green as it
  // comes up. A tracking shot on the streetcar; the signals go white-bar-green as its nose reaches them.
  tsp_after: [
    { t: 'side', sky: 'day', street: 'protected' },
    { t: 'music', song: 'improve' },
    { t: 'caption', text: 'THE NEXT MORNING.', y: 18, hold: 500 },
    { t: 'actor', id: 'sig1', frame: 'sigpole_red', atlas: 'world', x: 330, y: POLE, depth: 30, world: true, turnOn: { frame: 'sigpole_tsp', atScreenX: 0, by: 'sc', ahead: 150, sfx: 'signal' } },
    { t: 'actor', id: 'sig2', frame: 'sigpole_red', atlas: 'world', x: 620, y: POLE, depth: 30, world: true, turnOn: { frame: 'sigpole_tsp', atScreenX: 0, by: 'sc', ahead: 150, sfx: 'signal' } },
    { t: 'actor', id: 'sig3', frame: 'sigpole_red', atlas: 'world', x: 910, y: POLE, depth: 30, world: true, turnOn: { frame: 'sigpole_tsp', atScreenX: 0, by: 'sc', ahead: 150, sfx: 'signal' } },
    { t: 'actor', id: 'sc', frame: 'streetcarside', atlas: 'world', x: -200, y: SC.protected, depth: 80 },
    { t: 'actor', id: 'bs', frame: 'cys_b_0', anim: 'cys_b', x: -60, y: BIKELANE, depth: 59 },
    { t: 'move', id: 'sc', x: 120, ms: 2000, ease: 'Sine.easeOut' },
    { t: 'move', id: 'bs', x: 260, ms: 2600, ease: 'Sine.easeOut' },
    { t: 'pan', to: 95, ms: 1600 },
    { t: 'wait', ms: 2600 },
    { t: 'clear' },
    { t: 'caption', text: 'TRANSIT SIGNAL PRIORITY.', y: 22, hold: 600 },
    { t: 'caption', text: 'THE LIGHT WAITS FOR THE STREETCAR.', y: 40, font: 'font_big', hold: 2600 },
    { t: 'sfx', name: 'streetcarBell' },
    { t: 'wait', ms: 1600 },
  ],

  // ---- King of the Street: before ----
  king_before: [
    { t: 'side', sky: 'day', street: 'king', bg: 'king' },
    { t: 'music', song: 'none' },
    { t: 'caption', text: 'KING ST W. 5:40 PM.', y: 18, hold: 600 },
    { t: 'actor', id: 'c1', frame: 'carside_red', atlas: 'world', x: 180, y: SC.king + 2, depth: 70, world: true },
    { t: 'actor', id: 'c2', frame: 'suvrat_0', atlas: 'world', x: 260, y: SC.king + 2, depth: 70, world: true },
    { t: 'actor', id: 'c3', frame: 'carside_blue_r', atlas: 'world', x: 345, y: SC.king + 2, depth: 70, world: true },
    { t: 'actor', id: 'sc', frame: 'streetcarside', atlas: 'world', x: -130, y: SC.king, depth: 69 },
    { t: 'sfx', name: 'carHonk' },
    { t: 'wait', ms: 500 },
    { t: 'sfx', name: 'streetcarBell' },
    { t: 'caption', text: 'THE BUSIEST STREETCAR LINE IN TOWN...', y: 20, hold: 300 },
    { t: 'caption', text: '...STUCK BEHIND THROUGH TRAFFIC.', y: 32, hold: 1400 },
    { t: 'clear' },
    { t: 'music', song: 'dogfraud' },
    { t: 'actor', id: 'df', frame: 'dfs_pod', x: 300, y: SIDEWALK + 4, depth: 50, world: true },
    { t: 'sfx', name: 'laugh' },
    { t: 'frame', id: 'df', frame: 'dfs_podlaugh' },
    { t: 'shake', ms: 400 },
    { t: 'say', who: 'DOG FRAUD', text: 'KING STREET IS FOR KINGS! AND KINGS... DRIVE!' },
    { t: 'frame', id: 'df', frame: 'dfs_pod' },
    { t: 'actor', id: 'bur', frame: 'rat_bureaucrat_0', x: 350, y: SIDEWALK + 6, flip: true, depth: 51, world: true, sign: 'PERMIT\nDENIED' },
    { t: 'sfx', name: 'stamp' },
    { t: 'say', who: 'RAT', text: 'ALL REQUESTS FOR STREETCAR PRIORITY ARE HEREBY... DENIED! STAMP!' },
    { t: 'actor', id: 'tp', frame: 'rs_2', anim: 'rs_ride', x: -30, y: GROUND + 10, depth: 90 },
    { t: 'move', id: 'tp', x: 110, ms: 1000, ease: 'Cubic.easeOut', wait: true, anim: 'rs_idle' },
    { t: 'sfx', name: 'bell' },
    { t: 'say', who: 'TRASH PANDA', text: 'ONE STREETCAR CARRIES A CROWD. THESE CARS CARRY ONE PERSON EACH.' },
    { t: 'say', who: 'TRASH PANDA', text: 'THROUGH TRAFFIC, OFF KING. STARTING WITH YOU, PAPERWORK.' },
  ],

  // ---- King of the Street: after ----
  // Ivan: people walking around and enjoying the patios; the streetcar fully on screen, on its tracks.
  king_after: [
    { t: 'side', sky: 'day', street: 'king', bg: 'king', patios: true },
    { t: 'music', song: 'improve' },
    { t: 'caption', text: 'KING ST W. A FEW WEEKS LATER.', y: 18, hold: 500 },
    { t: 'actor', id: 'p1', frame: 'ped_a_S_0', x: 44, y: PATIO, depth: 47, scale: 2 },
    { t: 'actor', id: 'p2', frame: 'ped_e_S_0', x: 136, y: PATIO, depth: 47, scale: 2 },
    { t: 'actor', id: 'p3', frame: 'ped_d_W_0', x: 150, y: PATIO, depth: 47, scale: 2 },
    { t: 'actor', id: 'p4', frame: 'ped_g_S_0', x: 316, y: PATIO, depth: 47, scale: 2 },
    { t: 'actor', id: 'w1', frame: 'ped_b_E_0', anim: 'ped_b_E', x: -20, y: SIDEWALK, depth: 46, scale: 2 },
    { t: 'actor', id: 'w2', frame: 'ped_dog_W_0', anim: 'ped_dog_W', x: 420, y: SIDEWALK, depth: 46, scale: 2 },
    { t: 'actor', id: 'w3', frame: 'ped_kid_E_0', anim: 'ped_kid_E', x: -60, y: SIDEWALK, depth: 46, scale: 2 },
    { t: 'move', id: 'w1', x: 420, ms: 9000 },
    { t: 'move', id: 'w2', x: -40, ms: 9000 },
    { t: 'move', id: 'w3', x: 380, ms: 8000 },
    { t: 'wait', ms: 900 },
    { t: 'actor', id: 'sc', frame: 'streetcarside', atlas: 'world', x: -260, y: SC.king, depth: 70 },
    { t: 'sfx', name: 'streetcarBell' },
    { t: 'move', id: 'sc', x: 700, ms: 6400 },
    { t: 'hop', id: 'p2', dy: 3, ms: 400 },
    { t: 'wait', ms: 1800 },
    { t: 'clear' },
    { t: 'caption', text: 'STREETCARS FIRST.', y: 22, hold: 500 },
    { t: 'caption', text: 'PATIOS WHERE THE CARS USED TO SIT.', y: 40, font: 'font_big', hold: 2200 },
    { t: 'sfx', name: 'streetcarBell' },
    { t: 'wait', ms: 600 },
  ],

  // ---- Slow Down, Dog: before ----
  calm_before: [
    { t: 'side', sky: 'day', street: 'parkside', bg: 'parkside' },
    { t: 'music', song: 'none' },
    { t: 'caption', text: 'PARKSIDE DRIVE. A SCHOOL ZONE.', y: 18, hold: 600 },
    { t: 'actor', id: 'cam', frame: 'speedcam', atlas: 'world', x: 260, y: SIDEWALK + 4, depth: 30, world: true, scale: 2 },
    { t: 'actor', id: 'kid', frame: 'ped_kid_E_0', anim: 'ped_kid_E', x: 40, y: SIDEWALK, depth: 40, scale: 2 },
    { t: 'move', id: 'kid', x: 150, ms: 2400, keepAnim: true },
    { t: 'wait', ms: 900 },
    { t: 'actor', id: 'car', frame: 'suvrat_1', atlas: 'world', x: -120, y: GROUND + 8, depth: 80 },
    { t: 'sfx', name: 'carHonk' },
    { t: 'move', id: 'car', x: 640, ms: 900, wait: true },
    { t: 'bang', id: 'kid', text: '!' },
    { t: 'caption', text: 'DRIVERS TREAT IT LIKE A HIGHWAY.', y: 20, hold: 1300 },
    { t: 'clear' },
    { t: 'move', id: 'kid', x: 470, ms: 2500, keepAnim: true },
    { t: 'music', song: 'dogfraud' },
    { t: 'actor', id: 'r1', frame: 'rat_construction_0', anim: 'rat_construction_walk', x: 430, y: SIDEWALK + 6, flip: true, depth: 50, world: true },
    { t: 'actor', id: 'r2', frame: 'rat_basic_0', anim: 'rat_basic_walk', x: 470, y: SIDEWALK + 6, flip: true, depth: 51, world: true },
    { t: 'move', id: 'r1', x: 236, ms: 1500 },
    { t: 'move', id: 'r2', x: 300, ms: 1500, wait: true },
    { t: 'sfx', name: 'construction' },
    { t: 'wobble', id: 'cam' },
    { t: 'sfx', name: 'construction' },
    { t: 'wait', ms: 400 },
    // TIMBER: the camera tips over (same sprite, just rotated; M2.1) and the rats carry it off
    { t: 'rotate', id: 'cam', angle: 90, ms: 500, wait: true },
    { t: 'sfx', name: 'hurt' },
    { t: 'sfx', name: 'squeak' },
    { t: 'actor', id: 'df', frame: 'dfs_grin', x: 110, y: SIDEWALK + 6, depth: 49, world: true },
    { t: 'say', who: 'DOG FRAUD', text: 'SPEED CAMERAS? A TAX ON GOING FAST! TO THE POND WITH IT! FRA-HA-HA!' },
    { t: 'frame', id: 'r1', frame: 'rat_construction_0', anim: 'rat_construction_walk' },
    { t: 'frame', id: 'r2', frame: 'rat_basic_0', anim: 'rat_basic_walk' },
    { t: 'move', id: 'cam', x: 580, y: SIDEWALK - 12, ms: 1600 },
    { t: 'move', id: 'r1', x: 540, ms: 1600 },
    { t: 'move', id: 'r2', x: 610, ms: 1600 },
    { t: 'move', id: 'df', x: -80, ms: 1200, wait: true },
    { t: 'actor', id: 'tp', frame: 'rs_2', anim: 'rs_ride', x: -30, y: GROUND + 2, depth: 90 },
    { t: 'move', id: 'tp', x: 150, ms: 1000, ease: 'Cubic.easeOut', wait: true, anim: 'rs_idle' },
    { t: 'sfx', name: 'bell' },
    { t: 'say', who: 'TRASH PANDA', text: 'THEY\'RE HEADED FOR THE POND. I\'VE SEEN THIS ONE BEFORE.' },
    { t: 'say', who: 'TRASH PANDA', text: 'CATCH THEM. THEN FIX THIS STREET SO IT\'S SLOW BY DESIGN.' },
  ],

  // ---- Slow Down, Dog: after ----
  // Ivan: the car should slow down and roll over the hump, not shake.
  calm_after: [
    { t: 'side', sky: 'day', street: 'parkside', bg: 'parkside' },
    { t: 'music', song: 'improve' },
    { t: 'caption', text: 'PARKSIDE DRIVE. MONDAY, 8:30 AM.', y: 18, hold: 500 },
    { t: 'actor', id: 'cam', frame: 'speedcam', atlas: 'world', x: 340, y: SIDEWALK + 4, depth: 30, world: true, scale: 2 },
    { t: 'actor', id: 'hump', frame: 'humpside', atlas: 'world', x: 150, y: GROUND + 10, depth: 70, world: true },
    { t: 'actor', id: 'cross', frame: 'raisedside', atlas: 'world', x: 260, y: STREET_Y + 16, depth: 31, world: true },
    { t: 'actor', id: 'ext', frame: 'curbextside', atlas: 'world', x: 400, y: STREET_Y + 30, depth: 32, world: true },
    { t: 'actor', id: 'kid', frame: 'ped_kid_S_0', anim: 'ped_kid_S', x: 260, y: SIDEWALK, depth: 40, scale: 2 },
    { t: 'actor', id: 'car', frame: 'carside_red', atlas: 'world', x: -90, y: GROUND + 8, depth: 80, rise: true },
    { t: 'move', id: 'car', x: 118, ms: 2400, ease: 'Sine.easeOut', wait: true },
    { t: 'hop', id: 'car', dy: 4, ms: 700 },
    { t: 'move', id: 'car', x: 180, ms: 700, ease: 'Linear', wait: true },
    { t: 'move', id: 'car', x: 222, ms: 900, ease: 'Sine.easeOut', wait: true },
    { t: 'move', id: 'kid', x: 262, y: GROUND + 24, ms: 1600, wait: true },
    { t: 'move', id: 'kid', x: 262, y: STREET_Y + 72, ms: 600 },
    { t: 'move', id: 'car', x: 640, ms: 3200, ease: 'Sine.easeIn' },
    { t: 'wait', ms: 600 },
    { t: 'clear' },
    { t: 'caption', text: 'SAME STREET.', y: 22, hold: 600 },
    { t: 'caption', text: 'SLOW BY DESIGN.', y: 40, font: 'font_big', hold: 2000 },
    { t: 'sfx', name: 'bell' },
    { t: 'wait', ms: 400 },
  ],

  // ---- The Great Parking Lot: before (M3) ----
  lot_before: [
    { t: 'side', sky: 'day', street: 'lot', bg: 'bigbox' },
    { t: 'music', song: 'none' },
    { t: 'caption', text: 'MEGAMART. LESLIEVILLE.', y: 18, hold: 600 },
    { t: 'actor', id: 'c1', frame: 'carside_red', atlas: 'world', x: 60, y: GROUND + 4, depth: 60 },
    { t: 'actor', id: 'c2', frame: 'suvside', atlas: 'world', x: 150, y: GROUND + 4, depth: 60 },
    { t: 'actor', id: 'c3', frame: 'carside_blue_r', atlas: 'world', x: 245, y: GROUND + 4, depth: 60 },
    { t: 'actor', id: 'c4', frame: 'carside_red', atlas: 'world', x: 335, y: GROUND + 4, depth: 60 },
    { t: 'actor', id: 'weed', frame: 'sapling', atlas: 'world', x: 200, y: GROUND + 20, depth: 70 },
    { t: 'caption', text: 'ACRES OF ASPHALT, HALF EMPTY MOST DAYS.', y: 20, hold: 400 },
    { t: 'caption', text: 'ONE BRAVE WEED.', y: 32, hold: 1300 },
    { t: 'clear' },
    { t: 'music', song: 'dogfraud' },
    { t: 'sfx', name: 'carHonk' },
    { t: 'actor', id: 'suv', frame: 'monstersuv_1', atlas: 'world', x: 520, y: GROUND + 20, depth: 80, flip: true, rise: true },
    { t: 'move', id: 'suv', x: 230, ms: 1600, ease: 'Sine.easeOut', wait: true },
    { t: 'sfx', name: 'squeak' },
    { t: 'frame', id: 'weed', frame: 'cone' },
    { t: 'say', who: 'RAT', text: 'BY ORDER OF THE RAT KING: EVERY SQUARE METRE IS A PARKING SPOT. ESPECIALLY THAT WEED.' },
    { t: 'actor', id: 'tp', frame: 'rs_2', anim: 'rs_ride', x: -30, y: GROUND + 2, depth: 90 },
    { t: 'move', id: 'tp', x: 60, ms: 900, ease: 'Cubic.easeOut', wait: true, anim: 'rs_idle' },
    { t: 'sfx', name: 'bell' },
    { t: 'say', who: 'TRASH PANDA', text: 'A WHOLE PARK FITS IN HERE. TIME TO DEPAVE.' },
  ],

  // ---- The Great Parking Lot: after (M3) ----
  lot_after: [
    { t: 'side', sky: 'day', street: 'parkside', bg: 'parkside' },
    { t: 'music', song: 'improve' },
    { t: 'caption', text: 'THE SAME SPOT. NEXT SPRING.', y: 18, hold: 600 },
    { t: 'actor', id: 'k1', frame: 'ped_kid_E_0', anim: 'ped_kid_E', x: -20, y: SIDEWALK, depth: 40, scale: 2 },
    { t: 'actor', id: 'k2', frame: 'ped_dog_E_0', anim: 'ped_dog_E', x: -80, y: SIDEWALK, depth: 40, scale: 2 },
    { t: 'actor', id: 'b1', frame: 'cys_c_0', anim: 'cys_c', x: -140, y: GROUND, depth: 60 },
    { t: 'move', id: 'k1', x: 260, ms: 5000 },
    { t: 'move', id: 'k2', x: 200, ms: 5000 },
    { t: 'move', id: 'b1', x: 420, ms: 4200 },
    { t: 'wait', ms: 2200 },
    { t: 'caption', text: 'TREES WHERE THE CARS SAT.', y: 22, hold: 600 },
    { t: 'caption', text: 'A PARK FOR LESLIEVILLE.', y: 40, font: 'font_big', hold: 2200 },
    { t: 'sfx', name: 'bell' },
    { t: 'wait', ms: 400 },
  ],

  // ---- The Lane Eater: before (M3) ----
  lane_before: [
    { t: 'side', sky: 'day', street: 'protected' },
    { t: 'music', song: 'none' },
    { t: 'caption', text: 'BLOOR ST W. THE BIKE LANE.', y: 18, hold: 600 },
    { t: 'actor', id: 'b1', frame: 'cys_a_0', anim: 'cys_a', x: -40, y: BIKELANE, depth: 60 },
    { t: 'actor', id: 'b2', frame: 'cys_d_0', anim: 'cys_d', x: -110, y: BIKELANE, depth: 59 },
    { t: 'pan', to: 60, ms: 1400 },
    { t: 'move', id: 'b1', x: 230, ms: 2600, ease: 'Sine.easeOut' },
    { t: 'move', id: 'b2', x: 150, ms: 2800, ease: 'Sine.easeOut' },
    { t: 'wait', ms: 1400 },
    { t: 'caption', text: 'SAFE ENOUGH THAT CYCLING HERE ROSE BY HALF.', y: 20, hold: 1500 },
    { t: 'clear' },
    { t: 'pan', to: 0, ms: 1200 },
    { t: 'sfx', name: 'rumble' },
    { t: 'music', song: 'dogfraud' },
    { t: 'actor', id: 'le', frame: 'laneeater_0', atlas: 'world', x: -120, y: GROUND + 6, depth: 70 },
    { t: 'actor', id: 'df', frame: 'dfs_laugh', x: -150, y: GROUND - 46, depth: 71 },
    { t: 'move', id: 'le', x: 100, ms: 2600, ease: 'Sine.easeOut' },
    { t: 'move', id: 'df', x: 70, ms: 2600, ease: 'Sine.easeOut', wait: true },
    { t: 'sfx', name: 'construction' },
    { t: 'bang', id: 'b2', text: '!' },
    { t: 'move', id: 'b1', x: 470, ms: 1200, ease: 'Sine.easeIn', keepAnim: true },
    { t: 'move', id: 'b2', x: 440, ms: 1100, ease: 'Sine.easeIn', keepAnim: true },
    { t: 'sfx', name: 'laugh' },
    { t: 'say', who: 'DOG FRAUD', text: 'BEHOLD THE LANE EATER! IT EATS BIKE LANES AND POOPS... ANOTHER CAR LANE!' },
    { t: 'actor', id: 'tp', frame: 'rs_2', anim: 'rs_ride', x: -30, y: BIKELANE, depth: 90, flip: false },
    { t: 'move', id: 'tp', x: 300, ms: 1200, ease: 'Cubic.easeOut', wait: true, anim: 'rs_idle' },
    { t: 'sfx', name: 'bell' },
    { t: 'say', who: 'TRASH PANDA', text: 'ONE RACCOON CAN\'T STOP THAT. A STREET FULL OF RIDERS CAN.' },
    { t: 'say', who: 'TRASH PANDA', text: 'RING YOUR BELLS, BLOOR. WE RIDE TOGETHER.' },
  ],

  // ---- The Lane Eater: after (M3): the protest ride ----
  lane_after: [
    { t: 'side', sky: 'day', street: 'protected' },
    { t: 'music', song: 'improve' },
    { t: 'caption', text: 'THE NEXT SATURDAY.', y: 18, hold: 500 },
    { t: 'actor', id: 'r1', frame: 'cys_a_0', anim: 'cys_a', x: -40, y: BIKELANE, depth: 60, sign: 'KEEP\nBLOOR SAFE' },
    { t: 'actor', id: 'r2', frame: 'cys_c_0', anim: 'cys_c', x: -100, y: BIKELANE + 4, depth: 61 },
    { t: 'actor', id: 'r3', frame: 'cys_b_0', anim: 'cys_b', x: -160, y: BIKELANE, depth: 60, sign: 'BIKE LANES\nSAVE LIVES' },
    { t: 'actor', id: 'r4', frame: 'cys_d_0', anim: 'cys_d', x: -220, y: BIKELANE + 4, depth: 61 },
    { t: 'actor', id: 'tp', frame: 'rs_2', anim: 'rs_ride', x: -280, y: BIKELANE, depth: 62 },
    { t: 'actor', id: 'r5', frame: 'cys_a_0', anim: 'cys_a', x: -340, y: BIKELANE + 4, depth: 61, sign: 'WE RIDE\nBLOOR' },
    { t: 'pan', to: 70, ms: 1500 },
    { t: 'move', id: 'r1', x: 330, ms: 3600, ease: 'Sine.easeOut' },
    { t: 'move', id: 'r2', x: 275, ms: 3600, ease: 'Sine.easeOut' },
    { t: 'move', id: 'r3', x: 220, ms: 3600, ease: 'Sine.easeOut' },
    { t: 'move', id: 'r4', x: 165, ms: 3600, ease: 'Sine.easeOut' },
    { t: 'move', id: 'tp', x: 110, ms: 3600, ease: 'Sine.easeOut' },
    { t: 'move', id: 'r5', x: 55, ms: 3600, ease: 'Sine.easeOut' },
    { t: 'wait', ms: 2400 },
    { t: 'clear' },
    { t: 'caption', text: 'THE PELOTON FILLED BLOOR.', y: 22, hold: 700 },
    { t: 'caption', text: 'THE LANES STAYED.', y: 40, font: 'font_big', hold: 2200 },
    { t: 'sfx', name: 'bell' },
    { t: 'wait', ms: 500 },
  ],
};
