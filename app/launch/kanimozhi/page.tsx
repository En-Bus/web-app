import type { Metadata } from 'next';
import { LaunchButton } from './launch-button';

export const metadata: Metadata = {
  title: 'Launch Day',
  robots: { index: false, follow: false },
};

export default function LaunchPage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="space-y-10">
        {/* The buildup */}
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-widest text-neutral-400 uppercase">
            A secret page, just for you
          </p>
          <div className="text-5xl" aria-hidden="true">
            🚌
          </div>
        </div>

        {/* The recognition */}
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
            Hey Kanimozhi,
          </h1>
          <p className="mx-auto max-w-md text-lg leading-8 text-neutral-600">
            You were the first person to believe this app could help people
            find their bus. You were the first tester, the first critic,
            and the first fan.
          </p>
          <p className="text-lg font-medium text-neutral-700">
            So it&apos;s only right that <em>you</em> get to launch it.
          </p>
        </div>

        {/* The moment */}
        <div className="space-y-3 pt-4">
          <p className="text-sm text-neutral-400">
            When you press this button, enbus.in goes live for everyone in Tamil Nadu.
          </p>
          <p className="text-xs text-neutral-400">
            No pressure. Just... all of it.
          </p>
        </div>

        {/* THE BUTTON */}
        <div className="pt-2">
          <LaunchButton />
        </div>

        {/* Tamil dedication */}
        <div className="pt-8">
          <p className="text-sm italic text-neutral-400">
            என் முதல் பயணி, என் கடைசி நிறுத்தம்
          </p>
          <p className="mt-1 text-xs text-neutral-300">
            My first passenger, my last stop
          </p>
        </div>
      </div>
    </main>
  );
}
