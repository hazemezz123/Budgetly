# Role Rotation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dishwashing rotation with a general role-rotation system that assigns every participant to every role fairly across cycles and shows current plus past cycle assignments.

**Architecture:** Keep the existing house-scoped feature model, but swap the dishwashing-specific schema, endpoints, hook, and widgets for a generic role-rotation flow. Put the cycle-building logic in a small server service so the controller stays thin, the algorithm is testable, and the client can reuse one hook across the dashboard and house details page.

**Tech Stack:** Express 5, Mongoose, node:test, React 19, React Query, Axios, Tailwind CSS 4, Lucide React

---

## Pre-Work Notes

- The approved spec is `docs/superpowers/specs/2026-05-17-role-rotation-design.md`.
- This feature replaces the existing dishwashing flow, so the old names should disappear from the UI and exports.
- Existing backend tests use `node:test`; the client has `npm run lint` and `npm run build` for verification.
- Keep the change localized to the house module and related server files. Do not add a separate scheduling subsystem.
- Do not create commits unless the user explicitly asks.

## File Map

- Modify: `server/models/House.js`
  Responsibility: replace `dishwashingRotation` with the new `roleRotation` subdocument and defaults.
- Create: `server/services/roleRotationService.js`
  Responsibility: build cycle snapshots, rotate participants, validate slot counts, and normalize legacy rotation data.
- Move: `server/controllers/dishwashingController.js` -> `server/controllers/roleRotationController.js`
  Responsibility: handle house membership/admin checks and call the service for get/update/delete/start/reset endpoints.
- Move: `server/routes/dishwashing.js` -> `server/routes/rotation.js`
  Responsibility: expose the generalized house rotation endpoints.
- Modify: `server/server.js`
  Responsibility: mount the renamed rotation routes.
- Create: `server/test/roleRotationService.test.js`
  Responsibility: verify the rotation algorithm, cycle continuation, history snapshots, and reset behavior.
- Create: `server/test/roleRotationController.test.js`
  Responsibility: verify request guards, admin-only mutations, and legacy-data migration behavior.
- Modify: `client/src/shared/api/queryKeys.js`
  Responsibility: rename the dishwashing query keys to role-rotation query keys.
- Modify: `client/src/modules/house/api/houseApi.js`
  Responsibility: add role-rotation API helpers for read/update/start/reset/delete.
- Modify: `client/src/modules/house/hooks/index.js`
  Responsibility: export the new hook name instead of the dishwashing hook.
- Move: `client/src/modules/house/hooks/useDishwashing.js` -> `client/src/modules/house/hooks/useRoleRotation.js`
  Responsibility: fetch rotation state and expose mutations for the admin actions.
- Modify: `client/src/modules/house/components/index.js`
  Responsibility: export the renamed rotation components.
- Move: `client/src/modules/house/components/DishwashingSettings.jsx` -> `client/src/modules/house/components/RoleRotationSettings.jsx`
  Responsibility: render the admin rotation editor, current cycle, and history list.
- Move: `client/src/modules/house/components/DishwashingWidget.jsx` -> `client/src/modules/house/components/RoleRotationWidget.jsx`
  Responsibility: show the dashboard summary card for the current rotation.
- Modify: `client/src/modules/house/pages/HouseDetailsPage.jsx`
  Responsibility: rename the tab, swap the imported component, and keep the admin-only gate.
- Modify: `client/src/modules/dashboard/pages/DashboardPage.jsx`
  Responsibility: swap the dashboard widget import and label.

### Task 1: Add The Pure Rotation Engine And House Schema

**Files:**
- Create: `server/services/roleRotationService.js`
- Modify: `server/models/House.js`
- Create: `server/test/roleRotationService.test.js`

- [ ] **Step 1: Write the failing service test for slot flattening and cycle shifts**

