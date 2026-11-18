// Civic upgrades. Livability effects are game abstractions; evidence lives in docs/URBAN_RESEARCH.md.
export type Category = 'cycling' | 'transit' | 'walking' | 'greenPublic' | 'safety' | 'carDependence';

export const CATEGORY_LABELS: Record<Category, string> = {
  cycling: 'CYCLING',
  transit: 'TRANSIT',
  walking: 'WALKING',
  greenPublic: 'GREEN + PUBLIC SPACE',
  safety: 'SAFETY',
  carDependence: 'LESS CAR DEPENDENCE',
};

/** Starting category scores (0-100). Toronto starts "good but frustrating". */
export const BASE_CATEGORIES: Record<Category, number> = {
  cycling: 55, transit: 62, walking: 66, greenPublic: 64, safety: 58, carDependence: 50,
};

export interface Upgrade {
  id: string;
  name: string;
  tree: 'cycling' | 'transit' | 'walking' | 'publicSpace' | 'environment' | 'autoDependence';
  /** Points added to headline Livability */
  livability: number;
  categories: Partial<Record<Category, number>>;
  /** Map improvement patch ids applied when unlocked */
  mapPatches: string[];
  /** Short in-game blurb. Must be backed by URBAN_RESEARCH.md */
  blurb: string;
  /** M3.3 (Ivan: 'links to prove the sources'): the source named in the game; the links are in URBAN_RESEARCH.md */
  source: string;
  /** the payoff headline on the map (M2.1: shown fitted to the screen, then the blurb in a box) */
  headline?: string;
  stat?: { key: keyof EndStats; amount: number };
}

export interface EndStats {
  bikeLanes: number;
  protectedIntersections: number;
  parksCreated: number;
  transitUpgrades: number;
  treesPlanted: number;
  lanesRemoved: number;
}

