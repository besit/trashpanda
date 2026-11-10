// Cutscene timelines (data). Interpreted by CutsceneScene.
// Coordinates for actors are in a 384-wide "stage" that is centred on wider screens.
export type Expr = 'grin' | 'laugh' | 'shock';
export type Step =
  | { t: 'bg'; sky: 'day' | 'dusk' }
  | { t: 'side'; sky: 'day' | 'dusk'; street: 'plain' | 'protected' | 'paint'; pan?: number }
  | { t: 'caption'; text: string; y?: number; font?: 'font_outline' | 'font_big' | 'font_red'; hold?: number }
  | { t: 'clear' }
  | { t: 'darken'; to: number; ms?: number }
  | { t: 'music'; song: 'main' | 'dogfraud' | 'action' | 'improve' | 'none' }
  | { t: 'sfx'; name: 'laugh' | 'rumble' | 'bell' | 'construction' | 'ding' | 'streetcarBell' | 'carHonk' | 'squeak' | 'hurt' }
  | { t: 'portrait'; expr: Expr; action: 'rise' | 'set' | 'drop' }
  | { t: 'say'; who: string; text: string; expr?: Expr }
  | { t: 'shake'; ms?: number }
  | { t: 'wait'; ms: number }
  | { t: 'title'; text: string; sub?: string }
  | { t: 'dvp'; lanes: number }
  | { t: 'dvpAdd' }
  | { t: 'actor'; id: string; frame: string; anim?: string; x: number; y: number; flip?: boolean; depth?: number; atlas?: 'chars' | 'world'; sign?: string }
  | { t: 'move'; id: string; x: number; ms: number; wait?: boolean; ease?: string; anim?: string }
  | { t: 'wobble'; id: string }
  | { t: 'bang'; id: string; text?: string }
  | { t: 'clearActors' };

const GROUND = 196; // side-view curb-lane ground line for actors

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
    { t: 'side', sky: 'dusk', street: 'plain' },
    { t: 'darken', to: 0, ms: 10 },
    { t: 'caption', text: 'SOMEONE HAS TO STOP HIM.', y: 40, hold: 1100 },
    { t: 'caption', text: 'SOMEONE SMALL. SOMEONE FAST.', y: 54, hold: 900 },
    { t: 'music', song: 'main' },
    { t: 'actor', id: 'tp', frame: 'rs_2', anim: 'rs_ride', x: -30, y: GROUND + 2 },
    { t: 'move', id: 'tp', x: 192, ms: 1400, ease: 'Cubic.easeOut', wait: true, anim: 'rs_idle' },
    { t: 'sfx', name: 'bell' },
    { t: 'caption', text: 'SOMEONE... STRIPED.', y: 74, font: 'font_big', hold: 1600 },
  ],

  // ---- The Bike Lane War: before ----
  bwl_before: [
    { t: 'side', sky: 'day', street: 'plain' },
    { t: 'music', song: 'none' },
    { t: 'caption', text: 'QUEEN STREET WEST. 8:14 AM.', y: 18, hold: 600 },
    { t: 'actor', id: 'car1', frame: 'carside_red', atlas: 'world', x: 250, y: GROUND - 6, depth: 40 },
    { t: 'actor', id: 'car2', frame: 'suvside', atlas: 'world', x: 340, y: GROUND - 6, depth: 40 },
    { t: 'actor', id: 'mom', frame: 'cys_c_0', anim: 'cys_c', x: -30, y: GROUND + 4, depth: 60 },
    { t: 'move', id: 'mom', x: 150, ms: 2400, ease: 'Sine.easeOut' },
    { t: 'wait', ms: 900 },
    { t: 'actor', id: 'sc', frame: 'streetcarside', atlas: 'world', x: -260, y: GROUND + 32, depth: 80 },
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
    { t: 'move', id: 'sc', x: 600, ms: 2200, ease: 'Sine.easeIn' },
    { t: 'music', song: 'dogfraud' },
    { t: 'actor', id: 'rat1', frame: 'rat_construction_0', anim: 'rat_construction_walk', x: 430, y: GROUND, flip: true, depth: 50, sign: 'ANOTHER\nCAR LANE' },
    { t: 'actor', id: 'rat2', frame: 'rat_basic_0', anim: 'rat_basic_walk', x: 460, y: GROUND, flip: true, depth: 50 },
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
    { t: 'actor', id: 'mom', frame: 'cys_c_0', anim: 'cys_c', x: -30, y: GROUND - 6, depth: 60 },
    { t: 'actor', id: 'bs', frame: 'cys_a_0', anim: 'cys_a', x: -110, y: GROUND - 6, depth: 59 },
    { t: 'actor', id: 'sc', frame: 'streetcarside', atlas: 'world', x: -300, y: GROUND + 34, depth: 80 },
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
};
