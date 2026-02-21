import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowRight, ArrowLeft as MoveLeftIcon, GripVertical } from 'lucide-react';

export default function WidgetWrapper({ id, column, isEditLayoutMode, onMoveWidget, children }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    if (!isEditLayoutMode) return;
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({ widgetId: id, fromColumn: column }));
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    e.target.style.opacity = '1';
  };

  return (
    <div
      draggable={isEditLayoutMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`relative transition-all duration-300 ${isEditLayoutMode ? 'ring-4 ring-purple-500/50 rounded-[2rem] scale-[0.98] cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'opacity-50' : ''}`}
    >
      {isEditLayoutMode && (
        <div
          className="absolute -top-3 -right-3 z-50 flex gap-1 bg-slate-900 p-1.5 rounded-xl shadow-xl border-2 border-slate-700"
          role="toolbar"
          aria-label="Widget konumunu düzenle"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1 text-slate-400 cursor-grab" aria-hidden>
            <GripVertical className="w-4 h-4" />
          </div>
          {column === 'right' && (
            <button
              onClick={() => onMoveWidget(id, column, 'left')}
              className="p-2 min-w-[36px] min-h-[36px] text-white hover:bg-slate-700 rounded-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-400 touch-manipulation"
              aria-label="Sola taşı"
            >
              <MoveLeftIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onMoveWidget(id, column, 'up')}
            className="p-2 min-w-[36px] min-h-[36px] text-white hover:bg-slate-700 rounded-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-400 touch-manipulation"
            aria-label="Yukarı taşı"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveWidget(id, column, 'down')}
            className="p-2 min-w-[36px] min-h-[36px] text-white hover:bg-slate-700 rounded-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-400 touch-manipulation"
            aria-label="Aşağı taşı"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          {column === 'left' && (
            <button
              onClick={() => onMoveWidget(id, column, 'right')}
              className="p-2 min-w-[36px] min-h-[36px] text-white hover:bg-slate-700 rounded-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-400 touch-manipulation"
              aria-label="Sağa taşı"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      <div className={isEditLayoutMode ? 'pointer-events-none opacity-80' : ''}>{children}</div>
    </div>
  );
}
