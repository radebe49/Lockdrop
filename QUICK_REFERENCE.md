# Quick Reference

Quick reference for Passet Hub and ethers.js development.

## RPC Endpoints

### Ethereum RPC (Use This!)
```
https://testnet-passet-hub-eth-rpc.polkadot.io
```
✅ For: Solidity contracts, ethers.js, MetaMask, forge, cast

### Substrate RPC (Advanced Only)
```
wss://testnet-passet-hub.polkadot.io
```
⚠️ For: Polkadot.js API, substrate pallets only

---

## Contract Details

```
Address:  0xeD0fDD2be363590800F86ec8562Dde951654668F
Network:  Passet Hub Testnet
Chain ID: 1000
Token:    PAS (12 decimals)
```

---

## Environment Setup

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xeD0fDD2be363590800F86ec8562Dde951654668F
NEXT_PUBLIC_RPC_ENDPOINT=https://testnet-passet-hub-eth-rpc.polkadot.io
NEXT_PUBLIC_NETWORK=passet-hub
NEXT_PUBLIC_STORACHA_GATEWAY=storacha.link
```

---

## Address Format

✅ **Correct (Ethereum):** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
❌ **Wrong (Substrate):** `5E2jTHsQfRCq8wBPeHgwKQAeCMwSsxYCCZfB4dG2SWhp4ZTv`

---

## Get Testnet Tokens

1. Visit: https://faucet.polkadot.io/paseo
2. Enter Ethereum address (0x...)
3. Request PAS tokens
4. Wait ~1-2 minutes

---

## ContractService Usage

### Import
```typescript
import { ContractService } from "@/lib/contract/ContractService";
```

### Read Operations
```typescript
// Check connection
const isConnected = ContractService.isConnected();

// Get message count
const count = await ContractService.getMessageCount();

// Get messages
const sent = await ContractService.getSentMessages(senderAddress);
const received = await ContractService.getReceivedMessages(recipientAddress);
const message = await ContractService.getMessage(messageId);
```

### Write Operations
```typescript
const result = await ContractService.storeMessage(
  {
    encryptedKeyCID: "QmXxx...",
    encryptedMessageCID: "QmYyy...",
    messageHash: "abc123...",
    unlockTimestamp: Date.now() + 3600000, // 1 hour
    recipient: "0x1234...",
  },
  signerAddress
);
// Returns: { success, messageId?, blockHash?, error? }
```

### Event Subscriptions
```typescript
const unsubscribe = await ContractService.subscribeToMessageEvents((event) => {
  console.log("New message:", event);
});
// Later: unsubscribe();
```

---

## Types

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

interface TransactionResult {
  success: boolean;
  messageId?: string;
  blockHash?: string;
  error?: string;
}
```

---

## CLI Commands (Foundry)

### Deploy Contract
```bash
forge create --resolc \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key $PRIVATE_KEY \
  contracts/FutureProof.sol:FutureProof
```

### Check Balance
```bash
cast balance 0xYourAddress \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

### Call Contract
```bash
cast call 0xContractAddress \
  "getMessageCount()(uint256)" \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

### Verify Contract Deployed
```bash
cast code 0xContractAddress \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

---

## Common Errors

| Error | Solution |
|-------|----------|
| "Method not found" | Use Ethereum RPC, not Substrate RPC |
| "Invalid address" | Use 0x... format, not 5... format |
| "Insufficient balance" | Get tokens from faucet |
| "Connection refused" | Check RPC URL (HTTPS, not WSS) |
| "No Ethereum wallet found" | Install MetaMask or Talisman |
| "Transaction failed" | Ensure wallet has PAS tokens |

---

## Timeouts

- Connection: 30 seconds
- Queries: 30 seconds
- Transactions: 60s (submit) + 120s (finalize)

Retry logic: exponential backoff (1s, 2s, 4s)

---

## Block Explorers

- **BlockScout:** https://blockscout-passet-hub.parity-testnet.parity.io
- **Polkadot.js:** https://polkadot.js.org/apps/?rpc=wss://testnet-passet-hub.polkadot.io

---

## Wallet Setup

| Wallet | Setup |
|--------|-------|
| MetaMask | All accounts work by default |
| Talisman | Create **Ethereum account** (NOT Polkadot) |

See `WALLET_GUIDE.md` for detailed setup instructions.
