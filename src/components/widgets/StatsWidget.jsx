import { useState } from 'react';
import { BarChart3, FileText, CheckCircle2, ListTodo, Flame, Target } from 'lucide-react';
import { getTodayString, getPastDays } from '../../utils/date';
import { TASK_TAGS } from '../../constants';

const TAG_COLORS = {
  Genel: 'bg-slate-400',
  İş: 'bg-blue-500',
  Kişisel: 'bg-green-500',
  Finans: 'bg-amber-500',
  Eğitim: 'bg-purple-500',
};

export default function StatsWidget({
  habits,
  tasks,
  taskLogs,
  goals,
  lessons = [],
}) {
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const todayStr = getTodayString();

  const dailyHabits = habits.filter((h) => h.frequency === 'daily');
  const completedTodayHabits = dailyHabits.filter((h) => h.completedDates.includes(todayStr)).length;
  const tasksCompletedToday = taskLogs.filter((d) => d === todayStr).length;

  const thisMonthKey = todayStr.slice(0, 7);
  const lessonsThisMonth = lessons.filter((l) => !l.cancelled && l.date?.startsWith(thisMonthKey)).length;

  const tagDistribution = TASK_TAGS.reduce((acc, tag) => {
    acc[tag] = tasks.filter((t) => (t.tag || 'Genel') === tag).length;
    return acc;
  }, {});
  const totalByTag = Object.values(tagDistribution).reduce((a, b) => a + b, 0);

  const last30Days = getPastDays(30);
  const habitCompletions30 = habits.reduce((sum, h) => {
    return sum + h.completedDates.filter((d) => last30Days.includes(d)).length;
  }, 0);
  const taskCompletions30 = taskLogs.filter((d) => last30Days.includes(d)).length;

  const handlePrintReport = () => {
    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>${reportPeriod === 'weekly' ? 'Haftalık' : 'Aylık'} Rapor</title>
      <style>body{font-family:sans-serif;padding:24px;max-width:800px;margin:0 auto}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}
      th{background:#f5f5f5}
      h1,h2{color:#333}
      .card{background:#f9fafb;padding:16px;border-radius:8px;margin:8px 0}
      .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
      </style></head><body>
      <h1>${reportPeriod === 'weekly' ? 'Haftalık' : 'Aylık'} Özet Rapor</h1>
      <p style="color:#666">${new Date().toLocaleDateString('tr-TR')}</p>
      <h2>Dashboard Özeti</h2>
      <div class="grid">
        <div class="card"><strong>Bugün Alışkanlık</strong><br>${completedTodayHabits}/${dailyHabits.length} tamamlandı</div>
        <div class="card"><strong>Bugün Görev</strong><br>${tasksCompletedToday} tamamlandı</div>
        <div class="card"><strong>Son 30 Gün Alışkanlık</strong><br>${habitCompletions30} tamamlama</div>
        <div class="card"><strong>Son 30 Gün Görev</strong><br>${taskCompletions30} tamamlama</div>
      </div>
      <h2>Görev Etiket Dağılımı</h2>
      <table>
        <tr><th>Etiket</th><th>Görev Sayısı</th></tr>
        ${Object.entries(tagDistribution)
          .filter(([, c]) => c > 0)
          .map(([tag, count]) => `<tr><td>${tag}</td><td>${count}</td></tr>`)
          .join('')}
      </table>
      ${lessons.length > 0 ? `<h2>Dersler</h2><p>Bu ay: ${lessonsThisMonth} ders</p>` : ''}
      <p style="color:#666;font-size:12px;margin-top:24px">Life Dashboard</p>
      </body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
    win.close();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 md:p-6 transition-colors overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl border-2 border-purple-200 dark:border-purple-800">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">İstatistikler & Raporlar</h2>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Dashboard Özeti</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mb-1" />
              <div className="text-lg font-black text-slate-800 dark:text-white">{completedTodayHabits}/{dailyHabits.length}</div>
              <div className="text-xs font-bold text-slate-500">Alışkanlık bugün</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
              <ListTodo className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
              <div className="text-lg font-black text-slate-800 dark:text-white">{tasksCompletedToday}</div>
              <div className="text-xs font-bold text-slate-500">Görev bugün</div>
            </div>
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800">
              <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-1" />
              <div className="text-lg font-black text-slate-800 dark:text-white">{habitCompletions30 + taskCompletions30}</div>
              <div className="text-xs font-bold text-slate-500">Son 30 gün</div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1" />
              <div className="text-lg font-black text-slate-800 dark:text-white">{goals.length}</div>
              <div className="text-xs font-bold text-slate-500">Aktif hedef</div>
            </div>
          </div>
          {lessons.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold">Bu ay ders:</span>
              <span className="ml-2 font-black text-slate-800 dark:text-white">{lessonsThisMonth}</span>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Etiketlere Göre Görev Dağılımı</h3>
          <div className="space-y-2">
            {TASK_TAGS.map((tag) => {
              const count = tagDistribution[tag] || 0;
              const pct = totalByTag > 0 ? Math.round((count / totalByTag) * 100) : 0;
              return (
                <div key={tag} className="flex items-center gap-3">
                  <span className="w-20 text-sm font-bold text-slate-600 dark:text-slate-300">{tag}</span>
                  <div className="flex-1 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-lg ${TAG_COLORS[tag] || 'bg-slate-400'} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-black w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Rapor Oluştur</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold"
            >
              <option value="weekly">Haftalık</option>
              <option value="monthly">Aylık</option>
            </select>
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600"
            >
              <FileText className="w-5 h-5" /> PDF / Yazdır
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
