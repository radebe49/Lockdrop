"use client";

import React from "react";
import { useWallet } from "@/lib/wallet/WalletProvider";

export function AccountSelector() {
  const { accounts, selectedAccount, selectAccount, isConnected } = useWallet();

  if (!isConnected || accounts.length <= 1) {
    return null;
  }

  return (
    <div className="w-full max-w-md">
      <label
        htmlFor="account-select"
        className="mb-2 block text-sm font-medium"
      >
        Select Account
      </label>
      <select
        id="account-select"
        value={selectedAccount?.address || ""}
        onChange={(e) => selectAccount(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
      >
        {accounts.map((account) => (
          <option key={account.address} value={account.address}>
            {account.meta.name || "Unnamed Account"} (
            {account.address.slice(0, 8)}...{account.address.slice(-6)})
          </option>
        ))}
      </select>
    </div>
  );
}
