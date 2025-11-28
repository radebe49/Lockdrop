"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useWallet } from "@/lib/wallet/WalletProvider";
import { useStoracha } from "@/hooks/useStoracha";
import {
  InboxIcon,
  PaperAirplaneIcon,
  PlusIcon,
  WalletIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Dynamic imports for code splitting - dashboard components loaded on demand
const SentMessages = dynamic(
  () => import("@/components/dashboard/SentMessages").then((mod) => ({ default: mod.SentMessages })),
  {
    loading: () => (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-dark-800/50" />
        ))}
      </div>
    ),
    ssr: false,
  }
);

const ReceivedMessages = dynamic(
  () => import("@/components/dashboard/ReceivedMessages").then((mod) => ({ default: mod.ReceivedMessages })),
  {
    loading: () => (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-dark-800/50" />
        ))}
      </div>
    ),
    ssr: false,
  }
);

const KeyBackupWarning = dynamic(
  () => import("@/components/wallet/KeyBackupWarning").then((mod) => ({ default: mod.KeyBackupWarning })),
  { ssr: false }
);

type TabType = "sent" | "received";

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<TabType>("received");
  const { isConnected, address, connect } = useWallet();
  const { isReady: isStorachaReady } = useStoracha();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* Main Content - Always visible but blurred when not connected */}
      <div
        className={`mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 ${!isConnected ? "pointer-events-none select-none blur-sm" : ""}`}
      >
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 font-display text-3xl font-bold">Messages</h1>
            <p className="text-dark-400">Your time-locked messages</p>
          </div>
          <Link
            href="/app/create"
            className="btn-primary inline-flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Create Message
          </Link>
        </div>

        {/* Storage Warning */}
        {isConnected && !isStorachaReady && (
          <div className="card-glass mb-6 border-yellow-500/30 bg-yellow-500/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                <p className="text-sm text-dark-300">
                  Connect to Storacha Network to create messages
                </p>
              </div>
              <Link
                href="/app/settings"
                className="text-sm text-brand-400 hover:underline"
              >
                Set up storage →
              </Link>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              activeTab === "received"
                ? "border border-brand-500/30 bg-brand-500/10 text-brand-400"
                : "text-dark-400 hover:bg-dark-800/50 hover:text-dark-200"
            }`}
          >
            <InboxIcon className="h-5 w-5" />
            Received
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              activeTab === "sent"
                ? "border border-brand-500/30 bg-brand-500/10 text-brand-400"
                : "text-dark-400 hover:bg-dark-800/50 hover:text-dark-200"
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            Sent
          </button>
        </div>

        {/* Messages Content */}
        <div className="card-glass p-6">
          {isConnected ? (
            <>
              {activeTab === "received" && (
                <ReceivedMessages address={address!} />
              )}
              {activeTab === "sent" && <SentMessages address={address!} />}
            </>
          ) : (
            // Placeholder content when not connected
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg bg-dark-800/50"
                />
              ))}
            </div>
          )}
        </div>

        {/* Key Backup Warning */}
        {isConnected && <KeyBackupWarning />}
      </div>

      {/* Wallet Connection Overlay */}
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-950/60 backdrop-blur-sm">
          <div className="card-glass mx-4 max-w-md animate-scale-in p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-500/20 bg-brand-500/10">
              <WalletIcon className="h-8 w-8 text-brand-400" />
            </div>
            <h2 className="mb-3 font-display text-2xl font-bold">
              Connect Your Wallet
            </h2>
            <p className="mb-6 text-dark-400">
              Connect your Talisman or MetaMask wallet to view and create
              time-locked messages.
            </p>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="btn-primary mb-4 w-full disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
            <p className="text-xs text-dark-500">
              Use an Ethereum account (0x...) for Passet Hub compatibility
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
