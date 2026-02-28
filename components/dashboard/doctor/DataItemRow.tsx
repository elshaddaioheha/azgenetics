import React from 'react';
import {
    Dna,
    Activity,
    FileText,
    Lock,
    Key,
    Database,
    Eye,
    Share2,
    RefreshCw,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { DataItem } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
}) => {
    const IconComponent = item.type === 'genetic' ? Dna : item.type === 'health' ? Activity : FileText;

    return (
        <tr className="group hover:bg-white/[0.03] transition-all duration-500 border-b border-white/5">
            <td className="px-8 py-6 whitespace-nowrap">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-fern group-hover:text-obsidian group-hover:border-fern group-hover:scale-110 transition-all shadow-inner">
                        <IconComponent size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-black text-white group-hover:text-fern transition-colors flex items-center gap-4 uppercase tracking-tight italic">
                            {item.name}
                            {item.isPrivate && (
                                <Badge variant="outline" className="bg-white/5 text-white/40 text-[9px] px-3 py-1 rounded-full border border-white/10 font-black uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                    <Lock size={10} />
                                    Restricted
                                </Badge>
                            )}
                        </div>
                        <div className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-black mt-2 italic font-mono">{item.accessCount || 0} Telemetry Logs Syncing</div>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6 whitespace-nowrap">
                <Badge className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] bg-fern/10 text-fern hover:bg-fern/20 border border-fern/20 italic">
                    {item.type}
                </Badge>
            </td>
            <td className="px-8 py-6 whitespace-nowrap text-[10px] text-white/40 font-black tracking-[0.2em] uppercase italic font-mono">{item.date}</td>
            <td className="px-8 py-6 whitespace-nowrap text-[10px] text-white/40 font-black tracking-[0.2em] uppercase italic font-mono">{item.size}</td>
            <td className="px-8 py-6 whitespace-nowrap">
                {item.nftCertified ? (
                    <div className="flex items-center gap-3 text-emerald-600">
                        <CheckCircle2 size={18} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Certified</span>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        onClick={() => onMintNFT(item.id)}
                        disabled={mintingFileId === item.id}
                        className="text-white/20 hover:text-fern text-[9px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-30 flex items-center gap-3 group/mint"
                        title="Issue a tamper-proof integrity certificate for this file"
                    >
                        {mintingFileId === item.id ? <Spinner size="sm" /> : <RefreshCw size={16} className="group-hover/mint:rotate-180 transition-transform duration-700" />}
                        {mintingFileId === item.id ? 'Certifying…' : 'Certify'}
                    </Button>
                )}
            </td>
            <td className="px-8 py-6 whitespace-nowrap text-right">
                {item.isPrivate && !isPrivateDataUnlocked ? (
                    <Button
                        variant="secondary"
                        onClick={onUnlockPrivateData}
                        className="bg-white/5 border border-white/10 px-6 py-6 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] ml-auto hover:bg-fern hover:text-obsidian hover:border-fern transition-all shadow-xl"
                    >
                        <Key size={14} className="mr-3" />
                        Decrypt_Node
                    </Button>
                ) : (
                    <div className="flex items-center justify-end gap-5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {item.hedera_transaction_id && (
                            <a
                                href={`https://hashscan.io/testnet/transaction/${item.hedera_transaction_id.replace('@', '-')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-fern hover:border-fern transition-all hover:scale-110 shadow-inner"
                                title="Verify Integrity on Hedera Explorer"
                            >
                                <ShieldCheck size={18} />
                            </a>
                        )}
                        <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-fern hover:border-fern transition-all hover:scale-110 shadow-inner" title="Share">
                            <Share2 size={18} />
                        </button>
                        <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-white hover:border-white transition-all hover:scale-110 shadow-inner" title="View">
                            <Eye size={18} />
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
};
