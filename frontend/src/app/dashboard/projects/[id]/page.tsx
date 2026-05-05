'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  CheckCircle2, 
  Circle,
  Loader2,
  AlertCircle,
  Search,
  Pencil
} from 'lucide-react';
import api from '@/lib/axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { toast } from 'sonner';

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

interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchProjectDetails = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error('Failed to fetch project details', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Sync selected task if it exists and project data changes
  useEffect(() => {
    if (selectedTask && project) {
      const updated = project.tasks.find(t => t.id === selectedTask.id);
      if (updated && (
        updated.title !== selectedTask.title ||
        updated.description !== selectedTask.description ||
        updated.status !== selectedTask.status ||
        updated.priority !== selectedTask.priority ||
        updated.scheduledStart !== selectedTask.scheduledStart ||
        updated.scheduledEnd !== selectedTask.scheduledEnd
      )) {
        setSelectedTask(updated);
      }
    }
  }, [project, selectedTask]);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      toast.success(`Task status updated to ${newStatus.replace('_', ' ')}`);
      fetchProjectDetails();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted successfully');
      fetchProjectDetails();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-slate-500">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Project Not Found</h2>
        <Button onClick={() => router.push('/dashboard/projects')}>Back to Projects</Button>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE': return <Circle className="w-4 h-4 fill-orange-500 text-orange-500" />;
      case 'IN_PROGRESS': return <Circle className="w-4 h-4 fill-amber-500 text-amber-500" />;
      case 'TODO': return <Circle className="w-4 h-4 fill-blue-500 text-blue-500" />;
      default: return <Circle className="w-4 h-4 text-slate-300" />;
    }
  };

  const STATUS_OPTIONS = [
    { value: 'TODO', label: 'Todo', description: "This item hasn't been started", color: 'text-blue-500', icon: <Circle className="w-4 h-4 fill-blue-500 text-blue-500" /> },
    { value: 'IN_PROGRESS', label: 'In progress', description: 'This is actively being worked on', color: 'text-amber-500', icon: <Circle className="w-4 h-4 fill-amber-500 text-amber-500" /> },
    { value: 'DONE', label: 'Done', description: 'This has been completed', color: 'text-emerald-500', icon: <Circle className="w-4 h-4 fill-emerald-500 text-emerald-500" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog 
          task={selectedTask} 
          open={!!selectedTask} 
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onSuccess={() => fetchProjectDetails(true)}
        />
      )}

      <Button 
        variant="ghost" 
        className="gap-2 -ml-4 text-slate-500 hover:text-slate-900"
        onClick={() => router.push('/dashboard/projects')}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">{project.name}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">{project.description || 'No description provided.'}</p>
        </div>
        <CreateTaskDialog projectId={id as string} onSuccess={fetchProjectDetails} />
      </div>

      {/* KANBAN BOARD */}
      {(() => {
        const renderKanbanCard = (task: Task) => (
          <div key={task.id} className="bg-white border border-[#d0d7de] rounded-lg p-3 hover:border-slate-400 transition-colors cursor-pointer group shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {getStatusIcon(task.status)}
                </div>
                <div className="space-y-1 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {task.title}
                    </h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <button className="focus:outline-none hover:bg-slate-100 p-1 rounded-md transition-colors group-hover:opacity-100 opacity-0">
                          <MoreHorizontal className="w-4 h-4 text-slate-400" />
                        </button>
                      } />
                      <DropdownMenuContent align="end" className="w-[240px] p-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-white">
                        <div className="p-2 border-b bg-slate-50/50">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Actions</p>
                        </div>
                        <div className="p-1 border-b">
                          <DropdownMenuItem 
                            onClick={() => setSelectedTask(task)}
                            className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-slate-50 transition-colors focus:bg-slate-50"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-900">Edit Task</span>
                          </DropdownMenuItem>
                        </div>
                        <div className="p-1 border-b">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">Change Status</p>
                          {STATUS_OPTIONS.map((option, idx) => (
                            <DropdownMenuItem 
                              key={idx}
                              onClick={() => handleUpdateStatus(task.id, option.value)}
                              className="flex items-start gap-3 px-2 py-2 cursor-pointer hover:bg-slate-50 transition-colors focus:bg-slate-50 relative"
                            >
                              <div className="mt-1 shrink-0 scale-75 origin-top-left">
                                {option.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900">{option.label}</p>
                              </div>
                              {task.status === option.value && (
                                <div className="w-1 absolute left-0 top-1 bottom-1 bg-blue-500 rounded-r-full" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </div>
                        <div className="p-1">
                          <DropdownMenuItem className="text-red-600 text-xs font-semibold px-2 py-2 cursor-pointer" onClick={() => handleDeleteTask(task.id)}>
                            Delete Task
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {(() => {
                          const start = new Date(task.scheduledStart);
                          const end = new Date(task.scheduledEnd);
                          
                          const format = (d: Date) => 
                            d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                          
                          return `${format(start)} → ${format(end)}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

        return (
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex items-start gap-4 min-w-max">
          
          {/* TODO COLUMN (Backlog) */}
          <div className="w-[350px] shrink-0 bg-[#f6f8fa] rounded-xl border border-[#d0d7de] flex flex-col max-h-[70vh]">
            <div className="p-3 border-b border-[#d0d7de] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-sm text-slate-800">Todo</h3>
                <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full text-slate-500">
                  {project.tasks.filter(t => t.status === 'TODO').length}
                </span>
              </div>
            </div>
            <div className="p-3 overflow-y-auto flex-1 space-y-3">
              {project.tasks.filter(t => t.status === 'TODO').map(renderKanbanCard)}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div className="w-[350px] shrink-0 bg-[#f6f8fa] rounded-xl border border-[#d0d7de] flex flex-col max-h-[70vh]">
            <div className="p-3 border-b border-[#d0d7de] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-sm text-slate-800">In Progress</h3>
                <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full text-slate-500">
                  {project.tasks.filter(t => t.status === 'IN_PROGRESS').length}
                </span>
              </div>
            </div>
            <div className="p-3 overflow-y-auto flex-1 space-y-3">
              {project.tasks.filter(t => t.status === 'IN_PROGRESS').map(renderKanbanCard)}
            </div>
          </div>

          {/* DONE COLUMN */}
          <div className="w-[350px] shrink-0 bg-[#f6f8fa] rounded-xl border border-[#d0d7de] flex flex-col max-h-[70vh]">
            <div className="p-3 border-b border-[#d0d7de] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-sm text-slate-800">Done</h3>
                <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full text-slate-500">
                  {project.tasks.filter(t => t.status === 'DONE').length}
                </span>
              </div>
            </div>
            <div className="p-3 overflow-y-auto flex-1 space-y-3">
              {project.tasks.filter(t => t.status === 'DONE').map(renderKanbanCard)}
            </div>
          </div>

        </div>
      </div>
      );
      })()}
    </div>
  );
}
