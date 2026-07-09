'use client';

export function AdsenseHeadTag() {
  if (typeof window === 'undefined') return null;

  if (!document.querySelector('meta[name="google-adsense-account"]')) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'google-adsense-account');
    meta.setAttribute('content', 'ca-pub-1115352628293702');
    document.head.appendChild(meta);
  }

  return null;
}
