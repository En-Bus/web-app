import Link from 'next/link';

function BusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-brand-600"
    >
      <path d="M8 6v6" />
      <path d="M16 6v6" />
      <path d="M2 12h20" />
      <path d="M7 18h10" />
      <path d="M18 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
      <circle cx="7" cy="15" r="1" />
      <circle cx="17" cy="15" r="1" />
      <path d="M6 20v2" />
      <path d="M18 20v2" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-base font-bold tracking-tight text-slate-900"
        >
          <BusIcon />
          <span>
            enbus<span className="text-brand-600">.in</span>
          </span>
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-5 text-sm text-neutral-600">
            <li>
              <Link href="/" className="hover:text-neutral-900 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-neutral-900 transition-colors">
                Search
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
