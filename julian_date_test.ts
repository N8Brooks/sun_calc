import { fromJulian, hoursLater, toDays, toJulian } from "./julian_date.ts";
import { assertEquals, assertStrictEquals } from "./test_deps.ts";

Deno.test("toJulian", async (t) => {
  await t.step("June 10, 1992 CE", () => {
    const date = new Date(1992, 5, 10, 12);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const actual = toJulian(date);
    const expected = 2_448_784;
    assertStrictEquals(actual, expected);
  });

  await t.step("January 18, 1824 CE", () => {
    const date = new Date(2016, 0, 18, 12);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const actual = toJulian(date);
    const expected = 2_457_406;
    assertStrictEquals(actual, expected);
  });
});

Deno.test("fromJulian", async (t) => {
  await t.step("June 10, 1992 CE", () => {
    const julianDays = 2_448_784;
    const actual = fromJulian(julianDays);
    const expected = new Date(1992, 5, 10, 12);
    expected.setMinutes(expected.getMinutes() - expected.getTimezoneOffset());
    assertEquals(actual, expected);
  });

  await t.step("January 18, 1824 CE", () => {
    const julianDays = 2_465_442;
    const actual = fromJulian(julianDays);
    const expected = new Date(2038, 0, 18, 12);
    expected.setMinutes(expected.getMinutes() - expected.getTimezoneOffset());
    assertEquals(actual, expected);
  });
});

Deno.test("toDays", async (t) => {
  await t.step("June 10, 1992 CE", () => {
    const date = new Date(1992, 5, 10, 12);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const actual = toDays(date);
    const expected = -2761;
    assertStrictEquals(actual, expected);
  });

  await t.step("January 18, 1824 CE", () => {
    const date = new Date(2021, 0, 18, 12);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const actual = toDays(date);
    const expected = 7688;
    assertStrictEquals(actual, expected);
  });
});

Deno.test("hoursLater", async (t) => {
  await t.step("June 10, 1992 CE", () => {
    const date = new Date(1992, 5, 10, 12);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const actual = hoursLater(date, 3).getTime();
    const expected = 708188400000;
    assertStrictEquals(actual, expected);
  });

  await t.step("January 18, 1824 CE", () => {
    const date = new Date(2021, 0, 18, 12);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const actual = hoursLater(date, 24).getTime();
    const expected = 1611057600000;
    assertStrictEquals(actual, expected);
  });
});
