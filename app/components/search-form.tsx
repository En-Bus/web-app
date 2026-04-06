import { StopAutocomplete } from './stop-autocomplete';

type SearchFormProps = {
  defaultFrom?: string;
  defaultTo?: string;
  defaultTime?: string;
};

export function SearchForm({
  defaultFrom = '',
  defaultTo = '',
  defaultTime = '',
}: SearchFormProps) {
  return (
    <form
      action="/search"
      method="get"
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 sm:p-5"
    >
      <div className="space-y-2">
        <label htmlFor="from" className="block text-sm font-medium">
          From
        </label>
        <StopAutocomplete
          id="from"
          name="from"
          required
          defaultValue={defaultFrom}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="to" className="block text-sm font-medium">
          To
        </label>
        <StopAutocomplete
          id="to"
          name="to"
          required
          defaultValue={defaultTo}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="time" className="block text-sm font-medium">
          Time
        </label>
        <input
          id="time"
          name="time"
          type="time"
          defaultValue={defaultTime}
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-base shadow-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        />
      </div>

      <button
        type="submit"
        className="inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        Search Buses
      </button>
    </form>
  );
}
