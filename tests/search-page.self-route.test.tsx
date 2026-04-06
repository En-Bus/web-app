import { render, screen } from '@testing-library/react';
import SearchPage, { generateMetadata } from '../app/search/page';

// Helper to render the async server component by invoking it directly.
async function renderSearch(params: Record<string, string>) {
  const element = await SearchPage({ searchParams: Promise.resolve(params) } as any);
  render(element as any);
}

describe('SearchPage self-route guard', () => {
  it('blocks identical from/to and shows warning', async () => {
    await renderSearch({ from: 'trichy', to: 'trichy' });
    expect(screen.getByText(/must be different/i)).toBeInTheDocument();
    expect(screen.queryByText(/Results for/i)).not.toBeInTheDocument();
  });
});

describe('Search metadata', () => {
  it('is noindex for search', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ from: 'chennai', to: 'madurai' }),
    });
    expect((metadata.robots as { index: boolean })?.index).toBe(false);
  });

  it('is noindex even without search params', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({}),
    });
    expect((metadata.robots as { index: boolean })?.index).toBe(false);
  });
});
