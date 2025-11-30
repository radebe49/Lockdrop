"use client";

import { useState, useEffect } from "react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AppStorage, STORAGE_KEYS } from "@/utils/storage";

export function KeyBackupWarning() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash

  useEffect(() => {
    const dismissed = AppStorage.get<boolean>(STORAGE_KEYS.KEY_BACKUP_DISMISSED);
    setIsDismissed(dismissed === true);
  }, []);

  const handleDismiss = () => {
    AppStorage.set(STORAGE_KEYS.KEY_BACKUP_DISMISSED, true);
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="card-glass mt-6 border-yellow-500/30 bg-yellow-500/5 p-4">
      <div className="flex gap-3">
        <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
        <div className="flex-1">
          <h3 className="mb-1 font-medium text-yellow-400">
            Back Up Your Wallet
          </h3>
          <p className="mb-2 text-sm text-dark-300">
            If you lose access to your wallet, you cannot decrypt received
            messages. Back up your seed phrase securely offline.
          </p>
          <button
            onClick={handleDismiss}
            className="text-xs text-dark-400 transition-colors hover:text-dark-200"
          >
            I understand, don&apos;t show again
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="text-dark-500 transition-colors hover:text-dark-300"
          aria-label="Dismiss warning"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
