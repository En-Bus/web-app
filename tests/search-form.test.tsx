import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchForm } from '../app/components/search-form';

// ── Bug #6: Missing input validation on search form ─────────────────
describe('SearchForm (bug #6)', () => {
  it('renders from, to, and time inputs', () => {
    render(<SearchForm />);
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
  });

  it('submits as GET to /search', () => {
    const { container } = render(<SearchForm />);
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(form!.getAttribute('action')).toBe('/search');
    expect(form!.getAttribute('method')).toBe('get');
  });

  it('populates default values', () => {
    render(<SearchForm defaultFrom="Chennai" defaultTo="Madurai" defaultTime="10:00" />);
    expect(screen.getByLabelText('From')).toHaveValue('Chennai');
    expect(screen.getByLabelText('To')).toHaveValue('Madurai');
    expect(screen.getByLabelText('Time')).toHaveValue('10:00');
  });

  it('renders empty values by default', () => {
    render(<SearchForm />);
    expect(screen.getByLabelText('From')).toHaveValue('');
    expect(screen.getByLabelText('To')).toHaveValue('');
    expect(screen.getByLabelText('Time')).toHaveValue('');
  });

  it('from and to inputs have required attribute', () => {
    render(<SearchForm />);
    const fromInput = screen.getByLabelText('From');
    const toInput = screen.getByLabelText('To');
    expect(fromInput.hasAttribute('required')).toBe(true);
    expect(toInput.hasAttribute('required')).toBe(true);
  });

  it('time input has type="time"', () => {
    render(<SearchForm />);
    const timeInput = screen.getByLabelText('Time');
    expect(timeInput.getAttribute('type')).toBe('time');
  });

  it('has a submit button', () => {
    render(<SearchForm />);
    expect(screen.getByRole('button', { name: /search buses/i })).toBeInTheDocument();
  });
});
