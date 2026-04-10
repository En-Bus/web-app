import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.SEARCH_API_BASE_URL ??
  process.env.NEXT_PUBLIC_SEARCH_API_BASE_URL ??
  'https://hopivdsbzzfklohyllut.supabase.co/functions/v1/api';

const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/corrections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SUPABASE_ANON_KEY ? { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : res.status });
  } catch (err) {
    console.error('[corrections] upstream fetch failed:', err);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
