/**
 * POST /api/auth/resend-otp
 * Triggers Supabase Auth to resend a 6-digit OTP email to the user.
 * Supabase handles generation, storage, expiry, and delivery internally.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/api/_context';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection error' },
                { status: 500 }
            );
        }

        // Check the user exists before resending
        const { data: profile } = await supabase
            .from('profiles')
            .select('email_verified')
            .eq('email', email)
            .single();

        if (!profile) {
            return NextResponse.json(
                { error: 'No account found with this email' },
                { status: 404 }
            );
        }

        if (profile.email_verified) {
            return NextResponse.json(
                { error: 'Email already verified' },
                { status: 400 }
            );
        }

        // Delegate entirely to Supabase Auth — it generates, stores, and emails the OTP
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false, // user already exists
            },
        });

        if (error) {
            console.error('Supabase resend OTP error:', error.message);
            // Supabase rate-limits OTP sends (typically 60s cooldown)
            if (error.message.toLowerCase().includes('rate') || error.status === 429) {
                return NextResponse.json(
                    { error: 'Please wait before requesting another code' },
                    { status: 429 }
                );
            }
            return NextResponse.json(
                { error: 'Failed to send verification email' },
                { status: 500 }
            );
        }

        console.log(`✅ Supabase OTP resent to ${email}`);

        return NextResponse.json({
            success: true,
            message: 'Verification code sent. Please check your email.',
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to resend verification code' },
            { status: 500 }
        );
    }
}
