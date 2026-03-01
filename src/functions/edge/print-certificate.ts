import { AuthContext, corsHeaders } from './utils';
import { withAuth } from './middleware/auth';

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function extractFileId(req: Request): string | null {
  const url = new URL(req.url);
  const queryFileId = url.searchParams.get('fileId');
  if (queryFileId) return queryFileId;

  const segments = url.pathname.split('/').filter(Boolean);
  const certIndex = segments.indexOf('certificates');
  if (certIndex >= 0 && segments[certIndex + 1]) {
    return segments[certIndex + 1];
  }

  return null;
}

async function handlePrintCertificate(req: Request, context: AuthContext): Promise<Response> {
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
    .select('id,auth_id')
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

  if (file.owner_id !== profile.id) {
    return new Response(JSON.stringify({ error: 'Only file owners can print certificates' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 403,
    });
  }

  const { data: certificate } = await context.supabase
    .from('nft_certificates')
    .select('*')
    .eq('file_id', fileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!certificate) {
    return new Response(JSON.stringify({ error: 'No certificate minted for this file yet' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  }

  const network = process.env.HEDERA_NETWORK || 'testnet';
  const txId = certificate.hedera_transaction_id || file.hedera_transaction_id;
  const hashscanTxUrl = txId
    ? `https://hashscan.io/${network}/transaction/${encodeURIComponent(txId)}`
    : '';
  const hashscanTokenUrl = `https://hashscan.io/${network}/token/${encodeURIComponent(certificate.token_id)}?sn=${encodeURIComponent(certificate.serial_number)}`;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>AZ-Genes Certificate - ${escapeHtml(file.file_name)}</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; margin: 40px; color: #111827; }
    .wrap { max-width: 900px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; }
    h1 { margin: 0 0 8px 0; }
    .muted { color: #6b7280; }
    .grid { display: grid; grid-template-columns: 220px 1fr; gap: 10px 20px; margin-top: 24px; }
    .k { font-weight: 700; color: #374151; }
    .v { word-break: break-word; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .links { margin-top: 24px; }
    .print { margin-top: 30px; }
    @media print { .print { display: none; } body { margin: 0; } .wrap { border: none; } }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>AZ-Genes Data Ownership Certificate</h1>
    <p class="muted">This document summarizes the on-chain and integrity evidence for a minted certificate.</p>

    <div class="grid">
      <div class="k">File Name</div><div class="v">${escapeHtml(file.file_name)}</div>
      <div class="k">File Type</div><div class="v">${escapeHtml(file.file_type)}</div>
      <div class="k">File Hash</div><div class="v">${escapeHtml(file.hash || '')}</div>
      <div class="k">Owner Profile ID</div><div class="v">${escapeHtml(file.owner_id || '')}</div>
      <div class="k">Token ID</div><div class="v">${escapeHtml(certificate.token_id || '')}</div>
      <div class="k">Serial Number</div><div class="v">${escapeHtml(String(certificate.serial_number || ''))}</div>
      <div class="k">Mint Transaction ID</div><div class="v">${escapeHtml(txId || '')}</div>
      <div class="k">Certificate Issued At</div><div class="v">${escapeHtml(new Date(certificate.created_at).toISOString())}</div>
    </div>

    <div class="links">
      <div><strong>Hashscan Transaction:</strong> ${hashscanTxUrl ? `<a href="${hashscanTxUrl}" target="_blank" rel="noopener noreferrer">${hashscanTxUrl}</a>` : 'N/A'}</div>
      <div><strong>Hashscan NFT:</strong> <a href="${hashscanTokenUrl}" target="_blank" rel="noopener noreferrer">${hashscanTokenUrl}</a></div>
    </div>

    <button class="print" onclick="window.print()">Print Certificate</button>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0',
    },
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
    return await withAuth(req, context, handlePrintCertificate);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, code: 'UnknownError' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
