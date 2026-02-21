import { User, Edit, Settings, Download, Upload, Trash2, TrendingUp } from 'lucide-react';
import { getRankTitle } from '../../utils/helpers';

export default function ProfileLayout({
  userName,
  setUserName,
  isEditingName,
  setIsEditingName,
  userStats,
  habits,
  goals,
  taskLogs,
  onExport,
  onImport,
  isImporting,
}) {
  const currentLevelXp = userStats.xp % 1000;
  const xpProgressPercent = (currentLevelXp / 1000) * 100;

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 animate-slide-up">
      <div className="md:col-span-4 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-600 rounded-[2rem] flex items-center justify-center mb-6">
            <User className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>

          {isEditingName ? (
            <div className="flex gap-2 w-full mb-2">
              <input
                autoFocus
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="w-full text-center font-black text-xl text-slate-900 dark:text-white border-2 border-purple-300 dark:border-purple-600 rounded-xl px-2 py-1 focus:outline-none bg-purple-50 dark:bg-slate-800"
                aria-label="Kullanıcı adı"
              />
              <button
                onClick={() => setIsEditingName(false)}
                className="bg-purple-600 text-white px-3 rounded-xl font-bold"
              >
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-2 mb-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-lg px-2"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{userName}</h2>
              <Edit className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors" />
            </button>
          )}

          <p className="text-slate-500 font-bold text-sm mb-6 uppercase tracking-widest">{getRankTitle(userStats.level)}</p>

          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="font-bold text-slate-400 text-xs uppercase">Seviye İlerlemesi</span>
              <span className="font-black text-purple-600 text-lg">Lv. {userStats.level}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 h-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${xpProgressPercent}%` }}
                role="progressbar"
                aria-valuenow={Math.round(xpProgressPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
              <span>{currentLevelXp} / 1000 XP</span>
              <span>Sonraki Seviye</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 md:p-6 flex flex-col gap-4">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" /> Veri Yönetimi
            </h3>
            <p className="text-slate-500 text-xs font-bold mt-2 leading-relaxed">
              Verilerin sadece senin cihazında (Local Storage) saklanır. Kaybolmamaları için yedeğini al.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={onExport}
              disabled={isImporting}
              className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold px-3 py-2 rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> İndir
            </button>
            <label className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer">
              <Upload className="w-4 h-4" /> {isImporting ? 'Yükleniyor...' : 'Yükle'}
              <input type="file" accept=".json" onChange={onImport} className="hidden" disabled={isImporting} />
            </label>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Tüm verilerini silmek istediğine emin misin?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full mt-2 bg-white dark:bg-slate-900 text-red-500 font-bold px-4 py-3 rounded-xl border-2 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-500 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Tüm Verileri Sil
          </button>
        </div>
      </div>

      <div className="md:col-span-8 flex flex-col gap-6 md:gap-8">
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 md:p-6">
          <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-green-500" /> Genel Bakış
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col">
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Toplam XP</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{userStats.xp}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col">
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Biten Görev</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{taskLogs.length}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col">
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Alışkanlıklar</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{habits.length}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col">
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Hedefler</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{goals.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
