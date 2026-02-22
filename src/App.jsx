import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { getTodayString, getPastDays, getCurrentWeekDates } from './utils/date';
import { getHabitStats } from './utils/helpers';
import { validateImportData } from './utils/importValidation';
import { usePenaltyCheck } from './hooks/usePenaltyCheck';
import { useAITip } from './hooks/useAITip';
import { useTimer } from './hooks/useTimer';
import { XP } from './constants';
import Header from './components/Header';
import NotificationBanner from './components/NotificationBanner';
import MobileNav from './components/MobileNav';
import WidgetWrapper from './components/layout/WidgetWrapper';
import WelcomeWidget from './components/widgets/WelcomeWidget';
import TimerWidget from './components/widgets/TimerWidget';
import ActivityWidget from './components/widgets/ActivityWidget';
import AICoachWidget from './components/widgets/AICoachWidget';
import HabitsWidget from './components/widgets/HabitsWidget';
import TasksWidget from './components/widgets/TasksWidget';
import StatsWidget from './components/widgets/StatsWidget';
import DrinkTrackerWidget from './components/widgets/DrinkTrackerWidget';
import SportWorkoutWidget from './components/widgets/SportWorkoutWidget';
import GoalsWidget from './components/widgets/GoalsWidget';
import CalendarWidget from './components/widgets/CalendarWidget';
import DashboardLayout from './components/layout/DashboardLayout';
import LessonsLayout from './components/layout/LessonsLayout';
import FoodLayout from './components/layout/FoodLayout';

const ProfileLayout = lazy(() => import('./components/layout/ProfileLayout'));

