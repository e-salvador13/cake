'use client';

import { Week } from '@/lib/storage';
import CakeCard from './CakeCard';

interface WeekArchiveProps {
  weeks: Week[];
  currentWeekId: string;
}

export default function WeekArchive({ weeks, currentWeekId }: WeekArchiveProps) {
  // Filter out current week and get past weeks
  const pastWeeks = weeks.filter(w => w.id !== currentWeekId);

  if (pastWeeks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-stone-400 mb-2">No past weeks yet</p>
        <p className="text-stone-400">
          Complete this week and come back next Monday!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
      {pastWeeks.map((week) => (
        <CakeCard
          key={week.id}
          week={week}
          size="small"
        />
      ))}
    </div>
  );
}
