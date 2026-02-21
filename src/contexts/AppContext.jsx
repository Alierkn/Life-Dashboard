import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTodayString, getDaysBetween } from '../utils/date';
import { STORAGE_KEYS, XP, XP_PER_LEVEL, NOTIFICATION_AUTO_DISMISS_MS } from '../constants';

const migrateLayout = (layout, defaultLayout) => {
  let base = layout && Array.isArray(layout) ? layout : defaultLayout;
  if (!base.includes('calendar')) base = [...base, 'calendar'];
  if (!base.includes('stats')) base = [...base, 'stats'];
  base = base.filter((id) => id !== 'drinks' && id !== 'sport');
  return base;
};
import {
  getDefaultHabits,
  getDefaultTasks,
  getDefaultGoals,
  getDefaultUserStats,
  getDefaultLayout,
} from '../constants/defaults';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) || 'light');
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
    return saved ? JSON.parse(saved) : getDefaultHabits();
  });
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : getDefaultTasks();
  });
  const [taskLogs, setTaskLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASK_LOGS);
    return saved ? JSON.parse(saved) : [getTodayString()];
  });
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : getDefaultGoals();
  });
  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : getDefaultUserStats();
  });
  const [leftLayout, setLeftLayout] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAYOUT_LEFT);
    let base = saved ? JSON.parse(saved) : getDefaultLayout().left;
    if (!Array.isArray(base)) base = getDefaultLayout().left;
    else {
      base = base.filter((id) => id !== 'drinks' && id !== 'sport');
      if (!base.includes('drinks')) base = [...base, 'drinks'];
      if (!base.includes('sport')) base = [...base, 'sport'];
    }
    return base;
  });
  const [rightLayout, setRightLayout] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAYOUT_RIGHT);
    const parsed = saved ? JSON.parse(saved) : null;
    return migrateLayout(parsed, getDefaultLayout().right);
  });
  const [userName, setUserName] = useState(() => localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Şampiyon');
  const [lessons, setLessons] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
    return saved ? JSON.parse(saved) : [];
  });
  const [lessonTemplates, setLessonTemplates] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LESSON_TEMPLATES);
    return saved ? JSON.parse(saved) : [];
  });
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : [];
  });
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : [];
  });
  const [waterLogs, setWaterLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WATER_LOGS);
    return saved ? JSON.parse(saved) : {};
  });
  const [coffeeLogs, setCoffeeLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COFFEE_LOGS);
    return saved ? JSON.parse(saved) : {};
  });
  const [workoutLogs, setWorkoutLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    return saved ? JSON.parse(saved) : [];
  });
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECIPES);
    return saved ? JSON.parse(saved) : [];
  });
  const [mealLogs, setMealLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
    return saved ? JSON.parse(saved) : [];
  });
  const [notification, setNotification] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.THEME, theme); }, [theme]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASK_LOGS, JSON.stringify(taskLogs)); }, [taskLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(userStats)); }, [userStats]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERNAME, userName); }, [userName]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons)); }, [lessons]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LESSON_TEMPLATES, JSON.stringify(lessonTemplates)); }, [lessonTemplates]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(waterLogs)); }, [waterLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.COFFEE_LOGS, JSON.stringify(coffeeLogs)); }, [coffeeLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(workoutLogs)); }, [workoutLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(mealLogs)); }, [mealLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LAYOUT_LEFT, JSON.stringify(leftLayout)); }, [leftLayout]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LAYOUT_RIGHT, JSON.stringify(rightLayout)); }, [rightLayout]);

  // Dark mode
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Notification auto-dismiss
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), NOTIFICATION_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notification]);

  const addXp = useCallback((amount) => {
    setUserStats((prev) => ({
      ...prev,
      xp: Math.max(0, prev.xp + amount),
      level: Math.floor(Math.max(0, prev.xp + amount) / XP_PER_LEVEL) + 1,
    }));
  }, []);

  const showNotification = useCallback((msg) => setNotification(msg), []);

  const value = {
    theme,
    setTheme,
    habits,
    setHabits,
    tasks,
    setTasks,
    taskLogs,
    setTaskLogs,
    goals,
    setGoals,
    userStats,
    setUserStats,
    userName,
    setUserName,
    lessons,
    setLessons,
    lessonTemplates,
    setLessonTemplates,
    students,
    setStudents,
    expenses,
    setExpenses,
    waterLogs,
    setWaterLogs,
    coffeeLogs,
    setCoffeeLogs,
    workoutLogs,
    setWorkoutLogs,
    recipes,
    setRecipes,
    mealLogs,
    setMealLogs,
    leftLayout,
    setLeftLayout,
    rightLayout,
    setRightLayout,
    notification,
    setNotification,
    showNotification,
    isImporting,
    setIsImporting,
    addXp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
