import { useState } from 'react';

export default function DashboardLayout({
  leftLayout,
  rightLayout,
  widgetMap,
  isEditLayoutMode,
  onMoveWidget,
  onDragDrop,
  WidgetWrapper,
}) {
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragOver = (e, column, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (isEditLayoutMode) {
      setDragOverColumn(column);
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, targetColumn, targetIndex) => {
    e.preventDefault();
    setDragOverColumn(null);
    setDragOverIndex(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.widgetId && data.fromColumn !== undefined) {
        onDragDrop(data.widgetId, data.fromColumn, targetColumn, targetIndex);
      }
    } catch {
      // Invalid drag data
    }
  };

  const renderColumn = (column, layout) => {
    const columnLabel = column === 'left' ? 'Sol' : 'Sağ';
    return (
      <div
        className={`flex flex-col gap-6 md:gap-8 min-h-[200px] ${column === 'left' ? 'md:col-span-4' : 'md:col-span-8'}`}
        onDragLeave={handleDragLeave}
      >
        {isEditLayoutMode && (
          <div
            className={`rounded-2xl border-2 border-dashed flex items-center justify-center transition-colors ${
              dragOverColumn === column && dragOverIndex === 0
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-slate-300 dark:border-slate-600'
            } ${layout.length === 0 ? 'min-h-[120px]' : 'min-h-[48px] py-2'}`}
            onDragOver={(e) => handleDragOver(e, column, 0)}
            onDrop={(e) => handleDrop(e, column, 0)}
          >
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {layout.length === 0 ? `Widgetları ${columnLabel} alana bırak` : '↑ En üste bırak'}
            </span>
          </div>
        )}
        {layout.map((widgetId, index) => {
          if (!widgetMap[widgetId]) return null;
          const isDropTarget = dragOverColumn === column && dragOverIndex === index + 1;
          return (
            <div key={widgetId} className="relative">
              {isEditLayoutMode && (
                <div
                  className={`absolute inset-0 rounded-2xl border-2 border-dashed -z-0 transition-colors pointer-events-none ${
                    isDropTarget ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10' : 'border-transparent'
                  }`}
                  style={{ top: -4, bottom: -4 }}
                />
              )}
              <div
                onDragOver={(e) => handleDragOver(e, column, index + 1)}
                onDrop={(e) => handleDrop(e, column, index + 1)}
                className={isEditLayoutMode ? 'min-h-[80px]' : ''}
              >
                <WidgetWrapper
                  id={widgetId}
                  column={column}
                  isEditLayoutMode={isEditLayoutMode}
                  onMoveWidget={onMoveWidget}
                >
                  {widgetMap[widgetId]}
                </WidgetWrapper>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 animate-fade-in overflow-hidden">
      {renderColumn('left', leftLayout)}
      {renderColumn('right', rightLayout)}
    </div>
  );
}
