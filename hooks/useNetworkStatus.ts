/**
 * useNetworkStatus Hook
 *
 * Monitors network connectivity and provides status information.
 * Uses visibility API to pause checks when tab is hidden (battery optimization).
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ErrorLogger } from "@/lib/monitoring/ErrorLogger";

const LOG_CONTEXT = "useNetworkStatus";
const CHECK_INTERVAL = 30000; // 30 seconds

export interface NetworkStatus {
  isOnline: boolean;
  isConnecting: boolean;
  lastChecked: number | null;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isConnecting: false,
    lastChecked: null,
  });
  
  const isPageVisible = useRef(true);

  const checkConnectivity = useCallback(async () => {
    // Skip checks when page is not visible
    if (!isPageVisible.current) return;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      setStatus((prev) => {
        if (!prev.isOnline) {
          ErrorLogger.info(LOG_CONTEXT, "Network connectivity restored");
        }
        return {
          isOnline: true,
          isConnecting: false,
          lastChecked: Date.now(),
        };
      });
    } catch {
      setStatus((prev) => {
        if (prev.isOnline) {
          ErrorLogger.warn(LOG_CONTEXT, "Network connectivity lost");
        }
        return {
          isOnline: false,
          isConnecting: false,
          lastChecked: Date.now(),
        };
      });
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      ErrorLogger.info(LOG_CONTEXT, "Browser online event");
      setStatus({
        isOnline: true,
        isConnecting: false,
        lastChecked: Date.now(),
      });
    };

    const handleOffline = () => {
      ErrorLogger.warn(LOG_CONTEXT, "Browser offline event");
      setStatus({
        isOnline: false,
        isConnecting: false,
        lastChecked: Date.now(),
      });
    };

    const handleVisibilityChange = () => {
      isPageVisible.current = !document.hidden;
      if (isPageVisible.current) {
        // Check connectivity immediately when page becomes visible
        checkConnectivity();
      }
    };

    // Listen for online/offline events (event-driven, not polling)
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Listen for visibility changes to pause/resume polling
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up periodic connectivity check (only runs when page is visible)
    const interval = setInterval(checkConnectivity, CHECK_INTERVAL);

    // Initial check
    checkConnectivity();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [checkConnectivity]);

  return status;
}
