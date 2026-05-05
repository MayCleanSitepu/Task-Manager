import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, CheckCircle2, Circle } from 'lucide-react';

interface TaskHeaderProps {
  title: string;
  status: string;
  priority: string;
  isEditingTitle: boolean;
  setIsEditingTitle: (val: boolean) => void;
  register: any;
  onSave: () => void;
}

export function TaskHeader({
  title,
  status,
  priority,
  isEditingTitle,
  setIsEditingTitle,
  register,
  onSave
}: TaskHeaderProps) {
  return (
    <div className="p-6 bg-white border-b border-[#d0d7de]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input 
                className="text-xl font-bold h-10" 
                {...register('title')} 
                autoFocus
              />
              <Button size="sm" onClick={onSave}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group">
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditingTitle(true)}
              >
                <Pencil className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge className={
              status === 'DONE' ? 'bg-purple-600 hover:bg-purple-700 border-none' :
              status === 'IN_PROGRESS' ? 'bg-blue-600 hover:bg-blue-700 border-none' :
              'bg-emerald-600 hover:bg-emerald-700 border-none'
            }>
              {status === 'DONE' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Circle className="w-3 h-3 mr-1" />}
              {status.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-slate-500">
              Task in <span className="font-semibold">{priority}</span> priority
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
