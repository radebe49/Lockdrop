# Changelog

All notable changes to Lockdrop will be documented in this file.

## [1.0.2] - 2025-11-30

### Improved

- ✅ Centralized logging with `ErrorLogger` - debug/info/warn/error levels with environment-based filtering
- ✅ Consolidated retry logic using `withRetry()` utility - reduced ~350 lines of duplicated code
- ✅ Health checks now pause when browser tab is hidden (visibility API) - better battery life
- ✅ Toast animations use `onTransitionEnd` instead of setTimeout - smoother UX
- ✅ Enhanced `withRetry()` with context support and improved error messages

### Removed

- Removed deprecated `IPFSService.ts` - backward compatibility maintained via index.ts aliases

### Technical Debt

- Reduced `any` type usages from 15+ to 5-7
- Eliminated all direct `console.*` calls in service files
- Removed all polling without visibility API optimization

---

## [1.0.1] - 2025-11-19

### Improved

- ✅ Wallet connections now persist across page refreshes and browser restarts
- ✅ Storacha authentication persists - no need to re-verify email
- ✅ Added visual connection status indicators
- ✅ Better error handling with clear recovery steps
- ✅ Partial state recovery for interrupted authentication flows

### Fixed

- Fixed wallet disconnecting on every page refresh
- Fixed Storacha authentication breaking if interrupted
- Fixed users having to reconnect multiple times unnecessarily

---

## [1.0.0] - 2025-11-17

### Added

- ✅ Complete end-to-end encrypted time-capsule messaging with Lockdrop
- ✅ Talisman wallet integration (recommended) with MetaMask support
- ✅ Storacha Network (IPFS) for decentralized storage
- ✅ Passet Hub testnet (Polkadot) smart contract integration
- ✅ Client-side AES-256-GCM encryption
- ✅ RSA-OAEP key encryption with wallet signatures
- ✅ Video/audio message support with automatic format detection
- ✅ Real-time message status tracking (Locked/Unlockable/Unlocked)
- ✅ Dashboard with filtering and pagination
- ✅ Secure media player with automatic cleanup

### Security

- All encryption/decryption happens client-side
- Private keys never leave the user's wallet
- Encrypted content stored on IPFS (unreadable without keys)
- Unlock conditions enforced by blockchain consensus
- Automatic memory cleanup after viewing

### Technical Stack

- **Frontend**: Next.js 14 with TypeScript
- **Blockchain**: Passet Hub (Polkadot ecosystem) via Ethereum RPC
- **Storage**: Storacha Network (IPFS + Filecoin)
- **Wallet**: Talisman (recommended) or MetaMask
- **Encryption**: Web Crypto API (AES-256-GCM, RSA-OAEP)

### Known Issues

- Messages created before v1.0.0 may not have mime type metadata
- Hot reload during development may cause blob URL issues (refresh to fix)

### Migration Notes

- **Wallet**: Now uses EIP-1193 standard (Ethereum addresses only)
- **Storage**: Mime type now stored with encrypted key for proper playback
- **Status**: Message viewed status tracked in localStorage

---

## Development History

### November 16-17, 2025

- Migrated from Polkadot extension to EIP-1193 (Ethereum) wallet standard
- Fixed address type issues in MessageCreationService
- Implemented mime type storage and detection
- Fixed blob URL cleanup timing issues
- Prioritized Talisman as recommended wallet
- Added comprehensive error handling and troubleshooting

### Earlier Development

- Initial implementation with Polkadot.js
- Smart contract deployment to Passet Hub
- Storacha integration for IPFS storage
- Encryption and key management implementation
