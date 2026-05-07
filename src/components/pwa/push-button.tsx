'use client';

import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}

export function PushButton() {
  const [state, setState] = useState<'loading' | 'unsupported' | 'subscribed' | 'unsubscribed'>('loading');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    navigator.serviceWorker.register('/sw-push.js').then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setState(sub ? 'subscribed' : 'unsubscribed');
      });
    });
  }, []);

  const subscribe = async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    setState('subscribed');
  };

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setState('unsubscribed');
  };

  if (state === 'loading' || state === 'unsupported') return null;

  return (
    <button
      onClick={state === 'subscribed' ? unsubscribe : subscribe}
      title={state === 'subscribed' ? 'Wyłącz powiadomienia' : 'Włącz powiadomienia'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 28, padding: '0 10px',
        background: state === 'subscribed'
          ? 'color-mix(in oklch, var(--lo-accent) 12%, transparent)'
          : 'var(--lo-surface-2)',
        color: state === 'subscribed' ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
        border: `1px solid ${state === 'subscribed' ? 'var(--lo-accent-line)' : 'var(--lo-border)'}`,
        borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {state === 'subscribed' ? '🔔 Powiadomienia włączone' : '🔕 Włącz powiadomienia'}
    </button>
  );
}
