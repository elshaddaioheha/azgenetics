"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    ShieldCheck,
    Key,
    Lock,
    Bell,
    Smartphone,
    Wallet,
    Check,
    AlertTriangle,
    Activity
} from 'lucide-react';
import { api } from '@/lib/apiClient';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';

interface AccountSettingsProps {
    userProfile: any;
    user: any;
    theme?: 'light' | 'dark'; // Dark for patient dashboard, light for doctor/researcher
    onProfileUpdate?: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
    userProfile,
    user,
    theme = 'dark',
    onProfileUpdate
}) => {
    const toast = useToast();
    const [name, setName] = useState(userProfile?.name || userProfile?.full_name || '');
    const [isSaving, setIsSaving] = useState(false);

    // Sync state if userProfile prop changes
    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || userProfile.full_name || '');
        }
    }, [userProfile]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await api.post('update-profile', { name });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update profile');
            }
            toast.success('Profile updated successfully');
            if (onProfileUpdate) onProfileUpdate();
        } catch (err: any) {
            toast.error(err.message || 'Error updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Styling logic for dual themes
    const isDark = theme === 'dark';

    const panelClass = isDark
        ? "bg-white/[0.02] border-white/10 hover:border-fern/30 shadow-2xl backdrop-blur-md"
        : "bg-white border-border shadow-sm hover:shadow-md";

    const textPrimary = isDark ? "text-white" : "text-foreground";
    const textSecondary = isDark ? "text-white/40" : "text-muted-foreground";
    const borderClass = isDark ? "border-white/10" : "border-border";
    const inputClass = isDark
        ? "bg-black/20 border-white/10 text-white focus:border-fern focus:ring-1 focus:ring-fern placeholder:text-white/20"
        : "bg-slate-50 border-input text-foreground focus:border-fern focus:ring-1 focus:ring-fern";

    return (
        <div className="space-y-12 max-w-5xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className={`text-4xl font-black ${textPrimary} tracking-tighter uppercase italic`}>
                        Node Configuration
                    </h2>
                    <p className={`text-[10px] text-fern font-black uppercase tracking-[0.5em] italic mt-3`}>
                        {userProfile?.user_role || 'User'} Profile Settings
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Profile Information */}
                <div className={`lg:col-span-2 rounded-[3rem] border ${panelClass} p-10 font-sans transition-all`}>
                    <div className={`flex items-center gap-4 border-b ${borderClass} pb-6 mb-8`}>
                        <div className={`p-3 rounded-2xl ${isDark ? 'bg-fern/10 text-fern' : 'bg-emerald-50 text-emerald-600'}`}>
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-bold ${textPrimary} tracking-tight`}>Identity Parameters</h3>
                            <p className={`text-xs font-semibold ${textSecondary}`}>Manage your public facing sequencer profile</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div className="space-y-2">
                            <label className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>
                                Full Name (Alias)
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={`w-full px-6 py-4 rounded-2xl border text-sm transition-all focus:outline-none ${inputClass}`}
                                placeholder="e.g. Satoshi Nakamoto"
                            />
                        </div>

                        <div className="space-y-2 relative opacity-70 cursor-not-allowed">
                            <label className={`text-[10px] font-black uppercase tracking-widest ${textSecondary} flex items-center justify-between`}>
                                <span>Network Email</span>
                                <span className="text-fern flex items-center gap-1.5"><ShieldCheck size={12} /> Verified</span>
                            </label>
                            <input
                                type="email"
                                value={user?.email || 'user@example.com'}
                                disabled
                                className={`w-full px-6 py-4 rounded-2xl border text-sm transition-all ${inputClass} opacity-60`}
                            />
                            <Lock size={14} className="absolute right-6 top-10 text-fern/50" />
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`w-full sm:w-auto px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${isDark
                                        ? 'bg-fern text-obsidian hover:bg-[#A7C7AB] disabled:bg-white/10 disabled:text-white/30'
                                        : 'bg-foreground text-white hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400'
                                    }`}
                            >
                                {isSaving ? <Spinner size="sm" /> : <Activity size={16} />}
                                {isSaving ? 'Syncing...' : 'Update Protocol Identity'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Sidebar */}
                <div className="space-y-10">

                    {/* Node Security */}
                    <div className={`rounded-[2.5rem] border ${panelClass} p-8 transition-all relative overflow-hidden`}>
                        {isDark && <div className="absolute top-0 right-0 p-8 text-white/[0.02] -z-10"><ShieldCheck size={120} /></div>}

                        <div className="flex items-center gap-3 mb-6">
                            <Key size={18} className={isDark ? "text-fern" : "text-emerald-600"} />
                            <h3 className={`text-lg font-bold ${textPrimary} tracking-tight`}>Security Vector</h3>
                        </div>

                        <div className="space-y-4">
                            <div className={`flex items-center justify-between p-4 rounded-2xl ${isDark ? 'bg-black/30 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
                                <div className="flex items-center gap-3">
                                    <Smartphone className={textSecondary} size={16} />
                                    <div>
                                        <p className={`text-xs font-bold ${textPrimary}`}>2FA Auth</p>
                                        <p className={`text-[10px] font-semibold ${textSecondary}`}>Authenticator App</p>
                                    </div>
                                </div>
                                <button className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-fern hover:text-white' : 'text-emerald-600 hover:text-emerald-800'} transition-colors`}>
                                    Enable
                                </button>
                            </div>

                            <div className={`flex items-center justify-between p-4 rounded-2xl ${isDark ? 'bg-black/30 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
                                <div className="flex items-center gap-3">
                                    <Key className={textSecondary} size={16} />
                                    <div>
                                        <p className={`text-xs font-bold ${textPrimary}`}>Passkey</p>
                                        <p className={`text-[10px] font-semibold ${textSecondary}`}>Biometric Auth</p>
                                    </div>
                                </div>
                                <button className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-fern hover:text-white' : 'text-emerald-600 hover:text-emerald-800'} transition-colors`}>
                                    Register
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cryptographic Wallet (Display only) */}
                    <div className={`rounded-[2.5rem] border ${panelClass} p-8 transition-all`}>
                        <div className="flex items-center gap-3 mb-6">
                            <Wallet size={18} className={isDark ? "text-fern" : "text-emerald-600"} />
                            <h3 className={`text-lg font-bold ${textPrimary} tracking-tight`}>Ledger Address</h3>
                        </div>

                        {userProfile?.hedera_account_id ? (
                            <div className="space-y-3">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Hedera Account ID</p>
                                <div className={`font-mono text-sm px-4 py-3 rounded-xl border ${isDark ? 'bg-black/40 border-fern/30 text-fern' : 'bg-emerald-50 border-emerald-100 text-emerald-700'} flex items-center justify-between`}>
                                    {userProfile.hedera_account_id}
                                    <Check size={14} className="opacity-50" />
                                </div>
                                <p className={`text-[9px] ${textSecondary} italic leading-relaxed`}>
                                    Bound to this identity. NFTs and grants will be deposited here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 text-center py-4">
                                <AlertTriangle size={24} className="mx-auto text-amber-500 opacity-80 mb-2" />
                                <h4 className={`text-sm font-bold ${textPrimary}`}>No Wallet Linked</h4>
                                <p className={`text-xs font-semibold ${textSecondary}`}>
                                    You need a Web3 wallet credential to receive protocol grants.
                                </p>
                                <button className={`w-full py-3 mt-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-dashed ${isDark ? 'border-fern/50 text-fern hover:bg-fern/10' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'} transition-all`}>
                                    Link Wallet
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
