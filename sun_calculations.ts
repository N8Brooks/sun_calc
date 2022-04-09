import {
  declination,
  DEGREES_TO_RADIANS,
  rightAscension,
} from "./position_calculations.ts";

export function solarMeanAnomaly(d: number) {
  return (357.5291 + 0.98560028 * d) * DEGREES_TO_RADIANS;
}

export function eclipticLongitude(m: number) {
  const equationOfCenterDegrees = 1.9148 * Math.sin(m) +
    0.02 * Math.sin(2 * m) + 0.0003 * Math.sin(3 * m);
  const equationOfCenter = DEGREES_TO_RADIANS * equationOfCenterDegrees;
  const earthPerihelion = DEGREES_TO_RADIANS * 102.9372;
  return m + equationOfCenter + earthPerihelion + Math.PI;
}

export function sunCoordinates(d: number) {
  const meanAnomaly = solarMeanAnomaly(d);
  const longitude = eclipticLongitude(meanAnomaly);
  return {
    declination: declination(longitude, 0),
    rightAscension: rightAscension(longitude, 0),
  };
}
