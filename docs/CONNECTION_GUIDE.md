# Connection Guide

Complete guide for wallet and storage connections in Lockdrop.

## Quick Start

### First Time Setup

1. **Connect Wallet** - Click "Connect Wallet", approve in extension (Talisman/MetaMask)
2. **Setup Storage** - Enter email, verify via link, create space
3. **Ready!** - Both connections persist across browser sessions

### Connection Status

- 🟢 Green = Connected and working
- 🟡 Yellow = Partially connected (needs attention)
- ⚪ Gray = Not connected

---

## For Developers

### Wallet Connection

```typescript
import { useWallet } from "@/lib/wallet/WalletProvider";

const { isConnected, address, connect, disconnect } = useWallet();

// Check connection
if (!isConnected) {
  await connect();
}

// Listen for changes
const { onConnectionChange } = useWallet();
useEffect(() => {
  const unsubscribe = onConnectionChange((connected) => {
    console.log("Wallet connected:", connected);
  });
  return unsubscribe;
}, [onConnectionChange]);
```

### Storacha Connection

```typescript
import { useStoracha } from "@/hooks/useStoracha";

const { isReady, authState, login, createSpace } = useStoracha();

// Authenticate
await login("user@example.com");
await createSpace("my-space");

// Check status
import { storachaService } from "@/lib/storage";
const status = await storachaService.checkConnection();
// Returns: { canRestore, needsSpace, needsAuth }
```

### Connection Status Component

```typescript
import { ConnectionStatus } from '@/components/storage';

<ConnectionStatus className="mb-4" />
```

### localStorage Keys

```typescript
const WALLET_KEY = "lockdrop_wallet_connection";     // { wasConnected: boolean }
const STORACHA_KEY = "lockdrop_storacha_auth";       // { isAuthenticated, email?, spaceDid? }
```

### Common Pattern: Require Both Connections

```typescript
const { isConnected: walletConnected } = useWallet();
const { isReady: storageReady } = useStoracha();

if (!walletConnected) return <div>Please connect your wallet</div>;
if (!storageReady) return <div>Please setup storage</div>;
// Proceed with operation
```

---

## Connection Flow Diagrams

### Wallet Connection Flow

```
User Clicks "Connect Wallet"
         │
         ▼
Check window.ethereum exists?
         │
    ┌────┴────┐
   NO        YES
    │         │
    ▼         ▼
Show Error   Request Accounts (eth_requestAccounts)
"Install     Shows wallet popup
 wallet"           │
              ┌────┴────┐
             NO        YES (User Approves)
              │         │
              ▼         ▼
         Show Error   Save to localStorage
         "Rejected"   Update UI State
                      Setup Event Listeners
```

### Reconnection Flow (Page Refresh)

```
Page Loads
    │
    ▼
Check localStorage for wasConnected?
    │
┌───┴───┐
NO     YES
│       │
▼       ▼
Wait   Call eth_accounts (No popup!)
for         │
User   ┌────┴────┐
      NO        YES
       │         │
       ▼         ▼
   Clear      Restore Connection
   Storage    Silent Success
```

### Storacha Authentication Flow

```
User Enters Email
         │
         ▼
Validate Email → Invalid? → Show Error
         │
         ▼ (Valid)
Save Email to localStorage
         │
         ▼
Send Verification Email (client.login())
         │
         ▼
User Clicks Link in Email
         │
         ▼
Email Verified? → No? → Show Error
         │
         ▼ (Yes)
Update Auth State (isAuthenticated = true)
         │
         ▼
Create Space (client.createSpace)
         │
         ▼
Save Space DID to localStorage
         │
         ▼
Ready! (isReady = true)
```

---

## State Persistence

```
┌─────────────────────────────────────────────────────────────┐
│                      localStorage                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  lockdrop_wallet_connection                        │    │
│  │  { wasConnected: true }                            │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  lockdrop_storacha_auth                            │    │
│  │  { isAuthenticated: true, email: "...",            │    │
│  │    spaceDid: "did:key:..." }                       │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         │
         │ Persists across:
         │ • Page refresh
         │ • Browser restart
         │ • Tab close/open
         │ • Network interruption
         └────────────────────────
```

---

## Troubleshooting

### Wallet Issues

| Problem | Solution |
|---------|----------|
| No wallet popup | Install Talisman or MetaMask |
| Popup shows but fails | Check account is Ethereum (0x) |
| "User rejected" | Click Approve in wallet popup |
| Timeout error | Unlock wallet extension |
| Multiple wallets | Disable all but one |

### Storacha Issues

| Problem | Solution |
|---------|----------|
| Email not received | Check spam folder |
| Verification failed | Try again, check network |
| Can't create space | Complete email verification first |
| "Setup incomplete" | Go to Settings, click "Create Space" |

### General Issues

| Problem | Solution |
|---------|----------|
| State not persisting | Check localStorage enabled, not incognito |
| Connection lost | Clear cache, reconnect once |
| Multiple popups | Bug fixed - update to latest version |

### Debug Commands (Browser Console)

```javascript
// Check connection state
console.log("Wallet:", localStorage.getItem("lockdrop_wallet_connection"));
console.log("Storacha:", localStorage.getItem("lockdrop_storacha_auth"));

// Clear and retry
localStorage.removeItem("lockdrop_wallet_connection");
localStorage.removeItem("lockdrop_storacha_auth");
```

---

## Security Notes

- Never store private keys in localStorage
- Only connection preferences are stored
- Always require user approval for transactions
- Use silent reconnection for read-only operations
- Clear sensitive data on logout

---

## Best Practices

1. **Check connection before operations** - Don't assume connected
2. **Provide clear error messages** - Help users understand what's wrong
3. **Show connection status** - Use `<ConnectionStatus />` component
4. **Handle partial states** - Email verified but no space? Show space creation UI
5. **Don't block on connection** - Let users explore while disconnected
