"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fingerprint, ArrowRight, ShieldCheck, Key, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

const SignIn: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);


    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        console.log('[SignIn] Form submitted — email:', email);

        if (!email || !password) {
            setError("Please enter your identification parameters");
            return;
        }

        setLoading(true);

        try {
            console.log('[SignIn] Calling /api/auth/signin...');
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('[SignIn] API response status:', response.status, '| body:', JSON.stringify(data).substring(0, 200));

            if (!response.ok) {
                if (data.requiresVerification) {
                    setError('Account verification pending. Please check your secure email.');
                    return;
                }
                throw new Error(data.error || 'Authentication failed');
            }

            // Establish the Supabase session in the browser client.
            if (data.session) {
                console.log('[SignIn] Session received — setting browser session...');
                const supabase = getSupabaseBrowser();
                console.log('[SignIn] getSupabaseBrowser() returned:', supabase ? 'client' : 'NULL');
                if (supabase) {
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                    });
                    if (sessionError) {
                        console.error('[SignIn] setSession error:', sessionError.message);
                    } else {
                        console.log('[SignIn] Session set successfully');
                    }
                }
            } else {
                console.warn('[SignIn] No session in API response!');
            }

            // Use full navigation to avoid Turbopack hot-reload cancelling router.push
            const role = data.user?.role ?? 'patient';
            const dashboardPath = role === 'patient'
                ? '/en/dashboard'
                : `/en/dashboard/${role}`;
            console.log('[SignIn] Redirecting to:', dashboardPath);
            window.location.href = dashboardPath;

        } catch (err: any) {
            console.error('[SignIn] Error:', err);
            setError(err.message || 'Authentication error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfd] relative overflow-hidden font-sans selection:bg-fern/10 selection:text-fern">
            {/* Subtle background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-med-blue via-med-purple to-med-green opacity-40"></div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-12">
                    <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
                        <img
                            src="/logo.png"
                            alt="AZ Genes Logo"
                            className="h-10 w-auto object-contain transition-transform group-hover:scale-110"
                        />
                    </Link>
                    <h2 className="text-4xl font-bold text-foreground tracking-tight mb-2">Welcome back</h2>
                    <p className="text-sm font-semibold text-muted-foreground opacity-60">Sign in to manage your genetic heritage</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-border shadow-2xl relative overflow-hidden">
                    <form onSubmit={handleSignIn} className="space-y-8">
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                                <Mail size={14} className="text-fern" /> Email Address
                            </label>
                            <input
                                type="email"
                                className="w-full bg-slate-50 border border-slate-100 rounded-full px-6 py-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-fern focus:bg-white transition-all shadow-sm"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="name@email.com"
                            />
                        </div>

                        <div className="space-y-2 group">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Lock size={14} className="text-fern" /> Password
                                </label>
                                <Link href="#" className="text-[10px] font-bold text-muted-foreground hover:text-fern transition-colors">Forgot key?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-full px-6 py-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-fern focus:bg-white transition-all shadow-sm pr-12"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-fern transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>


                        {error && (
                            <div className="text-red-500 text-[11px] font-bold p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                                <ShieldCheck size={16} />
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
                                    <span>Verifying Credentials...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in to vault</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center border-t border-border pt-8">
                        <p className="text-xs font-bold text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/sign-up" className="text-fern hover:underline">
                                Create your heritage
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-10 space-y-4">
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
                        Sovereign Data Protection Protocol v2.4
                    </p>
                    <div className="flex justify-center items-center gap-6 flex-wrap">
                        <div className="flex items-center gap-2 text-muted-foreground opacity-60">
                            <Lock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground opacity-60">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">GDPR Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground opacity-60">
                            <Fingerprint size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Powered by Hedera</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
