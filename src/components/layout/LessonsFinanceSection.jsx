import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { MONTH_NAMES } from '../../utils/date';
import { useExchangeRate } from '../../hooks/useExchangeRate';

const EXPENSE_CATEGORIES = ['Malzeme', 'Ulaşım', 'Kira', 'Diğer'];

export default function LessonsFinanceSection({ lessons, expenses, setExpenses, calendarDate }) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Diğer',
    amount: '',
    description: '',
  });

  const { rate: tryToEurRate } = useExchangeRate();

  const income = lessons
    .filter((l) => !l.cancelled && l.fee)
    .reduce((acc, l) => {
      const [y, m] = l.date.split('-').slice(0, 2);
      const key = `${y}-${m}`;
      acc[key] = (acc[key] || 0) + parseInt(String(l.fee).replace(/\D/g, ''), 10);
      return acc;
    }, {});

  const expenseByMonth = expenses.reduce((acc, e) => {
    const [y, m] = e.date.split('-').slice(0, 2);
    const key = `${y}-${m}`;
    acc[key] = (acc[key] || 0) + (e.amount || 0);
    return acc;
  }, {});

  const currentMonthKey = `${calendarDate.year}-${String(calendarDate.month).padStart(2, '0')}`;
  const thisMonthIncome = income[currentMonthKey] || 0;
  const thisMonthExpense = expenseByMonth[currentMonthKey] || 0;
  const thisMonthNet = thisMonthIncome - thisMonthExpense;

  const lastMonthDate = new Date(calendarDate.year, calendarDate.month - 2, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthIncome = income[lastMonthKey] || 0;
  const lastMonthExpense = expenseByMonth[lastMonthKey] || 0;
  const lastMonthNet = lastMonthIncome - lastMonthExpense;

  const incomeDiff = lastMonthIncome > 0 ? Math.round(((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100) : (thisMonthIncome > 0 ? 100 : 0);
  const expenseDiff = lastMonthExpense > 0 ? Math.round(((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100) : (thisMonthExpense > 0 ? 100 : 0);
  const netDiff = lastMonthNet !== 0 ? Math.round(((thisMonthNet - lastMonthNet) / Math.abs(lastMonthNet)) * 100) : (thisMonthNet !== 0 ? 100 : 0);

  const totalIncome = Object.values(income).reduce((a, b) => a + b, 0);
  const totalExpense = Object.values(expenseByMonth).reduce((a, b) => a + b, 0);
  const totalNet = totalIncome - totalExpense;

  const addExpense = (e) => {
    e.preventDefault();
    const amount = parseInt(String(expenseForm.amount).replace(/\D/g, ''), 10);
    if (!amount) return;
    setExpenses((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: expenseForm.date,
        category: expenseForm.category,
        amount,
        description: expenseForm.description.trim() || '',
      },
    ]);
    setExpenseForm({ date: new Date().toISOString().split('T')[0], category: 'Diğer', amount: '', description: '' });
    setShowExpenseForm(false);
  };

  const deleteExpense = (id) => {
    if (window.confirm('Bu harcamayı silmek istediğine emin misin?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const exportExcel = () => {
    const studentSummary = {};
    lessons
      .filter((l) => !l.cancelled && l.fee)
      .forEach((l) => {
        const name = l.studentName;
        if (!studentSummary[name]) studentSummary[name] = { ders: 0, tutar: 0 };
        studentSummary[name].ders++;
        studentSummary[name].tutar += parseInt(String(l.fee).replace(/\D/g, ''), 10);
      });

    const wsData = [
      ['Öğrenci', 'Ders Sayısı', 'Toplam (₺)'],
      ...Object.entries(studentSummary).map(([name, d]) => [name, d.ders, d.tutar]),
      [],
      ['Aylık Özet'],
      ['Ay', 'Gelir (₺)', 'Gider (₺)', 'Net (₺)'],
      ...Object.keys(income)
        .sort()
        .map((key) => {
          const [y, m] = key.split('-');
          const inc = income[key] || 0;
          const exp = expenseByMonth[key] || 0;
          return [`${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`, inc, exp, inc - exp];
        }),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Aylık Rapor');
    XLSX.writeFile(wb, `ders_raporu_${calendarDate.year}-${String(calendarDate.month).padStart(2, '0')}.xlsx`);
  };

  const exportPrint = () => {
    const studentSummary = {};
    lessons
      .filter((l) => !l.cancelled && l.fee)
      .forEach((l) => {
        const name = l.studentName;
        if (!studentSummary[name]) studentSummary[name] = { ders: 0, tutar: 0 };
        studentSummary[name].ders++;
        studentSummary[name].tutar += parseInt(String(l.fee).replace(/\D/g, ''), 10);
      });

    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Aylık Rapor</title>
      <style>body{font-family:sans-serif;padding:24px;max-width:800px;margin:0 auto}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}
      th{background:#f5f5f5}
      h1{color:#333}
      .summary{background:#f0fdf4;padding:16px;border-radius:8px;margin:16px 0}
      </style></head><body>
      <h1>Aylık Ders Raporu — ${MONTH_NAMES[calendarDate.month - 1]} ${calendarDate.year}</h1>
      <h2>Öğrenci Bazlı Özet</h2>
      <table>
        <tr><th>Öğrenci</th><th>Ders Sayısı</th><th>Toplam (₺)</th></tr>
        ${Object.entries(studentSummary)
          .map(([n, d]) => `<tr><td>${n}</td><td>${d.ders}</td><td>${d.tutar.toLocaleString('tr-TR')}</td></tr>`)
          .join('')}
      </table>
      <div class="summary">
        <p><strong>Bu Ay Gelir:</strong> ${thisMonthIncome.toLocaleString('tr-TR')} ₺</p>
        <p><strong>Bu Ay Gider:</strong> ${thisMonthExpense.toLocaleString('tr-TR')} ₺</p>
        <p><strong>Bu Ay Net:</strong> ${thisMonthNet.toLocaleString('tr-TR')} ₺</p>
      </div>
      <p style="color:#666;font-size:12px">Life Dashboard — ${new Date().toLocaleDateString('tr-TR')}</p>
      </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
    win.close();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800">
          <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Gelir
          </h4>
          <p className="text-2xl font-black text-emerald-700">{thisMonthIncome.toLocaleString('tr-TR')} ₺</p>
          <p className="text-xs text-emerald-600">Toplam: {totalIncome.toLocaleString('tr-TR')} ₺</p>
          {lastMonthIncome > 0 && (
            <p className={`text-xs mt-1 font-bold ${incomeDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Geçen aya göre: {incomeDiff >= 0 ? '+' : ''}{incomeDiff}%
            </p>
          )}
        </div>
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
          <h4 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" /> Gider
          </h4>
          <p className="text-2xl font-black text-red-700">{thisMonthExpense.toLocaleString('tr-TR')} ₺</p>
          <p className="text-xs text-red-600">Toplam: {totalExpense.toLocaleString('tr-TR')} ₺</p>
          {lastMonthExpense > 0 && (
            <p className={`text-xs mt-1 font-bold ${expenseDiff <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Geçen aya göre: {expenseDiff >= 0 ? '+' : ''}{expenseDiff}%
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl border-2 ${totalNet >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200'}`}>
          <h4 className="font-bold">Net Kazanç</h4>
          <p className={`text-2xl font-black ${totalNet >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {totalNet.toLocaleString('tr-TR')} ₺
          </p>
          {tryToEurRate && (
            <p className="text-xs">≈ {(totalNet * tryToEurRate).toFixed(2)} €</p>
          )}
          {lastMonthNet !== 0 && (
            <p className={`text-xs mt-1 font-bold ${netDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Geçen aya göre: {netDiff >= 0 ? '+' : ''}{netDiff}%
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={exportExcel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600"
        >
          <FileSpreadsheet className="w-5 h-5" /> Excel İndir
        </button>
        <button
          onClick={exportPrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <FileText className="w-5 h-5" /> PDF / Yazdır
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold">Harcamalar</h4>
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600"
          >
            <Plus className="w-4 h-4" /> Harcama Ekle
          </button>
        </div>

        {showExpenseForm && (
          <form onSubmit={addExpense} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Tarih</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Kategori</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Tutar (₺)</label>
                <input
                  type="text"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="500"
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Açıklama</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Malzeme, ulaşım..."
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
            <button type="submit" className="mt-3 px-4 py-2 rounded-lg bg-red-500 text-white font-bold">
              Ekle
            </button>
          </form>
        )}

        <div className="space-y-2">
          {expenses
            .filter((e) => {
              const [y, m] = e.date.split('-').slice(0, 2);
              return `${y}-${m}` === currentMonthKey;
            })
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((e) => (
              <div
                key={e.id}
                className="p-3 rounded-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex justify-between items-center"
              >
                <div>
                  <span className="font-bold">{e.category}</span>
                  {e.description && <span className="text-slate-500 text-sm ml-2">— {e.description}</span>}
                  <span className="text-slate-400 text-xs ml-2">{e.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600">-{e.amount?.toLocaleString('tr-TR')} ₺</span>
                  <button onClick={() => deleteExpense(e.id)} className="p-1 rounded hover:bg-red-50 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
