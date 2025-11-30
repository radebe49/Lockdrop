"use client";

/**
 * WalletProvider - Ethereum wallet connection using EIP-1193 (window.ethereum)
 *
 * Supports MetaMask and Talisman Ethereum accounts
 * Returns Ethereum addresses (0x...) compatible with ethers.js and Passet Hub
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { WalletState, WalletContextValue } from "@/types/wallet";
import { withTimeout, TIMEOUTS, TimeoutError } from "@/utils/timeout";
import { ErrorLogger } from "@/lib/monitoring/ErrorLogger";

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const STORAGE_KEY = "lockdrop_wallet_connection";
const LOG_CONTEXT = "WalletProvider";
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

interface WalletProviderProps {
  children: React.ReactNode;
}

// EIP-1193 Provider interface
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    handler: (...args: unknown[]) => void
  ) => void;
  isMetaMask?: boolean;
  isTalisman?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function WalletProvider({ children }: WalletProviderProps) {
  const isInitialMount = useRef(true);
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    accounts: [],
    selectedAccount: null,
  });
  const [isHealthy, setIsHealthy] = useState(true);
  const connectionListeners = useRef<Set<(connected: boolean) => void>>(
    new Set()
  );

  // Try to restore wallet connection on mount
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const attemptReconnect = async () => {
      try {
        // Check if wallet was previously connected
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const { wasConnected } = JSON.parse(stored);
        if (!wasConnected) return;

        // Check if ethereum provider is available
        if (typeof window === "undefined" || !window.ethereum) return;

        // Try to get accounts without triggering popup
        const accounts = (await window.ethereum.request({
          method: "eth_accounts",
        })) as string[];

        if (accounts && accounts.length > 0) {
          ErrorLogger.info(LOG_CONTEXT, "Restoring previous connection");

          const walletName = window.ethereum.isTalisman
            ? "Talisman"
            : window.ethereum.isMetaMask
              ? "MetaMask"
              : "Ethereum Wallet";

          const selectedAddress = accounts[0];
          const selectedAccount = {
            address: selectedAddress,
            meta: {
              name: `${walletName} Account`,
              source: walletName,
            },
            type: "ethereum" as const,
          };

          const allAccounts = accounts.map((addr, index) => ({
            address: addr,
            meta: {
              name: `${walletName} Account ${index + 1}`,
              source: walletName,
            },
            type: "ethereum" as const,
          }));

          setState({
            isConnected: true,
            address: selectedAddress,
            accounts: allAccounts,
            selectedAccount,
          });

          setIsHealthy(true);
        }
      } catch (error) {
        ErrorLogger.debug(LOG_CONTEXT, "Could not restore connection", {
          error: error instanceof Error ? error.message : String(error),
        });
        // Clear invalid stored state
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    attemptReconnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountsArray = accounts as string[];
      ErrorLogger.info(LOG_CONTEXT, "Accounts changed", { count: accountsArray.length });

      if (accountsArray.length === 0) {
        // User disconnected wallet
        disconnect();
      } else if (state.isConnected && accountsArray[0] !== state.address) {
        // Account switched
        const newAddress = accountsArray[0];
        setState((prev) => ({
          ...prev,
          address: newAddress,
          selectedAccount: {
            address: newAddress,
            meta: {
              name: "Ethereum Account",
              source: window.ethereum?.isMetaMask ? "MetaMask" : "Talisman",
            },
            type: "ethereum",
          },
        }));
      }
    };

    const handleChainChanged = () => {
      ErrorLogger.info(LOG_CONTEXT, "Chain changed, reloading...");
      window.location.reload();
    };

    if (window.ethereum.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isConnected, state.address]);

  const connect = useCallback(async (preferredAddress?: string) => {
    try {
      // Check if ethereum provider exists
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error(
          "No Ethereum wallet detected. Please install Talisman wallet extension (recommended) or MetaMask as an alternative."
        );
      }

      // Detect wallet type - prioritize Talisman
      const isTalisman = window.ethereum.isTalisman;
      const isMetaMask = window.ethereum.isMetaMask && !isTalisman;

      let walletName = "Ethereum Wallet";
      if (isTalisman) {
        walletName = "Talisman";
        ErrorLogger.info(LOG_CONTEXT, "Talisman wallet detected (recommended)");
      } else if (isMetaMask) {
        walletName = "MetaMask";
        ErrorLogger.info(LOG_CONTEXT, "MetaMask wallet detected (alternative)");
      } else {
        ErrorLogger.info(LOG_CONTEXT, "Generic Ethereum wallet detected");
      }

      ErrorLogger.debug(LOG_CONTEXT, "Requesting Ethereum accounts...");

      // Request accounts (triggers wallet popup)
      const accounts = await withTimeout(
        window.ethereum.request({ method: "eth_requestAccounts" }) as Promise<
          string[]
        >,
        TIMEOUTS.WALLET_ENABLE,
        "Request Ethereum accounts"
      );

      ErrorLogger.info(LOG_CONTEXT, `Found ${accounts.length} Ethereum account(s)`);

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No Ethereum accounts found. Please create an Ethereum account in your wallet."
        );
      }

      // Select account
      const selectedAddress =
        preferredAddress && accounts.includes(preferredAddress)
          ? preferredAddress
          : accounts[0];

      const selectedAccount = {
        address: selectedAddress,
        meta: {
          name: `${walletName} Account`,
          source: walletName,
        },
        type: "ethereum" as const,
      };

      // Convert all accounts to the format expected by the app
      const allAccounts = accounts.map((addr, index) => ({
        address: addr,
        meta: {
          name: `${walletName} Account ${index + 1}`,
          source: walletName,
        },
        type: "ethereum" as const,
      }));

      ErrorLogger.info(LOG_CONTEXT, "Successfully connected", { address: selectedAddress });

      setState({
        isConnected: true,
        address: selectedAddress,
        accounts: allAccounts,
        selectedAccount,
      });

      // Persist connection state
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ wasConnected: true }));

      setIsHealthy(true);
    } catch (error) {
      ErrorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        LOG_CONTEXT,
        { operation: "connect" }
      );

      if (error instanceof TimeoutError) {
        throw new Error(
          "Wallet connection timed out. Please ensure your wallet extension is unlocked and responsive."
        );
      }

      if (error instanceof Error) {
        // User rejected the request
        if (
          error.message.includes("User rejected") ||
          error.message.includes("User denied")
        ) {
          throw new Error(
            "Connection rejected. Please approve the connection request in your wallet."
          );
        }
        throw error;
      }

      // Handle RPC error codes
      const rpcError = error as { code?: number };
      if (rpcError?.code === -32002) {
        throw new Error(
          "A wallet connection request is already pending. Please check for a hidden popup window, or refresh the page and try again."
        );
      }

      throw new Error("Failed to connect wallet. Please try again.");
    }
  }, []);

  const disconnect = useCallback(() => {
    ErrorLogger.info(LOG_CONTEXT, "Disconnecting wallet");
    setState({
      isConnected: false,
      address: null,
      accounts: [],
      selectedAccount: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const selectAccount = useCallback(
    (address: string) => {
      const account = state.accounts.find((acc) => acc.address === address);
      if (account) {
        setState((prev) => ({
          ...prev,
          address: account.address,
          selectedAccount: account,
        }));
      }
    },
    [state.accounts]
  );

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!state.selectedAccount) {
        throw new Error("No account selected");
      }

      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("Ethereum wallet not available");
      }

      try {
        ErrorLogger.debug(LOG_CONTEXT, "Requesting message signature...");

        // Convert message to hex
        const messageHex = "0x" + Buffer.from(message, "utf8").toString("hex");

        // Request signature using personal_sign (EIP-191)
        const signature = await withTimeout(
          window.ethereum.request({
            method: "personal_sign",
            params: [messageHex, state.selectedAccount.address],
          }) as Promise<string>,
          TIMEOUTS.WALLET_SIGN,
          "Sign message"
        );

        ErrorLogger.debug(LOG_CONTEXT, "Message signed successfully");
        return signature;
      } catch (error) {
        ErrorLogger.error(
          error instanceof Error ? error : new Error(String(error)),
          LOG_CONTEXT,
          { operation: "signMessage" }
        );

        if (error instanceof TimeoutError) {
          throw new Error(
            "Message signing timed out. Please check your wallet extension and try again."
          );
        }

        if (error instanceof Error && error.message.includes("User rejected")) {
          throw new Error(
            "Signature rejected. Please approve the signature request in your wallet."
          );
        }

        throw error;
      }
    },
    [state.selectedAccount]
  );

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window === "undefined") return false;
      return !!window.ethereum;
    } catch {
      return false;
    }
  }, []);

  const reconnect = useCallback(async () => {
    ErrorLogger.info(LOG_CONTEXT, "Manual reconnection triggered");
    const previousAddress = state.address;
    disconnect();
    // Brief delay to ensure clean disconnect before reconnecting
    await new Promise((resolve) => setTimeout(resolve, 500));
    await connect(previousAddress || undefined);
  }, [connect, disconnect, state.address]);

  const onConnectionChange = useCallback(
    (listener: (connected: boolean) => void): (() => void) => {
      connectionListeners.current.add(listener);
      listener(state.isConnected);
      return () => connectionListeners.current.delete(listener);
    },
    [state.isConnected]
  );

  // Notify listeners when connection state changes
  useEffect(() => {
    connectionListeners.current.forEach((listener) => {
      try {
        listener(state.isConnected);
      } catch (error) {
        console.error("Error in wallet connection listener:", error);
      }
    });
  }, [state.isConnected]);

  // Periodic health check with visibility API optimization
  useEffect(() => {
    if (!state.isConnected) {
      setIsHealthy(true);
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let isPageVisible = !document.hidden;

    const performHealthCheck = async () => {
      // Skip health checks when page is not visible
      if (!isPageVisible) return;

      const healthy = await checkHealth();
      setIsHealthy(healthy);

      if (!healthy) {
        ErrorLogger.warn(LOG_CONTEXT, "Health check failed - wallet may be unavailable");
      }
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        // Perform immediate health check when page becomes visible
        performHealthCheck();
      }
    };

    // Listen for visibility changes to pause/resume health checks
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial health check
    performHealthCheck();
    
    // Set up interval for periodic checks
    intervalId = setInterval(performHealthCheck, HEALTH_CHECK_INTERVAL);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.isConnected, checkHealth]);

  const value: WalletContextValue = {
    ...state,
    connect,
    disconnect,
    selectAccount,
    signMessage,
    isHealthy,
    checkHealth,
    reconnect,
    onConnectionChange,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
