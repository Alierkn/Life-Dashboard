import { User, Edit, X, GraduationCap, UtensilsCrossed } from 'lucide-react';

export default function MobileNav({ isOpen, onClose, currentView, onNavigate, isEditLayoutMode, onToggleEditLayout }) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-700 rounded-t-3xl p-4 pb-8 safe-area-pb"
        role="navigation"
        aria-label="Mobil menü"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-slate-700 dark:text-slate-300">Menü</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Menüyü kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {currentView !== 'dashboard' && (
            <button
              onClick={() => {
                onNavigate('dashboard');
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <User className="w-5 h-5" />
              <span className="font-bold">Geri Dön</span>
            </button>
          )}
          {currentView === 'dashboard' && (
            <>
              <button
                onClick={() => {
                  onNavigate('profile');
                  onClose();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <User className="w-5 h-5" />
                <span className="font-bold">Profil</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('food');
                  onClose();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left border-2 border-orange-200 dark:border-orange-800"
              >
                <UtensilsCrossed className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="font-bold text-orange-800 dark:text-orange-200">Yemekler</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('lessons');
                  onClose();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left border-2 border-amber-200 dark:border-amber-800"
              >
                <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-amber-800 dark:text-amber-200">Özel Dersler</span>
              </button>
              <button
                onClick={() => {
                  onToggleEditLayout();
                  onClose();
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${isEditLayoutMode ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                <Edit className="w-5 h-5" />
                <span className="font-bold">{isEditLayoutMode ? 'Düzenlemeyi Bitir' : 'Widget Düzenle'}</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
