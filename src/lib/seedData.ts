import { Week, Task, generateId, saveData, loadData } from './storage';

// Historical cake data transcribed from photos
export const historicalCakes: Week[] = [
  {
    id: generateId(),
    startDate: '2026-01-12',
    endDate: '2026-01-16',
    cakeEmoji: '🎂',
    tasks: [
      { id: generateId(), text: 'Send Regional Manager Email (includes PM 13+)', completed: true },
      { id: generateId(), text: 'Get 3 CSMs (like Monica, NC) with the program to handle/document cases', completed: true },
      { id: generateId(), text: 'Curate new list of required compliance issues, rep entries to delta (H5012)', completed: true },
      { id: generateId(), text: 'Soft doubt emails after Bloom 15', completed: true },
    ],
  },
  {
    id: generateId(),
    startDate: '2026-01-19',
    endDate: '2026-01-24',
    cakeEmoji: '🍰',
    tasks: [
      { id: generateId(), text: 'Send WB/GoldOaks Regional Manager Emails', completed: true },
      { id: generateId(), text: 'Create Baseball views on Metabase', completed: true },
      { id: generateId(), text: 'Find and turn on IPO properties integrations', completed: false },
      { id: generateId(), text: 'Identify properties but clarify what to do next', completed: false },
    ],
  },
  {
    id: generateId(),
    startDate: '2026-01-26',
    endDate: '2026-01-30',
    cakeEmoji: '🧁',
    tasks: [
      { id: generateId(), text: 'Send 25,000 Bug Free emails to users missing from PS', completed: true },
      { id: generateId(), text: 'Make heartbeat chart publicly published', completed: true },
      { id: generateId(), text: 'Figure out if we can pull property list (w/ ownership info) from Yardi - force API call', completed: true },
      { id: generateId(), text: 'Make User loved now in heartbeat', completed: true },
    ],
  },
  {
    id: generateId(),
    startDate: '2026-02-02',
    endDate: '2026-02-06',
    cakeEmoji: '🎂',
    tasks: [
      { id: generateId(), text: 'Send 70k emails to PHA + Leads audience currently excluded from Yardi', completed: true },
      { id: generateId(), text: 'Use the HB chart to read all 5 beds on PS', completed: true },
      { id: generateId(), text: 'Add change log to HBeloved + brief priority ranking for ships', completed: true },
      { id: generateId(), text: '#5 footprints why ToC', completed: true },
    ],
  },
];

// Seed historical data into localStorage
export function seedHistoricalData(): void {
  const data = loadData();
  
  // Check if we already have historical data
  const hasHistory = data.weeks.some(w => w.startDate === '2026-01-12');
  if (hasHistory) {
    console.log('Historical data already exists');
    return;
  }
  
  // Add historical weeks (oldest first, they'll be sorted by date)
  const allWeeks = [...data.weeks, ...historicalCakes];
  
  // Sort by date descending (newest first)
  allWeeks.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  saveData({ weeks: allWeeks });
  console.log('Historical data seeded!');
}
