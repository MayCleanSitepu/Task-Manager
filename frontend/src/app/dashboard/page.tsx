'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { FolderKanban, CheckCircle2, Calendar as CalendarIcon, Clock, ArrowUpRight } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    todayEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0,0,0,0)).toISOString();
        const endOfDay = new Date(today.setHours(23,59,59,999)).toISOString();

        const [projectsRes, scheduleRes] = await Promise.all([
          api.get('/projects'),
          api.get('/schedule', { params: { start: startOfDay, end: endOfDay } })
        ]);
        
        setStats({
          projects: projectsRes.data.length,
          tasks: scheduleRes.data.length,
          todayEvents: scheduleRes.data.length
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome back, <span className="text-blue-600">{user?.name}</span>!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Here's a quick look at your workspace today.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden group border-none shadow-md bg-white dark:bg-slate-900 transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <FolderKanban className="w-24 h-24 text-blue-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Projects</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <FolderKanban className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{loading ? '...' : stats.projects}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              Active projects in your workspace
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-none shadow-md bg-white dark:bg-slate-900 transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-24 h-24 text-emerald-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Pending Tasks</CardTitle>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{loading ? '...' : stats.tasks}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              Tasks waiting for your attention
              <Clock className="w-3 h-3 text-amber-500" />
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-none shadow-md bg-white dark:bg-slate-900 transition-all hover:shadow-xl hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarIcon className="w-24 h-24 text-amber-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Today's Schedule</CardTitle>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{loading ? '...' : stats.todayEvents}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium italic">
              Items scheduled for today
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-linear-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold">Ready to get started?</h2>
            <p className="text-blue-100 opacity-90">View your active projects or check your schedule for the day.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/dashboard/projects" className="w-full sm:w-auto">
              <Button variant="secondary" className="font-bold w-full">View Projects</Button>
            </Link>
            <Link href="/dashboard/schedule" className="w-full sm:w-auto">
              <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white font-bold w-full">Schedule</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
