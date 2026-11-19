import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { ThemeToggle } from './ThemeToggle';
import {
  Menu,
  Search,
  Bell,
  Flame,
  User as UserIcon,
  LogOut,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  onOpenMobile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/questions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Left side: Hamburger + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, Java, React, Kafka, System Design..."
            className="w-full pl-9 pr-12 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
            Enter
          </kbd>
        </form>
      </div>

      {/* Right side: Actions, Theme, Streak, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak badge */}
        <Link
          to="/daily"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{user?.dailyStreak || 7} Days</span>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <button
          onClick={() => toast.info('You have 2 revision challenges waiting today!')}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User Profile / Auth buttons */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                  {user.targetCompensation}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-40 py-1.5 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-3.5 py-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {user.experienceLevel} • {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Profile & Goals</span>
                    </Link>
                    <Link
                      to="/mock-interviews"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>AI Mock Interviews</span>
                    </Link>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full text-left px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              Start Free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
