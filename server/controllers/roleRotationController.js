import House from "../models/House.js";
import {
  buildCycleSnapshot,
  normalizeRoleRotation,
  resetRoleRotation,
} from "../services/roleRotationService.js";

const getHouseWithRotation = async (houseId) => {
  const house = await House.findById(houseId);
  if (!house) return null;

  if (typeof house.populate === "function") {
    await house.populate("roleRotation.participants roleRotation.currentCycle.assignments.participant roleRotation.history.assignments.participant", "name username profilePicture");
  }

  return house;
};

const isMemberOfHouse = (userHouseId, houseId) =>
  userHouseId && houseId && userHouseId.toString() === houseId.toString();

const validateRotationPayload = ({ participants = [], roles = [], memberIds = [] }) => {
  if (!Array.isArray(participants) || !Array.isArray(roles)) {
    return "Invalid rotation payload";
  }

  const totalSlots = roles.reduce((sum, role) => sum + Number(role.count || 0), 0);
  if (participants.length !== totalSlots) {
    return "Participant count must match total role slots";
  }

  const roleNames = roles.map((role) => String(role.name || "").trim());
  if (roleNames.some((name) => !name)) return "Role names are required";
  if (new Set(roleNames).size !== roleNames.length) return "Role names must be unique";
  if (roles.some((role) => Number(role.count) < 1)) return "Role counts must be at least 1";

  const memberSet = new Set(memberIds.map((id) => id.toString()));
  if (participants.some((id) => !memberSet.has(id.toString()))) {
    return "All participants must be house members";
  }

  return null;
};

export const getRotationSettings = async (req, res) => {
  try {
    const house = await getHouseWithRotation(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    if (!isMemberOfHouse(req.user.house, house._id)) {
      return res.status(403).json({ message: "You are not a member of this house" });
    }

    if (!house.roleRotation) {
      house.roleRotation = normalizeRoleRotation(house);
      await house.save();
    }

    res.json(house.roleRotation);
  } catch (error) {
    console.error("Get rotation settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateRotationSettings = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    if (house.admin.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only admin can update rotation settings" });
    }

    const validationError = validateRotationPayload({
      participants: req.body.participants,
      roles: req.body.roles,
      memberIds: house.members,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const previous = house.roleRotation || resetRoleRotation();
    house.roleRotation = {
      enabled: Boolean(req.body.enabled),
      participants: req.body.participants,
      roles: req.body.roles,
      cycleIndex: previous.cycleIndex || 0,
      currentCycle: previous.currentCycle || null,
      history: previous.history || [],
    };

    await house.save();
    res.json(house.roleRotation);
  } catch (error) {
    console.error("Update rotation settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const startRotationCycle = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    if (house.admin.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only admin can start a rotation cycle" });
    }

    const rotation = house.roleRotation || normalizeRoleRotation(house);
    const validationError = validateRotationPayload({
      participants: rotation.participants,
      roles: rotation.roles,
      memberIds: house.members,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const currentCycle = buildCycleSnapshot(rotation);
    const history = rotation.currentCycle
      ? [...(rotation.history || []), rotation.currentCycle]
      : [...(rotation.history || [])];

    house.roleRotation = {
      ...rotation,
      enabled: true,
      cycleIndex: (rotation.cycleIndex || 0) + 1,
      currentCycle,
      history,
    };

    await house.save();
    res.json(house.roleRotation);
  } catch (error) {
    console.error("Start rotation cycle error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const resetRotation = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    if (house.admin.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only admin can reset rotation" });
    }

    house.roleRotation = resetRoleRotation();
    await house.save();

    res.json({ message: "Rotation reset successfully" });
  } catch (error) {
    console.error("Reset rotation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteRotation = resetRotation;
