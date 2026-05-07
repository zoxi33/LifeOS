// Poranne powiadomienie o śnie — sprawdza czy wczorajszy sen był zalogowany
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(req: NextRequest) {
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sb = await createClient();

  // Sprawdź czy wczoraj był zalogowany sen
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  const { data: sleepLog } = await sb
    .from('sleep_logs')
    .select('hours, quality')
    .eq('date', yStr)
    .maybeSingle();

  let title: string;
  let body: string;

  if (!sleepLog) {
    title = 'Dzień dobry! 🌅';
    body = 'Nie zapomniałeś zalogować snu z zeszłej nocy?';
  } else {
    const h = sleepLog.hours ?? 0;
    const q = sleepLog.quality ?? 0;
    const emoji = h >= 7.5 ? '😴✅' : h >= 6 ? '😐' : '😵';
    title = `Dzień dobry! ${emoji}`;
    body = `Ostatnia noc: ${h}h snu, jakość ${q}/5. Dobrego dnia!`;
  }

  const { data: subs } = await sb.from('push_subscriptions').select('endpoint, p256dh, auth');
  if (!subs?.length) return NextResponse.json({ sent: 0 });

  const payload = JSON.stringify({ title, body, icon: '/icons/icon-192.png', url: '/sleep' });
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
