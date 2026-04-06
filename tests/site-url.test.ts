import { describe, it, expect, vi, afterEach } from 'vitest';

describe('SITE_URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('defaults to https://enbus.in when env is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    const { SITE_URL } = await import('../app/lib/site-url');
    expect(SITE_URL).toBe('https://enbus.in');
  });

  it('strips trailing slashes from env value', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com///');
    const { SITE_URL } = await import('../app/lib/site-url');
    expect(SITE_URL).toBe('https://example.com');
  });
});
