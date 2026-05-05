import { Calendar as CalendarIcon } from 'lucide-react';

export function ScheduleHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          Schedule View
        </h1>
        <p className="text-sm text-slate-500">Manage your workload and resolve scheduling overlaps.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 px-2 py-1 border-r border-slate-200">
            <div className="w-2 h-2 rounded-full bg-red-500" /> High
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 border-r border-slate-200">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> Medium
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 border-r border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Low
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 text-blue-600">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Done
          </div>
        </div>
      </div>
    </div>
  );
}
