import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react';
import { getTodayString } from '../../utils/date';
import { getMonthCalendar, DAY_NAMES } from '../../utils/date';

export default function CalendarWidget({ habits, tasks, taskLogs, onToggleHabitDate }) {
  const today = getTodayString();
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [selectedDate, setSelectedDate] = useState(today);

  const { weeks, monthName, year } = getMonthCalendar(viewDate.year, viewDate.month);

  const goPrevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goNextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const getHabitsCountForDate = (dateStr) => {
    return habits.filter((h) => h.completedDates.includes(dateStr)).length;
  };

  const getTasksCountForDate = (dateStr) => {
    return taskLogs.filter((d) => d === dateStr).length;
  };

  const getHabitsForDate = (dateStr) => habits.filter((h) => h.completedDates.includes(dateStr));
  const getTasksCompletedOnDate = (dateStr) => {
    const count = taskLogs.filter((d) => d === dateStr).length;
    return count;
  };

  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-500" /> Takvim
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrevMonth}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Önceki ay"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm min-w-[120px] text-center">
            {monthName} {year}
          </span>
          <button
            onClick={goNextMonth}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Sonraki ay"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {DAY_NAMES.map((d) => (
                <th key={d} className="py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((cell, ci) => {
                  if (!cell) return <td key={ci} className="p-0.5" />;
                  const { day, dateStr } = cell;
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;
                  const isFuture = dateStr > today;
                  const habitsCount = getHabitsCountForDate(dateStr);
                  const tasksCount = getTasksCountForDate(dateStr);
                  const hasActivity = habitsCount > 0 || tasksCount > 0;

                  return (
                    <td key={ci} className="p-0.5 align-top">
                      <div
                        onClick={() => !isFuture && setSelectedDate(dateStr)}
                        className={`min-h-[52px] rounded-lg border-2 p-1 cursor-pointer transition-colors ${
                          isFuture
                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 cursor-not-allowed opacity-60'
                            : isSelected
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : isToday
                                ? 'border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/10'
                                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        <span
                          className={`text-xs font-bold block mb-1 ${
                            isToday ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {day}
                        </span>
                        <div className="flex flex-wrap gap-0.5">
                          {habitsCount > 0 && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[9px] font-bold"
                              title={`${habitsCount} alışkanlık tamamlandı`}
                            >
                              <Check className="w-2.5 h-2.5" />
                              {habitsCount}
                            </span>
                          )}
                          {tasksCount > 0 && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[9px] font-bold"
                              title={`${tasksCount} görev tamamlandı`}
                            >
                              <BookOpen className="w-2.5 h-2.5" />
                              {tasksCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDate && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">
            {selectedDate === today ? 'Bugün' : selectedDate} — Özet
          </h4>
          <div className="space-y-2 text-xs">
            {getHabitsForDate(selectedDate).length > 0 ? (
              <div>
                <span className="font-bold text-green-600 dark:text-green-400">Alışkanlıklar:</span>
                <ul className="mt-1 space-y-0.5">
                  {getHabitsForDate(selectedDate).map((h) => (
                    <li key={h.id} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      {h.title}
                      {selectedDate <= today && (
                        <button
                          onClick={() => onToggleHabitDate?.(h.id, selectedDate)}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Geri al
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-slate-500">Bu gün tamamlanan alışkanlık yok.</p>
            )}
            {getTasksCompletedOnDate(selectedDate) > 0 ? (
              <p className="font-bold text-blue-600 dark:text-blue-400">
                {getTasksCompletedOnDate(selectedDate)} görev tamamlandı.
              </p>
            ) : (
              <p className="text-slate-500">Bu gün tamamlanan görev yok.</p>
            )}
            {selectedDate === today && pendingTasks.length > 0 && (
              <p className="text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                {pendingTasks.length} bekleyen görev var.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
