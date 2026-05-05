import { DailyScreen } from '@/components/daily/daily-screen';
import { getWeekData } from './actions';

export default async function DailyPage() {
  const week = await getWeekData(0);
  return <DailyScreen initialWeek={week} weekOffset={0} />;
}
