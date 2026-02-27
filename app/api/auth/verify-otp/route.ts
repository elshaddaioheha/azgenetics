/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit OTP code using Supabase Auth's native verifyOtp method.
 * Supabase handles all validation (code match, expiry, single-use) internally.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/api/_context';

export async function POST(request: NextRequest) {
    try {
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection error' },
                { status: 500 }
            );
        }

        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email and code are required' },
                { status: 400 }
            );
        }

        // Verify the OTP code through Supabase Auth
        // Supabase checks expiry, single-use, and code match internally
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'email',
        });

        if (error) {
            console.error('Supabase OTP verify error:', error.message);

            if (error.message.toLowerCase().includes('expired')) {
                return NextResponse.json(
                    { error: 'Verification code expired. Please request a new one.' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // Mark email as verified in our profiles table
        const { error: updateError } = await supabase
            .rpc('verify_user_email', { p_email: email });

        if (updateError) {
            console.error('Error updating profile verification status:', updateError);
            // Non-blocking — Supabase Auth session is already established
        }

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully',
            session: data.session,
        });

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify code' },
            { status: 500 }
        );
    }
}
