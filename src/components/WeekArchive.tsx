'use client';

import { Week, getCompletionPercentage, groupWeeksByMonth } from '@/lib/storage';
import CakeCard from './CakeCard';

interface WeekArchiveProps {
  weeks: Week[];
  currentWeekId: string;
  onToggleTask?: (weekId: string, taskId: string) => void;
  onDeleteTask?: (weekId: string, taskId: string) => void;
  onEditTask?: (weekId: string, taskId: string, newText: string) => void;
}

export default function WeekArchive({ 
  weeks, 
  currentWeekId,
  onToggleTask,
  onDeleteTask,
  onEditTask,
}: WeekArchiveProps) {
  // Filter out current week and get past weeks
  const pastWeeks = weeks.filter(w => w.id !== currentWeekId);

  if (pastWeeks.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-xl text-stone-500 mb-2">No past weeks yet</p>
        <p className="text-stone-400">
          Complete this week and come back next Monday!
        </p>
      </div>
    );
  }

  // Group weeks by month
  const groupedWeeks = groupWeeksByMonth(pastWeeks);
  const monthEntries = Array.from(groupedWeeks.entries());

  return (
    <div className="space-y-12">
      {monthEntries.map(([monthYear, monthWeeks]) => {
        // Calculate month stats
        const totalTasks = monthWeeks.reduce((sum, w) => sum + w.tasks.length, 0);
        const completedTasks = monthWeeks.reduce((sum, w) => sum + w.tasks.filter(t => t.completed).length, 0);
        const completedWeeks = monthWeeks.filter(w => getCompletionPercentage(w) === 100 && w.tasks.length > 0).length;
        
        return (
          <div key={monthYear} className="relative">
            {/* Month Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-2">
              <h3 className="text-xl md:text-2xl font-semibold text-stone-700">
                {monthYear}
              </h3>
              <div className="flex items-center gap-4 text-sm text-stone-500">
                <span className="flex items-center gap-1">
                  <span className="text-lg">📅</span>
                  {monthWeeks.length} {monthWeeks.length === 1 ? 'week' : 'weeks'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-lg">✅</span>
                  {completedTasks}/{totalTasks} tasks
                </span>
                {completedWeeks > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="text-lg">🎂</span>
                    {completedWeeks} {completedWeeks === 1 ? 'cake' : 'cakes'} earned
                  </span>
                )}
              </div>
            </div>
            
            {/* Decorative line */}
            <div className="absolute left-0 right-0 top-12 md:top-8 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
            
            {/* Week Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center pt-4">
              {monthWeeks.map((week) => {
                const percentage = getCompletionPercentage(week);
                const isComplete = percentage === 100 && week.tasks.length > 0;
                
                return (
                  <div 
                    key={week.id} 
                    className={`
                      w-full max-w-xs
                      transition-all duration-300
                      ${isComplete ? 'hover:scale-105' : 'hover:scale-102'}
                    `}
                  >
                    <CakeCard
                      week={week}
                      size="archive"
                      showStats
                      onToggleTask={onToggleTask ? (taskId) => onToggleTask(week.id, taskId) : undefined}
                      onDeleteTask={onDeleteTask ? (taskId) => onDeleteTask(week.id, taskId) : undefined}
                      onEditTask={onEditTask ? (taskId, newText) => onEditTask(week.id, taskId, newText) : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {/* Overall Archive Stats */}
      <div className="mt-8 pt-8 border-t border-stone-200">
        <div className="text-center">
          <p className="text-stone-400 text-sm mb-4">Archive Summary</p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-stone-600">
            <Stat 
              label="Total Weeks" 
              value={pastWeeks.length} 
              emoji="📆" 
            />
            <Stat 
              label="Tasks Completed" 
              value={pastWeeks.reduce((sum, w) => sum + w.tasks.filter(t => t.completed).length, 0)} 
              emoji="✅" 
            />
            <Stat 
              label="Cakes Earned" 
              value={pastWeeks.filter(w => getCompletionPercentage(w) === 100 && w.tasks.length > 0).length} 
              emoji="🎂" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl mb-1">{emoji}</span>
      <span className="text-2xl md:text-3xl font-bold text-stone-700">{value}</span>
      <span className="text-sm text-stone-500">{label}</span>
    </div>
  );
}
