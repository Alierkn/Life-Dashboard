import { Activity } from 'lucide-react';

export default function ActivityWidget({ activityTab, onTabChange, contributionData }) {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 md:p-6 flex flex-col justify-center transition-colors overflow-hidden">
      <div className="flex flex-col gap-4 mb-6">
        <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className={`w-5 h-5 ${activityTab === 'habits' ? 'text-green-500' : 'text-blue-500'}`} /> Aktivite
        </h3>
        <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 w-full" role="tablist">
          <button
            role="tab"
            aria-selected={activityTab === 'habits'}
            onClick={() => onTabChange('habits')}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wide rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${activityTab === 'habits' ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 border-2 border-slate-200 dark:border-slate-600 shadow-sm' : 'text-slate-400 dark:text-slate-500 border-2 border-transparent'}`}
          >
            Alışkanlık
          </button>
          <button
            role="tab"
            aria-selected={activityTab === 'tasks'}
            onClick={() => onTabChange('tasks')}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wide rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${activityTab === 'tasks' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 border-2 border-slate-200 dark:border-slate-600 shadow-sm' : 'text-slate-400 dark:text-slate-500 border-2 border-transparent'}`}
          >
            Görev
          </button>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide justify-center">
        {Array.from({ length: 8 }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const data = contributionData[weekIndex * 7 + dayIndex];
              if (!data) return <div key={dayIndex} className="w-3 h-3" />;
              let colorClass = 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
              if (activityTab === 'habits') {
                if (data.count === 1) colorClass = 'bg-green-200 dark:bg-green-800/50 border-green-300 dark:border-green-700';
                if (data.count === 2) colorClass = 'bg-green-300 dark:bg-green-600/60 border-green-400 dark:border-green-600';
                if (data.count >= 3) colorClass = 'bg-green-500 dark:bg-green-500 border-green-600 dark:border-green-400';
              } else {
                if (data.count === 1) colorClass = 'bg-blue-200 dark:bg-blue-800/50 border-blue-300 dark:border-blue-700';
                if (data.count === 2) colorClass = 'bg-blue-300 dark:bg-blue-600/60 border-blue-400 dark:border-blue-600';
                if (data.count >= 3) colorClass = 'bg-blue-500 dark:bg-blue-500 border-blue-600 dark:border-blue-400';
              }
              return (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-[3px] border transition-colors duration-300 ${colorClass}`}
                  title={`${data.date}: ${data.count} aktivite`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center mt-3 uppercase">Son 8 Hafta Özeti</p>
    </div>
  );
}
