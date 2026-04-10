import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchResults } from '../app/components/search-results';
import type { SearchResult } from '../app/lib/bus-search';

const baseResult: SearchResult = {
  route_no: '101',
  board_stop: 'Koyambedu',
  alight_stop: 'Madurai',
  boards_at: '10:00',
  service_type: 'SETC',
};

describe('SearchResults — ReportButton', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  it('renders "Report issue" button on each result row', () => {
    render(<SearchResults fromSlug="a" toSlug="b" results={[baseResult]} showSeoLink={false} />);
    expect(screen.getByText('Report issue')).toBeInTheDocument();
  });

  it('changes text to "Reported" after clicking', async () => {
    render(<SearchResults fromSlug="a" toSlug="b" results={[baseResult]} showSeoLink={false} />);
    const btn = screen.getByText('Report issue');
    fireEvent.click(btn);
    expect(await screen.findByText('Reported')).toBeInTheDocument();
  });

  it('calls /api/corrections with correct payload on click', () => {
    render(<SearchResults fromSlug="a" toSlug="b" results={[baseResult]} showSeoLink={false} />);
    fireEvent.click(screen.getByText('Report issue'));

    expect(fetch).toHaveBeenCalledWith('/api/corrections', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_type: 'wrong_time',
        route_no: '101',
        from_stop: 'Koyambedu',
        to_stop: 'Madurai',
      }),
    }));
  });

  it('does not re-fire fetch if already reported', () => {
    render(<SearchResults fromSlug="a" toSlug="b" results={[baseResult]} showSeoLink={false} />);
    const btn = screen.getByText('Report issue');
    fireEvent.click(btn);
    fireEvent.click(screen.getByText('Reported'));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('renders one report button per result row', () => {
    const results = [baseResult, { ...baseResult, route_no: '202', boards_at: '11:00' }];
    render(<SearchResults fromSlug="a" toSlug="b" results={results} showSeoLink={false} />);
    expect(screen.getAllByText('Report issue')).toHaveLength(2);
  });
});
