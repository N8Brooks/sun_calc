import { declination, DEGREES_TO_RADIANS, rightAscension } from "./position.ts";

/** Geocentric ecliptic coordinates of the moon */
export function moonCoordinates(julianDays: number) {
  const eclipticLongitude = DEGREES_TO_RADIANS *
    (218.316 + 13.176396 * julianDays);
  const meanAnomaly = DEGREES_TO_RADIANS * (134.963 + 13.064993 * julianDays);
  const meanDistance = DEGREES_TO_RADIANS * (93.272 + 13.229350 * julianDays);

  const longitude = eclipticLongitude +
    DEGREES_TO_RADIANS * 6.289 * Math.sin(meanAnomaly);
  const latitude = DEGREES_TO_RADIANS * 5.128 * Math.sin(meanDistance);
  const distance = 385001 - 20905 * Math.cos(meanAnomaly);

  return {
    rightAscension: rightAscension(longitude, latitude),
    declination: declination(longitude, latitude),
    /** Given in kilometers */
    distance,
  };
}
