/**
 * Wallet account interface compatible with both Ethereum and Polkadot wallets
 */
export interface WalletAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
  type: 'ethereum' | 'polkadot';
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  accounts: WalletAccount[];
  selectedAccount: WalletAccount | null;
}

export interface WalletContextValue extends WalletState {
  connect: (preferredAddress?: string) => Promise<void>;
  disconnect: () => void;
  selectAccount: (address: string) => void;
  signMessage: (message: string) => Promise<string>;
  isHealthy: boolean;
  checkHealth: () => Promise<boolean>;
  reconnect: () => Promise<void>;
  onConnectionChange: (listener: (connected: boolean) => void) => () => void;
}
