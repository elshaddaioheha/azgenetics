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

        // Get the latest OTP for this email
        const { data: otpRecord, error: otpError } = await supabase
            .from('otp_verifications')
            .select('*')
            .eq('email', email)
            .eq('verified', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (otpError || !otpRecord) {
            return NextResponse.json(
                { error: 'No pending verification found' },
                { status: 404 }
            );
        }

        // Check if OTP is expired
        if (new Date(otpRecord.expires_at) < new Date()) {
            return NextResponse.json(
                { error: 'Verification code expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Verify the code
        if (otpRecord.code !== code) {
            return NextResponse.json(
                { error: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // Mark OTP as verified
        await supabase
            .from('otp_verifications')
            .update({ verified: true })
            .eq('id', otpRecord.id);

        // Update user profile to mark email as verified
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ email_verified: true })
            .eq('email', email);

        if (updateError) {
            console.error('Error updating profile:', updateError);
        }

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully',
        });

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify code' },
            { status: 500 }
        );
    }
}