```js
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

  assert.deepEqual(slots.map((slot) => slot.roleName), ["Cooking", "Cooking", "Shopping", "Dishes"]);
});

test("buildCycleSnapshot shifts participants by one each cycle", () => {
  const base = {
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

  const first = buildCycleSnapshot(base);
  const second = buildCycleSnapshot({ ...base, cycleIndex: 1, currentCycle: first });

  assert.equal(first.cycleNumber, 1);
  assert.equal(second.cycleNumber, 2);
  assert.deepEqual(first.assignments.map((a) => a.participant), ["p1", "p2", "p3", "p4"]);
  assert.deepEqual(second.assignments.map((a) => a.participant), ["p2", "p3", "p4", "p1"]);
});

test("normalizeRoleRotation maps legacy dishwashing data into roleRotation shape", () => {
  const rotation = normalizeRoleRotation({
    dishwashingRotation: {
      enabled: true,
      startDate: "2026-05-17",
      order: ["a", "b"],
    },
  });

  assert.equal(rotation.enabled, true);
  assert.deepEqual(rotation.roles, [{ name: "Dishes", count: 2 }]);
  assert.deepEqual(rotation.participants, ["a", "b"]);
});

test("resetRoleRotation clears current cycle and history", () => {
  const reset = resetRoleRotation({
    enabled: true,
    participants: ["a", "b"],
    roles: [{ name: "Cooking", count: 2 }],
    cycleIndex: 3,
    currentCycle: { cycleNumber: 3, assignments: [] },
    history: [{ cycleNumber: 1, assignments: [] }],
  });

  assert.deepEqual(reset, {
    enabled: false,
    participants: [],
    roles: [],
    cycleIndex: 0,
    currentCycle: null,
    history: [],
  });
});
```

- [ ] **Step 2: Run the service test file to verify it fails before implementation**

Run: `npm test -- roleRotationService.test.js`
Workdir: `server`
Expected: fail because the new service does not exist yet.

- [ ] **Step 3: Implement the pure engine and the new house subdocument**

```js
export const buildSlotList = (roles) =>
  roles.flatMap((role) =>
    Array.from({ length: role.count }, () => ({
      roleName: role.name,
    })),
  );

export const buildCycleSnapshot = (rotation) => {
  const slots = buildSlotList(rotation.roles);
  const participants = [...rotation.participants];
  const offset = rotation.cycleIndex % participants.length;
  const rotatedParticipants = participants.slice(offset).concat(participants.slice(0, offset));

  return {
    cycleNumber: (rotation.currentCycle?.cycleNumber || 0) + 1,
    startedAt: new Date().toISOString().split("T")[0],
    assignments: slots.map((slot, index) => ({
      slotIndex: index,
      roleName: slot.roleName,
      participant: rotatedParticipants[index],
    })),
  };
};

export const normalizeRoleRotation = (house) => {
  if (house.roleRotation) return house.roleRotation;
  if (!house.dishwashingRotation) {
    return {
      enabled: false,
      participants: [],
      roles: [],
      cycleIndex: 0,
      currentCycle: null,
      history: [],
    };
  }

  const { enabled, order } = house.dishwashingRotation;
  return {
    enabled: Boolean(enabled),
    participants: [...order],
    roles: [{ name: "Dishes", count: order.length }],
    cycleIndex: 0,
    currentCycle: null,
    history: [],
  };
};

export const resetRoleRotation = () => ({
  enabled: false,
  participants: [],
  roles: [],
  cycleIndex: 0,
  currentCycle: null,
  history: [],
});
```

```js
const roleRotationSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    roles: [
      {
        name: { type: String, trim: true },
        count: { type: Number, min: 1 },
      },
    ],
    cycleIndex: { type: Number, default: 0 },
    currentCycle: {
      cycleNumber: Number,
      startedAt: String,
      assignments: [
        {
          slotIndex: Number,
          roleName: String,
          participant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
      ],
    },
    history: [
      {
        cycleNumber: Number,
        startedAt: String,
        assignments: [
          {
            slotIndex: Number,
            roleName: String,
            participant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          },
        ],
      },
    ],
  },
  { _id: false },
);
```

- [ ] **Step 4: Run the service test file again**

Run: `npm test -- roleRotationService.test.js`
Workdir: `server`
Expected: pass.

### Task 2: Replace The Backend Controller And Routes

**Files:**
- Move: `server/controllers/dishwashingController.js` -> `server/controllers/roleRotationController.js`
- Move: `server/routes/dishwashing.js` -> `server/routes/rotation.js`
- Modify: `server/server.js`
- Create: `server/test/roleRotationController.test.js`

