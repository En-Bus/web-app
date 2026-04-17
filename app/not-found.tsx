import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-4 text-neutral-600">
        The route you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 space-y-3">
        <Link
          href="/"
          className="inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Search Bus Routes
        </Link>
        <p className="text-sm text-neutral-500 mt-4">Popular routes:</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {[
            "chennai-to-madurai",
            "chennai-to-coimbatore",
            "bangalore-to-chennai",
            "trichy-to-salem",
            "madurai-to-kodaikanal",
          ].map((slug) => (
            <Link
              key={slug}
              href={`/bus/${slug}`}
              className="text-sm text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              {slug
                .replace(/-to-/g, " → ")
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
