import { Users } from "lucide-react";
import useRoleRotation from "../hooks/useRoleRotation";
import { getParticipantLabel } from "../utils/rotationUtils";
import { Card, CardContent } from "@/components/ui/card";

const RoleRotationWidget = ({ houseId }) => {
  const { settings, currentCycle, loadingSettings } = useRoleRotation(houseId);

  if (loadingSettings || !settings?.enabled || !currentCycle) {
    return null;
  }

  return (
    <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm py-0 gap-0">
      <CardContent className="p-4">
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
      </CardContent>
    </Card>
  );
};

export default RoleRotationWidget;
