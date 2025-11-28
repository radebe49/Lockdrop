"use client";

/**
 * Connection Status Component
 *
 * Shows unified status of wallet and Storacha connections
 * Helps users understand what's connected and what needs attention
 */

import { useWallet } from "@/lib/wallet/WalletProvider";
import { useStoracha } from "@/hooks/useStoracha";

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className = "" }: ConnectionStatusProps) {
  const { isConnected: walletConnected, address } = useWallet();
  const { authState, isReady } = useStoracha();

  const walletStatus = walletConnected ? "connected" : "disconnected";
  const storachaStatus = isReady
    ? "ready"
    : authState.isAuthenticated
      ? "partial"
      : "disconnected";

  return (
    <div
      className={`rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm ${className}`}
    >
      <h3 className="mb-3 text-sm font-semibold text-gray-100">
        Connection Status
      </h3>

      <div className="space-y-2">
        {/* Wallet Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`mr-2 h-2 w-2 rounded-full ${
                walletStatus === "connected" ? "bg-green-500" : "bg-gray-600"
              }`}
            />
            <span className="text-sm text-gray-300">Wallet</span>
          </div>
          <div className="text-xs">
            {walletStatus === "connected" ? (
              <span className="font-medium text-green-400">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            ) : (
              <span className="text-gray-500">Not connected</span>
            )}
          </div>
        </div>

        {/* Storacha Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`mr-2 h-2 w-2 rounded-full ${
                storachaStatus === "ready"
                  ? "bg-green-500"
                  : storachaStatus === "partial"
                    ? "bg-yellow-500"
                    : "bg-gray-600"
              }`}
            />
            <span className="text-sm text-gray-300">Storage</span>
          </div>
          <div className="text-xs">
            {storachaStatus === "ready" ? (
              <span className="font-medium text-green-400">Ready</span>
            ) : storachaStatus === "partial" ? (
              <span className="font-medium text-yellow-400">
                Setup incomplete
              </span>
            ) : (
              <span className="text-gray-500">Not connected</span>
            )}
          </div>
        </div>
      </div>

      {/* Overall Status Message */}
      <div className="mt-3 border-t border-gray-700 pt-3">
        {walletConnected && isReady ? (
          <p className="text-xs text-green-400">✓ All systems ready</p>
        ) : (
          <p className="text-xs text-gray-400">
            {!walletConnected && "Connect wallet to continue"}
            {walletConnected &&
              !isReady &&
              "Complete storage setup to upload files"}
          </p>
        )}
      </div>
    </div>
  );
}
