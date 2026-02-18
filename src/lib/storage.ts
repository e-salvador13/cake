// Types
export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Week {
  id: string;
  startDate: string;
  endDate: string;
  cakeEmoji: string;
  tasks: Task[];
}

export interface CakeData {
  weeks: Week[];
}

const STORAGE_KEY = 'cake-tracker-data';

const CAKE_EMOJIS = ['🎂', '🍰', '🧁', '🥮', '🍮', '🎁'];

// Get a random cake emoji
export function getRandomCakeEmoji(): string {
  return CAKE_EMOJIS[Math.floor(Math.random() * CAKE_EMOJIS.length)];
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get Monday of the current week
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get Friday of the current week
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 4); // Monday + 4 = Friday
  return end;
}

// Format date range for display
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', options);
  const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

// Load data from localStorage
export function loadData(): CakeData {
  if (typeof window === 'undefined') {
    return { weeks: [] };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  
  return { weeks: [] };
}

// Save data to localStorage
export function saveData(data: CakeData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

// Get or create the current week
export function getCurrentWeek(): Week {
  const data = loadData();
  const weekStart = getWeekStart();
  const weekStartStr = weekStart.toISOString().split('T')[0];
  
  // Find existing week
  const existingWeek = data.weeks.find(w => w.startDate === weekStartStr);
  if (existingWeek) {
    return existingWeek;
  }
  
  // Create new week
  const newWeek: Week = {
    id: generateId(),
    startDate: weekStartStr,
    endDate: getWeekEnd().toISOString().split('T')[0],
    cakeEmoji: getRandomCakeEmoji(),
    tasks: [],
  };
  
  data.weeks.unshift(newWeek);
  saveData(data);
  
  return newWeek;
}

// Update a week
export function updateWeek(week: Week): void {
  const data = loadData();
  const index = data.weeks.findIndex(w => w.id === week.id);
  
  if (index >= 0) {
    data.weeks[index] = week;
  } else {
    data.weeks.unshift(week);
  }
  
  saveData(data);
}

// Add a task to the current week
export function addTask(text: string): Week {
  const week = getCurrentWeek();
  const newTask: Task = {
    id: generateId(),
    text: text.trim(),
    completed: false,
  };
  
  week.tasks.push(newTask);
  updateWeek(week);
  
  return week;
}

// Toggle task completion
export function toggleTask(weekId: string, taskId: string): Week | null {
  const data = loadData();
  const week = data.weeks.find(w => w.id === weekId);
  
  if (!week) return null;
  
  const task = week.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    updateWeek(week);
  }
  
  return week;
}

// Delete a task
export function deleteTask(weekId: string, taskId: string): Week | null {
  const data = loadData();
  const week = data.weeks.find(w => w.id === weekId);
  
  if (!week) return null;
  
  week.tasks = week.tasks.filter(t => t.id !== taskId);
  updateWeek(week);
  
  return week;
}

// Get all weeks (for archive)
export function getAllWeeks(): Week[] {
  const data = loadData();
  // Ensure current week exists
  getCurrentWeek();
  // Return fresh data
  return loadData().weeks;
}

// Get completion percentage
export function getCompletionPercentage(week: Week): number {
  if (week.tasks.length === 0) return 0;
  const completed = week.tasks.filter(t => t.completed).length;
  return Math.round((completed / week.tasks.length) * 100);
}
