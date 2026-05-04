import { TodayScreen } from '@/components/today/today-screen';
import { getHabitsForToday } from '../habits/actions';
import { getTodayStats, getTodayFinance } from './actions';
import { getGoals } from '../goals/actions';

export default async function TodayPage() {
  const [habits, stats, finance, goals] = await Promise.all([
    getHabitsForToday(),
    getTodayStats(),
    getTodayFinance(),
    getGoals(),
  ]);
  return <TodayScreen initialHabits={habits} stats={stats} finance={finance} goals={goals} />;
}
