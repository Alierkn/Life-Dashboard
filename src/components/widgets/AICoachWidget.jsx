import { Sparkles } from 'lucide-react';

export default function AICoachWidget({ aiTip }) {
  return (
    <div className="bg-gradient-to-r from-purple-100 to-blue-50 dark:from-slate-800 dark:to-slate-800 border-2 border-purple-200 dark:border-slate-700 rounded-[2rem] p-4 md:p-6 relative overflow-hidden transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" aria-hidden />
        </div>
        <div>
          <h3 className="font-black text-slate-900 dark:text-white text-lg mb-1">AI Yaşam Koçu</h3>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{aiTip}</p>
        </div>
      </div>
    </div>
  );
}
