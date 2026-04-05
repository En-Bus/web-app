'use client';

import { useEffect, useState } from 'react';

type SearchEventTrackerProps = {
  from: string;
  to: string;
  interCityCount: number;
  cityCount: number;
};

export function SearchEventTracker({
  from,
  to,
  interCityCount,
  cityCount,
}: SearchEventTrackerProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).gtag) return;
    const gtag = (window as any).gtag;
    const totalCount = interCityCount + cityCount;

    gtag('event', 'search', {
      search_from: from,
      search_to: to,
      inter_city_count: interCityCount,
      city_count: cityCount,
      total_count: totalCount,
      has_results: totalCount > 0 ? 'yes' : 'no',
    });

    if (totalCount === 0) {
      gtag('event', 'search_no_results', {
        search_from: from,
        search_to: to,
      });
    }
  }, [from, to, interCityCount, cityCount]);

  return null;
}

type SearchFeedbackProps = {
  from: string;
  to: string;
  hasResults: boolean;
};

export function SearchFeedback({ from, to, hasResults }: SearchFeedbackProps) {
  const [state, setState] = useState<'idle' | 'yes' | 'no' | 'submitted'>('idle');

  function sendFeedback(helpful: boolean) {
    const next = helpful ? 'yes' : 'no';
    setState(next);

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search_feedback', {
        search_from: from,
        search_to: to,
        helpful: next,
        has_results: hasResults ? 'yes' : 'no',
      });
    }
  }

  function submitComment(formData: FormData) {
    const comment = (formData.get('comment') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    if (!comment && !phone) return;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search_feedback_comment', {
        search_from: from,
        search_to: to,
        helpful: state,
        comment: (comment || '').slice(0, 200),
        phone: (phone || '').slice(0, 15),
      });
    }

    setState('submitted');
  }

  if (state === 'submitted') {
    return (
      <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        Thanks for your feedback!
      </p>
    );
  }

  if (state === 'yes') {
    return (
      <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        Glad it helped!
      </p>
    );
  }

  if (state === 'no') {
    return (
      <form
        action={submitComment}
        className="space-y-3 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3"
      >
        <label htmlFor="feedback-comment" className="block text-sm text-neutral-700">
          What were you looking for?
        </label>
        <input
          id="feedback-comment"
          name="comment"
          type="text"
          maxLength={200}
          placeholder="e.g. Bus from Gandhipuram to Ukkadam"
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-neutral-500"
        />
        <input
          id="feedback-phone"
          name="phone"
          type="tel"
          maxLength={15}
          placeholder="Phone number (optional)"
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-neutral-500"
        />
        <button
          type="submit"
          className="inline-flex rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Send
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3">
      <span className="text-sm text-neutral-700">Was this helpful?</span>
      <button
        type="button"
        onClick={() => sendFeedback(true)}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-100"
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => sendFeedback(false)}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-100"
      >
        No
      </button>
    </div>
  );
}
