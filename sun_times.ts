import { JULIAN_DAYS_2000 } from "./julian_date.ts";

const JULIAN_0 = 0.0009;

export function julianCycle(d: number, lw: number) {
  return Math.round(d - JULIAN_0 - lw / (2 * Math.PI));
}

export function approxTransit(Ht: number, lw: number, n: number) {
  return JULIAN_0 + (Ht + lw) / (2 * Math.PI) + n;
}
export function solarTransitJ(ds: number, M: number, L: number) {
  return JULIAN_DAYS_2000 + ds + 0.0053 * Math.sin(M) -
    0.0069 * Math.sin(2 * L);
}

function hourAngle(h: number, phi: number, d: number) {
  return Math.acos(
    (Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)),
  );
}
export function observerAngle(height: number) {
  return -2.076 * Math.sqrt(height) / 60;
}

// TODO: potentially address the parameter signature of the following function

/** Set time for the given sun altitude */
export function getSetJ(
  h: number,
  lw: number,
  phi: number,
  dec: number,
  n: number,
  M: number,
  L: number,
) {
  const w = hourAngle(h, phi, dec),
    a = approxTransit(w, lw, n);
  return solarTransitJ(a, M, L);
}
