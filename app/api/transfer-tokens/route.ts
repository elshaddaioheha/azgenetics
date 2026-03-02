export const runtime = 'nodejs';

import { onRequest } from '../../../src/functions/edge/transfer-tokens';
import { supabase } from '../_context';
import { withRateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const rateLimitRes = await withRateLimit(req, 'transactions');
  if (rateLimitRes) return rateLimitRes;

  return onRequest(req, { supabase });
}

export async function OPTIONS(req: Request) {
  return onRequest(req, { supabase });
}
