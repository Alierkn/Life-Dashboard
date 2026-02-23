import { useState } from 'react';
import { Plus, Trash2, Edit, Calendar, Clock, User, BookOpen } from 'lucide-react';
import { getMondayOfWeek } from '../../utils/date';
import { LESSON_DURATION_OPTIONS, generateId } from '../../constants';

const DAY_OPTIONS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function LessonsTemplatesSection({ templates, setTemplates, onGenerateLessons }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    subject: '',
    day: 'Pazartesi',
    time: '14:00',
    duration: 60,
    fee: '',
    notes: '',
  });
  const [generateWeekStart, setGenerateWeekStart] = useState(() => getMondayOfWeek(new Date().toISOString().split('T')[0]));
  const [generateWeeks, setGenerateWeeks] = useState(1);

  const resetForm = () => {
    setFormData({
      studentName: '',
      subject: '',
      day: 'Pazartesi',
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

    const template = {
      id: editingId ?? generateId(),
      studentName: formData.studentName.trim(),
      subject: formData.subject.trim(),
      day: formData.day,
      time: formData.time,
      duration: Number(formData.duration) || 60,
      fee: formData.fee.trim() || '',
      notes: formData.notes.trim() || '',
    };

    if (editingId) {
      setTemplates((prev) => prev.map((t) => (t.id === editingId ? template : t)));
    } else {
      setTemplates((prev) => [...prev, template]);
    }
    resetForm();
  };

  const handleEdit = (t) => {
    setFormData({
      studentName: t.studentName,
      subject: t.subject,
      day: t.day || 'Pazartesi',
      time: t.time || '14:00',
      duration: t.duration || 60,
      fee: t.fee || '',
      notes: t.notes || '',
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu şablonu silmek istediğine emin misin?')) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const handleGenerate = () => {
    if (templates.length === 0) return;
    const baseMonday = getMondayOfWeek(generateWeekStart);
    const dayToOffset = { Pazartesi: 0, Salı: 1, Çarşamba: 2, Perşembe: 3, Cuma: 4, Cumartesi: 5, Pazar: 6 };
    const lessons = [];
    for (let w = 0; w < generateWeeks; w++) {
      const d = new Date(baseMonday);
      d.setDate(d.getDate() + w * 7);
      const weekMonday = d.toISOString().split('T')[0];
      templates.forEach((t, idx) => {
        const offset = dayToOffset[t.day] ?? 0;
        const lessonDate = new Date(weekMonday);
        lessonDate.setDate(lessonDate.getDate() + offset);
        lessons.push({
          id: generateId(),
          studentName: t.studentName,
          subject: t.subject,
          date: lessonDate.toISOString().split('T')[0],
          time: t.time || '14:00',
          duration: t.duration || 60,
          fee: t.fee || '',
          notes: t.notes || '',
          paymentDone: false,
          parentInformed: false,
          cancelled: false,
          studentAttended: false,
          postLessonNotes: '',
          createdAt: new Date().toISOString(),
        });
      });
    }
    onGenerateLessons(lessons);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Tekrarlayan Ders Şablonları</h3>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold border-2 border-amber-600 hover:bg-amber-600"
        >
          <Plus className="w-5 h-5" />
          Yeni Şablon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
          <h4 className="font-bold mb-4">{editingId ? 'Şablonu Düzenle' : 'Yeni Şablon'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Öğrenci *</label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Ders *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Gün</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Saat</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
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
              <label className="block text-xs font-bold text-slate-500 mb-1">Ücret (₺)</label>
              <input
                type="text"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                placeholder="500"
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Notlar</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
          <button type="submit" className="mt-4 px-6 py-2 rounded-xl bg-amber-500 text-white font-bold">
            {editingId ? 'Güncelle' : 'Kaydet'}
          </button>
        </form>
      )}

      {templates.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-sm mb-3">Şablondan Ders Oluştur</h4>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="date"
              value={generateWeekStart}
              onChange={(e) => setGenerateWeekStart(e.target.value)}
              className="px-2 py-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700"
            />
            <select
              value={generateWeeks}
              onChange={(e) => setGenerateWeeks(Number(e.target.value))}
              className="px-2 py-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n} hafta</option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600"
            >
              Dersleri Oluştur
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {templates.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold flex items-center gap-1"><User className="w-4 h-4 text-amber-500" />{t.studentName}</span>
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{t.subject}</span>
              <span className="text-slate-500 text-sm flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{t.day}</span>
              <span className="text-slate-500 text-sm flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t.time} — {t.duration} dk</span>
              {t.fee && <span className="font-bold text-amber-600">{t.fee} ₺</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(t)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !showForm && (
        <p className="text-slate-500 text-center py-8">Henüz şablon yok. Pazartesi 14:00 Matematik gibi sabit derslerinizi ekleyin.</p>
      )}
    </div>
  );
}
