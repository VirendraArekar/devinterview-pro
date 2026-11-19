import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleTheme } from '../../store/slices/themeSlice';
import { Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

export const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.mode);

  const handleToggle = () => {
    dispatch(toggleTheme());
    const newTheme = theme === 'light' ? 'Dark' : 'Light';
    toast.success(`Switched to ${newTheme} mode`);
  };

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-slate-700" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
};
