import { render, screen } from '@testing-library/react';

import { SearchResults } from '../app/components/search-results';

describe('SearchResults promo placement', () => {
  it('inserts the promo after the computed next bus card', () => {
    render(
      <SearchResults
        fromSlug="chennai"
        toSlug="trichy"
        currentTimeMins={10 * 60 + 30}
        promoSlot={<li key="promo-slot">Promo</li>}
        results={[
          {
            route_no: '101',
            board_stop: 'Egmore',
            alight_stop: 'Villupuram',
            boards_at: '10:00',
          },
          {
            route_no: '102',
            board_stop: 'Egmore',
            alight_stop: 'Trichy',
            boards_at: '11:00',
          },
        ]}
      />,
    );

    const nextBusBadge = screen.getByText('Next bus');
    const promo = screen.getByText('Promo');

    expect(nextBusBadge.compareDocumentPosition(promo)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
