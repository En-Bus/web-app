import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the upstream fetch call
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// We test the API route logic in isolation via dynamic import
// (Next.js route handlers are plain async functions)
describe('POST /api/corrections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 on successful upstream response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { POST } = await import('../app/api/corrections/route');
    const req = new Request('http://localhost/api/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_type: 'wrong_time', route_no: '101' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('returns 400 on invalid JSON body', async () => {
    const { POST } = await import('../app/api/corrections/route');
    const req = new Request('http://localhost/api/corrections', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'text/plain' },
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 500 when upstream fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network error'));

    const { POST } = await import('../app/api/corrections/route');
    const req = new Request('http://localhost/api/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_type: 'feedback' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });

  it('forwards upstream error status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'bad request' }),
    });

    const { POST } = await import('../app/api/corrections/route');
    const req = new Request('http://localhost/api/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_type: 'feedback' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
