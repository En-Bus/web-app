import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-base font-semibold tracking-tight text-neutral-900">
          enbus.in
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-4 text-sm text-neutral-700">
            <li>
              <Link href="/" className="hover:text-neutral-900">
                Home
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-neutral-900">
                Search
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
