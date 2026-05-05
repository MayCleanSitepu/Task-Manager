import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { User2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface TaskSidebarProps {
  control: any;
  users: any[];
  values: any;
  handleUpdate: (data: any) => void;
}

export function TaskSidebar({ control, users, values, handleUpdate }: TaskSidebarProps) {
  return (
    <div className="w-full md:w-[280px] border-l border-[#d0d7de] p-4 space-y-6 bg-white">
      <div className="space-y-4">
        {/* Assignees */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-600 flex items-center justify-between group cursor-pointer hover:text-blue-600 transition-colors">
            Assignees
            <User2 className="w-3 h-3" />
          </Label>
          <Select value={values.assigneeId || 'unassigned'} onValueChange={(val) => handleUpdate({ assigneeId: val === 'unassigned' ? null : val })}>
            <SelectTrigger className="w-full h-9 border border-[#d0d7de] bg-white hover:bg-slate-50 transition-colors px-3 text-slate-600 font-semibold shadow-none focus:ring-1 focus:ring-blue-500/20">
              <div className="flex items-center gap-2 overflow-hidden">
                {values.assigneeId && values.assigneeId !== 'unassigned' ? (
                  <>
                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] shrink-0">
                      {users.find(u => u.id === values.assigneeId)?.name.charAt(0) || '?'}
                    </div>
                    <span className="truncate">
                      {users.find(u => u.id === values.assigneeId)?.name || 'Loading...'}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400">No one</span>
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">No one</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px]">
                      {u.name.charAt(0)}
                    </div>
                    {u.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-600 flex items-center justify-between group cursor-pointer hover:text-blue-600 transition-colors">
            Status
          </Label>
          <Select value={values.status} onValueChange={(val) => handleUpdate({ status: val as any })}>
            <SelectTrigger className="w-full h-9 border border-[#d0d7de] bg-white hover:bg-slate-50 transition-colors px-3 text-blue-600 font-bold shadow-none focus:ring-1 focus:ring-blue-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">Todo</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-px bg-[#d0d7de] mx-2" />

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-600">
            Priority
          </Label>
          <Select value={values.priority} onValueChange={(val) => handleUpdate({ priority: val as any })}>
            <SelectTrigger className="w-full h-9 border border-[#d0d7de] bg-white hover:bg-slate-50 transition-colors px-3 text-slate-700 font-semibold shadow-none focus:ring-1 focus:ring-blue-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-px bg-[#d0d7de] mx-2" />

        {/* Dates */}
        <div className="space-y-4">
          <Controller
            name="scheduledStart"
            control={control}
            render={({ field }) => (
              <DateTimePicker 
                label="Start date"
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  handleUpdate({ scheduledStart: val });
                }}
              />
            )}
          />
          <Controller
            name="scheduledEnd"
            control={control}
            render={({ field }) => (
              <DateTimePicker 
                label="Target date"
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  handleUpdate({ scheduledEnd: val });
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
