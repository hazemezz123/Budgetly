import House from "../models/House.js";
import {
  buildCycleSnapshot,
  normalizeRoleRotation,
  resetRoleRotation,
  validateRotationPayload,
  isMemberOfHouse,
  isAdminOfHouse,
} from "../services/roleRotationService.js";

const getHouseWithRotation = async (houseId) => {
  const house = await House.findById(houseId)
    .populate("roleRotation.participants roleRotation.currentCycle.assignments.participant roleRotation.history.assignments.participant", "name username profilePicture");
  return house;
};

const handleHouseNotFound = (res) => res.status(404).json({ message: "House not found" });

const handleNotMember = (res) => res.status(403).json({ message: "You are not a member of this house" });

const handleNotAdmin = (res) => res.status(403).json({ message: "Only admin can perform this action" });

const handleValidationError = (res, message) => res.status(400).json({ message });

const handleServerError = (res, error, context) => {
  console.error(`${context} error:`, error);
  res.status(500).json({ message: "Server error" });
};

export const getRotationSettings = async (req, res) => {
  try {
    const house = await getHouseWithRotation(req.params.id);
    if (!house) return handleHouseNotFound(res);

    if (!isMemberOfHouse(req.user.house, house._id)) return handleNotMember(res);

    if (!house.roleRotation) {
      house.roleRotation = normalizeRoleRotation(house);
      await house.save();
    }

    res.json(house.roleRotation);
  } catch (error) {
    handleServerError(res, error, "Get rotation settings");
  }
};

export const updateRotationSettings = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return handleHouseNotFound(res);

    if (!isAdminOfHouse(house.admin, req.user.id)) return handleNotAdmin(res);

    const validationError = validateRotationPayload({
      participants: req.body.participants,
      roles: req.body.roles,
      memberIds: house.members,
    });

    if (validationError) return handleValidationError(res, validationError);

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
    handleServerError(res, error, "Update rotation settings");
  }
};

export const startRotationCycle = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return handleHouseNotFound(res);

    if (!isAdminOfHouse(house.admin, req.user.id)) return handleNotAdmin(res);

    const rotation = house.roleRotation || normalizeRoleRotation(house);
    const validationError = validateRotationPayload({
      participants: rotation.participants,
      roles: rotation.roles,
      memberIds: house.members,
    });

    if (validationError) return handleValidationError(res, validationError);

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
    handleServerError(res, error, "Start rotation cycle");
  }
};

export const resetRotation = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return handleHouseNotFound(res);

    if (!isAdminOfHouse(house.admin, req.user.id)) return handleNotAdmin(res);

    house.roleRotation = resetRoleRotation();
    await house.save();

    res.json({ message: "Rotation reset successfully" });
  } catch (error) {
    handleServerError(res, error, "Reset rotation");
  }
};

export const deleteRotation = resetRotation;
