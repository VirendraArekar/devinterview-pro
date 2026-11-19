import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  HelpCircle,
  Code2,
  GitBranch,
  Layers,
  Sparkles,
  Award,
  CalendarCheck2,
  Bookmark,
  FileText,
  BarChart3,
  Settings,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      group: 'PREPARATION',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Interview Questions', icon: HelpCircle, path: '/questions' },
        { label: 'Coding Practice', icon: Code2, path: '/coding' },
        { label: 'DSA Roadmap', icon: GitBranch, path: '/dsa' },
        { label: 'System Design', icon: Layers, path: '/system-design' },
      ],
    },
    {
      group: 'ASSESSMENT',
      items: [
        { label: 'Mock Interviews', icon: Sparkles, path: '/mock-interviews', badge: 'AI' },
        { label: 'Quizzes', icon: Award, path: '/quizzes' },
        { label: 'Daily Challenges', icon: CalendarCheck2, path: '/daily' },
      ],
    },
    {
      group: 'WORKSPACE',
      items: [
        { label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
        { label: 'My Notes', icon: FileText, path: '/bookmarks?tab=notes' },
        { label: 'Progress Analytics', icon: BarChart3, path: '/analytics' },
        { label: 'Profile & Settings', icon: Settings, path: '/profile' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-lg shadow-sm">
              DP
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight leading-none text-base">
                  DevInterview<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                  ₹15–40 LPA Career Platform
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Target Track Callout */}
        {!collapsed && (
          <div className="mx-3 mt-3 p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <div className="text-xs">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Senior Track</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Target: ₹25–35 LPA</div>
              </div>
            </div>
            <span className="inline-flex items-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              Active
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navItems.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  {group.group}
                </div>
              )}
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group',
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                        collapsed && 'justify-center px-2',
                      )
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Streak */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div
            className={clsx(
              'flex items-center gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300',
              collapsed && 'justify-center',
            )}
          >
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse flex-shrink-0" />
            {!collapsed && (
              <div className="text-xs">
                <span className="font-bold">7-Day Streak!</span>
                <span className="block text-[10px] text-amber-700 dark:text-amber-400">
                  Keep solving daily
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
