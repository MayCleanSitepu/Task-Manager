'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import api from '@/lib/axios';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import { TaskHeader } from './detail/TaskHeader';
import { TaskContent } from './detail/TaskContent';
import { TaskSidebar } from './detail/TaskSidebar';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title is required' }),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
});

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  scheduledStart: string;
  scheduledEnd: string;
  assigneeId: string | null;
}

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TaskDetailDialog({ task, open, onOpenChange, onSuccess }: TaskDetailDialogProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const { register, watch, setValue, control } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      scheduledStart: '',
      scheduledEnd: '',
      assigneeId: 'unassigned',
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (open && task) {
      const start = formatDateForInput(task.scheduledStart);
      const end = formatDateForInput(task.scheduledEnd);
      
      const timer = setTimeout(() => {
        setValue('title', task.title);
        setValue('description', task.description || '');
        setValue('priority', task.priority);
        setValue('status', task.status);
        setValue('scheduledStart', start);
        setValue('scheduledEnd', end);
        setValue('assigneeId', task.assigneeId || 'unassigned');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, task, setValue]);

  const formatDateForInput = (dateVal: any) => {
    if (!dateVal) return '';
    try {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) return '';
      const pad = (n: number) => String(n).padStart(2, '0');
      const y = date.getFullYear();
      const m = pad(date.getMonth() + 1);
      const d = pad(date.getDate());
      const hh = pad(date.getHours());
      const mm = pad(date.getMinutes());
      return `${y}-${m}-${d}T${hh}:${mm}`;
    } catch (e) { return ''; }
  };

  const values = watch();

  const handleUpdate = async (data: Partial<z.infer<typeof formSchema>>) => {
    try {
      setIsSaving(true);
      const cleanData = { ...data };
      if (cleanData.scheduledStart === '') delete cleanData.scheduledStart;
      if (cleanData.scheduledEnd === '') delete cleanData.scheduledEnd;

      Object.entries(data).forEach(([key, value]) => {
        setValue(key as any, value);
      });

      await api.patch(`/tasks/${task.id}`, cleanData);
      onSuccess();
    } catch (error: any) {
      toast.error('Update Failed', {
        description: error.response?.data?.message || 'Server error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSaveAll = async () => {
    await handleUpdate({
      title: values.title,
      description: values.description,
      priority: values.priority,
      status: values.status,
      scheduledStart: values.scheduledStart || undefined,
      scheduledEnd: values.scheduledEnd || undefined,
    });
    setIsEditingTitle(false);
    toast.success('Task updated');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={task.id} className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-none shadow-2xl bg-[#f6f8fa]">
        <TaskHeader 
          title={values.title}
          status={values.status}
          priority={values.priority}
          isEditingTitle={isEditingTitle}
          setIsEditingTitle={setIsEditingTitle}
          register={register}
          onSave={onSaveAll}
        />

        <div className="flex flex-col md:flex-row min-h-[400px]">
          <TaskContent 
            register={register}
            onSave={onSaveAll}
            isSaving={isSaving}
          />

          <TaskSidebar 
            control={control}
            users={users}
            values={values}
            handleUpdate={handleUpdate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
