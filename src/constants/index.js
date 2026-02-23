/** Sync uyumlu UUID - sunucu ID'yi korur, sonsuz sync döngüsünü önler */
export const generateId = () => crypto.randomUUID?.() || `x${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const STORAGE_KEYS = {
  THEME: 'my_theme_v5',
  HABITS: 'my_habits_v5',
  TASKS: 'my_tasks_v5',
  TASK_LOGS: 'my_task_logs_v5',
  GOALS: 'my_goals_v5',
  STATS: 'my_stats_v5',
  USERNAME: 'my_username_v5',
  LAYOUT_LEFT: 'my_layout_left_v5',
  LAYOUT_RIGHT: 'my_layout_right_v5',
  LAST_CHECKED: 'last_checked_v5',
  LESSONS: 'my_lessons_v5',
  LESSON_TEMPLATES: 'my_lesson_templates_v5',
  STUDENTS: 'my_students_v5',
  EXPENSES: 'my_expenses_v5',
  WATER_LOGS: 'my_water_logs_v5',
  COFFEE_LOGS: 'my_coffee_logs_v5',
  WORKOUT_LOGS: 'my_workout_logs_v5',
  RECIPES: 'my_recipes_v5',
  MEAL_LOGS: 'my_meal_logs_v5',
};

export const DAY_NAMES_FULL = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export const XP = {
  HABIT_COMPLETE: 20,
  HABIT_UNDO: -10,
  TASK_COMPLETE: 15,
  TASK_UNDO: -15,
  FOCUS_SESSION: 50,
  STREAK_PENALTY: 20,
};

export const XP_PER_LEVEL = 1000;

export const DEFAULT_LAYOUT = {
  LEFT: ['welcome', 'timer', 'activity', 'drinks', 'sport'],
  RIGHT: ['aiCoach', 'habits', 'tasks', 'goals', 'stats', 'calendar'],
};

export const TASK_TAGS = ['Genel', 'İş', 'Kişisel', 'Finans', 'Eğitim'];

export const TASK_REPEAT_OPTIONS = [
  { value: 'none', label: 'Tek seferlik' },
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
];

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'monthly', label: 'Aylık' },
];

export const TIMER_DURATIONS = [5, 15, 25, 45, 60];

export const LESSON_DURATION_OPTIONS = [45, 60, 75, 90];

export const WATER_GLASS_ML = 250;
export const DEFAULT_WATER_GOAL_GLASSES = 8;

export const WORKOUT_TYPES = ['Koşu', 'Yüzme', 'Fitness', 'Bisiklet', 'Yoga', 'Pilates', 'Yürüyüş', 'Futbol', 'Basketbol', 'Diğer'];

export const MEAL_TYPES = ['Kahvaltı', 'Öğle', 'Akşam', 'Ara öğün'];

export const DEFAULT_BREAK_MINUTES = 5;

export const NOTIFICATION_AUTO_DISMISS_MS = 5000;

export const RANK_TITLES = {
  5: 'Acemi Mimar',
  10: 'İstikrar Yolcusu',
  20: 'Disiplin Ustası',
  50: 'Hayat Mimarı',
  default: 'Efsane',
};
