'use client';

import { useState } from 'react';
import { Week, formatDateRange, getCompletionPercentage } from '@/lib/storage';
import TaskList from './TaskList';

interface CakeCardProps {
  week: Week;
  onAddTask?: (text: string) => void;
  onToggleTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  size?: 'normal' | 'small';
  initialFlipped?: boolean;
}

export default function CakeCard({ 
  week, 
  onAddTask,
  onToggleTask,
  onDeleteTask,
  size = 'normal',
  initialFlipped = false
}: CakeCardProps) {
  const [isFlipped, setIsFlipped] = useState(initialFlipped);
  const completionPercentage = getCompletionPercentage(week);
  const isComplete = completionPercentage === 100 && week.tasks.length > 0;
  
  const cardSize = size === 'small' 
    ? 'w-48 h-48 md:w-56 md:h-56' 
    : 'w-80 h-80 md:w-96 md:h-96';

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`${cardSize} perspective-1000 cursor-pointer`}
      onClick={handleFlip}
    >
      <div 
        className={`
          relative w-full h-full transition-transform duration-700
          transform-style-3d
          ${isFlipped ? 'rotate-y-180' : ''}
        `}
      >
        {/* Front - Cake */}
        <div 
          className={`
            absolute w-full h-full backface-hidden
            bg-[#FDF6E3] rounded-2xl shadow-lg
            border-2 border-stone-200
            flex flex-col items-center justify-center
            ${isComplete ? 'ring-4 ring-green-300 ring-opacity-50' : ''}
          `}
        >
          {/* Decorative corner dots */}
          <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-amber-200" />
          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-200" />
          <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-amber-200" />
          <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-amber-200" />
          
          {/* Cake Emoji */}
          <span 
            className={`
              ${size === 'small' ? 'text-6xl md:text-7xl' : 'text-8xl md:text-9xl'}
              mb-4 select-none
              ${isComplete ? 'animate-bounce' : ''}
            `}
          >
            {week.cakeEmoji}
          </span>
          
          {/* Date Range */}
          <p className={`
            ${size === 'small' ? 'text-sm' : 'text-lg'}
            font-medium text-stone-600
          `}>
            {formatDateRange(week.startDate, week.endDate)}
          </p>
          
          {/* Completion Badge */}
          {week.tasks.length > 0 && (
            <div className={`
              mt-3 px-3 py-1 rounded-full
              ${size === 'small' ? 'text-xs' : 'text-sm'}
              ${isComplete 
                ? 'bg-green-100 text-green-700' 
                : 'bg-stone-100 text-stone-600'
              }
            `}>
              {isComplete ? '🎉 Cake earned!' : `${completionPercentage}% done`}
            </div>
          )}
          
          {/* Tap hint */}
          <p className={`
            absolute bottom-6 
            ${size === 'small' ? 'text-xs' : 'text-sm'}
            text-stone-400
          `}>
            Tap to flip
          </p>
        </div>

        {/* Back - Tasks */}
        <div 
          className="
            absolute w-full h-full backface-hidden rotate-y-180
            bg-[#FDF6E3] rounded-2xl shadow-lg
            border-2 border-stone-200
            overflow-hidden
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lines like notebook paper */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="border-b border-amber-100" 
                style={{ marginTop: size === 'small' ? '2rem' : '2.5rem' }} 
              />
            ))}
          </div>
          
          {/* Content */}
          <div className="relative h-full" onClick={(e) => e.stopPropagation()}>
            <TaskList
              tasks={week.tasks}
              onAddTask={onAddTask || (() => {})}
              onToggleTask={onToggleTask || (() => {})}
              onDeleteTask={onDeleteTask || (() => {})}
              editable={!!onAddTask}
            />
          </div>
          
          {/* Flip back button */}
          <button
            onClick={handleFlip}
            className="
              absolute top-3 right-3
              p-2 rounded-full
              bg-white/80 hover:bg-white
              text-stone-500 hover:text-stone-700
              transition-all duration-200
              shadow-sm
            "
            title="Flip to front"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
