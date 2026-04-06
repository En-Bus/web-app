'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Stop = {
  name: string;
  district: string | null;
};

type StopAutocompleteProps = {
  id: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
};

export function StopAutocomplete({
  id,
  name,
  required,
  defaultValue = '',
}: StopAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [stops, setStops] = useState<Stop[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchStops = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setStops([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/autocomplete?q=${encodeURIComponent(query.trim())}`,
      );
      const data = (await res.json()) as { stops: Stop[] };
      setStops(data.stops ?? []);
      setIsOpen((data.stops ?? []).length > 0);
      setActiveIndex(-1);
    } catch {
      setStops([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setInputValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchStops(value);
    }, 300);
  };

  const selectStop = (stop: Stop) => {
    setInputValue(stop.name);
    setStops([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || stops.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < stops.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : stops.length - 1));
        break;
      case 'Enter':
        if (activeIndex >= 0 && stops[activeIndex]) {
          e.preventDefault();
          selectStop(stops[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const listboxId = `${id}-listbox`;

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        required={required}
        type="text"
        autoComplete="off"
        value={inputValue}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => {
          if (stops.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
        }
        className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-base shadow-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
      />

      {isLoading && (
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-600" />
        </div>
      )}

      {isOpen && stops.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {stops.map((stop, index) => (
            <li
              key={`${stop.name}-${stop.district}`}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                selectStop(stop);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                index === activeIndex
                  ? 'bg-brand-50 text-brand-800'
                  : 'text-neutral-900'
              }`}
            >
              <span className="font-medium">{stop.name}</span>
              {stop.district && (
                <span className="ml-2 text-xs text-neutral-500">
                  {stop.district}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
