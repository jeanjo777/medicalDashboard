/**
 * usePagination - Reusable pagination hook
 *
 * Provides pagination logic for lists with support for:
 * - Page-based navigation
 * - Configurable page size
 * - Total count tracking
 * - Page range calculation
 *
 * @example
 * const { currentPage, pageSize, totalPages, goToPage, nextPage, prevPage } = usePagination({
 *   totalItems: 100,
 *   initialPage: 1,
 *   initialPageSize: 20
 * });
 */

import { useState, useMemo, useCallback } from 'react';

export interface PaginationConfig {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
}

export interface PaginationResult {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  pageRange: number[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  reset: () => void;
}

export const usePagination = ({
  totalItems,
  initialPage = 1,
  initialPageSize = 20,
}: PaginationConfig): PaginationResult => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  // Ensure current page is within bounds
  const validPage = useMemo(() => {
    return Math.min(Math.max(1, currentPage), totalPages);
  }, [currentPage, totalPages]);

  // Calculate start and end indices
  const startIndex = useMemo(() => {
    return (validPage - 1) * pageSize;
  }, [validPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems);
  }, [startIndex, pageSize, totalItems]);

  // Calculate page range for pagination UI (show 5 pages max)
  const pageRange = useMemo(() => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, validPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }, [validPage, totalPages]);

  const goToPage = useCallback((page: number) => {
    const validatedPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(validatedPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (validPage < totalPages) {
      setCurrentPage(validPage + 1);
    }
  }, [validPage, totalPages]);

  const prevPage = useCallback(() => {
    if (validPage > 1) {
      setCurrentPage(validPage - 1);
    }
  }, [validPage]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when page size changes
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    currentPage: validPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
    pageRange,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    reset,
  };
};

export default usePagination;
