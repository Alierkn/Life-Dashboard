import { Check, Plus, Trash2, Crosshair } from 'lucide-react';

export default function GoalsWidget({
  goals,
  showAddGoal,
  newGoalData,
  onAddGoal,
  onDeleteGoal,
  onUpdateGoalProgress,
  onSetShowAddGoal,
  onSetNewGoalData,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 md:p-6 h-fit transition-colors overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Crosshair className="w-6 h-6 text-orange-500" /> Büyük Hedefler
        </h3>
        <button
          onClick={() => onSetShowAddGoal(!showAddGoal)}
          className="text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors"
          aria-label={showAddGoal ? 'Hedef eklemeyi kapat' : 'Yeni hedef ekle'}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      {showAddGoal && (
        <div className="flex flex-col gap-2 mb-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700">
          <input
            type="text"
            value={newGoalData.title}
            onChange={(e) => onSetNewGoalData({ ...newGoalData, title: e.target.value })}
            placeholder="Hedefin adı..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 font-bold dark:text-white"
            aria-label="Hedef adı"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newGoalData.target}
              onChange={(e) => onSetNewGoalData({ ...newGoalData, target: e.target.value })}
              placeholder="Hedef rakam"
              className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 font-bold dark:text-white"
              aria-label="Hedef rakam"
            />
            <input
              type="text"
              value={newGoalData.unit}
              onChange={(e) => onSetNewGoalData({ ...newGoalData, unit: e.target.value })}
              placeholder="Birim (₺, kg...)"
              className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 font-bold dark:text-white"
              aria-label="Birim"
            />
          </div>
          <button
            onClick={onAddGoal}
            className="w-full mt-1 bg-orange-500 text-white font-bold px-4 py-2 rounded-lg border-2 border-orange-600 hover:bg-orange-600 transition-colors"
          >
            Hedefi Oluştur
          </button>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {goals.map((goal) => {
          const targetNum = Number(goal.target) || 1;
          const percent = Math.min(100, Math.round((goal.current / targetNum) * 100));
          const isCompleted = percent >= 100 || goal.isCompleted;
          return (
            <div
              key={goal.id}
              className={`group relative p-4 rounded-xl border-2 transition-all ${isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-slate-800 dark:bg-slate-950 border-slate-800 dark:border-slate-900'}`}
            >
              <button
                onClick={() => onDeleteGoal(goal.id)}
                className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400 ${isCompleted ? 'text-green-600 hover:bg-green-200' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                aria-label={`${goal.title} hedefini sil`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {isCompleted ? (
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-1.5 rounded-md border-2 border-green-600">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div className="pr-6">
                    <h4 className="font-bold text-green-800 dark:text-green-400 text-sm">{goal.title}</h4>
                    <span className="text-xs font-bold text-green-600 dark:text-green-500 uppercase">Tamamlandı!</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3 pr-6">
                    <h4 className="font-bold text-white text-sm">{goal.title}</h4>
                    <span className="text-orange-400 font-bold text-sm">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 border-2 border-slate-900 h-3 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">
                      {goal.unit === '₺'
                        ? `${goal.current.toLocaleString()} ₺ / ${goal.target.toLocaleString()} ₺`
                        : `${goal.current} / ${goal.target} ${goal.unit}`}
                    </span>
                    <button
                      onClick={() => onUpdateGoalProgress(goal.id, 1)}
                      className="text-xs font-bold px-2 py-1 rounded-lg bg-orange-500/80 hover:bg-orange-500 text-white transition-colors"
                      aria-label={`${goal.title} ilerlemesini artır`}
                    >
                      + Artır
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {goals.length === 0 && (
          <p className="text-slate-400 text-sm font-medium text-center py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            Henüz hedef eklenmemiş. Büyük hayallerine adım atmak için bir hedef oluştur!
          </p>
        )}
      </div>
    </div>
  );
}
