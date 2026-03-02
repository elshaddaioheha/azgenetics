import { EncryptionService } from '../../services/encryption';
import { HederaClient } from '../../services/hedera/client';
import { IPFSClient } from '../../services/ipfs/client';
import { FileMetadata } from './types';
import { AuthContext, corsHeaders } from './utils';
import { withAuth } from './middleware/auth';
import { GeneticETLService } from '../../services/genetic/etl';

const encryptionService = new EncryptionService();
const getHederaClient = () => new HederaClient();
const ipfsClient = new IPFSClient();
const etlService = new GeneticETLService();
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

    // Process genetic data for analytics if it's a VCF or CSV file
    let extractedMarkers: string[] = [];
    const isVcf = file.name.toLowerCase().endsWith('.vcf') || file.type === 'chemical/x-vcf';
    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';

    if (isVcf || isCsv) {
      try {
        const content = fileBuffer.toString('utf-8');
        const processedData = isVcf
          ? await etlService.processVCFFile(content)
          : await etlService.processCSVFile(content);

        const normalizedData = await etlService.normalizeData(processedData);

        // Extract markers for researcher analytics
        extractedMarkers = normalizedData.variants
          .map(v => {
            if (v.id && v.id !== '.') return v.id;
            if (v.info.rsID) return String(v.info.rsID);
            if (v.info.GENE) return String(v.info.GENE); // For CSV reports
            return null;
          })
          .filter((id): id is string => id !== null && id !== undefined)
          .slice(0, 50); // Capture representative sample of markers
      } catch (error) {
        console.error('Error processing genetic file:', error);
        // Continue upload even if ETL fails - availability first
      }
    }

    // Encrypt file
    const { encryptedData, key, iv, hash } = await encryptionService.encryptFile(fileBuffer);

    // Upload encrypted file to IPFS via Pinata
    const timestamp = new Date().toISOString();
    const fileName = `${timestamp}-${file.name}`;

    // Upload encrypted file to IPFS via Pinata (with retry for transient network errors)
    let ipfsCid = '';
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        ipfsCid = await ipfsClient.uploadFile(encryptedData, fileName);
        break; // success
      } catch (ipfsErr: any) {
        if (attempt === 3) throw new Error(`IPFS upload failed after 3 attempts: ${ipfsErr.message}`);
        console.warn(`[Upload] IPFS attempt ${attempt} failed, retrying...`);
        await new Promise(r => setTimeout(r, 2000 * attempt));
      }
    }

    // Submit hash to Hedera (non-blocking — upload succeeds even if Hedera is slow)
    let hederaTxId = '';
    try {
      hederaTxId = await getHederaClient().submitHash(TOPIC_ID, hash);
    } catch (hErr) {
      console.warn('Hedera hash submission failed (non-fatal):', (hErr as Error).message);
    }

    // Save file metadata — only include columns that exist in the files table
    const fileMetadata: Record<string, any> = {
      owner_id: profile.id,
      file_name: file.name,
      file_type: file.type,
      ipfs_cid: ipfsCid,
      encryption_key: key,
      encryption_iv: iv,
      hash,
    };
    // Only add Hedera tx ID if we got one (column may be optional)
    if (hederaTxId) fileMetadata.hedera_transaction_id = hederaTxId;

    const { data: savedFile, error: saveError } = await context.supabase
      .from('files')
      .insert(fileMetadata)
      .select()
      .single();

    if (saveError) {
      // PostgrestError has .message but doesn't extend Error — wrap it so catch works
      throw new Error(`DB insert failed: ${saveError.message} (code: ${saveError.code})`);
    }

    // Log analytics event if markers were extracted (for F3 researchers)
    if (extractedMarkers.length > 0) {
      const { error: analyticsError } = await context.supabase
        .from('analytics_events')
        .insert({
          event_type: 'GENETIC_ASSET_UPLOAD',
          file_type: file.type,
          region: (profile as any).region || 'Global',
          age_range: (profile as any).age_range || 'Unknown',
          genetic_markers: extractedMarkers
        });

      if (analyticsError) {
        console.error('Failed to log analytics event:', analyticsError);
      }
    }

    return new Response(JSON.stringify(savedFile), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201
    });

  } catch (error) {
    // Extract message from Error, PostgrestError, or any object with .message
    const message =
      error instanceof Error ? error.message
        : (error as any)?.message ? (error as any).message
          : JSON.stringify(error);

    console.error('[Upload] Error:', message);

    const statusCode = (message.includes('Rate limit') || message.includes('Invalid file type')) ? 400 : 500;

    return new Response(JSON.stringify({
      error: message,
      code: error instanceof Error ? error.name : 'Error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode
    });
  }
}

// Export the handler with auth middleware
export const onRequest = (req: Request, context: AuthContext) =>
  withAuth(req, context, handleFileUpload);