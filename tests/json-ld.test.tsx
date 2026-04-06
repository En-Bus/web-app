import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  JsonLd,
  WebSiteJsonLd,
  OrganizationJsonLd,
  BreadcrumbJsonLd,
  FAQJsonLd,
} from '../app/components/json-ld';

// ── Bug #1: Missing icon.svg in Organization schema ─────────────────
describe('OrganizationJsonLd (bug #1)', () => {
  it('references a logo URL', () => {
    const { container } = render(<OrganizationJsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const data = JSON.parse(script!.textContent!);
    expect(data.logo).toBeDefined();
    expect(data.logo).toContain('/icon.svg');
    // NOTE: Verify that public/icon.svg actually exists.
    // If it doesn't, Google will see a broken logo reference.
  });

  it('has valid Organization schema fields', () => {
    const { container } = render(<OrganizationJsonLd />);
    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBeTruthy();
    expect(data.url).toBeTruthy();
  });
});

// ── WebSiteJsonLd schema validation ─────────────────────────────────
describe('WebSiteJsonLd', () => {
  it('includes SearchAction with correct parameters', () => {
    const { container } = render(<WebSiteJsonLd />);
    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    expect(data['@type']).toBe('WebSite');
    expect(data.potentialAction).toBeDefined();
    expect(data.potentialAction['@type']).toBe('SearchAction');
    expect(data.potentialAction.target.urlTemplate).toContain('/search?from={from}&to={to}');
    expect(data.potentialAction['query-input']).toContain('required name=from');
    expect(data.potentialAction['query-input']).toContain('required name=to');
  });
});

// ── BreadcrumbJsonLd ────────────────────────────────────────────────
describe('BreadcrumbJsonLd', () => {
  it('generates correct positions starting at 1', () => {
    const items = [
      { name: 'Home', href: '/' },
      { name: 'Bus Routes', href: '/bus' },
      { name: 'Chennai to Madurai' },
    ];

    const { container } = render(<BreadcrumbJsonLd items={items} />);
    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );

    expect(data.itemListElement).toHaveLength(3);
    expect(data.itemListElement[0].position).toBe(1);
    expect(data.itemListElement[1].position).toBe(2);
    expect(data.itemListElement[2].position).toBe(3);
  });

  it('omits item URL when href is not provided (last breadcrumb)', () => {
    const items = [
      { name: 'Home', href: '/' },
      { name: 'Current Page' },
    ];

    const { container } = render(<BreadcrumbJsonLd items={items} />);
    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );

    expect(data.itemListElement[0].item).toBeDefined();
    expect(data.itemListElement[1].item).toBeUndefined();
  });
});

// ── FAQJsonLd ───────────────────────────────────────────────────────
describe('FAQJsonLd', () => {
  it('renders valid FAQ schema', () => {
    const questions = [
      { question: 'Q1?', answer: 'A1' },
      { question: 'Q2?', answer: 'A2' },
    ];

    const { container } = render(<FAQJsonLd questions={questions} />);
    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );

    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(2);
    expect(data.mainEntity[0].name).toBe('Q1?');
    expect(data.mainEntity[0].acceptedAnswer.text).toBe('A1');
  });

  it('handles empty questions array', () => {
    const { container } = render(<FAQJsonLd questions={[]} />);
    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    expect(data.mainEntity).toHaveLength(0);
  });
});

// ── XSS safety: JsonLd escapes angle brackets ──────────────────────
describe('JsonLd XSS safety', () => {
  it('escapes </script> tags to prevent XSS', () => {
    const malicious = {
      name: '</script><script>alert("xss")</script>',
    };

    const { container } = render(<JsonLd data={malicious} />);
    const rawHtml = container.querySelector('script')!.innerHTML;

    // Fixed: < is escaped as \u003c, preventing script injection
    expect(rawHtml).not.toContain('</script>');
    expect(rawHtml).toContain('\\u003c');
  });
});
