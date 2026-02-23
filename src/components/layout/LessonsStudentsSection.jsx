import { useState } from 'react';
import { Plus, Trash2, Edit, User, Phone, Mail, Users } from 'lucide-react';
import { generateId } from '../../constants';

export default function LessonsStudentsSection({ students, setStudents }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    parentName: '',
    parentPhone: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', parentName: '', parentPhone: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const student = {
      id: editingId ?? generateId(),
      name: formData.name.trim(),
      phone: formData.phone.trim() || '',
      email: formData.email.trim() || '',
      parentName: formData.parentName.trim() || '',
      parentPhone: formData.parentPhone.trim() || '',
      notes: formData.notes.trim() || '',
    };

    if (editingId) {
      setStudents((prev) => prev.map((s) => (s.id === editingId ? student : s)));
    } else {
      setStudents((prev) => [...prev, student]);
    }
    resetForm();
  };

  const handleEdit = (s) => {
    setFormData({
      name: s.name || '',
      phone: s.phone || '',
      email: s.email || '',
      parentName: s.parentName || '',
      parentPhone: s.parentPhone || '',
      notes: s.notes || '',
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu öğrenciyi silmek istediğine emin misin?')) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Öğrenci Profilleri</h3>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-amber-500 text-white font-bold border-2 border-amber-600 hover:bg-amber-600 touch-manipulation"
        >
          <Plus className="w-5 h-5" />
          Yeni Öğrenci
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
          <h4 className="font-bold mb-4">{editingId ? 'Öğrenciyi Düzenle' : 'Yeni Öğrenci'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Ad Soyad *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="05XX XXX XX XX"
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">E-posta</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Veli Adı</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Veli Telefonu</label>
              <input
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Notlar</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Öğrenci hakkında notlar..."
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
          <button type="submit" className="mt-4 px-6 py-2 rounded-xl bg-amber-500 text-white font-bold">
            {editingId ? 'Güncelle' : 'Kaydet'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {students.map((s) => (
          <div
            key={s.id}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800"
          >
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <h4 className="font-bold flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" />
                  {s.name}
                </h4>
                <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  {s.phone && <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{s.phone}</p>}
                  {s.email && <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{s.email}</p>}
                  {(s.parentName || s.parentPhone) && (
                    <p className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3.5 h-3.5" />
                      Veli: {s.parentName || '-'} {s.parentPhone ? `(${s.parentPhone})` : ''}
                    </p>
                  )}
                  {s.notes && <p className="text-xs italic mt-2">{s.notes}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(s)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && !showForm && (
        <p className="text-slate-500 text-center py-8">Henüz öğrenci profili yok. Öğrenci ekleyerek iletişim ve veli bilgilerini kaydedin.</p>
      )}
    </div>
  );
}
