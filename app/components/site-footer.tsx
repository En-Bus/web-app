import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Routes</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/bus" className="hover:text-neutral-900">
                  All inter-city routes
                </Link>
              </li>
              <li>
                <Link href="/city-bus" className="hover:text-neutral-900">
                  Chennai MTC routes
                </Link>
              </li>
              <li>
                <Link href="/buses-from/chennai" className="hover:text-neutral-900">
                  Buses from Chennai
                </Link>
              </li>
              <li>
                <Link href="/buses-from/bangalore" className="hover:text-neutral-900">
                  Buses from Bangalore
                </Link>
              </li>
              <li>
                <Link href="/buses-from/koyambedu" className="hover:text-neutral-900">
                  Buses from Koyambedu
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Popular</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/bus/chennai-to-madurai" className="hover:text-neutral-900">
                  Chennai to Madurai
                </Link>
              </li>
              <li>
                <Link href="/bus/chennai-to-trichy" className="hover:text-neutral-900">
                  Chennai to Trichy
                </Link>
              </li>
              <li>
                <Link href="/bus/chennai-to-coimbatore" className="hover:text-neutral-900">
                  Chennai to Coimbatore
                </Link>
              </li>
              <li>
                <Link href="/bus/bangalore-to-chennai" className="hover:text-neutral-900">
                  Bangalore to Chennai
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-sm font-semibold text-neutral-900">Info</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/about" className="hover:text-neutral-900">
                  About enbus.in
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-neutral-900">
                  Search
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-6">
          <p className="text-xs text-neutral-500">
            Data sourced from TNSTC, SETC, and MTC official schedules.
            Timetables are indicative and may vary.
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} enbus.in &middot; Free, no ads, no booking fees
          </p>
        </div>
      </div>
    </footer>
  );
}
