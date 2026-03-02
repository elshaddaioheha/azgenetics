/**
 * Fix Files Table RLS Policies
 * Applies correct RLS policies that use user_profiles instead of profiles
 * Run: node scripts/fix-rls.mjs
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
    process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
    console.error(`
Missing SUPABASE_SERVICE_ROLE_KEY.

To get it:
  1. Go to https://supabase.com/dashboard/project/sjzgapndzcflhaxxgcph/settings/api
  2. Scroll to "Project API keys"
  3. Copy the "service_role" key (secret — do not expose publicly)
  4. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_key_here

Alternatively, run this SQL directly in the Supabase SQL Editor:
  https://supabase.com/dashboard/project/sjzgapndzcflhaxxgcph/sql/new

---- PASTE THIS SQL ----
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='files'
  LOOP EXECUTE 'DROP POLICY IF EXISTS '||quote_ident(pol.policyname)||' ON public.files'; END LOOP;
END $$;
ALTER TABLE public.files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY files_select_own ON public.files FOR SELECT TO authenticated
  USING (owner_id IN (SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()));
CREATE POLICY files_insert_own ON public.files FOR INSERT TO authenticated
  WITH CHECK (owner_id IN (SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()));
CREATE POLICY files_update_own ON public.files FOR UPDATE TO authenticated
  USING (owner_id IN (SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()));
---- END SQL ----
`);
    process.exit(1);
}

const sql = `
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='files'
  LOOP EXECUTE 'DROP POLICY IF EXISTS '||quote_ident(pol.policyname)||' ON public.files'; END LOOP;
END $$;
ALTER TABLE public.files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY files_select_own ON public.files FOR SELECT TO authenticated
  USING (owner_id IN (SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()));
CREATE POLICY files_insert_own ON public.files FOR INSERT TO authenticated
  WITH CHECK (owner_id IN (SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()));
CREATE POLICY files_update_own ON public.files FOR UPDATE TO authenticated
  USING (owner_id IN (SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()));
`;

const projectRef = SUPABASE_URL.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
});

const body = await res.json();
if (res.ok) {
    console.log('✅ RLS policies fixed successfully!');
} else {
    console.error('❌ Failed:', JSON.stringify(body, null, 2));
    console.log('\nRun the SQL manually at:');
    console.log('https://supabase.com/dashboard/project/sjzgapndzcflhaxxgcph/sql/new');
}
