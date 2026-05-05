'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import api from '@/lib/axios';
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog';
import { toast } from 'sonner';

import { ScheduleHeader } from '@/components/schedule/ScheduleHeader';
import { ScheduleCalendar } from '@/components/schedule/ScheduleCalendar';
import { ConflictSidebar } from '@/components/schedule/ConflictSidebar';

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

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    task: Task;
  };
}

export default function SchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  const fetchConflicts = useCallback(async () => {
    try {
      const res = await api.get('/schedule/conflicts');
      setConflicts(res.data);
    } catch (error) {
      console.error('Failed to fetch conflicts', error);
    }
  }, []);

  const fetchEvents = useCallback(async (info: any) => {
    const start = info?.startStr || calendarRef.current?.getApi().view.activeStart.toISOString();
    const end = info?.endStr || calendarRef.current?.getApi().view.activeEnd.toISOString();

    if (!start || !end) return;

    try {
      setLoading(true);
      const res = await api.get(`/schedule`, { params: { start, end } });

      const formattedEvents = res.data.map((task: Task) => {
        const isDone = task.status === 'DONE';
        return {
          id: task.id,
          title: task.title,
          start: task.scheduledStart,
          end: task.scheduledEnd,
          backgroundColor: isDone ? '#dbeafe' : (task.priority === 'HIGH' ? '#fee2e2' : task.priority === 'MEDIUM' ? '#fef3c7' : '#d1fae5'),
          borderColor: isDone ? '#3b82f6' : (task.priority === 'HIGH' ? '#ef4444' : task.priority === 'MEDIUM' ? '#f59e0b' : '#10b981'),
          textColor: isDone ? '#1e40af' : (task.priority === 'HIGH' ? '#991b1b' : task.priority === 'MEDIUM' ? '#92400e' : '#065f46'),
          className: isDone ? 'opacity-60' : '',
          extendedProps: { task }
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch schedule', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  const onTaskUpdateSuccess = () => {
    fetchEvents(null);
    fetchConflicts();
    setSelectedTask(null);
  };

  const handleEventChange = async (changeInfo: any) => {
    const { event } = changeInfo;
    try {
      setLoading(true);
      await api.patch(`/tasks/${event.id}`, {
        scheduledStart: event.start?.toISOString(),
        scheduledEnd: event.end?.toISOString()
      });
      toast.success(`Task "${event.title}" rescheduled`);
      fetchConflicts();
    } catch (error) {
      toast.error('Failed to reschedule task');
      changeInfo.revert();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
      <ScheduleHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ScheduleCalendar 
          calendarRef={calendarRef}
          events={events}
          loading={loading}
          onDatesSet={fetchEvents}
          onEventChange={handleEventChange}
          onEventClick={(info) => setSelectedTask(info.event.extendedProps.task)}
        />
        
        <ConflictSidebar conflicts={conflicts} />
      </div>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onSuccess={onTaskUpdateSuccess}
        />
      )}
    </div>
  );
}
