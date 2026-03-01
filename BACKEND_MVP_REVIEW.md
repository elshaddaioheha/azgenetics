# Backend MVP Review: End-to-End Flow to Certificate Printing & Dashboard Evidence

## Review Goal
Validate backend readiness for this path:

1. Account onboarding
2. Upload genomic/clinical file
3. Access control (grant/revoke)
4. Retrieval and evidence logging
5. NFT certificate minting
6. Certificate printing/export
7. Dashboard evidence visibility

---

## MVP Checklist (Status + Gaps)

### 1) Auth onboarding (signup → OTP verify → signin)
**Status:** 🟡 Partial (core exists, production-hardening gaps)

**What exists**
- Signup API validates required fields and role, creates Supabase auth user, generates OTP, stores profile records.  
- OTP verify API marks verification as complete.  
- Signin API enforces email/password + in-memory rate limiting + email verified check.

**Gaps**
- Rate limiting is memory-based (`Map`) for signup/signin, so limits reset per process restart and won’t coordinate across multiple instances.
- Signup stores `hedera_private_key` in profile tables, which is a sensitive secret-storage risk.
- Password policy is minimal (length >= 6 only).

**MVP decision**
- Good for local demo.
- Not sufficient for multi-instance production without persistent rate limiting + key management hardening.

---

### 2) File upload and data integrity anchoring
**Status:** 🟢 Implemented (with important security caveats)

**What exists**
- Upload endpoint validates file type/size, does VCF signature checks, encrypts files, uploads encrypted bytes to IPFS, submits hash to Hedera, and stores metadata in `files`.
- Upload rate limiting exists.

**Gaps**
- Encryption key and IV are stored directly in DB columns (`encryption_key`, `encryption_iv`) with no evidence of envelope encryption/KMS wrapping.
- Upload rate limiting is also process-memory only.
- Error status mapping returns `400` for some limit issues but not consistently (`429` would be more standard for rate limit cases).

**MVP decision**
- Flow works for MVP, but key handling should be upgraded before handling sensitive production data.

---

### 3) Access control (grant/revoke)
**Status:** 🟡 Partial

**What exists**
- Grant access checks caller role/tier (`F1`), validates file ownership, validates grantee, prevents duplicate active grants, sets expiry/access level.
- Revoke access updates permission status and revocation fields.
- Notifications are attempted on grant/revoke.

**Gaps**
- Hedera transaction IDs are mocked (`mock-tx-*`) in both grant and revoke flows (not cryptographically anchored yet).
- Grant/revoke write to `access_logs` and `error_logs`, but these tables are not present in visible migrations (migration mismatch risk).
- Rate limiting for grant is memory-only.

**MVP decision**
- Logical permissions work, but blockchain evidence and schema consistency are incomplete.

---

### 4) File retrieval + evidence logs
**Status:** 🟢 Implemented

**What exists**
- File retrieval endpoint enforces ownership or granted access (for F2), pulls encrypted file from IPFS/Supabase storage, decrypts server-side, returns file bytes.
- Access attempts are logged in `file_access_logs` for success and failure.
- Integrity check for F2 path verifies hash before decrypting.

**Gaps**
- No explicit anti-replay/download token mechanism for temporary delegated links.
- Access-log evidence is captured in DB, but no dedicated API/dashboard view to inspect immutable access history as user-facing evidence.

**MVP decision**
- Backend retrieval control is present; user-facing evidence presentation is incomplete.

---

### 5) NFT certificate minting
**Status:** 🟡 Partial

**What exists**
- Mint endpoint verifies ownership, blocks duplicate minting, builds metadata, calls Hedera mint, updates file with token/serial, inserts `nft_certificates` record.
- Dashboard triggers mint and surfaces transaction modal with Hashscan link.

**Gaps**
- `hedera_transaction_id` for minted cert currently uses a derived placeholder (`token-serial`) rather than confirmed tx id from chain receipt.
- Operator account parsing can fail if env missing/invalid and is not used robustly.
- No explicit endpoint to fetch/download a canonical certificate artifact (PDF/JSON-LD) after mint.

**MVP decision**
- Minting path exists for demo, but chain-proof evidence quality is below audit-grade.

---

### 6) Certificate printing/export
**Status:** 🔴 Missing

**What exists**
- No backend route dedicated to certificate rendering/export (PDF/print package).
- No explicit UI action to print a formal certificate document.

**Gap summary**
- “Certificate minted” is not the same as “certificate printable/verifiable artifact produced.”

**MVP requirement to close**
- Add endpoint: `GET /api/certificates/:fileId/print` returning signed PDF (or renderable HTML + integrity payload).
- Include token id, serial number, mint transaction id, file hash, owner, timestamp, and verification URL/QR.

---

### 7) Dashboard evidence visibility
**Status:** 🟡 Partial

**What exists**
- Dashboard marks files as NFT certified by checking `nft_token_id`.
- Doctor dashboard has transaction status modal and stores tx id state.

**Gaps**
- Evidence views are limited to status flags and modal tx value; no dedicated evidence ledger tab using `nft_certificates` + `file_access_logs`.
- Some tabs are placeholders/restricted message blocks, so key evidence modules aren’t operational.
- `nftCertificates` state exists but is not connected to a loaded list for user review/export.

**MVP decision**
- Dashboard shows basic status indicators, not full compliance evidence.

---

## Flow Verdict (MVP)

### Works today
- Auth + OTP basic flow
- Encrypted upload and hash anchoring
- Permission grant/revoke logic
- Retrieval and DB access logging
- NFT minting initiation and token/serial persistence

### Highest-priority gaps before full pilot
1. **Certificate print/export pipeline** (currently missing)
2. **Authoritative mint tx evidence** (replace placeholder transaction id strategy)
3. **Evidence dashboard module** (access logs + NFT cert records + verification links)
4. **Persistent distributed rate limiting**
5. **Secret/key management hardening** (no raw private keys/plain encryption secrets)
6. **Migration consistency** for logging tables used in code

---

## Practical MVP Test Plan (Flow to Print + Evidence)

1. **Onboarding flow test**
   - Signup new user
   - Verify OTP
   - Signin and assert role redirect

2. **Upload + anchor test**
   - Upload `.vcf`
   - Assert `files.hash`, `files.ipfs_cid`, `files.hedera_transaction_id` populated

3. **Grant/revoke test**
   - Grant access F1→F2 with expiry
   - Validate F2 can fetch file
   - Revoke and validate access denied

4. **Mint certificate test**
   - Mint once succeeds
   - Second mint is blocked
   - Assert `files.nft_token_id`, `files.nft_serial_number`, `nft_certificates` record

5. **Print artifact test (to implement)**
   - Generate printable cert
   - Validate artifact contains chain + hash evidence

6. **Dashboard evidence test (to implement)**
   - Verify evidence tab displays:
     - NFT cert ledger
     - Access log timeline
     - Hashscan links
     - Export/print actions

---

## Recommended Delivery Order
1. Implement certificate print/export endpoint and template
2. Add evidence API (`/api/evidence/:fileId`) aggregating cert + access logs + hash anchors
3. Replace mock transaction IDs in grant/revoke and persist real Hedera receipts
4. Add persistent rate limiter (Redis/Supabase)
5. Encrypt sensitive secrets at rest + key rotation strategy
6. Add integration tests for end-to-end evidence lifecycle
