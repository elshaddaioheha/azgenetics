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
  Heart,
  ShieldCheck
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdvancedWalletPanel } from '@/components/dashboard/AdvancedWalletPanel';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts";

const earningData = [
  { month: "Jan", tokens: 120 },
  { month: "Feb", tokens: 210 },
  { month: "Mar", tokens: 180 },
  { month: "Apr", tokens: 320 },
  { month: "May", tokens: 290 },
  { month: "Jun", tokens: 450 },
];

const chartConfig = {
  tokens: {
    label: "Tokens Earned",
    color: "#A7C7AB",
  },
};


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
  const [isDeleting, setIsDeleting] = useState(false);
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
      if (userProfile.user_role === 'doctor') router.push('/en/dashboard/doctor');
      else if (userProfile.user_role === 'researcher') router.push('/en/dashboard/researcher');
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

  const handleDeleteData = async () => {
    if (!confirm('Are you absolutely sure? This will execute your Right to be Forgotten under GDPR regulations and securely wipe all off-chain data linked to your identity. This action cannot be reversed.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await api.delete('auth/delete-data');
      if (response.ok) {
        toast.success('Right to be Forgotten executed. All off-chain data has been securely wiped.');
        setTimeout(() => {
          handleLogout();
        }, 3000);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to wipe data');
      }
    } catch (err) {
      toast.error('Error executing Right to be Forgotten.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => { router.push('/en/sign-in'); };

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
            <span className="text-foreground">Sovereign Vault</span>
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
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-10"
          >
            {/* Welcome Area */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Member'}</h1>
                <p className="text-muted-foreground font-medium mb-4">Your health and genetic records are secured and up to date.</p>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 shadow-sm"><ShieldCheck size={12} /> GDPR Compliant</Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5 shadow-sm"><Lock size={12} /> AES-256 Encrypted</Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1.5 shadow-sm"><Fingerprint size={12} /> Hedera DLT</Badge>
                </div>
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

            {/* Stats Grid — always visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsList.map((stat, i) => (
                <motion.div key={i} variants={itemVariants}
                  className="bg-white rounded-[2rem] p-8 border border-border shadow-sm group hover:shadow-md transition-all cursor-default">
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

            {/* ── TAB PANELS ── */}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-border flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-med-blue/10 p-2 rounded-lg text-med-blue"><FileText size={20} /></div>
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
                              <DataItemRow key={item.id} item={item} mintingFileId={mintingFileId} onMintNFT={handleMintNFT} isPrivateDataUnlocked={isPrivateDataUnlocked} onUnlockPrivateData={() => setIsPrivateDataUnlocked(true)} />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <Card className="rounded-[2.5rem] border border-border shadow-sm">
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-xl font-bold tracking-tight">Token Yield</CardTitle>
                      <CardDescription>AZG tokens generated over the last 6 months from research utilization</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <AreaChart accessibilityLayer data={earningData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-tokens)" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="var(--color-tokens)" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area type="monotone" dataKey="tokens" stroke="var(--color-tokens)" fillOpacity={1} fill="url(#colorTokens)" />
                        </AreaChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-4 space-y-8">
                  <Card className="rounded-[2.5rem] border-border shadow-sm border">
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-xl font-bold tracking-tight">Security Profile</CardTitle>
                      <CardDescription className="text-sm font-medium">85% Secured (Multi-sig pending)</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <Progress value={85} className="h-2 bg-muted/50 w-full" />
                    </CardContent>
                  </Card>
                  <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 group">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><Fingerprint size={20} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Identity Vault</p>
                        <p className="text-sm font-bold text-foreground">{userProfile?.hedera_account_id ? 'Active & Synced' : 'Connecting…'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-muted-foreground uppercase tracking-tight">Security Health</span>
                        <span className="text-emerald-600">Stable</span>
                      </div>
                      <Progress value={80} className="h-1.5 bg-muted" />
                    </div>
                    <div className="mt-6"><AdvancedWalletPanel hederaAccountId={userProfile?.hedera_account_id} /></div>
                  </div>
                  <div className="bg-foreground text-white rounded-[2.5rem] p-8 relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><Shield size={64} /></div>
                    <h4 className="text-xl font-bold mb-3 tracking-tight">Data Sovereignty</h4>
                    <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed">Under GDPR guidelines, you maintain absolute control. You can exercise your right to be forgotten below by wiping all off-chain data from our private servers. This does not alter anonymous ledger proofs.</p>
                    <Button variant="destructive" onClick={handleDeleteData} disabled={isDeleting} className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                      {isDeleting ? 'Wiping Node...' : 'Wipe Off-Chain Data'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* DATA TAB — full genetic asset table */}
            {activeTab === 'data' && (
              <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                <div className="p-8 border-b border-border flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-med-blue/10 p-2 rounded-lg text-med-blue"><Dna size={20} /></div>
                    <h3 className="text-xl font-bold tracking-tight">All Genetic Assets</h3>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                    className="bg-foreground text-white px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow hover:opacity-90 transition-all disabled:opacity-50">
                    {isUploading ? <Spinner size="sm" /> : <UploadCloud size={14} />}
                    {isUploading ? 'Uploading…' : 'Upload file'}
                  </button>
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
                        <tr><td colSpan={4} className="p-8"><TableSkeleton rows={5} /></td></tr>
                      ) : userData.length === 0 ? (
                        <tr><td colSpan={4} className="p-16 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center"><Dna size={28} className="text-muted-foreground" /></div>
                            <p className="font-semibold text-muted-foreground mb-2">No files uploaded yet</p>
                            <button onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-fern hover:underline flex items-center gap-1"><UploadCloud size={14} /> Upload your first file</button>
                          </div>
                        </td></tr>
                      ) : (
                        userData.map(item => (
                          <DataItemRow key={item.id} item={item} mintingFileId={mintingFileId} onMintNFT={handleMintNFT} isPrivateDataUnlocked={isPrivateDataUnlocked} onUnlockPrivateData={() => setIsPrivateDataUnlocked(true)} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* INSIGHTS TAB */}
            {activeTab === 'insights' && (
              <motion.div variants={itemVariants} className="space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-med-green/10 p-2 rounded-lg text-med-green"><Activity size={20} /></div>
                    <h3 className="text-xl font-bold tracking-tight">Biological Insights</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { title: 'Lactose Sensitivity', level: 'High', color: 'text-orange-500', bg: 'bg-orange-50', progress: 80 },
                      { title: 'Muscle Profile', level: 'Power-type', color: 'text-fern', bg: 'bg-emerald-50', progress: 70 },
                      { title: 'Vitamin D Processing', level: 'Normal', color: 'text-blue-500', bg: 'bg-blue-50', progress: 55 },
                      { title: 'Caffeine Metabolism', level: 'Fast', color: 'text-purple-500', bg: 'bg-purple-50', progress: 90 },
                      { title: 'Omega-3 Absorption', level: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-50', progress: 60 },
                      { title: 'Stress Response', level: 'Low Resilience', color: 'text-red-500', bg: 'bg-red-50', progress: 35 },
                    ].map((insight, i) => (
                      <div key={i} className={`${insight.bg} rounded-2xl p-6 border border-border/30`}>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{insight.title}</p>
                        <p className={`text-lg font-bold mb-4 ${insight.color}`}>{insight.level}</p>
                        <Progress value={insight.progress} className="h-1.5 bg-white/60" />
                      </div>
                    ))}
                  </div>
                </div>
                <Card className="rounded-[2.5rem] border border-border shadow-sm">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-bold tracking-tight">Token Yield History</CardTitle>
                    <CardDescription>AZG tokens earned from research data usage</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                      <AreaChart accessibilityLayer data={earningData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTokens2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-tokens)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-tokens)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="tokens" stroke="var(--color-tokens)" fillOpacity={1} fill="url(#colorTokens2)" />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* FAMILY TAB */}
            {activeTab === 'family' && (
              <motion.div variants={itemVariants} className="space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Share2 size={20} /></div>
                    <h3 className="text-xl font-bold tracking-tight">Biological Network</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { initials: 'MC', name: 'Maria Cortez', relation: 'Mother', shared: 3, status: 'Active' },
                      { initials: 'SC', name: 'Samuel Cortez', relation: 'Brother', shared: 1, status: 'Pending' },
                    ].map((member, i) => (
                      <div key={i} className="bg-muted/30 rounded-2xl p-6 border border-border/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-fern text-white flex items-center justify-center font-bold text-sm shrink-0">{member.initials}</div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.relation} · {member.shared} records shared</p>
                        </div>
                        <Badge variant="outline" className={member.status === 'Active' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}>{member.status}</Badge>
                      </div>
                    ))}
                    <button className="border-2 border-dashed border-border rounded-2xl p-6 flex items-center justify-center gap-3 text-muted-foreground hover:border-fern hover:text-fern transition-all font-semibold text-sm">
                      <Plus size={18} /> Add family member
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-6 leading-relaxed">Shared records are read-only for family members. You can revoke access at any time.</p>
                </div>
              </motion.div>
            )}

            {/* NFT TAB */}
            {activeTab === 'nft' && (
              <motion.div variants={itemVariants} className="space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Award size={20} /></div>
                    <h3 className="text-xl font-bold tracking-tight">Proof Certificates</h3>
                  </div>
                  {userData.filter(i => i.nftCertified).length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4"><Award size={28} className="text-muted-foreground" /></div>
                      <p className="font-semibold text-muted-foreground mb-2">No certificates yet</p>
                      <p className="text-sm text-muted-foreground">Go to <button onClick={() => setActiveTab('data')} className="text-fern font-bold hover:underline">Genetic Assets</button> and certify a file to generate your first proof token.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userData.filter(i => i.nftCertified).map(item => (
                        <div key={item.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center"><Award size={18} className="text-white" /></div>
                            <Badge variant="outline" className="border-purple-200 text-purple-700 bg-white">Certified</Badge>
                          </div>
                          <p className="font-bold text-sm mb-1 truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <motion.div variants={itemVariants} className="space-y-8 max-w-2xl">
                <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-muted p-2 rounded-lg"><Settings size={20} /></div>
                    <h3 className="text-xl font-bold tracking-tight">Node Settings</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Display Name</label>
                      <input type="text" defaultValue={user?.user_metadata?.full_name || ''} readOnly className="w-full bg-muted/40 border border-border rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none cursor-not-allowed opacity-70" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                      <input type="email" defaultValue={user?.email || ''} readOnly className="w-full bg-muted/40 border border-border rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none cursor-not-allowed opacity-70" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account Role</label>
                      <input type="text" defaultValue={userProfile?.user_role || 'patient'} readOnly className="w-full bg-muted/40 border border-border rounded-2xl px-5 py-3 text-sm font-medium capitalize focus:outline-none cursor-not-allowed opacity-70" />
                    </div>
                  </div>
                </div>
                <div className="bg-foreground text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 p-6 opacity-10"><Shield size={64} /></div>
                  <h4 className="text-xl font-bold mb-3 tracking-tight">Data Sovereignty</h4>
                  <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed">
                    Under GDPR Article 17, you may request permanent erasure of all off-chain data linked to your identity. This action is irreversible.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteData} disabled={isDeleting} className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    {isDeleting ? 'Wiping Node...' : 'Exercise Right to be Forgotten'}
                  </Button>
                </div>
              </motion.div>
            )}

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
