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
        <input
          id="from"
          name="from"
          defaultValue={defaultFrom}
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-base shadow-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="to" className="block text-sm font-medium">
          To
        </label>
        <input
          id="to"
          name="to"
          defaultValue={defaultTo}
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-base shadow-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="time" className="block text-sm font-medium">
          Time
        </label>
        <input
          id="time"
          name="time"
          defaultValue={defaultTime}
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-base shadow-sm outline-none focus:border-neutral-500"
        />
      </div>

      <button
        type="submit"
        className="inline-flex rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        Search
      </button>
    </form>
  );
}
