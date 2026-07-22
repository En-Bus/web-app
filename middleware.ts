import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Cache /search responses for 5 minutes to enable Cloudflare caching
  if (request.nextUrl.pathname === '/search') {
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  }

  return response;
}

export const config = {
  matcher: '/search',
};
