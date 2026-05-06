import { TodayScreen } from '@/components/today/today-screen';
import { getHabitsForToday } from '../habits/actions';
import { getTodayStats, getTodayFinance, getXPData } from './actions';
import { getGoals } from '../goals/actions';
import { getStreakTrackers } from '../streaks/actions';
import { getWaterToday } from '../water/actions';

export default async function TodayPage() {
  const [habits, stats, finance, goals, xp, trackers, water] = await Promise.all([
    getHabitsForToday(),
    getTodayStats(),
    getTodayFinance(),
    getGoals(),
    getXPData(),
    getStreakTrackers(),
    getWaterToday(),
  ]);
  return <TodayScreen initialHabits={habits} stats={stats} finance={finance} goals={goals} xp={xp} initialTrackers={trackers} water={water} />;
}
