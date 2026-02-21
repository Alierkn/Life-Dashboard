import { useState } from 'react';
import { Dumbbell, Plus, Trash2, Clock } from 'lucide-react';
import { getTodayString, getPastDays } from '../../utils/date';
import { WORKOUT_TYPES } from '../../constants';

export default function SportWorkoutWidget({ workoutLogs, setWorkoutLogs }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Koşu',
    duration: 30,
    date: getTodayString(),
    notes: '',
  });

  const todayStr = getTodayString();
  const todayWorkouts = workoutLogs.filter((w) => w.date === todayStr);
  const last7Days = getPastDays(7);
  const weekTotal = workoutLogs.filter((w) => last7Days.includes(w.date)).reduce((s, w) => s + (w.duration || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.type || !formData.duration) return;
    setWorkoutLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: formData.type,
        duration: Number(formData.duration) || 30,
        date: formData.date,
        notes: (formData.notes || '').trim(),
      },
    ]);
    setFormData({ type: 'Koşu', duration: 30, date: todayStr, notes: '' });
    setShowForm(false);
  };

  const deleteWorkout = (id) => {
    setWorkoutLogs((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 md:p-6 transition-colors overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
            <Dumbbell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Spor & Antrenman</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900"
          aria-label={showForm ? 'Formu kapat' : 'Antrenman ekle'}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tür</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {WORKOUT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Süre (dk)</label>
              <input
                type="number"
                min={5}
                max={300}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value, 10) || 30 })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tarih</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Not (opsiyonel)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Örn: 5 km koşu"
              className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <button type="submit" className="w-full py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600">
            Ekle
          </button>
        </form>
      )}

      <div className="flex gap-4 mb-4">
        <div className="flex-1 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Bugün</div>
          <div className="text-xl font-black text-slate-800 dark:text-white">
            {todayWorkouts.reduce((s, w) => s + (w.duration || 0), 0)} dk
          </div>
        </div>
        <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Bu hafta</div>
          <div className="text-xl font-black text-slate-800 dark:text-white">{weekTotal} dk</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300">Son antrenmanlar</h4>
        {[...workoutLogs]
          .sort((a, b) => {
            const d = b.date.localeCompare(a.date);
            return d !== 0 ? d : (b.id || 0) - (a.id || 0);
          })
          .slice(0, 5)
          .map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 dark:text-white">{w.type}</span>
                <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" /> {w.duration} dk
                </span>
                {w.notes && <span className="text-xs text-slate-400 truncate max-w-[100px]">{w.notes}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">{w.date}</span>
                <button
                  onClick={() => deleteWorkout(w.id)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                  aria-label="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        {workoutLogs.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">Henüz antrenman eklenmedi</p>
        )}
      </div>
    </div>
  );
}
