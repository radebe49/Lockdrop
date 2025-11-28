# Lockdrop Launch Checklist

## Pre-Launch Verification

### Build & Tests
- [x] All tests passing (136/136)
- [x] Production build successful
- [x] No critical lint errors
- [x] Bundle sizes optimized

### Security Audit
- [x] No plaintext leakage verified
- [x] Key cleanup after operations confirmed
- [x] Timestamp enforcement validated
- [x] Object URL revocation working
- [x] Error messages reviewed for information disclosure

### Performance
- [x] Code splitting implemented
- [x] Dynamic imports for heavy components
- [x] Bundle sizes reduced:
  - `/app/create`: 500 kB → 224 kB (55% reduction)
  - `/unlock/[messageId]`: 485 kB → 101 kB (79% reduction)
  - `/app`: 316 kB → 223 kB (29% reduction)
  - `/claim/[packageCID]`: 209 kB → 89.8 kB (57% reduction)

---

## Deployment Steps

### 1. Environment Variables
Ensure the following are configured in Vercel:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=<your-contract-address>
NEXT_PUBLIC_RPC_ENDPOINT=https://testnet-passet-hub-eth-rpc.polkadot.io
NEXT_PUBLIC_NETWORK=passet-hub
NEXT_PUBLIC_STORACHA_GATEWAY=storacha.link
```

### 2. Deploy to Vercel
```bash
# Option 1: Via Vercel CLI
vercel --prod

# Option 2: Via Git push (if connected)
git push origin main
```

### 3. Verify Deployment
- [ ] Visit production URL
- [ ] Test wallet connection
- [ ] Test message creation flow
- [ ] Test message unlock flow
- [ ] Verify Storacha integration
- [ ] Check mobile responsiveness

---

## Post-Launch Monitoring

### Metrics to Watch
- [ ] Page load times
- [ ] Error rates in Vercel Analytics
- [ ] Blockchain transaction success rates
- [ ] IPFS upload/download success rates

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Wallet not connecting | Check browser extension, try refresh |
| Transaction failing | Verify testnet tokens, check gas |
| IPFS upload slow | Normal for large files, retry if timeout |
| Message not unlocking | Verify timestamp has passed |

---

## Hackathon Submission

### Required Materials
- [ ] Project description
- [ ] Demo video (2-3 minutes)
- [ ] GitHub repository link
- [ ] Live demo URL
- [ ] Team information

### Key Features to Highlight
1. **Privacy-First**: Client-side encryption, no plaintext leaves browser
2. **Decentralized**: IPFS storage + blockchain metadata
3. **Time-Locked**: Cryptographic timestamp enforcement
4. **User-Friendly**: Modern UI with wallet integration

### Tagline
> "Guaranteed by math, not corporations"

---

## Social Media Announcement

### Suggested Tweet
```
🔒 Introducing Lockdrop - Decentralized time-capsule for audio/video messages

✨ Client-side encryption
🌐 IPFS storage
⛓️ Blockchain-enforced unlock times
🔐 "Guaranteed by math, not corporations"

Try it: [URL]
Code: [GitHub URL]

#Polkadot #Web3 #Privacy #Hackathon
```

---

## Documentation Verification

- [x] README.md complete
- [x] User guide available
- [x] Developer documentation
- [x] Security audit report
- [x] API documentation

---

## Final Notes

The application is ready for production deployment. All core features have been implemented and tested:

1. ✅ Wallet integration (Talisman/MetaMask)
2. ✅ Media recording and upload
3. ✅ Client-side encryption (AES-256-GCM)
4. ✅ IPFS storage via Storacha
5. ✅ Blockchain metadata storage
6. ✅ Time-locked message unlock
7. ✅ Dashboard for sent/received messages
8. ✅ Claim flow for recipients without wallets

Good luck with the launch! 🚀
