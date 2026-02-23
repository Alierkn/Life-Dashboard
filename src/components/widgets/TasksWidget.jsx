import { useState } from 'react';
import { Check, Plus, Trash2, BookOpen, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { TASK_TAGS, TASK_REPEAT_OPTIONS } from '../../constants';
import { sanitize } from '../../utils/sanitize';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function TasksWidget({
  tasks,
  showAddTask,
  newTaskTitle,
  newTaskTag,
  newTaskPriority,
  newTaskRepeat = 'none',
  taskFilterTag = '',
  taskSortBy = 'priority',
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onClearCompleted,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onSetShowAddTask,
  onSetNewTaskTitle,
  onSetNewTaskTag,
  onSetNewTaskPriority,
  onSetNewTaskRepeat,
  onSetTaskFilterTag,
  onSetTaskSortBy,
}) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [newSubtaskText, setNewSubtaskText] = useState({});

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const filteredPending = taskFilterTag
    ? pendingTasks.filter((t) => t.tag === taskFilterTag)
    : pendingTasks;
  const filteredCompleted = taskFilterTag
    ? completedTasks.filter((t) => t.tag === taskFilterTag)
    : completedTasks;

  const sortTasks = (arr) => {
    const sorted = [...arr];
    if (taskSortBy === 'priority') {
      sorted.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2));
    } else if (taskSortBy === 'tag') {
      sorted.sort((a, b) => (a.tag || '').localeCompare(b.tag || ''));
    } else {
      sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    }
    return sorted;
  };

  const sortedPending = sortTasks(filteredPending);
  const sortedCompleted = sortTasks(filteredCompleted);
  const tasksToShow = showCompleted ? [...sortedPending, ...sortedCompleted] : sortedPending;

  const effectiveCompleted = (task) => {
    const subs = task.subtasks || [];
    return task.completed || (subs.length > 0 && subs.every((s) => s.completed));
  };

  const handleAddSubtask = (taskId) => {
    const text = newSubtaskText[taskId]?.trim();
    if (text) {
      onAddSubtask?.(taskId, text);
      setNewSubtaskText((prev) => ({ ...prev, [taskId]: '' }));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 md:p-6 h-fit transition-colors overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center gap-3 mb-6">
        <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /> Görevler
        </h3>
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {onSetTaskFilterTag && (
            <select
              value={taskFilterTag}
              onChange={(e) => onSetTaskFilterTag(e.target.value)}
              className="px-2 py-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
            >
              <option value="">Tüm etiketler</option>
              {TASK_TAGS.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
          {onSetTaskSortBy && (
            <select
              value={taskSortBy}
              onChange={(e) => onSetTaskSortBy(e.target.value)}
              className="px-2 py-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
            >
              <option value="priority">Öncelik</option>
              <option value="tag">Etiket</option>
              <option value="date">Eklenme</option>
            </select>
          )}
          {completedTasks.length > 0 && (
            <>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
              >
                {showCompleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {completedTasks.length}
              </button>
              <button onClick={() => onClearCompleted?.()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-red-300 dark:border-red-700">
                <Trash2 className="w-4 h-4" /> Temizle
              </button>
            </>
          )}
          <button
            onClick={() => onSetShowAddTask(!showAddTask)}
            className="text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors touch-target"
            aria-label={showAddTask ? 'Görev eklemeyi kapat' : 'Yeni görev ekle'}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showAddTask && (
        <div className="flex flex-col gap-2 mb-4 bg-slate-50 dark:bg-slate-800 p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => onSetNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddTask()}
            placeholder="Görev adı..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-bold dark:text-white"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={newTaskTag}
              onChange={(e) => onSetNewTaskTag(e.target.value)}
              className="flex-1 min-w-[100px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm font-bold"
            >
              {TASK_TAGS.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <select
              value={newTaskPriority}
              onChange={(e) => onSetNewTaskPriority(e.target.value)}
              className="flex-1 min-w-[100px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm font-bold"
            >
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>
            {TASK_REPEAT_OPTIONS && (
              <select
                value={newTaskRepeat}
                onChange={(e) => onSetNewTaskRepeat?.(e.target.value)}
                className="flex-1 min-w-[100px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm font-bold"
              >
                {TASK_REPEAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            <button onClick={onAddTask} className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg border-2 border-blue-600 hover:bg-blue-600">
              Ekle
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {tasksToShow.map((task) => {
          const isCompleted = effectiveCompleted(task);
          const subs = task.subtasks || [];
          const isExpanded = expandedTaskId === task.id;

          return (
            <div
              key={task.id}
              className="flex flex-col p-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`w-8 h-8 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors touch-manipulation ${isCompleted ? 'bg-blue-500 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}
                >
                  {isCompleted && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
                <div className="flex-1 flex flex-col min-w-0">
                  <span className={`text-sm font-bold ${isCompleted ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                    {sanitize(task.text)}
                  </span>
                  <div className="flex gap-1 mt-1 flex-wrap items-center">
                    {task.tag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                        {sanitize(task.tag)}
                      </span>
                    )}
                    {task.priority === 'high' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        Öncelikli
                      </span>
                    )}
                    {task.repeat && task.repeat !== 'none' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {task.repeat === 'daily' ? 'Günlük' : 'Haftalık'}
                      </span>
                    )}
                    {subs.length > 0 && (
                      <span className="text-[10px] text-slate-400">
                        {subs.filter((s) => s.completed).length}/{subs.length}
                      </span>
                    )}
                  </div>
                </div>
                {subs.length > 0 && (
                  <button
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    className="p-2 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={isExpanded ? 'Alt görevleri kapat' : 'Alt görevleri aç'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Görevi sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {isExpanded && subs.length > 0 && (
                <div className="mt-3 pl-9 space-y-2 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                  {subs.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleSubtask?.(task.id, s.id)}
                        className={`w-6 h-6 sm:w-4 sm:h-4 rounded border flex items-center justify-center flex-shrink-0 touch-manipulation ${s.completed ? 'bg-green-500 border-green-600' : 'border-slate-300 dark:border-slate-600'}`}
                      >
                        {s.completed && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </button>
                      <span className={`text-xs flex-1 ${s.completed ? 'line-through text-slate-400' : ''}`}>{sanitize(s.text)}</span>
                      <button
                        onClick={() => onDeleteSubtask?.(task.id, s.id)}
                        className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-red-500 touch-manipulation"
                        aria-label="Alt görevi sil"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskText[task.id] || ''}
                      onChange={(e) => setNewSubtaskText((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(task.id)}
                      placeholder="Alt görev ekle..."
                      className="flex-1 px-2 py-1 text-xs rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <button
                      onClick={() => handleAddSubtask(task.id)}
                      className="px-2 py-1 rounded bg-blue-500 text-white text-xs font-bold"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              )}

              {subs.length === 0 && (
                <div className="mt-2 pl-9">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskText[task.id] || ''}
                      onChange={(e) => setNewSubtaskText((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(task.id)}
                      placeholder="Alt görev ekle (checklist)"
                      className="flex-1 px-2 py-1 text-xs rounded border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <button
                      onClick={() => handleAddSubtask(task.id)}
                      className="px-2 py-1 rounded border-2 border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {tasksToShow.length === 0 && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm font-medium text-center py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              {tasks.length === 0 ? 'Yapılacak iş kalmadı! Yeni bir görev ekleyerek başla.' : 'Tüm görevler tamamlandı!'}
            </p>
            {completedTasks.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 py-2">
                <button
                  onClick={() => setShowCompleted(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
                >
                  <Eye className="w-4 h-4" />
                  Tamamlananları göster ({completedTasks.length})
                </button>
                <button
                  onClick={() => onClearCompleted?.()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Tamamlananları temizle
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
