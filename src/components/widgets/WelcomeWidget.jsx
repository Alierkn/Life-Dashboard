export default function WelcomeWidget({ progressPercent }) {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 md:p-6 relative overflow-hidden transition-colors">
      <div className="relative z-10">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Merhaba!</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">Bugün harika işler çıkarıyorsun.</p>
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">Günlük İlerleme</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 h-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progressPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
      <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-full border-2 border-purple-100 dark:border-purple-800/30" aria-hidden />
    </div>
  );
}
