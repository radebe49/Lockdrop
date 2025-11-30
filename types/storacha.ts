/**
 * Type definitions for Storacha Network client
 *
 * These types supplement the @storacha/client package types
 * which may be incomplete or outdated.
 */

/**
 * Storacha Space DID format
 */
export type SpaceDID = `did:${string}:${string}`;

/**
 * Storacha Account DID format (email-based)
 */
export type AccountDID = `did:mailto:${string}:${string}`;

/**
 * Email format for Storacha login
 */
export type EmailAddress = `${string}@${string}`;

/**
 * Storacha Space interface
 */
export interface StorachaSpace {
  did(): SpaceDID;
  name?: string;
}

/**
 * Storacha Account interface
 */
export interface StorachaAccount {
  did(): AccountDID;
}

/**
 * Storacha upload shard metadata
 */
export interface ShardStoredMeta {
  size: number;
}

/**
 * Storacha upload options
 */
export interface StorachaUploadOptions {
  onShardStored?: (meta: ShardStoredMeta) => void;
}

/**
 * Extended Storacha client interface with optional methods
 * that may not be present in all versions
 */
export interface ExtendedStorachaClient {
  login(email: EmailAddress): Promise<void>;
  createSpace(name: string, options?: { account: StorachaAccount }): Promise<StorachaSpace>;
  setCurrentSpace(did: SpaceDID): Promise<void>;
  currentSpace(): StorachaSpace | undefined;
  accounts(): Record<AccountDID, StorachaAccount>;
  uploadFile(file: File, options?: StorachaUploadOptions): Promise<{ toString(): string }>;
  /** Optional method - may not exist in all versions */
  waitForPaymentPlan?: () => Promise<void>;
}

/**
 * Type guard to check if client has waitForPaymentPlan method
 */
export function hasWaitForPaymentPlan(
  client: unknown
): client is { waitForPaymentPlan: () => Promise<void> } {
  return (
    typeof client === "object" &&
    client !== null &&
    "waitForPaymentPlan" in client &&
    typeof (client as Record<string, unknown>).waitForPaymentPlan === "function"
  );
}
