import Link from 'next/link';
import Image from 'next/image';

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2 sm:px-6">
        <Link href="/" aria-label="enbus TN Bus Finder — home">
          <Image
            src="/logo.png"
            alt="enbus TN Bus Finder"
            width={48}
            height={48}
            priority
          />
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-5 text-sm text-neutral-600">
            <li>
              <Link href="/search" className="hover:text-neutral-900 transition-colors">
                Search
              </Link>
            </li>
            <li>
              <Link href="/bus" className="hover:text-neutral-900 transition-colors">
                Routes
              </Link>
            </li>
            <li>
              <Link href="/contribute" className="hover:text-neutral-900 transition-colors">
                Contribute
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-neutral-900 transition-colors">
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
