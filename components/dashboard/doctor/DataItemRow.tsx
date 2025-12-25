import React from 'react';
import { Icon } from '@iconify/react';
import Spinner from '@/components/ui/Spinner';
import { DataItem } from '@/types/dashboard';

interface DataItemRowProps {
    item: DataItem;
    mintingFileId: string | null;
    onMintNFT: (id: string) => void;
    isPrivateDataUnlocked: boolean;
    onUnlockPrivateData: () => void;
}

export const DataItemRow: React.FC<DataItemRowProps> = ({
    item,
    mintingFileId,
    onMintNFT,
    isPrivateDataUnlocked,
    onUnlockPrivateData,
}) => (
    <tr className="group hover:bg-slate-50 transition-colors border-b border-border">
        <td className="px-6 py-5 whitespace-nowrap">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-slate-400 group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition-all">
                    <Icon icon={item.type === 'genetic' ? 'lucide:dna' : item.type === 'health' ? 'lucide:activity' : 'lucide:file-text'} width="20" />
                </div>
                <div>
                    <div className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition-colors flex items-center gap-2 uppercase tracking-tight">
                        {item.name}
                        {item.isPrivate && (
                            <span className="bg-purple-500/10 text-purple-600 text-[10px] px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Icon icon="lucide:lock" width="10" />
                                Restricted
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1 font-bold">{item.accessCount} Audit Logs</div>
                </div>
            </div>
        </td>
        <td className="px-6 py-5 whitespace-nowrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.15em] bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                {item.type}
            </span>
        </td>
        <td className="px-6 py-5 whitespace-nowrap text-[11px] text-slate-500 font-mono tracking-wider uppercase font-bold">{item.date}</td>
        <td className="px-6 py-5 whitespace-nowrap text-[11px] text-slate-500 font-mono tracking-wider uppercase font-bold">{item.size}</td>
        <td className="px-6 py-5 whitespace-nowrap">
            {item.nftCertified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <Icon icon="lucide:award" width="12" />
                    Certified
                </span>
            ) : (
                <button
                    onClick={() => onMintNFT(item.id)}
                    disabled={mintingFileId === item.id}
                    className="text-emerald-600/70 hover:text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center gap-2 group-hover:translate-x-1"
                >
                    {mintingFileId === item.id ? <Spinner size="sm" /> : <Icon icon="lucide:plus-circle" width="14" />}
                    {mintingFileId === item.id ? 'Minting' : 'Mint Proof'}
                </button>
            )}
        </td>
        <td className="px-6 py-5 whitespace-nowrap text-right">
            {item.isPrivate && !isPrivateDataUnlocked ? (
                <button
                    onClick={onUnlockPrivateData}
                    className="text-purple-500 hover:text-purple-600 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 ml-auto"
                >
                    <Icon icon="lucide:key" width="14" />
                    Decrypt Node
                </button>
            ) : (
                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="h-8 px-4 rounded bg-white border border-border text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">
                        Initialize Share
                    </button>
                    <button className="h-8 px-4 rounded border border-border text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-foreground transition-all">
                        Audit
                    </button>
                </div>
            )}
        </td>
    </tr>
);
