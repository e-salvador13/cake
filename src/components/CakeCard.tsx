'use client';

import { useState, useEffect } from 'react';
import { Week, formatDateRange, getCompletionPercentage } from '@/lib/storage';
import TaskList from './TaskList';

interface CakeCardProps {
  week: Week;
  onAddTask?: (text: string) => void;
  onToggleTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (taskId: string, newText: string) => void;
  size?: 'normal' | 'small' | 'archive';
  initialFlipped?: boolean;
  showStats?: boolean;
}

export default function CakeCard({ 
  week, 
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  size = 'normal',
  initialFlipped = false,
  showStats = false,
}: CakeCardProps) {
  const [isFlipped, setIsFlipped] = useState(initialFlipped);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const completionPercentage = getCompletionPercentage(week);
  const isComplete = completionPercentage === 100 && week.tasks.length > 0;
  const completedCount = week.tasks.filter(t => t.completed).length;
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-48 h-48 md:w-56 md:h-56';
      case 'archive':
        return 'w-full h-64 md:w-72 md:h-72';
      default:
        return 'w-[90vw] h-[90vw] max-w-[400px] max-h-[400px] md:w-96 md:h-96';
    }
  };

  const handleFlip = () => {
    if (size === 'normal' && isMobile) {
      // On mobile, expand to full screen instead of flip
      setIsMobileExpanded(true);
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  const handleClose = () => {
    setIsMobileExpanded(false);
    setIsFlipped(false);
  };

  // Mobile full-screen expanded view
  if (isMobileExpanded && size === 'normal') {
    return (
      <div className="fixed inset-0 z-50 bg-[#FDF6E3] animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{week.cakeEmoji}</span>
            <div>
              <p className="font-medium text-stone-700">{formatDateRange(week.startDate, week.endDate)}</p>
              <p className="text-sm text-stone-500">
                {completedCount} of {week.tasks.length} complete
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-3 rounded-full bg-white shadow-md text-stone-600 hover:text-stone-800 active:scale-95 transition-all touch-manipulation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Completion Progress Bar */}
        {week.tasks.length > 0 && (
          <div className="px-4 py-2">
            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-amber-400'}`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Task List */}
        <div className="flex-1 h-[calc(100vh-140px)] overflow-hidden">
          <TaskList
            tasks={week.tasks}
            onAddTask={onAddTask || (() => {})}
            onToggleTask={onToggleTask || (() => {})}
            onDeleteTask={onDeleteTask || (() => {})}
            onEditTask={onEditTask}
            editable={!!onAddTask || !!onEditTask || !!onDeleteTask}
            canAdd={!!onAddTask}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${getSizeClasses()} perspective-1000 cursor-pointer touch-manipulation`}
      onClick={handleFlip}
    >
      <div 
        className={`
          relative w-full h-full transition-transform duration-700 ease-out
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
            transition-all duration-300
            hover:shadow-xl hover:border-amber-200
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
              ${size === 'archive' ? 'text-5xl md:text-6xl' : size === 'small' ? 'text-6xl md:text-7xl' : 'text-7xl md:text-8xl lg:text-9xl'}
              mb-3 md:mb-4 select-none
              transition-transform duration-300
              ${isComplete ? 'animate-bounce' : 'hover:scale-110'}
            `}
          >
            {week.cakeEmoji}
          </span>
          
          {/* Date Range */}
          <p className={`
            ${size === 'archive' ? 'text-sm' : size === 'small' ? 'text-sm' : 'text-base md:text-lg'}
            font-medium text-stone-600 px-2 text-center
          `}>
            {formatDateRange(week.startDate, week.endDate)}
          </p>
          
          {/* Stats for Archive Cards */}
          {(showStats || size === 'archive') && week.tasks.length > 0 && (
            <div className="mt-2 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <span>{completedCount}/{week.tasks.length} tasks</span>
              </div>
              {/* Mini progress bar */}
              <div className="w-20 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-amber-400'}`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Completion Badge */}
          {week.tasks.length > 0 && (
            <div className={`
              mt-3 px-3 py-1.5 rounded-full
              ${size === 'small' || size === 'archive' ? 'text-xs' : 'text-sm md:text-base'}
              ${isComplete 
                ? 'bg-green-100 text-green-700 font-medium' 
                : 'bg-stone-100 text-stone-600'
              }
              transition-colors duration-300
            `}>
              {isComplete ? '🎉 Cake earned!' : `${completionPercentage}% done`}
            </div>
          )}
          
          {/* Tap hint - more prominent on mobile */}
          <div className={`
            absolute bottom-5 md:bottom-6 
            flex items-center gap-1
            ${size === 'small' || size === 'archive' ? 'text-xs' : 'text-sm md:text-base'}
            text-stone-400
            animate-pulse
          `}>
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>Tap to see tasks</span>
          </div>
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
          <div className="absolute inset-0 pointer-events-none opacity-50">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className="border-b border-amber-100" 
                style={{ marginTop: size === 'small' || size === 'archive' ? '1.5rem' : '2rem' }} 
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
              onEditTask={onEditTask}
              editable={!!onAddTask || !!onEditTask || !!onDeleteTask}
              canAdd={!!onAddTask}
              compact={size === 'small' || size === 'archive'}
            />
          </div>
          
          {/* Flip back button */}
          <button
            onClick={handleFlip}
            className="
              absolute top-3 right-3
              p-2 md:p-3 rounded-full
              bg-white/80 hover:bg-white active:bg-amber-50
              text-stone-500 hover:text-stone-700
              transition-all duration-200
              shadow-md active:scale-95
              touch-manipulation
            "
            title="Flip to front"
          >
            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
