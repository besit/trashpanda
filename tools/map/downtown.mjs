// Downtown district (east of Queen West). Fictionalized but faithful in its parts:
// - Queen St W with the CHUM-City building's news van bursting out of the wall (Queen + John),
//   Graffiti Alley (Rush Lane) in the laneway south of Queen, west of Spadina.
// - Spadina Ave (510 streetcar) with Chinatown at Dundas.
// - Nathan Phillips Square: City Hall's curved towers + saucer, the TORONTO sign, the reflecting pool
//   and its Freedom Arches; Osgoode Hall's fence to the west; Old City Hall's clock tower east of Bay.
// - King St W (504 streetcar): King West warehouses -> glass towers; mission 3 makes it a transit corridor.
// Rows for Dundas and Queen match Queen West so they continue across the west edge.
import { District, TS } from './common.mjs';

export const W = 120, H = 92;
export const DUNDAS = 11, QUEEN = 54, KING = 76;
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
  D.exit('w', QUEEN, 'queenwest'); D.exit('w', DUNDAS, 'queenwest');

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
  // Osgoode Hall: lawn behind its iron fence (with the famous cow gates)
  D.fill(UN + 4, DUNDAS + 7, UN + 11, QUEEN - 4, (x, y) => `lawn${(x + y) % 3}`);
  for (let y = DUNDAS + 8; y < QUEEN - 3; y += 6) D.tprop('tree_a', UN + 7, y, 8, 10, { solid: 5 });
  for (let x = UN + 4; x <= UN + 11; x++) D.tprop('fence_h', x, QUEEN - 4, 0, 14, { solidBox: [0, -4, 16, 4] });
  D.labels.push({ text: 'OSGOODE HALL', x: (UN + 8) * TS, y: 32 * TS, kind: 'landmark' });
  // Nathan Phillips Square
  const NX0 = UN + 12, NX1 = BY - 1;
  D.fill(NX0, DUNDAS + 7, NX1, QUEEN - 3, (x, y) => `plaza${(x + y) % 2}`);
  const cx = ((NX0 + NX1 + 1) / 2) * TS;
  D.prop('cityhall', cx, 34 * TS, { solidBox: [-104, -40, 208, 36], landmark: 'CITY HALL' });
  // the reflecting pool (a skating rink in winter) + Freedom Arches
  const PX0 = NX0 + 3, PX1 = NX1 - 3, PY0 = 43, PY1 = 46;
  for (let y = PY0; y <= PY1; y++) for (let x = PX0; x <= PX1; x++) D.set(x, y, y === PY0 ? 'shore_n' : y === PY1 ? 'shore_s' : `water${(x + y) % 3}`);
  D.prop('blank', cx, (PY1 + 1) * TS, { solidBox: [-(PX1 - PX0 + 1) * TS / 2 + 4, -(PY1 - PY0 + 1) * TS + 6, (PX1 - PX0 + 1) * TS - 8, (PY1 - PY0 + 1) * TS - 8], invisible: true });
  D.prop('arches', cx, (PY1 + 1) * TS - 2, { depth: (PY1 + 1) * TS });
  D.prop('torontosign', cx, 40 * TS + 4, { solidBox: [-46, -6, 92, 6] });
  D.landmarks.push({ id: 'npsquare', x: cx, y: 40 * TS + 18, label: 'NATHAN PHILLIPS SQUARE', fact: 'CITY HALL OPENED 1965.\nTHE POOL BECOMES A\nSKATING RINK IN WINTER.' });
  for (const x of [NX0 + 1, NX1 - 1]) for (let y = DUNDAS + 9; y < QUEEN - 4; y += 5) D.tprop('tree_b', x, y, 8, 10, { solid: 4 });
  // Old City Hall east of Bay
  D.objects.push({ type: 'building', key: 'bld_downtown_oldcityhall', gen: { kind: 'oldcityhall', w: 10 * TS, d: 64 }, x: (BY + 5) * TS, y: (QUEEN - 3) * TS - 64, w: 10 * TS, d: 64 });
  D.landmarks.push({ id: 'oldcityhall', x: (BY + 10) * TS, y: (QUEEN - 3) * TS + 8, label: 'OLD CITY HALL', fact: 'OPENED 1899.\nTHE CLOCK TOWER STILL\nKEEPS TIME ON QUEEN.' });

  // ---------- Queen St W ----------
  const chumX = JN + 4;
  for (const [a, b] of [[0, SP], [SP + 4, chumX], [chumX + 5, UN]]) D.row(a, b, { base: (QUEEN - 3) * TS }, 'shop', [1, 2, 2, 3], bricks);
  // the CHUM-City building at Queen + John, news van bursting out of the corner wall
  const chum = D.addBuilding(chumX * TS, 5 * TS, { w: 5 * TS, d: 48, floors: 4, brick: 'cream', seed: 299, kind: 'warehouse' }, { base: (QUEEN - 3) * TS }, { graffiti: null });
  D.prop('newsvan', chumX * TS + 10, chum.base - 30, { depth: chum.base + 0.4 });
  D.landmarks.push({ id: 'chum', x: (chumX + 2) * TS, y: (QUEEN - 3) * TS + 8, label: '299 QUEEN ST W', fact: 'THE NEWS VAN THAT\nBURST OUT OF THE WALL.' });
  // Queen south side: shop backs onto the laneway (Graffiti Alley west of Spadina)
  for (const [a, b] of [[0, SP], [SP + 4, JN], [JN + 4, UN], [UN + 4, BY], [BY + 4, W]]) D.row(a, b, { top: (QUEEN + 7) * TS }, 'rear', [1, 1, 2], bricks, 48, { graffiti: a < SP ? [3, 5] : [0, 1] });
  const laneY = QUEEN + 12;
  D.fill(0, laneY, W - 1, laneY + 1, (x) => (D.isNS(x) ? D.get(x, laneY) : 'laneway'));
  // Graffiti Alley's far wall: low garages + fences covered in pieces
  for (let x = 0; x < SP; x += 2) {
    D.prop(`graf_${(x * 7) % 9}`, x * TS + 4, (laneY + 2) * TS + 4, { depth: (laneY + 2) * TS + 4 });
  }
  D.labels.push({ text: 'GRAFFITI ALLEY', x: 7 * TS, y: (laneY + 1) * TS, kind: 'landmark' });

  // ---------- King St W ----------
  // north side: King West warehouses west of University, towers east
  wareRow(0, SP, { base: (KING - 3) * TS }); wareRow(SP + 4, JN, { base: (KING - 3) * TS }); wareRow(JN + 4, UN, { base: (KING - 3) * TS });
  towerRow(UN + 4, BY, { base: (KING - 3) * TS }, [10, 14]); towerRow(BY + 4, W, { base: (KING - 3) * TS }, [12, 16]);
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
    { text: 'UNIVERSITY', x: (UN + 2) * TS, y: 64 * TS, vertical: true },
    { text: 'BAY', x: (BY + 2) * TS, y: 64 * TS, vertical: true },
    { text: 'JOHN', x: (JN + 2) * TS, y: 66 * TS, vertical: true },
    { text: 'CHINATOWN', x: (SP + 2) * TS, y: (DUNDAS - 5) * TS, kind: 'landmark' },
    { text: 'CITY HALL', x: cx, y: 22 * TS, kind: 'landmark' },
    { text: '< QUEEN WEST', x: 4 * TS, y: (QUEEN - 4) * TS, kind: 'exit' },
  );
  return D.out({ spawn: { x: 3 * TS, y: (QUEEN - 2) * TS + 8 } });
}
