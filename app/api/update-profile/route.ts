import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/api/_context';
import { withRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        // Rate Limiting
        const rateLimitRes = await withRateLimit(request, 'api');
        if (rateLimitRes) return rateLimitRes;

        if (!supabase) {
            return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
        }

        // Must be authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        // Sometimes getSession from _context server client won't work perfectly without cookies,
        // let's use getUser instead to be safe and verify token from header if available
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, preferences } = body;

        // Update the profile in Supabase
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (preferences !== undefined) updates.preferences = preferences;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: true, message: 'No changes made' });
        }

        const { error: updateError } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('auth_id', user.id);

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error('Update profile error:', err);
        return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 });
    }
}
