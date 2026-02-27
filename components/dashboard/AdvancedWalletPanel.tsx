"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Copy, Check, Terminal, Fingerprint, Hash } from 'lucide-react';

interface AdvancedWalletPanelProps {
    hederaAccountId?: string;
    lastTxId?: string;
    network?: string;
}

export const AdvancedWalletPanel: React.FC<AdvancedWalletPanelProps> = ({
    hederaAccountId,
    lastTxId,
    network = 'testnet',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const explorerUrl = lastTxId
        ? `https://hashscan.io/${network}/transaction/${lastTxId}`
        : null;

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        });
    };

    return (
        <div className="border border-border rounded-[2rem] bg-white overflow-hidden shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-8 py-5 text-left hover:bg-slate-50/80 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                        <Terminal size={16} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Advanced Wallet</span>
                </div>
                {isOpen ? (
                    <ChevronUp size={16} className="text-muted-foreground" />
                ) : (
                    <ChevronDown size={16} className="text-muted-foreground" />
                )}
            </button>

            {isOpen && (
                <div className="px-8 pb-8 space-y-5 border-t border-border bg-slate-50/50">
                    <p className="text-[10px] text-muted-foreground font-semibold pt-5 leading-relaxed">
                        These are your raw on-chain credentials. They are provided for auditability and advanced integrations only. You do not need these for everyday use.
                    </p>

                    {hederaAccountId && (
                        <div className="bg-white border border-border rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Fingerprint size={14} />
                                    <p className="text-[9px] font-bold uppercase tracking-widest">Decentralized Identity (DID)</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(hederaAccountId, 'did')}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground transition-colors"
                                    title="Copy"
                                >
                                    {copiedField === 'did' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                </button>
                            </div>
                            <p className="text-xs font-bold font-mono text-foreground">{hederaAccountId}</p>
                        </div>
                    )}

                    {lastTxId && (
                        <div className="bg-white border border-border rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Hash size={14} />
                                    <p className="text-[9px] font-bold uppercase tracking-widest">Last Proof Signature</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(lastTxId, 'tx')}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground transition-colors"
                                    title="Copy"
                                >
                                    {copiedField === 'tx' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                </button>
                            </div>
                            <p className="text-[10px] font-bold font-mono text-foreground break-all">{lastTxId}</p>
                            {explorerUrl && (
                                <a
                                    href={explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold text-emerald-600 hover:underline"
                                >
                                    <ExternalLink size={12} />
                                    Verify on Hedera Ledger
                                </a>
                            )}
                        </div>
                    )}

                    {!hederaAccountId && !lastTxId && (
                        <div className="text-center py-6 text-muted-foreground">
                            <p className="text-xs font-semibold">No on-chain activity yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
