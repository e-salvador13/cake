'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Week, 
  getCurrentWeek, 
  getAllWeeks, 
  addTask, 
  toggleTask, 
  deleteTask,
  editTask,
  exportData,
  importData,
  generateShareUrl,
  parseShareUrl,
} from '@/lib/storage';
import { seedHistoricalData } from '@/lib/seedData';
import CakeCard from '@/components/CakeCard';
import WeekArchive from '@/components/WeekArchive';

export default function Home() {
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null);
  const [allWeeks, setAllWeeks] = useState<Week[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [sharedWeek, setSharedWeek] = useState<Partial<Week> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    // Check for shared week in URL
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    if (shareParam) {
      const parsed = parseShareUrl(shareParam);
      if (parsed) {
        setSharedWeek(parsed);
      }
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
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

  const handleEditTask = useCallback((taskId: string, newText: string) => {
    if (!currentWeek) return;
    const updatedWeek = editTask(currentWeek.id, taskId, newText);
    if (updatedWeek) {
      setCurrentWeek(updatedWeek);
      setAllWeeks(getAllWeeks());
    }
  }, [currentWeek]);

  // Handlers for any week (archive)
  const handleArchiveToggleTask = useCallback((weekId: string, taskId: string) => {
    const updatedWeek = toggleTask(weekId, taskId);
    if (updatedWeek) {
      setAllWeeks(getAllWeeks());
      // Also update current week if it was modified
      if (currentWeek && weekId === currentWeek.id) {
        setCurrentWeek(updatedWeek);
      }
    }
  }, [currentWeek]);

  const handleArchiveDeleteTask = useCallback((weekId: string, taskId: string) => {
    const updatedWeek = deleteTask(weekId, taskId);
    if (updatedWeek) {
      setAllWeeks(getAllWeeks());
      if (currentWeek && weekId === currentWeek.id) {
        setCurrentWeek(updatedWeek);
      }
    }
  }, [currentWeek]);

  const handleArchiveEditTask = useCallback((weekId: string, taskId: string, newText: string) => {
    const updatedWeek = editTask(weekId, taskId, newText);
    if (updatedWeek) {
      setAllWeeks(getAllWeeks());
      if (currentWeek && weekId === currentWeek.id) {
        setCurrentWeek(updatedWeek);
      }
    }
  }, [currentWeek]);

  // Export data as JSON file
  const handleExport = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cake-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('Data exported! 📦');
    setShowShareMenu(false);
  };

  // Import data from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importData(content)) {
        setCurrentWeek(getCurrentWeek());
        setAllWeeks(getAllWeeks());
        showMessage('Data imported successfully! 🎉');
      } else {
        showMessage('Failed to import data. Invalid format. ❌');
      }
    };
    reader.readAsText(file);
    setShowShareMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Share current week
  const handleShare = async () => {
    if (!currentWeek) return;
    const url = generateShareUrl(currentWeek);
    
    try {
      await navigator.clipboard.writeText(url);
      showMessage('Share link copied! 📋');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showMessage('Share link copied! 📋');
    }
    setShowShareMenu(false);
  };

  const showMessage = (msg: string) => {
    setShareMessage(msg);
    setTimeout(() => setShareMessage(null), 3000);
  };

  // Import shared week as template
  const handleImportShared = () => {
    if (!sharedWeek || !sharedWeek.tasks) return;
    sharedWeek.tasks.forEach((task) => {
      if (task.text) {
        addTask(task.text);
      }
    });
    setCurrentWeek(getCurrentWeek());
    setAllWeeks(getAllWeeks());
    setSharedWeek(null);
    showMessage('Tasks imported to current week! 🎉');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-stone-50">
        <div className="text-6xl animate-bounce">🎂</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 md:py-12 bg-gradient-to-b from-amber-50 to-stone-50">
      {/* Toast Message */}
      {shareMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-stone-800 text-white px-6 py-3 rounded-full shadow-lg">
            {shareMessage}
          </div>
        </div>
      )}

      {/* Shared Week Banner */}
      {sharedWeek && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <span className="text-5xl">{sharedWeek.cakeEmoji}</span>
            </div>
            <h3 className="text-xl font-semibold text-stone-800 text-center mb-2">
              Shared Week
            </h3>
            <p className="text-stone-500 text-center mb-4">
              Someone shared their tasks with you! Import them to your current week?
            </p>
            <div className="bg-stone-50 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
              {sharedWeek.tasks?.map((task, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className={task.completed ? 'text-green-500' : 'text-stone-300'}>
                    {task.completed ? '✓' : '○'}
                  </span>
                  <span className={task.completed ? 'line-through text-stone-400' : 'text-stone-700'}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSharedWeek(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleImportShared}
                className="flex-1 px-4 py-3 rounded-xl bg-amber-400 text-white font-medium hover:bg-amber-500 transition-all"
              >
                Import Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-stone-800 mb-2">
          Cake <span className="inline-block animate-pulse">🎂</span>
        </h1>
        <p className="text-stone-500 text-lg">
          Complete your tasks, earn your cake!
        </p>
      </header>

      {/* Share/Export Menu */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share & Export
          </button>
          
          {showShareMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowShareMenu(false)}
              />
              <div className="absolute top-full mt-2 right-0 md:left-1/2 md:-translate-x-1/2 z-20 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden min-w-[200px] animate-slide-down">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 text-left transition-colors"
                >
                  <span className="text-lg">🔗</span>
                  <span className="text-stone-700">Copy Share Link</span>
                </button>
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 text-left transition-colors border-t border-stone-100"
                >
                  <span className="text-lg">📥</span>
                  <span className="text-stone-700">Export All Data</span>
                </button>
                <label className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 text-left transition-colors border-t border-stone-100 cursor-pointer">
                  <span className="text-lg">📤</span>
                  <span className="text-stone-700">Import Data</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Current Week Card */}
      <section className="flex justify-center mb-12 md:mb-16">
        {currentWeek && (
          <CakeCard
            week={currentWeek}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            initialFlipped={false}
          />
        )}
      </section>

      {/* Archive Section */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold text-stone-700 text-center mb-8">
          Past Weeks 📚
        </h2>
        {currentWeek && (
          <WeekArchive 
            weeks={allWeeks} 
            currentWeekId={currentWeek.id}
            onToggleTask={handleArchiveToggleTask}
            onDeleteTask={handleArchiveDeleteTask}
            onEditTask={handleArchiveEditTask}
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
