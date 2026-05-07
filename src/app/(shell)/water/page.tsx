import { WaterHistoryScreen } from '@/components/water/water-history-screen';
import { getWaterToday, getWaterHistory } from './actions';

export default async function WaterPage() {
  const [history, today] = await Promise.all([getWaterHistory(30), getWaterToday()]);
  return <WaterHistoryScreen history={history} todayLog={today} />;
}
