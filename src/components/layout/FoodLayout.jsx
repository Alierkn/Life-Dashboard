import { useState } from 'react';
import {
  UtensilsCrossed,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getTodayString } from '../../utils/date';
import { MEAL_TYPES } from '../../constants';

export default function FoodLayout({ recipes, setRecipes, mealLogs, setMealLogs }) {
  const [activeTab, setActiveTab] = useState('meals');
  const todayStr = getTodayString();

  return (
    <div className="max-w-5xl mx-auto space-y-6 overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 sm:p-3 rounded-2xl border-2 border-orange-200 dark:border-orange-800">
          <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Yemek & Tarifler</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tarif kaydet, ne yediğini takip et</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('meals')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 min-h-[44px] rounded-lg font-bold text-sm sm:text-base transition-colors touch-manipulation ${
            activeTab === 'meals'
              ? 'bg-orange-500 text-white border-2 border-orange-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" /> Yemek Günlüğü
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 min-h-[44px] rounded-lg font-bold text-sm sm:text-base transition-colors touch-manipulation ${
            activeTab === 'recipes'
              ? 'bg-orange-500 text-white border-2 border-orange-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-5 h-5" /> Tarifler
        </button>
      </div>

      {activeTab === 'meals' && (
        <MealsSection mealLogs={mealLogs} setMealLogs={setMealLogs} recipes={recipes} todayStr={todayStr} />
      )}
      {activeTab === 'recipes' && (
        <RecipesSection recipes={recipes} setRecipes={setRecipes} />
      )}
    </div>
  );
}

function MealsSection({ mealLogs, setMealLogs, recipes, todayStr }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [formData, setFormData] = useState({
    mealType: 'Öğle',
    description: '',
    recipeId: '',
  });

  const logsForDate = mealLogs.filter((m) => m.date === selectedDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description.trim()) return;
    const recipe = formData.recipeId ? recipes.find((r) => r.id === Number(formData.recipeId)) : null;
    setMealLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: selectedDate,
        mealType: formData.mealType,
        description: formData.description.trim(),
        recipeId: formData.recipeId ? Number(formData.recipeId) : null,
        recipeTitle: recipe?.title,
      },
    ]);
    setFormData({ mealType: 'Öğle', description: '', recipeId: '' });
    setShowForm(false);
  };

  const deleteMeal = (id) => {
    setMealLogs((prev) => prev.filter((m) => m.id !== id));
  };

  const groupedByMeal = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = logsForDate.filter((m) => m.mealType === type);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center justify-between">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-3 min-h-[44px] rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold flex-1 sm:flex-initial"
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 touch-manipulation"
        >
          <Plus className="w-5 h-5" /> Yemek Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 md:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 space-y-4 overflow-hidden">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Öğün</label>
            <select
              value={formData.mealType}
              onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {MEAL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Ne yedin?</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Örn: Mercimek çorbası, pilav, salata"
              className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              required
            />
          </div>
          {recipes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tariften seç (opsiyonel)</label>
              <select
                value={formData.recipeId}
                onChange={(e) => {
                  const r = recipes.find((rec) => rec.id === Number(e.target.value));
                  setFormData({
                    ...formData,
                    recipeId: e.target.value,
                    description: r ? r.title : formData.description,
                  });
                }}
                className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="">— Tarif seç —</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600">
            Kaydet
          </button>
        </form>
      )}

      <div className="space-y-4">
        {MEAL_TYPES.map((mealType) => {
          const items = groupedByMeal[mealType] || [];
          if (items.length === 0) return null;
          return (
            <div key={mealType} className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border-b-2 border-slate-200 dark:border-slate-700 font-bold text-orange-800 dark:text-orange-200">
                {mealType}
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {items.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">{m.description}</span>
                    <button
                      onClick={() => deleteMeal(m.id)}
                      className="p-2 min-w-[44px] min-h-[44px] rounded flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 touch-manipulation"
                      aria-label="Yemeği sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {logsForDate.length === 0 && (
          <p className="text-center py-12 text-slate-500 dark:text-slate-400">
            {selectedDate === todayStr ? "Bugün henüz yemek eklenmedi" : "Bu tarihte yemek kaydı yok"}
          </p>
        )}
      </div>
    </div>
  );
}

function RecipesSection({ recipes, setRecipes }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    category: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    const recipe = {
      id: editingId || Date.now(),
      title: formData.title.trim(),
      ingredients: formData.ingredients.trim().split('\n').filter(Boolean),
      instructions: formData.instructions.trim().split('\n').filter(Boolean),
      prepTime: formData.prepTime.trim() || null,
      cookTime: formData.cookTime.trim() || null,
      servings: formData.servings.trim() || null,
      category: formData.category.trim() || null,
    };
    if (editingId) {
      setRecipes((prev) => prev.map((r) => (r.id === editingId ? recipe : r)));
      setEditingId(null);
    } else {
      setRecipes((prev) => [...prev, recipe]);
    }
    setFormData({ title: '', ingredients: '', instructions: '', prepTime: '', cookTime: '', servings: '', category: '' });
    setShowForm(false);
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setFormData({
      title: r.title,
      ingredients: (r.ingredients || []).join('\n'),
      instructions: (r.instructions || []).join('\n'),
      prepTime: r.prepTime || '',
      cookTime: r.cookTime || '',
      servings: r.servings || '',
      category: r.category || '',
    });
    setShowForm(true);
  };

  const deleteRecipe = (id) => {
    if (window.confirm('Bu tarifi silmek istediğine emin misin?')) {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', ingredients: '', instructions: '', prepTime: '', cookTime: '', servings: '', category: '' });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 touch-manipulation"
        >
          <Plus className="w-5 h-5" /> Tarif Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tarif Adı *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Örn: Mercimek Çorbası"
              className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              required
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Hazırlık (dk)</label>
              <input
                type="number"
                min={0}
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                placeholder="15"
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Pişirme (dk)</label>
              <input
                type="number"
                min={0}
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                placeholder="30"
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Porsiyon</label>
              <input
                type="text"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                placeholder="4"
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Kategori</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Çorba, Ana yemek..."
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Malzemeler (her satıra bir malzeme)</label>
            <textarea
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              placeholder="1 su bardağı mercimek&#10;1 soğan&#10;2 yemek kaşığı yağ"
              rows={4}
              className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Yapılış (her satıra bir adım)</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="1. Mercimeği yıkayıp tencereye alın&#10;2. Soğanı doğrayıp ekleyin..."
              rows={5}
              className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600">
              {editingId ? 'Güncelle' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {recipes.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900"
          >
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 min-h-[44px]"
              onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{r.title}</h3>
                {(r.prepTime || r.cookTime || r.servings) && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    {r.prepTime && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {r.prepTime}+{r.cookTime || 0} dk</span>}
                    {r.servings && <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {r.servings} kişi</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => startEdit(r)}
                      className="p-2 min-w-[44px] min-h-[44px] rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center touch-manipulation"
                      aria-label="Düzenle"
                    >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteRecipe(r.id)}
                  className="p-2 min-w-[44px] min-h-[44px] rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 flex items-center justify-center touch-manipulation"
                  aria-label="Tarifi sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {expandedId === r.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            {expandedId === r.id && (
              <div className="px-4 pb-4 pt-0 border-t border-slate-200 dark:border-slate-700 space-y-4">
                {r.ingredients && r.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-slate-600 dark:text-slate-400 mb-2">Malzemeler</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                      {r.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {r.instructions && r.instructions.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-slate-600 dark:text-slate-400 mb-2">Yapılış</h4>
                    <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
                      {r.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {recipes.length === 0 && (
          <p className="text-center py-12 text-slate-500 dark:text-slate-400">Henüz tarif eklenmedi</p>
        )}
      </div>
    </div>
  );
}
