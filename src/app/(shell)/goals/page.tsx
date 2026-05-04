import { GoalsScreen } from '@/components/goals/goals-screen';
import { getGoals } from './actions';

export default async function GoalsPage() {
  const goals = await getGoals();
  return <GoalsScreen initialGoals={goals} />;
}
