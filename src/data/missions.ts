// Mission definitions (data-driven). Side-view content lives in the mission's `action` block.
export interface MissionDef {
  id: string;
  title: string;
  district: 'queenwest' | 'downtown' | 'north' | 'waterfront' | 'highpark' | 'eastend';
  upgrades: string[];
  action: {
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
    action: {
      sky: 'day',
      length: 1400,
      intro: 'DOG FRAUD\'S RATS ARE RIPPING OUT THE BIKE LANE!',
      waves: [
        { at: 260, rats: ['basic', 'basic'] },
        { at: 700, rats: ['construction', 'basic'] },
        { at: 1150, rats: ['traffic', 'construction', 'basic'] },
      ],
    },
  },
};
