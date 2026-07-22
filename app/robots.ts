import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/search',
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'ClaudeBot', 'Bytespider', 'Amazonbot', 'PerplexityBot', 'anthropic-ai'],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
