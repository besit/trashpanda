// Victorian house styles around Trinity Bellwoods (Ivan's M1 review): Gothic Revival bay-and-gable,
// Queen Anne (turret), Second Empire (mansard). Each returns a front elevation whose top `topH` rows
// (gable / turret cone / mansard) rise into the roof zone of the 3/4 building, plus a matching top-down roof.
import { Img } from '../lib/raster.mjs';

export const HOUSE_STYLES = ['baygable', 'queenanne', 'secondempire'];

function wall(img, x, y, w, h, b, r) {
  img.rect(x, y, w, h, b.base);
  for (let j = 0; j < h; j++) {
    if (b.tile) break;
    if (j % 3 === 2) { for (let i = 0; i < w; i++) if ((i + j) % 2 === 0) img.set(x + i, y + j, b.dark); }
    else { const off = Math.floor(j / 3) % 2 ? 2 : 0; for (let i = off; i < w; i += 5) img.set(x + i, y + j, b.dark); }
  }
  for (let i = 0; i < (w * h) / 80; i++) img.set(x + r.int(0, w - 1), y + r.int(0, h - 1), b.light);
}

function sash(img, x, y, w, h, { lit = false, arch = false, hood = false, pointed = false, trim = 'W' } = {}) {
  img.rect(x - 1, y + h, w + 2, 1, trim); // sill
  img.rect(x, y, w, h, trim);
  img.rect(x + 1, y + 1, w - 2, h - 2, lit ? 'd' : 'u');
  if (!lit) for (let i = 0; i < h - 2; i++) img.set(x + 1 + Math.min(w - 3, Math.floor(i / 2)), y + 1 + i, 'U');
  img.hline(x, x + w - 1, y + Math.floor(h / 2), trim);
  if (arch || hood) { // segmental hood / arched head
    for (let i = -1; i <= w; i++) { const t = (i - (w - 1) / 2) / ((w + 1) / 2); img.set(x + i, y - 1 - Math.round(2 * Math.sqrt(Math.max(0, 1 - t * t))), trim); }
    if (hood) img.hline(x - 1, x + w, y - 1, trim);
  }
  if (pointed) { const cx = x + (w - 1) / 2; for (let i = 0; i < 4; i++) { img.set(Math.round(cx - (w / 2) * (1 - i / 4)), y - i, trim); img.set(Math.round(cx + (w / 2) * (1 - i / 4)), y - i, trim); } img.set(Math.round(cx), y - 4, trim); for (let i = 1; i < 4; i++) img.hline(Math.round(cx - (w / 2 - 1) * (1 - i / 4)), Math.round(cx + (w / 2 - 1) * (1 - i / 4)), y - i + 1, 'u'); }
}

function door(img, x, y, h, color = 'b') {
  img.rect(x - 1, y - 3, 8, h + 3, 'W');
  img.rect(x, y - 2, 6, 2, 'Y'); // transom
  img.rect(x, y, 6, h, color); img.vline(x + 3, y, y + h - 1, 'K'); img.set(x + 4, y + Math.floor(h / 2), 'y');
}

function porch(img, x, y, w, roofC = 'G') {
  img.rect(x, y, w, 2, roofC); img.hline(x, x + w - 1, y + 2, 'k');
  for (let i = x + 1; i < x + w; i += Math.max(4, Math.floor(w / 3))) img.vline(i, y + 3, y + 15, 'W');
  for (let i = x + 1; i < x + w - 1; i += 2) img.set(i, y + 11, 'W'); // spindle rail
  img.hline(x, x + w - 1, y + 10, 'W');
}

