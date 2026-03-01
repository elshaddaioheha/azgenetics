import { AuthContext, corsHeaders } from './utils';
import { withAuth } from './middleware/auth';

function extractFileId(req: Request): string | null {
  const url = new URL(req.url);
  const queryFileId = url.searchParams.get('fileId');
  if (queryFileId) return queryFileId;

  const segments = url.pathname.split('/').filter(Boolean);
  const evidenceIndex = segments.indexOf('evidence');
  if (evidenceIndex >= 0 && segments[evidenceIndex + 1]) {
    return segments[evidenceIndex + 1];
  }

  return null;
}

async function handleGetEvidence(req: Request, context: AuthContext): Promise<Response> {
  if (req.method !== 'GET') {
    throw new Error('Method not allowed');
  }

  if (!context.user) {
    throw new Error('User not authenticated');
  }

  const fileId = extractFileId(req);
  if (!fileId) {
    return new Response(JSON.stringify({ error: 'File ID is required' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  const { data: profile, error: profileError } = await context.supabase
    .from('user_profiles')
    .select('id,subscription_tier')
    .eq('auth_id', context.user.id)
    .single();

  if (profileError || !profile) {
    return new Response(JSON.stringify({ error: 'User profile not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  }

  const { data: file, error: fileError } = await context.supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (fileError || !file) {
    return new Response(JSON.stringify({ error: 'File not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  }

  const isOwner = file.owner_id === profile.id;
  if (!isOwner) {
    const { data: permission } = await context.supabase
      .from('file_permissions')
      .select('id,status,expires_at')
      .eq('file_id', fileId)
      .eq('grantee_id', profile.id)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!permission) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }
  }

  const { data: certificate } = await context.supabase
    .from('nft_certificates')
    .select('*')
    .eq('file_id', fileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: accessLogs } = await context.supabase
    .from('file_access_logs')
    .select('id,access_type,status,error,created_at,user_id')
    .eq('file_id', fileId)
    .order('created_at', { ascending: false })
    .limit(100);

  const payload = {
    file: {
      id: file.id,
      name: file.file_name,
      type: file.file_type,
      hash: file.hash,
      createdAt: file.created_at,
      ownerId: file.owner_id,
      nftTokenId: file.nft_token_id,
      nftSerialNumber: file.nft_serial_number,
      hederaTransactionId: file.hedera_transaction_id,
    },
    certificate: certificate || null,
    accessLogs: accessLogs || [],
    checks: {
      hasNftCertificate: !!certificate,
      hasHashAnchor: !!file.hedera_transaction_id,
      hasAccessEvidence: (accessLogs || []).length > 0,
    },
  };

  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

export async function onRequest(req: Request, context: AuthContext): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed', code: 'MethodNotAllowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    return await withAuth(req, context, handleGetEvidence);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, code: 'UnknownError' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
