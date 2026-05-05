'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, MoreVertical, ExternalLink, Loader2, FolderKanban, User2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? All associated tasks will be removed.')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track all your active projects.</p>
        </div>
        <CreateProjectDialog onSuccess={fetchProjects} />
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search projects..."
          className="pl-9 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="font-medium animate-pulse">Loading your projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center h-48 text-slate-500">
            <FolderKanban className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-bold">No projects found.</p>
            <p className="text-sm">Try a different search or create a new project to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group hover:border-blue-300 transition-all shadow-sm hover:shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold truncate pr-4 text-slate-900 dark:text-white">{project.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={
                          <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
                        } />
                        <DropdownMenuItem className="text-red-600 font-medium" onClick={() => handleDeleteProject(project.id)}>
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10 italic">
                    {project.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center justify-between border-t pt-4 border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button size="sm" className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white">
                        Open Project <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block border rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 border-slate-200 dark:border-slate-800">
                  <TableHead className="font-bold text-slate-900 dark:text-white h-12">Project Name</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-white h-12">Description</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-white h-12">Created At</TableHead>
                  <TableHead className="w-[80px] h-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="group transition-colors border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10">
                    <TableCell className="font-bold">
                      <Link 
                        href={`/dashboard/projects/${project.id}`}
                        className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 transition-colors"
                      >
                        {project.name}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                          {project._count?.tasks || 0} Tasks
                        </span>
                        {user?.role === 'ADMIN' && project.owner && (
                          <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-900/50 flex items-center gap-1">
                             <User2 className="w-2.5 h-2.5" />
                             {project.owner.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 max-w-xs truncate italic text-sm">
                      {project.description || '-'}
                    </TableCell>
                    <TableCell className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                      {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full h-8 w-8">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem render={
                            <Link href={`/dashboard/projects/${project.id}`} className="flex items-center gap-2">
                              <FolderKanban className="w-4 h-4" />
                              View Details
                            </Link>
                          } />
                          <DropdownMenuItem 
                            className="text-red-600 font-semibold cursor-pointer focus:bg-red-50 focus:text-red-600"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
