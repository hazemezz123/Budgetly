import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCycleSnapshot,
  buildSlotList,
  normalizeRoleRotation,
  resetRoleRotation,
} from "../services/roleRotationService.js";

test("buildSlotList expands role counts in order", () => {
  const slots = buildSlotList([
    { name: "Cooking", count: 2 },
    { name: "Shopping", count: 1 },
    { name: "Dishes", count: 1 },
  ]);

  assert.deepEqual(
    slots.map((slot) => slot.roleName),
    ["Cooking", "Cooking", "Shopping", "Dishes"],
  );
});

test("buildCycleSnapshot shifts participants by one each cycle", () => {
  const rotation = {
    enabled: true,
    participants: ["p1", "p2", "p3", "p4"],
    roles: [
      { name: "Cooking", count: 2 },
      { name: "Shopping", count: 1 },
      { name: "Dishes", count: 1 },
    ],
    cycleIndex: 0,
    currentCycle: null,
    history: [],
  };

  const first = buildCycleSnapshot(rotation);
  const second = buildCycleSnapshot({ ...rotation, cycleIndex: 1, currentCycle: first });

  assert.equal(first.cycleNumber, 1);
  assert.equal(second.cycleNumber, 2);
  assert.deepEqual(first.assignments.map((assignment) => assignment.participant), ["p1", "p2", "p3", "p4"]);
  assert.deepEqual(second.assignments.map((assignment) => assignment.participant), ["p2", "p3", "p4", "p1"]);
});

test("normalizeRoleRotation maps legacy dishwashing data into roleRotation shape", () => {
  const rotation = normalizeRoleRotation({
    dishwashingRotation: {
      enabled: true,
      order: ["a", "b"],
    },
  });

  assert.equal(rotation.enabled, true);
  assert.deepEqual(rotation.participants, ["a", "b"]);
  assert.deepEqual(rotation.roles, [{ name: "Dishes", count: 2 }]);
});

test("resetRoleRotation clears current cycle and history", () => {
  assert.deepEqual(
    resetRoleRotation({
      enabled: true,
      participants: ["a", "b"],
      roles: [{ name: "Cooking", count: 2 }],
      cycleIndex: 3,
      currentCycle: { cycleNumber: 3, assignments: [] },
      history: [{ cycleNumber: 1, assignments: [] }],
    }),
    {
      enabled: false,
      participants: [],
      roles: [],
      cycleIndex: 0,
      currentCycle: null,
      history: [],
    },
  );
});
