import { useState } from 'react';
import { Activity, Plus, Minus } from 'lucide-react';
import { formatTime } from '../../utils/date';
import { TIMER_DURATIONS } from '../../constants';

const MIN_DURATION = 1;
const MAX_DURATION = 120;

export default function TimerWidget({
  timerDuration,
  timerActive,
  timeLeft,
  timerMode,
  onDurationChange,
  onToggleTimer,
}) {
  const [customInput, setCustomInput] = useState('');

  const handleCustomApply = () => {
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val >= MIN_DURATION && val <= MAX_DURATION) {
      onDurationChange(val);
      setCustomInput('');
    }
  };

  const adjustDuration = (delta) => {
    const newVal = Math.max(MIN_DURATION, Math.min(MAX_DURATION, timerDuration + delta));
    onDurationChange(newVal);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center transition-colors">
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold tracking-widest text-xs uppercase px-4 py-1.5 rounded-full border-2 border-slate-200 dark:border-slate-700">
          {timerMode === 'focus' ? 'Derin Çalışma' : 'Mola'}
        </div>
        {!timerActive && timerMode === 'focus' && (
          <div className="w-full flex flex-col gap-3 mt-2" role="group" aria-label="Süre seçin">
            <div className="flex flex-wrap justify-center gap-2">
              {TIMER_DURATIONS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => onDurationChange(mins)}
                  className={`px-3 py-1 text-xs font-bold rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 ${timerDuration === mins ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-purple-200 dark:hover:border-purple-800'}`}
                >
                  {mins} dk
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => adjustDuration(-5)}
                disabled={timerDuration <= MIN_DURATION}
                className="p-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="5 dakika azalt"
              >
                <Minus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-700 px-2">
                <input
                  type="number"
                  min={MIN_DURATION}
                  max={MAX_DURATION}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomApply()}
                  placeholder={`${timerDuration} dk`}
                  className="w-14 text-center text-sm font-bold bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Özel süre (dakika)"
                />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">dk</span>
              </div>
              <button
                onClick={handleCustomApply}
                className="px-2 py-1 text-xs font-bold rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
              >
                Uygula
              </button>
              <button
                onClick={() => adjustDuration(5)}
                disabled={timerDuration >= MAX_DURATION}
                className="p-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="5 dakika artır"
              >
                <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>
      <div
        className="text-6xl font-black text-slate-900 dark:text-white mb-8 font-mono tracking-tight"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatTime(timeLeft)}
      </div>
      <button
        onClick={onToggleTimer}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-transform active:scale-95 flex items-center justify-center gap-2 border-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 ${timerActive ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'}`}
      >
        {timerActive ? 'Duraklat' : 'Başlat'} {!timerActive && <Activity className="w-5 h-5" />}
      </button>
    </div>
  );
}
