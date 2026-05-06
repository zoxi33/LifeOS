import { getAchievementsData } from './actions';
import { AchievementsScreen } from '@/components/achievements/achievements-screen';

export default async function AchievementsPage() {
  const data = await getAchievementsData();
  return <AchievementsScreen data={data} />;
}