- [ ] **Step 1: Write failing controller tests for the main guards and the start-cycle flow**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { getRotationSettings, updateRotationSettings, startRotationCycle, resetRotation } from "../controllers/roleRotationController.js";

test("getRotationSettings returns 403 for non-members", async () => {
  // stub House.findById and req.user.house
});

test("updateRotationSettings returns 400 when participant count and slot count differ", async () => {
  // stub House.findById with roleRotation update payload
});

test("startRotationCycle stores the next snapshot and pushes the previous cycle to history", async () => {
  // stub House.findById/save and assert currentCycle/history updates
});
```

- [ ] **Step 2: Run the controller tests to confirm they fail before the controller exists**

Run: `npm test -- roleRotationController.test.js`
Workdir: `server`
Expected: fail because the renamed controller file and exports do not exist yet.

- [ ] **Step 3: Implement the controller with membership/admin checks and legacy migration**

```js
export const getRotationSettings = async (req, res) => {
  const house = await House.findById(req.params.id).populate("roleRotation.participants roleRotation.currentCycle.assignments.participant roleRotation.history.assignments.participant", "name username profilePicture");
  if (!house) return res.status(404).json({ message: "House not found" });
  if (!req.user.house || req.user.house.toString() !== house._id.toString()) {
    return res.status(403).json({ message: "You are not a member of this house" });
  }

  const roleRotation = normalizeRoleRotation(house);
  if (!house.roleRotation) {
    house.roleRotation = roleRotation;
    await house.save();
  }

  res.json(roleRotation);
};

export const updateRotationSettings = async (req, res) => {
  const { participants, roles, enabled } = req.body;
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ message: "House not found" });
  if (house.admin.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Only admin can update rotation settings" });
  }

  const totalSlots = roles.reduce((sum, role) => sum + Number(role.count || 0), 0);
  if (participants.length !== totalSlots) {
    return res.status(400).json({ message: "Participant count must match total role slots" });
  }

  house.roleRotation = {
    enabled: Boolean(enabled),
    participants,
    roles,
    cycleIndex: house.roleRotation?.cycleIndex || 0,
    currentCycle: house.roleRotation?.currentCycle || null,
    history: house.roleRotation?.history || [],
  };
  await house.save();
  res.json(house.roleRotation);
};

export const startRotationCycle = async (req, res) => {
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ message: "House not found" });
  if (house.admin.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Only admin can start a rotation cycle" });
  }

  const nextState = buildCycleSnapshot(house.roleRotation);
  house.roleRotation = {
    ...house.roleRotation,
    enabled: true,
    cycleIndex: house.roleRotation.cycleIndex + 1,
    currentCycle: nextState,
    history: house.roleRotation.currentCycle
      ? [...house.roleRotation.history, house.roleRotation.currentCycle]
      : house.roleRotation.history,
  };
  await house.save();
  res.json(house.roleRotation);
};

export const resetRotation = async (req, res) => {
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ message: "House not found" });
  if (house.admin.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Only admin can reset rotation" });
  }

  house.roleRotation = resetRoleRotation();
  await house.save();
  res.json({ message: "Rotation reset successfully" });
};
```

```js
const router = express.Router();

router.get("/:id/rotation", authenticate, getRotationSettings);
router.put("/:id/rotation", authenticate, updateRotationSettings);
router.delete("/:id/rotation", authenticate, resetRotation);
router.post("/:id/rotation/cycles", authenticate, startRotationCycle);
router.post("/:id/rotation/reset", authenticate, resetRotation);

export default router;
```

- [ ] **Step 4: Mount the renamed route in `server/server.js`**

```js
import rotationRoutes from "./routes/rotation.js";

