import React from 'react';
import { Icon } from '@iconify/react';

interface PrivateDataAccessPanelProps {
    isPrivateDataUnlocked: boolean;
    isWalletConnected: boolean;
    onUnlock: () => void;
    onLock: () => void;
}

export const PrivateDataAccessPanel: React.FC<PrivateDataAccessPanelProps> = ({
    isPrivateDataUnlocked,
    isWalletConnected,
    onUnlock,
    onLock,
}) => {
    return (
        <div className="glass-panel border-border p-6 rounded-2xl mb-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6 text-center md:text-left">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 flex-shrink-0 animate-pulse">
                        <Icon icon="lucide:shield-check" width="28" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">
                            {isPrivateDataUnlocked ? 'Clinical Decryption Active' : 'Restricted Clinical Assets'}
                        </h3>
                        <p className="text-slate-500 text-xs mt-1 max-w-md leading-relaxed">
                            {isPrivateDataUnlocked
                                ? 'End-to-end encryption is currently active for all patient records. Node session is traceable.'
                                : 'Zero-knowledge proof required via Hedera wallet to decrypt restricted patient sequences and medical history.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isWalletConnected && (
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Signal Locked</span>
                        </div>
                    )}

                    {!isPrivateDataUnlocked ? (
                        <button
                            onClick={onUnlock}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3 ring-anim"
                        >
                            <Icon icon="lucide:lock" width="18" />
                            <span>Decrypt Node</span>
                        </button>
                    ) : (
                        <button
                            onClick={onLock}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3"
                        >
                            <Icon icon="lucide:log-out" width="18" />
                            <span>Terminate Session</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
