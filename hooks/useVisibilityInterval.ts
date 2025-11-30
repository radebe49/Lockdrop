"use client";

import { useEffect, useRef } from "react";

interface UseVisibilityIntervalOptions {
  /** Callback to run on interval */
  callback: () => void;
  /** Interval in milliseconds */
  interval: number;
  /** Whether to run immediately when page becomes visible (default: true) */
  runOnVisible?: boolean;
  /** Whether the interval is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook that runs a callback on an interval, but only when the page is visible.
 *
 * Features:
 * - Automatically pauses when tab is hidden (battery optimization)
 * - Runs callback immediately when page becomes visible
 * - Properly cleans up on unmount
 *
 * @example
 * ```tsx
 * useVisibilityInterval({
 *   callback: () => fetchData(),
 *   interval: 10000,
 * });
 * ```
 */
export function useVisibilityInterval({
  callback,
  interval,
  runOnVisible = true,
  enabled = true,
}: UseVisibilityIntervalOptions): void {
  // Use ref to always have latest callback without re-creating effect
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    let intervalId: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (!document.hidden && runOnVisible) {
        callbackRef.current();
      }
    };

    const tick = () => {
      if (!document.hidden) {
        callbackRef.current();
      }
    };

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up interval
    intervalId = setInterval(tick, interval);

    // Cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [interval, runOnVisible, enabled]);
}
