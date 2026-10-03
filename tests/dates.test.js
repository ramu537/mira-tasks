import assert from "node:assert/strict";
import test from "node:test";
import { dayDifference, shiftDate, localDateKey } from "../src/lib/dates.js";

test("shiftDate crosses month boundaries", () => {
  assert.equal(shiftDate("2026-09-30", 1), "2026-10-01");
  assert.equal(shiftDate("2026-09-01", -1), "2026-08-31");
});

test("dayDifference keeps direction explicit", () => {
  assert.equal(dayDifference("2026-09-13", "2026-09-16"), 3);
  assert.equal(dayDifference("2026-09-13", "2026-09-11"), -2);
});


test("current day follows the backend's India-time boundary", () => {
  assert.equal(localDateKey(new Date("2026-10-02T18:29:00Z")), "2026-10-02");
  assert.equal(localDateKey(new Date("2026-10-02T18:30:00Z")), "2026-10-03");
});

