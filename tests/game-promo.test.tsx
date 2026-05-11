import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { GamePromo } from '../app/components/game-promo';

describe('GamePromo', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete (window as any).gtag;
  });

  it('renders one of the promo variants when not dismissed', async () => {
    render(
      <GamePromo
        fromSlug="chennai"
        toSlug="madurai"
        placement="search_results"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /play store-ல் திறக்க|விளையாடத் தொடங்கு/i }),
      ).toBeInTheDocument();
    });
  });

  it('hides itself after dismiss and persists that choice', async () => {
    render(
      <GamePromo
        fromSlug="trichy"
        toSlug="salem"
        placement="search_results"
      />,
    );

    const dismissButton = await screen.findByRole('button', { name: /dismiss solputhir promo/i });
    fireEvent.click(dismissButton);

    expect(window.localStorage.getItem('enbus-game-promo-dismissed-v1')).toBe('1');
    expect(screen.queryByRole('button', { name: /dismiss solputhir promo/i })).not.toBeInTheDocument();
  });

  it('tracks promo clicks with gtag when available', async () => {
    const gtag = vi.fn();
    (window as any).gtag = gtag;

    render(
      <GamePromo
        fromSlug="erode"
        toSlug="coimbatore"
        placement="search_results"
      />,
    );

    const cta = await screen.findByRole('link', { name: /play store-ல் திறக்க|விளையாடத் தொடங்கு/i });
    fireEvent.click(cta);

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'game_promo_click',
      expect.objectContaining({
        placement: 'search_results',
        from_slug: 'erode',
        to_slug: 'coimbatore',
      }),
    );
  });
});
