import { Card } from '@/components/ui/card';
import { AlertTriangle, Clock, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConflictSidebarProps {
  conflicts: any[];
}

export function ConflictSidebar({ conflicts }: ConflictSidebarProps) {
  return (
    <div className="lg:col-span-3 space-y-6">
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <AlertTriangle className={cn("w-4 h-4", conflicts.length > 0 ? "text-red-500" : "text-slate-400")} />
            Conflicts
          </h3>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-bold",
            conflicts.length > 0 ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-500"
          )}>
            {conflicts.length}
          </span>
        </div>
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {conflicts.length > 0 ? (
            <div className="space-y-2">
              {conflicts.map((c: any) => (
                <div key={`${c.task1.id}-${c.task2.id}`} className="p-3 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors group cursor-pointer">
                  <p className="text-xs font-bold text-red-900 group-hover:underline">
                    {c.task1.title} vs {c.task2.title}
                  </p>
                  <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1 leading-relaxed">
                    <Clock className="w-3 h-3" />
                    {c.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Conflicts</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="border-blue-100 bg-blue-50/30 p-4 shadow-sm">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <Info className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-900">Pro Tip</h4>
            <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
              Click on any task in the calendar to view details or reschedule. Use the 'Day' view for precise minute-by-minute planning.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
