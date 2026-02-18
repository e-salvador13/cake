'use client';

import { useState } from 'react';
import { Task } from '@/lib/storage';
import VoiceInput from './VoiceInput';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  editable?: boolean;
}

export default function TaskList({ 
  tasks, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask,
  editable = true 
}: TaskListProps) {
  const [newTaskText, setNewTaskText] = useState('');

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

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-stone-700">Tasks</h3>
        <p className="text-sm text-stone-500">
          {tasks.filter(t => t.completed).length} of {tasks.length} complete
        </p>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {tasks.length === 0 ? (
          <p className="text-center text-stone-400 italic py-8">
            No tasks yet. Add one below!
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`
                group flex items-center gap-3 p-3 rounded-lg
                ${task.completed 
                  ? 'bg-green-50 border border-green-100' 
                  : 'bg-white border border-stone-100'
                }
                transition-all duration-200
              `}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggleTask(task.id)}
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200
                  ${task.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-stone-300 hover:border-amber-400'
                  }
                `}
              >
                {task.completed && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Task Text */}
              <span 
                className={`
                  flex-1 text-stone-700
                  ${task.completed ? 'line-through text-stone-400' : ''}
                `}
              >
                {task.text}
              </span>

              {/* Delete Button */}
              {editable && (
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="
                    opacity-0 group-hover:opacity-100
                    text-stone-400 hover:text-red-500
                    transition-all duration-200
                  "
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Task Form */}
      {editable && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a task..."
            className="
              flex-1 px-4 py-3 rounded-xl
              bg-white border border-stone-200
              text-stone-700 placeholder-stone-400
              focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent
              transition-all duration-200
            "
          />
          <VoiceInput onTranscript={handleVoiceInput} />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="
              px-4 py-3 rounded-xl
              bg-amber-400 text-white font-medium
              hover:bg-amber-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              shadow-sm hover:shadow-md
            "
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
}
