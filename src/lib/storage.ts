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

// Unique cakes for each week - assigned by week index for consistency
export const CAKE_COLLECTION = [
  { emoji: '🎂', name: 'Birthday Cake', color: 'pink' },
  { emoji: '🍰', name: 'Cake Slice', color: 'red' },
  { emoji: '🧁', name: 'Cupcake', color: 'purple' },
  { emoji: '🥮', name: 'Moon Cake', color: 'amber' },
  { emoji: '🍮', name: 'Flan', color: 'yellow' },
  { emoji: '🎁', name: 'Gift Box', color: 'blue' },
  { emoji: '🍩', name: 'Donut', color: 'orange' },
  { emoji: '🥧', name: 'Pie', color: 'brown' },
  { emoji: '🍪', name: 'Cookie', color: 'tan' },
  { emoji: '🍫', name: 'Chocolate', color: 'chocolate' },
];

// Get cake emoji by week number (consistent across sessions)
export function getCakeByWeekNumber(weekNumber: number): string {
  const index = weekNumber % CAKE_COLLECTION.length;
  return CAKE_COLLECTION[index].emoji;
}

// Calculate week number from a date (weeks since epoch, roughly)
export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7) + (date.getFullYear() * 52);
}

// Get a random cake emoji (fallback)
export function getRandomCakeEmoji(): string {
  return CAKE_COLLECTION[Math.floor(Math.random() * CAKE_COLLECTION.length)].emoji;
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

// Format date for archive headers (e.g., "January 2024")
export function formatMonthYear(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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

// Export data as JSON string
export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

// Import data from JSON string
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as CakeData;
    // Validate structure
    if (!data.weeks || !Array.isArray(data.weeks)) {
      throw new Error('Invalid data structure');
    }
    saveData(data);
    return true;
  } catch (e) {
    console.error('Failed to import data:', e);
    return false;
  }
}

// Generate shareable URL with week data encoded
export function generateShareUrl(week: Week): string {
  const shareData = {
    startDate: week.startDate,
    endDate: week.endDate,
    cakeEmoji: week.cakeEmoji,
    tasks: week.tasks.map(t => ({ text: t.text, completed: t.completed })),
  };
  const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}?share=${encoded}`;
}

// Parse shared week from URL
export function parseShareUrl(shareParam: string): Partial<Week> | null {
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(shareParam)));
    return {
      startDate: decoded.startDate,
      endDate: decoded.endDate,
      cakeEmoji: decoded.cakeEmoji,
      tasks: decoded.tasks.map((t: { text: string; completed: boolean }) => ({
        id: generateId(),
        text: t.text,
        completed: t.completed,
      })),
    };
  } catch (e) {
    console.error('Failed to parse share URL:', e);
    return null;
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
  
  // Create new week with consistent cake based on week number
  const weekNum = getWeekNumber(weekStart);
  const newWeek: Week = {
    id: generateId(),
    startDate: weekStartStr,
    endDate: getWeekEnd().toISOString().split('T')[0],
    cakeEmoji: getCakeByWeekNumber(weekNum),
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

// Edit a task's text
export function editTask(weekId: string, taskId: string, newText: string): Week | null {
  const data = loadData();
  const week = data.weeks.find(w => w.id === weekId);
  
  if (!week) return null;
  
  const task = week.tasks.find(t => t.id === taskId);
  if (task) {
    task.text = newText.trim();
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

// Group weeks by month for archive display
export function groupWeeksByMonth(weeks: Week[]): Map<string, Week[]> {
  const grouped = new Map<string, Week[]>();
  
  weeks.forEach(week => {
    const monthKey = formatMonthYear(week.startDate);
    const existing = grouped.get(monthKey) || [];
    existing.push(week);
    grouped.set(monthKey, existing);
  });
  
  return grouped;
}
