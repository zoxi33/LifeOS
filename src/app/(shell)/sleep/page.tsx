import { SleepScreen } from '@/components/sleep/sleep-screen';
import { getSleepLogs } from './actions';

export default async function SleepPage() {
  const sleepDays = await getSleepLogs();
  return <SleepScreen initialDays={sleepDays} />;
}
