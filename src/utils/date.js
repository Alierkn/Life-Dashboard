/** @param {number} days */
export const getPastDays = (days) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.unshift(d.toISOString().split('T')[0]);
  }
  return dates;
};

/** @param {string} startStr @param {string} endStr */
export const getDaysBetween = (startStr, endStr) => {
  const dates = [];
  let curr = new Date(startStr);
  const end = new Date(endStr);
  curr.setDate(curr.getDate() + 1);
  while (curr < end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

export const getTodayString = () => new Date().toISOString().split('T')[0];

/** Verilen tarihin haftasının Pazartesi gününü döner (YYYY-MM-DD) */
export const getMondayOfWeek = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
};

const WEEK_DAYS = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];

export const getCurrentWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    week.push({ dateStr: date.toISOString().split('T')[0], dayName: WEEK_DAYS[i] });
  }
  return week;
};

/** @param {number} seconds */
export const formatTime = (seconds) =>
  `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

const MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

/** @param {number} year @param {number} month (1-12) */
export const getMonthCalendar = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const weeks = [];
  let week = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    week.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    week.push({ day: d, dateStr: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return { weeks, monthName: MONTH_NAMES[month - 1], year };
};

export { MONTH_NAMES, DAY_NAMES };
