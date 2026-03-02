import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/api/_context';
import { withRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        // Upstash Rate Limiting: Authentication policy
        const rateLimitRes = await withRateLimit(request, 'auth');
        if (rateLimitRes) return rateLimitRes;

        // Check if Supabase is configured
        if (!supabase) {
            return NextResponse.json(
                { error: 'Server configuration error. Please contact support.' },
                { status: 500 }
            );
        }

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Sign in with Supabase Auth (replaces Firebase)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            console.error('Sign-in error:', authError);
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Failed to sign in' },
                { status: 500 }
            );
        }

        // Fetch profile for role and email_verified status
        const { data: profile } = await supabase
            .from('profiles')
            .select('email_verified, user_role')
            .eq('id', authData.user.id)
            .single();

        // Accept if either: our profiles table has email_verified=true,
        // OR Supabase Auth has confirmed the email (email_confirmed_at is set).
        // This handles the race condition where verifyOtp sets the Supabase session
        // before our RPC has a chance to update profiles.email_verified.
        const isVerified = profile?.email_verified || !!authData.user.email_confirmed_at;

        if (!isVerified) {
            return NextResponse.json(
                {
                    error: 'Email not verified. Please check your inbox for the verification code.',
                    requiresVerification: true,
                },
                { status: 403 }
            );
        }

        // Update last login
        await supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', authData.user.id);

        return NextResponse.json({
            success: true,
            user: {
                id: authData.user.id,
                email: authData.user.email,
                role: profile?.user_role ?? authData.user.user_metadata?.user_role ?? 'patient',
            },
            session: authData.session,
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Failed to sign in' },
            { status: 500 }
        );
    }
}
