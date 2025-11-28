"use client";

import React from "react";
import { useBlockchainConnection } from "@/hooks/useBlockchainConnection";

/**
 * Component that displays blockchain connection status
 * Shows a banner when disconnected with option to reconnect
 */
export function ConnectionStatus() {
  const { isConnected, isReconnecting, reconnect } = useBlockchainConnection();

  // Don't show anything when connected
  if (isConnected) {
    return null;
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 bg-yellow-600 px-4 py-3 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="font-semibold">Blockchain Connection Lost</p>
            <p className="text-sm opacity-90">
              {isReconnecting
                ? "Attempting to reconnect..."
                : "Unable to connect to Polkadot RPC endpoint"}
            </p>
          </div>
        </div>

        {!isReconnecting && (
          <button
            onClick={reconnect}
            className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-yellow-400 transition-colors hover:bg-gray-800"
          >
            Reconnect
          </button>
        )}

        {isReconnecting && (
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Reconnecting...</span>
          </div>
        )}
      </div>
    </div>
  );
}
