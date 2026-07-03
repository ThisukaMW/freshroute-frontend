import React from "react";
import { defaultSinceDate, formatDisplayDate, todayDateInput } from "../../utils/adminDateFilters";

interface AdminDateRangeBarProps {
  since: string;
  until: string;
  onSinceChange: (v: string) => void;
  onUntilChange: (v: string) => void;
  onResetLast7Days: () => void;
}

const AdminDateRangeBar: React.FC<AdminDateRangeBarProps> = ({
  since,
  until,
  onSinceChange,
  onUntilChange,
  onResetLast7Days,
}) => (
  <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
    <p className="text-xs text-slate-400 flex-1">
      Showing records from{" "}
      <span className="text-slate-200 font-medium">{formatDisplayDate(since)}</span>
      {" "}to{" "}
      <span className="text-slate-200 font-medium">{formatDisplayDate(until)}</span>
    </p>
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-xs text-slate-500">
        From
        <input
          type="date"
          value={since}
          max={until}
          onChange={(e) => onSinceChange(e.target.value)}
          className="ml-1.5 rounded-lg bg-slate-900/60 border border-slate-600 px-2 py-1 text-xs text-slate-200"
        />
      </label>
      <label className="text-xs text-slate-500">
        To
        <input
          type="date"
          value={until}
          min={since}
          max={todayDateInput()}
          onChange={(e) => onUntilChange(e.target.value)}
          className="ml-1.5 rounded-lg bg-slate-900/60 border border-slate-600 px-2 py-1 text-xs text-slate-200"
        />
      </label>
      <button
        type="button"
        onClick={onResetLast7Days}
        className="rounded-lg border border-slate-600 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700/40"
      >
        Last 7 days
      </button>
    </div>
  </div>
);

export { defaultSinceDate, todayDateInput };
export default AdminDateRangeBar;
