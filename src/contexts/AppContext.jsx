import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getTodayString } from '../utils/date';
import { STORAGE_KEYS, XP_PER_LEVEL, NOTIFICATION_AUTO_DISMISS_MS } from '../constants';
import { fetchSync, pushSync, getDeviceId } from '../api/sync';

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

const loadFromStorage = () => ({
  theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'light',
  habits: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.HABITS);
    return s ? JSON.parse(s) : getDefaultHabits();
  })(),
  tasks: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.TASKS);
    return s ? JSON.parse(s) : getDefaultTasks();
  })(),
  taskLogs: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.TASK_LOGS);
    return s ? JSON.parse(s) : [getTodayString()];
  })(),
  goals: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.GOALS);
    return s ? JSON.parse(s) : getDefaultGoals();
  })(),
  userStats: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.STATS);
    return s ? JSON.parse(s) : getDefaultUserStats();
  })(),
  leftLayout: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.LAYOUT_LEFT);
    let base = s ? JSON.parse(s) : getDefaultLayout().left;
    if (!Array.isArray(base)) base = getDefaultLayout().left;
    else {
      base = base.filter((id) => id !== 'drinks' && id !== 'sport');
      if (!base.includes('drinks')) base = [...base, 'drinks'];
      if (!base.includes('sport')) base = [...base, 'sport'];
    }
    return base;
  })(),
  rightLayout: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.LAYOUT_RIGHT);
    return migrateLayout(s ? JSON.parse(s) : null, getDefaultLayout().right);
  })(),
  userName: localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Şampiyon',
  lessons: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.LESSONS);
    return s ? JSON.parse(s) : [];
  })(),
  lessonTemplates: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.LESSON_TEMPLATES);
    return s ? JSON.parse(s) : [];
  })(),
  students: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return s ? JSON.parse(s) : [];
  })(),
  expenses: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return s ? JSON.parse(s) : [];
  })(),
  waterLogs: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.WATER_LOGS);
    return s ? JSON.parse(s) : {};
  })(),
  coffeeLogs: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.COFFEE_LOGS);
    return s ? JSON.parse(s) : {};
  })(),
  workoutLogs: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    return s ? JSON.parse(s) : [];
  })(),
  recipes: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.RECIPES);
    return s ? JSON.parse(s) : [];
  })(),
  mealLogs: (() => {
    const s = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
    return s ? JSON.parse(s) : [];
  })(),
});

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const stored = loadFromStorage();
  const [theme, setTheme] = useState(stored.theme);
  const [habits, setHabits] = useState(stored.habits);
  const [tasks, setTasks] = useState(stored.tasks);
  const [taskLogs, setTaskLogs] = useState(stored.taskLogs);
  const [goals, setGoals] = useState(stored.goals);
  const [userStats, setUserStats] = useState(stored.userStats);
  const [leftLayout, setLeftLayout] = useState(stored.leftLayout);
  const [rightLayout, setRightLayout] = useState(stored.rightLayout);
  const [userName, setUserName] = useState(stored.userName);
  const [lessons, setLessons] = useState(stored.lessons);
  const [lessonTemplates, setLessonTemplates] = useState(stored.lessonTemplates);
  const [students, setStudents] = useState(stored.students);
  const [expenses, setExpenses] = useState(stored.expenses);
  const [waterLogs, setWaterLogs] = useState(stored.waterLogs);
  const [coffeeLogs, setCoffeeLogs] = useState(stored.coffeeLogs);
  const [workoutLogs, setWorkoutLogs] = useState(stored.workoutLogs);
  const [recipes, setRecipes] = useState(stored.recipes);
  const [mealLogs, setMealLogs] = useState(stored.mealLogs);
  const [notification, setNotification] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | loading | synced | error
  const [syncError, setSyncError] = useState(null);
  const pushTimeoutRef = useRef(null);
  const initialFetchDone = useRef(false);

  // Sunucudan gelen veriyi state'e uygula (tekrar kullanım için)
  const applyServerData = useCallback((data) => {
    if (data.user) {
      if (data.user.userName) setUserName(data.user.userName);
      if (data.user.theme) setTheme(data.user.theme);
      if (data.user.xp != null) setUserStats((prev) => ({ ...prev, xp: data.user.xp }));
      if (data.user.level != null) setUserStats((prev) => ({ ...prev, level: data.user.level }));
      if (data.user.leftLayout?.length) setLeftLayout(data.user.leftLayout);
      if (data.user.rightLayout?.length) setRightLayout(data.user.rightLayout);
    }
    if (Array.isArray(data.habits)) setHabits(data.habits);
    if (Array.isArray(data.tasks)) setTasks(data.tasks);
    if (Array.isArray(data.taskLogs)) setTaskLogs(data.taskLogs);
    if (Array.isArray(data.goals)) setGoals(data.goals);
    if (Array.isArray(data.lessons)) setLessons(data.lessons);
    if (Array.isArray(data.lessonTemplates)) setLessonTemplates(data.lessonTemplates);
    if (Array.isArray(data.students)) setStudents(data.students);
    if (Array.isArray(data.expenses)) setExpenses(data.expenses);
    if (data.waterLogs && typeof data.waterLogs === 'object') setWaterLogs(data.waterLogs);
    if (data.coffeeLogs && typeof data.coffeeLogs === 'object') setCoffeeLogs(data.coffeeLogs);
    if (Array.isArray(data.workoutLogs)) setWorkoutLogs(data.workoutLogs);
    if (Array.isArray(data.recipes)) setRecipes(data.recipes);
    if (Array.isArray(data.mealLogs)) setMealLogs(data.mealLogs);
  }, []);

  // Fetch from Neon on mount
  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    setSyncStatus('loading');
    const initialPayload = {
      userName: stored.userName,
      theme: stored.theme,
      userStats: { xp: stored.userStats.xp, level: stored.userStats.level },
      leftLayout: stored.leftLayout,
      rightLayout: stored.rightLayout,
      habits: stored.habits,
      tasks: stored.tasks,
      taskLogs: stored.taskLogs,
      goals: stored.goals,
      lessons: stored.lessons,
      lessonTemplates: stored.lessonTemplates,
      students: stored.students,
      expenses: stored.expenses,
      waterLogs: stored.waterLogs,
      coffeeLogs: stored.coffeeLogs,
      workoutLogs: stored.workoutLogs,
      recipes: stored.recipes,
      mealLogs: stored.mealLogs,
    };
    fetchSync()
      .then((data) => {
        const serverHadData = (data.habits?.length || data.tasks?.length || data.lessons?.length || data.lessonTemplates?.length || data.students?.length || Object.keys(data.waterLogs || {}).length || Object.keys(data.coffeeLogs || {}).length || data.workoutLogs?.length || data.recipes?.length || data.mealLogs?.length || data.goals?.length) > 0;
        const hasLocalData = (initialPayload.habits?.length || initialPayload.tasks?.length || initialPayload.lessons?.length || initialPayload.lessonTemplates?.length || initialPayload.students?.length || Object.keys(initialPayload.waterLogs || {}).length || Object.keys(initialPayload.coffeeLogs || {}).length || initialPayload.workoutLogs?.length || initialPayload.recipes?.length || initialPayload.mealLogs?.length || initialPayload.goals?.length) > 0;

        if (serverHadData) {
          applyServerData(data);
        } else if (hasLocalData) {
          // Sunucu boş, yerel veri var - üzerine yazma, sadece push et (veri kaybı önleme)
          pushSync(initialPayload).then(() => {}).catch((e) => { setSyncStatus('error'); setSyncError(e.message); });
        } else {
          applyServerData(data);
        }
        setSyncStatus('synced');
        setSyncError(null);
      })
      .catch((err) => {
        setSyncStatus('error');
        setSyncError(err.message);
        const hasLocalData = initialPayload.habits?.length || initialPayload.tasks?.length || initialPayload.lessons?.length || initialPayload.lessonTemplates?.length || initialPayload.students?.length;
        if (hasLocalData) {
          pushSync(initialPayload).then(() => { setSyncStatus('synced'); setSyncError(null); }).catch(() => {});
        }
      });
  }, []);

  // Sekme kapanırken/arka plana giderken hemen push (veri kaybını önle)
  useEffect(() => {
    const onHide = () => {
      if (pushTimeoutRef.current) {
        clearTimeout(pushTimeoutRef.current);
        pushTimeoutRef.current = null;
      }
      pushSync(getSyncPayload()).catch(() => {});
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') onHide();
    };
    const onBeforeUnload = () => onHide();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [getSyncPayload]);

  // Canlı senkronizasyon: periyodik polling + sekme görünür olduğunda hemen fetch
  const POLL_INTERVAL_MS = 2_000; // 2 saniye - dersler/görevler anında senkron
  useEffect(() => {
    if (!initialFetchDone.current) return;

    const doFetch = () => {
      fetchSync()
        .then((data) => {
          const serverHadData = (data.habits?.length || data.tasks?.length || data.lessons?.length || data.lessonTemplates?.length || data.students?.length || Object.keys(data.waterLogs || {}).length || Object.keys(data.coffeeLogs || {}).length || data.workoutLogs?.length || data.recipes?.length || data.mealLogs?.length || data.goals?.length) > 0;
          if (serverHadData) {
            applyServerData(data);
          }
          setSyncStatus((s) => (s === 'loading' ? s : 'synced'));
          setSyncError(null);
        })
        .catch(() => { /* sessizce devam et, syncStatus değiştirme */ });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') doFetch();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    if (document.visibilityState === 'visible') doFetch();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') doFetch();
    }, POLL_INTERVAL_MS);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(interval);
    };
  }, [applyServerData]);

  // Build sync payload
  const getSyncPayload = useCallback(() => ({
    userName,
    theme,
    userStats: { xp: userStats.xp, level: userStats.level },
    leftLayout,
    rightLayout,
    habits,
    tasks,
    taskLogs,
    goals,
    lessons,
    lessonTemplates,
    students,
    expenses,
    waterLogs,
    coffeeLogs,
    workoutLogs,
    recipes,
    mealLogs,
  }), [userName, theme, userStats, leftLayout, rightLayout, habits, tasks, taskLogs, goals, lessons, lessonTemplates, students, expenses, waterLogs, coffeeLogs, workoutLogs, recipes, mealLogs]);

  // Debounced push to Neon
  const schedulePush = useCallback(() => {
    if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    pushTimeoutRef.current = setTimeout(() => {
      pushSync(getSyncPayload())
        .then(() => {
          setSyncStatus('synced');
          setSyncError(null);
        })
        .catch((err) => {
          setSyncStatus('error');
          setSyncError(err.message);
        });
      pushTimeoutRef.current = null;
    }, 300);
  }, [getSyncPayload]);

  // Push to API when data changes (debounced)
  useEffect(() => {
    if (!initialFetchDone.current) return;
    schedulePush();
    return () => {
      if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    };
  }, [habits, tasks, taskLogs, goals, lessons, lessonTemplates, students, expenses, waterLogs, coffeeLogs, workoutLogs, recipes, mealLogs, userName, theme, userStats, leftLayout, rightLayout, schedulePush]);

  // Persist to localStorage (fallback / offline)
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

  const setDeviceId = useCallback((newId) => {
    if (newId?.trim()) {
      localStorage.setItem('life_dashboard_device_id', newId.trim());
      window.location.reload();
    }
  }, []);

  const refetchFromServer = useCallback(() => {
    setSyncStatus('loading');
    fetchSync()
      .then((data) => {
        applyServerData(data);
        setSyncStatus('synced');
        setSyncError(null);
      })
      .catch((err) => {
        setSyncStatus('error');
        setSyncError(err.message);
      });
  }, [applyServerData]);

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
    syncStatus,
    syncError,
    deviceId: getDeviceId(),
    setDeviceId,
    refetchFromServer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
