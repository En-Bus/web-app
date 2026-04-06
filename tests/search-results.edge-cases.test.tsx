import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchResults } from '../app/components/search-results';
import type { SearchResult } from '../app/lib/bus-search';

describe('SearchResults component', () => {
  const baseResult: SearchResult = {
    route_no: '101',
    board_stop: 'koyambedu',
    alight_stop: 'madurai',
    boards_at: '10:00',
    service_type: 'SETC',
  };

  it('renders "No buses found" when results are empty', () => {
    render(<SearchResults fromSlug="a" toSlug="b" results={[]} />);
    expect(screen.getByText('No buses found.')).toBeInTheDocument();
  });

  it('renders results count', () => {
    render(<SearchResults fromSlug="a" toSlug="b" results={[baseResult]} />);
    expect(screen.getByText('Showing 1 results.')).toBeInTheDocument();
  });

  it('renders SEO link for inter-city type', () => {
    render(
      <SearchResults
        fromSlug="chennai"
        toSlug="madurai"
        results={[baseResult]}
        showSeoLink
        type="inter-city"
      />,
    );
    const link = screen.getByText('/bus/chennai-to-madurai');
    expect(link.getAttribute('href')).toBe('/bus/chennai-to-madurai');
  });

  it('renders SEO link for city type', () => {
    render(
      <SearchResults
        fromSlug="koyambedu"
        toSlug="tambaram"
        results={[baseResult]}
        showSeoLink
        type="city"
      />,
    );
    const link = screen.getByText('/city-bus/koyambedu-to-tambaram');
    expect(link.getAttribute('href')).toBe('/city-bus/koyambedu-to-tambaram');
  });

  it('hides SEO link when showSeoLink is false', () => {
    render(
      <SearchResults
        fromSlug="a"
        toSlug="b"
        results={[baseResult]}
        showSeoLink={false}
      />,
    );
    expect(screen.queryByText(/View route page/)).toBeNull();
  });

  it('hides SEO link when results are empty even if showSeoLink is true', () => {
    render(
      <SearchResults fromSlug="a" toSlug="b" results={[]} showSeoLink />,
    );
    expect(screen.queryByText(/View route page/)).toBeNull();
  });

  it('formats stop names with title case', () => {
    const { container } = render(<SearchResults fromSlug="a" toSlug="b" results={[baseResult]} />);
    // Stop names are inside the list item alongside the arrow separator.
    const listItem = container.querySelector('li');
    expect(listItem?.textContent).toContain('Koyambedu');
    expect(listItem?.textContent).toContain('Madurai');
  });

  it('shows "Time unknown" for results with no time', () => {
    const noTimeResult: SearchResult = {
      ...baseResult,
      boards_at: null,
      departs_at: null,
    };
    render(<SearchResults fromSlug="a" toSlug="b" results={[noTimeResult]} />);
    expect(screen.getByText('Time unknown')).toBeInTheDocument();
  });

  it('shows distance when available', () => {
    const withDistance: SearchResult = { ...baseResult, distance_km: '450' };
    render(<SearchResults fromSlug="a" toSlug="b" results={[withDistance]} />);
    expect(screen.getByText('450 km')).toBeInTheDocument();
  });

  it('hides distance when not available', () => {
    render(<SearchResults fromSlug="a" toSlug="b" results={[baseResult]} />);
    expect(screen.queryByText(/km/)).toBeNull();
  });

  it('renders agency badge for service_type', () => {
    render(<SearchResults fromSlug="a" toSlug="b" results={[baseResult]} />);
    expect(screen.getByText('SETC')).toBeInTheDocument();
  });

  it('arrow separator has aria-hidden="true"', () => {
    const { container } = render(
      <SearchResults fromSlug="a" toSlug="b" results={[baseResult]} />,
    );
    const arrow = container.querySelector('[aria-hidden="true"]');
    expect(arrow).not.toBeNull();
    expect(arrow?.textContent).toContain('→');
  });
});
