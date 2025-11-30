# Testing Guide

Comprehensive testing documentation for Lockdrop.

## Test Coverage Summary

| Category | Tests | Status |
|----------|-------|--------|
| CryptoService | 18 | ✅ |
| AsymmetricCrypto | 21 | ✅ |
| Timestamp Validation | 24 | ✅ |
| ContractService | 5 | ✅ |
| Encryption Flow (Integration) | 11 | ✅ |
| Message Lifecycle (Integration) | 23 | ✅ |
| **Total** | **102** | ✅ |

---

## Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # With UI
npm run test:coverage # With coverage
```

---

## Test Locations

| Test File | Coverage |
|-----------|----------|
| `lib/crypto/__tests__/CryptoService.test.ts` | Key generation, AES-256-GCM encryption/decryption |
| `lib/crypto/__tests__/AsymmetricCrypto.test.ts` | RSA-OAEP, X25519, SHA-256 |
| `utils/__tests__/timestamp.test.ts` | Validation, status calculation |
| `lib/contract/__tests__/ContractService.test.ts` | Configuration, connection |
| `tests/integration/encryption-flow.test.ts` | End-to-end encryption workflow |
| `tests/integration/message-lifecycle.test.ts` | Message status transitions |

---

## Manual Testing Checklist

### Prerequisites
- Talisman or MetaMask with Ethereum account (0x...)
- PAS tokens from https://faucet.polkadot.io/paseo
- Test media files (audio/video)

### Browser Compatibility
- [ ] Chrome/Edge - all features
- [ ] Firefox - all features
- [ ] Safari - file upload (recording limited)

### Wallet Integration
- [ ] Connect wallet - popup appears
- [ ] Approve connection - address displays
- [ ] Connection persists on refresh
- [ ] Disconnect clears state
- [ ] No wallet installed - shows error with install link
- [ ] Wallet locked - prompts unlock

### Media Recording
- [ ] Audio recording with permission
- [ ] Video recording with permission
- [ ] Permission denied - shows error
- [ ] Duration counter updates
- [ ] Preview plays correctly

### File Upload
- [ ] MP3, WAV, OGG audio files
- [ ] MP4, WEBM video files
- [ ] Invalid formats rejected
- [ ] Large files show warning
- [ ] Drag and drop works

### Message Creation
- [ ] Complete flow: record/upload → recipient → date → create
- [ ] Invalid recipient address - validation error
- [ ] Past unlock time - validation error
- [ ] Encryption progress shows
- [ ] IPFS upload progress shows
- [ ] Transaction signing prompt
- [ ] Success redirects to dashboard

### Dashboard
- [ ] Sent messages load
- [ ] Received messages load
- [ ] Status badges correct (Locked/Unlockable/Unlocked)
- [ ] Filtering by status works
- [ ] Sorting works
- [ ] Pagination works
- [ ] Empty state shows helpful message

### Unlock & Playback
- [ ] Locked message shows countdown
- [ ] Unlockable message has enabled button
- [ ] Decryption progress shows
- [ ] Media player appears
- [ ] Play/pause/seek work
- [ ] Status updates to "Unlocked"

---

## Edge Case Testing

### Wallet Edge Cases
- [ ] No wallet installed
- [ ] Wallet locked
- [ ] Wallet disconnected mid-operation
- [ ] Wrong account selected

### Network Edge Cases
- [ ] Network disconnection
- [ ] Slow network (3G throttle)
- [ ] RPC endpoint unavailable

### Input Validation
- [ ] Invalid recipient address formats
- [ ] Past unlock timestamp
- [ ] Self-send message

### Media Edge Cases
- [ ] Unsupported file format
- [ ] File too large (>100MB)
- [ ] Corrupted media file
- [ ] Permission denied

### IPFS Edge Cases
- [ ] Upload failure (retry logic)
- [ ] CID not found
- [ ] Corrupted data (hash verification)

### Blockchain Edge Cases
- [ ] Insufficient funds
- [ ] Transaction cancelled
- [ ] Transaction timeout

### Decryption Edge Cases
- [ ] Wrong decryption key
- [ ] Timestamp not reached
- [ ] Hash mismatch

---

## Responsive Design Testing

- [ ] Desktop (1920x1080) - optimal layout
- [ ] Laptop (1366x768) - adapts correctly
- [ ] Tablet (768x1024) - mobile layout
- [ ] Mobile (375x667) - touch-friendly

---

## Accessibility Testing

- [ ] Keyboard navigation - all elements reachable
- [ ] Screen reader - content announced
- [ ] High contrast mode - all visible
- [ ] Text scaling 200% - no overflow

---

## Performance Testing

- [ ] Initial load < 3 seconds
- [ ] Dashboard with 50+ messages - smooth
- [ ] 1MB encryption < 1 second
- [ ] 50MB encryption < 10 seconds
- [ ] No memory leaks

---

## Test Infrastructure

### Framework
- **Vitest** - Fast unit testing with ESM
- **Happy-DOM** - Lightweight DOM (better Blob support)
- **@testing-library/jest-dom** - Custom matchers

### Configuration
- `vitest.config.ts` - Vitest config
- `vitest.setup.ts` - Environment setup (Web Crypto polyfill)

### Test Principles
1. Test core functional logic
2. Use real implementations, not mocks
3. Test success and failure cases
4. Test edge cases and boundaries
5. Integration tests for complete workflows

---

## CI/CD

Tests run automatically on:
- Every commit
- Pull requests
- Before deployment
- Scheduled daily

---

## Adding New Tests

```typescript
// Unit test example
describe("MyService", () => {
  test("does something", () => {
    const result = myService.doSomething();
    expect(result).toBe(expected);
  });
});

// Integration test example
describe("Complete Flow", () => {
  test("end-to-end workflow", async () => {
    // Setup
    const input = createTestInput();
    
    // Execute
    const result = await completeWorkflow(input);
    
    // Verify
    expect(result.success).toBe(true);
  });
});
```
