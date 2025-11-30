# Error Handling Guide

Comprehensive error handling system for Lockdrop.

## Quick Reference

### Basic Pattern

```typescript
import { ErrorLogger } from "@/lib/monitoring/ErrorLogger";
import { withRetry } from "@/utils/retry";

try {
  const result = await withRetry(() => operation(), { maxAttempts: 3 });
} catch (error) {
  ErrorLogger.log(error, "Context", { additionalData });
}
```

### Error Categories

| Category     | Examples                              | Retryable |
| ------------ | ------------------------------------- | --------- |
| `WALLET`     | Extension not found, wallet locked    | Yes       |
| `MEDIA`      | Permission denied, unsupported format | Partial   |
| `ENCRYPTION` | Key generation failed                 | No        |
| `STORAGE`    | IPFS upload failed, CID not found     | Yes       |
| `BLOCKCHAIN` | Transaction failed, RPC unavailable   | Yes       |
| `UNLOCK`     | Timestamp not reached, wrong key      | No        |
| `NETWORK`    | Timeout, connection refused           | Yes       |
| `VALIDATION` | Invalid address, past timestamp       | No        |

### Validation Functions

```typescript
isValidEthereumAddress(address: string): boolean
isValidIPFSCID(cid: string): boolean
isValidFutureTimestamp(timestamp: number): boolean
isValidMediaType(mimeType: string): boolean
isValidFileSize(size: number, maxSize?: number): boolean
checkBrowserSupport(): { supported: boolean; missing: string[] }
checkNetworkConnectivity(): Promise<boolean>
validateMessageMetadata(metadata: object): { valid: boolean; errors: string[] }
```

---

## Architecture

### Error Boundary Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│ app/error.tsx (Root Error Boundary)                                     │
│ • Catches critical app-wide failures                                    │
│ • WalletProvider initialization errors                                  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ app/layout.tsx                                                    │ │
│  │                                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │ Page-level error boundaries (create, dashboard, unlock)    │ │ │
│  │  │ • Context-specific error handling                          │ │ │
│  │  │ • Recovery options                                         │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Error Flow

1. **Component-Level**: `onError` callback → Set error state → Inline error
2. **Page-Level**: Async operation fails → Page boundary catches → Context-aware UI
3. **Root-Level**: Critical failure → Root boundary → Global error UI

---

## Components

### ErrorLogger

```typescript
import { ErrorLogger } from "@/lib/monitoring/ErrorLogger";

// Log an error
ErrorLogger.log(error, "Context", { additionalData });

// Get recent logs
const logs = ErrorLogger.getRecentLogs(10);

// Get logs by category
const walletErrors = ErrorLogger.getLogsByCategory(ErrorCategory.WALLET);

// Get statistics
const stats = ErrorLogger.getStatistics();

// Export/clear logs
const json = ErrorLogger.exportLogs();
ErrorLogger.clearLogs();
```

### Retry Utilities

```typescript
import { withRetry } from "@/utils/retry";

const result = await withRetry(
  async () => await ipfsService.upload(blob),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.3,
    onRetry: (attempt, error) => console.log(`Retry ${attempt}`),
    shouldRetry: (error) => isRetryable(error),
  }
);
```

### ErrorRecovery Component

```typescript
import { ErrorRecovery } from '@/components/ui';

<ErrorRecovery
  error={error}
  context="Creating message"
  onRetry={handleRetry}
  onDismiss={() => setError(null)}
  showTechnicalDetails={true}
/>
```

### Network Status Hook

```typescript
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const { isOnline, isConnecting, lastChecked } = useNetworkStatus();
```

### Error Classification

```typescript
import { classifyError } from "@/utils/errorHandling";

const errorInfo = classifyError(error);
// Returns: { category, severity, message, suggestions, retryable, requiresUserAction }
```

---

## Common Patterns

### Component with Error State

```typescript
'use client';

import { useState } from 'react';
import { ErrorRecovery } from '@/components/ui';

export function MyComponent() {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOperation = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await someOperation();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <ErrorRecovery error={error} onRetry={handleOperation} onDismiss={() => setError(null)} />;
  }

  return <button onClick={handleOperation} disabled={isLoading}>{isLoading ? 'Processing...' : 'Start'}</button>;
}
```

### Service Method with Retry

```typescript
async function uploadToIPFS(blob: Blob): Promise<string> {
  return withRetry(
    async () => {
      try {
        const result = await ipfsService.uploadEncryptedBlob(blob);
        return result.cid;
      } catch (error) {
        ErrorLogger.log(error, "IPFS Upload", { blobSize: blob.size });
        throw error;
      }
    },
    { maxAttempts: 3 }
  );
}
```

---

## Edge Cases Handled

### Wallet
- ✅ Extension not installed
- ✅ Wallet locked
- ✅ Connection rejected
- ✅ Transaction signing failed

### Media
- ✅ Permission denied
- ✅ Unsupported format
- ✅ File too large

### Network
- ✅ Offline mode
- ✅ Slow connection
- ✅ Timeout

### Blockchain
- ✅ Insufficient funds
- ✅ Transaction cancelled
- ✅ RPC unavailable

### IPFS
- ✅ Upload/download failure
- ✅ CID not found
- ✅ Corrupted data

### Validation
- ✅ Invalid addresses
- ✅ Past timestamps
- ✅ Invalid CIDs

---

## Best Practices

✅ **Always validate input before operations**
✅ **Use retry for network operations**
✅ **Log errors with context**
✅ **Provide user-friendly error messages**
✅ **Offer recovery options**

### Common Mistakes

❌ Don't swallow errors silently
❌ Don't retry non-retryable errors (validation)
❌ Don't show technical errors to users

---

## Testing

See `docs/TESTING.md` for comprehensive testing guide including edge case scenarios.

### Quick Test Checklist
- [ ] No wallet installed
- [ ] Wallet locked
- [ ] Network disconnection
- [ ] Invalid addresses
- [ ] Past timestamps
- [ ] Unsupported file formats
- [ ] Insufficient funds
- [ ] Transaction cancelled
