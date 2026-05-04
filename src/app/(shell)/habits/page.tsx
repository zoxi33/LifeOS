import { HabitsScreen } from '@/components/habits/habits-screen';
import { getHabitsList } from './actions';

export default async function HabitsPage() {
  const habits = await getHabitsList();
  return <HabitsScreen initialHabits={habits} />;
}
