/**
 * API Routes for OTP-based Email Authentication using Supabase Auth
 * 
 * POST /api/auth/signup - Create new account with email/password
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/api/_context';
import { HederaClient } from '@/src/services/hedera/client';

// Rate limiting: max 5 requests per email per hour
const loginAttempts = new Map<string, { attempts: number; resetAt: number; blockedUntil?: number }>();

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 60 * 60 * 1000; // 1 hour
const RESET_INTERVAL = 60 * 60 * 1000; // 1 hour

function checkRateLimit(email: string): { allowed: boolean; message?: string } {
    const now = Date.now();
    const record = loginAttempts.get(email);

    if (!record) {
        loginAttempts.set(email, { attempts: 1, resetAt: now + RESET_INTERVAL });
        return { allowed: true };
    }

    if (record.blockedUntil && now < record.blockedUntil) {
        const minutesLeft = Math.ceil((record.blockedUntil - now) / 60000);
        return {
            allowed: false,
            message: `Too many attempts. Try again in ${minutesLeft} minutes.`
        };
    }

    if (now > record.resetAt) {
        loginAttempts.set(email, { attempts: 1, resetAt: now + RESET_INTERVAL });
        return { allowed: true };
    }

    record.attempts++;

    if (record.attempts > MAX_ATTEMPTS) {
        record.blockedUntil = now + BLOCK_DURATION;
        return {
            allowed: false,
            message: 'Too many login attempts. Please try again in 1 hour.'
        };
    }

    return { allowed: true };
}


export async function POST(request: NextRequest) {
    try {
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

        // Check rate limit
        const rateLimitCheck = checkRateLimit(email);
        if (!rateLimitCheck.allowed) {
            return NextResponse.json(
                { error: rateLimitCheck.message },
                { status: 429 }
            );
        }

        // Create user with Supabase Auth.
        // NOTE: Do NOT pass emailRedirectTo here — that causes Supabase to send its
        // own magic-link/confirmation email on top of our custom OTP email.
        // Email verification is handled entirely by our custom OTP flow (sendOTPEmail +
        // otp_verifications table). Ensure "Confirm email" is DISABLED in the Supabase
        // Dashboard → Authentication → Email settings.
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

        // Store user profile in Supabase
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email,
                name: fullName,
                user_role: role,
                auth_type: 'email',
                subscription_tier: 'F1', // Default tier
                email_verified: false,
                hedera_account_id: hederaAccountId,
                hedera_private_key: hederaPrivateKey
            });

        if (profileError) {
            console.error('Error creating profile:', profileError);
        }

        // Also add to user_profiles to keep schemas in sync
        const { error: userProfileError } = await supabase
            .from('user_profiles')
            .insert({
                id: authData.user.id,
                auth_id: authData.user.id,
                subscription_tier: 'F1',
                hedera_account_id: hederaAccountId,
                hedera_private_key: hederaPrivateKey
            });

        if (userProfileError) {
            console.error('Error syncing user_profile:', userProfileError);
        }

        // Send OTP via Supabase Auth's built-in email delivery
        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email,
                options: { shouldCreateUser: false },
            });
            if (otpError) throw new Error(otpError.message);
            console.log(`✅ Supabase OTP email sent to ${email}`);
        } catch (err: any) {
            console.error('Failed to send OTP email:', err);
            // Non-blocking in production — account still created
            if (process.env.NODE_ENV === 'development') {
                return NextResponse.json(
                    { error: `Email failed to send: ${err.message}. Account was created.` },
                    { status: 500 }
                );
            }
        }

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
