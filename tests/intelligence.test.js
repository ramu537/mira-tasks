import assert from "node:assert/strict";
import test from "node:test";
import { intelligenceCopy, normalizeEvidence } from "../src/lib/intelligence.js";

test("normalizes keyed and structured intelligence evidence", () => {
  assert.deepEqual(normalizeEvidence({ overdue: 2 })[0], { key: "overdue", label: "overdue", value: 2 });
  assert.deepEqual(normalizeEvidence([{ key: "focus", label: "Focus", value: "Write brief" }])[0].value, "Write brief");
});

test("prefers the grounded assistant interpretation", () => {
  assert.equal(intelligenceCopy({ assistantInterpretation: "Start with one task", guidance: "Fallback" }), "Start with one task");
  assert.equal(intelligenceCopy({ guidance: "Fallback" }), "Fallback");
});
