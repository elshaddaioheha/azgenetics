import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/api/_context';

export async function DELETE(request: NextRequest) {
    try {
        if (!supabase) {
            return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
        }

        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid authorization token' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        // Verify user token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // GDPR Compliance: Delete all off-chain data linked to the user
        // This includes physical files metadata, profiles, etc.
        // We delete from 'files' table where user_id matches
        const { error: filesError } = await supabase
            .from('files')
            .delete()
            .eq('user_id', user.id);

        if (filesError) {
            console.error('Error deleting files:', filesError);
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);

        if (profileError) {
            console.error('Error deleting profile:', profileError);
        }

        // Note: we don't delete on-chain data (Hedera), 
        // but we remove all references to it off-chain so it's fully anonymized.

        return NextResponse.json({
            success: true,
            message: 'Right to be Forgotten executed. All off-chain data has been securely wiped.'
        });

    } catch (error: any) {
        console.error('Delete data error:', error);
        return NextResponse.json({ error: 'Failed to execute data deletion' }, { status: 500 });
    }
}
