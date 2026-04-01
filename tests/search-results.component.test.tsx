import { render, screen } from '@testing-library/react';
import { SearchResults } from '../app/components/search-results';

const baseProps = {
  fromSlug: 'chennai',
  toSlug: 'trichy',
};

describe('SearchResults component', () => {
  it('shows SEO link when results exist', () => {
    render(
      <SearchResults
        {...baseProps}
        results={[{
          route_no: '101',
          board_stop: 'Egmore',
          alight_stop: 'Srirangam',
          boards_at: '10:00',
        }]}
      />,
    );

    expect(screen.getByText('/bus/chennai-to-trichy')).toBeInTheDocument();
  });

  it('hides SEO link when no results', () => {
    render(<SearchResults {...baseProps} results={[]} />);
    expect(screen.queryByText('/bus/chennai-to-trichy')).not.toBeInTheDocument();
    expect(screen.getByText(/No buses found/i)).toBeInTheDocument();
  });
});
