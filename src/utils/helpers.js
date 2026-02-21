import { getPastDays } from './date';
import { RANK_TITLES } from '../constants';

/** @param {string} freq */
export const getFrequencyLabel = (freq) =>
  freq === 'weekly' ? 'Haftalık' : freq === 'monthly' ? 'Aylık' : 'Her Gün';

/** @param {number} level */
export const getRankTitle = (level) => {
  if (level < 5) return RANK_TITLES[5];
  if (level < 10) return RANK_TITLES[10];
  if (level < 20) return RANK_TITLES[20];
  if (level < 50) return RANK_TITLES[50];
  return RANK_TITLES.default;
};

/**
 * Ardışık tamamlanan günlerden en uzun seriyi hesaplar
 * @param {string[]} dates - YYYY-MM-DD formatında sıralı tarih dizisi
 */
const getLongestStreakFromDates = (dates) => {
  if (!dates || dates.length === 0) return 0;
  const sorted = [...dates].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }
  return Math.max(longest, current);
};

/**
 * Tüm serileri hesaplayıp ortalama seri uzunluğunu döner
 * @param {string[]} dates
 */
const getAverageStreakFromDates = (dates) => {
  if (!dates || dates.length === 0) return 0;
  const sorted = [...dates].sort();
  const streaks = [];
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      current++;
    } else {
      streaks.push(current);
      current = 1;
    }
  }
  streaks.push(current);
  const sum = streaks.reduce((a, b) => a + b, 0);
  return streaks.length > 0 ? Math.round((sum / streaks.length) * 10) / 10 : 0;
};

/**
 * @param {{ completedDates: string[]; frequency: string; targetPerPeriod?: number; streak?: number }} habit
 */
export const getHabitStats = (habit) => {
  const totalDays = habit.completedDates.length;
  const last30Days = getPastDays(30);
  let last30Count = 0;
  last30Days.forEach((d) => {
    if (habit.completedDates.includes(d)) last30Count++;
  });
  const divisor = habit.frequency === 'daily' ? 30 : habit.frequency === 'weekly' ? 4 : 1;
  const completionRate30 = Math.round((last30Count / divisor) * 100);

  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  habit.completedDates.forEach((d) => {
    const day = new Date(d).getDay();
    dayCounts[day]++;
  });
  const dayNames = ['Pazar', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const bestDays = dayCounts
    .map((c, i) => ({ day: dayNames[i], count: c }))
    .sort((a, b) => b.count - a.count)
    .filter((d) => d.count > 0)
    .slice(0, 3);

  const longestStreak = getLongestStreakFromDates(habit.completedDates);
  const averageStreak = getAverageStreakFromDates(habit.completedDates);

  return {
    totalDays,
    completionRate30: Math.min(completionRate30, 100),
    bestDays,
    completionRate: divisor > 0 ? Math.min(completionRate30, 100) : 0,
    longestStreak,
    averageStreak,
  };
};
