/**
 * email.ts — Supabase email service helper
 *
 * With "Confirm email" ENABLED in Supabase Dashboard:
 * - supabase.auth.signUp() automatically sends a confirmation email
 *   containing a 6-digit OTP (when you add {{ .Token }} to the email template)
 * - No separate email send call is needed after signUp
 *
 * For resending: use supabase.auth.resend({ type: 'signup', email })
 * For verifying: use supabase.auth.verifyOtp({ email, token, type: 'signup' })
 */

// This file is kept for backward import compatibility.
// The actual OTP sending happens inside supabase.auth.signUp() automatically.
// See app/api/auth/signup/route.ts and app/api/auth/resend-otp/route.ts

export async function sendOTPEmail(_params: { to: string; code?: string; userName?: string }) {
  // No-op: Supabase sends the OTP automatically on signUp when
  // "Confirm email" is enabled in the Supabase dashboard.
  return { success: true };
}

export function getOTPEmailPlainText(code: string, _userName?: string): string {
  return `Your AZ-Genes verification code is: ${code}. It expires in 10 minutes.`;
}
