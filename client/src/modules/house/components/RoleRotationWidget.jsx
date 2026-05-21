import { Users } from "lucide-react";
import useRoleRotation from "../hooks/useRoleRotation";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const RoleRotationWidget = ({ houseId }) => {
  const { settings, currentCycle, loadingSettings } = useRoleRotation(houseId);

  if (loadingSettings || !settings?.enabled || !currentCycle) {
    return null;
  }

  const getParticipantLabel = (participant) => {
    if (participant && typeof participant === "object" && participant.name) {
      return participant.name;
    }

    const id = getId(participant);
    return id || "غير معروف";
  };

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-lg bg-(--color-primary)/10 p-2 text-(--color-primary)">
          <Users size={20} />
        </div>
        <div>
          <h3 className="font-bold text-(--color-dark)">جدول المهام</h3>
          <p className="text-xs text-(--color-muted)">الدورة رقم {currentCycle.cycleNumber}</p>
        </div>
      </div>

      <div className="space-y-2">
        {currentCycle.assignments.slice(0, 4).map((assignment) => (
          <div key={assignment.slotIndex} className="flex items-center justify-between rounded-xl bg-(--color-bg) px-3 py-2 text-sm">
            <span className="text-(--color-muted)">{assignment.roleName}</span>
            <span className="font-medium text-(--color-dark)">{getParticipantLabel(assignment.participant)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleRotationWidget;
