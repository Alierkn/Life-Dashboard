import { Layout, Edit, Moon, Sun, User, ArrowLeft, GraduationCap, UtensilsCrossed } from 'lucide-react';

export default function Header({
  currentView,
  isEditLayoutMode,
  onToggleEditLayout,
  onToggleView,
  onNavigateTo,
  theme,
  onToggleTheme,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) {
  return (
    <div className="max-w-5xl mx-auto mb-6 md:mb-10 sticky top-0 z-[60] safe-area-inset-top">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-full px-3 md:px-4 py-2.5 md:py-3 flex justify-between items-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors">
        <div className="flex items-center gap-3 pl-2">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
            aria-label="Menüyü aç"
          >
            <Layout className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <div className="bg-purple-600 text-white p-1.5 rounded-lg border-2 border-slate-900 dark:border-slate-700 hidden md:flex">
            <Layout className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white hidden md:block">
            LIFE<span className="text-purple-600 dark:text-purple-400">DASHBOARD</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {currentView === 'dashboard' && (
            <button
              onClick={() => onToggleEditLayout(isEditLayoutMode ? false : true)}
              className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-full border-2 text-sm font-bold transition-colors ${isEditLayoutMode ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'}`}
              aria-pressed={isEditLayoutMode}
              title={isEditLayoutMode ? 'Düzenlemeyi bitir' : 'Widget düzenle'}
            >
              <Edit className="w-4 h-4" />
              <span className="hidden md:inline">{isEditLayoutMode ? 'Bitti' : 'Düzenle'}</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-300 transition-colors touch-target"
            aria-label={theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="h-6 w-[2px] bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block" aria-hidden />

          {currentView === 'dashboard' ? (
            <>
              <button
                onClick={() => onNavigateTo?.('food')}
                className="hidden md:flex bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition-transform active:scale-95 border-2 border-orange-600 items-center gap-2"
              >
                <UtensilsCrossed className="w-4 h-4" /> Yemekler
              </button>
              <button
                onClick={() => onNavigateTo?.('lessons')}
                className="hidden md:flex bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-amber-600 transition-transform active:scale-95 border-2 border-amber-600 items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" /> Özel Dersler
              </button>
              <button
                onClick={() => onNavigateTo?.('profile')}
                className="hidden md:flex bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 border-2 border-slate-900 dark:border-white items-center gap-2"
              >
                <User className="w-4 h-4" /> Profil
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigateTo?.('dashboard')}
              className="hidden md:flex bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 border-2 border-slate-900 dark:border-white items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Geri Dön
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
