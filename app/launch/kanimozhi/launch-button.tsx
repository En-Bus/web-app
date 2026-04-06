'use client';

import { useState } from 'react';
import { launchSite } from './actions';

type Phase = 'ready' | 'launching' | 'launched' | 'error';

export function LaunchButton() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [message, setMessage] = useState('');

  async function handleLaunch() {
    setPhase('launching');
    const result = await launchSite();
    if (result.success) {
      setPhase('launched');
      setMessage(result.message);
    } else {
      setPhase('error');
      setMessage(result.message);
    }
  }

  if (phase === 'launched') {
    return (
      <div className="space-y-6 text-center">
        <div className="text-6xl" aria-hidden="true">
          🎉
        </div>
        <h2 className="text-3xl font-bold text-brand-800 sm:text-4xl">
          enbus.in is live!
        </h2>
        <p className="text-lg text-neutral-600">
          You just launched it, Kanimozhi.
        </p>
        <p className="text-sm text-neutral-400">
          Go see it —{' '}
          <a
            href="https://enbus.in"
            className="font-medium text-brand-600 underline underline-offset-2"
          >
            enbus.in
          </a>
        </p>
      </div>
    );
  }

  if (phase === 'launching') {
    return (
      <div className="space-y-6 text-center">
        <div className="text-5xl animate-bounce" aria-hidden="true">
          🚀
        </div>
        <p className="text-xl font-semibold text-brand-800 animate-pulse">
          Launching enbus.in...
        </p>
        <p className="text-sm text-neutral-400">
          This is really happening!
        </p>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-red-600">{message}</p>
        <button
          onClick={handleLaunch}
          className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLaunch}
      className="group relative rounded-2xl bg-brand-600 px-12 py-5 text-lg font-bold text-white shadow-lg transition-all hover:bg-brand-700 hover:shadow-xl hover:scale-105 active:scale-95"
    >
      <span className="relative z-10">Launch enbus.in</span>
    </button>
  );
}
