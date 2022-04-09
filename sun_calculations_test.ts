import {
  eclipticLongitude,
  solarMeanAnomaly,
  sunCoordinates,
} from "./sun_calculations.ts";
import { assertAlmostEquals } from "./test_deps.ts";

Deno.test("solarMeanAnomaly", async (t) => {
  await t.step("ones", () => {
    const actual = solarMeanAnomaly(1);
    const expected = 6.257261936686637;
    assertAlmostEquals(actual, expected);
  });
});

Deno.test("eclipticLongitude", async (t) => {
  await t.step("ones", () => {
    const actual = eclipticLongitude(1);
    const expected = 5.966625453822024;
    assertAlmostEquals(actual, expected);
  });
});

Deno.test("sunCoordinates", async (t) => {
  await t.step("declination", () => {
    const actual = sunCoordinates(1).declination;
    const expected = -0.4005601793166483;
    assertAlmostEquals(actual, expected);
  });

  await t.step("rightAscension", () => {
    const actual = sunCoordinates(1).rightAscension;
    const expected = -1.3544416035118712;
    assertAlmostEquals(actual, expected);
  });
});
