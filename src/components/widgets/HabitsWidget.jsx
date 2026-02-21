import { Check, Plus, Trash2, Flame, Target, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { getFrequencyLabel } from '../../utils/helpers';
import { FREQUENCY_OPTIONS } from '../../constants';

export default function HabitsWidget({
  habits,
  todayStr,
  weekDates,
  expandedHabitId,
  showAddHabit,
  newHabitTitle,
  newHabitFreq,
  newHabitTarget = '',
  onToggleHabitDate,
  onAddHabit,
  onDeleteHabit,
  onSetShowAddHabit,
  onSetNewHabitTitle,
  onSetNewHabitFreq,
  onSetNewHabitTarget,
  onSetExpandedHabitId,
  getHabitStats,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 md:p-6 transition-colors overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl border-2 border-green-200 dark:border-green-800">
            <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Alışkanlıklar & Seriler</h2>
        </div>
        <button
          onClick={() => onSetShowAddHabit(!showAddHabit)}
          className="w-11 h-11 sm:w-10 sm:h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 touch-target"
          aria-label={showAddHabit ? 'Alışkanlık eklemeyi kapat' : 'Yeni alışkanlık ekle'}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showAddHabit && (
        <div className="flex flex-col gap-3 mb-6 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700">
          <input
            type="text"
            value={newHabitTitle}
            onChange={(e) => onSetNewHabitTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddHabit()}
            placeholder="Yeni bir alışkanlık..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 dark:text-white focus:outline-none focus:border-green-500"
            aria-label="Alışkanlık adı"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={newHabitFreq}
              onChange={(e) => onSetNewHabitFreq(e.target.value)}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-green-500"
              aria-label="Sıklık"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <label className="text-xs font-bold text-slate-500">Hedef:</label>
              <input
                type="number"
                min={1}
                max={31}
                value={newHabitTarget}
                onChange={(e) => onSetNewHabitTarget?.(e.target.value)}
                placeholder="Örn: 5"
                className="w-16 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm font-bold"
              />
              <span className="text-xs text-slate-500">{(newHabitFreq === 'weekly' && 'gün/hafta') || (newHabitFreq === 'monthly' && 'gün/ay') || 'gün'}</span>
            </div>
            <button
              onClick={onAddHabit}
              className="bg-green-500 text-white border-2 border-green-600 px-6 rounded-lg font-bold hover:bg-green-600 transition-colors"
            >
              Ekle
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {habits.map((habit) => {
          const isTodayCompleted = habit.completedDates.includes(todayStr);
          const isExpanded = expandedHabitId === habit.id;
          const stats = isExpanded ? getHabitStats(habit) : null;
          const target = habit.targetPerPeriod;
          const currentPeriodCount =
            target && habit.frequency !== 'daily'
              ? habit.frequency === 'weekly'
                ? weekDates.filter((d) => habit.completedDates.includes(d.dateStr)).length
                : habit.completedDates.filter((d) => d.startsWith(todayStr.slice(0, 7))).length
              : null;
          return (
            <div
              key={habit.id}
              className="flex flex-col bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                  <button
                    onClick={() => onToggleHabitDate(habit.id, todayStr)}
                    className={`cursor-pointer w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 transform active:scale-95 flex-shrink-0 border-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${isTodayCompleted ? 'bg-green-500 text-white border-green-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    aria-pressed={isTodayCompleted}
                    aria-label={`${habit.title} - ${isTodayCompleted ? 'Tamamlandı' : 'Tamamlanmadı'}`}
                  >
                    {isTodayCompleted ? <Check className="w-8 h-8 stroke-[3]" /> : <Target className="w-6 h-6" />}
                  </button>
                  <div className="flex flex-col flex-1">
                    <h4 className={`font-bold text-lg leading-tight ${isTodayCompleted ? 'text-green-800 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {habit.title}
                    </h4>
                    <span className={`text-xs font-bold mt-1 ${habit.frequency === 'daily' ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {getFrequencyLabel(habit.frequency)}
                      {target && currentPeriodCount !== null && (
                        <span className={`ml-1 ${currentPeriodCount >= target ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {currentPeriodCount}/{target} {(habit.frequency === 'weekly' && 'bu hafta') || (habit.frequency === 'monthly' && 'bu ay') || ''}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto scrollbar-hide">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-xl border-2 border-slate-100 dark:border-slate-800 flex-shrink-0">
                    {weekDates.map((day, idx) => {
                      const isCompleted = habit.completedDates.includes(day.dateStr);
                      const isFuture = day.dateStr > todayStr;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <span className={`text-[9px] font-bold ${day.dateStr === todayStr ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {day.dayName}
                          </span>
                          <button
                            onClick={() => !isFuture && onToggleHabitDate(habit.id, day.dateStr)}
                            disabled={isFuture}
                            className={`w-8 h-8 sm:w-5 sm:h-5 rounded-md flex items-center justify-center transition-colors border-2 focus:outline-none focus:ring-2 focus:ring-green-400 touch-manipulation ${isFuture ? 'bg-slate-50 dark:bg-slate-800 border-dashed border-slate-200 dark:border-slate-700 cursor-not-allowed' : isCompleted ? 'bg-green-500 border-green-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 cursor-pointer'}`}
                            aria-label={`${day.dateStr}: ${isCompleted ? 'Tamamlandı' : 'Tamamlanmadı'}`}
                          >
                            {isCompleted && !isFuture && <Check className="w-3 h-3 stroke-[4]" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 min-w-[60px] justify-center ${habit.frequency === 'daily' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                  >
                    <Flame className={`w-4 h-4 ${habit.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-400 dark:text-slate-600'}`} />
                    <span className={`font-black ${habit.streak > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                      {habit.streak}
                    </span>
                  </div>
                  <button
                    onClick={() => onSetExpandedHabitId(isExpanded ? null : habit.id)}
                    className="p-2 min-w-[44px] min-h-[44px] rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center touch-manipulation"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Detayları kapat' : 'Detayları aç'}
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {isExpanded && stats && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 sm:p-5 border-t-2 border-slate-200 dark:border-slate-700 flex flex-col gap-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" /> Detaylı Analiz
                    </h5>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1 py-2 px-2 min-h-[36px] touch-manipulation"
                      aria-label="Alışkanlığı sil"
                    >
                      <Trash2 className="w-3 h-3" /> Sil
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Toplam Başarı</span>
                      <div className="text-xl font-black text-slate-800 dark:text-white">{stats.totalDays} Kez</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Tamamlama Oranı</span>
                      <span className="text-xl font-black text-slate-800 dark:text-white block">{stats.completionRate30}%</span>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${stats.completionRate30}%` }} />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">En Uzun Seri</span>
                      <div className="text-xl font-black text-orange-600 dark:text-orange-400">{stats.longestStreak ?? 0} gün</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Ortalama Seri</span>
                      <div className="text-xl font-black text-slate-800 dark:text-white">{stats.averageStreak ?? 0} gün</div>
                    </div>
                    {stats.bestDays && stats.bestDays.length > 0 && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 sm:col-span-4">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">En İyi Günler</span>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {stats.bestDays.map((d) => (
                            <span key={d.day} className="text-sm font-bold px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              {d.day}: {d.count} kez
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
