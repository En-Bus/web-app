'use client';

import { useState, useRef } from 'react';

type Props = {
  districts: string[];
};

type SubmitState = 'idle' | 'uploading' | 'success' | 'error';

export function ContributeForm({ districts }: Props) {
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'uploading') return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    setState('uploading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        body: formData,
      });

      const json = (await res.json()) as { success?: boolean; error?: string };

      if (res.ok && json.success) {
        setState('success');
        form.reset();
        setPreview(null);
      } else {
        setErrorMsg(json.error ?? 'Something went wrong. Please try again.');
        setState('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-5 py-6 text-center space-y-3">
        <p className="text-lg font-semibold text-green-800">Thank you!</p>
        <p className="text-sm text-green-700">
          Your photo has been submitted. We&rsquo;ll review it and add the routes
          to enbus.in.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-2 inline-flex rounded-md border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-50"
        >
          Submit another photo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Photo upload */}
      <div className="space-y-1.5">
        <label htmlFor="photo" className="block text-sm font-medium text-neutral-800">
          Timetable photo <span className="text-red-500">*</span>
        </label>
        <input
          ref={fileRef}
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,.heic,.heif"
          required
          onChange={handleFileChange}
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 file:mr-3 file:rounded file:border-0 file:bg-neutral-100 file:px-3 file:py-1 file:text-sm file:font-medium"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 max-h-48 rounded-md border border-neutral-200 object-contain"
          />
        )}
        <p className="text-xs text-neutral-500">JPEG, PNG, or HEIC — max 10 MB</p>
      </div>

      {/* Bus stand */}
      <div className="space-y-1.5">
        <label htmlFor="bus_stand" className="block text-sm font-medium text-neutral-800">
          Bus stand name <span className="text-red-500">*</span>
        </label>
        <input
          id="bus_stand"
          name="bus_stand"
          type="text"
          required
          maxLength={100}
          placeholder="e.g. Madurai Central Bus Stand"
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-neutral-500"
        />
      </div>

      {/* District */}
      <div className="space-y-1.5">
        <label htmlFor="district" className="block text-sm font-medium text-neutral-800">
          District
        </label>
        <select
          id="district"
          name="district"
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-neutral-500"
        >
          <option value="">Select district (optional)</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Optional contact */}
      <div className="space-y-1.5">
        <label htmlFor="submitted_by" className="block text-sm font-medium text-neutral-800">
          Your name or contact (optional)
        </label>
        <input
          id="submitted_by"
          name="submitted_by"
          type="text"
          maxLength={80}
          placeholder="e.g. Karthik, Chennai"
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-neutral-500"
        />
        <p className="text-xs text-neutral-500">
          We may contact you if we need clarification. Not shown publicly.
        </p>
      </div>

      {state === 'error' && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'uploading'}
        className="inline-flex rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {state === 'uploading' ? 'Uploading…' : 'Submit photo'}
      </button>
    </form>
  );
}
