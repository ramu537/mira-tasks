import assert from "node:assert/strict";
import test from "node:test";
import { dueMeta, filterTasks, focusGroups, matrixGroups, matrixQuadrant, sortTasks, taskSummary } from "../src/lib/tasks.js";

const tasks = [
  { id: 1, title: "Overdue report", notes: "Finish draft", taskList: "Work", priority: "HIGH", dueOn: "2026-09-11", focusOn: null, urgent: true, important: true, completed: false },
  { id: 2, title: "Plan the week", notes: null, taskList: "Personal", priority: "MEDIUM", dueOn: "2026-09-13", focusOn: "2026-09-13", urgent: false, important: true, completed: false },
  { id: 3, title: "Call supplier", notes: null, taskList: "Work", priority: "LOW", dueOn: "2026-09-15", focusOn: "2026-09-13", urgent: true, important: false, completed: false },
  { id: 4, title: "Archive notes", notes: null, taskList: "Home", priority: "NONE", dueOn: null, focusOn: null, urgent: false, important: false, completed: true },
];

test("taskSummary reports distinct focus bands", () => {
  assert.deepEqual(taskSummary(tasks, "2026-09-13"), {
    total: 4,
    open: 3,
    completed: 1,
    overdue: 1,
    today: 2,
    upcoming: 1,
    completionRate: 25,
  });
});

test("focusGroups do not duplicate a task focused today", () => {
  const groups = focusGroups(tasks, "2026-09-13");
  assert.deepEqual(groups.map((group) => group.tasks.map((task) => task.id)), [[1], [2, 3], []]);
});

test("matrixQuadrant and matrixGroups cover each open task once", () => {
  assert.equal(matrixQuadrant(tasks[0]), "do");
  assert.equal(matrixQuadrant(tasks[1]), "schedule");
  assert.equal(matrixQuadrant(tasks[2]), "delegate");
  assert.deepEqual(matrixGroups(tasks).map((group) => group.tasks.map((task) => task.id)), [[1], [2], [3], []]);
});

test("filters search task content and retain task ordering", () => {
  assert.deepEqual(filterTasks(tasks, "draft", "ALL").map((task) => task.id), [1]);
  assert.deepEqual(filterTasks(tasks, "", "LIST:Work").map((task) => task.id), [1, 3]);
  assert.deepEqual(sortTasks(tasks).map((task) => task.id), [1, 2, 3, 4]);
});

test("dueMeta describes overdue and upcoming dates", () => {
  assert.deepEqual(dueMeta(tasks[0], "2026-09-13"), { label: "2d overdue", tone: "danger" });
  assert.deepEqual(dueMeta(tasks[2], "2026-09-13"), { label: "In 2 days", tone: "soon" });
});

