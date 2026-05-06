import { WaterHistoryScreen } from '@/components/water/water-history-screen';
import { getWaterToday } from './actions';
import { createClient } from '@/lib/supabase/server';

async function getWaterHistory() {
  const sb = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 27);
  const { data } = await sb
    .from('water_logs')
    .select('date, ml, target_ml')
    .gte('date', since.toISOString().slice(0, 10))
    .order('date', { ascending: false });
  return data ?? [];
}

export default async function WaterPage() {
  const [history, today] = await Promise.all([getWaterHistory(), getWaterToday()]);
  return <WaterHistoryScreen history={history} todayLog={today} />;
}
