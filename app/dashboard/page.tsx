'use client';

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dna,
  Shield,
  FileText,
  Share2,
  Settings,
  LogOut,
  User,
  Activity,
  Bell,
  Search,
  ChevronRight,
  Database,
  Lock,
  ArrowUpRight,
  Plus,
  ArrowRight,
  LayoutDashboard,
  Wallet,
  Award,
  ChevronLeft,
  UploadCloud,
  X,
  Zap,
  Globe,
  Fingerprint,
  Heart
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/apiClient';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TableSkeleton } from '@/components/ui/Skeleton';
import Spinner from '@/components/ui/Spinner';

// Imports from shared components/types
import { DataItem, UserProfile } from '@/types/dashboard';
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
    transition: { duration: 0.5, ease: "easeOut" as any }
  }
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPrivateDataUnlocked, setIsPrivateDataUnlocked] = useState(false);
  const [userData, setUserData] = useState<DataItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mintingFileId, setMintingFileId] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Data Functions
  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await api.get('files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const files = await response.json();
      const transformedFiles: DataItem[] = files.map((file: any) => ({
        id: file.id,
        name: file.file_name,
        type: file.file_type?.includes('vcf') ? 'genetic' : 'health',
        date: new Date(file.created_at).toLocaleDateString(),
        size: '100 MB',
        nftCertified: !!file.nft_token_id,
        isPrivate: !!file.encryption_key,
        encrypted: !!file.encryption_key,
      }));
      setUserData(transformedFiles);
    } catch (err) { console.error(err); } finally { setLoadingFiles(false); }
  };

  const loadProfile = async () => {
    try {
      const response = await api.get('get-profile');
      if (response.ok) setUserProfile(await response.json());
    } catch (err) { console.error(err); }
  };

  const loadTokenData = async () => {
    try {
      const response = await api.get('get-token-transactions');
      if (response.ok) {
        const transactions = await response.json();
        const balance = transactions.reduce((acc: number, tx: any) =>
          acc + (tx.type === 'received' || tx.type === 'earned' ? Number(tx.amount) : -Number(tx.amount)), 0);
        setTokenBalance(balance);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadFiles();
      loadProfile();
      loadTokenData();
    }
  }, [user, authLoading]);

  // Redirection Logic
  useEffect(() => {
    if (userProfile && !authLoading) {
      if (userProfile.user_role === 'doctor') router.push('/dashboard/doctor');
      else if (userProfile.user_role === 'researcher') router.push('/dashboard/researcher');
    }
  }, [userProfile, authLoading, router]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('upload-file', formData);
      if (response.ok) {
        toast.success('Sequence captured successfully');
        loadFiles();
      } else {
        toast.error('Upload failed');
      }
    } catch (err) { toast.error('Error connecting to encryption node'); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleMintNFT = async (fileId: string) => {
    setMintingFileId(fileId);
    try {
      const response = await api.post('mint-nft-certificate', { fileId });
      if (response.ok) { toast.success('Proof certificate minted'); loadFiles(); }
      else toast.error('Minting failed');
    } catch (err) { toast.error('Blockchain synchronization error'); }
    finally { setMintingFileId(null); }
  };

  const handleLogout = () => { router.push('/sign-in'); };

  const statsList = [
    { label: 'Storage Used', value: userData.length > 0 ? `${userData.length * 100} MB` : '0 MB', icon: Database, color: 'bg-med-blue' },
    { label: 'AZG Tokens', value: `${tokenBalance}`, icon: Wallet, color: 'bg-med-tan' },
    { label: 'Secure Files', value: userData.filter(i => i.isPrivate).length.toString(), icon: Lock, color: 'bg-med-green' },
    { label: 'NFT Proofs', value: userData.filter(i => i.nftCertified).length.toString(), icon: Award, color: 'bg-med-purple' },
  ];

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-background"><Spinner size="lg" /></div>;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden selection:bg-fern/10 selection:text-fern">
      <Head>
        <title>Sovereign Vault | AZ genes</title>
      </Head>

      <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" accept=".vcf,.csv,.txt,.pdf" />

      {/* Sidebar - Bright & Professional */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-border flex flex-col relative z-50 shadow-sm"
      >
        <div className="p-6 h-20 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-fern flex items-center justify-center text-white font-bold text-xs">
              AZ
            </div>
            {sidebarOpen && <span className="font-bold text-lg tracking-tight uppercase">genes</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground transition-all">
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Vault Console' },
            { id: 'data', icon: Dna, label: 'Genetic Assets' },
            { id: 'insights', icon: Activity, label: 'Health Insights' },
            { id: 'family', icon: Share2, label: 'Biological Network' },
            { id: 'nft', icon: Award, label: 'Proof Tokens' },
            { id: 'settings', icon: Settings, label: 'Node Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === item.id
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-fern' : ''} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all font-semibold text-sm">
            <LogOut size={20} />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#fdfdfd]">
        {/* Header - Bright */}
        <header className="h-20 bg-white border-b border-border px-4 md:px-8 flex items-center justify-between z-40 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span className="text-muted-foreground capitalize">{activeTab === 'overview' ? 'Sovereign Console' : activeTab}</span>
            <ChevronRight size={14} className="text-muted-foreground" />
            <span className="text-foreground">Node {userProfile?.hedera_account_id?.slice(-8) || '...'}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input type="text" placeholder="Search entries..." className="bg-muted border border-border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-fern w-64 transition-all" />
            </div>

            <button className="relative p-2 rounded-full border border-border text-muted-foreground hover:text-foreground transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none mb-1">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[10px] font-bold text-fern uppercase tracking-wider leading-none opacity-80">
                  {userProfile?.user_role || 'Patient'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-foreground border border-border shadow-sm hover:scale-105 transition-all cursor-pointer">
                {(user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-10"
          >
            {/* Welcome Area */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Member'}</h1>
                <p className="text-muted-foreground font-medium">Your health and genetic records are secured and up to date.</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-foreground text-white px-8 py-3 rounded-full text-sm font-bold flex items-center gap-3 shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isUploading ? <Spinner size="sm" /> : <UploadCloud size={18} />}
                {isUploading ? 'Uploading...' : 'Upload genetic data'}
              </button>
            </motion.div>

            {/* Stats Grid - Colored based on reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsList.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white rounded-[2rem] p-8 border border-border shadow-sm group hover:shadow-md transition-all cursor-default"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                      <stat.icon size={22} />
                    </div>
                    <ArrowUpRight className="text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Asset Table Column */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-med-blue/10 p-2 rounded-lg text-med-blue">
                        <FileText size={20} />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">Recent genetic assets</h3>
                    </div>
                    <button onClick={() => setActiveTab('data')} className="text-sm font-bold text-fern hover:underline">View all</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="px-8 py-4 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">File Name</th>
                          <th className="px-8 py-4 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Type</th>
                          <th className="px-8 py-4 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                          <th className="px-8 py-4 text-right text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Options</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {loadingFiles ? (
                          <tr><td colSpan={4} className="p-8"><TableSkeleton rows={3} /></td></tr>
                        ) : userData.length === 0 ? (
                          <tr><td colSpan={4} className="p-16 text-center text-muted-foreground font-medium">No sequences uploaded yet.</td></tr>
                        ) : (
                          userData.slice(0, 5).map(item => (
                            <DataItemRow
                              key={item.id}
                              item={item}
                              mintingFileId={mintingFileId}
                              onMintNFT={handleMintNFT}
                              isPrivateDataUnlocked={isPrivateDataUnlocked}
                              onUnlockPrivateData={() => setIsPrivateDataUnlocked(true)}
                            />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Health Insights Preview */}
                <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-med-green/10 p-2 rounded-lg text-med-green">
                        <Activity size={20} />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">Biological Insights</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Lactose Sensitivity', level: 'High', color: 'text-orange-500' },
                      { title: 'Muscle Profile', level: 'Power-type', color: 'text-fern' },
                    ].map((insight, i) => (
                      <div key={i} className="bg-muted/30 rounded-2xl p-6 border border-border/50">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{insight.title}</p>
                        <p className={`text-lg font-bold ${insight.color}`}>{insight.level}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Info Column */}
              <div className="lg:col-span-4 space-y-8">
                {/* Hedera Status */}
                <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 group">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-border group-hover:text-fern transition-colors">
                      <Fingerprint size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hedera Ledger Node</p>
                      <p className="text-sm font-bold truncate max-w-[120px]">{userProfile?.hedera_account_id || 'Connecting...'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-muted-foreground uppercase tracking-tight">Network Health</span>
                      <span className="text-med-green">Stable</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-med-green w-4/5" />
                    </div>
                  </div>
                </div>

                {/* Security Banner */}
                <div className="bg-foreground text-white rounded-[2.5rem] p-8 relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <Shield size={64} />
                  </div>
                  <h4 className="text-xl font-bold mb-3 tracking-tight">Security Lockdown</h4>
                  <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed">Ensure multi-sigs are enabled for sensitive sequence transfers.</p>
                  <button className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                    Configure security <ArrowRight size={16} />
                  </button>
                </div>

                {/* Family Card */}
                <div className="bg-med-tan text-white rounded-[2.5rem] p-8 shadow-md">
                  <h4 className="font-bold text-lg mb-4">Biological Network</h4>
                  <div className="flex -space-x-3 mb-6">
                    {[1, 2].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-med-tan bg-white/20 flex items-center justify-center font-bold text-xs">
                        {i === 1 ? 'MC' : 'SC'}
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-med-tan bg-white/10 flex items-center justify-center text-xs">
                      <Plus size={14} />
                    </div>
                  </div>
                  <button className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all">Manage Network</button>
                </div>
              </div>
            </div>
          </motion.div>
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

export default Dashboard;
