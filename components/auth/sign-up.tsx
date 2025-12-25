"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

type UserRole = 'patient' | 'doctor' | 'researcher';

interface SignUpFormData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole | '';
}

const SignUp: React.FC = () => {
    const router = useRouter();
    const [step, setStep] = useState<'form' | 'verify'>('form');
    const [formData, setFormData] = useState<SignUpFormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
    });
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [devOtp, setDevOtp] = useState(''); // For development
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleInputChange = (field: keyof SignUpFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    role: formData.role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create account');
            }

            // Store dev OTP for development
            if (data._dev_otp) {
                setDevOtp(data._dev_otp);
            }

            setStep('verify');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;

        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to resend code');
            }

            if (data._dev_otp) {
                setDevOtp(data._dev_otp);
            }

            setResendCooldown(60); // 60 second cooldown
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cooldown timer effect
    React.useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (otpCode.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    code: otpCode,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify code');
            }

            // Sign in the user after verification
            const signInResponse = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (signInResponse.ok) {
                // Redirect to dashboard based on role
                const dashboardPath = formData.role === 'patient'
                    ? '/dashboard'
                    : `/dashboard/${formData.role}`;
                router.push(dashboardPath);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="fixed inset-0 z-0 bg-grid pointer-events-none opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="glass-panel px-8 py-10 w-full max-w-md rounded-2xl relative z-10 border-border overflow-hidden group bg-white shadow-xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-4">
                        <Icon icon="lucide:user-plus" width={24} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                        {step === 'form' ? 'Create Account' : 'Verify Email'}
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-1">
                        {step === 'form' ? 'Join the Genomic Protocol' : 'Enter verification code'}
                    </p>
                </div>

                {step === 'form' ? (
                    <form onSubmit={handleSignUp} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 transition-colors shadow-sm"
                                value={formData.fullName}
                                onChange={e => handleInputChange('fullName', e.target.value)}
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 transition-colors shadow-sm"
                                value={formData.email}
                                onChange={e => handleInputChange('email', e.target.value)}
                                required
                                placeholder="name@domain.com"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 transition-colors shadow-sm"
                                value={formData.password}
                                onChange={e => handleInputChange('password', e.target.value)}
                                required
                                placeholder="Min. 6 characters"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 transition-colors shadow-sm"
                                value={formData.confirmPassword}
                                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                                required
                                placeholder="Confirm password"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                                I am a...
                            </label>
                            <select
                                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none shadow-sm"
                                value={formData.role}
                                onChange={e => handleInputChange('role', e.target.value as UserRole)}
                                required
                            >
                                <option value="">Select your role</option>
                                <option value="patient">Individual Patient</option>
                                <option value="doctor">Medical Practitioner</option>
                                <option value="researcher">Research Facility</option>
                            </select>
                        </div>

                        {error && (
                            <div className="text-red-500 text-[10px] font-mono p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                                <Icon icon="lucide:alert-circle" width={12} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-emerald-400"
                                }`}
                        >
                            {loading && <Icon icon="lucide:loader-2" className="animate-spin" width={16} />}
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="text-center mb-6">
                            <p className="text-sm text-slate-600 mb-2">
                                We've sent a 6-digit code to
                            </p>
                            <p className="text-sm font-bold text-foreground">{formData.email}</p>
                        </div>

                        {devOtp && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-xs text-yellow-800 font-mono">
                                    DEV MODE - Your OTP: <strong>{devOtp}</strong>
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1 text-center">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                className="w-full bg-white border border-border rounded-xl px-4 py-4 text-2xl text-center text-foreground focus:outline-none focus:border-emerald-500/50 transition-colors shadow-sm tracking-widest font-mono"
                                value={otpCode}
                                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                required
                                placeholder="000000"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-[10px] font-mono p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                                <Icon icon="lucide:alert-circle" width={12} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-emerald-400"
                                }`}
                        >
                            {loading && <Icon icon="lucide:loader-2" className="animate-spin" width={16} />}
                            {loading ? "Verifying..." : "Verify & Sign In"}
                        </button>

                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={loading || resendCooldown > 0}
                            className={`w-full py-3 rounded-lg border border-border text-xs font-bold uppercase tracking-widest transition-all ${resendCooldown > 0 || loading
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('form')}
                            className="w-full text-slate-500 py-2 text-[10px] font-bold uppercase tracking-widest hover:text-foreground transition-colors"
                        >
                            Back to Sign Up
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center border-t border-border pt-6">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="text-emerald-600 hover:text-emerald-500 font-bold ml-1 transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
