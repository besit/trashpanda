// Downtown district (east of Queen West). Fictionalized but faithful in its parts:
// - Queen St W with the CHUM-City building's news van bursting out of the wall (Queen + John),
//   Graffiti Alley (Rush Lane) in the laneway south of Queen, west of Spadina.
// - Spadina Ave (510 streetcar) with Chinatown at Dundas.
// - Nathan Phillips Square: City Hall's curved towers + saucer, the TORONTO sign, the reflecting pool
//   and its Freedom Arches; Osgoode Hall's fence to the west; Old City Hall's clock tower east of Bay.
// - King St W (504 streetcar): King West warehouses -> glass towers; mission 3 makes it a transit corridor.
// Rows for Dundas and Queen match Queen West so they continue across the west edge.
import { District, TS } from './common.mjs';

export const W = 120, H = 100;
// M2.1: King moved south so Graffiti Alley fits (and is rideable) between Queen and King
export const DUNDAS = 11, QUEEN = 54, KING = 84;
export const SP = 14;   // Spadina Ave cols 14..17 (streetcar)
export const JN = 46;   // John St cols 46..49 (Queen -> King)
export const UN = 70;   // University Ave cols 70..73
export const BY = 102;  // Bay St cols 102..105

export function generateDowntown() {
  const D = new District('downtown', W, H, 1834);
  const r = D.r;
  D.fill(0, 0, W - 1, H - 1, (x, y) => `grass${(x * 7 + y * 3) % 3}`);
  D.fill(0, 0, W - 1, 2, 'laneway');

  // ---------- streets ----------
  D.ewStreet(DUNDAS); D.ewStreet(QUEEN); D.ewStreet(KING);
  D.nsStreet(SP, 0, H - 1, { tracks: true });
  D.nsStreet(JN, QUEEN + 4, H - 1);
  D.nsStreet(UN, 0, H - 1);
  D.nsStreet(BY, 0, H - 1);
  for (const row of [DUNDAS, QUEEN, KING]) { D.cross(SP, row, { nsTracks: true }); D.cross(UN, row); D.cross(BY, row); }
  D.cross(JN, QUEEN, { tee: true }); D.cross(JN, KING);
  D.exit('w', QUEEN, 'queenwest', 'queen'); D.exit('w', DUNDAS, 'queenwest', 'dundas');
  D.exit('e', QUEEN, 'eastend', 'queen'); D.exit('e', DUNDAS, 'eastend', 'dundas');
  D.exitNS('s', SP, 'waterfront', 'spadina'); D.exitNS('s', UN, 'waterfront', 'university'); D.exitNS('s', BY, 'waterfront', 'bay');

  const bricks = ['red', 'buff', 'darkred', 'red', 'cream', 'grey', 'teal', 'mustard'];
  const glass = ['blue', 'teal', 'dark', 'sky', 'bronze'];
  const towerRow = (x0, x1, align, floors, d = 48) => {
    let x = x0; const out = [];
    while (x < x1) {
      let w = r.pick([3, 4, 5]); if (x + w > x1) w = x1 - x; if (w < 3) break;
      out.push(D.addBuilding(x * TS, w * TS, { w: w * TS, d, floors: r.int(floors[0], floors[1]), glass: r.pick(glass), seed: 900 + D.bid, kind: 'tower' }, align, { graffiti: null }));
      x += w;
    }
    return out;
  };
  const wareRow = (x0, x1, align, floors = [3, 5], d = 48) => {
    let x = x0;
    while (x < x1) {
      let w = r.pick([3, 4, 4]); if (x + w > x1) w = x1 - x; if (w < 2) break;
      D.addBuilding(x * TS, w * TS, { w: w * TS, d, floors: r.int(floors[0], floors[1]), brick: r.pick(['red', 'buff', 'darkred', 'red']), seed: 700 + D.bid, kind: 'warehouse' }, align, { graffiti: null });
      x += w;
    }
  };

  // ---------- Dundas: Chinatown at Spadina ----------
  for (const [a, b] of [[0, SP], [SP + 4, UN], [UN + 4, BY], [BY + 4, W]]) D.row(a, b, { base: (DUNDAS - 3) * TS }, 'shop', [1, 2, 2], bricks);
  for (const x of [SP - 6, SP - 3, SP + 5, SP + 8, SP + 11]) D.tprop('lanterns', x, DUNDAS - 3, 8, 2, { depth: (DUNDAS - 3) * TS + 1 });

  // ---------- between Dundas and Queen ----------
  // west: mid-rise + houses (Grange Park); Nathan Phillips Square + City Hall between University and Bay
  for (const [a, b] of [[0, SP], [SP + 4, UN]]) {
    D.row(a, b, { top: (DUNDAS + 7) * TS }, ['house', 'baygable', 'shop'], [1, 2], bricks, 40);
    D.row(a, b, { base: 38 * TS }, ['baygable', 'house', 'secondempire'], [2], bricks, 40);
    for (let y = 38; y < 40; y++) for (let x = a; x < b; x++) D.set(x, y, `sidewalk${x % 3}`);
  }
  towerRow(BY + 4, W, { top: (DUNDAS + 7) * TS }, [12, 16]);
  // Nathan Phillips Square (fills University -> Bay; M2.1 dropped Osgoode Hall, which nobody could find)
  const NX0 = UN + 4, NX1 = BY - 1;
  D.fill(NX0, DUNDAS + 7, NX1, QUEEN - 3, (x, y) => `plaza${(x + y) % 2}`);
  const cx = ((NX0 + NX1 + 1) / 2) * TS;
  D.prop('cityhall', cx, 35 * TS, { solidBox: [-110, -48, 220, 44], landmark: 'CITY HALL' });
  // the reflecting pool (a skating rink in winter): the Freedom Arches span it north-south;
  // the TORONTO sign stands just above the pool's left half (Ivan's M2 notes)
  const PX0 = NX0 + 4, PX1 = NX1 - 4, PY0 = 43, PY1 = 47;
  for (let y = PY0; y <= PY1; y++) for (let x = PX0; x <= PX1; x++) D.set(x, y, y === PY0 ? 'shore_n' : y === PY1 ? 'shore_s' : `water${(x + y) % 3}`);
  D.prop('blank', cx, (PY1 + 1) * TS, { solidBox: [-(PX1 - PX0 + 1) * TS / 2 + 4, -(PY1 - PY0 + 1) * TS + 6, (PX1 - PX0 + 1) * TS - 8, (PY1 - PY0 + 1) * TS - 8], invisible: true });
  const poolW = (PX1 - PX0 + 1) * TS;
  for (let k = 1; k <= 3; k++) D.prop('arch', PX0 * TS + (poolW * k) / 4 + poolW / 8, ((PY0 + PY1 + 1) / 2) * TS + 6, { depth: (PY1 + 1) * TS });
  const signX = PX0 * TS + poolW / 4 + 8;
  D.prop('torontosign', signX, PY0 * TS - 3, { solidBox: [-46, -6, 92, 6] });
  D.landmarks.push({ id: 'npsquare', x: signX, y: PY0 * TS + 8, label: 'NATHAN PHILLIPS SQUARE', fact: 'CITY HALL OPENED 1965.\nTHE POOL BECOMES A\nSKATING RINK IN WINTER.' });
  for (const x of [NX0 + 1, NX1 - 1]) for (let y = DUNDAS + 9; y < QUEEN - 4; y += 5) D.tprop('tree_b', x, y, 8, 10, { solid: 4 });
  // Old City Hall east of Bay
  D.objects.push({ type: 'building', key: 'bld_downtown_oldcityhall', gen: { kind: 'oldcityhall', w: 10 * TS, d: 64 }, x: (BY + 5) * TS, y: (QUEEN - 3) * TS - 64, w: 10 * TS, d: 64 });
  D.landmarks.push({ id: 'oldcityhall', x: (BY + 10) * TS, y: (QUEEN - 3) * TS + 8, label: 'OLD CITY HALL', fact: 'OPENED 1899.\nTHE CLOCK TOWER STILL\nKEEPS TIME ON QUEEN.' });

  // ---------- Queen St W ----------
  for (const [a, b] of [[0, SP], [SP + 4, UN]]) D.row(a, b, { base: (QUEEN - 3) * TS }, 'shop', [1, 2, 2, 3], bricks);
  // Queen south side: shop backs onto the laneway. West of Spadina the lane is Graffiti Alley (Rush Lane):
  // every wall painted (murals on the ground floor + pieces from the graffiti sheet)
  const chumX = JN - 5;
  for (const [a, b] of [[0, SP], [SP + 4, chumX], [JN + 4, UN], [UN + 4, BY], [BY + 4, W]]) {
    let x = a;
    while (x < b) {
      let w = r.pick([2, 3, 3, 4]); if (x + w > b) w = b - x; if (w < 2) break;
      D.addBuilding(x * TS, w * TS, { w: w * TS, d: 48, floors: r.pick([1, 1, 2]), brick: r.pick(bricks), seed: 500 + D.bid, kind: 'rear', murals: a < SP }, { top: (QUEEN + 7) * TS }, { graffiti: a < SP ? [3, 5] : [0, 1] });
      x += w;
    }
  }
  // the CHUM-City building (299 Queen W): the news van bursts out of its east wall onto John St
  const chum = D.addBuilding(chumX * TS, 5 * TS, { w: 5 * TS, d: 48, floors: 2, brick: 'cream', seed: 299, kind: 'rear' }, { top: (QUEEN + 7) * TS }, { graffiti: null });
  D.prop('newsvan', JN * TS + 4, chum.base - 8, { depth: chum.base + 2 });
  D.landmarks.push({ id: 'chum', x: JN * TS + 10, y: chum.base + 10, label: '299 QUEEN ST W', fact: 'THE NEWS VAN THAT\nBURST OUT OF THE WALL.' });
  const laneY = QUEEN + 13;
  D.fill(0, laneY, W - 1, laneY + 1, (x) => (D.isNS(x) ? D.get(x, laneY) : 'laneway'));
  D.labels.push({ text: 'GRAFFITI ALLEY', x: 7 * TS, y: (laneY + 1) * TS, kind: 'landmark' });

  // ---------- King St W ----------
  // north side: King West warehouses west of University, towers east
  // (heights capped so they never cover Graffiti Alley behind them)
  wareRow(0, SP, { base: (KING - 3) * TS }, [3, 5]); wareRow(SP + 4, JN, { base: (KING - 3) * TS }, [3, 5]); wareRow(JN + 4, UN, { base: (KING - 3) * TS }, [3, 5]);
  towerRow(UN + 4, BY, { base: (KING - 3) * TS }, [8, 11], 40); towerRow(BY + 4, W, { base: (KING - 3) * TS }, [9, 12], 40);
  // south side: shop backs
  for (const [a, b] of [[0, SP], [SP + 4, JN], [JN + 4, UN], [UN + 4, BY], [BY + 4, W]]) D.row(a, b, { top: (KING + 7) * TS }, 'rear', [1, 2], bricks, 48, { graffiti: [0, 1] });

  // ---------- furniture, stops, parked cars ----------
  for (const row of [DUNDAS, QUEEN, KING]) { D.furnish(row, 's', 0, W); }
  D.furnish(DUNDAS, 'n', 0, W); D.furnish(QUEEN, 'n', 0, UN); D.furnish(KING, 'n', 0, W);
  const stopsQ = { wb: [(SP - 1) * TS, (UN - 1) * TS, (BY - 1) * TS], eb: [(SP + 5) * TS, (UN + 5) * TS, (BY + 5) * TS] };
  const stopsK = { wb: [(SP - 1) * TS, (JN - 1) * TS, (UN - 1) * TS, (BY - 1) * TS], eb: [(SP + 5) * TS, (JN + 5) * TS, (UN + 5) * TS, (BY + 5) * TS] };
  for (const c of [SP, UN, BY]) for (const row of [DUNDAS, QUEEN, KING]) { D.tprop('ttcstop', c - 2, row - 1, 8, 8); D.tprop('ttcstop', c + 5, row + 4, 8, 6); }
  const stopZone = (xs) => xs.map((s) => [s - 112, s + 24]);
  D.parkCars(DUNDAS, 'W', undefined, stopZone(stopsQ.wb)); D.parkCars(DUNDAS + 3, 'E', undefined, stopZone(stopsQ.eb));
  D.parkCars(QUEEN, 'W', undefined, stopZone(stopsQ.wb)); D.parkCars(QUEEN + 3, 'E', undefined, stopZone(stopsQ.eb));
  D.parkCars(KING, 'W', 'kingparked', stopZone(stopsK.wb)); D.parkCars(KING + 3, 'E', 'kingparked', stopZone(stopsK.eb));

  // ---------- the civic upgrade: King St transit priority corridor ----------
  // through traffic gone; red transit lanes at each intersection; curb lanes become patios + parklets
  const king = { tiles: [], addProps: [], removeTag: 'kingparked' };
  for (const c of [SP, JN, UN, BY]) for (const dx of [-3, -2, -1, 4, 5, 6]) for (const y of [KING + 1, KING + 2]) king.tiles.push([c + dx, y, dx === -2 || dx === 5 ? 'transit_red_stencil' : 'transit_red']);
  for (let x = 1; x < W - 3; x++) {
    if (D.isNS(x) || D.isNS(x + 1) || D.isNS(x - 1) || D.isNS(x + 2) || D.isNS(x - 2)) continue;
    const seg = Math.floor(x / 5) % 3;
    if (seg === 2) continue; // gaps for loading + right turns
    for (const y of [KING, KING + 3]) king.tiles.push([x, y, `deck${x % 2}`]);
    if (x % 3 === 0) {
      king.addProps.push({ type: 'prop', key: x % 2 ? 'patio_r' : 'patio_f', x: x * TS + 14, y: KING * TS + 14 });
      king.addProps.push({ type: 'prop', key: x % 2 ? 'patio_f' : 'patio_r', x: x * TS + 14, y: (KING + 3) * TS + 14 });
    }
  }
  D.improvements = { king_transit_corridor: king };

  // ---------- traffic + walkers ----------
  D.ewLanes('dundas', DUNDAS, { streetcar: true, stopsWB: stopsQ.wb, stopsEB: stopsQ.eb });
  D.ewLanes('queen', QUEEN, { streetcar: true, stopsWB: stopsQ.wb, stopsEB: stopsQ.eb, cyclists: 'mixed' });
  D.ewLanes('king', KING, { streetcar: true, stopsWB: stopsK.wb, stopsEB: stopsK.eb, noCars: 'king_transit_corridor', cyclists: 'mixed' });
  D.nsLanes('spadina', SP, { streetcar: true });
  D.nsLanes('university', UN, {});
  D.nsLanes('bay', BY, {});
  D.nsLanes('john', JN, { light: true }, QUEEN, H);

  D.markers.push({ id: 'king_of_street', x: (JN + 8) * TS, y: (KING - 2) * TS + 8, label: 'KING OF THE STREET' });
  D.labels.push(
    { text: 'DUNDAS ST W', x: 40 * TS, y: (DUNDAS + 2) * TS },
    { text: 'QUEEN ST W', x: 30 * TS, y: (QUEEN + 2) * TS },
    { text: 'KING ST W', x: 30 * TS, y: (KING + 2) * TS },
    { text: 'SPADINA', x: (SP + 2) * TS, y: 30 * TS, vertical: true },
    { text: 'UNIVERSITY', x: (UN + 2) * TS, y: 72 * TS, vertical: true },
    { text: 'BAY', x: (BY + 2) * TS, y: 72 * TS, vertical: true },
    { text: 'JOHN', x: (JN + 2) * TS, y: 74 * TS, vertical: true },
    { text: 'CHINATOWN', x: (SP + 2) * TS, y: (DUNDAS - 5) * TS, kind: 'landmark' },
    { text: 'CITY HALL', x: cx, y: 22 * TS, kind: 'landmark' },
    { text: '< QUEEN WEST', x: 4 * TS, y: (QUEEN - 4) * TS, kind: 'exit' },
    { text: 'EAST END >', x: (W - 4) * TS, y: (QUEEN - 4) * TS, kind: 'exit' },
    { text: 'v WATERFRONT', x: (UN + 2) * TS, y: (H - 2) * TS, kind: 'exit' },
  );
  // hidden extra lives: at the west end of Graffiti Alley, and tucked behind City Hall
  const lifeTokens = [{ x: 2 * TS, y: (laneY + 1) * TS + 4 }, { x: cx + 124, y: 22 * TS }];
  // easter eggs (M3.1 scoring): ride the length of Graffiti Alley
  const eggs = [{ id: 'graffiti_alley', x: 2 * TS, y: laneY * TS, w: (SP - 4) * TS, h: 2 * TS, label: 'GRAFFITI ALLEY', fact: 'RUSH LANE, SOUTH OF QUEEN:\nEVERY WALL IS PAINTED.' }];
  return D.out({ spawn: { x: 3 * TS, y: (QUEEN - 2) * TS + 8 }, lifeTokens, eggs });
}
