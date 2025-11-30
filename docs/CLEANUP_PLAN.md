# Lockdrop Codebase Cleanup Plan

**Created:** November 30, 2025  
**Status:** Planning Phase  
**Purpose:** Document all cleanup tasks with before/after states for systematic improvement

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase 1: Documentation Cleanup](#phase-1-documentation-cleanup)
3. [Phase 2: Dead Code Removal](#phase-2-dead-code-removal)
4. [Phase 3: Code Consolidation](#phase-3-code-consolidation)
5. [Phase 4: Technical Debt Resolution](#phase-4-technical-debt-resolution)
6. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

### Current State Metrics

| Category | Count | Issue |
|----------|-------|-------|
| Root-level .md files | 9 | Some redundant/outdated |
| /docs .md files | 19 | Significant overlap |
| Deprecated functions | 1 | `isValidPolkadotAddress` |
| localStorage keys | 5 | Not centralized |
| `any` type warnings | 2 | In ContractService |
| Dead/empty files | 1 | `errors` file |
| One-time scripts | 3 | Migration scripts |

### Target State

- Reduce documentation from 28 files to ~15 focused files
- Zero deprecated function usage
- Centralized storage utility
- Zero `any` type warnings
- Clean file structure

---

## Phase 1: Documentation Cleanup

### 1.1 Files to DELETE (Unnecessary)

#### File: `errors` (root)

**Reason:** Empty file with no purpose

```
BEFORE:
├── errors                    # Empty file, 0 bytes

AFTER:
├── (deleted)
```

**Action:** `rm errors`

---

#### File: `.github/TIMEOUT_IMPLEMENTATION_CHECKLIST.md`

**Reason:** Implementation tracking doc - work is complete

```
BEFORE:
.github/
├── TIMEOUT_IMPLEMENTATION_CHECKLIST.md   # 400+ lines, tracking completed work

AFTER:
.github/
├── (deleted or moved to archive)
```

**Action:** Delete or move to `.github/archive/`

---

### 1.2 Files to ARCHIVE (Historical)

#### File: `docs/CONNECTION_IMPROVEMENTS.md`

**Reason:** Internal dev notes about past improvements, no longer needed

```markdown
BEFORE (docs/CONNECTION_IMPROVEMENTS.md):
# Connection Flow Improvements

## Problem Summary
The application had a poor UX loop where:
1. Wallet connections didn't persist across page refreshes
2. Storacha authentication flow was fragile...
[198 lines of historical implementation notes]

AFTER:
(Moved to docs/archive/CONNECTION_IMPROVEMENTS.md or deleted)
```

---

#### File: `docs/MIGRATION_GUIDE.md`

**Reason:** One-time migration guide for connection improvements - migration complete

```markdown
BEFORE (docs/MIGRATION_GUIDE.md):
# Migration Guide - Connection Improvements

## For Existing Users
If you've used Lockdrop before this update...
[257 lines of one-time migration instructions]

AFTER:
(Moved to docs/archive/MIGRATION_GUIDE.md or deleted)
```

---

#### Scripts to Archive

```
BEFORE:
scripts/
├── verify-ethers-migration.js      # One-time migration verification
├── verify-ethers-implementation.js # One-time implementation check
├── verify-no-message-cache.sh      # One-time cache verification

AFTER:
scripts/
├── archive/
│   ├── verify-ethers-migration.js
│   ├── verify-ethers-implementation.js
│   └── verify-no-message-cache.sh
```

---

### 1.3 Files to UPDATE (Outdated)

#### File: `CURRENT_STATUS.md`

**Reason:** Dated "November 17, 2025" - needs update or removal

```markdown
BEFORE (CURRENT_STATUS.md):
# Lockdrop - Current Status

**Last Updated**: November 17, 2025  
**Version**: 1.0.0  
**Status**: ✅ FULLY FUNCTIONAL
...

AFTER (Option A - Update):
# Lockdrop - Current Status

**Last Updated**: November 30, 2025  
**Version**: 1.0.2  
**Status**: ✅ FULLY FUNCTIONAL

## Recent Changes (v1.0.2)
- Centralized logging with ErrorLogger
- Consolidated retry logic
- Visibility API optimization for health checks
...

AFTER (Option B - Remove):
(Delete file - README.md covers project status)
```

**Recommendation:** Option B - Remove, as README.md is the canonical source

---

### 1.4 Documentation Consolidation

#### Error Handling Docs (3 → 1)

```
BEFORE:
docs/
├── ERROR_HANDLING_IMPLEMENTATION.md    # 427 lines
├── ERROR_HANDLING_QUICK_REFERENCE.md   # 354 lines  
├── ERROR_BOUNDARY_ARCHITECTURE.md      # 217 lines
Total: 998 lines across 3 files

AFTER:
docs/
├── ERROR_HANDLING.md                   # ~400 lines (consolidated)
```

**Consolidated Structure:**
```markdown
# Error Handling Guide

## Quick Reference
[From ERROR_HANDLING_QUICK_REFERENCE.md - essential patterns only]

## Architecture
[From ERROR_BOUNDARY_ARCHITECTURE.md - diagram + key concepts]

## Implementation Details
[From ERROR_HANDLING_IMPLEMENTATION.md - condensed]

## Testing
[Consolidated testing guidance]
```

---

#### Connection Docs (4 → 1)

```
BEFORE:
docs/
├── CONNECTION_FLOW_DIAGRAM.md    # 452 lines
├── CONNECTION_QUICK_REF.md       # 332 lines
├── CONNECTION_IMPROVEMENTS.md    # 198 lines (archive)
├── USER_CONNECTION_GUIDE.md      # 157 lines
Total: 1139 lines across 4 files

AFTER:
docs/
├── CONNECTION_GUIDE.md           # ~300 lines (consolidated)
```

---

#### Wallet Docs (2 → 1)

```
BEFORE (root):
├── WALLET_SETUP_GUIDE.md         # 213 lines
├── WALLET_TROUBLESHOOTING.md     # 304 lines
Total: 517 lines across 2 files

AFTER (root):
├── WALLET_GUIDE.md               # ~350 lines (consolidated)
```

**Consolidated Structure:**
```markdown
# Wallet Guide

## Setup
[From WALLET_SETUP_GUIDE.md]

## Troubleshooting
[From WALLET_TROUBLESHOOTING.md]
```

---

#### Quick Reference Docs (2 → 1)

```
BEFORE (root):
├── ETHERS_QUICK_REFERENCE.md      # 387 lines
├── PASSET_HUB_QUICK_REFERENCE.md  # 144 lines
Total: 531 lines across 2 files

AFTER (root):
├── QUICK_REFERENCE.md             # ~300 lines (consolidated)
```

---

### 1.5 Proposed Final Documentation Structure

```
BEFORE (28 documentation files):
Root:
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CI_CD_GUIDE.md
├── CURRENT_STATUS.md              # Remove
├── ETHERS_QUICK_REFERENCE.md      # Consolidate
├── PASSET_HUB_QUICK_REFERENCE.md  # Consolidate
├── WALLET_SETUP_GUIDE.md          # Consolidate
├── WALLET_TROUBLESHOOTING.md      # Consolidate

docs/:
├── CODE_DEBT_ANALYSIS.md
├── CONNECTION_FLOW_DIAGRAM.md     # Consolidate
├── CONNECTION_IMPROVEMENTS.md     # Archive
├── CONNECTION_QUICK_REF.md        # Consolidate
├── developer-guide.md
├── EDGE_CASE_TESTING.md
├── ERROR_BOUNDARY_ARCHITECTURE.md # Consolidate
├── ERROR_HANDLING_IMPLEMENTATION.md # Consolidate
├── ERROR_HANDLING_QUICK_REFERENCE.md # Consolidate
├── MANUAL_TESTING_GUIDE.md
├── MIGRATION_GUIDE.md             # Archive
├── NETWORK_RESILIENCE.md
├── RPC_ENDPOINTS.md
├── SECURITY_AUDIT.md
├── STORACHA_SETUP.md
├── TESTING_SUMMARY.md
├── TIMEOUT_ARCHITECTURE.md
├── user-guide.md
├── USER_CONNECTION_GUIDE.md       # Consolidate

AFTER (15 documentation files):
Root:
├── README.md                      # Project overview
├── CHANGELOG.md                   # Version history
├── CONTRIBUTING.md                # Contribution guide
├── CI_CD_GUIDE.md                 # CI/CD setup
├── WALLET_GUIDE.md                # Wallet setup + troubleshooting
├── QUICK_REFERENCE.md             # Ethers + Passet Hub combined

docs/:
├── CODE_DEBT_ANALYSIS.md          # Technical debt tracking
├── CONNECTION_GUIDE.md            # All connection docs combined
├── developer-guide.md             # Developer documentation
├── ERROR_HANDLING.md              # All error docs combined
├── NETWORK_RESILIENCE.md          # Network handling
├── SECURITY_AUDIT.md              # Security documentation
├── STORACHA_SETUP.md              # Storage setup
├── TESTING.md                     # All testing docs combined
├── user-guide.md                  # End-user guide

docs/archive/:                     # Historical docs
├── CONNECTION_IMPROVEMENTS.md
├── MIGRATION_GUIDE.md
├── TIMEOUT_IMPLEMENTATION_CHECKLIST.md
```

---

## Phase 2: Dead Code Removal

### 2.1 Empty Files

#### File: `errors` (root)

```bash
# Verification
$ cat errors
(empty)

$ wc -l errors
0 errors

# Action
$ rm errors
```

---

### 2.2 Duplicate ABI Files

```
BEFORE:
contract/
├── abi.json              # Original ABI
├── FutureProof.abi.json  # Possibly duplicate
├── solidity-abi.json     # Used by ContractService

# Verification needed:
$ diff contract/abi.json contract/FutureProof.abi.json
$ diff contract/abi.json contract/solidity-abi.json
```

**Action:** Verify which is canonical, remove duplicates, update imports

---

### 2.3 Deprecated Function Usage

#### Function: `isValidPolkadotAddress`

```typescript
// BEFORE (utils/edgeCaseValidation.ts):
/**
 * @deprecated Use isValidEthereumAddress instead
 */
export function isValidPolkadotAddress(address: string): boolean {
  console.warn(
    "isValidPolkadotAddress is deprecated. Use isValidEthereumAddress instead."
  );
  return isValidEthereumAddress(address);
}

// BEFORE (tests/edge-cases.test.ts):
import {
  isValidPolkadotAddress,  // Using deprecated function
  // ...
} from "@/utils/edgeCaseValidation";

describe("Address Validation", () => {
  test("accepts valid Ethereum addresses (via deprecated Polkadot function)", () => {
    expect(isValidPolkadotAddress(address)).toBe(true);  // Deprecated
  });
});

// AFTER (tests/edge-cases.test.ts):
import {
  isValidEthereumAddress,  // Use current function
  // ...
} from "@/utils/edgeCaseValidation";

describe("Address Validation", () => {
  test("accepts valid Ethereum addresses", () => {
    expect(isValidEthereumAddress(address)).toBe(true);  // Current
  });
});
```

**Files to Update:**
- `tests/edge-cases.test.ts` - Replace all `isValidPolkadotAddress` with `isValidEthereumAddress`

---

## Phase 3: Code Consolidation

### 3.1 Centralized localStorage Utility

#### Current State (Scattered Keys)

```typescript
// BEFORE - Keys scattered across files:

// lib/wallet/WalletProvider.tsx
const STORAGE_KEY = "lockdrop_wallet_connection";
localStorage.setItem(STORAGE_KEY, JSON.stringify({ wasConnected: true }));

// lib/storage/StorachaService.ts
const STORAGE_KEY = "lockdrop_storacha_auth";
localStorage.setItem(STORAGE_KEY, JSON.stringify(this.authState));

// components/dashboard/ReceivedMessages.tsx
const viewedKey = `message_viewed_${metadata.id}`;
localStorage.getItem(viewedKey);

// app/claim/[packageCID]/page.tsx
localStorage.getItem("claimedMessages");

// components/wallet/KeyBackupWarning.tsx
const STORAGE_KEY = "lockdrop_key_backup_dismissed";
localStorage.getItem(STORAGE_KEY);
```

#### Proposed Solution

```typescript
// AFTER - utils/storage.ts

/**
 * Centralized localStorage utility with typed keys
 */

export const STORAGE_KEYS = {
  WALLET_CONNECTION: "lockdrop_wallet_connection",
  STORACHA_AUTH: "lockdrop_storacha_auth",
  KEY_BACKUP_DISMISSED: "lockdrop_key_backup_dismissed",
  CLAIMED_MESSAGES: "lockdrop_claimed_messages",
  MESSAGE_VIEWED_PREFIX: "lockdrop_message_viewed_",
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Type-safe localStorage wrapper with error handling
 */
export const AppStorage = {
  get<T>(key: StorageKey): T | null {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: StorageKey, value: T): boolean {
    if (typeof window === "undefined") return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key: StorageKey): boolean {
    if (typeof window === "undefined") return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  // Special methods for prefixed keys
  getMessageViewed(messageId: string): boolean {
    const key = `${STORAGE_KEYS.MESSAGE_VIEWED_PREFIX}${messageId}`;
    return localStorage.getItem(key) === "true";
  },

  setMessageViewed(messageId: string): void {
    const key = `${STORAGE_KEYS.MESSAGE_VIEWED_PREFIX}${messageId}`;
    localStorage.setItem(key, "true");
  },
};
```

#### Migration Examples

```typescript
// BEFORE (lib/wallet/WalletProvider.tsx):
const STORAGE_KEY = "lockdrop_wallet_connection";
localStorage.setItem(STORAGE_KEY, JSON.stringify({ wasConnected: true }));
const stored = localStorage.getItem(STORAGE_KEY);

// AFTER (lib/wallet/WalletProvider.tsx):
import { AppStorage, STORAGE_KEYS } from "@/utils/storage";
AppStorage.set(STORAGE_KEYS.WALLET_CONNECTION, { wasConnected: true });
const stored = AppStorage.get<{ wasConnected: boolean }>(STORAGE_KEYS.WALLET_CONNECTION);
```

---

### 3.2 Shared Message Status Hook

#### Current State (Duplicated Logic)

```typescript
// BEFORE - Duplicated in ReceivedMessages.tsx and SentMessages.tsx:

// components/dashboard/ReceivedMessages.tsx (lines 40-60)
const convertToMessage = useCallback((metadata: MessageMetadata): Message => {
  const viewedKey = `message_viewed_${metadata.id}`;
  const hasBeenViewed = localStorage.getItem(viewedKey) === "true";
  const status = calculateMessageStatus(metadata.unlockTimestamp, hasBeenViewed);
  return {
    id: metadata.id,
    // ... same mapping logic
  };
}, []);

// components/dashboard/SentMessages.tsx (lines 35-55)
const convertToMessage = useCallback((metadata: MessageMetadata): Message => {
  const status = calculateMessageStatus(metadata.unlockTimestamp, false);
  return {
    id: metadata.id,
    // ... same mapping logic
  };
}, []);
```

#### Proposed Solution

```typescript
// AFTER - hooks/useMessageConversion.ts

import { useCallback } from "react";
import { Message, MessageMetadata } from "@/types/contract";
import { calculateMessageStatus } from "@/utils/dateUtils";
import { AppStorage } from "@/utils/storage";

interface UseMessageConversionOptions {
  checkViewed?: boolean;
}

export function useMessageConversion(options: UseMessageConversionOptions = {}) {
  const { checkViewed = false } = options;

  const convertToMessage = useCallback(
    (metadata: MessageMetadata): Message => {
      const hasBeenViewed = checkViewed
        ? AppStorage.getMessageViewed(metadata.id)
        : false;

      const status = calculateMessageStatus(
        metadata.unlockTimestamp,
        hasBeenViewed
      );

      return {
        id: metadata.id,
        encryptedKeyCID: metadata.encryptedKeyCID,
        encryptedMessageCID: metadata.encryptedMessageCID,
        messageHash: metadata.messageHash,
        unlockTimestamp: metadata.unlockTimestamp,
        sender: metadata.sender,
        recipient: metadata.recipient,
        status,
        createdAt: metadata.createdAt,
      };
    },
    [checkViewed]
  );

  const convertMessages = useCallback(
    (metadataList: MessageMetadata[]): Message[] => {
      return metadataList.map(convertToMessage);
    },
    [convertToMessage]
  );

  return { convertToMessage, convertMessages };
}

// Usage in ReceivedMessages.tsx:
const { convertMessages } = useMessageConversion({ checkViewed: true });
const messagesWithStatus = convertMessages(metadata);

// Usage in SentMessages.tsx:
const { convertMessages } = useMessageConversion({ checkViewed: false });
const messagesWithStatus = convertMessages(metadata);
```

---

### 3.3 Shared Visibility-Aware Interval Hook

#### Current State (Duplicated Pattern)

```typescript
// BEFORE - Same pattern in 4 files:

// components/dashboard/ReceivedMessages.tsx
useEffect(() => {
  let intervalId: NodeJS.Timeout | null = null;
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      updateStatuses();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  intervalId = setInterval(() => {
    if (!document.hidden) {
      updateStatuses();
    }
  }, 10000);
  return () => {
    if (intervalId) clearInterval(intervalId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [updateStatuses]);

// Same pattern in:
// - components/dashboard/SentMessages.tsx
// - lib/wallet/WalletProvider.tsx
// - hooks/useNetworkStatus.ts
```

#### Proposed Solution

```typescript
// AFTER - hooks/useVisibilityInterval.ts

import { useEffect, useRef } from "react";

interface UseVisibilityIntervalOptions {
  /** Callback to run on interval */
  callback: () => void;
  /** Interval in milliseconds */
  interval: number;
  /** Whether to run immediately when page becomes visible */
  runOnVisible?: boolean;
  /** Whether the interval is enabled */
  enabled?: boolean;
}

/**
 * Hook that runs a callback on an interval, but only when the page is visible.
 * Automatically pauses when tab is hidden (battery optimization).
 */
export function useVisibilityInterval({
  callback,
  interval,
  runOnVisible = true,
  enabled = true,
}: UseVisibilityIntervalOptions) {
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

    document.addEventListener("visibilitychange", handleVisibilityChange);
    intervalId = setInterval(tick, interval);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [interval, runOnVisible, enabled]);
}

// Usage in ReceivedMessages.tsx:
useVisibilityInterval({
  callback: updateStatuses,
  interval: 10000,
  runOnVisible: true,
});

// Usage in WalletProvider.tsx:
useVisibilityInterval({
  callback: performHealthCheck,
  interval: 30000,
  enabled: state.isConnected,
});
```

---

## Phase 4: Technical Debt Resolution

### 4.1 Fix Remaining `any` Types

#### ContractService.ts - Line 338

```typescript
// BEFORE (lib/contract/ContractService.ts line 338):
return messages.map((msg: any, index: number) => ({
  id: index.toString(),
  encryptedKeyCID: msg.encryptedKeyCid,
  // ...
}));

// AFTER:
interface ContractMessageResponse {
  encryptedKeyCid: string;
  encryptedMessageCid: string;
  messageHash: string;
  unlockTimestamp: bigint;
  sender: string;
  recipient: string;
  createdAt: bigint;
}

return messages.map((msg: ContractMessageResponse, index: number) => ({
  id: index.toString(),
  encryptedKeyCID: msg.encryptedKeyCid,
  encryptedMessageCID: msg.encryptedMessageCid,
  messageHash: msg.messageHash,
  unlockTimestamp: Number(msg.unlockTimestamp),
  sender: msg.sender,
  recipient: msg.recipient,
  createdAt: Number(msg.createdAt),
}));
```

#### ContractService.ts - Line 369

```typescript
// BEFORE (lib/contract/ContractService.ts line 369):
return messages.map((msg: any, index: number) => ({
  // Same pattern
}));

// AFTER:
// Use same ContractMessageResponse interface
return messages.map((msg: ContractMessageResponse, index: number) => ({
  // ...
}));
```

---

### 4.2 Constants Centralization

#### Current State (Scattered Constants)

```typescript
// BEFORE - Hardcoded values scattered:

// lib/storage/StorachaService.ts
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000;

// lib/contract/ContractService.ts
// (uses withRetry with inline config)

// Various components
const ITEMS_PER_PAGE = 12;
```

#### Proposed Solution

```typescript
// AFTER - utils/constants.ts

export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 30000,
  BACKOFF_MULTIPLIER: 2,
  JITTER_FACTOR: 0.3,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const;

export const INTERVALS = {
  HEALTH_CHECK: 30000,      // 30 seconds
  STATUS_UPDATE: 10000,     // 10 seconds
  NETWORK_CHECK: 30000,     // 30 seconds
} as const;

export const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024,  // 100MB
  MAX_LOGS: 100,
} as const;
```

---

## Implementation Checklist

### Phase 1: Documentation Cleanup
- [ ] Delete `errors` file
- [ ] Archive `docs/CONNECTION_IMPROVEMENTS.md`
- [ ] Archive `docs/MIGRATION_GUIDE.md`
- [ ] Archive `.github/TIMEOUT_IMPLEMENTATION_CHECKLIST.md`
- [ ] Create `scripts/archive/` and move migration scripts
- [ ] Delete or update `CURRENT_STATUS.md`
- [ ] Consolidate error handling docs → `docs/ERROR_HANDLING.md`
- [ ] Consolidate connection docs → `docs/CONNECTION_GUIDE.md`
- [ ] Consolidate wallet docs → `WALLET_GUIDE.md`
- [ ] Consolidate quick reference docs → `QUICK_REFERENCE.md`
- [ ] Consolidate testing docs → `docs/TESTING.md`

### Phase 2: Dead Code Removal
- [ ] Delete `errors` file
- [ ] Verify and clean up duplicate ABI files
- [ ] Update tests to use `isValidEthereumAddress`
- [ ] Remove deprecated `isValidPolkadotAddress` (after tests updated)

### Phase 3: Code Consolidation
- [ ] Create `utils/storage.ts` with centralized localStorage
- [ ] Update all files to use `AppStorage`
- [ ] Create `hooks/useMessageConversion.ts`
- [ ] Create `hooks/useVisibilityInterval.ts`
- [ ] Update dashboard components to use new hooks

### Phase 4: Technical Debt
- [ ] Add `ContractMessageResponse` interface
- [ ] Fix `any` types in ContractService
- [ ] Create `utils/constants.ts`
- [ ] Update services to use centralized constants

---

## Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | Documentation cleanup | 2-3 hours |
| Phase 2 | Dead code removal | 30 minutes |
| Phase 3 | Code consolidation | 3-4 hours |
| Phase 4 | Technical debt | 1-2 hours |
| **Total** | | **7-10 hours** |

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Documentation files | 28 | ~15 |
| Deprecated function usage | 1 | 0 |
| localStorage implementations | 5 scattered | 1 centralized |
| `any` type warnings | 2 | 0 |
| Dead files | 1 | 0 |
| Duplicated code patterns | 3 | 0 |

---

## Notes

- All changes should be made incrementally with tests passing at each step
- Documentation consolidation should preserve all essential information
- Code changes should maintain backward compatibility
- Each phase can be done as a separate PR for easier review

---

**Document Version:** 1.0  
**Last Updated:** November 30, 2025


---

## Appendix A: Detailed Before/After Code Examples

### A.1 localStorage Migration - Complete Examples

#### WalletProvider.tsx

```typescript
// ============================================
// BEFORE (lib/wallet/WalletProvider.tsx)
// ============================================

const STORAGE_KEY = "lockdrop_wallet_connection";

// In attemptReconnect:
const stored = localStorage.getItem(STORAGE_KEY);
if (!stored) return;
const { wasConnected } = JSON.parse(stored);

// In connect:
localStorage.setItem(STORAGE_KEY, JSON.stringify({ wasConnected: true }));

// In disconnect:
localStorage.removeItem(STORAGE_KEY);

// ============================================
// AFTER (lib/wallet/WalletProvider.tsx)
// ============================================

import { AppStorage, STORAGE_KEYS } from "@/utils/storage";

// In attemptReconnect:
const stored = AppStorage.get<{ wasConnected: boolean }>(STORAGE_KEYS.WALLET_CONNECTION);
if (!stored?.wasConnected) return;

// In connect:
AppStorage.set(STORAGE_KEYS.WALLET_CONNECTION, { wasConnected: true });

// In disconnect:
AppStorage.remove(STORAGE_KEYS.WALLET_CONNECTION);
```

#### StorachaService.ts

```typescript
// ============================================
// BEFORE (lib/storage/StorachaService.ts)
// ============================================

const STORAGE_KEY = "lockdrop_storacha_auth";

private loadAuthState(): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      this.authState = parsed;
    }
  } catch (error) {
    ErrorLogger.warn(LOG_CONTEXT, "Failed to load auth state", { ... });
  }
}

private saveAuthState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.authState));
  } catch (error) {
    ErrorLogger.warn(LOG_CONTEXT, "Failed to save auth state", { ... });
  }
}

private clearAuthState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    ErrorLogger.warn(LOG_CONTEXT, "Failed to clear auth state", { ... });
  }
}

// ============================================
// AFTER (lib/storage/StorachaService.ts)
// ============================================

import { AppStorage, STORAGE_KEYS } from "@/utils/storage";

private loadAuthState(): void {
  const stored = AppStorage.get<AuthState>(STORAGE_KEYS.STORACHA_AUTH);
  if (stored) {
    this.authState = stored;
  }
}

private saveAuthState(): void {
  const success = AppStorage.set(STORAGE_KEYS.STORACHA_AUTH, this.authState);
  if (!success) {
    ErrorLogger.warn(LOG_CONTEXT, "Failed to save auth state");
  }
}

private clearAuthState(): void {
  AppStorage.remove(STORAGE_KEYS.STORACHA_AUTH);
}
```

#### ReceivedMessages.tsx

```typescript
// ============================================
// BEFORE (components/dashboard/ReceivedMessages.tsx)
// ============================================

const convertToMessage = useCallback((metadata: MessageMetadata): Message => {
  // Check if user has viewed this message (stored in localStorage)
  const viewedKey = `message_viewed_${metadata.id}`;
  const hasBeenViewed = localStorage.getItem(viewedKey) === "true";

  // Calculate status: only mark as "Unlocked" if actually viewed
  const status = calculateMessageStatus(
    metadata.unlockTimestamp,
    hasBeenViewed
  );

  return {
    id: metadata.id,
    encryptedKeyCID: metadata.encryptedKeyCID,
    encryptedMessageCID: metadata.encryptedMessageCID,
    messageHash: metadata.messageHash,
    unlockTimestamp: metadata.unlockTimestamp,
    sender: metadata.sender,
    recipient: metadata.recipient,
    status,
    createdAt: metadata.createdAt,
  };
}, []);

const updateStatuses = useCallback(() => {
  setMessages((prevMessages) =>
    prevMessages.map((message) => {
      // Check if user has viewed this message
      const viewedKey = `message_viewed_${message.id}`;
      const hasBeenViewed = localStorage.getItem(viewedKey) === "true";

      return {
        ...message,
        status: calculateMessageStatus(
          message.unlockTimestamp,
          hasBeenViewed
        ),
      };
    })
  );
}, []);

// ============================================
// AFTER (components/dashboard/ReceivedMessages.tsx)
// ============================================

import { useMessageConversion } from "@/hooks/useMessageConversion";
import { useVisibilityInterval } from "@/hooks/useVisibilityInterval";
import { AppStorage } from "@/utils/storage";
import { INTERVALS } from "@/utils/constants";

// Use the shared hook
const { convertMessages } = useMessageConversion({ checkViewed: true });

const updateStatuses = useCallback(() => {
  setMessages((prevMessages) =>
    prevMessages.map((message) => ({
      ...message,
      status: calculateMessageStatus(
        message.unlockTimestamp,
        AppStorage.getMessageViewed(message.id)
      ),
    }))
  );
}, []);

// Use visibility-aware interval
useVisibilityInterval({
  callback: updateStatuses,
  interval: INTERVALS.STATUS_UPDATE,
});
```

---

### A.2 Test File Updates

#### edge-cases.test.ts

```typescript
// ============================================
// BEFORE (tests/edge-cases.test.ts)
// ============================================

import {
  isValidPolkadotAddress,  // Deprecated
  isValidIPFSCID,
  isValidFutureTimestamp,
  // ...
} from "@/utils/edgeCaseValidation";

describe("Edge Case Validation", () => {
  describe("Address Validation", () => {
    const validAddresses = [
      "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "0xeD0fDD2be363590800F86ec8562Dde951654668F",
    ];

    test("accepts valid Ethereum addresses (via deprecated Polkadot function)", () => {
      validAddresses.forEach((address) => {
        // Using deprecated function - triggers console.warn
        expect(isValidPolkadotAddress(address)).toBe(true);
      });
    });

    test("rejects invalid addresses", () => {
      const invalidAddresses = ["", "invalid", "0x123"];
      invalidAddresses.forEach((address) => {
        // Using deprecated function
        expect(isValidPolkadotAddress(address as any)).toBe(false);
      });
    });
  });
});

// ============================================
// AFTER (tests/edge-cases.test.ts)
// ============================================

import {
  isValidEthereumAddress,  // Current function
  isValidIPFSCID,
  isValidFutureTimestamp,
  // ...
} from "@/utils/edgeCaseValidation";

describe("Edge Case Validation", () => {
  describe("Address Validation", () => {
    const validAddresses = [
      "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "0xeD0fDD2be363590800F86ec8562Dde951654668F",
    ];

    test("accepts valid Ethereum addresses", () => {
      validAddresses.forEach((address) => {
        // Using current function - no deprecation warning
        expect(isValidEthereumAddress(address)).toBe(true);
      });
    });

    test("rejects invalid addresses", () => {
      const invalidAddresses = ["", "invalid", "0x123"];
      invalidAddresses.forEach((address) => {
        expect(isValidEthereumAddress(address)).toBe(false);
      });
    });
  });
});
```

---

### A.3 ContractService Type Fixes

```typescript
// ============================================
// BEFORE (lib/contract/ContractService.ts)
// ============================================

static async getSentMessages(
  senderAddress: string
): Promise<MessageMetadata[]> {
  const contract = await this.getContract();

  const messages = await withTimeout(
    contract.getSentMessages.staticCall(senderAddress),
    TIMEOUTS.BLOCKCHAIN_QUERY,
    "Get sent messages"
  );

  // Using 'any' type - ESLint warning
  return messages.map((msg: any, index: number) => ({
    id: index.toString(),
    encryptedKeyCID: msg.encryptedKeyCid,
    encryptedMessageCID: msg.encryptedMessageCid,
    messageHash: msg.messageHash,
    unlockTimestamp: Number(msg.unlockTimestamp),
    sender: msg.sender,
    recipient: msg.recipient,
    createdAt: Number(msg.createdAt),
  }));
}

// ============================================
// AFTER (lib/contract/ContractService.ts)
// ============================================

/**
 * Raw message structure returned by the smart contract
 */
interface ContractMessageResponse {
  encryptedKeyCid: string;
  encryptedMessageCid: string;
  messageHash: string;
  unlockTimestamp: bigint;
  sender: string;
  recipient: string;
  createdAt: bigint;
}

static async getSentMessages(
  senderAddress: string
): Promise<MessageMetadata[]> {
  const contract = await this.getContract();

  const messages: ContractMessageResponse[] = await withTimeout(
    contract.getSentMessages.staticCall(senderAddress),
    TIMEOUTS.BLOCKCHAIN_QUERY,
    "Get sent messages"
  );

  // Properly typed - no ESLint warning
  return messages.map((msg, index) => ({
    id: index.toString(),
    encryptedKeyCID: msg.encryptedKeyCid,
    encryptedMessageCID: msg.encryptedMessageCid,
    messageHash: msg.messageHash,
    unlockTimestamp: Number(msg.unlockTimestamp),
    sender: msg.sender,
    recipient: msg.recipient,
    createdAt: Number(msg.createdAt),
  }));
}
```

---

### A.4 New Utility Files (Complete)

#### utils/storage.ts (New File)

```typescript
/**
 * Centralized localStorage utility
 * 
 * Provides type-safe access to localStorage with:
 * - Centralized key management
 * - Error handling
 * - SSR safety
 * - Type inference
 */

export const STORAGE_KEYS = {
  // Wallet
  WALLET_CONNECTION: "lockdrop_wallet_connection",
  
  // Storage
  STORACHA_AUTH: "lockdrop_storacha_auth",
  
  // UI State
  KEY_BACKUP_DISMISSED: "lockdrop_key_backup_dismissed",
  
  // Messages
  CLAIMED_MESSAGES: "lockdrop_claimed_messages",
  MESSAGE_VIEWED_PREFIX: "lockdrop_message_viewed_",
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Type-safe localStorage wrapper
 */
export const AppStorage = {
  /**
   * Get a value from localStorage
   */
  get<T>(key: StorageKey): T | null {
    if (typeof window === "undefined") return null;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },

  /**
   * Set a value in localStorage
   * @returns true if successful, false otherwise
   */
  set<T>(key: StorageKey, value: T): boolean {
    if (typeof window === "undefined") return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Remove a value from localStorage
   * @returns true if successful, false otherwise
   */
  remove(key: StorageKey): boolean {
    if (typeof window === "undefined") return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if a message has been viewed
   */
  getMessageViewed(messageId: string): boolean {
    if (typeof window === "undefined") return false;
    
    const key = `${STORAGE_KEYS.MESSAGE_VIEWED_PREFIX}${messageId}`;
    return localStorage.getItem(key) === "true";
  },

  /**
   * Mark a message as viewed
   */
  setMessageViewed(messageId: string): void {
    if (typeof window === "undefined") return;
    
    const key = `${STORAGE_KEYS.MESSAGE_VIEWED_PREFIX}${messageId}`;
    localStorage.setItem(key, "true");
  },

  /**
   * Get all claimed messages
   */
  getClaimedMessages(): string[] {
    const messages = this.get<string[]>(STORAGE_KEYS.CLAIMED_MESSAGES);
    return messages || [];
  },

  /**
   * Add a claimed message
   */
  addClaimedMessage(messageId: string): void {
    const messages = this.getClaimedMessages();
    if (!messages.includes(messageId)) {
      messages.push(messageId);
      this.set(STORAGE_KEYS.CLAIMED_MESSAGES, messages);
    }
  },
};
```

#### utils/constants.ts (New File)

```typescript
/**
 * Centralized application constants
 */

/**
 * Retry configuration for network operations
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,      // 1 second
  MAX_DELAY: 30000,         // 30 seconds
  BACKOFF_MULTIPLIER: 2,
  JITTER_FACTOR: 0.3,       // ±30%
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const;

/**
 * Interval timings (in milliseconds)
 */
export const INTERVALS = {
  HEALTH_CHECK: 30000,      // 30 seconds
  STATUS_UPDATE: 10000,     // 10 seconds
  NETWORK_CHECK: 30000,     // 30 seconds
} as const;

/**
 * Storage limits
 */
export const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024,  // 100MB
  MAX_LOGS: 100,
} as const;

/**
 * Supported media types
 */
export const MEDIA_TYPES = {
  VIDEO: ["video/mp4", "video/webm"],
  AUDIO: ["audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg"],
} as const;

/**
 * All supported media MIME types
 */
export const SUPPORTED_MEDIA_TYPES = [
  ...MEDIA_TYPES.VIDEO,
  ...MEDIA_TYPES.AUDIO,
] as const;
```

#### hooks/useVisibilityInterval.ts (New File)

```typescript
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
```

#### hooks/useMessageConversion.ts (New File)

```typescript
"use client";

import { useCallback } from "react";
import { Message } from "@/types/contract";
import { MessageMetadata } from "@/lib/contract/ContractService";
import { calculateMessageStatus } from "@/utils/dateUtils";
import { AppStorage } from "@/utils/storage";

interface UseMessageConversionOptions {
  /** Whether to check if messages have been viewed (for received messages) */
  checkViewed?: boolean;
}

/**
 * Hook for converting contract message metadata to UI message format
 * 
 * @example
 * ```tsx
 * // For received messages (check viewed status)
 * const { convertMessages } = useMessageConversion({ checkViewed: true });
 * 
 * // For sent messages (don't check viewed status)
 * const { convertMessages } = useMessageConversion({ checkViewed: false });
 * ```
 */
export function useMessageConversion(
  options: UseMessageConversionOptions = {}
) {
  const { checkViewed = false } = options;

  /**
   * Convert a single message metadata to UI message format
   */
  const convertToMessage = useCallback(
    (metadata: MessageMetadata): Message => {
      const hasBeenViewed = checkViewed
        ? AppStorage.getMessageViewed(metadata.id)
        : false;

      const status = calculateMessageStatus(
        metadata.unlockTimestamp,
        hasBeenViewed
      );

      return {
        id: metadata.id,
        encryptedKeyCID: metadata.encryptedKeyCID,
        encryptedMessageCID: metadata.encryptedMessageCID,
        messageHash: metadata.messageHash,
        unlockTimestamp: metadata.unlockTimestamp,
        sender: metadata.sender,
        recipient: metadata.recipient,
        status,
        createdAt: metadata.createdAt,
      };
    },
    [checkViewed]
  );

  /**
   * Convert an array of message metadata to UI message format
   */
  const convertMessages = useCallback(
    (metadataList: MessageMetadata[]): Message[] => {
      return metadataList.map(convertToMessage);
    },
    [convertToMessage]
  );

  /**
   * Update status for an existing message
   */
  const updateMessageStatus = useCallback(
    (message: Message): Message => {
      const hasBeenViewed = checkViewed
        ? AppStorage.getMessageViewed(message.id)
        : false;

      return {
        ...message,
        status: calculateMessageStatus(message.unlockTimestamp, hasBeenViewed),
      };
    },
    [checkViewed]
  );

  return {
    convertToMessage,
    convertMessages,
    updateMessageStatus,
  };
}
```

---

## Appendix B: File Deletion/Archive Commands

```bash
# Phase 1: Delete unnecessary files
rm errors

# Phase 1: Create archive directories
mkdir -p docs/archive
mkdir -p scripts/archive

# Phase 1: Archive historical docs
mv docs/CONNECTION_IMPROVEMENTS.md docs/archive/
mv docs/MIGRATION_GUIDE.md docs/archive/
mv .github/TIMEOUT_IMPLEMENTATION_CHECKLIST.md docs/archive/

# Phase 1: Archive one-time scripts
mv scripts/verify-ethers-migration.js scripts/archive/
mv scripts/verify-ethers-implementation.js scripts/archive/
mv scripts/verify-no-message-cache.sh scripts/archive/

# Phase 1: Remove outdated status file (optional)
rm CURRENT_STATUS.md

# Verify changes
git status
```

---

## Appendix C: Documentation Consolidation Templates

### Template: ERROR_HANDLING.md (Consolidated)

```markdown
# Error Handling Guide

## Quick Reference

### Basic Pattern
\`\`\`typescript
import { ErrorLogger } from "@/lib/monitoring/ErrorLogger";
import { withRetry } from "@/utils/retry";

try {
  const result = await withRetry(() => operation(), { maxAttempts: 3 });
} catch (error) {
  ErrorLogger.error(error, "Context", { additionalData });
}
\`\`\`

### Error Categories
| Category | Examples | Retryable |
|----------|----------|-----------|
| WALLET | Extension not found | Yes |
| STORAGE | IPFS upload failed | Yes |
| BLOCKCHAIN | Transaction failed | Yes |
| VALIDATION | Invalid address | No |

## Architecture

[Simplified diagram from ERROR_BOUNDARY_ARCHITECTURE.md]

## Implementation Details

[Key sections from ERROR_HANDLING_IMPLEMENTATION.md]

## Testing

[Testing guidance consolidated]
```

---

**End of Cleanup Plan Document**