/** Gothic Revival "bay-and-gable": Toronto's signature Victorian. */
function bayGable(w, floors, b, r) {
  const groundH = 16, floorH = 15, wallH = floors * floorH + groundH + 3;
  const gw = w <= 32 ? w : Math.round(w * 0.55), gx = r.chance(0.5) ? 0 : w - gw;
  const topH = Math.round(gw * 0.55) + 3;
  const img = new Img(w, topH + wallH);
  wall(img, 0, topH, w, wallH, b, r);
  // steep gable over the bay
  const apexX = gx + (gw - 1) / 2;
  for (let y = 3; y < topH; y++) { const t = (y - 3) / (topH - 3), hw = t * (gw / 2); wall(img, Math.round(apexX - hw), y, Math.max(1, Math.round(hw * 2)), 1, b, r); }
  // gingerbread bargeboard: white rakes with a scalloped underside, finial at the apex
  for (let y = 3; y < topH + 1; y++) {
    const t = (y - 3) / (topH - 3), hw = t * (gw / 2);
    for (const s of [-1, 1]) { const x = Math.round(apexX + s * hw); img.set(x, y, 'W'); img.set(x - s, y, 'W'); if (y % 3 === 0) img.set(x - 2 * s, y + 1, 'H'); }
  }
  img.vline(Math.round(apexX), 0, 3, 'W');
  sash(img, Math.round(apexX) - 2, topH - Math.round(topH * 0.45), 5, 7, { pointed: true });
  // two-storey bay window under the gable
  const bw = gw - 6, bx = gx + 3, by = topH + 3;
  const bayH = floors * floorH + 6;
  img.rect(bx, by, bw, bayH, b.light); img.rect(bx + 2, by, bw - 4, bayH, b.base);
  img.vline(bx, by, by + bayH - 1, 'W'); img.vline(bx + bw - 1, by, by + bayH - 1, 'H');
  for (let f = 0; f < floors; f++) {
    const fy = by + f * floorH + 3;
    sash(img, bx + 1, fy, 3, 9, { trim: 'H' }); sash(img, bx + bw - 4, fy, 3, 9, { trim: 'H' });
    sash(img, Math.round(bx + bw / 2) - 3, fy, 6, 9, { hood: true, lit: r.chance(0.15) });
  }
  img.hline(bx - 1, bx + bw, by - 1, 'W'); img.hline(bx - 1, bx + bw, by + bayH, 'W');
  // the other half: door + porch, upper windows
  const ox = gx === 0 ? gw : 0, ow = w - gw;
  if (ow >= 12) {
    for (let f = 0; f < floors; f++) sash(img, ox + Math.round(ow / 2) - 3, topH + 5 + f * floorH, 6, 9, { hood: true });
    porch(img, ox, topH + wallH - groundH - 2, ow);
    door(img, ox + Math.round(ow / 2) - 3, topH + wallH - 12, 12);
  } else {
    door(img, gx === 0 ? w - 8 : 1, topH + wallH - 12, 12);
  }
  img.hline(0, w - 1, topH + wallH - 2, 's'); img.hline(0, w - 1, topH + wallH - 1, 'k'); // foundation
  return { img, topH, roofKind: 'gable', gx, gw };
}

/** Queen Anne: asymmetric, round corner turret with a candle-snuffer roof, fish-scale shingled gable. */
function queenAnne(w, floors, b, r) {
  const groundH = 16, floorH = 15, wallH = floors * floorH + groundH + 3;
  const tw = 14, right = r.chance(0.5), tx = right ? w - tw : 0;
  const coneH = 20, topH = coneH + 6;
  const img = new Img(w, topH + wallH);
  wall(img, 0, topH, w, wallH, b, r);
  // fish-scale gable over the main block
  const gx = right ? 0 : tw, gw = w - tw, apexX = gx + (gw - 1) / 2, gH = Math.min(topH - 2, Math.round(gw * 0.5));
  for (let y = topH - gH; y < topH; y++) {
    const t = (y - (topH - gH)) / gH, hw = t * (gw / 2);
    for (let x = Math.round(apexX - hw); x <= Math.round(apexX + hw); x++) img.set(x, y, ((x + (Math.floor(y / 2) % 2) * 2) % 4 === 0 && y % 2) ? 'x' : (y % 2 ? 'j' : 'X'));
    img.set(Math.round(apexX - hw), y, 'W'); img.set(Math.round(apexX + hw), y, 'W');
  }
  sash(img, Math.round(apexX) - 2, topH - Math.round(gH * 0.55), 5, 6, { arch: true });
  // the turret: a cylinder (light-to-dark across), rising one band above the eaves
  const tTop = topH - 6;
  const ramp = [b.light, b.light, b.light, b.base, b.base, b.base, b.base, b.base, b.base, b.base, b.dark, b.dark, b.dark, 'k'];
  for (let i = 0; i < tw; i++) img.vline(tx + i, tTop, topH + wallH - groundH, ramp[i]);
  for (let f = 0; f < floors + 1; f++) { const fy = tTop + 3 + f * floorH; if (fy + 9 < topH + wallH - groundH) { sash(img, tx + 2, fy, 3, 8, { trim: 'H' }); sash(img, tx + 6, fy, 3, 8, {}); } }
  img.hline(tx, tx + tw - 1, tTop, 'W');
  // conical slate roof + finial
  const tcx = tx + (tw - 1) / 2;
  for (let y = 0; y < coneH; y++) { const hw = ((y + 1) / coneH) * (tw / 2 + 2); for (let x = Math.round(tcx - hw); x <= Math.round(tcx + hw); x++) img.set(x, tTop - coneH + y, x < tcx - hw / 3 ? 'G' : (y % 3 === 0 && x % 2 ? 'G' : 'g')); }
  img.vline(Math.round(tcx), tTop - coneH - 3, tTop - coneH, 'y');
  // wraparound porch + door + upper window
  porch(img, gx, topH + wallH - groundH - 2, gw, 'g');
  door(img, gx + Math.round(gw / 2) - 3, topH + wallH - 12, 12, 'E');
  for (let f = 0; f < floors; f++) sash(img, gx + Math.round(gw / 2) - 4, topH + 5 + f * floorH, 8, 9, { hood: true, lit: r.chance(0.2) });
  img.hline(0, w - 1, topH + wallH - 2, 's'); img.hline(0, w - 1, topH + wallH - 1, 'k');
  return { img, topH, roofKind: 'hip', tx, tw };
}

