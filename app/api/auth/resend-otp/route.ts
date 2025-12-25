import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/api/_context';
import { sendOTPEmail } from '@/lib/email';

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Get user profile to get their name
        const { data: profile } = await supabase
            .from('profiles')
            .select('name, email_verified')
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

        // Check for recent OTP requests (rate limiting)
        const { data: recentOTP } = await supabase
            .from('otp_verifications')
            .select('created_at')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (recentOTP) {
            const timeSinceLastOTP = Date.now() - new Date(recentOTP.created_at).getTime();
            const cooldownMs = 60 * 1000; // 1 minute cooldown

            if (timeSinceLastOTP < cooldownMs) {
                const secondsLeft = Math.ceil((cooldownMs - timeSinceLastOTP) / 1000);
                return NextResponse.json(
                    { error: `Please wait ${secondsLeft} seconds before requesting a new code` },
                    { status: 429 }
                );
            }
        }

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store new OTP
        const { error: otpError } = await supabase
            .from('otp_verifications')
            .insert({
                email,
                code: otp,
                expires_at: new Date(expiresAt).toISOString(),
                verified: false,
            });

        if (otpError) {
            console.error('Error storing OTP:', otpError);
            return NextResponse.json(
                { error: 'Failed to generate verification code' },
                { status: 500 }
            );
        }

        // Send OTP via email
        try {
            await sendOTPEmail({
                to: email,
                code: otp,
                userName: profile.name,
            });
            console.log(`✅ OTP resent to ${email}`);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            return NextResponse.json(
                { error: 'Failed to send verification email' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Verification code sent. Please check your email.',
            // For development only
            _dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to resend verification code' },
            { status: 500 }
        );
    }
}
