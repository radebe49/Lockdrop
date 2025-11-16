# Message Status Fix - Viewed Tracking

**Date**: November 17, 2025  
**Status**: ✅ FIXED

---

## Problems

1. **Auto-marking as "Unlocked"**: Messages showed as "Unlocked" immediately when unlock time passed, without user actually viewing them
2. **Clicking doesn't work**: (Need to verify if this is still an issue after the status fix)

---

## Root Cause

The `calculateMessageStatus` function takes two parameters:
- `unlockTimestamp`: When the message can be unlocked
- `isUnlocked`: Whether the user has **actually viewed** the message

But the code was passing `isUnlockable` (whether time has passed) as the `isUnlocked` parameter, causing this logic:

```typescript
// WRONG - was doing this:
const isUnlockable = Date.now() >= metadata.unlockTimestamp;
const status = calculateMessageStatus(metadata.unlockTimestamp, isUnlockable);
// Result: Status becomes "Unlocked" as soon as time passes!
```

---

## Solution

Track whether the user has **actually viewed** the message using localStorage:

### 1. ReceivedMessages.tsx - Check Viewed Status

```typescript
const convertToMessage = useCallback(
  (metadata: MessageMetadata): Message => {
    // Check if user has viewed this message
    const viewedKey = `message_viewed_${metadata.id}`;
    const hasBeenViewed = localStorage.getItem(viewedKey) === 'true';
    
    // Only mark as "Unlocked" if actually viewed
    const status = calculateMessageStatus(metadata.unlockTimestamp, hasBeenViewed);
    // ...
  },
  []
);
```

### 2. Unlock Page - Mark as Viewed

```typescript
const handleUnlock = async (msg: Message) => {
  const result = await UnlockService.unlockMessage(msg, { ... });

  // Mark message as viewed in localStorage
  const viewedKey = `message_viewed_${msg.id}`;
  localStorage.setItem(viewedKey, 'true');
  
  // Now it will show as "Unlocked"
  setMessage((prev) => prev ? { ...prev, status: "Unlocked" } : null);
  setUnlockResult(result);
};
```

### 3. Status Updates - Check Viewed Status

```typescript
const updateStatuses = useCallback(() => {
  setMessages((prevMessages) =>
    prevMessages.map((message) => {
      // Check if user has viewed this message
      const viewedKey = `message_viewed_${message.id}`;
      const hasBeenViewed = localStorage.getItem(viewedKey) === 'true';
      
      return {
        ...message,
        status: calculateMessageStatus(message.unlockTimestamp, hasBeenViewed),
      };
    })
  );
}, []);
```

---

## Status Flow

### Before Fix ❌
```
Message created → Time passes → Status: "Unlocked" (wrong!)
```

### After Fix ✅
```
Message created → Status: "Locked"
  ↓
Time passes → Status: "Unlockable" (can be viewed)
  ↓
User clicks & views → Status: "Unlocked" (correct!)
```

---

## localStorage Keys

Messages are tracked with keys like:
```
message_viewed_1 = "true"
message_viewed_2 = "true"
message_viewed_3 = "true"
```

This persists across page reloads, so once viewed, it stays "Unlocked".

---

## Testing

### Test 1: Before Unlock Time
1. Create a message with future unlock time
2. Check dashboard
3. ✅ Should show as "Locked"

### Test 2: After Unlock Time (Not Viewed)
1. Wait for unlock time to pass
2. Refresh dashboard
3. ✅ Should show as "Unlockable" (not "Unlocked")

### Test 3: After Viewing
1. Click message to unlock and view
2. Go back to dashboard
3. ✅ Should now show as "Unlocked"

### Test 4: Persistence
1. View a message
2. Close browser
3. Reopen and check dashboard
4. ✅ Should still show as "Unlocked"

---

## Files Modified

1. ✅ `components/dashboard/ReceivedMessages.tsx` - Check localStorage for viewed status
2. ✅ `app/unlock/[messageId]/page.tsx` - Mark as viewed when unlocked

---

## Next Steps

1. Test the status flow with a real message
2. Verify clicking now opens the media player
3. If clicking still doesn't work, check:
   - Browser console for errors
   - Network tab for failed requests
   - MediaPlayer component rendering

---

**Status**: ✅ READY TO TEST

Try creating a new message and see if the status flow works correctly now!
