import { EncryptionService } from '../../services/encryption';
import { HederaClient } from '../../services/hedera/client';
import { IPFSClient } from '../../services/ipfs/client';
import { FileMetadata } from './types';
import { AuthContext, corsHeaders } from './utils';
import { withAuth } from './middleware/auth';

const encryptionService = new EncryptionService();
const getHederaClient = () => new HederaClient();
const ipfsClient = new IPFSClient();
const TOPIC_ID = process.env.HEDERA_TOPIC_ID ?? '';

// Constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf', // Medical reports
  'text/plain',     // TXT files
  'text/csv',       // CSV files
  'chemical/x-vcf', // VCF files
  'text/x-vcard'    // Used by some browsers for .vcf
]);

// Rate limiting map (in production, use Redis or similar)
const uploadLimits = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 10; // uploads per hour
const RATE_WINDOW = 3600000; // 1 hour in milliseconds

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = uploadLimits.get(userId) || { count: 0, lastReset: now };

  // Reset counter if window has passed
  if (now - userLimit.lastReset > RATE_WINDOW) {
    userLimit.count = 0;
    userLimit.lastReset = now;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  uploadLimits.set(userId, userLimit);
  return true;
}

async function validateGeneticFile(fileBuffer: Buffer, fileType: string): Promise<boolean> {
  // Basic validation for VCF files
  const isVcf = fileType === 'chemical/x-vcf' || fileType === 'text/x-vcard';
  if (isVcf) {
    const content = fileBuffer.toString('utf-8').slice(0, 1000); // Check first 1000 chars
    return content.includes('##fileformat=VCF');
  }
  return true;
}

async function handleFileUpload(req: Request, context: AuthContext): Promise<Response> {
  if (req.method !== 'POST') {
    throw new Error('Method not allowed');
  }

  let uploadedFilePath: string | null = null;

  try {
    if (!context.user) {
      throw new Error('User not authenticated');
    }

    // Get user profile
    const { data: profile, error: profileError } = await context.supabase
      .from('user_profiles')
      .select()
      .eq('auth_id', context.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Check rate limit
    if (!checkRateLimit(profile.id)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Get file from request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type or extension
    const isAllowedExtension = file.name.toLowerCase().endsWith('.vcf') || file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.pdf');
    if (!ALLOWED_FILE_TYPES.has(file.type) && !isAllowedExtension) {
      throw new Error('Invalid file type. Supported types: PDF, TXT, CSV, VCF');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds limit of 100MB');
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Validate genetic file format if applicable
    if (!await validateGeneticFile(fileBuffer, file.type)) {
      throw new Error('Invalid genetic file format');
    }

    // Encrypt file
    const { encryptedData, key, iv, hash } = await encryptionService.encryptFile(fileBuffer);

    // Upload encrypted file to IPFS via Pinata
    const timestamp = new Date().toISOString();
    const fileName = `${timestamp}-${file.name}`;

    // Convert Buffer to CID via IPFS
    const ipfsCid = await ipfsClient.uploadFile(encryptedData, fileName);

    // Submit hash to Hedera
    const hederaTxId = await getHederaClient().submitHash(TOPIC_ID, hash);

    // Save file metadata
    const fileMetadata: Partial<FileMetadata> = {
      owner_id: profile.id,
      file_name: file.name,
      file_type: file.type,
      storage_path: undefined, // Legacy field
      ipfs_cid: ipfsCid,
      encryption_key: key,
      encryption_iv: iv,
      hash,
      hedera_transaction_id: hederaTxId
    };

    const { data: savedFile, error: saveError } = await context.supabase
      .from('files')
      .insert(fileMetadata)
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    return new Response(JSON.stringify(savedFile), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201
    });

  } catch (error) {
    // IPFS uploads are immutable, so we don't have a simple "remove" like Supabase Storage
    // unless we unpin from Pinata, but for now we skip cleanup since it's decentralized.

    const message = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = error instanceof Error &&
      (message.includes('Rate limit') || message.includes('Invalid file type')) ? 400 : 500;

    return new Response(JSON.stringify({
      error: message,
      code: error instanceof Error ? error.name : 'UnknownError'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode
    });
  }
}

// Export the handler with auth middleware
export const onRequest = (req: Request, context: AuthContext) =>
  withAuth(req, context, handleFileUpload);