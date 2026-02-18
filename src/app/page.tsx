'use client';

import { useState, useEffect, useCallback } from 'react';
import { Week, getCurrentWeek, getAllWeeks, addTask, toggleTask, deleteTask } from '@/lib/storage';
import { seedHistoricalData } from '@/lib/seedData';
import CakeCard from '@/components/CakeCard';
import WeekArchive from '@/components/WeekArchive';

export default function Home() {
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null);
  const [allWeeks, setAllWeeks] = useState<Week[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    // Seed historical data on first load
    seedHistoricalData();
    
    const week = getCurrentWeek();
    setCurrentWeek(week);
    setAllWeeks(getAllWeeks());
    setIsLoading(false);
  }, []);

  const handleAddTask = useCallback((text: string) => {
    const updatedWeek = addTask(text);
    setCurrentWeek(updatedWeek);
    setAllWeeks(getAllWeeks());
  }, []);

  const handleToggleTask = useCallback((taskId: string) => {
    if (!currentWeek) return;
    const updatedWeek = toggleTask(currentWeek.id, taskId);
    if (updatedWeek) {
      setCurrentWeek(updatedWeek);
      setAllWeeks(getAllWeeks());
    }
  }, [currentWeek]);

  const handleDeleteTask = useCallback((taskId: string) => {
    if (!currentWeek) return;
    const updatedWeek = deleteTask(currentWeek.id, taskId);
    if (updatedWeek) {
      setCurrentWeek(updatedWeek);
      setAllWeeks(getAllWeeks());
    }
  }, [currentWeek]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-bounce">🎂</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-stone-800 mb-2">
          Cake <span className="inline-block animate-pulse">🎂</span>
        </h1>
        <p className="text-stone-500 text-lg">
          Complete your tasks, earn your cake!
        </p>
      </header>

      {/* Current Week Card */}
      <section className="flex justify-center mb-16">
        {currentWeek && (
          <CakeCard
            week={currentWeek}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            initialFlipped={false}
          />
        )}
      </section>

      {/* Archive Section */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-stone-700 text-center mb-8">
          Past Weeks
        </h2>
        {currentWeek && (
          <WeekArchive 
            weeks={allWeeks} 
            currentWeekId={currentWeek.id} 
          />
        )}
      </section>

      {/* Footer */}
      <footer className="text-center mt-16 pb-8">
        <p className="text-stone-400 text-sm">
          Made with 🍰 for weekly cake meetings
        </p>
      </footer>
    </main>
  );
}
