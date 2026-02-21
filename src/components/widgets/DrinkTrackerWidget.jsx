import { Droplets, Coffee, Minus, Plus } from 'lucide-react';
import { getTodayString, getCurrentWeekDates } from '../../utils/date';
import { WATER_GLASS_ML, DEFAULT_WATER_GOAL_GLASSES } from '../../constants';

export default function DrinkTrackerWidget({
  waterLogs,
  setWaterLogs,
  coffeeLogs,
  setCoffeeLogs,
}) {
  const todayStr = getTodayString();
  const weekDates = getCurrentWeekDates();

  const waterToday = waterLogs[todayStr] ?? 0;
  const coffeeToday = coffeeLogs[todayStr] ?? 0;

  const addWater = () => {
    setWaterLogs((prev) => ({ ...prev, [todayStr]: (prev[todayStr] ?? 0) + 1 }));
  };

  const removeWater = () => {
    if (waterToday <= 0) return;
    setWaterLogs((prev) => {
      const next = { ...prev };
      next[todayStr] = Math.max(0, (next[todayStr] ?? 0) - 1);
      if (next[todayStr] === 0) delete next[todayStr];
      return next;
    });
  };

  const addCoffee = () => {
    setCoffeeLogs((prev) => ({ ...prev, [todayStr]: (prev[todayStr] ?? 0) + 1 }));
  };

  const removeCoffee = () => {
    if (coffeeToday <= 0) return;
    setCoffeeLogs((prev) => {
      const next = { ...prev };
      next[todayStr] = Math.max(0, (next[todayStr] ?? 0) - 1);
      if (next[todayStr] === 0) delete next[todayStr];
      return next;
    });
  };

  const waterProgress = Math.min(100, (waterToday / DEFAULT_WATER_GOAL_GLASSES) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-xl border-2 border-cyan-200 dark:border-cyan-800">
          <Droplets className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Su & Kahve</h2>
      </div>

      <div className="space-y-6">
        <section>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-500" /> Su
            </span>
            <span className="font-black text-slate-800 dark:text-white">
              {waterToday} bardak <span className="text-slate-400 font-normal">/ {DEFAULT_WATER_GOAL_GLASSES}</span>
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${waterProgress}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={removeWater}
              disabled={waterToday <= 0}
              className="p-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              aria-label="1 bardak çıkar"
            >
              <Minus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={addWater}
              className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-bold border-2 border-cyan-600 hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Bardak Ekle
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">{waterToday * WATER_GLASS_ML} ml</p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-500" /> Kahve
            </span>
            <span className="font-black text-slate-800 dark:text-white">{coffeeToday} fincan</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={removeCoffee}
              disabled={coffeeToday <= 0}
              className="p-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              aria-label="1 fincan çıkar"
            >
              <Minus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={addCoffee}
              className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold border-2 border-amber-700 hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Fincan Ekle
            </button>
          </div>
        </section>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Bu hafta su</p>
          <div className="flex gap-1">
            {weekDates.map((day) => {
              const count = waterLogs[day.dateStr] ?? 0;
              const isToday = day.dateStr === todayStr;
              const pct = Math.min(100, (count / DEFAULT_WATER_GOAL_GLASSES) * 100);
              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`text-[9px] font-bold ${isToday ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {day.dayName}
                  </span>
                  <div className="w-full h-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                    <div
                      className={`absolute bottom-0 left-0 right-0 rounded-b-lg transition-all ${count >= DEFAULT_WATER_GOAL_GLASSES ? 'bg-cyan-500' : 'bg-cyan-300 dark:bg-cyan-700'}`}
                      style={{ height: `${pct}%`, minHeight: count > 0 ? 4 : 0 }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
