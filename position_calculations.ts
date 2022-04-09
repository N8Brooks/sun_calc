/* One degree to radians */
export const DEGREES_TO_RADIANS = Math.PI / 180;

/** Obliquity of the earth */
const EARTH_OBLIQUITY = 23.4397 * DEGREES_TO_RADIANS;

export function rightAscension(l: number, b: number): number {
  return Math.atan2(
    Math.sin(l) * Math.cos(EARTH_OBLIQUITY) -
      Math.tan(b) * Math.sin(EARTH_OBLIQUITY),
    Math.cos(l),
  );
}

export function declination(l: number, b: number): number {
  return Math.asin(
    Math.sin(b) * Math.cos(EARTH_OBLIQUITY) +
      Math.cos(b) * Math.sin(EARTH_OBLIQUITY) * Math.sin(l),
  );
}

export function azimuth(H: number, phi: number, dec: number) {
  return Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi),
  );
}

export function altitude(H: number, phi: number, dec: number) {
  return Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H),
  );
}

export function sideRealTime(d: number, lw: number) {
  return (280.16 + 360.9856235 * d) * DEGREES_TO_RADIANS - lw;
}

export function astronomicalRefraction(h: number) {
  if (h < 0) {
    console.warn("Clipping `h` to `0`");
    h = 0;
  }

  return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}
