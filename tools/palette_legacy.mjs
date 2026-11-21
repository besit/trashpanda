// M4.10: the colours added for the code-drawn portraits (M4.8 and M4.9), moved out of the game palette.
// The game no longer needs them once the hero images replace those portraits. Only the old portrait code loads them
// (tools/sprites/portraits.mjs, tools/sprites/portraits_next.mjs, and the art history versions of them), so it still
// renders. Importing this file registers them (tools/lib/raster.mjs registerColors).
import { registerColors } from './lib/raster.mjs';

export const LEGACY_PORTRAIT_COLOURS = {
  // ---- M4.8 portrait ramps (additive; hue-shifted: shadows lean blue-violet, lights lean warm) ----
  // raccoon fur, cool blue-grey, 9 steps dark -> light
  0: '#1c1a2a', 1: '#29283c', 2: '#3a3a53', 3: '#4f516b', 4: '#686c85', 5: '#8589a0', 6: '#a4a8ba', 7: '#c6c8d3', 8: '#e4e3e6',
  // raccoon fur, warm taupe (an alternative coat), 9 steps dark -> light (@ # $ I % & J * +)
  '@': '#241a27', '#': '#36293a', $: '#4d3c4a', I: '#655058', '%': '#7f6866', '&': '#9a8378', J: '#b39e8f', '*': '#cbb9a8', '+': '#e2d6c4',
  // Dog Fjord's skin: steps between the existing pinks (= deepest crease, ? between p and P, ^ between P and m, ~ between m and M)
  '=': '#5f2339', '?': '#b8495b', '^': '#ee837e', '~': '#ffbcaa',
  // amber eyes: dark rim, warm mid, bright amber, the lit lower iris
  '<': '#4d2914', '>': '#a35a1e', '{': '#e39a35', '}': '#ffd98c',
  // bandana red mid step, pump yellow deep shadow, teal deep + light
  '[': '#a51e2b', '|': '#a14e14', ':': '#123f47', ';': '#86e3cf',
  // suit navy steps, warm metal shine
  ',': '#101a38', '_': '#3a64ad', '`': '#fff9e8',
  // round 02: a chestnut ramp for Dog Fjord's patch (deep, dark, base, lit), a dusty pink-grey for inner ears
  '(': '#43201a', ')': '#6e3422', '!': '#9c4f2c', '"': '#c8743f', "'": '#6f4a55', '-': '#9a6f78',
  // round 05/06: Dog Fjord's skin in hue-shifted planes: a clear warm pink-peach light, a highlight with a whisper of
  // ochre, a clean pink mid, a pink side plane, a rosy-red terminator, a cool mauve core shadow, a deep mauve crease, a
  // cool bounce light
  '/': '#ffbaa4', '¢': '#ffdac4', Q: '#f79d97', '£': '#e3868b', 9: '#e86e78', '§': '#a65f78', '¤': '#73405b', '°': '#c88c9e',
  // M4.9: the yellow pump's ramp gets a warm ochre step between o (its shadow) and y (its base)
  '¥': '#ea9526',
  // M4.9 round 03: hue-shifted portrait keys: the coat's cool violet-brown shadows, a warm terminator glow and a warm
  // light; a cool lilac shadow for cream fur; Dog Fjord's cool mauve shadow plane; the suit's blue-violet shadow and
  // warm light; a neutral grey-lilac rim of reflected light
  'µ': '#4f3c56', '¶': '#6e5272', '©': '#a8765e', '®': '#d2b08a', '²': '#a49aae', '³': '#b06a8c', '¹': '#232566', '¼': '#5a78b8', '½': '#b4b6d2',
  // round 04: the coat's shadow pulled back toward the coat (a warm violet-brown plane and core); Dog's far side as a
  // rose-mauve shadow, 1.5 value groups below his lit pink
  'ª': '#7a5f66', 'º': '#584452', '»': '#c27585',
};
registerColors(LEGACY_PORTRAIT_COLOURS);
