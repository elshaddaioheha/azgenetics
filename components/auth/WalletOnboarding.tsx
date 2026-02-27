"use client";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { UserRole, SubscriptionTier } from "@/types/auth";

interface WalletOnboardingProps {
    walletAddress: string;
    onComplete: (role: UserRole, subscriptionTier: SubscriptionTier) => void;
    onCancel: () => void;
}

const WalletOnboarding: React.FC<WalletOnboardingProps> = ({
    walletAddress,
    onComplete,
    onCancel,
}) => {
    const [step, setStep] = useState<'role' | 'subscription'>('role');
    const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('F1');

    const roles = [
        {
            value: 'patient' as UserRole,
            label: 'Individual Patient',
            icon: 'lucide:user',
            description: 'Store and manage your personal genetic data',
        },
        {
            value: 'doctor' as UserRole,
            label: 'Medical Practitioner',
            icon: 'lucide:stethoscope',
            description: 'Access patient data and provide medical insights',
        },
        {
            value: 'researcher' as UserRole,
            label: 'Research Facility',
            icon: 'lucide:microscope',
            description: 'Analyze data and conduct research',
        },
    ];

    const tiers = [
        {
            tier: 'F1' as SubscriptionTier,
            name: 'Free Tier',
            price: 'Free',
            features: ['100MB Storage', 'Basic Features', 'Community Support'],
            color: 'slate',
        },
        {
            tier: 'F2' as SubscriptionTier,
            name: 'Pro Tier',
            price: '250 GENE/mo',
            features: ['5GB Storage', 'Advanced Analytics', 'Priority Support', 'API Access'],
            color: 'emerald',
            popular: true,
        },
        {
            tier: 'F3' as SubscriptionTier,
            name: 'Enterprise',
            price: 'Custom',
            features: ['Unlimited Storage', 'White Label', 'Dedicated Support', 'SLA'],
            color: 'purple',
        },
    ];

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setStep('subscription');
    };

    const handleComplete = () => {
        if (selectedRole) {
            onComplete(selectedRole, selectedTier);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Welcome to AZ-Genes Protocol</h2>
                            <p className="text-emerald-50 mt-1 text-sm">
                                {step === 'role' ? 'Choose your role' : 'Select your subscription tier'}
                            </p>
                            <p className="text-emerald-100 mt-2 text-xs font-mono">
                                Digital ID: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${step === 'role' ? 'bg-white' : 'bg-emerald-300'}`} />
                            <div className={`w-3 h-3 rounded-full ${step === 'subscription' ? 'bg-white' : 'bg-white/30'}`} />
                        </div>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {step === 'role' ? (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold text-foreground mb-2">What brings you here?</h3>
                                <p className="text-sm text-slate-500">Select your primary role to customize your experience</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {roles.map((role) => (
                                    <button
                                        key={role.value}
                                        onClick={() => handleRoleSelect(role.value)}
                                        className={`p-6 border-2 rounded-xl text-center transition-all duration-200 hover:scale-105 ${selectedRole === role.value
                                            ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mx-auto mb-4">
                                            <Icon icon={role.icon} width={32} />
                                        </div>
                                        <h3 className="font-bold text-foreground mb-2">{role.label}</h3>
                                        <p className="text-sm text-slate-500">{role.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold text-foreground mb-2">Choose Your Plan</h3>
                                <p className="text-sm text-slate-500">Select a subscription tier that fits your needs</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {tiers.map((tier) => (
                                    <div
                                        key={tier.tier}
                                        className={`relative p-6 border-2 rounded-2xl transition-all cursor-pointer ${selectedTier === tier.tier
                                            ? 'border-emerald-500 bg-emerald-50 shadow-lg transform scale-105'
                                            : 'border-slate-200 hover:border-emerald-300'
                                            } ${tier.popular ? 'ring-2 ring-emerald-500/30' : ''}`}
                                        onClick={() => setSelectedTier(tier.tier)}
                                    >
                                        {tier.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
                                                Popular
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-foreground mb-2">{tier.name}</h3>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-bold text-foreground font-mono">
                                                    {tier.price.split(' ')[0]}
                                                </span>
                                                {tier.price.includes('GENE') && (
                                                    <span className="text-sm text-slate-500">GENE/mo</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            {tier.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <Icon icon="lucide:check" className="text-emerald-500" width={16} />
                                                    <span className="text-sm text-slate-600">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                <Icon icon="lucide:info" className="text-blue-500 mt-0.5" width={20} />
                                <div className="flex-1">
                                    <p className="text-sm text-blue-900 font-medium mb-1">
                                        You can upgrade or downgrade anytime
                                    </p>
                                    <p className="text-xs text-blue-700">
                                        Start with Free tier and upgrade when you need more features
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-8 py-6 bg-slate-50 flex items-center justify-between">
                    <button
                        onClick={step === 'role' ? onCancel : () => setStep('role')}
                        className="px-6 py-3 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        {step === 'role' ? 'Cancel' : 'Back'}
                    </button>

                    {step === 'subscription' && (
                        <button
                            onClick={handleComplete}
                            className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                        >
                            Complete Setup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletOnboarding;