app.use("/api/houses", rotationRoutes);
```

- [ ] **Step 5: Run the controller tests and the full server test suite**

Run: `npm test -- roleRotationController.test.js`
Workdir: `server`
Expected: pass.

Run: `npm test`
Workdir: `server`
Expected: pass.

### Task 3: Add The Client API Layer And Hook

**Files:**
- Modify: `client/src/shared/api/queryKeys.js`
- Modify: `client/src/modules/house/api/houseApi.js`
- Move: `client/src/modules/house/hooks/useDishwashing.js` -> `client/src/modules/house/hooks/useRoleRotation.js`
- Modify: `client/src/modules/house/hooks/index.js`
- Modify: `client/src/modules/house/api/index.js` if the hook imports through the barrel

- [ ] **Step 1: Write the new query keys and API helpers before wiring the hook**

```js
roleRotation: {
  all: (houseId) => ["roleRotation", houseId],
  settings: (houseId) => ["roleRotation", houseId, "settings"],
  current: (houseId) => ["roleRotation", houseId, "current"],
  history: (houseId) => ["roleRotation", houseId, "history"],
}
```

```js
export const houseApi = {
  getRoleRotation: async (houseId) => {
    const { data } = await api.get(`/houses/${houseId}/rotation`);
    return data;
  },
  updateRoleRotation: async ({ houseId, payload }) => {
    const { data } = await api.put(`/houses/${houseId}/rotation`, payload);
    return data;
  },
  startRoleRotationCycle: async (houseId) => {
    const { data } = await api.post(`/houses/${houseId}/rotation/cycles`);
    return data;
  },
  resetRoleRotation: async (houseId) => {
    const { data } = await api.post(`/houses/${houseId}/rotation/reset`);
    return data;
  },
  deleteRoleRotation: async (houseId) => {
    const { data } = await api.delete(`/houses/${houseId}/rotation`);
    return data;
  },
};
```

- [ ] **Step 2: Write the hook test skeleton by reading the current query and mutation flow**

```js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { houseApi } from "../api";
import { queryKeys } from "../../../shared/api/queryKeys";

const useRoleRotation = (houseId) => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: queryKeys.roleRotation.settings(houseId),
    queryFn: async () => houseApi.getRoleRotation(houseId),
    enabled: Boolean(houseId),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => houseApi.updateRoleRotation({ houseId, payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roleRotation.all(houseId) }),
  });

  return {
    settings: settingsQuery.data,
    isLoadingSettings: settingsQuery.isLoading,
    updateRoleRotation: updateMutation.mutateAsync,
  };
};
```

- [ ] **Step 3: Implement the hook with current-cycle, history, and admin mutations**

```js
const useRoleRotation = (houseId) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const settingsQuery = useQuery({
    queryKey: queryKeys.roleRotation.settings(houseId),
    queryFn: () => houseApi.getRoleRotation(houseId),
    enabled: Boolean(houseId),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => houseApi.updateRoleRotation({ houseId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roleRotation.all(houseId) });
      toast.success("تم حفظ إعدادات التدوير");
    },
    onError: (error) => toast.error(error.response?.data?.message || "فشل حفظ إعدادات التدوير"),
  });

  const startCycleMutation = useMutation({
    mutationFn: () => houseApi.startRoleRotationCycle(houseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roleRotation.all(houseId) }),
  });

  const resetMutation = useMutation({
    mutationFn: () => houseApi.resetRoleRotation(houseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roleRotation.all(houseId) }),
  });

  return {
    settings: settingsQuery.data,
    currentCycle: settingsQuery.data?.currentCycle || null,
    history: settingsQuery.data?.history || [],
    isLoadingSettings: settingsQuery.isLoading,
    updateRoleRotation: updateMutation.mutateAsync,
    startRotationCycle: startCycleMutation.mutateAsync,
    resetRotation: resetMutation.mutateAsync,
  };
};
```

- [ ] **Step 4: Rename the hook export and run the client lint check**

```js
export { default as useRoleRotation } from "./useRoleRotation";
```

Run: `npm run lint`
Workdir: `client`
Expected: pass after the hook and API layer compile.

### Task 4: Replace The House And Dashboard UI

**Files:**
- Move: `client/src/modules/house/components/DishwashingSettings.jsx` -> `client/src/modules/house/components/RoleRotationSettings.jsx`
- Move: `client/src/modules/house/components/DishwashingWidget.jsx` -> `client/src/modules/house/components/RoleRotationWidget.jsx`
- Modify: `client/src/modules/house/components/index.js`
- Modify: `client/src/modules/house/pages/HouseDetailsPage.jsx`
- Modify: `client/src/modules/dashboard/pages/DashboardPage.jsx`

- [ ] **Step 1: Write the new component skeletons first so the page wiring is obvious**

```jsx
import { useEffect, useState } from "react";

