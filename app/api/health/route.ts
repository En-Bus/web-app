import { NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.SEARCH_API_BASE_URL ??
  process.env.NEXT_PUBLIC_SEARCH_API_BASE_URL ??
  'https://hopivdsbzzfklohyllut.supabase.co/functions/v1/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  try {
    const res = await fetch(`${API_BASE_URL}/search?from=chennai&to=madurai`, {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    const latency = Date.now() - start;
    return NextResponse.json(
      { status: res.ok ? 'ok' : 'degraded', http_status: res.status, latency_ms: latency },
      { status: res.ok ? 200 : 503 },
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'down', error: (err as Error).message, latency_ms: Date.now() - start },
      { status: 503 },
    );
  }
}
