import { toDays } from "./julian_date.ts";
import { altitude, azimuth, sideRealTime } from "./position.ts";
import { sunCoordinates } from "./sun.ts";

/** One degree to radians */
const DEGREES_TO_RADIANS = Math.PI / 180;

/** Sun configuration times */
export const SUN_TIMES = [
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
