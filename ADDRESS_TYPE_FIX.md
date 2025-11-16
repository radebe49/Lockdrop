# Address Type Fix - MessageCreationService

**Date**: November 16, 2025  
**Status**: ✅ FIXED

---

## Problem

Error when creating a message:
```
TypeError: address.toLowerCase is not a function
    at ContractService.storeMessage (ContractService.ts:453:22)
```

---

## Root Cause

`MessageCreationService` was still using the old Polkadot type `InjectedAccountWithMeta` instead of the new Ethereum type `WalletAccount`. This caused the entire account object to be passed to `ContractService.storeMessage()` instead of just the address string.

### Before:
```typescript
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

export interface MessageCreationParams {
  senderAccount: InjectedAccountWithMeta;  // ❌ Wrong type
}

// Passing entire object
const result = await ContractService.storeMessage(
  { ... },
  params.senderAccount  // ❌ Object instead of string
);
```

### After:
```typescript
import type { WalletAccount } from "@/types/wallet";

export interface MessageCreationParams {
  senderAccount: WalletAccount;  // ✅ Correct type
}

// Passing address string
const result = await ContractService.storeMessage(
  { ... },
  params.senderAccount.address  // ✅ String
);
```

---

## Changes Made

### lib/message/MessageCreationService.ts

1. **Import Statement**:
   ```typescript
   // Before
   import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
   
   // After
   import type { WalletAccount } from "@/types/wallet";
   ```

2. **Interface Definition**:
   ```typescript
   // Before
   senderAccount: InjectedAccountWithMeta;
   
   // After
   senderAccount: WalletAccount;
   ```

3. **Contract Call**:
   ```typescript
   // Before
   params.senderAccount
   
   // After
   params.senderAccount.address
   ```

---

## Why This Happened

This was a leftover from the Polkadot → Ethereum wallet migration. The `WalletProvider` was updated to use Ethereum accounts, but `MessageCreationService` still referenced the old Polkadot types.

---

## Testing

✅ TypeScript diagnostics pass  
✅ No type errors in MessageCreationService.ts  
✅ No type errors in app/create/page.tsx  
✅ Address is now correctly passed as string

---

## Related Files

- ✅ `lib/message/MessageCreationService.ts` - Fixed
- ✅ `app/create/page.tsx` - Already correct (uses WalletAccount)
- ✅ `lib/wallet/WalletProvider.tsx` - Already correct (returns WalletAccount)
- ✅ `types/wallet.ts` - Already correct (defines WalletAccount)

---

## Next Steps

Try creating a message again. The flow should now work:
1. Connect wallet ✅
2. Upload to Storacha ✅
3. Submit to blockchain ✅ (should work now)

---

**Status**: ✅ READY TO TEST
