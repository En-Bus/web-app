import Link from 'next/link';
import { BreadcrumbJsonLd, type BreadcrumbItem } from './json-ld';

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <>
      <BreadcrumbJsonLd items={items} />
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-3xl px-4 pt-4 sm:px-6"
      >
        <ol className="flex flex-wrap items-center gap-1 text-sm text-neutral-500">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.name} className="flex items-center gap-1">
                {index > 0 && (
                  <span aria-hidden="true" className="text-neutral-300">
                    /
                  </span>
                )}
                {isLast || !item.href ? (
                  <span className="text-neutral-700" aria-current={isLast ? 'page' : undefined}>
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-neutral-900 transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
