import React from 'react';
import { ShieldCheck, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div className="glass-panel border-white/5 p-10 rounded-[30px] mb-12 relative overflow-hidden group bg-white/[0.02] shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-fern/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                <div className="flex items-center gap-8 text-center md:text-left">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-fern flex-shrink-0 animate-pulse shadow-inner group-hover:scale-105 transition-transform duration-500">
                        <ShieldCheck size={32} className="shadow-[0_0_15px_#A7C7AB]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic">
                            {isPrivateDataUnlocked ? 'Clinical Decryption Active / Terminal_Open' : 'Restricted Clinical Assets / Vault_Locked'}
                        </h3>
                        <p className="text-white/30 text-[10px] mt-2 max-w-lg leading-relaxed uppercase tracking-widest italic font-bold">
                            {isPrivateDataUnlocked
                                ? 'End-to-end quantum encryption is currently active for all patient records. Node session is traceable and audit-ready.'
                                : 'Zero-knowledge verification required via protocol-linked identity to decrypt restricted patient sequences and medical history.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {isWalletConnected && (
                        <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <span className="w-2 h-2 bg-fern rounded-full animate-pulse shadow-[0_0_10px_#A7C7AB]"></span>
                            <span className="text-[10px] text-fern font-black uppercase tracking-widest italic">Signal Locked</span>
                        </div>
                    )}

                    {!isPrivateDataUnlocked ? (
                        <Button
                            onClick={onUnlock}
                            className="bg-fern hover:bg-[#A7C7AB] text-obsidian px-10 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic transition-all shadow-[0_0_30px_rgba(167,199,171,0.2)]"
                        >
                            <Lock size={18} className="mr-3" />
                            Decrypt Node
                        </Button>
                    ) : (
                        <Button
                            onClick={onLock}
                            variant="destructive"
                            className="bg-white/5 border border-white/10 text-white/80 hover:bg-red-900/40 hover:text-white px-10 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic transition-all"
                        >
                            <LogOut size={18} className="mr-3" />
                            Terminate Session
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
