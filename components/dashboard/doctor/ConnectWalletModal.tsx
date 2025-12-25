import React from 'react';
import { Icon } from '@iconify/react';

interface ConnectWalletModalProps {
    onClose: () => void;
    isConnecting: boolean;
    setIsConnecting: (loading: boolean) => void;
    onConnect: () => Promise<void>;
    accountId: any | null;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
    onClose,
    isConnecting,
    setIsConnecting,
    onConnect,
    accountId,
}) => {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] px-4">
            <div className="glass-panel border-border p-8 max-w-md w-full relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

                <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                        {isConnecting ? (
                            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Icon icon="lucide:wallet" className="text-emerald-500" width="40" />
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2 uppercase tracking-tight">
                        {isConnecting ? 'Establishing Link...' : 'Synchronize Node'}
                    </h3>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        {isConnecting
                            ? 'Awaiting protocol approval from your Hedera wallet. Please verify the authentication request.'
                            : 'Initialize your biometric hash via Hedera wallet to access encrypted clinical assets and protocol-level data.'}
                    </p>

                    {accountId && (
                        <div className="mb-8 p-3 bg-slate-50 border border-border rounded-lg">
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1 font-bold">Node Identity</p>
                            <p className="text-xs text-emerald-600 font-mono tracking-wider">
                                {accountId.toString()}
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={onConnect}
                            disabled={isConnecting}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 ring-anim"
                        >
                            {isConnecting ? 'Awaiting Signal...' : 'Connect Protocol'}
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                setIsConnecting(false);
                            }}
                            disabled={isConnecting}
                            className="w-full border border-border text-slate-500 py-4 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-slate-50 transition-all text-sm"
                        >
                            Abort
                        </button>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-8 uppercase tracking-widest font-medium">
                        Protocol Security Layer v4.0.2 • Hedera Mainnet
                    </p>
                </div>
            </div>
        </div>
    );
};
