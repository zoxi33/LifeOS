import { DailyScreen } from '@/components/daily/daily-screen';
import { getWeekData } from './actions';

export default async function DailyPage() {
  const { week, checklistDefs } = await getWeekData(0);
  return <DailyScreen initialWeek={week} initialChecklistDefs={checklistDefs} weekOffset={0} />;
}
