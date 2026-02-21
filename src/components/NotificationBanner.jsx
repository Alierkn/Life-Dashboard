import { AlertCircle, X } from 'lucide-react';

export default function NotificationBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] bg-red-50 dark:bg-red-900 border-2 border-red-500 text-red-700 dark:text-red-100 px-5 py-3 rounded-full shadow-[0_4px_0_0_rgba(239,68,68,1)] flex items-center gap-3 w-[90%] md:w-auto"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden />
      <span className="font-bold text-sm">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 hover:bg-red-200 dark:hover:bg-red-800 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Bildirimi kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
