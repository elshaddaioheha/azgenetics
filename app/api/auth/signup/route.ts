/**
 * API Routes for OTP-based Email Authentication using Supabase Auth
 * 
 * POST /api/auth/signup - Create new account with email/password
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/api/_context';
import { HederaClient } from '@/src/services/hedera/client';
import { withRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        // Upstash Rate Limiting: Authentication policy
        const rateLimitRes = await withRateLimit(request, 'auth');
        if (rateLimitRes) return rateLimitRes;

        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection error' },
                { status: 500 }
            );
        }

        const { email, password, fullName, role } = await request.json();

        // Validate inputs
        if (!email || !password || !fullName || !role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!['patient', 'doctor', 'researcher'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Create user with Supabase Auth.
        // With "Confirm email" ENABLED in Supabase Dashboard, calling signUp()
        // automatically sends a 6-digit OTP to the user's email.
        // The email template must include {{ .Token }} to show the numeric code.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    user_role: role,
                },
            },
        });

        if (authError) {
            console.error('Supabase signup error:', authError);

            if (authError.message.includes('already registered')) {
                return NextResponse.json(
                    { error: 'Email already registered' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: authError.message || 'Failed to create account' },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }

        // OTP is handled entirely by Supabase Auth — no custom table needed.
        // signInWithOtp sends the 6-digit code to the user's email using
        // Supabase's built-in email service. No Resend/SMTP key required.

        // Generate a new Hedera account for the user (Embedded Wallet)
        let hederaAccountId = '';
        let hederaPrivateKey = '';
        try {
            const hederaClient = new HederaClient();
            const hAccount = await hederaClient.createAccount();
            hederaAccountId = hAccount.accountId;
            hederaPrivateKey = hAccount.privateKey;
            console.log(`✅ Default Hedera account ${hederaAccountId} generated for ${email}`);
        } catch (hErr) {
            console.error('Failed to generate Hedera account during signup:', hErr);
            // Non-blocking for now
        }

        // Store user profile in user_profiles (canonical table)
        // Columns: id, auth_id, subscription_tier, created_at, updated_at, name, email, user_role
        const { error: userProfileError } = await supabase
            .from('user_profiles')
            .insert({
                auth_id: authData.user.id,
                email,
                name: fullName,
                user_role: role,
                subscription_tier: 'F1',
            });

        if (userProfileError) {
            console.error('Error creating user_profile:', userProfileError.message);
            // Non-fatal — auth account exists, profile can be synced on next login
        }

        // Supabase Auth sends the OTP confirmation email automatically
        // when signUp() is called, as long as "Confirm email" is ENABLED
        // in Supabase Dashboard → Authentication → Email.
        // The email template should show {{ .Token }} for the 6-digit code.
        console.log(`✅ User created — Supabase will send confirmation OTP to ${email}`);

        return NextResponse.json({
            success: true,
            message: 'Account created. Please check your email for the verification code.',
            userId: authData.user.id,
        });

    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
