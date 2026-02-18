'use client';

import { useState, useRef, useEffect } from 'react';
import { Task } from '@/lib/storage';
import VoiceInput from './VoiceInput';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (taskId: string, newText: string) => void;
  editable?: boolean;
  canAdd?: boolean;
  compact?: boolean;
}

export default function TaskList({ 
  tasks, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask,
  onEditTask,
  editable = true,
  canAdd,
  compact = false,
}: TaskListProps) {
  // Default canAdd to editable if not specified
  const showAddForm = canAdd !== undefined ? canAdd : editable;
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTaskId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handleVoiceInput = (text: string) => {
    if (text.trim()) {
      onAddTask(text.trim());
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
  };

  const saveEdit = () => {
    if (editingTaskId && editText.trim() && onEditTask) {
      onEditTask(editingTaskId, editText.trim());
    }
    setEditingTaskId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className={`h-full flex flex-col ${compact ? 'p-4' : 'p-4 md:p-6'}`}>
      {/* Header */}
      <div className="text-center mb-3 md:mb-4">
        <h3 className={`${compact ? 'text-base' : 'text-lg'} font-medium text-stone-700`}>Tasks</h3>
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-stone-500`}>
          {tasks.filter(t => t.completed).length} of {tasks.length} complete
        </p>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 md:mb-4">
        {tasks.length === 0 ? (
          <p className={`text-center text-stone-400 italic ${compact ? 'py-4 text-sm' : 'py-8'}`}>
            No tasks yet. Add one below!
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`
                group flex items-center gap-2 md:gap-3 
                ${compact ? 'p-2' : 'p-3 md:p-4'} 
                rounded-xl
                ${task.completed 
                  ? 'bg-green-50 border border-green-100' 
                  : 'bg-white border border-stone-100'
                }
                transition-all duration-200
                touch-manipulation
              `}
            >
              {/* Checkbox - larger touch target */}
              <button
                onClick={() => onToggleTask(task.id)}
                className={`
                  ${compact ? 'w-6 h-6 min-w-[24px]' : 'w-8 h-8 min-w-[32px] md:w-6 md:h-6 md:min-w-[24px]'}
                  rounded-full border-2 flex items-center justify-center
                  transition-all duration-200
                  ${task.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-stone-300 hover:border-amber-400 active:scale-95'
                  }
                `}
              >
                {task.completed && (
                  <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4 md:w-3 md:h-3'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Task Text or Edit Input */}
              {editingTaskId === task.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={saveEdit}
                    className={`
                      flex-1 px-2 py-1 rounded-lg
                      bg-amber-50 border border-amber-200
                      text-stone-700
                      focus:outline-none focus:ring-2 focus:ring-amber-300
                      ${compact ? 'text-sm' : 'text-base'}
                    `}
                  />
                </div>
              ) : (
                <span 
                  className={`
                    flex-1 ${compact ? 'text-sm' : 'text-base md:text-lg'}
                    ${task.completed ? 'line-through text-stone-400' : 'text-stone-700'}
                  `}
                >
                  {task.text}
                </span>
              )}

              {/* Action Buttons - Always visible */}
              {editable && editingTaskId !== task.id && (
                <div className="flex items-center gap-2">
                  {/* Edit Button */}
                  {onEditTask && (
                    <button
                      onClick={() => startEditing(task)}
                      className={`
                        ${compact ? 'w-8 h-8' : 'w-10 h-10'}
                        flex items-center justify-center
                        bg-amber-100 text-amber-600
                        hover:bg-amber-200 active:bg-amber-300 active:scale-95
                        transition-all duration-200
                        rounded-lg
                        touch-manipulation
                      `}
                      title="Edit task"
                    >
                      <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className={`
                      ${compact ? 'w-8 h-8' : 'w-10 h-10'}
                      flex items-center justify-center
                      bg-red-100 text-red-500
                      hover:bg-red-200 active:bg-red-300 active:scale-95
                      transition-all duration-200
                      rounded-lg
                      touch-manipulation
                    `}
                    title="Delete task"
                  >
                    <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a task..."
            className={`
              flex-1 px-4 ${compact ? 'py-2 text-sm' : 'py-3 md:py-4 text-base'}
              rounded-xl
              bg-white border border-stone-200
              text-stone-700 placeholder-stone-400
              focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent
              transition-all duration-200
            `}
          />
          <VoiceInput onTranscript={handleVoiceInput} />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className={`
              px-4 ${compact ? 'py-2 text-sm' : 'py-3 md:py-4'}
              rounded-xl
              bg-amber-400 text-white font-medium
              hover:bg-amber-500 active:bg-amber-600 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              shadow-sm hover:shadow-md
              touch-manipulation
            `}
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
}
