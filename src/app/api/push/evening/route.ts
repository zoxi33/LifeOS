// Wieczorne powiadomienie — podsumowanie nawyków z dziś
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_MAILTO!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sb = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: habits }, { data: logs }] = await Promise.all([
    sb.from('habits').select('id, name').eq('active', true),
    sb.from('habit_logs').select('habit_id, done').eq('date', today),
  ]);

  const total = habits?.length ?? 0;
  const done = (logs ?? []).filter(l => l.done).length;
  const remaining = total - done;

  let title: string;
  let body: string;

  if (total === 0) {
    title = 'Dobry wieczór!';
    body = 'Nie masz jeszcze żadnych nawyków. Zacznij od jednego!';
  } else if (remaining === 0) {
    title = `Idealny dzień! 🏆`;
    body = `Wszystkie ${total} nawyki ukończone. Niesamowite!`;
  } else if (done === 0) {
    title = `Jeszcze nic dziś 💪`;
    body = `Masz ${total} nawyków na dziś — jeszcze nie za późno!`;
  } else {
    const pct = Math.round((done / total) * 100);
    title = `Dziś: ${done}/${total} nawyków ✓`;
    const undonNames = (habits ?? [])
      .filter(h => !(logs ?? []).find(l => l.habit_id === h.id && l.done))
      .map(h => h.name)
      .slice(0, 3)
      .join(', ');
    body = `${pct}% ukończone. Brakuje: ${undonNames}`;
  }

  const { data: subs } = await sb.from('push_subscriptions').select('endpoint, p256dh, auth');
  if (!subs?.length) return NextResponse.json({ sent: 0 });

  const payload = JSON.stringify({ title, body, icon: '/icons/icon-192.png', url: '/habits' });
  let sent = 0;

  await Promise.allSettled(subs.map(async s => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
      sent++;
    } catch {
      await sb.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
    }
  }));

  return NextResponse.json({ sent });
}
