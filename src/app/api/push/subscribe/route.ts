import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const sub = await req.json();
  if (!sub?.endpoint) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const sb = await createClient();
  await sb.from('push_subscriptions').upsert({
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  }, { onConflict: 'endpoint' });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json();
  if (!endpoint) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const sb = await createClient();
  await sb.from('push_subscriptions').delete().eq('endpoint', endpoint);

  return NextResponse.json({ ok: true });
}
