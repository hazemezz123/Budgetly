import { Search, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function NoteFilters({
  searchText,
  setSearchText,
  selectedUser,
  setSelectedUser,
  uniqueUsers,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1 space-y-1.5">
        <Label
          htmlFor="note-search"
          className="text-sm font-medium text-(--color-secondary)"
        >
          بحث
        </Label>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-muted) w-5 h-5 pointer-events-none" />
          <Input
            id="note-search"
            type="text"
            placeholder="بحث في الملاحظات..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-11 w-full rounded-xl bg-(--color-bg) border-(--color-border) pr-10 text-sm sm:text-base"
          />
        </div>
      </div>
      <div className="relative min-w-[200px] space-y-1.5">
        <Label
          htmlFor="filter-note-user"
          className="flex items-center gap-1.5 text-sm font-medium text-(--color-secondary)"
        >
          المستخدم
        </Label>
        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-muted) w-4 h-4 pointer-events-none" />
          <select
            id="filter-note-user"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-3 pr-10 text-sm sm:text-base text-(--color-dark) [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-(--color-primary) appearance-none cursor-pointer transition-all"
          >
            <option value="">كل العائلة</option>
            {uniqueUsers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
