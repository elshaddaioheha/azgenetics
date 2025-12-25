"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

const SignIn: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter email and password");
            return;
        }

        setLoading(true);

        try {
            // Call API to sign in (handles Supabase Auth)
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.requiresVerification) {
                    setError('Please verify your email first. Check your inbox for the verification code.');
                    return;
                }
                throw new Error(data.error || 'Failed to sign in');
            }

            // Redirect based on role
            const role = data.user.role;
            const dashboardPath = role === 'patient' ? '/dashboard' : `/dashboard/${role}`;
            router.push(dashboardPath);

        } catch (err: any) {
            console.error('Sign-in error:', err);
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="fixed inset-0 z-0 bg-grid pointer-events-none opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="glass-panel px-8 py-10 w-full max-w-sm rounded-2xl relative z-10 border-border overflow-hidden group bg-white shadow-xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-4">
                        <Icon icon="lucide:dna" width={24} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Welcome Back</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 transition-colors pr-12 shadow-sm"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="name@domain.com"
                            />
                            <Icon icon="lucide:mail" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" width={14} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 transition-colors pr-12 shadow-sm"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="Enter your password"
                            />
                            <Icon icon="lucide:lock" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" width={14} />
                        </div>
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
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-border pt-6">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                        New to the protocol?{" "}
                        <Link href="/sign-up" className="text-emerald-600 hover:text-emerald-500 font-bold ml-1 transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
