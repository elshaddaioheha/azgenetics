/**
 * POST /api/auth/resend-otp
 * Resends the signup confirmation OTP email via Supabase Auth.
 * Uses supabase.auth.resend() — the correct API for resending signup emails.
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

        // Use Supabase's official resend API for signup confirmation emails.
        // This resends the same OTP that was generated at signup.
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
        });

        if (error) {
            console.error('Supabase resend error:', error.message);
            // Supabase enforces a 60s cooldown between resend attempts
            if (error.message.toLowerCase().includes('rate') || error.status === 429) {
                return NextResponse.json(
                    { error: 'Please wait 60 seconds before requesting another code' },
                    { status: 429 }
                );
            }
            return NextResponse.json(
                { error: 'Failed to resend verification email. Please try again.' },
                { status: 500 }
            );
        }

        console.log(`✅ Supabase signup OTP resent to ${email}`);

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
