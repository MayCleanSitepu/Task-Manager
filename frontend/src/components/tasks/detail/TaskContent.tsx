import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface TaskContentProps {
  register: any;
  onSave: () => void;
  isSaving: boolean;
}

export function TaskContent({ register, onSave, isSaving }: TaskContentProps) {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="border border-[#d0d7de] rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="bg-[#f6f8fa] px-4 py-2 border-b border-[#d0d7de] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-900 border-b-2 border-orange-500 pb-2 -mb-2">Write</span>
          </div>
        </div>
        <div className="p-4">
          <Textarea 
            {...register('description')}
            placeholder="Leave a comment"
            className="min-h-[200px] border-none focus-visible:ring-0 p-0 resize-none text-slate-800"
          />
        </div>
        <div className="p-2 bg-[#f6f8fa] flex justify-end border-t border-[#d0d7de]">
          <Button size="sm" onClick={onSave} disabled={isSaving} className="bg-[#2da44e] hover:bg-[#2c974b] text-white border-none shadow-sm font-semibold">
            {isSaving && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
            Update Task
          </Button>
        </div>
      </div>
    </div>
  );
}