/** Second Empire: slate mansard with dormers, bracketed cornice, hooded windows. */
function secondEmpire(w, floors, b, r) {
  const groundH = 16, floorH = 15, mH = 13, wallH = floors * floorH + groundH + 3;
  const topH = mH;
  const img = new Img(w, topH + wallH);
  wall(img, 0, topH, w, wallH, b, r);
  // mansard: a steep slate band (trapezoid), fish-scale courses, iron cresting on top
  for (let y = 0; y < mH; y++) {
    const inset = Math.round(((mH - 1 - y) / (mH - 1)) * 3);
    for (let x = inset; x < w - inset; x++) img.set(x, y, (y % 3 === 1 && (x + y) % 3 === 0) ? 'G' : (x === inset ? 'G' : x === w - inset - 1 ? 'k' : 'g'));
  }
  for (let x = 3; x < w - 3; x += 2) img.set(x, 0, 'K');
  // dormers with round pediments
  const nd = Math.max(1, Math.round(w / 18));
  for (let k = 0; k < nd; k++) {
    const dx = Math.round(((k + 0.5) * w) / nd) - 4;
    img.rect(dx, 3, 8, mH - 3, 'H'); img.rect(dx + 1, 4, 6, mH - 4, 'W');
    sash(img, dx + 2, 6, 4, 6, { trim: 'W' });
    for (let i = 0; i < 8; i++) { const t = (i - 3.5) / 4; img.set(dx + i, 3 - Math.round(2 * Math.sqrt(Math.max(0, 1 - t * t))), 'W'); }
  }
  // bracketed cornice
  img.rect(0, mH, w, 2, 'W'); img.hline(0, w - 1, mH + 2, 'H');
  for (let x = 1; x < w; x += 4) { img.set(x, mH + 2, 'k'); img.set(x, mH + 3, 'k'); }
  // tall hooded windows + double door
  const nWin = Math.max(2, Math.round(w / 15));
  for (let f = 0; f < floors; f++) for (let k = 0; k < nWin; k++) sash(img, Math.round(((k + 0.5) * w) / nWin) - 3, topH + 7 + f * floorH, 6, 10, { hood: true, lit: r.chance(0.12) });
  const dX = Math.round(w / 2) - 4;
  door(img, dX, topH + wallH - 13, 13, 'w'); door(img, dX + 3, topH + wallH - 13, 13, 'w');
  img.rect(dX - 2, topH + wallH - 2, 12, 2, 'T'); // stone steps
  img.hline(0, w - 1, topH + wallH - 1, 'k');
  return { img, topH, roofKind: 'mansard' };
}

export function styledFacade(kind, w, floors, b, r) {
  if (kind === 'queenanne' && w >= 40) return queenAnne(w, floors, b, r);
  if (kind === 'secondempire') return secondEmpire(w, floors, b, r);
  return bayGable(w, floors, b, r);
}

/** Matching top-down roof (depth d) for the 3/4 view. */
export function styledRoof(w, d, info, r) {
  const img = new Img(w, d);
  if (info.roofKind === 'mansard') {
    img.rect(0, 0, w, d, 'G');
    for (let i = 0; i < (w * d) / 20; i++) img.set(r.int(0, w - 1), r.int(0, d - 1), 's');
    for (let k = 0; k < 5; k++) { img.hline(k, w - 1 - k, k, k % 2 ? 'g' : 'G'); img.hline(k, w - 1 - k, d - 1 - k, 'g'); img.vline(k, k, d - 1 - k, 'G'); img.vline(w - 1 - k, k, d - 1 - k, 'k'); }
    for (let x = 5; x < w - 5; x += 2) { img.set(x, 5, 'K'); img.set(x, d - 6, 'K'); } // cresting
    return img;
  }
  // pitched shingles, ridge running front-to-back; light from the left
  const ridge = info.roofKind === 'gable' ? (info.gx ?? 0) + (info.gw ?? w) / 2 : w / 2;
  for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) img.set(x, y, x < ridge ? (y % 3 === 0 ? 'g' : 'G') : (y % 3 === 0 ? 'k' : 'g'));
  img.vline(Math.round(ridge), 0, d - 1, 'h');
  if (info.roofKind === 'hip' && info.tw) { const cx = info.tx + info.tw / 2; img.circle(cx, d - 6, 6, 'g'); img.circle(cx - 1, d - 7, 3, 'G'); img.set(cx, d - 6, 'y'); }
  // a brick chimney
  const cx = r.pick([2, w - 6]); img.rect(cx, 2, 4, 5, 'B'); img.hline(cx, cx + 3, 2, 'n');
  return img;
}
