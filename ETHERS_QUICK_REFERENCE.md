# Ethers.js Quick Reference

Quick reference for working with the ethers.js-based ContractService.

---

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xeD0fDD2be363590800F86ec8562Dde951654668F
NEXT_PUBLIC_RPC_ENDPOINT=https://testnet-passet-hub-eth-rpc.polkadot.io
NEXT_PUBLIC_NETWORK=passet-hub
```

**Important**: Use Ethereum RPC endpoint (https://), not Substrate WebSocket (wss://)

---

## Basic Usage

### Import
```typescript
import { ContractService } from '@/lib/contract/ContractService';
```

### Check Connection
```typescript
const isConnected = ContractService.isConnected();
const address = ContractService.getContractAddress();
const network = ContractService.getNetwork();
```

---

## Read Operations (View Functions)

### Get Message Count
```typescript
const count = await ContractService.getMessageCount();
// Returns: number
```

### Get Sent Messages
```typescript
const messages = await ContractService.getSentMessages(senderAddress);
// Returns: MessageMetadata[]
```

### Get Received Messages
```typescript
const messages = await ContractService.getReceivedMessages(recipientAddress);
// Returns: MessageMetadata[]
```

### Get Single Message
```typescript
const message = await ContractService.getMessage(messageId);
// Returns: MessageMetadata | null
```

---

## Write Operations (Transactions)

### Store Message
```typescript
const result = await ContractService.storeMessage(
  {
    encryptedKeyCID: 'QmXxx...',
    encryptedMessageCID: 'QmYyy...',
    messageHash: 'abc123...',
    unlockTimestamp: Date.now() + 3600000, // 1 hour from now
    recipient: '0x1234...', // Ethereum address
  },
  signerAddress // Your Ethereum address
);

// Returns: TransactionResult
// {
//   success: boolean,
//   messageId?: string,
//   blockHash?: string,
//   error?: string
// }
```

**Note**: Requires browser wallet (MetaMask or Talisman) with Ethereum account

---

## Event Subscriptions

### Subscribe to New Messages
```typescript
const unsubscribe = await ContractService.subscribeToMessageEvents((event) => {
  console.log('New message:', event);
  // event: { messageId, sender, recipient, unlockTimestamp }
});

// Later: cleanup
unsubscribe();
```

---

## Error Handling

### Try-Catch Pattern
```typescript
try {
  const messages = await ContractService.getSentMessages(address);
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to load messages:', error.message);
  }
  // Handle error
}
```

### Common Errors
- `"No Ethereum wallet found"` - Install MetaMask or Talisman
- `"Failed to connect to RPC endpoint"` - Check network connection
- `"Transaction failed"` - Ensure wallet has PAS tokens
- `"Invalid address format"` - Use Ethereum format (0x...)

---

## Types

### MessageMetadata
```typescript
interface MessageMetadata {
  id: string;
  encryptedKeyCID: string;
  encryptedMessageCID: string;
  messageHash: string;
  unlockTimestamp: number;
  sender: string;
  recipient: string;
  createdAt: number;
}
```

### TransactionResult
```typescript
interface TransactionResult {
  success: boolean;
  messageId?: string;
  blockHash?: string;
  error?: string;
}
```

---

## Testing

### Run Tests
```bash
# All contract service tests
npm test tests/contract-service.test.ts

# Verification script
node scripts/verify-ethers-migration.js

# ABI compatibility check
node verify-abi-compatibility.js
```

### Test in Browser Console
```typescript
// Import service
const { ContractService } = await import('@/lib/contract/ContractService');

// Test connection
const provider = await ContractService.getProvider();
console.log('Connected:', ContractService.isConnected());

// Test query
const count = await ContractService.getMessageCount();
console.log('Message count:', count);
```

---

## Address Format

### ✅ Correct (Ethereum)
```
0xeD0fDD2be363590800F86ec8562Dde951654668F
```

### ❌ Wrong (Substrate)
```
5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

**Always use Ethereum format (0x...) for this project!**

---

## Wallet Setup

### MetaMask
1. Install MetaMask extension
2. Create or import Ethereum account
3. Add Passet Hub network (optional)
4. Get PAS tokens from faucet

### Talisman
1. Install Talisman extension
2. Create **Ethereum account** (not Polkadot)
3. Ensure address starts with 0x
4. Get PAS tokens from faucet

**Faucet**: https://faucet.polkadot.io/paseo

---

## Performance Tips

### Connection Pooling
ContractService automatically pools connections. No need to manage manually.

### Timeouts
All operations have built-in timeouts:
- Connection: 30 seconds
- Queries: 30 seconds
- Transactions: 60 seconds (submit) + 120 seconds (finalize)

### Retry Logic
Failed connections automatically retry with exponential backoff (1s, 2s, 4s).

---

## Debugging

### Enable Verbose Logging
```typescript
// Connection status
ContractService.addConnectionListener((connected) => {
  console.log('Connection status:', connected);
});
```

### Check Provider
```typescript
const provider = await ContractService.getProvider();
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);
```

### Verify Contract
```typescript
const address = ContractService.getContractAddress();
console.log('Contract address:', address);

const count = await ContractService.getMessageCount();
console.log('Message count:', count);
```

---

## Common Patterns

### Loading Messages in Component
```typescript
const [messages, setMessages] = useState<MessageMetadata[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ContractService.getSentMessages(address);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };
  
  loadMessages();
}, [address]);
```

### Real-time Updates
```typescript
useEffect(() => {
  let unsubscribe: (() => void) | null = null;
  
  const subscribe = async () => {
    unsubscribe = await ContractService.subscribeToMessageEvents((event) => {
      if (event.recipient === myAddress) {
        // Refresh messages
        loadMessages();
      }
    });
  };
  
  subscribe();
  
  return () => {
    if (unsubscribe) unsubscribe();
  };
}, [myAddress]);
```

---

## Migration Notes

### Before (Polkadot.js)
```typescript
const api = await ApiPromise.create({ provider });
const contract = new ContractPromise(api, abi, address);
const result = await contract.query.getMessageCount(caller, options);
```

### After (ethers.js)
```typescript
const provider = await ContractService.getProvider();
const count = await ContractService.getMessageCount();
```

**Key Differences**:
- No need to manage API instance
- No caller or options parameters
- Simpler method calls
- Better error messages

---

## Resources

### Documentation
- `ETHERS_MIGRATION_VERIFIED.md` - Verification report
- `MIGRATION_SUMMARY.md` - Complete migration details
- `IMPLEMENTATION_COMPLETE.md` - Production readiness

### External Links
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [Passet Hub Faucet](https://faucet.polkadot.io/paseo)
- [Solidity Contract](contract/contracts/FutureProof.sol)

---

**Last Updated**: November 16, 2025  
**Version**: ethers.js v6.15.0
