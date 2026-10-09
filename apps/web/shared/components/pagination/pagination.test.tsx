import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Pagination } from './pagination';

describe('Pagination', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders nothing when totalPages is 1 and items fit within limit', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} totalItems={10} limit={20} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders item counts and page buttons when totalPages > 1', () => {
    render(
      <Pagination page={1} totalPages={3} totalItems={50} limit={20} onPageChange={vi.fn()} />,
    );

    expect(screen.getByText(/showing/i)).toBeDefined();
    expect(screen.getByText('50')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeDefined();
  });

  it('calls onPageChange with next and specific page numbers', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={1} totalPages={3} totalItems={50} limit={20} onPageChange={onPageChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on page 1 and next button on last page', () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={3} totalItems={50} limit={20} onPageChange={vi.fn()} />,
    );

    const prevBtn = screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement;
    const nextBtn = screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
    expect(nextBtn.disabled).toBe(false);

    rerender(
      <Pagination page={3} totalPages={3} totalItems={50} limit={20} onPageChange={vi.fn()} />,
    );

    expect(prevBtn.disabled).toBe(false);
    expect(nextBtn.disabled).toBe(true);
  });
});
