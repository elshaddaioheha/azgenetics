"use client";
import React from 'react';
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';

export type TransactionStatus = 'preparing' | 'signing' | 'submitting' | 'confirmed' | 'failed';

interface TransactionStatusModalProps {
    isOpen: boolean;
    status: TransactionStatus;
    transactionId?: string;
    error?: string;
    network?: string;
    onClose: () => void;
}

export const TransactionStatusModal: React.FC<TransactionStatusModalProps> = ({
    isOpen,
    status,
    transactionId,
    error,
    network = 'testnet',
    onClose,
}) => {
    if (!isOpen) return null;

    const getStatusIcon = () => {
        switch (status) {
            case 'preparing':
            case 'signing':
            case 'submitting':
                return (
                    <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6">
                        <Loader2 size={36} className="text-slate-400 animate-spin" />
                    </div>
                );
            case 'confirmed':
                return (
                    <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={36} className="text-emerald-600" />
                    </div>
                );
            case 'failed':
                return (
                    <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
                        <XCircle size={36} className="text-red-500" />
                    </div>
                );
        }
    };

    // User-friendly, no Web3 jargon
    const getStatusText = () => {
        switch (status) {
            case 'preparing':
                return {
                    title: 'Generating Certificate',
                    description: 'We are preparing your proof of data integrity…',
                };
            case 'signing':
                return {
                    title: 'Securing Record',
                    description: 'Applying cryptographic signature to your data…',
                };
            case 'submitting':
                return {
                    title: 'Registering Certificate',
                    description: 'Your integrity certificate is being stored securely…',
                };
            case 'confirmed':
                return {
                    title: 'Certificate Issued',
                    description: 'Your data integrity is now certified and tamper-proof.',
                };
            case 'failed':
                return {
                    title: 'Certification Failed',
                    description: error || 'Something went wrong. Please try again.',
                };
        }
    };

    const statusInfo = getStatusText();
    const explorerUrl = transactionId ? `https://hashscan.io/${network}/transaction/${transactionId}` : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={status === 'confirmed' || status === 'failed' ? onClose : undefined}
            />

            <div className="bg-white w-full max-w-sm rounded-[2.5rem] relative z-10 p-10 border border-border shadow-2xl text-center">
                {getStatusIcon()}

                <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">
                    {statusInfo.title}
                </h3>
                <p className="text-sm font-medium text-muted-foreground mb-8 leading-relaxed">
                    {statusInfo.description}
                </p>

                {/* Friendly success state — no raw blockchain data */}
                {status === 'confirmed' && (
                    <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck size={20} className="text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black text-emerald-800 uppercase tracking-wider">Integrity Verified</p>
                            <p className="text-[10px] font-semibold text-emerald-700 leading-tight mt-1">
                                This record is permanently secured. It cannot be altered or deleted.
                            </p>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100">
                        <p className="text-[11px] text-red-700 font-semibold leading-relaxed">{error || 'Please try again or contact support.'}</p>
                    </div>
                )}

                {(status === 'confirmed' || status === 'failed') && (
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-foreground text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
                    >
                        {status === 'confirmed' ? 'Done' : 'Try Again'}
                    </button>
                )}

                {/* Loading dots */}
                {(status === 'preparing' || status === 'signing' || status === 'submitting') && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {[0, 0.2, 0.4].map((delay, i) => (
                            <div
                                key={i}
                                className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"
                                style={{ animationDelay: `${delay}s` }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
