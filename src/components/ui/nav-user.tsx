// src/components/ui/nav-user.tsx
import React from 'react';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import useUserStore from '@/stores/useUserStore';

export function NavUser() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    clearUser();
    localStorage.removeItem('user-storage');
    navigate('/login');
  };

  // Get initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 cursor-default">
              {/* Avatar — emerald gradient */}
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold shrink-0 shadow-sm">
                {initials}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                  {user?.name?.trim() || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate leading-tight">
                  {user?.email?.trim() || ''}
                </p>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                title="Logout"
                className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
