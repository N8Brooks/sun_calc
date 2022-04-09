import { unimplemented } from "./deps.ts";
import { fromJulian, toDays } from "./julian_date.ts";
import { moonCoordinates } from "./moon.ts";
import {
  altitude,
  astronomicalRefraction,
  azimuth,
  declination,
  DEGREES_TO_RADIANS,
  sideRealTime,
} from "./position.ts";
import { eclipticLongitude, solarMeanAnomaly, sunCoordinates } from "./sun.ts";
import {
  approxTransit,
  getSetJ,
  julianCycle,
  observerAngle,
  solarTransitJ,
} from "./sun_times.ts";

/** Notable times for sun position */
export interface SolarTimes {
  solarNoon: Date;
  nadir: Date;
}

/** Notable times in the morning */
export interface MorningTimes {
  sunrise: Date;
  sunriseEnd: Date;
  dawn: Date;
  nauticalDawn: Date;
  nightEnd: Date;
  goldenHourEnd: Date;
}

/** Notable times in the evening */
export interface EveningTimes {
  sunset: Date;
  sunsetStart: Date;
  dusk: Date;
  nauticalDusk: Date;
  night: Date;
  goldenHour: Date;
}

/** Type of sun times configuration */
export type SunTime = {
  angle: number;
  morning: keyof MorningTimes;
  evening: keyof EveningTimes;
};

/** Sun configuration times */
export const SUN_TIMES: SunTime[] = [
  { angle: -0.833, morning: "sunrise", evening: "sunset" },
  { angle: -0.3, morning: "sunriseEnd", evening: "sunsetStart" },
  { angle: -6, morning: "dawn", evening: "dusk" },
  { angle: -12, morning: "nauticalDawn", evening: "nauticalDusk" },
  { angle: -18, morning: "nightEnd", evening: "night" },
  { angle: 6, morning: "goldenHourEnd", evening: "goldenHour" },
];

/** Calculates sun position for a given date and latitude and longitude */
export function getPosition(date: Date, latitude: number, longitude: number) {
  const lw = DEGREES_TO_RADIANS * -longitude;
  const phi = DEGREES_TO_RADIANS * latitude;
  const d = toDays(date);

  const { rightAscension, declination } = sunCoordinates(d);
  const H = sideRealTime(d, lw) - rightAscension;

  return {
    azimuth: azimuth(H, phi, declination),
    altitude: altitude(H, phi, declination),
  };
}

/**
 * Calculates sun times for a given date, latitude and longitude,
 * and optional observer height in meters relative to the horizon.
 */
export function getTimes(
  date: Date,
  latitude: number,
  longitude: number,
  height?: number,
) {
  height = height || 0;

  const phi = DEGREES_TO_RADIANS * latitude;
  const lw = DEGREES_TO_RADIANS * -longitude;

  const dh = observerAngle(height);

  const d = toDays(date);
  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);

  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L, 0);

  const jNoon = solarTransitJ(ds, M, L);

  // TODO: all times interfaces could use better typing

  const times: Record<string, Date> = {
    solarNoon: fromJulian(jNoon),
    nadir: fromJulian(jNoon - 0.5),
  };

  for (let i = 0; i < SUN_TIMES.length; i++) {
    const { angle, morning, evening } = SUN_TIMES[i];
    const h0 = (angle + dh) * DEGREES_TO_RADIANS;

    const jSet = getSetJ(h0, lw, phi, dec, n, M, L);
    const jRise = jNoon - (jSet - jNoon);

    times[morning] = fromJulian(jSet);
    times[evening] = fromJulian(jRise);
  }

  return times as unknown as SolarTimes & MorningTimes & EveningTimes;
}

/** Calculates moon position for a given date */
export function getMoonPosition(
  date: Date,
  latitude: number,
  longitude: number,
) {
  const phi = DEGREES_TO_RADIANS * latitude;
  const lw = DEGREES_TO_RADIANS * -longitude;
  const d = toDays(date);
  const { distance, rightAscension, declination } = moonCoordinates(d);
  const h = sideRealTime(d, lw) - rightAscension;
  let alt = altitude(h, phi, declination);
  const pa = Math.atan2(
    Math.sin(h),
    Math.tan(phi) * Math.cos(declination) - Math.sin(declination) * Math.cos(h),
  );

  // altitude correction for refraction
  alt += astronomicalRefraction(alt);

  return {
    azimuth: azimuth(h, phi, declination),
    altitude: alt,
    distance,
    parallacticAngle: pa,
  };
}

/** Calculates moon illumination for a given date */
export function getMoonIlluminations(_date: Date) {
  unimplemented();
}

/** Moon rise and set times */
export function getMoonTimes(
  _date: Date,
  _latitude: number,
  _longitude: number,
) {
  // TODO: potentially address function signature here.
  unimplemented();
}
