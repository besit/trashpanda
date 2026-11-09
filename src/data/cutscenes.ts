// Cutscene timelines (data). Interpreted by CutsceneScene.
export type Step =
  | { t: 'bg'; sky: 'day' | 'dusk' }
  | { t: 'caption'; text: string; y?: number; font?: 'font_outline' | 'font_big' | 'font_red'; hold?: number }
  | { t: 'clear' }
  | { t: 'darken'; to: number; ms?: number }
  | { t: 'music'; song: 'main' | 'dogfraud' | 'action' | 'none' }
  | { t: 'sfx'; name: 'laugh' | 'rumble' | 'bell' | 'construction' | 'ding' }
  | { t: 'portrait'; expr: 'grin' | 'laugh' | 'shock'; action: 'rise' | 'set' | 'drop' }
  | { t: 'say'; who: string; text: string; expr?: 'grin' | 'laugh' | 'shock' }
  | { t: 'shake'; ms?: number }
  | { t: 'wait'; ms: number }
  | { t: 'title'; text: string; sub?: string }
  | { t: 'lanes'; count: number };

export const CUTSCENES: Record<string, Step[]> = {
  intro: [
    { t: 'bg', sky: 'dusk' },
    { t: 'music', song: 'none' },
    { t: 'wait', ms: 600 },
    { t: 'caption', text: 'TORONTO.', font: 'font_big', hold: 1300 },
    { t: 'caption', text: 'A PRETTY GOOD CITY.', hold: 1500 },
    { t: 'caption', text: 'WITH A FEW... PROBLEMS.', hold: 1500 },
    { t: 'clear' },
    { t: 'sfx', name: 'rumble' },
    { t: 'darken', to: 0.65, ms: 1200 },
    { t: 'music', song: 'dogfraud' },
    { t: 'portrait', expr: 'grin', action: 'rise' },
    { t: 'wait', ms: 400 },
    { t: 'portrait', expr: 'laugh', action: 'set' },
    { t: 'sfx', name: 'laugh' },
    { t: 'shake', ms: 900 },
    { t: 'caption', text: 'FRA-HA-HA-HA-HA!', font: 'font_red', y: 30, hold: 1300 },
    { t: 'clear' },
    { t: 'say', who: 'DOG FRAUD', text: 'CITIZENS! I HAVE A HISTORIC NEW TRANSPORTATION PLAN!', expr: 'grin' },
    { t: 'say', who: 'DOG FRAUD', text: 'TORONTO NEEDS...', expr: 'grin' },
    { t: 'say', who: 'DOG FRAUD', text: '...ANOTHER LANE.', expr: 'laugh' },
    { t: 'portrait', expr: 'laugh', action: 'drop' },
    { t: 'sfx', name: 'construction' },
    { t: 'lanes', count: 1 },
    { t: 'title', text: 'ANOTHER LANE', sub: 'STARTING WITH YOUR BIKE LANE' },
    { t: 'wait', ms: 600 },
  ],
};
