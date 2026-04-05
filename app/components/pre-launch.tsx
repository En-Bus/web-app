export function PreLaunch() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="space-y-8">
        {/* The bus arrives */}
        <div className="text-6xl" aria-hidden="true">
          🚌
        </div>

        {/* The dramatic headline */}
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-widest text-neutral-400 uppercase">
            Every great journey begins with one person who said
          </p>
          <p className="text-2xl font-semibold italic text-neutral-600 sm:text-3xl">
            &ldquo;You should build this.&rdquo;
          </p>
        </div>

        {/* The star of the show */}
        <div className="space-y-4">
          <p className="text-sm font-medium tracking-widest text-brand-600 uppercase">
            This one&apos;s for
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight text-brand-800 sm:text-7xl">
            Kanimozhi
          </h1>
          <p className="text-lg text-neutral-500 italic">
            என் முதல் பயணி
          </p>
          <p className="text-sm text-neutral-400">
            My first passenger
          </p>
        </div>

        {/* The tease */}
        <div className="mx-auto max-w-md space-y-3 pt-4">
          <div className="h-px w-full bg-neutral-200" />
          <p className="text-base leading-7 text-neutral-600">
            <span className="font-semibold text-neutral-900">enbus.in</span> is
            almost ready to help Tamil Nadu find its buses.
          </p>
          <p className="text-sm text-neutral-400">
            2,200+ stops &middot; 93,000+ trips &middot; Launching soon
          </p>
        </div>
      </div>
    </main>
  );
}
