import { StreaksSection } from '@/components/streaks/streaks-section';
import { getStreakTrackers } from './actions';

export default async function StreaksPage() {
  const trackers = await getStreakTrackers();
  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
      <StreaksSection initialTrackers={trackers} />
    </div>
  );
}
