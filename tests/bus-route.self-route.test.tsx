import { parseBusRouteSlug } from '../app/lib/bus-search';

describe('bus route validation', () => {
  it('detects self routes for guard checks', () => {
    const parsed = parseBusRouteSlug('trichy-to-trichy');
    expect(parsed).toEqual({ fromSlug: 'trichy', toSlug: 'trichy' });
    expect(parsed?.fromSlug === parsed?.toSlug).toBe(true);
  });
});
