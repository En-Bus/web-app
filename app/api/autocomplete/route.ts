import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.SEARCH_API_BASE_URL ??
  process.env.NEXT_PUBLIC_SEARCH_API_BASE_URL ??
  'https://hopivdsbzzfklohyllut.supabase.co/functions/v1/api';

const MAX_QUERY_LENGTH = 50;
const MIN_QUERY_LENGTH = 2;
const LIMIT = 8;

type AutocompleteStop = {
  stop_name: string;
  district: string | null;
  stop_type: string | null;
};

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Basic origin check — reject requests from other sites
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://enbus.in';
  if (origin && !origin.startsWith(siteUrl) && !origin.startsWith('http://localhost')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!origin && referer && !referer.startsWith(siteUrl) && !referer.startsWith('http://localhost')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ stops: [] });
  }

  const sanitized = q.slice(0, MAX_QUERY_LENGTH);

  try {
    const params = new URLSearchParams({
      q: sanitized,
      limit: String(LIMIT),
    });

    const upstream = await fetch(
      `${API_BASE_URL}/stops/autocomplete?${params.toString()}`,
      { next: { revalidate: 300 } },
    );

    if (!upstream.ok) {
      return NextResponse.json({ stops: [] });
    }

    const data = (await upstream.json()) as {
      stops: AutocompleteStop[];
    };

    // Strip internal fields — only return what the client needs
    const stops = (data.stops ?? []).map((s) => ({
      name: s.stop_name,
      district: s.district,
    }));

    return NextResponse.json(
      { stops },
      {
        headers: {
          'Cache-Control': 'private, max-age=60',
          'X-Robots-Tag': 'noindex',
        },
      },
    );
  } catch {
    return NextResponse.json({ stops: [] });
  }
}
