import { render, screen, waitFor } from '@testing-library/react';

import { GamePromo } from '../app/components/game-promo';

describe('GamePromo runtime teaser', () => {
  beforeEach(() => {
    delete (window as any).gtag;
    vi.restoreAllMocks();
  });

  it('hydrates puzzle tiles, date, and CTA from the IndieEgg JSON payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          scrambledLetters: ['சொ', 'ல்', 'பு', 'தி', 'ர்'],
          date: '2026-05-11',
          ctaUrl: 'https://play.google.com/store/apps/details?id=com.solputhir.daily&ref=indieegg',
        }),
      }),
    );

    render(<GamePromo placement="home_after_search" />);

    const link = await screen.findByRole('link', { name: /play today's solputhir puzzle on google play/i });
    expect(link).toHaveAttribute(
      'href',
      'https://play.google.com/store/apps/details?id=com.solputhir.daily&ref=indieegg',
    );
    expect(screen.getByText('11 May 2026')).toBeInTheDocument();
    expect(screen.getByText('Solve in app')).toBeInTheDocument();
    expect(screen.getByText('சொ')).toBeInTheDocument();

    const tilesRow = screen.getByTestId('solputhir-tiles');
    expect(tilesRow.className).toContain('flex-nowrap');
  });

  it('renders as a list item when used inside search results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          scrambledLetters: ['அ', 'ம்', 'மா'],
          date: '2026-05-11',
          ctaUrl: 'https://play.google.com/store/apps/details?id=com.solputhir.daily',
        }),
      }),
    );

    const { container } = render(<GamePromo placement="search_after_next_bus" inList />);

    await screen.findByRole('link', { name: /play today's solputhir puzzle on google play/i });
    expect(container.querySelector('div.list-none')).toBeTruthy();
  });

  it('hides cleanly when the runtime fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    const { container } = render(<GamePromo placement="route_after_next_bus" />);

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
