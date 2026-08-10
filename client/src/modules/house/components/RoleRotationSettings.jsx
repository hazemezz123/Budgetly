import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import useRoleRotation from "../hooks/useRoleRotation";
import { getId, getParticipantLabel, groupAssignmentsByRole } from "../utils/rotationUtils";

const RoleRotationSettings = ({ houseId, members = [], isAdmin }) => {
  const {
    settings,
    currentCycle,
    history,
    loadingSettings,
    settingsError,
    updateRotation,
    startRotationCycle,
    resetRotation,
    isUpdatingRotation,
    isStartingCycle,
    isResettingRotation,
  } = useRoleRotation(houseId);

  const [participants, setParticipants] = useState([]);
  const [roles, setRoles] = useState([{ name: "Cooking", count: 1 }]);

  const memberLookup = useMemo(
    () => new Map(members.map((member) => [member._id, member])),
    [members],
  );

  useEffect(() => {
    if (!settings) return;

    setParticipants((settings.participants || []).map(getId));
    setRoles(
      settings.roles?.length
        ? settings.roles.map((role) => ({ name: role.name || "", count: Number(role.count) || 1 }))
        : [{ name: "Cooking", count: 1 }],
    );
  }, [settings]);

  const availableMembers = members.filter((member) => !participants.includes(member._id));
  const totalSlots = roles.reduce((sum, role) => sum + Number(role.count || 0), 0);
  const roleNames = roles.map((role) => role.name.trim()).filter(Boolean);
  const hasUniqueRoles = new Set(roleNames).size === roleNames.length;
  const rolesAreValid = roles.length > 0 && roles.every((role) => role.name.trim() && Number(role.count) > 0);
  const canSave = isAdmin && participants.length === totalSlots && rolesAreValid && hasUniqueRoles;
  const canStartCycle = canSave && participants.length > 0;

  const handleAddMember = (memberId) => {
    if (!memberId || participants.includes(memberId)) return;
    setParticipants((current) => [...current, memberId]);
  };

  const handleRemoveMember = (memberId) => {
    setParticipants((current) => current.filter((id) => id !== memberId));
  };

  const handleMoveMember = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= participants.length) return;

    setParticipants((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const handleUpdateRole = (index, updates) => {
    setRoles((current) =>
      current.map((role, roleIndex) => (roleIndex === index ? { ...role, ...updates } : role)),
    );
  };

  const handleMoveRole = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= roles.length) return;

    setRoles((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const handleRemoveRole = (index) => {
    setRoles((current) => current.filter((_, roleIndex) => roleIndex !== index));
  };

  const handleAddRole = () => {
    setRoles((current) => [...current, { name: "", count: 1 }]);
  };

  const handleSave = async () => {
    if (!canSave) return;
    await updateRotation({ enabled: true, participants, roles });
  };

  const handleStartCycle = async () => {
    if (!canStartCycle) return;
    await startRotationCycle();
  };

  const handleReset = async () => {
    if (!window.confirm("متأكد من إعادة ضبط التدوير؟")) return;
    await resetRotation();
    setParticipants([]);
    setRoles([{ name: "Cooking", count: 1 }]);
  };

  if (!isAdmin) return null;

  if (loadingSettings) {
    return <div className="p-6 text-center text-(--color-muted)">جاري تحميل الإعدادات...</div>;
  }

  if (settingsError) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 text-center text-(--color-error)">
        مش قادرين نحمل إعدادات التدوير حالياً
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-sm">
        <div className="flex items-center gap-3 border-b border-(--color-border) p-4">
          <div className="rounded-lg bg-(--color-primary)/10 p-2 text-(--color-primary)">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-bold text-(--color-dark)">التدوير العام</h3>
            <p className="text-xs text-(--color-muted)">رتب الناس والأدوار ثم ابدأ دورة جديدة</p>
          </div>
        </div>

        <div className="space-y-6 p-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-(--color-secondary)">
              <Users size={16} />
              <span>الأشخاص ({participants.length})</span>
            </div>

            {participants.length > 0 && (
              <div className="mb-3 space-y-2">
                {participants.map((memberId, index) => {
                  const member = memberLookup.get(memberId);

                  return (
                    <div
                      key={memberId}
                      className="flex items-center gap-2 rounded-xl p-3"
                      style={{ backgroundColor: "var(--color-light)" }}
                    >
                      <GripVertical size={16} className="text-(--color-muted)" />
                      <span className="flex-1 font-medium text-(--color-dark)">
                        {index + 1}. {member?.name || member?.username || memberId}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveMember(index, -1)}
                          disabled={index === 0}
                          className="rounded p-1 hover:bg-(--color-surface) disabled:opacity-30"
                        >
                          <ChevronUp size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveMember(index, 1)}
                          disabled={index === participants.length - 1}
                          className="rounded p-1 hover:bg-(--color-surface) disabled:opacity-30"
                        >
                          <ChevronDown size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(memberId)}
                          className="rounded p-1 text-(--color-error) hover:bg-(--color-error)/10"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {availableMembers.length > 0 && (
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-xl px-4 py-2.5 outline-none"
                  style={{
                    backgroundColor: "var(--color-light)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-dark)",
                  }}
                  defaultValue=""
                  onChange={(e) => {
                    handleAddMember(e.target.value);
                    e.target.value = "";
                  }}
                >
                  <option value="" disabled>
                    اختر شخص للإضافة...
                  </option>
                  {availableMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-(--color-secondary)">
              <Save size={16} />
              <span>الأدوار ({totalSlots} slots)</span>
            </div>

            <div className="space-y-3">
              {roles.map((role, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-xl border border-(--color-border) p-3 sm:grid-cols-[1fr_120px_auto]"
                >
                  <input
                    value={role.name}
                    onChange={(e) => handleUpdateRole(index, { name: e.target.value })}
                    placeholder="اسم الدور"
                    className="rounded-lg border border-(--color-border) px-3 py-2 outline-none"
                  />
                  <input
                    type="number"
                    min="1"
                    value={role.count}
                    onChange={(e) => handleUpdateRole(index, { count: Number(e.target.value) })}
                    className="rounded-lg border border-(--color-border) px-3 py-2 outline-none"
                  />
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveRole(index, -1)}
                      disabled={index === 0}
                      className="rounded p-1 hover:bg-(--color-bg) disabled:opacity-30"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveRole(index, 1)}
                      disabled={index === roles.length - 1}
                      className="rounded p-1 hover:bg-(--color-bg) disabled:opacity-30"
                    >
                      <ChevronDown size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(index)}
                      className="rounded p-1 text-(--color-error) hover:bg-(--color-error)/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddRole}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-(--color-border) py-3 font-bold text-(--color-muted) hover:border-(--color-primary) hover:text-(--color-primary)"
              >
                <Plus size={18} />
                إضافة دور
              </button>
            </div>
          </div>

          {participants.length !== totalSlots && (
            <p className="rounded-xl bg-(--color-warning)/10 px-4 py-3 text-sm text-(--color-warning)">
              عدد الأشخاص لازم يساوي عدد خانات الأدوار ({totalSlots}) قبل الحفظ.
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isUpdatingRotation}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-3 font-bold text-white disabled:opacity-50"
            >
              <Save size={18} />
              {isUpdatingRotation ? "جاري الحفظ..." : "حفظ التوزيع"}
            </button>
            <button
              type="button"
              onClick={handleStartCycle}
              disabled={!canStartCycle || isStartingCycle}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-(--color-border) px-4 py-3 font-bold text-(--color-dark) disabled:opacity-50"
            >
              <RotateCcw size={18} />
              {isStartingCycle ? "جاري بدء الدورة..." : "بدء دورة جديدة"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isResettingRotation}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-(--color-error) px-4 py-3 font-bold text-(--color-error) disabled:opacity-50"
            >
              <Trash2 size={18} />
              {isResettingRotation ? "جاري الإعادة..." : "إعادة ضبط"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <h3 className="mb-4 font-bold text-(--color-dark)">التوزيع الحالي</h3>
        {!currentCycle ? (
          <p className="text-sm text-(--color-muted)">مفيش دورة شغالة حالياً.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupAssignmentsByRole(currentCycle.assignments)).map(([roleName, assignments]) => (
              <div key={roleName} className="rounded-xl bg-(--color-bg) p-3">
                <p className="mb-2 font-bold text-(--color-dark)">{roleName}</p>
                <div className="space-y-2">
                  {assignments.map((assignment) => (
                    <div key={assignment.slotIndex} className="flex items-center justify-between text-sm text-(--color-secondary)">
                      <span>مهمة {assignment.slotIndex + 1}</span>
                      <span className="font-medium text-(--color-dark)">
                        {getParticipantLabel(assignment.participant, memberLookup)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <h3 className="mb-4 font-bold text-(--color-dark)">السجل السابق</h3>
        {!history.length ? (
          <p className="text-sm text-(--color-muted)">لسه مفيش دورات سابقة.</p>
        ) : (
          <div className="space-y-3">
            {history.map((cycle) => (
              <details key={cycle.cycleNumber} className="rounded-xl border border-(--color-border) p-3">
                <summary className="cursor-pointer font-medium text-(--color-dark)">
                  الدورة {cycle.cycleNumber} - {cycle.startedAt}
                </summary>
                <div className="mt-3 space-y-2">
                  {cycle.assignments.map((assignment) => (
                    <div key={assignment.slotIndex} className="flex items-center justify-between text-sm">
                      <span className="text-(--color-muted)">{assignment.roleName}</span>
                      <span className="font-medium text-(--color-dark)">
                        {getParticipantLabel(assignment.participant, memberLookup)}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RoleRotationSettings;
