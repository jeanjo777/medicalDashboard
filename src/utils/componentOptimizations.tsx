/**
 * Component Optimization Utilities
 *
 * Provides utilities and HOCs for React component performance optimization
 */

import React, { ComponentType, memo } from 'react';
import logger from './logger';

/**
 * Compare function for React.memo that does deep comparison
 * Use only when shallow comparison is not sufficient
 */
export function deepCompare<P>(prevProps: P, nextProps: P): boolean {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}

/**
 * Compare function for React.memo that compares specific props
 */
export function propsCompare<P extends Record<string, any>>(
  keys: (keyof P)[]
): (prevProps: P, nextProps: P) => boolean {
  return (prevProps, nextProps) => {
    return keys.every(key => prevProps[key] === nextProps[key]);
  };
}

/**
 * HOC to optimize a component with React.memo and custom comparison
 *
 * @example
 * ```tsx
 * const OptimizedComponent = optimizeComponent(MyComponent, ['data', 'loading']);
 * ```
 */
export function optimizeComponent<P extends Record<string, any>>(
  Component: ComponentType<P>,
  compareKeys?: (keyof P)[]
): ComponentType<P> {
  if (compareKeys) {
    return memo(Component, propsCompare(compareKeys));
  }
  return memo(Component);
}

/**
 * Debounce hook for expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for limiting function calls
 */
export function useThrottle<T>(value: T, interval: number = 500): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= interval) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, interval - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, interval]);

  return throttledValue;
}

/**
 * Hook to track component render count (useful for debugging)
 */
export function useRenderCount(componentName: string): number {
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current += 1;
    if (import.meta.env.DEV) {
      logger.info(`[RENDER COUNT] ${componentName}: ${renderCount.current}`);
    }
  });

  return renderCount.current;
}

/**
 * Hook to track why a component re-rendered
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>): void {
  const previousProps = React.useRef<Record<string, any>>();

  React.useEffect(() => {
    if (previousProps.current && import.meta.env.DEV) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        logger.info('[WHY DID YOU UPDATE]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

/**
 * Lazy load component with loading fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <div>Loading...</div>
): React.LazyExoticComponent<T> {
  const LazyComponent = React.lazy(importFunc);

  return LazyComponent as React.LazyExoticComponent<T>;
}

/**
 * Virtual list helper for rendering large lists efficiently
 * Returns only visible items based on scroll position
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
): { visibleItems: T[]; totalHeight: number; offsetY: number } {
  return React.useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

    const visibleItems = items.slice(
      Math.max(0, startIndex - 2), // Buffer 2 items before
      Math.min(items.length, endIndex + 2) // Buffer 2 items after
    );

    return {
      visibleItems,
      totalHeight: items.length * itemHeight,
      offsetY: Math.max(0, (startIndex - 2) * itemHeight),
    };
  }, [items, itemHeight, containerHeight, scrollTop]);
}

/**
 * Memoized filter function for arrays
 */
export function useMemoizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean
): T[] {
  return React.useMemo(() => items.filter(filterFn), [items, filterFn]);
}

/**
 * Memoized sort function for arrays
 */
export function useMemoizedSort<T>(
  items: T[],
  compareFn: (a: T, b: T) => number
): T[] {
  return React.useMemo(() => [...items].sort(compareFn), [items, compareFn]);
}

/**
 * Combined filter and sort hook
 */
export function useFilteredAndSorted<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  sortFn: (a: T, b: T) => number
): T[] {
  return React.useMemo(() => {
    return items.filter(filterFn).sort(sortFn);
  }, [items, filterFn, sortFn]);
}
