import { StatsScreen } from '@/components/stats/stats-screen';
import { getStatsData } from './actions';

export default async function StatsPage() {
  const data = await getStatsData();
  return <StatsScreen data={data} />;
}
