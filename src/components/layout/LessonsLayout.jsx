import { useState, useCallback } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Clock,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays,
  Banknote,
  Phone,
  XCircle,
  UserCheck,
  FileText,
  Upload,
  TrendingUp,
  LayoutTemplate,
  Users,
  Wallet,
} from 'lucide-react';
import { getTodayString, getMondayOfWeek } from '../../utils/date';
import { getMonthCalendar, DAY_NAMES, MONTH_NAMES } from '../../utils/date';
import { parseCSV, parseExcel, rowsToLessons } from '../../utils/weeklyPlanParser';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { LESSON_DURATION_OPTIONS } from '../../constants';
import LessonsTemplatesSection from './LessonsTemplatesSection';
import LessonsStudentsSection from './LessonsStudentsSection';
import LessonsFinanceSection from './LessonsFinanceSection';

const ensureLessonFields = (lesson) => ({
  ...lesson,
  paymentDone: lesson.paymentDone ?? false,
  parentInformed: lesson.parentInformed ?? false,
  cancelled: lesson.cancelled ?? false,
  studentAttended: lesson.studentAttended ?? false,
  postLessonNotes: lesson.postLessonNotes ?? '',
});

export default function LessonsLayout({
  lessons,
  setLessons,
  lessonTemplates = [],
  setLessonTemplates = () => {},
  students = [],
  setStudents = () => {},
  expenses = [],
  setExpenses = () => {},
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [calendarDate, setCalendarDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [uploadWeekStart, setUploadWeekStart] = useState(() => getMondayOfWeek(getTodayString()));
  const [uploadWeeksCount, setUploadWeeksCount] = useState(1);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    subject: '',
    date: getTodayString(),
    time: '14:00',
    duration: 60,
    fee: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      studentName: '',
      subject: '',
      date: getTodayString(),
      time: '14:00',
      duration: 60,
      fee: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.subject.trim()) return;

    const existing = editingId ? lessons.find((l) => l.id === editingId) : null;
    const lesson = ensureLessonFields({
      id: editingId ?? Date.now(),
      studentName: formData.studentName.trim(),
      subject: formData.subject.trim(),
      date: formData.date,
      time: formData.time,
      duration: Number(formData.duration) || 60,
      fee: formData.fee.trim() || '',
      notes: formData.notes.trim() || '',
      paymentDone: existing?.paymentDone ?? false,
      parentInformed: existing?.parentInformed ?? false,
      cancelled: existing?.cancelled ?? false,
      studentAttended: existing?.studentAttended ?? false,
      postLessonNotes: existing?.postLessonNotes ?? '',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });

    if (editingId) {
      setLessons((prev) => prev.map((l) => (l.id === editingId ? lesson : l)));
    } else {
      setLessons((prev) => [...prev, lesson]);
    }
    resetForm();
  };

  const handleEdit = (lesson) => {
    const safe = ensureLessonFields(lesson);
    setFormData({
      studentName: safe.studentName,
      subject: safe.subject,
      date: safe.date,
      time: safe.time || '14:00',
      duration: safe.duration || 60,
      fee: safe.fee || '',
      notes: safe.notes || '',
    });
    setEditingId(safe.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu dersi silmek istediğine emin misin?')) {
      setLessons((prev) => prev.filter((l) => l.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const toggleLessonStatus = useCallback((id, field) => {
    setLessons((prev) =>
      prev.map((l) => {
        if (String(l.id) !== String(id)) return l;
        const safe = ensureLessonFields(l);
        return { ...safe, [field]: !safe[field] };
      })
    );
  }, [setLessons]);

  const updatePostLessonNotes = (id, notes) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...ensureLessonFields(l), postLessonNotes: notes } : l))
    );
  };

  const downloadTemplate = () => {
    const csv = 'Öğrenci,Ders,Gün,Saat,Süre,Ücret\nAli,Matematik,Pazartesi,14:00,60,500\nAyşe,İngilizce,Salı,10:00,45,400\nMehmet,Fizik,Çarşamba,16:00,60,550';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'haftalik_plan_sablonu.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadSuccess(null);
    const ext = (file.name || '').split('.').pop()?.toLowerCase();

    try {
      let rows = [];
      if (ext === 'csv' || ext === 'txt') {
        const text = await file.text();
        rows = parseCSV(text);
      } else if (['xlsx', 'xls'].includes(ext)) {
        const buffer = await file.arrayBuffer();
        rows = parseExcel(buffer);
      } else {
        setUploadError('Sadece CSV veya Excel (.xlsx, .xls) dosyaları desteklenir.');
        return;
      }

      if (rows.length === 0) {
        setUploadError('Dosyada geçerli satır bulunamadı. Sütunlar: Öğrenci, Ders, Gün, Saat, Süre, Ücret');
        return;
      }

      const baseMonday = getMondayOfWeek(uploadWeekStart);
      const allLessons = [];
      for (let w = 0; w < uploadWeeksCount; w++) {
        const d = new Date(baseMonday);
        d.setDate(d.getDate() + w * 7);
        const weekMonday = d.toISOString().split('T')[0];
        const weekLessons = rowsToLessons(rows, weekMonday);
        weekLessons.forEach((l, idx) =>
          allLessons.push(
            ensureLessonFields({
              ...l,
              id: Date.now() + w * 100000 + idx,
              createdAt: new Date().toISOString(),
            })
          )
        );
      }
      setLessons((prev) => [...prev, ...allLessons]);
      setUploadSuccess(`${allLessons.length} ders eklendi (${uploadWeeksCount} hafta).`);
      e.target.value = '';
    } catch (err) {
      setUploadError(err?.message || 'Dosya işlenirken hata oluştu.');
    }
  };

  const safeLessons = lessons.map(ensureLessonFields);
  const sortedLessons = [...safeLessons].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    return dateCompare !== 0 ? dateCompare : (a.time || '').localeCompare(b.time || '');
  });

  const today = getTodayString();
  const upcomingLessons = sortedLessons.filter((l) => !l.cancelled && l.date >= today);
  const pastLessons = sortedLessons.filter((l) => l.date < today);

  const monthlyEarnings = safeLessons
    .filter((l) => !l.cancelled && l.fee)
    .reduce((acc, l) => {
      const [y, m] = l.date.split('-').slice(0, 2);
      const key = `${y}-${m}`;
      acc[key] = (acc[key] || 0) + parseInt(String(l.fee).replace(/\D/g, ''), 10);
      return acc;
    }, {});

  const currentMonthKey = `${calendarDate.year}-${String(calendarDate.month).padStart(2, '0')}`;
  const thisMonthEarnings = monthlyEarnings[currentMonthKey] || 0;
  const totalEarnings = Object.values(monthlyEarnings).reduce((a, b) => a + b, 0);

  const { rate: tryToEurRate } = useExchangeRate();
  const thisMonthEur = tryToEurRate ? (thisMonthEarnings * tryToEurRate).toFixed(2) : null;
  const totalEur = tryToEurRate ? (totalEarnings * tryToEurRate).toFixed(2) : null;

  const [mainTab, setMainTab] = useState('lessons');

  const handleGenerateFromTemplates = (newLessons) => {
    setLessons((prev) => [...prev, ...newLessons]);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-xl border-2 border-amber-600">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          Özel Derslerim
        </h2>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border-2 border-slate-200 dark:border-slate-700 p-0.5">
            <button
              onClick={() => setMainTab('lessons')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${mainTab === 'lessons' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Calendar className="w-4 h-4" /> Dersler
            </button>
            <button
              onClick={() => setMainTab('templates')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${mainTab === 'templates' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <LayoutTemplate className="w-4 h-4" /> Şablonlar
            </button>
            <button
              onClick={() => setMainTab('students')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${mainTab === 'students' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Users className="w-4 h-4" /> Öğrenciler
            </button>
            <button
              onClick={() => setMainTab('finance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${mainTab === 'finance' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Wallet className="w-4 h-4" /> Finans
            </button>
          </div>
          {mainTab === 'lessons' && (
            <>
              <div className="flex rounded-lg border-2 border-slate-200 dark:border-slate-700 p-0.5">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'calendar' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <CalendarDays className="w-4 h-4" /> Takvim
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'list' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <List className="w-4 h-4" /> Liste
                </button>
              </div>
              <button
                onClick={() => (showForm ? resetForm() : setShowForm(true))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold border-2 border-amber-600 hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Yeni Ders
              </button>
            </>
          )}
        </div>
      </div>

      {mainTab === 'templates' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
          <LessonsTemplatesSection
            templates={lessonTemplates}
            setTemplates={setLessonTemplates}
            onGenerateLessons={handleGenerateFromTemplates}
          />
        </div>
      )}

      {mainTab === 'students' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
          <LessonsStudentsSection students={students} setStudents={setStudents} />
        </div>
      )}

      {mainTab === 'finance' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
          <LessonsFinanceSection
            lessons={safeLessons}
            expenses={expenses}
            setExpenses={setExpenses}
            calendarDate={calendarDate}
          />
        </div>
      )}

      {mainTab === 'lessons' && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800">
          <h3 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            Aylık Kazanç
          </h3>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-200">
            {thisMonthEarnings.toLocaleString('tr-TR')} ₺
          </p>
          {thisMonthEur != null && (
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              ≈ {Number(thisMonthEur).toLocaleString('tr-TR')} €
            </p>
          )}
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            {MONTH_NAMES[calendarDate.month - 1]} {calendarDate.year} • Toplam: {totalEarnings.toLocaleString('tr-TR')} ₺
            {totalEur != null && (
              <span className="ml-1">(≈ {Number(totalEur).toLocaleString('tr-TR')} €)</span>
            )}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
            <Upload className="w-5 h-5" />
            Haftalık Plan Yükle
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            CSV veya Excel dosyası yükleyin. Sütunlar: Öğrenci, Ders, Gün, Saat, Süre, Ücret. Gün: Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Başlangıç:</label>
            <input
              type="date"
              value={uploadWeekStart}
              onChange={(e) => setUploadWeekStart(e.target.value)}
              className="px-2 py-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
              title="Planın uygulanacağı hafta (herhangi bir gün seçin)"
            />
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Hafta sayısı:</label>
            <select
              value={uploadWeeksCount}
              onChange={(e) => setUploadWeeksCount(Number(e.target.value))}
              className="px-2 py-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold cursor-pointer hover:bg-amber-600 border-2 border-amber-600 text-sm">
              <Upload className="w-4 h-4" />
              Dosya Yükle
              <input
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={downloadTemplate}
              className="px-3 py-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Şablon İndir
            </button>
          </div>
          {uploadError && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{uploadError}</p>}
          {uploadSuccess && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{uploadSuccess}</p>}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800"
        >
          <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-200">
            {editingId ? 'Dersi Düzenle' : 'Yeni Ders'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Öğrenci Adı *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Öğrenci adı"
                  list="student-list"
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-amber-500"
                  required
                />
                {students.length > 0 && (
                  <select
                    value={students.some((s) => s.name === formData.studentName) ? formData.studentName : ''}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm min-w-[120px]"
                  >
                    <option value="">Öğrenci seç</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
              {students.length > 0 && (
                <datalist id="student-list">
                  {students.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Ders / Konu *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Matematik, İngilizce..."
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tarih</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Saat</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Süre (dk)</label>
              <div className="flex flex-wrap gap-2">
                {LESSON_DURATION_OPTIONS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setFormData({ ...formData, duration: mins })}
                    className={`px-4 py-2 rounded-lg font-bold border-2 transition-colors ${
                      formData.duration === mins
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-300'
                    }`}
                  >
                    {mins} dk
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Ücret (₺)</label>
              <input
                type="text"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                placeholder="Örn: 500"
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-amber-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Ders Öncesi Notlar</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Örn: 3. ünite, sayfa 45..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-amber-500 resize-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-6 py-2 rounded-xl bg-amber-500 text-white font-bold border-2 border-amber-600 hover:bg-amber-600 transition-colors"
          >
            {editingId ? 'Güncelle' : 'Kaydet'}
          </button>
        </form>
      )}

      {viewMode === 'calendar' && (
        <LessonsCalendar
          lessons={safeLessons}
          calendarDate={calendarDate}
          setCalendarDate={setCalendarDate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={toggleLessonStatus}
          onUpdatePostNotes={updatePostLessonNotes}
          today={today}
        />
      )}

      {viewMode === 'list' && (
        <div className="space-y-6">
          {upcomingLessons.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Yaklaşan Dersler
              </h3>
              <div className="space-y-3">
                {upcomingLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isPast={false}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={toggleLessonStatus}
                    onUpdatePostNotes={updatePostLessonNotes}
                  />
                ))}
              </div>
            </div>
          )}

          {pastLessons.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Geçmiş Dersler
              </h3>
              <div className="space-y-3">
                {pastLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isPast
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={toggleLessonStatus}
                    onUpdatePostNotes={updatePostLessonNotes}
                  />
                ))}
              </div>
            </div>
          )}

          {lessons.length === 0 && !showForm && (
            <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Henüz ders eklenmemiş.</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Yeni ders eklemek için yukarıdaki butona tıklayın.</p>
            </div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}

function LessonsCalendar({
  lessons,
  calendarDate,
  setCalendarDate,
  onEdit,
  onDelete,
  onToggleStatus,
  onUpdatePostNotes,
  today,
}) {
  const { weeks, monthName, year } = getMonthCalendar(calendarDate.year, calendarDate.month);

  const goPrev = () => {
    setCalendarDate((prev) =>
      prev.month === 1 ? { year: prev.year - 1, month: 12 } : { ...prev, month: prev.month - 1 }
    );
  };

  const goNext = () => {
    setCalendarDate((prev) =>
      prev.month === 12 ? { year: prev.year + 1, month: 1 } : { ...prev, month: prev.month + 1 }
    );
  };

  const getLessonsForDate = (dateStr) =>
    lessons.filter((l) => l.date === dateStr && !l.cancelled);

  const [selectedDay, setSelectedDay] = useState(null);
  const dayLessons = selectedDay ? getLessonsForDate(selectedDay) : [];

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">{monthName} {year}</h3>
        <div className="flex gap-1">
          <button onClick={goPrev} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Önceki ay">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={goNext} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Sonraki ay">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {DAY_NAMES.map((d) => (
              <th key={d} className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((cell, ci) => {
                if (!cell) return <td key={ci} className="p-0.5 align-top" />;
                const { day, dateStr } = cell;
                const dayLessonsCount = getLessonsForDate(dateStr).length;
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDay;

                return (
                  <td key={ci} className="p-0.5 align-top">
                    <button
                      onClick={() => setSelectedDay(dateStr)}
                      className={`w-full min-h-[64px] rounded-lg border-2 p-1.5 text-left transition-colors ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                          : isToday
                            ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className={`text-xs font-bold block ${isToday ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {day}
                      </span>
                      {dayLessonsCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold mt-1">
                          {dayLessonsCount}
                        </span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDay && (
        <div className="mt-6 pt-4 border-t-2 border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-300">
            {selectedDay === today ? 'Bugün' : selectedDay} — Dersler
          </h4>
          {dayLessons.length > 0 ? (
            <div className="space-y-3">
              {dayLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  isPast={selectedDay < today}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  onUpdatePostNotes={onUpdatePostNotes}
                  compact
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Bu günde ders yok.</p>
          )}
        </div>
      )}
    </div>
  );
}

function LessonCard({
  lesson,
  isPast,
  onEdit,
  onDelete,
  onToggleStatus,
  onUpdatePostNotes,
  compact = false,
}) {
  const [showNotes, setShowNotes] = useState(false);
  const safe = {
    paymentDone: lesson.paymentDone ?? false,
    parentInformed: lesson.parentInformed ?? false,
    cancelled: lesson.cancelled ?? false,
    studentAttended: lesson.studentAttended ?? false,
    postLessonNotes: lesson.postLessonNotes ?? '',
  };

  return (
    <div
      className={`rounded-xl border-2 transition-colors ${
        lesson.cancelled
          ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
          : isPast
            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <User className="w-4 h-4 text-amber-500" />
              {lesson.studentName}
            </span>
            {lesson.cancelled && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                İptal
              </span>
            )}
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {lesson.subject}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {lesson.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lesson.time} — {lesson.duration} dk
            </span>
            {lesson.fee && (
              <span className="font-bold text-amber-600 dark:text-amber-400">{lesson.fee} ₺</span>
            )}
          </div>
          {lesson.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">Öncesi: {lesson.notes}</p>
          )}

          {!compact && (
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge
                icon={Banknote}
                label="Ödeme"
                active={safe.paymentDone}
                onClick={() => onToggleStatus(lesson.id, 'paymentDone')}
              />
              <StatusBadge
                icon={Phone}
                label="Veli"
                active={safe.parentInformed}
                onClick={() => onToggleStatus(lesson.id, 'parentInformed')}
              />
              <StatusBadge
                icon={UserCheck}
                label="Katıldı"
                active={safe.studentAttended}
                onClick={() => onToggleStatus(lesson.id, 'studentAttended')}
              />
              <StatusBadge
                icon={XCircle}
                label="İptal"
                active={safe.cancelled}
                onClick={() => onToggleStatus(lesson.id, 'cancelled')}
                danger
              />
            </div>
          )}

          {(isPast || lesson.date <= getTodayString() || safe.postLessonNotes) && (
            <div className="mt-3">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600"
              >
                <FileText className="w-3.5 h-3.5" />
                Ders Sonrası Notlar {safe.postLessonNotes ? `(${safe.postLessonNotes.length} karakter)` : ''}
              </button>
              {showNotes && (
                <textarea
                  value={safe.postLessonNotes}
                  onChange={(e) => onUpdatePostNotes(lesson.id, e.target.value)}
                  placeholder="Ders sonrası notlarınızı buraya yazın..."
                  rows={3}
                  className="mt-2 w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:border-amber-500 resize-none"
                />
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {compact && (
            <div className="flex gap-1 flex-wrap">
              <StatusBadge icon={Banknote} label="" active={safe.paymentDone} onClick={() => onToggleStatus(lesson.id, 'paymentDone')} title="Ödeme yapıldı" />
              <StatusBadge icon={Phone} label="" active={safe.parentInformed} onClick={() => onToggleStatus(lesson.id, 'parentInformed')} title="Veli bilgilendirildi" />
              <StatusBadge icon={UserCheck} label="" active={safe.studentAttended} onClick={() => onToggleStatus(lesson.id, 'studentAttended')} title="Öğrenci katıldı" />
              <StatusBadge icon={XCircle} label="" active={safe.cancelled} onClick={() => onToggleStatus(lesson.id, 'cancelled')} danger title="İptal" />
            </div>
          )}
          <button
            onClick={() => onEdit(lesson)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600 transition-colors"
            aria-label="Düzenle"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(lesson.id)}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-colors"
            aria-label="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ icon: Icon, label, active, onClick, danger, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
        active
          ? danger
            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-700'
            : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-2 border-green-300 dark:border-green-700'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-2 border-transparent hover:border-slate-300'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
