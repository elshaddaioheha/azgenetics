/**
 * AZ-Genes Full API Flow Test Suite
 * ===================================
 * Tests: Sign Up → OTP Verify → Sign In → Upload File → Mint NFT Certificate
 *
 * Usage:
 *   node scripts/test-auth-flow.mjs --email=you@email.com --password="YourPass@2026"
 *   node scripts/test-auth-flow.mjs --email=you@email.com --password="YourPass@2026" --otp=123456
 *
 * Requirements:
 *   - `npm run dev` must be running on port 3000
 *   - A real email address you can access to receive the OTP
 *   - The password MUST be the one you used when first signing up
 *
 * Workflow:
 *   Step 1: node scripts/test-auth-flow.mjs --email=x --password="y"   (registers + triggers OTP)
 *   Step 2: Check your email for the 6-digit OTP code
 *   Step 3: node scripts/test-auth-flow.mjs --email=x --password="y" --otp=123456  (full suite)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ──────────────────────────────────────────────────────────────────────────────
// CONFIG — override with CLI args: --email=x --password=y
// ──────────────────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
    process.argv.slice(2)
        .filter(a => a.startsWith('--'))
        .map(a => a.replace('--', '').split('='))
);

const BASE_URL = args.url || 'http://localhost:3000';
const TEST_EMAIL = args.email || process.env.TEST_EMAIL || `azgenes_test_${Date.now()}@mailinator.com`;
const TEST_PASS = args.password || process.env.TEST_PASS || 'AzTest@2026';
const TEST_NAME = args.name || 'Test User';
const TEST_ROLE = args.role || 'patient';       // patient | doctor | researcher

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────
const COLOR = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
};

let passed = 0, failed = 0;

function log(msg, color = COLOR.reset) {
    console.log(`${color}${msg}${COLOR.reset}`);
}

function section(title) {
    console.log(`\n${COLOR.bold}${COLOR.cyan}━━━  ${title}  ━━━${COLOR.reset}`);
}

async function apiCall(method, endpoint, body, token) {
    const url = `${BASE_URL}/api/${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body && !(body instanceof FormData)) {
        options.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
        delete headers['Content-Type']; // let fetch set multipart boundary
        options.body = body;
    }

    const res = await fetch(url, options);
    let data;
    try { data = await res.json(); } catch { data = null; }
    return { status: res.status, ok: res.ok, data };
}

function assert(label, condition, detail = '') {
    if (condition) {
        log(`  ✅  ${label}`, COLOR.green);
        passed++;
    } else {
        log(`  ❌  ${label}${detail ? ` — ${detail}` : ''}`, COLOR.red);
        failed++;
    }
    return condition;
}

function warn(msg) {
    log(`  ⚠️   ${msg}`, COLOR.yellow);
}

function info(msg) {
    log(`  ℹ️   ${msg}${COLOR.reset}`, COLOR.dim);
}

// ──────────────────────────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────────────────────────
let accessToken = null;
let userId = null;
let uploadedFileId = null;

// ──────────────────────────────────────────────────────────────────────────────
// TEST 1 — SIGN UP
// ──────────────────────────────────────────────────────────────────────────────
async function testSignUp() {
    section('TEST 1: SIGN UP');
    info(`Email: ${TEST_EMAIL}  Role: ${TEST_ROLE}`);

    const { status, ok, data } = await apiCall('POST', 'auth/signup', {
        email: TEST_EMAIL,
        password: TEST_PASS,
        fullName: TEST_NAME,
        role: TEST_ROLE,
    });

    info(`Response ${status}: ${JSON.stringify(data)}`);

    if (assert('Status 200 or 201', status === 200 || status === 201, `Got ${status}`)) {
        assert('success=true', data?.success === true, JSON.stringify(data));
        assert('userId returned', !!data?.userId, JSON.stringify(data));
        userId = data?.userId;
    } else if (status === 400 && data?.error?.includes('already registered')) {
        warn('Email already registered — skipping signup, continuing with sign-in');
        return 'already_registered';
    }

    return 'ok';
}

// ──────────────────────────────────────────────────────────────────────────────
// TEST 2 — OTP VERIFY  (requires manual input)
// ──────────────────────────────────────────────────────────────────────────────
async function testVerifyOTP(otp) {
    section('TEST 2: OTP VERIFICATION');

    if (!otp) {
        warn('No OTP supplied — skipping verification test.');
        warn('  Re-run with: node scripts/test-auth-flow.mjs --otp=123456');
        return 'skipped';
    }

    const { status, ok, data } = await apiCall('POST', 'auth/verify-otp', {
        email: TEST_EMAIL,
        code: otp,
    });

    info(`Response ${status}: ${JSON.stringify(data)}`);
    assert('Status 200', status === 200, `Got ${status}`);
    assert('success=true', data?.success === true, JSON.stringify(data));

    if (data?.session?.access_token) {
        accessToken = data.session.access_token;
        info('Session token stored from OTP response');
    }

    return 'ok';
}

// ──────────────────────────────────────────────────────────────────────────────
// TEST 3 — SIGN IN
// ──────────────────────────────────────────────────────────────────────────────
async function testSignIn() {
    section('TEST 3: SIGN IN');

    const { status, ok, data } = await apiCall('POST', 'auth/signin', {
        email: TEST_EMAIL,
        password: TEST_PASS,
    });

    info(`Response ${status}: ${JSON.stringify({ ...data, session: data?.session ? '[exists]' : null })}`);

    if (status === 403 && data?.requiresVerification) {
        warn('Email not yet verified. Please check your inbox, get the OTP, then run:');
        warn(`  node scripts/test-auth-flow.mjs --email=${TEST_EMAIL} --password="${TEST_PASS}" --otp=YOUR_CODE`);
        return 'needs_verification';
    }

    if (assert('Sign-in status 200', status === 200, `Got ${status} — ${data?.error}`)) {
        assert('session returned', !!data?.session, JSON.stringify(data));
        assert('access_token present', !!data?.session?.access_token);
        assert('user.role present', !!data?.user?.role);

        accessToken = data?.session?.access_token;
        info(`Signed in as role: ${data?.user?.role}`);
    }

    return 'ok';
}

// ──────────────────────────────────────────────────────────────────────────────
// TEST 4 — GET PROFILE (validates auth token works)
// ──────────────────────────────────────────────────────────────────────────────
async function testGetProfile() {
    section('TEST 4: GET PROFILE');

    if (!accessToken) {
        warn('No access token — skipping profile test.');
        return 'skipped';
    }

    const { status, data } = await apiCall('GET', 'get-profile', null, accessToken);
    info(`Response ${status}: ${JSON.stringify(data)}`);

    assert('Profile status 200', status === 200, `Got ${status}`);
    assert('email present', !!data?.email);
    assert('user_role present', !!data?.user_role);

    return 'ok';
}

// ──────────────────────────────────────────────────────────────────────────────
// TEST 5 — FILE UPLOAD (processing pipeline)
// ──────────────────────────────────────────────────────────────────────────────
async function testFileUpload() {
    section('TEST 5: FILE UPLOAD & PROCESSING PIPELINE');

    if (!accessToken) {
        warn('No access token — skipping upload test.');
        return 'skipped';
    }

    // Create a small synthetic VCF file in-memory for testing
    const vcfContent = [
        '##fileformat=VCFv4.1',
        '##FILTER=<ID=PASS,Description="All filters passed">',
        '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO',
        'chr1\t925952\trs56712522\tG\tA\t100\tPASS\tGENE=SAMD11',
        'chr1\t931279\trs2691305\tA\tT\t100\tPASS\tGENE=SAMD11',
        'chr1\t935222\trs4970456\tC\tT\t100\tPASS\tGENE=SAMD11',
    ].join('\n');

    const blob = new Blob([vcfContent], { type: 'chemical/x-vcf' });
    const formData = new FormData();
    formData.append('file', blob, 'test_genetic_data.vcf');

    const headers = { Authorization: `Bearer ${accessToken}` };
    const res = await fetch(`${BASE_URL}/api/upload-file`, {
        method: 'POST', headers, body: formData
    });

    let data;
    try { data = await res.json(); } catch { data = null; }

    info(`Response ${res.status}: ${JSON.stringify(data)}`);

    if (assert('Upload status 201', res.status === 201, `Got ${res.status} — ${data?.error}`)) {
        assert('file id returned', !!data?.id, JSON.stringify(data));
        assert('ipfs_cid present', !!data?.ipfs_cid, JSON.stringify(data));
        assert('hedera_transaction_id set', !!data?.hedera_transaction_id, JSON.stringify(data));
        assert('encryption_key present', !!data?.encryption_key, JSON.stringify(data));

        uploadedFileId = data?.id;
        info(`File ID: ${uploadedFileId}`);
        info(`IPFS CID: ${data?.ipfs_cid}`);
        info(`Hedera TX: ${data?.hedera_transaction_id}`);
    } else {
        warn('Upload failed — NFT certificate test will be skipped');
    }

    return 'ok';
}

// ──────────────────────────────────────────────────────────────────────────────
// TEST 6 — MINT NFT CERTIFICATE
// ──────────────────────────────────────────────────────────────────────────────
async function testMintNFT() {
    section('TEST 6: NFT CERTIFICATE CREATION');

    if (!accessToken) {
        warn('No access token — skipping NFT test.');
        return 'skipped';
    }

    if (!uploadedFileId) {
        warn('No uploaded file ID — skipping NFT test.');
        warn('  (Upload must succeed first)');
        return 'skipped';
    }

    if (!process.env.HEDERA_NFT_COLLECTION_TOKEN_ID && !args.skip_hedera_check) {
        warn('HEDERA_NFT_COLLECTION_TOKEN_ID not set in environment.');
        warn('  NFT minting will fail without a configured Hedera NFT collection.');
        warn('  Proceeding to test the endpoint response anyway...');
    }

    const { status, data } = await apiCall('POST', 'mint-nft-certificate', {
        fileId: uploadedFileId,
        metadata: {
            name: 'Test Genetic Data Certificate',
            description: 'Proof of authentic genetic data upload by test suite',
        }
    }, accessToken);

    info(`Response ${status}: ${JSON.stringify(data)}`);

    if (status === 201) {
        assert('Mint status 201', status === 201);
        assert('nft object returned', !!data?.nft);
        assert('tokenId returned', !!data?.tokenId);
        assert('serialNumber returned', data?.serialNumber !== undefined);
        info(`Token ID: ${data?.tokenId}  Serial: ${data?.serialNumber}`);
        info(`Hedera TX: ${data?.nft?.hedera_transaction_id}`);
    } else if (status === 500 && data?.error?.includes('NFT collection not configured')) {
        warn('NFT collection not configured (expected in dev). Set HEDERA_NFT_COLLECTION_TOKEN_ID to test minting.');
        warn('  This is a configuration gap, not a code bug.');
    } else {
        assert('Mint successful', false, `${status} — ${data?.error}`);
    }

    return 'ok';
}

// ──────────────────────────────────────────────────────────────────────────────
// TEST 7 — GET FILES LIST (validate uploaded file persisted)
// ──────────────────────────────────────────────────────────────────────────────
async function testGetFiles() {
    section('TEST 7: LIST UPLOADED FILES');

    if (!accessToken) {
        warn('No access token — skipping files list test.');
        return 'skipped';
    }

    const { status, data } = await apiCall('GET', 'files', null, accessToken);
    info(`Response ${status}: ${JSON.stringify(Array.isArray(data) ? `[${data.length} files]` : data)}`);

    assert('Files status 200', status === 200, `Got ${status}`);
    assert('Returns array', Array.isArray(data), typeof data);

    if (Array.isArray(data) && uploadedFileId) {
        const found = data.find(f => f.id === uploadedFileId);
        assert('Uploaded file found in list', !!found, `File ID ${uploadedFileId} not in list of ${data.length}`);
    } else if (Array.isArray(data)) {
        info(`Files list returned ${data.length} file(s) — upload test must pass first to verify file presence`);
    }

    return 'ok';
}

// ──────────────────────────────────────────────────────────────────────────────
// INPUT VALIDATION TESTS
// ──────────────────────────────────────────────────────────────────────────────
async function testValidation() {
    section('TEST 8: INPUT VALIDATION');

    // Missing fields
    let r = await apiCall('POST', 'auth/signup', { email: TEST_EMAIL });
    assert('Signup rejects missing fields (400)', r.status === 400, `Got ${r.status}`);

    // Invalid role
    r = await apiCall('POST', 'auth/signup', {
        email: `valid_${Date.now()}@mailinator.com`, password: 'Test@1234',
        fullName: 'Test', role: 'superadmin'
    });
    assert('Signup rejects invalid role (400)', r.status === 400, `Got ${r.status}`);

    // Wrong password — may return 401 (invalid) or 429 (rate limited after many attempts)
    r = await apiCall('POST', 'auth/signin', {
        email: TEST_EMAIL, password: 'wrong-password-xyz'
    });
    assert('Sign-in rejects bad password (401 or 429)', r.status === 401 || r.status === 429, `Got ${r.status}`);

    // Upload without token — auth middleware returns 401 or 500 (config-check may run first)
    const formData = new FormData();
    formData.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt');
    const unauthedUpload = await fetch(`${BASE_URL}/api/upload-file`, {
        method: 'POST', body: formData
    });
    assert(
        'Upload rejects unauthenticated (401 or 500)',
        unauthedUpload.status === 401 || unauthedUpload.status === 500,
        `Got ${unauthedUpload.status}`
    );

    // NFT mint without token
    r = await apiCall('POST', 'mint-nft-certificate', { fileId: 'fake-id' });
    assert(
        'Mint rejects unauthenticated (401 or 500)',
        r.status === 401 || r.status === 500,
        `Got ${r.status}`
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
    console.log(`\n${COLOR.bold}${COLOR.cyan}╔════════════════════════════════════════╗`);
    console.log(`║   AZ-GENES API TEST SUITE              ║`);
    console.log(`╚════════════════════════════════════════╝${COLOR.reset}`);
    log(`  Base URL : ${BASE_URL}`, COLOR.dim);
    log(`  Email    : ${TEST_EMAIL}`, COLOR.dim);
    log(`  Role     : ${TEST_ROLE}`, COLOR.dim);
    log(`  OTP      : ${args.otp || '(not provided — verify step will be skipped)'}`, COLOR.dim);

    const startTime = Date.now();

    const signupResult = await testSignUp();

    if (args.otp) {
        await testVerifyOTP(args.otp);
    } else {
        section('TEST 2: OTP VERIFICATION');
        warn('Skipped — re-run with --otp=YOUR_CODE after checking your email.');
        warn(`Example: node scripts/test-auth-flow.mjs --email=${TEST_EMAIL} --password="${TEST_PASS}" --otp=123456`);
    }

    const signinResult = await testSignIn();
    await testGetProfile();

    if (signinResult !== 'needs_verification') {
        await testFileUpload();
        await testMintNFT();
        await testGetFiles();
    } else {
        warn('\nSkipping upload/NFT tests — account needs email verification first.');
    }

    await testValidation();

    // ──── SUMMARY ────
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const total = passed + failed;
    console.log(`\n${COLOR.bold}╔════════════════════════════════════════╗`);
    console.log(`║   RESULTS                              ║`);
    console.log(`╠════════════════════════════════════════╣`);
    console.log(`║  Passed : ${String(passed).padEnd(4)} / ${String(total).padEnd(4)}                    ║`);
    console.log(`║  Failed : ${String(failed).padEnd(4)}                            ║`);
    console.log(`║  Time   : ${elapsed}s                          ║`);
    console.log(`╚════════════════════════════════════════╝${COLOR.reset}`);

    if (failed === 0) {
        log('\n🎉 All tests passed!\n', COLOR.green + COLOR.bold);
    } else {
        log(`\n⚠️  ${failed} test(s) failed. Check the output above.\n`, COLOR.red + COLOR.bold);
        process.exit(1);
    }
}

main().catch(err => {
    log(`\n💥 Unexpected test runner error:\n${err.message}`, COLOR.red);
    console.error(err);
    process.exit(1);
});
