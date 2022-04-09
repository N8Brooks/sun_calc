import {
  altitude,
  astronomicalRefraction,
  azimuth,
  declination,
  rightAscension,
  sideRealTime,
} from "./position.ts";
import {
  assertAlmostEquals,
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "./test_deps.ts";

Deno.test("rightAscension", async (t) => {
  await t.step("ones", () => {
    const actual = rightAscension(1, 1);
    const expected = 0.2751288889155265;
    assertAlmostEquals(actual, expected);
  });
});

Deno.test("declination", async (t) => {
  await t.step("ones", () => {
    const actual = declination(1, 1);
    const expected = 1.2626057625872826;
    assertAlmostEquals(actual, expected);
  });
});

Deno.test("azimuth", async (t) => {
  await t.step("ones", () => {
    const actual = azimuth(1, 1, 1);
    const expected = 2.0016855292478892;
    assertAlmostEquals(actual, expected);
  });
});

Deno.test("sideRealTimes", async (t) => {
  await t.step("ones", () => {
    const actual = sideRealTime(1, 1);
    const expected = 10.190102114826932;
    assertAlmostEquals(actual, expected);
  });
});

Deno.test("altitude", async (t) => {
  await t.step("ones", () => {
    const actual = altitude(1, 1, 1);
    const expected = 1.046750963382694;
    assertAlmostEquals(actual, expected);
  });
});

Deno.test("astronomicalRefraction", async (t) => {
  await t.step("ones", () => {
    const actual = astronomicalRefraction(1);
    const expected = 0.00018930852787807327;
    assertAlmostEquals(actual, expected);
  });

  await t.step("clipped h", () => {
    const warn = spy(console, "warn");
    const actual = astronomicalRefraction(-1);
    const expected = 0.008446689093277518;
    assertAlmostEquals(actual, expected);
    assertSpyCall(warn, 0, { args: ["Clipping `h` to `0`"] });
    assertSpyCalls(warn, 1);
    warn.restore();
  });
});
