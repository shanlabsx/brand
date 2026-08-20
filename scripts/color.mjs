// Color science primitives: sRGB <-> OKLab/OKLCH conversion (Björn Ottosson, 2020),
// WCAG 2 contrast, and a perceptually-uniform tone generator used to derive new
// brand shades from an approved anchor color instead of hand-picking hex values.

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

export function hexToRgb(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) throw new Error(`Invalid hex color: ${hex}`);
  const int = Number.parseInt(match[1], 16);
  return { r: (int >> 16 & 255) / 255, g: (int >> 8 & 255) / 255, b: (int & 255) / 255 };
}

export function rgbToHex({ r, g, b }) {
  const channel = (value) => Math.round(clamp01(value) * 255).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c) {
  const clamped = clamp01(c);
  return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

// Relative luminance per WCAG 2 (uses gamma-correct sRGB -> linear, not OKLab).
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rl, gl, bl] = [r, g, b].map(srgbToLinear);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

export function contrastRatio(hexA, hexB) {
  const values = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function linearRgbToOklab({ r, g, b }) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  };
}

function oklabToLinearRgb({ L, a, b }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  };
}

function oklabToOklch({ L, a, b }) {
  const C = Math.hypot(a, b);
  let H = Math.atan2(b, a) * 180 / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

function oklchToOklab({ L, C, H }) {
  const rad = H * Math.PI / 180;
  return { L, a: C * Math.cos(rad), b: C * Math.sin(rad) };
}

export function hexToOklch(hex) {
  const { r, g, b } = hexToRgb(hex);
  return oklabToOklch(linearRgbToOklab({ r: srgbToLinear(r), g: srgbToLinear(g), b: srgbToLinear(b) }));
}

function oklchToLinearRgb(oklch) {
  return oklabToLinearRgb(oklchToOklab(oklch));
}

function inGamut(linearRgb) {
  const eps = 1e-4;
  return linearRgb.r >= -eps && linearRgb.r <= 1 + eps
    && linearRgb.g >= -eps && linearRgb.g <= 1 + eps
    && linearRgb.b >= -eps && linearRgb.b <= 1 + eps;
}

// CSS Color 4 style gamut mapping: hold L and H fixed, binary-search C down
// until the color lands inside sRGB. Keeps hue and perceived lightness intact
// instead of naive per-channel clamping, which shifts hue at the gamut edge.
function clipToGamut(oklch) {
  if (inGamut(oklchToLinearRgb(oklch))) return oklch;
  let lo = 0;
  let hi = oklch.C;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    const candidate = { ...oklch, C: mid };
    if (inGamut(oklchToLinearRgb(candidate))) lo = mid;
    else hi = mid;
  }
  return { ...oklch, C: lo };
}

export function oklchToHex(oklch) {
  const clipped = clipToGamut(oklch);
  const { r, g, b } = oklchToLinearRgb(clipped);
  return rgbToHex({ r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b) });
}

/**
 * Derive a new shade at a target perceptual lightness while preserving the hue
 * and the relative chroma "shape" of a seed color, so generated steps read as
 * the same color family rather than a desaturated/muddy guess.
 *
 * chromaScale lets a step be more restrained (near white/black, where sRGB gamut
 * is narrow) or fuller (mid-tones) than the seed's own chroma.
 */
export function toneAt(seedHex, targetL, chromaScale = 1) {
  const seed = hexToOklch(seedHex);
  return oklchToHex({ L: targetL, C: seed.C * chromaScale, H: seed.H });
}

/**
 * Find the smallest shift away from the seed's own lightness — darkening for
 * direction 'darken', lightening for 'lighten' — whose contrast against
 * `background` reaches at least `minRatio`. Preserves hue; chroma is carried
 * over from the seed and gamut-clipped, so saturation fades only as much as
 * sRGB physically allows at that lightness instead of an arbitrary guess.
 */
export function accessibleTone(seedHex, background, { minRatio = 4.5, direction = 'darken', chromaScale = 1 } = {}) {
  const seed = hexToOklch(seedHex);
  const toneAtL = (L) => oklchToHex({ L, C: seed.C * chromaScale, H: seed.H });
  if (contrastRatio(seedHex, background) >= minRatio) return seedHex;

  // Invariant: the "good" bound always satisfies minRatio; converge toward
  // the boundary closest to the seed's own lightness (the least drastic fix).
  let good = direction === 'darken' ? 0 : 1;
  let bad = seed.L;
  for (let i = 0; i < 40; i += 1) {
    const mid = (good + bad) / 2;
    if (contrastRatio(toneAtL(mid), background) >= minRatio) good = mid;
    else bad = mid;
  }
  return toneAtL(good);
}
