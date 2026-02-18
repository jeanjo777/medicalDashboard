import { useEffect, useRef, useState } from 'react';

export interface TouchGestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY = 0.3;
const LONG_PRESS_DURATION = 500;
const DOUBLE_TAP_DELAY = 300;

export const useTouchGestures = (
  elementRef: React.RefObject<HTMLElement>,
  callbacks: TouchGestureCallbacks
) => {
  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<number>(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      if (callbacks.onLongPress) {
        longPressTimer.current = setTimeout(() => {
          callbacks.onLongPress?.();
        }, LONG_PRESS_DURATION);
      }
    };

    const handleTouchMove = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      touchEnd.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      const deltaX = touchEnd.current.x - touchStart.current.x;
      const deltaY = touchEnd.current.y - touchStart.current.y;
      const deltaTime = touchEnd.current.time - touchStart.current.time;
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX < 10 && absDeltaY < 10) {
        const now = Date.now();
        if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
          callbacks.onDoubleTap?.();
          lastTapTime.current = 0;
        } else {
          callbacks.onTap?.();
          lastTapTime.current = now;
        }
        return;
      }

      if (velocity > SWIPE_VELOCITY) {
        if (absDeltaX > absDeltaY) {
          if (deltaX > SWIPE_THRESHOLD) {
            callbacks.onSwipeRight?.();
          } else if (deltaX < -SWIPE_THRESHOLD) {
            callbacks.onSwipeLeft?.();
          }
        } else {
          if (deltaY > SWIPE_THRESHOLD) {
            callbacks.onSwipeDown?.();
          } else if (deltaY < -SWIPE_THRESHOLD) {
            callbacks.onSwipeUp?.();
          }
        }
      }

      touchStart.current = null;
      touchEnd.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [callbacks, elementRef]);
};

export const useSwipeable = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void
) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useTouchGestures(elementRef, {
    onSwipeLeft,
    onSwipeRight,
  });

  return elementRef;
};

export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number>(0);
  const maxPullDistance = 100;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && startY.current > 0) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - startY.current;

        if (distance > 0) {
          e.preventDefault();
          setPullDistance(Math.min(distance, maxPullDistance));
          setIsPulling(true);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (isPulling && pullDistance >= maxPullDistance) {
        await onRefresh();
      }

      setIsPulling(false);
      setPullDistance(0);
      startY.current = 0;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, onRefresh]);

  return { isPulling, pullDistance, progress: pullDistance / maxPullDistance };
};
