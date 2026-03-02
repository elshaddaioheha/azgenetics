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
        // We check BOTH tables because of the schema migration history
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email_verified, user_role')
            .eq('id', authData.user.id)
            .maybeSingle();

        if (profileError) {
            console.error('Error fetching from profiles table:', profileError);
        }

        // Fallback to user_profiles if not found in profiles
        if (!profile) {
            const { data: userProfile, error: userProfileError } = await supabase
                .from('user_profiles')
                .select('user_role')
                .eq('auth_id', authData.user.id)
                .maybeSingle();

            if (userProfileError) {
                console.error('Error fetching from user_profiles table:', userProfileError);
            }

            if (userProfile) {
                profile = {
                    email_verified: false, // Default if not in profiles table
                    user_role: userProfile.user_role
                } as any;
            }
        }

        // Accept if either: our profiles table has email_verified=true,
        // OR Supabase Auth has confirmed the email (email_confirmed_at is set).
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

        // Update last login (non-blocking, don't fail if profiles row is missing)
        supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', authData.user.id)
            .then(({ error }) => {
                if (error) console.warn('Could not update last_login_at in profiles:', error.message);
            });

        return NextResponse.json({
            success: true,
            user: {
                id: authData.user.id,
                email: authData.user.email,
                role: profile?.user_role ?? authData.user.user_metadata?.user_role ?? 'patient',
            },
            session: authData.session,
        });

    } catch (error: any) {
        console.error('Login error detailed:', error);
        return NextResponse.json(
            { error: `Internal authentication error: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}

