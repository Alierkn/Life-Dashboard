import { getTodayString } from '../utils/date';
import { DEFAULT_LAYOUT } from './index';

export const getDefaultHabits = () => [
  {
    id: 1,
    title: 'Erken Kalk (07:00)',
    streak: 5,
    frequency: 'daily',
    completedDates: [getTodayString()],
    createdAt: '2026-01-01',
  },
  {
    id: 2,
    title: 'Haftalık Dergi Oku',
    streak: 2,
    frequency: 'weekly',
    completedDates: [],
    createdAt: '2026-01-15',
  },
];

export const getDefaultTasks = () => [
  { id: 1, text: 'Projeyi gözden geçir', completed: false, tag: 'İş', priority: 'high' },
  { id: 2, text: 'Markete git', completed: true, tag: 'Kişisel', priority: 'low' },
];

export const getDefaultGoals = () => [
  { id: 1, title: 'Tatil İçin Birikim', current: 6800, target: 10000, unit: '₺' },
];

export const getDefaultUserStats = () => ({ xp: 11240, level: 12 });

export const getDefaultLayout = () => ({
  left: DEFAULT_LAYOUT.LEFT,
  right: DEFAULT_LAYOUT.RIGHT,
});
