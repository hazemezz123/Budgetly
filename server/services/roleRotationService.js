const todayIso = () => new Date().toISOString().split("T")[0];

export const buildSlotList = (roles) =>
  roles.flatMap((role) =>
    Array.from({ length: role.count }, () => ({
      roleName: role.name,
    })),
  );

export const buildCycleSnapshot = (rotation) => {
  const slots = buildSlotList(rotation.roles || []);
  const participants = rotation.participants || [];

  if (slots.length !== participants.length) {
    throw new Error("Participant count must match total role slots");
  }

  const offset = participants.length === 0 ? 0 : rotation.cycleIndex % participants.length;
  const rotatedParticipants = participants.slice(offset).concat(participants.slice(0, offset));

  return {
    cycleNumber: (rotation.currentCycle?.cycleNumber || rotation.history?.length || 0) + 1,
    startedAt: todayIso(),
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
    return resetRoleRotation();
  }

  const { enabled, order = [] } = house.dishwashingRotation;

  return {
    enabled: Boolean(enabled),
    participants: [...order],
    roles: order.length ? [{ name: "Dishes", count: order.length }] : [],
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
