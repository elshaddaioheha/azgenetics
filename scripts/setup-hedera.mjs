/**
 * AZ-Genes Hedera One-Time Setup Script
 * ======================================
 * Creates:
 *   1. A Hedera Consensus Service (HCS) Topic for file hash logging
 *   2. An NFT collection token for genetic data certificates
 *
 * Run ONCE after setting HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY in .env.local:
 *   node scripts/setup-hedera.mjs
 *
 * Copy the printed IDs into your .env.local file.
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const OPERATOR_ID = process.env.HEDERA_OPERATOR_ID;
const OPERATOR_KEY = process.env.HEDERA_OPERATOR_KEY;
const NETWORK = process.env.HEDERA_NETWORK || 'testnet';

// ──────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ──────────────────────────────────────────────────────────────────────────────
if (!OPERATOR_ID || !OPERATOR_KEY) {
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║  ERROR: Missing Hedera credentials in .env.local             ║
╠══════════════════════════════════════════════════════════════╣
║  Please add the following to your .env.local file:           ║
║                                                              ║
║    HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID                    ║
║    HEDERA_OPERATOR_KEY=your_private_key_hex                   ║
║    HEDERA_NETWORK=testnet                                     ║
║                                                              ║
║  Get a FREE testnet account at: https://portal.hedera.com    ║
╚══════════════════════════════════════════════════════════════╝
`);
    process.exit(1);
}

// ──────────────────────────────────────────────────────────────────────────────
// HEDERA SETUP
// ──────────────────────────────────────────────────────────────────────────────
import {
    Client,
    AccountId,
    PrivateKey,
    TopicCreateTransaction,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
} from '@hashgraph/sdk';

const COLOR = {
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    bold: '\x1b[1m',
    reset: '\x1b[0m',
    dim: '\x1b[2m',
};

function log(msg, color = COLOR.reset) {
    console.log(`${color}${msg}${COLOR.reset}`);
}

async function main() {
    console.log(`\n${COLOR.bold}${COLOR.cyan}╔═══════════════════════════════════════════════╗`);
    console.log(`║   AZ-GENES HEDERA SETUP                       ║`);
    console.log(`╚═══════════════════════════════════════════════╝${COLOR.reset}`);
    log(`  Network  : ${NETWORK}`, COLOR.dim);
    log(`  Operator : ${OPERATOR_ID}`, COLOR.dim);

    const operatorId = AccountId.fromString(OPERATOR_ID);

    // Smart key parser: handles 0x-prefixed ECDSA hex, raw hex, and DER-encoded keys
    let operatorKey;
    const rawKey = OPERATOR_KEY.startsWith('0x') ? OPERATOR_KEY.slice(2) : OPERATOR_KEY;
    try {
        // Try ECDSA first (most common from Hedera portal)
        operatorKey = PrivateKey.fromStringECDSA(rawKey);
        console.log('  Key format : ECDSA');
    } catch {
        try {
            // Try DER-encoded (starts with 302e...)
            operatorKey = PrivateKey.fromStringDer(rawKey);
            console.log('  Key format : DER-encoded');
        } catch {
            // Fall back to ED25519
            operatorKey = PrivateKey.fromStringED25519(rawKey);
            console.log('  Key format : ED25519');
        }
    }

    const client = NETWORK === 'mainnet'
        ? Client.forMainnet()
        : Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    let topicId = process.env.HEDERA_TOPIC_ID || null;
    let collectionId = process.env.HEDERA_NFT_COLLECTION_TOKEN_ID || null;

    // ── STEP 1: Create HCS Topic ──────────────────────────────────────────────
    if (topicId) {
        log(`\n✅  HCS Topic already configured: ${topicId}`, COLOR.green);
    } else {
        log('\n📡  Creating HCS Topic for file hash submissions...', COLOR.cyan);
        try {
            const topicTx = await new TopicCreateTransaction()
                .setTopicMemo('AZ-Genes genetic data hash log')
                .execute(client);

            const topicReceipt = await topicTx.getReceipt(client);
            topicId = topicReceipt.topicId.toString();
            log(`✅  HCS Topic created: ${topicId}`, COLOR.green);
        } catch (err) {
            console.error('❌  Failed to create HCS Topic:', err.message);
            process.exit(1);
        }
    }

    // ── STEP 2: Create NFT Collection ────────────────────────────────────────
    if (collectionId) {
        log(`\n✅  NFT Collection already configured: ${collectionId}`, COLOR.green);
    } else {
        log('\n🎨  Creating NFT Certificate Collection on Hedera...', COLOR.cyan);
        try {
            // The supply key determines who can mint NFTs (the operator)
            const supplyKey = operatorKey;

            const tokenTx = await new TokenCreateTransaction()
                .setTokenName('AZ-Genes Genetic Certificate')
                .setTokenSymbol('AZG-CERT')
                .setTokenType(TokenType.NonFungibleUnique)
                .setSupplyType(TokenSupplyType.Infinite)
                .setInitialSupply(0)
                .setTreasuryAccountId(operatorId)
                .setSupplyKey(supplyKey.publicKey)
                .setTokenMemo('AZ-Genes verified genetic data proof certificates')
                .freezeWith(client);

            const signedTx = await tokenTx.sign(operatorKey);
            const response = await signedTx.execute(client);
            const receipt = await response.getReceipt(client);

            collectionId = receipt.tokenId.toString();
            log(`✅  NFT Collection created: ${collectionId}`, COLOR.green);
        } catch (err) {
            console.error('❌  Failed to create NFT Collection:', err.message);
            process.exit(1);
        }
    }

    // ── DONE: Print instructions ──────────────────────────────────────────────
    console.log(`\n${COLOR.bold}${COLOR.cyan}╔═══════════════════════════════════════════════╗`);
    console.log(`║   SUCCESS — Add these to your .env.local:     ║`);
    console.log(`╚═══════════════════════════════════════════════╝${COLOR.reset}`);

    const envBlock = `
# Hedera Configuration (generated by setup-hedera.mjs)
HEDERA_NETWORK=${NETWORK}
HEDERA_OPERATOR_ID=${OPERATOR_ID}
HEDERA_OPERATOR_KEY=${OPERATOR_KEY}
HEDERA_TOPIC_ID=${topicId}
HEDERA_NFT_COLLECTION_TOKEN_ID=${collectionId}
`;

    console.log(`\x1b[33m${envBlock}\x1b[0m`);

    log('Copy the lines above and paste them into your .env.local file.', COLOR.dim);
    log('Then restart your dev server: npm run dev\n', COLOR.dim);

    // Optionally write to a file for convenience
    import('fs').then(({ writeFileSync }) => {
        const outputPath = resolve(__dirname, '../hedera-config-output.txt');
        writeFileSync(outputPath, envBlock.trim(), 'utf8');
        log(`  (Also saved to hedera-config-output.txt for convenience)`, COLOR.dim);
    });

    client.close();
}

main().catch(err => {
    console.error('\n💥 Unexpected error:', err.message);
    console.error(err);
    process.exit(1);
});
