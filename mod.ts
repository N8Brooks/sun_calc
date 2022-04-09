import { unimplemented } from "./deps.ts";
import { fromJulian, hoursLater, toDays } from "./julian_date.ts";
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

/** Distance from the sun to the earth in kilometers */
const SUN_DISTANCE_KM = 149_598_000;

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
export function getMoonIlluminations(date?: Date) {
  const days = toDays(date || new Date());
  const sun = sunCoordinates(days);
  const moon = moonCoordinates(days);

  const phi = Math.acos(
    Math.sin(sun.declination) * Math.sin(moon.declination) +
      Math.cos(sun.declination) * Math.cos(moon.declination) *
        Math.cos(sun.rightAscension - moon.rightAscension),
  );

  const inc = Math.atan2(
    SUN_DISTANCE_KM * Math.sin(phi),
    moon.distance - SUN_DISTANCE_KM * Math.cos(phi),
  );

  const angle = Math.atan2(
    Math.cos(sun.declination) *
      Math.sin(sun.rightAscension - moon.rightAscension),
    Math.sin(sun.declination) * Math.cos(moon.declination) -
      Math.cos(sun.declination) * Math.sin(moon.declination) *
        Math.cos(sun.rightAscension - moon.rightAscension),
  );

  return {
    fraction: (1 + Math.cos(inc)) / 2,
    phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
    angle: angle,
  };
}

/** Moon rise and set times */
export function getMoonTimes(
  date: Date,
  latitude: number,
  longitude: number,
) {
  const t = new Date(date);
  t.setHours(0, 0, 0, 0);

  const hc = 0.133 * DEGREES_TO_RADIANS;
  let h0 = getMoonPosition(t, latitude, longitude).altitude - hc;
  let x1 = NaN, x2 = NaN;
  let rise = NaN, set = NaN;
  let ye = NaN;

  // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
  for (let i = 1; i <= 24; i += 2) {
    const h1 = getMoonPosition(hoursLater(t, i), latitude, longitude).altitude -
      hc;
    const h2 =
      getMoonPosition(hoursLater(t, i + 1), latitude, longitude).altitude - hc;

    const a = (h0 + h2) / 2 - h1;
    const b = (h2 - h0) / 2;
    const xe = -b / (2 * a);
    ye = (a * xe + b) * xe + h1;
    const d = b * b - 4 * a * h1;
    let roots = 0;

    if (d >= 0) {
      const dx = Math.sqrt(d) / (Math.abs(a) * 2);
      x1 = xe - dx;
      x2 = xe + dx;
      if (Math.abs(x1) <= 1) {
        roots++;
      }
      if (Math.abs(x2) <= 1) {
        roots++;
      }
      if (x1 < -1) {
        x1 = x2;
      }
    }

    if (roots === 1) {
      if (h0 < 0) {
        rise = i + x1;
      } else {
        set = i + x1;
      }
    } else if (roots === 2) {
      rise = i + (ye < 0 ? x2 : x1);
      set = i + (ye < 0 ? x1 : x2);
    }

    if (rise && set) {
      break;
    }

    h0 = h2;
  }

  const result: {
    rise?: Date;
    set?: Date;
    alwaysUp?: true;
    alwaysDown?: true;
  } = {};

  if (rise) {
    result.rise = hoursLater(t, rise);
  }
  if (set) {
    result.set = hoursLater(t, set);
  }
  if (!rise && !set) {
    result[ye > 0 ? "alwaysUp" : "alwaysDown"] = true;
  }

  return result;
}
