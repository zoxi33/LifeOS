import { DailyScreen } from '@/components/daily/daily-screen';
import { getWeekData } from './actions';
import { getStreakTrackers } from '../streaks/actions';

export default async function DailyPage() {
  const [{ week, checklistDefs, streakCounts }, trackers] = await Promise.all([
    getWeekData(0),
    getStreakTrackers(),
  ]);
  return (
    <DailyScreen
      initialWeek={week}
      initialChecklistDefs={checklistDefs}
      initialStreakCounts={streakCounts}
      weekOffset={0}
      initialTrackers={trackers}
    />
  );
}
