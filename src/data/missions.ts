// Mission definitions (data-driven). Side-view content lives in the mission's `action` block.
export interface MissionDef {
  id: string;
  title: string;
  district: 'queenwest' | 'downtown' | 'north' | 'waterfront' | 'highpark' | 'eastend';
  upgrades: string[];
  /** cutscene played before the side-view action / after winning (before the map payoff) */
  briefing?: string;
  debrief?: string;
  /** map y the payoff camera frames (the street that changes) */
  focusY?: number;
  action: {
    street: 'plain' | 'paint' | 'protected';
    sky: 'day' | 'dusk';
    length: number; // px of street
    waves: { at: number; rats: ('basic' | 'construction' | 'traffic')[] }[];
    intro: string;
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
      street: 'plain',
      sky: 'day',
      length: 1400,
      intro: 'CLEAR THE RATS SO QUEEN CAN GET ITS BIKE LANE!',
      waves: [
        { at: 260, rats: ['basic', 'basic'] },
        { at: 700, rats: ['construction', 'basic'] },
        { at: 1150, rats: ['traffic', 'construction', 'basic'] },
      ],
    },
  },
};
