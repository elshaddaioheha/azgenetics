/**
 * email.ts — Supabase built-in email service adapter
 *
 * Instead of Resend, we now delegate OTP generation + delivery
 * entirely to Supabase Auth. Supabase sends the email automatically
 * when `signInWithOtp` is called — no SMTP config needed on our end.
 *
 * Supabase default limit: 3 emails/hour on free tier.
 * For higher limits configure SMTP in: Supabase → Authentication → SMTP Settings.
 */

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

interface SendOTPEmailParams {
  to: string;
  code?: string;       // kept for backwards-compat; unused with Supabase auth OTP
  userName?: string;
}

/**
 * Trigger Supabase to send a 6-digit OTP to the given email address.
 * Supabase handles generation, storage, expiry, and email delivery.
 */
export async function sendOTPEmail({ to }: SendOTPEmailParams) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.auth.signInWithOtp({
    email: to,
    options: {
      shouldCreateUser: false, // user already exists at this point
    },
  });

  if (error) {
    console.error('Supabase OTP send error:', error.message);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  return { success: true };
}

// Kept for import compatibility — no longer used
export function getOTPEmailPlainText(code: string, userName?: string): string {
  return `Your AZ-Genes verification code is: ${code}. It expires in 10 minutes.`;
}
