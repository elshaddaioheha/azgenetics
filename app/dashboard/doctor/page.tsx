'use client';

import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dna,
  LayoutDashboard,
  Database,
  Coins,
  Share2,
  Award,
  BarChart3,
  Star,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  UploadCloud,
  Plus,
  Activity,
  Lock,
  ArrowUpRight,
  User,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Repeat,
  Check,
  LogOut,
  Heart,
  Fingerprint,
  Stethoscope
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/apiClient';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { DataItem, TokenTransaction, AccessRequest } from '@/types/dashboard';
import { TransactionStatusModal, TransactionStatus } from '@/components/TransactionStatusModal';
import { PrivateDataAccessPanel } from '@/components/dashboard/doctor/PrivateDataAccessPanel';
import { DataItemRow } from '@/components/dashboard/doctor/DataItemRow';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as any
    }
  }
};

const sidebarVariants = {
  open: { width: 280, opacity: 1 },
  closed: { width: 80, opacity: 1 }
};

const AZGenesDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPrivateDataUnlocked, setIsPrivateDataUnlocked] = useState(false);
  const [nftCertificates, setNftCertificates] = useState<any[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [mintingFileId, setMintingFileId] = useState<string | null>(null);
  const [userData, setUserData] = useState<DataItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('preparing');
  const [txError, setTxError] = useState<string>('');
  const [txId, setTxId] = useState<string>('');

  const toast = useToast();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [authLoading, user, router]);

  // Fetch profile and check role
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get('get-profile');
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          if (profile.user_role !== 'doctor') {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    if (user && !authLoading) {
      loadProfile();
    }
  }, [user, authLoading, router]);

  const privateData = userData.filter(item => item.isPrivate);

  const tokenTransactions: TokenTransaction[] = [
    { id: '1', type: 'earned', amount: 50, description: 'Clinical data upload', date: '2024-01-15', fromTo: 'Network' },
    { id: '2', type: 'spent', amount: 10, description: 'Dataset access fee', date: '2024-01-12', fromTo: 'Research Hub' },
    { id: '3', type: 'received', amount: 25, description: 'Peer review reward', date: '2024-01-10', fromTo: 'Protocol' },
  ];

  const stats = {
    totalData: '2.35 GB',
    nftCertified: 3,
    totalTokens: 160,
    activeShares: 2,
    dataRequests: 3,
    privateFiles: privateData.length,
    encryptedFiles: userData.filter(item => item.encrypted).length,
  };

  const handleUnlockPrivateData = async () => {
    setIsPrivateDataUnlocked(true);
  };

  const handleLockPrivateData = () => {
    setIsPrivateDataUnlocked(false);
  };

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await api.get('files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const files = await response.json();

      const transformedFiles: DataItem[] = files.map((file: any) => ({
        id: file.id,
        name: file.file_name,
        type: file.file_type === 'chemical/x-vcf' ? 'genetic' :
          file.file_type === 'text/csv' ? 'health' :
            file.file_type === 'application/pdf' ? 'professional' :
              'health',
        date: new Date(file.created_at).toLocaleDateString(),
        size: '100 MB',
        accessCount: 0,
        nftCertified: !!file.nft_token_id,
        isPrivate: !!file.encryption_key,
        encrypted: !!file.encryption_key,
      }));

      setUserData(transformedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('upload-file', formData);
      if (!response.ok) {
        const error = await response.json();
        toast.error(`Upload failed: ${error.error}`);
        return;
      }
      await loadFiles();
      toast.success('Clinical asset uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Connection error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleMintNFT = async (fileId: string) => {
    setMintingFileId(fileId);
    setTxModalOpen(true);
    setTxStatus('preparing');
    setTxError('');
    setTxId('');
    try {
      setTxStatus('signing');
      const response = await api.post('mint-nft-certificate', { fileId });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Minting failed');
      }
      const result = await response.json();
      setTxStatus('confirmed');
      setTxId(result.nft?.hedera_transaction_id || '');
      await loadFiles();
    } catch (error) {
      console.error('Error minting NFT:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mint certification';
      setTxStatus('failed');
      setTxError(errorMessage);
    } finally {
      setMintingFileId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { id: 'overview', name: 'Clinical Console', icon: Stethoscope },
    { id: 'data', name: 'Patient Assets', icon: Database },
    { id: 'tokens', name: 'Fiscal Ledger', icon: Coins },
    { id: 'sharing', name: 'Protocol Share', icon: Share2 },
    { id: 'nft', name: 'Proof Certificates', icon: Award },
    { id: 'analytics', name: 'Sequence Forge', icon: BarChart3 },
    { id: 'subscriptions', name: 'Protocol Tier', icon: Star },
    { id: 'settings', name: 'Node Config', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#fdfdfd] text-foreground font-sans selection:bg-fern/10 overflow-hidden">
      <Head>
        <title>Doctor Console | AZ genes</title>
      </Head>

      <TransactionStatusModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        status={txStatus}
        error={txError}
        transactionId={txId}
      />

      {/* Sidebar - Bright & Professional */}
      <motion.aside
        initial={false}
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="bg-white border-r border-border flex flex-col relative z-30 shadow-sm"
      >
        <div className="p-6 h-20 mb-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
              AZ
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold tracking-tight uppercase"
              >
                genes
              </motion.span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar text-sm font-semibold">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground'
                }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-indigo-600' : ''} />
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Node Status */}
        {sidebarOpen && userProfile?.hedera_account_id && (
          <div className="p-6 border-t border-border">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl group hover:border-fern transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Node Status</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-med-green animate-pulse"></div>
                </div>
                <span className="text-[10px] font-bold text-med-green">ONLINE</span>
              </div>
              <div className="text-[10px] font-bold text-slate-500 truncate">
                {userProfile.hedera_account_id}
              </div>
            </div>
          </div>
        )}
      </motion.aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header - Bright */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-border bg-white sticky top-0 z-20 shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
              <ShieldCheck size={14} className="text-indigo-600" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Protocol Lead Cluster v2.4</span>
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {activeTab === 'overview' ? 'Clinical Overview' : activeTab.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden xl:flex flex-col items-end gap-1 pr-8 border-r border-border">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Consensus Health</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '82%' }}
                    className="h-full bg-med-green"
                  ></motion.div>
                </div>
                <span className="text-[10px] text-med-green font-bold">82%</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="flex items-center gap-4 pl-6 border-l border-border">
                <div className="text-right">
                  <p className="text-sm font-bold leading-none mb-1">{user?.user_metadata?.full_name || 'Medical Lead'}</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Protocol Specialist</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm hover:scale-105 transition-all cursor-pointer">
                  {(user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'D').toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#f8f9fb]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-7xl mx-auto space-y-10"
            >
              {activeTab === 'overview' && (
                <div className="space-y-10">
                  {/* Stats Grid - Bento Medical Palette */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Patient Assets', value: userData.length.toString(), icon: Database, color: 'bg-med-blue' },
                      { label: 'Fiscal Layer', value: stats.totalTokens.toString(), icon: Coins, color: 'bg-med-tan' },
                      { label: 'Secure Vault', value: stats.privateFiles.toString(), icon: Lock, color: 'bg-med-green' },
                      { label: 'Verified Proofs', value: stats.nftCertified.toString(), icon: Award, color: 'bg-med-purple' },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        variants={itemVariants}
                        className="bg-white border border-border p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between mb-8">
                          <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                            <stat.icon size={22} />
                          </div>
                          <ArrowUpRight className="text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-8">
                      {/* Asset Table Preview */}
                      <div className="bg-white border border-border rounded-[2.5rem] shadow-sm overflow-hidden flex-1">
                        <div className="p-8 border-b border-border flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Activity size={20} /></div>
                            <h3 className="text-xl font-bold tracking-tight">Active Clinical Assets</h3>
                          </div>
                          <button onClick={() => setActiveTab('data')} className="text-sm font-bold text-indigo-600 hover:underline">Full Analytics</button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <tbody className="divide-y divide-border">
                              {userData.slice(0, 5).map(item => (
                                <DataItemRow
                                  key={item.id}
                                  item={item}
                                  mintingFileId={mintingFileId}
                                  onMintNFT={handleMintNFT}
                                  isPrivateDataUnlocked={isPrivateDataUnlocked}
                                  onUnlockPrivateData={handleUnlockPrivateData}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
                      {/* Quick Actions */}
                      <div className="bg-foreground text-white rounded-[2.5rem] p-8 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                          <ShieldCheck size={70} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 tracking-tight">Clinical Capture</h3>
                        <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed italic">Upload patient sequences to initiate decentralized consensus replication.</p>
                        <button onClick={handleUploadClick} className="w-full h-14 rounded-2xl bg-white text-foreground text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all">
                          <UploadCloud size={18} />
                          Ingest New Signal
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".vcf,.csv,.txt,.pdf"
                        />
                      </div>

                      {/* Network Pulse */}
                      <div className="bg-white border border-border rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-8">Mainnet Activity</h3>
                        <div className="space-y-6">
                          {[1, 2].map(i => (
                            <div key={i} className="flex gap-4 group cursor-pointer items-start">
                              <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 group-hover:text-med-green transition-colors">
                                <Repeat size={16} />
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-foreground group-hover:text-med-green transition-colors">Fragment Verification Complete</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Node 0.0.{i}42 • {i * 2}h ago</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <motion.div variants={itemVariants} className="bg-white border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                  <div className="p-10 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Clinical Asset Ledger</h2>
                      <p className="text-sm font-semibold text-muted-foreground mt-1">Manage and certify patient sequences across the global node network.</p>
                    </div>
                    <button
                      onClick={handleUploadClick}
                      disabled={isUploading}
                      className="h-14 px-8 rounded-full bg-foreground text-white text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-md disabled:opacity-50"
                    >
                      {isUploading ? <Spinner size="sm" /> : <Plus size={20} />}
                      {isUploading ? 'Replicating...' : 'Ingest Asset'}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-border">
                          <th className="px-10 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Asset Name</th>
                          <th className="px-10 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Classification</th>
                          <th className="px-10 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Replication Date</th>
                          <th className="px-10 py-5 text-right text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Protocol</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {loadingFiles ? (
                          <tr><td colSpan={4} className="p-10 text-center"><Spinner size="md" /></td></tr>
                        ) : userData.length === 0 ? (
                          <tr><td colSpan={4} className="p-20 text-center text-muted-foreground font-semibold">Node storage empty. Awaiting first ingest.</td></tr>
                        ) : (
                          userData.map((item) => (
                            <DataItemRow
                              key={item.id}
                              item={item}
                              mintingFileId={mintingFileId}
                              onMintNFT={handleMintNFT}
                              isPrivateDataUnlocked={isPrivateDataUnlocked}
                              onUnlockPrivateData={handleUnlockPrivateData}
                            />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Other tabs follow similar pattern... */}
              {['tokens', 'sharing', 'nft', 'analytics', 'subscriptions', 'settings'].includes(activeTab) && (
                <motion.div variants={itemVariants} className="flex items-center justify-center py-20">
                  <div className="bg-white border border-border rounded-[3rem] p-20 text-center max-w-2xl shadow-sm group">
                    <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-10 group-hover:text-indigo-600 transition-colors">
                      <Lock size={40} />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight mb-4 capitalize">{activeTab} module restricted</h3>
                    <p className="text-sm font-semibold text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed">
                      Access to this clinical sub-module requires elevated protocol clearance.
                    </p>
                    <button className="px-10 py-4 rounded-full bg-foreground text-white text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">
                      Verify credentials
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cccccc; }
      `}</style>
    </div>
  );
};

export default AZGenesDashboard;