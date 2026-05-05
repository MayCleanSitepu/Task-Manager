'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Calendar, LogOut, CheckSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-slate-100 h-screen border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <CheckSquare className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Task Manager</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group',
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-white"
            )} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="px-4 py-3 mb-4 bg-slate-800/50 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-white truncate max-w-[120px]">{user?.name}</p>
            <span className={cn(
              "text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter",
              user?.role === 'ADMIN' ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-blue-500/20 text-blue-500 border border-blue-500/30"
            )}>
              {user?.role}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate font-medium">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
