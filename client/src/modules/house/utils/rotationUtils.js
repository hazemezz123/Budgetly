export const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

export const getParticipantLabel = (participant, memberLookup) => {
  if (participant && typeof participant === "object" && participant.name) {
    return participant.name;
  }

  const id = getId(participant);
  if (!id) return "غير معروف";

  return memberLookup?.get(id)?.name || memberLookup?.get(id)?.username || id;
};

export const groupAssignmentsByRole = (assignments) => {
  return assignments.reduce((acc, assignment) => {
    acc[assignment.roleName] = acc[assignment.roleName] || [];
    acc[assignment.roleName].push(assignment);
    return acc;
  }, {});
};
