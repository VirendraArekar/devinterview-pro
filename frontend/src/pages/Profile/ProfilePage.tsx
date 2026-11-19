import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import {
  User as UserIcon,
  Mail,
  Briefcase,
  Target,
  FileText,
  Save,
  ShieldCheck,
  Moon,
  Sun,
} from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState(user?.name || 'Alex Johnson');
  const [bio, setBio] = useState(user?.bio || 'Full-Stack Developer preparing for Senior / Lead roles.');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || '5–8 Years');
  const [targetCompensation, setTargetCompensation] = useState(user?.targetCompensation || '₹25–30 LPA');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch('/users/profile', {
        name,
        bio,
        experienceLevel,
        targetCompensation,
      });
      dispatch(updateUser(res.data));
      toast.success('Profile settings updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const compensationOptions = [
    '₹15–20 LPA',
    '₹20–25 LPA',
    '₹25–30 LPA',
    '₹30–35 LPA',
    '₹35–40 LPA',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Profile & Target Compensation Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Customize your career target and compensation track to tailor problem recommendations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{name}</h2>
              <p className="text-xs text-slate-500">{user?.email || 'developer@devinterview.pro'}</p>
              <Badge variant="indigo" size="sm" className="mt-1">
                Role: {user?.role || 'USER'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'developer@devinterview.pro'}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Experience Tier
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {['3–5 Years', '5–8 Years', '8–12 Years', '12+ Years'].map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Compensation Goal
              </label>
              <select
                value={targetCompensation}
                onChange={(e) => setTargetCompensation(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {compensationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Professional Bio / Summary
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