function AppContent() {
  const {
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
    isImporting,
    setIsImporting,
    addXp,
    syncStatus,
    syncError,
    deviceId,
    setDeviceId,
    refetchFromServer,
  } = useApp();

  const [isEditLayoutMode, setIsEditLayoutMode] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activityTab, setActivityTab] = useState('habits'); 

  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState('daily');
  const [newHabitTarget, setNewHabitTarget] = useState('');

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('Genel');
  const [newTaskPriority, setNewTaskPriority] = useState('low');
  const [newTaskRepeat, setNewTaskRepeat] = useState('none');
  const [taskFilterTag, setTaskFilterTag] = useState('');
  const [taskSortBy, setTaskSortBy] = useState('priority');

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalData, setNewGoalData] = useState({ title: '', target: '', unit: '' });

  const [expandedHabitId, setExpandedHabitId] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);

  const todayStr = getTodayString();
  const weekDates = getCurrentWeekDates();
  const dailyHabits = habits.filter((h) => h.frequency === 'daily');
  const completedTodayCount = dailyHabits.filter((h) => h.completedDates.includes(todayStr)).length;
  const progressPercent = dailyHabits.length > 0 ? (completedTodayCount / dailyHabits.length) * 100 : 0;

  const last56Days = getPastDays(56);
  const activeContributionData = last56Days.map((date) => {
    let count = 0;
    if (activityTab === 'habits') {
      habits.forEach((h) => {
        if (h.completedDates.includes(date)) count++;
      });
    } else {
      taskLogs.forEach((logDate) => {
        if (logDate === date) count++;
      });
    }
    return { date, count };
  });

  const generateAiTip = useAITip(habits, tasks, userStats);
  const [aiTip, setAiTip] = useState('');

  useEffect(() => {
    setAiTip(generateAiTip());
  }, [generateAiTip]);

  usePenaltyCheck(setHabits, setUserStats, setNotification);

  const {
    timerDuration,
    timerActive,
    timeLeft,
    timerMode,
    handleDurationChange,
    toggleTimer,
  } = useTimer(null, addXp);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const toggleHabitDate = useCallback(
    (habitId, dateStr) => {
      setHabits((prevHabits) =>
        prevHabits.map((habit) => {
          if (habit.id !== habitId) return habit;
          const isCompleted = habit.completedDates.includes(dateStr);
          let newDates;
          let newStreak = habit.streak;

          if (isCompleted) {
            newDates = habit.completedDates.filter((d) => d !== dateStr);
            if (dateStr === getTodayString()) addXp(XP.HABIT_UNDO);
          } else {
            newDates = [...habit.completedDates, dateStr];
            if (dateStr === getTodayString()) {
              newStreak += 1;
              addXp(XP.HABIT_COMPLETE);
            }
          }
          return { ...habit, completedDates: newDates, streak: newStreak };
        })
      );
    },
    [setHabits, addXp]
  );

  const toggleTask = useCallback(
    (id) => {
      setTasks((prevTasks) => {
        let newTaskToAdd = null;
        const updated = prevTasks.map((task) => {
          if (task.id !== id) return task;
          const willComplete = !task.completed;
          if (willComplete) {
            addXp(XP.TASK_COMPLETE);
            setTaskLogs((prev) => [...prev, getTodayString()]);
            if (task.repeat && task.repeat !== 'none') {
              newTaskToAdd = {
                id: Date.now() + 1,
                text: task.text,
                completed: false,
                tag: task.tag,
                priority: task.priority,
                repeat: task.repeat,
                subtasks: [],
              };
            }
          } else {
            addXp(XP.TASK_UNDO);
            setTaskLogs((prev) => {
              const arr = [...prev];
              const idx = arr.lastIndexOf(getTodayString());
              if (idx > -1) arr.splice(idx, 1);
              return arr;
            });
          }
          const subs = task.subtasks || [];
          const newSubtasks = subs.length > 0 ? subs.map((s) => ({ ...s, completed: willComplete })) : subs;
          return { ...task, completed: willComplete, subtasks: newSubtasks };
        });
        return newTaskToAdd ? [...updated, newTaskToAdd] : updated;
      });
    },
    [setTasks, setTaskLogs, addXp]
  );

  const toggleSubtask = useCallback(
    (taskId, subtaskId) => {
      setTasks((prev) => {
        let justCompletedAll = false;
        const updated = prev.map((t) => {
          if (t.id !== taskId) return t;
          const subs = t.subtasks || [];
          const newSubs = subs.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s));
          const allDone = newSubs.length > 0 && newSubs.every((s) => s.completed);
          if (allDone && !t.completed) justCompletedAll = true;
          return {
            ...t,
            subtasks: newSubs,
            completed: allDone ? true : newSubs.length === 0 ? t.completed : false,
          };
        });
        if (justCompletedAll) {
          addXp(XP.TASK_COMPLETE);
          setTaskLogs((prev) => [...prev, getTodayString()]);
        }
        return updated;
      });
    },
    [setTasks, addXp, setTaskLogs]
  );

  const addSubtask = useCallback((taskId, text) => {
    if (!text?.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const subs = [...(t.subtasks || []), { id: Date.now(), text: text.trim(), completed: false }];
        return { ...t, subtasks: subs };
      })
    );
  }, [setTasks]);

  const deleteSubtask = useCallback((taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const subs = (t.subtasks || []).filter((s) => s.id !== subtaskId);
        const allDone = subs.length > 0 && subs.every((s) => s.completed);
        return { ...t, subtasks: subs, completed: subs.length === 0 ? t.completed : allDone };
      })
    );
  }, [setTasks]);

  const addNewHabit = useCallback(() => {
    if (!newHabitTitle.trim()) return;
    setHabits((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newHabitTitle,
        streak: 0,
        frequency: newHabitFreq,
        completedDates: [],
        targetPerPeriod: newHabitTarget ? parseInt(newHabitTarget, 10) : undefined,
        createdAt: getTodayString(),
      },
    ]);
    setNewHabitTitle('');
    setNewHabitFreq('daily');
    setNewHabitTarget('');
    setShowAddHabit(false);
  }, [newHabitTitle, newHabitFreq, newHabitTarget, setHabits]);

  const addNewTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: newTaskTitle,
        completed: false,
        tag: newTaskTag,
        priority: newTaskPriority,
        repeat: newTaskRepeat,
        subtasks: [],
      },
    ]);
    setNewTaskTitle('');
    setNewTaskTag('Genel');
    setNewTaskPriority('low');
    setNewTaskRepeat('none');
    setShowAddTask(false);
  }, [newTaskTitle, newTaskTag, newTaskPriority, newTaskRepeat, setTasks]);

  const addNewGoal = useCallback(() => {
    if (!newGoalData.title.trim() || !newGoalData.target) return;
    setGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newGoalData.title,
        current: 0,
        target: Number(newGoalData.target),
        unit: newGoalData.unit || 'Birim',
        isCompleted: false,
      },
    ]);
    setNewGoalData({ title: '', target: '', unit: '' });
    setShowAddGoal(false);
  }, [newGoalData, setGoals]);

  const deleteHabit = useCallback((id) => setHabits((prev) => prev.filter((h) => h.id !== id)), [setHabits]);
  const deleteTask = useCallback((id) => setTasks((prev) => prev.filter((t) => t.id !== id)), [setTasks]);
  const clearCompletedTasks = useCallback(() => {
    setTasks((prev) => {
      const completedCount = prev.filter((t) => t.completed).length;
      if (completedCount > 0) {
        setTaskLogs((logs) => {
          const arr = [...logs];
          let toRemove = completedCount;
          for (let i = arr.length - 1; i >= 0 && toRemove > 0; i--) {
            arr.splice(i, 1);
            toRemove--;
          }
          return arr;
        });
      }
      return prev.filter((t) => !t.completed);
    });
  }, [setTasks, setTaskLogs]);
  const deleteGoal = useCallback((id) => setGoals((prev) => prev.filter((g) => g.id !== id)), [setGoals]);

  const updateGoalProgress = useCallback(
    (goalId, amount) => {
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, current: Math.min(g.target, g.current + amount) } : g))
      );
    },
    [setGoals]
  );

  const moveWidget = useCallback(
    (widgetId, currentColumn, direction) => {
      const sourceArray = currentColumn === 'left' ? [...leftLayout] : [...rightLayout];
      const destArray = currentColumn === 'left' ? [...rightLayout] : [...leftLayout];
      const currentIndex = sourceArray.indexOf(widgetId);

      if (direction === 'up' && currentIndex > 0) {
        [sourceArray[currentIndex - 1], sourceArray[currentIndex]] = [sourceArray[currentIndex], sourceArray[currentIndex - 1]];
        currentColumn === 'left' ? setLeftLayout(sourceArray) : setRightLayout(sourceArray);
      } else if (direction === 'down' && currentIndex < sourceArray.length - 1) {
        [sourceArray[currentIndex + 1], sourceArray[currentIndex]] = [sourceArray[currentIndex], sourceArray[currentIndex + 1]];
        currentColumn === 'left' ? setLeftLayout(sourceArray) : setRightLayout(sourceArray);
      } else if (direction === 'right' && currentColumn === 'left') {
        sourceArray.splice(currentIndex, 1);
        destArray.push(widgetId);
        setLeftLayout(sourceArray);
        setRightLayout(destArray);
      } else if (direction === 'left' && currentColumn === 'right') {
        sourceArray.splice(currentIndex, 1);
        destArray.push(widgetId);
        setRightLayout(sourceArray);
        setLeftLayout(destArray);
      }
    },
    [leftLayout, rightLayout, setLeftLayout, setRightLayout]
  );

  const handleDragDrop = useCallback(
    (widgetId, fromColumn, targetColumn, targetIndex) => {
      const sourceArray = fromColumn === 'left' ? [...leftLayout] : [...rightLayout];
      const sourceIndex = sourceArray.indexOf(widgetId);
      if (sourceIndex === -1) return;
      if (fromColumn === targetColumn && sourceIndex === targetIndex) return;

      sourceArray.splice(sourceIndex, 1);

      if (fromColumn === targetColumn) {
        const adjustedIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
        sourceArray.splice(Math.min(adjustedIndex, sourceArray.length), 0, widgetId);
        if (targetColumn === 'left') {
          setLeftLayout(sourceArray);
        } else {
          setRightLayout(sourceArray);
        }
      } else {
        const destArray = fromColumn === 'left' ? [...rightLayout] : [...leftLayout];
        destArray.splice(Math.min(targetIndex, destArray.length), 0, widgetId);
        if (targetColumn === 'left') {
          setLeftLayout(destArray);
          setRightLayout(sourceArray);
        } else {
          setRightLayout(destArray);
          setLeftLayout(sourceArray);
        }
      }
    },
    [leftLayout, rightLayout, setLeftLayout, setRightLayout]
  );

  const handleExport = useCallback(() => {
    const data = {
      habits,
      tasks,
      taskLogs,
      goals,
      userStats,
      userName,
      lessons,
      lessonTemplates,
      students,
      expenses,
      waterLogs,
      coffeeLogs,
      workoutLogs,
      recipes,
      mealLogs,
      leftLayout,
      rightLayout,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeDashboard_Yedek_${getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [habits, tasks, taskLogs, goals, userStats, userName, lessons, lessonTemplates, students, expenses, waterLogs, coffeeLogs, workoutLogs, recipes, mealLogs, leftLayout, rightLayout]);

  const handleImport = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setIsImporting(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          const { valid, error } = validateImportData(data);
          if (!valid) {
            setNotification(error || 'Geçersiz yedek dosyası!');
            return;
          }
          setHabits(data.habits);
          setTasks(data.tasks || []);
          setTaskLogs(data.taskLogs || []);
          setGoals(data.goals || []);
          setUserStats(data.userStats);
          setUserName(data.userName || 'Şampiyon');
          if (data.lessons) setLessons(data.lessons);
          if (data.lessonTemplates) setLessonTemplates(data.lessonTemplates);
          if (data.students) setStudents(data.students);
          if (data.expenses) setExpenses(data.expenses);
          if (data.waterLogs) setWaterLogs(data.waterLogs);
          if (data.coffeeLogs) setCoffeeLogs(data.coffeeLogs);
          if (data.workoutLogs) setWorkoutLogs(data.workoutLogs);
          if (data.recipes) setRecipes(data.recipes);
          if (data.mealLogs) setMealLogs(data.mealLogs);
          if (data.leftLayout) setLeftLayout(data.leftLayout);
          if (data.rightLayout) setRightLayout(data.rightLayout);
          setNotification('Veriler başarıyla yüklendi!');
        } catch {
          setNotification('Dosya okunamadı veya geçersiz format.');
        } finally {
          setIsImporting(false);
          e.target.value = '';
        }
      };
      reader.readAsText(file);
    },
    [
      setHabits,
      setTasks,
      setTaskLogs,
      setGoals,
      setUserStats,
      setUserName,
      setLessons,
      setLessonTemplates,
      setStudents,
      setExpenses,
      setWaterLogs,
      setCoffeeLogs,
      setWorkoutLogs,
      setRecipes,
      setMealLogs,
      setLeftLayout,
      setRightLayout,
      setNotification,
    ]
  );

  const navigateTo = useCallback((view) => {
    setCurrentView(view);
    setIsEditLayoutMode(false);
  }, []);

  const toggleEditLayout = useCallback((v) => {
    if (v !== undefined) setIsEditLayoutMode(v);
    else setIsEditLayoutMode((prev) => !prev);
  }, []);

  const handleSetEditLayout = useCallback((v) => setIsEditLayoutMode(v), []);

  const widgetMap = {
    welcome: (
      <WelcomeWidget progressPercent={progressPercent} />
    ),
    timer: (
      <TimerWidget
        timerDuration={timerDuration}
        timerActive={timerActive}
        timeLeft={timeLeft}
        timerMode={timerMode}
        onDurationChange={handleDurationChange}
        onToggleTimer={toggleTimer}
      />
    ),
    activity: (
      <ActivityWidget
        activityTab={activityTab}
        onTabChange={setActivityTab}
        contributionData={activeContributionData}
      />
    ),
    aiCoach: <AICoachWidget aiTip={aiTip} />,
    habits: (
      <HabitsWidget
        habits={habits}
        todayStr={todayStr}
        weekDates={weekDates}
        expandedHabitId={expandedHabitId}
        showAddHabit={showAddHabit}
        newHabitTitle={newHabitTitle}
        newHabitFreq={newHabitFreq}
        newHabitTarget={newHabitTarget}
        onToggleHabitDate={toggleHabitDate}
        onAddHabit={addNewHabit}
        onDeleteHabit={deleteHabit}
        onSetShowAddHabit={setShowAddHabit}
        onSetNewHabitTitle={setNewHabitTitle}
        onSetNewHabitFreq={setNewHabitFreq}
        onSetNewHabitTarget={setNewHabitTarget}
        onSetExpandedHabitId={setExpandedHabitId}
        getHabitStats={getHabitStats}
      />
    ),
    tasks: (
      <TasksWidget
        tasks={tasks}
        showAddTask={showAddTask}
        newTaskTitle={newTaskTitle}
        newTaskTag={newTaskTag}
        newTaskPriority={newTaskPriority}
        newTaskRepeat={newTaskRepeat}
        taskFilterTag={taskFilterTag}
        taskSortBy={taskSortBy}
        onToggleTask={toggleTask}
        onAddTask={addNewTask}
        onDeleteTask={deleteTask}
        onClearCompleted={clearCompletedTasks}
        onToggleSubtask={toggleSubtask}
        onAddSubtask={addSubtask}
        onDeleteSubtask={deleteSubtask}
        onSetShowAddTask={setShowAddTask}
        onSetNewTaskTitle={setNewTaskTitle}
        onSetNewTaskTag={setNewTaskTag}
        onSetNewTaskPriority={setNewTaskPriority}
        onSetNewTaskRepeat={setNewTaskRepeat}
        onSetTaskFilterTag={setTaskFilterTag}
        onSetTaskSortBy={setTaskSortBy}
      />
    ),
    goals: (
      <GoalsWidget
        goals={goals}
        showAddGoal={showAddGoal}
        newGoalData={newGoalData}
        onAddGoal={addNewGoal}
        onDeleteGoal={deleteGoal}
        onUpdateGoalProgress={updateGoalProgress}
        onSetShowAddGoal={setShowAddGoal}
        onSetNewGoalData={setNewGoalData}
      />
    ),
    calendar: (
      <CalendarWidget
        habits={habits}
        tasks={tasks}
        taskLogs={taskLogs}
        onToggleHabitDate={toggleHabitDate}
      />
    ),
    stats: (
      <StatsWidget
        habits={habits}
        tasks={tasks}
        taskLogs={taskLogs}
        goals={goals}
        lessons={lessons}
      />
    ),
    drinks: (
      <DrinkTrackerWidget
        waterLogs={waterLogs}
        setWaterLogs={setWaterLogs}
        coffeeLogs={coffeeLogs}
        setCoffeeLogs={setCoffeeLogs}
      />
    ),
    sport: (
      <SportWorkoutWidget
        workoutLogs={workoutLogs}
        setWorkoutLogs={setWorkoutLogs}
      />
    ),
  };

  return (
    <div className="min-h-screen bg-[#fffdf7] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans p-4 md:p-6 selection:bg-purple-200 selection:text-purple-900 pb-28 md:pb-20 safe-area-inset-bottom relative transition-colors duration-300 overflow-x-hidden">
      <NotificationBanner message={notification} onDismiss={() => setNotification(null)} />

      <Header
        currentView={currentView}
        isEditLayoutMode={isEditLayoutMode}
        onToggleEditLayout={toggleEditLayout}
        onToggleView={() => navigateTo(currentView === 'dashboard' ? 'profile' : 'dashboard')}
        onNavigateTo={navigateTo}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((v) => !v)}
      />

      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentView={currentView}
        onNavigate={navigateTo}
        isEditLayoutMode={isEditLayoutMode}
        onToggleEditLayout={toggleEditLayout}
      />

      {currentView === 'dashboard' && (
        <DashboardLayout
          leftLayout={leftLayout}
          rightLayout={rightLayout}
          widgetMap={widgetMap}
          isEditLayoutMode={isEditLayoutMode}
          onMoveWidget={moveWidget}
          onDragDrop={handleDragDrop}
          WidgetWrapper={WidgetWrapper}
        />
      )}

      {currentView === 'profile' && (
        <Suspense fallback={<div className="max-w-5xl mx-auto py-20 text-center">Yükleniyor...</div>}>
          <ProfileLayout
            userName={userName}
            setUserName={setUserName}
            isEditingName={isEditingName}
            setIsEditingName={setIsEditingName}
            userStats={userStats}
            habits={habits}
            goals={goals}
            taskLogs={taskLogs}
            onExport={handleExport}
            onImport={handleImport}
            isImporting={isImporting}
            syncStatus={syncStatus}
            syncError={syncError}
            deviceId={deviceId}
            setDeviceId={setDeviceId}
            refetchFromServer={refetchFromServer}
          />
        </Suspense>
      )}

      {currentView === 'food' && (
        <FoodLayout
          recipes={recipes}
          setRecipes={setRecipes}
          mealLogs={mealLogs}
          setMealLogs={setMealLogs}
        />
      )}

      {currentView === 'lessons' && (
        <LessonsLayout
          lessons={lessons}
          setLessons={setLessons}
          lessonTemplates={lessonTemplates}
          setLessonTemplates={setLessonTemplates}
          students={students}
          setStudents={setStudents}
          expenses={expenses}
          setExpenses={setExpenses}
          onMountRefetch={refetchFromServer}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