export const UPGRADES: Record<string, Upgrade> = {
  queen_protected_lanes: {
    id: 'queen_protected_lanes',
    name: 'PROTECTED BIKE LANES',
    tree: 'cycling',
    livability: 4,
    categories: { cycling: 14, safety: 8, walking: 2, carDependence: 4 },
    mapPatches: ['queen_protected_lanes'],
    headline: 'QUEEN GETS PROTECTED BIKE LANES',
    blurb: 'IN A TORONTO + VANCOUVER STUDY, SEPARATED CYCLE TRACKS HAD ABOUT 1/9 THE INJURY RISK OF BUSY STREETS WITH PARKED CARS.',
    source: 'TESCHKE ET AL. 2012, AMERICAN JOURNAL OF PUBLIC HEALTH 102(12)',
    stat: { key: 'bikeLanes', amount: 2 },
  },
  queen_tsp: {
    id: 'queen_tsp',
    name: 'TRANSIT SIGNAL PRIORITY',
    tree: 'transit',
    livability: 2,
    categories: { transit: 10, carDependence: 3 },
    mapPatches: ['queen_tsp'],
    headline: 'TORONTO SWITCHES ON TRANSIT SIGNAL PRIORITY',
    blurb: 'WHEN TORONTO TESTED STREETCAR SIGNAL PRIORITY AT SIX INTERSECTIONS, STREETCAR DELAY THERE FELL ABOUT 35%.',
    source: 'TTC + ONTARIO MTO 1991 TRIAL, IN THE US DOT ITS KNOWLEDGE RESOURCES (2007-B00362)',
    stat: { key: 'transitUpgrades', amount: 1 },
  },
  king_transit_corridor: {
    id: 'king_transit_corridor',
    name: 'KING ST TRANSIT CORRIDOR',
    tree: 'transit',
    livability: 4,
    categories: { transit: 12, walking: 6, greenPublic: 4, carDependence: 5 },
    mapPatches: ['king_transit_corridor'],
    headline: 'KING ST BECOMES A TRANSIT CORRIDOR',
    blurb: 'THE KING ST PILOT CUT RUSH-HOUR STREETCAR TRIPS BY ABOUT 4 MINUTES, AND RIDERSHIP GREW. COUNCIL MADE IT PERMANENT IN 2019.',
    source: 'CITY OF TORONTO, KING STREET PILOT DASHBOARDS + 2019 STAFF REPORT',
    stat: { key: 'transitUpgrades', amount: 1 },
  },
  parkside_calming: {
    id: 'parkside_calming',
    name: 'SCHOOL ZONE, SLOWED BY DESIGN',
    tree: 'walking',
    livability: 3,
    categories: { safety: 12, walking: 5 },
    mapPatches: ['parkside_calming'],
    // game fiction (Ivan, M2 review): in the game the camera ban is lifted; in reality it stands (URBAN_RESEARCH §2)
    headline: 'THE CAMERA BAN IS LIFTED. PARKSIDE IS SLOW BY DESIGN.',
    blurb: 'TORONTO SCHOOL-ZONE CAMERAS CUT SPEEDING 45%... AND IT CAME BACK WHEN THEY WENT. HUMPS AND RAISED CROSSINGS DON\'T GO AWAY.',
    source: 'SICKKIDS + TORONTO METROPOLITAN UNIVERSITY, INJURY PREVENTION (2025)',
    stat: { key: 'protectedIntersections', amount: 1 },
  },
  public_waterfront: {
    id: 'public_waterfront',
    name: 'THE SHORE STAYS PUBLIC',
    tree: 'publicSpace',
    livability: 3,
    categories: { greenPublic: 12, walking: 4, cycling: 3 },
    mapPatches: ['public_waterfront'],
    headline: 'THE FENCES ARE DOWN. THE WATERFRONT IS EVERYONE\'S.',
    blurb: 'THE MEGA SPA IS FICTION. BUT IN 2024 ONTARIO SIGNED A 95-YEAR LEASE FOR A PRIVATE SPA AT ONTARIO PLACE, AND ABOUT 850 TREES THERE WERE CUT DOWN. WHO IS THE WATERFRONT FOR?',
    source: 'THE PUBLISHED LEASE TERMS (OCT 2024), AS REPORTED BY CBC, CTV AND GLOBAL NEWS',
    stat: { key: 'parksCreated', amount: 1 },
  },
  parking_to_park: {
    id: 'parking_to_park',
    name: 'THE LOT BECOMES A PARK',
    tree: 'publicSpace',
    livability: 3,
    categories: { greenPublic: 12, walking: 5, carDependence: 4 },
    mapPatches: ['parking_to_park'],
    headline: 'MEGAMART\'S PARKING LOT IS A PARK NOW.',
    blurb: 'IN DECEMBER 2021 TORONTO STOPPED REQUIRING MOST NEW BUILDINGS TO INCLUDE CAR PARKING. LESS ASPHALT BY LAW: MORE ROOM FOR HOMES, TREES AND PARKS.',
    source: 'CITY OF TORONTO COUNCIL ITEM PH29.3 (DEC 2021) + BY-LAW 89-2022',
    stat: { key: 'parksCreated', amount: 1 },
  },
  ontario_line: {
    id: 'ontario_line',
    name: 'THE ONTARIO LINE',
    tree: 'transit',
    livability: 4,
    categories: { transit: 14, carDependence: 5, walking: 2 },
    mapPatches: ['ontario_line'],
    headline: 'THE ONTARIO LINE OPENS. FIFTEEN STATIONS.',
    // game fiction: it opens today; URBAN_RESEARCH section 8 has the real schedule
    blurb: 'IN THE GAME IT OPENS TODAY. IN REALITY: 15.6 KM AND 15 STATIONS FROM EXHIBITION TO THE SCIENCE CENTRE, TUNNELLING DOWNTOWN SINCE APRIL 2026, A BILL OF ABOUT $34 BILLION, AND AN OPENING "IN THE EARLY 2030S".',
    source: 'METROLINX (COST AND SCHEDULE UPDATE, AUGUST 2026, AS REPORTED BY THE HUB); THE ONTARIO LINE PROJECT',
    stat: { key: 'transitUpgrades', amount: 1 },
  },
  gardiner_down: {
    id: 'gardiner_down',
    name: 'THE GARDINER COMES DOWN',
    tree: 'autoDependence',
    livability: 5,
    categories: { carDependence: 12, greenPublic: 8, walking: 6, cycling: 4 },
    mapPatches: ['gardiner_down'],
    headline: 'THE DECK COMES DOWN. THE LAKE COMES BACK.',
    // game fiction: Toronto chose to rebuild the east Gardiner in 2016; the evidence is URBAN_RESEARCH section 9
    blurb: 'THE GAME TEARS THE WHOLE DECK DOWN; IN 2015 TORONTO VOTED 24-21 TO KEEP ITS EAST END. BUT SEOUL REMOVED 5.8 KM OF ELEVATED HIGHWAY FOR A STREAM AND A PARK, AND NINE YEARS ON A STUDY FOUND THE FEARED JAMS NEVER CAME.',
    source: 'TRANSPORT POLICY (2012) ON SEOUL\'S CHEONGGYECHEON; TORONTO CITY COUNCIL, GARDINER EAST VOTE (JUNE 11, 2015)',
    stat: { key: 'lanesRemoved', amount: 6 },
  },
  science_reopened: {
    id: 'science_reopened',
    name: 'SCIENCE BY THE LAKE',
    tree: 'publicSpace',
    livability: 2,
    categories: { greenPublic: 6, walking: 3, transit: 3 },
    mapPatches: ['science_reopened'],
    // M4.1: the warehouse, the rats and the pop-up are game fiction; the closure, the storage, the interim site and
    // the 2029 date are real (URBAN_RESEARCH section 5)
    headline: 'THE BOARDS COME DOWN. THE EXHIBITS COME BACK OUT.',
    blurb: 'ONTARIO SHUT THE DON MILLS SCIENCE CENTRE IN JUNE 2024 OVER ITS ROOF PANELS AND PUT THE EXHIBITS IN STORAGE. A SMALLER INTERIM CENTRE OPENED AT HARBOURFRONT IN JUNE 2026; THE NEW ONE AT ONTARIO PLACE IS DUE IN 2029. THE RATS AND THE WAREHOUSE ARE FICTION.',
    source: 'ONTARIO MINISTRY OF INFRASTRUCTURE (JUNE 21, 2024); AUDITOR GENERAL OF ONTARIO (DEC 2024); GLOBAL NEWS (JUNE 29, 2026)',
    stat: { key: 'parksCreated', amount: 1 },
  },
  school_street: {
    id: 'school_street',
    name: 'A SCHOOL STREET',
    tree: 'walking',
    livability: 2,
    categories: { safety: 5, cycling: 3, walking: 3, carDependence: 2 },
    mapPatches: ['school_street'],
    // M4.1: the route, the school and its School Street are the game's; bike buses and School Streets are real (URBAN_RESEARCH section 24)
    headline: 'THE BIKE BUS RUNS. THE STREET OUTSIDE THE SCHOOL CLOSES TO CARS AT THE BELL.',
    blurb: 'A BIKE BUS IS A GROUP RIDE TO SCHOOL: A SET ROUTE, GROWN-UPS LEADING, KIDS JOINING AT STOPS ALONG THE WAY. TORONTO PARENTS RUN THEM. A "SCHOOL STREET" CLOSES THE ROAD OUTSIDE A SCHOOL TO CARS AT DROP-OFF; TORONTO TRIED ONE ON MOUNTVIEW AVE IN 2019.',
    source: 'GREEN COMMUNITIES CANADA (ONTARIO BIKE BUSES); TORONTO STAR (APRIL 28, 2024); 8 80 CITIES (MOUNTVIEW AVE SCHOOL STREET, 2019)',
    stat: { key: 'protectedIntersections', amount: 1 },
  },
  quiet_airport: {
    id: 'quiet_airport',
    name: 'THE PARK STAYS A PARK',
    tree: 'publicSpace',
    livability: 2,
    categories: { greenPublic: 8, safety: 4, walking: 3 },
    mapPatches: ['quiet_airport'],
    headline: 'NO JETS. LITTLE NORWAY PARK STAYS A PARK.',
    // the stakes are fiction; the outcome is real (URBAN_RESEARCH section 23)
    blurb: 'THE STAKES ARE FICTION. BUT IN 2026 ONTARIO PASSED A LAW TO TAKE OVER THE ISLAND AIRPORT FOR JETS, AND IN JULY OTTAWA, WHICH HAS THE FINAL SAY, SAID NO: SAFETY WORK ONLY.',
    source: 'TRANSPORT CANADA (MINISTER STEVEN MACKINNON, JULY 2026), AS REPORTED BY CBC, GLOBAL NEWS AND THE CANADIAN PRESS',
    stat: { key: 'parksCreated', amount: 1 },
  },
  bloor_lanes_kept: {
    id: 'bloor_lanes_kept',
    name: 'BLOOR KEEPS ITS BIKE LANES',
    tree: 'cycling',
    livability: 3,
    categories: { cycling: 10, safety: 5, walking: 2 },
    mapPatches: ['bloor_lanes_kept'],
    // game fiction: in 2026 the province is removing Bloor's lanes (URBAN_RESEARCH §1, §19)
    headline: 'THE PELOTON FILLS BLOOR. THE BIKE LANES STAY.',
    blurb: 'AFTER BLOOR GOT BIKE LANES IN 2016, CYCLING ON IT ROSE 49%, AND A STUDY FOUND MORE ECONOMIC ACTIVITY ALONG THE STREET, NOT LESS.',
    source: 'CITY OF TORONTO 2017 BLOOR PILOT EVALUATION; TCAT BLOOR ECONOMIC IMPACT STUDY (2019)',
    stat: { key: 'bikeLanes', amount: 2 },
  },
  // M4.3 (Ivan: "citybikes... a big part of Toronto cycling scene. And I love that they are expanding"): unbranded in
  // the game; the numbers are the real system's (URBAN_RESEARCH section 25)
  bike_share_grows: {
    id: 'bike_share_grows',
    name: 'BIKE SHARE, EVERYWHERE',
    tree: 'cycling',
    livability: 3,
    categories: { cycling: 8, carDependence: 4, transit: 2 },
    mapPatches: ['bike_share_grows'],
    headline: 'SIX NEW STATIONS. SHARE BIKES ON EVERY STREET.',
    blurb: 'TORONTO\'S BIKE SHARE BEGAN IN 2011. IN 2025 RIDERS TOOK 7.8 MILLION TRIPS ON IT, 180 NEW STATIONS WENT IN (ITS BIGGEST YEAR YET), AND IT REACHED ALL 25 WARDS. THE GAME\'S BIKES ARE UNBRANDED.',
    source: 'CITY OF TORONTO, 2025 TORONTO CYCLING YEAR IN REVIEW (MARCH 2026); TORONTO OPEN DATA, BIKE SHARE RIDERSHIP',
  },
};