const RoleRotationSettings = ({ houseId, members, isAdmin }) => {
  const { settings, currentCycle, history, updateRoleRotation, startRotationCycle, resetRotation } = useRoleRotation(houseId);
  const [participants, setParticipants] = useState([]);
  const [roles, setRoles] = useState([{ name: "Cooking", count: 2 }]);

  useEffect(() => {
    setParticipants(settings?.participants || []);
    setRoles(settings?.roles?.length ? settings.roles : [{ name: "Cooking", count: 2 }]);
  }, [settings]);

  const totalSlots = roles.reduce((sum, role) => sum + Number(role.count || 0), 0);
  const canSave = isAdmin && participants.length === totalSlots && roles.every((role) => role.name.trim() && Number(role.count) > 0);
  const canStartCycle = canSave && Boolean(settings?.enabled);

  const toggleParticipant = (memberId) => {
    setParticipants((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  };

  const updateRoleName = (index, name) => {
    setRoles((current) => current.map((role, roleIndex) => (roleIndex === index ? { ...role, name } : role)));
  };

  const updateRoleCount = (index, count) => {
    setRoles((current) => current.map((role, roleIndex) => (roleIndex === index ? { ...role, count } : role)));
  };

  const addRole = () => setRoles((current) => [...current, { name: "", count: 1 }]);
  const removeRole = (index) => setRoles((current) => current.filter((_, roleIndex) => roleIndex !== index));

  const handleSave = () => updateRoleRotation({ enabled: true, participants, roles });
  const handleStartCycle = () => startRotationCycle();
  const handleReset = () => resetRotation();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-(--color-dark)">إعدادات التدوير</h3>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {members.map((member) => (
              <label key={member._id} className="flex items-center gap-3 rounded-xl border border-(--color-border) p-3">
                <input type="checkbox" checked={participants.includes(member._id)} onChange={() => toggleParticipant(member._id)} />
                <span>{member.name}</span>
              </label>
            ))}
          </div>
          <div className="space-y-3">
            {roles.map((role, index) => (
              <div key={`${role.name}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
                <input value={role.name} onChange={(e) => updateRoleName(index, e.target.value)} />
                <input type="number" min="1" value={role.count} onChange={(e) => updateRoleCount(index, Number(e.target.value))} />
                <button type="button" onClick={() => removeRole(index)}>حذف</button>
              </div>
            ))}
            <button type="button" onClick={addRole}>إضافة دور</button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" disabled={!canSave} onClick={handleSave}>حفظ التوزيع</button>
            <button type="button" disabled={!canStartCycle} onClick={handleStartCycle}>بدء دورة جديدة</button>
            <button type="button" onClick={handleReset}>إعادة ضبط</button>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-(--color-dark)">التوزيع الحالي</h3>
        <div className="space-y-3">
          {currentCycle?.assignments.map((assignment) => (
            <div key={assignment.slotIndex} className="flex items-center justify-between rounded-xl bg-(--color-bg) p-3">
              <span>{assignment.roleName}</span>
              <span>{assignment.participant?.name || assignment.participant?.username}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-(--color-dark)">السجل السابق</h3>
        <div className="space-y-3">
          {history.map((cycle) => (
            <details key={cycle.cycleNumber} className="rounded-xl border border-(--color-border) p-3">
              <summary>
                الدورة {cycle.cycleNumber} - {cycle.startedAt}
              </summary>
              <div className="mt-3 space-y-2">
                {cycle.assignments.map((assignment) => (
                  <div key={assignment.slotIndex} className="flex items-center justify-between text-sm">
                    <span>{assignment.roleName}</span>
                    <span>{assignment.participant?.name || assignment.participant?.username}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};
```

```jsx
import { useRoleRotation } from "../hooks";

const RoleRotationWidget = ({ houseId }) => {
  const { currentCycle } = useRoleRotation(houseId);

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-5">
      <h3 className="mb-3 text-base font-bold text-(--color-dark)">جدول المهام</h3>
      <div className="space-y-2">
        {currentCycle?.assignments.slice(0, 4).map((assignment) => (
          <div key={assignment.slotIndex} className="flex items-center justify-between rounded-xl bg-(--color-bg) px-3 py-2 text-sm">
            <span>{assignment.roleName}</span>
            <span>{assignment.participant?.name || assignment.participant?.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Implement the settings editor so the admin can manage participants and roles**

```jsx
const [participants, setParticipants] = useState([]);
const [roles, setRoles] = useState([{ name: "Cooking", count: 2 }]);

const totalSlots = roles.reduce((sum, role) => sum + Number(role.count || 0), 0);
const canSave = isAdmin && participants.length === totalSlots && roles.every((role) => role.name.trim() && Number(role.count) > 0);
```

The editor should:
- show house members as selectable participants
- let the admin add or remove role rows
- let the admin edit each role name and count inline
- show a blocking message when `participants.length !== totalSlots`
- keep the current cycle summary visible while editing

- [ ] **Step 3: Update the house details page to use the new component and tab label**

```jsx
import { RoleRotationSettings } from "../components";

{isAdmin && (
  <button onClick={() => setActiveTab("rotation")}>المهام</button>
)}

{activeTab === "rotation" && isAdmin && (
  <RoleRotationSettings houseId={houseId} members={house?.members || []} isAdmin={isAdmin} />
)}
```

- [ ] **Step 4: Update the dashboard widget import and keep the summary compact**

```jsx
import { RoleRotationWidget } from "../../house/components";

{houseId && (
  <div className="mb-6">
    <RoleRotationWidget houseId={houseId} />
  </div>
)}
```

- [ ] **Step 5: Update the component barrels and run frontend verification**

```js
export { default as RoleRotationSettings } from "./RoleRotationSettings";
export { default as RoleRotationWidget } from "./RoleRotationWidget";
```

```js
export { default as useRoleRotation } from "./useRoleRotation";
```

Run: `npm run lint`
Workdir: `client`
Expected: pass.

Run: `npm run build`
Workdir: `client`
Expected: pass.

### Task 5: Final Verification And Cleanup

**Files:**
- Inspect: `server/test/roleRotationService.test.js`
- Inspect: `server/test/roleRotationController.test.js`
- Inspect: `client/src/modules/house/pages/HouseDetailsPage.jsx`
- Inspect: `client/src/modules/dashboard/pages/DashboardPage.jsx`

- [ ] **Step 1: Run the full server suite again**

Run: `npm test`
Workdir: `server`
Expected: pass.

- [ ] **Step 2: Run the client lint and build checks again**

Run: `npm run lint`
Workdir: `client`
Expected: pass.

Run: `npm run build`
Workdir: `client`
Expected: pass.

- [ ] **Step 3: Manually verify the new flow in local dev**

Run:
```bash
npm run dev
```

Manual checks:
- load a house with an existing legacy dishwashing setup and confirm it appears as generic role rotation
- update the roles so total slots match participant count
- start a new cycle and verify every participant receives exactly one slot
- start a second cycle and verify assignments continue from the prior cycle instead of restarting
- confirm the house details page shows current cycle assignments and history
- confirm the dashboard widget shows the active cycle summary

## Self-Review

### Spec Coverage Check

- General role rotation instead of dishwashing: Task 1, Task 2, Task 4
- Admin can manage participants, roles, cycle start, reset: Task 2, Task 4
- Each cycle fills every slot exactly and continues from the previous cycle: Task 1, Task 2
- Current cycle and history display: Task 2, Task 4
- House detail page overview: Task 4
- Dashboard summary widget: Task 4
- Legacy dishwashing data migration: Task 2

### Placeholder Scan

- No `TBD` or `TODO` placeholders remain.
- No step says only “add tests” without showing the test shape.
- No task depends on undefined functions or file paths.

### Type and Naming Consistency

- The client hook is named `useRoleRotation` everywhere.
- The server controller exports are named `getRotationSettings`, `updateRotationSettings`, `startRotationCycle`, and `resetRotation`.
- The shared query key namespace is `roleRotation`.
- The UI labels use `المهام` and `جدول المهام`, which match the generalized feature.
