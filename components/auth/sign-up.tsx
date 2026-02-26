"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Fingerprint,
    ArrowRight,
    ShieldCheck,
    Mail,
    Lock,
    User,
    ShieldAlert,
    ChevronLeft,
    RotateCcw,
    Stethoscope,
    Database,
    Zap
} from "lucide-react";
import Spinner from "@/components/ui/Spinner";

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
    const [devOtp, setDevOtp] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleInputChange = (field: keyof SignUpFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.password.length < 6) {
            setError('Account password must be at least 6 characters');
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
                throw new Error(data.error || 'Registration failed');
            }

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
            if (!response.ok) throw new Error(data.error || 'Resend request failed');
            if (data._dev_otp) setDevOtp(data._dev_otp);
            setResendCooldown(60);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
            setError('Please enter a valid 6-digit code');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code: otpCode }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Verification failed');

            const signInResponse = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });

            if (signInResponse.ok) {
                const dashboardPath = formData.role === 'patient' ? '/dashboard' : `/dashboard/${formData.role}`;
                router.push(dashboardPath);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfd] relative overflow-hidden font-sans selection:bg-fern/10 selection:text-fern">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-med-blue via-med-purple to-med-green opacity-40"></div>

            <div className="w-full max-w-2xl p-8 relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="w-10 h-10 rounded-xl bg-fern flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform font-bold text-sm">
                            AZ
                        </div>
                        <span className="text-foreground font-bold tracking-tight text-2xl uppercase">genes</span>
                    </Link>
                    <h2 className="text-4xl font-bold text-foreground tracking-tight mb-2">
                        {step === 'form' ? 'Create your account' : 'Verify your email'}
                    </h2>
                    <p className="text-sm font-semibold text-muted-foreground opacity-60 leading-relaxed">
                        {step === 'form'
                            ? 'Secure your genetic heritage with professional-grade encryption'
                            : `We've sent a verification code to ${formData.email}`}
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-border shadow-2xl relative overflow-hidden">
                    {step === 'form' ? (
                        <form onSubmit={handleSignUp} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                                        <User size={14} className="text-fern" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-full px-6 py-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-fern focus:bg-white transition-all shadow-sm"
                                        value={formData.fullName}
                                        onChange={e => handleInputChange('fullName', e.target.value)}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                                        <Mail size={14} className="text-fern" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-full px-6 py-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-fern focus:bg-white transition-all shadow-sm"
                                        value={formData.email}
                                        onChange={e => handleInputChange('email', e.target.value)}
                                        required
                                        placeholder="name@email.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                                        <Lock size={14} className="text-fern" /> Password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-full px-6 py-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-fern focus:bg-white transition-all shadow-sm"
                                        value={formData.password}
                                        onChange={e => handleInputChange('password', e.target.value)}
                                        required
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-fern" /> Confirm
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-full px-6 py-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-fern focus:bg-white transition-all shadow-sm"
                                        value={formData.confirmPassword}
                                        onChange={e => handleInputChange('confirmPassword', e.target.value)}
                                        required
                                        placeholder="Repeat password"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Fingerprint size={14} className="text-fern" /> Account Role
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'patient', label: 'Individual', icon: User },
                                        { id: 'doctor', label: 'Practitioner', icon: Stethoscope },
                                        { id: 'researcher', label: 'Researcher', icon: Database },
                                    ].map((role) => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => handleInputChange('role', role.id as UserRole)}
                                            className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${formData.role === role.id
                                                ? 'border-fern bg-fern/5 text-fern shadow-sm'
                                                : 'border-slate-100 bg-slate-50 text-muted-foreground hover:border-slate-200'}`}
                                        >
                                            <role.icon size={20} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{role.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-[11px] font-bold p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                                    <ShieldAlert size={16} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${loading
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-foreground text-white hover:bg-indigo-600 hover:-translate-y-1"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" />
                                        <span>Replicating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create secure vault</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-8 text-center">
                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-8 group">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Primary Node Address</p>
                                <p className="text-lg font-bold text-foreground">{formData.email}</p>
                            </div>

                            {devOtp && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-8">
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Development Bypass</p>
                                    <span className="text-xl font-mono tracking-[0.4em] font-bold text-indigo-600">{devOtp}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Verification Code</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-8 text-5xl text-center text-foreground font-bold tracking-[0.5em] focus:outline-none focus:ring-1 focus:ring-fern focus:bg-white transition-all shadow-inner"
                                    value={otpCode}
                                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    required
                                    placeholder="000000"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${loading
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-foreground text-white hover:bg-indigo-600 hover:-translate-y-1"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" />
                                        <span>Verification in progress...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Authorize node</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            <div className="flex flex-col gap-4 items-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={loading || resendCooldown > 0}
                                    className="text-[11px] font-bold text-muted-foreground hover:text-fern transition-all flex items-center gap-2"
                                >
                                    <RotateCcw size={14} />
                                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Request new code'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('form')}
                                    className="text-[11px] font-bold text-muted-foreground hover:text-red-500 transition-all flex items-center gap-2"
                                >
                                    <ChevronLeft size={14} />
                                    Go back
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-10 text-center border-t border-border pt-8">
                        <p className="text-xs font-bold text-muted-foreground">
                            Already have a vault?{" "}
                            <Link href="/sign-in" className="text-fern hover:underline">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-10">
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
                        Universal Health Data Protection v2.4
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
