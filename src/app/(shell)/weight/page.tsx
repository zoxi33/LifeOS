import { WeightScreen } from '@/components/weight/weight-screen';
import { getWeightLogs } from './actions';

export default async function WeightPage() {
  const { entries, rawPoints } = await getWeightLogs();
  return <WeightScreen initialEntries={entries} rawPoints={rawPoints} />;
}
