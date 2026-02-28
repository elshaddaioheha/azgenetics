'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Activity,
    Network,
    Layers,
    Coins,
    Star,
    Sliders,
    User,
    Search,
    Bell,
    TrendingUp,
    Repeat,
    Check,
    ArrowUpRight,
    Database,
    Cpu,
    ShieldCheck,
    Zap,
    Dna,
    Fingerprint,
    Globe,
    Lock,
    ChevronLeft,
    ChevronRight,
    SearchIcon
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/apiClient';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import { AdvancedWalletPanel } from '@/components/dashboard/AdvancedWalletPanel';

// Types
interface AnalyticsData {
    id: string;
    metric: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    color: string;
    bgClass: string;
}

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

const ResearcherDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [realAnalytics, setRealAnalytics] = useState<any>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const toast = useToast();

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/en/sign-in');
        }
    }, [authLoading, user, router]);

    // Load profile
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.get('get-profile');
                if (response.ok) {
                    const profile = await response.json();
                    setUserProfile(profile);
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
            }
        };
        if (user) loadProfile();
    }, [user]);

    // Load real-time analytics
    useEffect(() => {
        const loadAnalytics = async () => {
            setLoadingAnalytics(true);
            try {
                const response = await api.get('get-analytics');
                if (response.ok) {
                    const result = await response.json();
                    setRealAnalytics(result.data);
                }
            } catch (err) {
                console.error('Failed to load real analytics:', err);
            } finally {
                setLoadingAnalytics(false);
            }
        };
        if (user && activeTab === 'overview') loadAnalytics();
    }, [user, activeTab]);

    const analytics: AnalyticsData[] = [
        { id: '1', metric: 'Genomic Diversity Index', value: '0.84', trend: 'up', color: 'text-med-purple', bgClass: 'bg-med-purple' },
        { id: '2', metric: 'Real-time Genetic Records', value: realAnalytics?.total_records?.toLocaleString() || '---', trend: 'up', color: 'text-med-blue', bgClass: 'bg-med-blue' },
        { id: '3', metric: 'Extracted Markers', value: realAnalytics?.events?.[0]?.markers?.length?.toString() || '0', trend: 'up', color: 'text-med-green', bgClass: 'bg-med-green' },
        { id: '4', metric: 'Consensus Stability', value: '99.9%', trend: 'stable', color: 'text-med-tan', bgClass: 'bg-med-tan' },
    ];

    const menuItems = [
        { id: 'overview', name: 'Analysis Console', icon: Activity },
        { id: 'telemetry', name: 'Node Network', icon: Network },
        { id: 'datasets', name: 'Asset Clusters', icon: Layers },
        { id: 'tokens', name: 'Grant Allocation', icon: Coins },
        { id: 'tokenomics', name: 'Ethical Tokenomics', icon: TrendingUp },
        { id: 'subscriptions', name: 'Protocol Tiers', icon: Star },
        { id: 'settings', name: 'Node Config', icon: Sliders },
    ];

    if (authLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f8f9fb] text-foreground font-sans selection:bg-fern/10 overflow-hidden">
            <Head>
                <title>Researcher Console | AZ genes</title>
            </Head>

            {/* Sidebar - Clean & Professional */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 80 }}
                className="bg-white border-r border-border flex flex-col relative z-30 shadow-sm"
            >
                <div className="p-6 h-20 flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xs">
                            AZ
                        </div>
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xl font-bold tracking-tight uppercase"
                            >
                                Research
                            </motion.span>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 mt-4 text-sm font-semibold">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-violet-50 text-violet-600'
                                : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground'
                                }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-violet-600' : ''} />
                            {sidebarOpen && <span>{item.name}</span>}
                        </button>
                    ))}
                </nav>

                {/* Node Status */}
                {sidebarOpen && (
                    <div className="p-6 border-t border-border space-y-4">
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identity</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-med-green animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-med-green">ACTIVE</span>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-slate-500">
                                {userProfile?.hedera_account_id ? 'Verified & Synced' : 'Connecting to network...'}
                            </div>
                        </div>
                        <AdvancedWalletPanel hederaAccountId={userProfile?.hedera_account_id} />
                    </div>
                )}
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-border bg-white sticky top-0 z-20 shadow-sm">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                            <ShieldCheck size={14} className="text-violet-600" />
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Secure Research Cluster v2.4</span>
                        </div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight">
                            Researcher <span className="text-muted-foreground">Analysis Console</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden lg:flex flex-col items-end pr-8 border-r border-border">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network Throughput</span>
                            <span className="text-sm font-bold text-foreground">4.2 GB/s <span className="text-med-green text-[10px]">STABLE</span></span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-all">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="flex items-center gap-4 pl-6 border-l border-border">
                                <div className="text-right flex flex-col">
                                    <p className="text-sm font-bold leading-none mb-1">
                                        {userProfile?.name || 'Researcher'}
                                    </p>
                                    <p className="text-[10px] text-violet-600 font-bold uppercase tracking-wider">
                                        Level {userProfile?.subscription_tier || 'F1'} Scientist
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold shadow-sm hover:scale-105 transition-all cursor-pointer">
                                    {(userProfile?.name?.[0] || user?.email?.[0] || 'R').toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {activeTab === 'overview' && (
                                <div className="space-y-10">
                                    {/* Stats Grid - Using medical bento palette */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {analytics.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                variants={itemVariants}
                                                className={`rounded-[2rem] p-8 ${item.bgClass} text-white shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default relative overflow-hidden`}
                                            >
                                                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 transition-transform duration-500">
                                                    <ArrowUpRight size={32} />
                                                </div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-10 opacity-70">{item.metric}</p>
                                                <div className="flex items-end justify-between relative z-10">
                                                    <h3 className="text-4xl font-bold tracking-tight">{item.value}</h3>
                                                    <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                                        {item.trend === 'up' ? <TrendingUp size={14} /> : <Repeat size={14} />}
                                                        <span className="text-[10px] font-bold">{item.trend === 'up' ? '+12%' : 'Active'}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Charts and Data Visualizer */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-border shadow-sm flex flex-col">
                                            <div className="flex items-center justify-between mb-10">
                                                <div>
                                                    <h2 className="text-xl font-bold tracking-tight mb-1">Genomic Pattern Tracker</h2>
                                                    <p className="text-xs font-semibold text-muted-foreground">Aggregated mutation markers across global clusters</p>
                                                </div>
                                                <div className="flex items-center gap-2 bg-violet-50 text-violet-600 px-4 py-2 rounded-full border border-indigo-100">
                                                    <Zap size={14} className="fill-current" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Real-time mapping</span>
                                                </div>
                                            </div>

                                            <div className="h-[340px] w-full bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center relative group overflow-hidden">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.03)_0%,transparent_70%)]"></div>
                                                <div className="relative">
                                                    <Dna size={80} className="text-violet-600/10 animate-[spin_20s_linear_infinite] mb-6" />
                                                </div>
                                                {loadingAnalytics ? (
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] animate-pulse">Syncing with Mainnet Node...</p>
                                                ) : realAnalytics ? (
                                                    <div className="text-center px-10">
                                                        <p className="text-[10px] font-bold text-violet-600 uppercase tracking-[0.4em] mb-4">Latest Population Variants Detected</p>
                                                        <div className="flex flex-wrap justify-center gap-2">
                                                            {realAnalytics.events?.[0]?.markers?.slice(0, 10).map((m: string) => (
                                                                <span key={m} className="bg-violet-50 text-violet-600 px-3 py-1 rounded-lg text-[10px] font-mono border border-indigo-100 font-black">{m}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] animate-pulse">Initialising sharded telemetry...</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-6 mt-10">
                                                {[
                                                    { label: 'Dataset Size', val: '14.2K', sub: 'Sequences' },
                                                    { label: 'Consensus', val: '99.9%', sub: 'Verification' },
                                                    { label: 'Integrity', val: 'Verified', sub: 'Audit Passed' },
                                                ].map((d, i) => (
                                                    <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 group transition-all">
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{d.label}</p>
                                                        <p className="text-2xl font-bold tracking-tight text-foreground">{d.val}</p>
                                                        <p className="text-[10px] font-bold text-violet-600 mt-1 opacity-60 italic">{d.sub}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-10 border border-border shadow-sm flex flex-col relative overflow-hidden">
                                            <div className="flex items-center gap-3 mb-10 border-b border-border pb-6">
                                                <div className="p-2 bg-violet-50 rounded-lg text-violet-600"><Cpu size={20} /></div>
                                                <h2 className="text-lg font-bold tracking-tight">Mainnet Consensus Feed</h2>
                                            </div>

                                            <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                                    <div key={i} className="flex gap-4 group cursor-pointer items-start">
                                                        <div className="w-1 h-12 bg-violet-50 rounded-full flex-shrink-0 relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-full h-1/2 bg-violet-600 group-hover:h-full transition-all duration-700" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[11px] font-bold text-foreground group-hover:text-violet-600 transition-colors">Fragment Committed #742,91{i}</p>
                                                            <p className="text-[10px] text-muted-foreground font-medium leading-tight">Shard metadata replicated to decentralized storage.</p>
                                                            <p className="text-[9px] font-bold text-violet-600/50 mt-1">{i * 2} minutes ago</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button className="w-full py-4 mt-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 hover:text-foreground transition-all">
                                                Download Audit Trail
                                            </button>
                                        </motion.div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tokenomics' && (
                                <motion.div variants={itemVariants} className="space-y-10 py-6">
                                    <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
                                        <h2 className="text-4xl font-bold tracking-tight">Ethical Tokenomics</h2>
                                        <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                                            Transparent, direct compensation for genetic data contributors. No intermediaries, no exploited data.
                                        </p>
                                    </div>

                                    {/* Flow Diagram */}
                                    <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 mb-12">
                                        {[
                                            { icon: '🧬', label: 'Patient', sub: 'Uploads encrypted genetic data', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                                            { icon: '→', label: '', sub: '', color: 'bg-transparent border-transparent text-3xl text-muted-foreground hidden md:flex' },
                                            { icon: '🔗', label: 'Hedera NFT', sub: 'Immutable proof minted on DLT', color: 'bg-violet-50 border-violet-200 text-violet-800' },
                                            { icon: '→', label: '', sub: '', color: 'bg-transparent border-transparent text-3xl text-muted-foreground hidden md:flex' },
                                            { icon: '🔬', label: 'Researcher', sub: 'Pays AZG tokens for access', color: 'bg-blue-50 border-blue-200 text-blue-800' },
                                            { icon: '→', label: '', sub: '', color: 'bg-transparent border-transparent text-3xl text-muted-foreground hidden md:flex' },
                                            { icon: '💰', label: 'Patient Earns', sub: 'Direct micro-payment in AZG tokens', color: 'bg-amber-50 border-amber-200 text-amber-800' },
                                        ].map((step, i) => (
                                            <div key={i} className={`flex flex-col items-center justify-center text-center border rounded-[2rem] p-6 min-w-[160px] gap-3 ${step.color}`}>
                                                <span className="text-3xl">{step.icon}</span>
                                                {step.label && <p className="text-sm font-black tracking-tight">{step.label}</p>}
                                                {step.sub && <p className="text-[10px] font-semibold leading-tight opacity-80">{step.sub}</p>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {[
                                            { value: '14,202', label: 'Patients Compensated', sub: '100% direct payment, no intermediary', icon: '👤', color: 'border-emerald-100 bg-emerald-50' },
                                            { value: '4.2M', label: 'AZG Tokens Distributed', sub: 'Average 295 AZG per data contributor', icon: '🪙', color: 'border-amber-100 bg-amber-50' },
                                            { value: '€0.00', label: 'Platform Cut', sub: 'Protocol fee is 0%—data value stays with patients', icon: '⚖️', color: 'border-blue-100 bg-blue-50' },
                                        ].map((s, i) => (
                                            <div key={i} className={`rounded-[2.5rem] p-10 border ${s.color} flex flex-col gap-3`}>
                                                <span className="text-4xl">{s.icon}</span>
                                                <p className="text-4xl font-bold tracking-tight">{s.value}</p>
                                                <p className="text-sm font-bold text-foreground">{s.label}</p>
                                                <p className="text-xs font-semibold text-muted-foreground">{s.sub}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'subscriptions' && (
                                <motion.div variants={itemVariants} className="space-y-16 py-6">
                                    <div className="text-center max-w-2xl mx-auto space-y-4">
                                        <h2 className="text-4xl font-bold tracking-tight">Scale your research capacity</h2>
                                        <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                                            Higher tiers unlock multi-sharded network access and real-time biometric indexing clusters on the AZ Genes protocol.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {[
                                            { tier: 'F1', name: 'Open Access', price: 'Free', features: ['100MB Cloud Storage', 'Standard Analytics', 'Basic Node Access', 'Single Chain Sync'], color: 'slate-400' },
                                            { tier: 'F2', name: 'Pro Researcher', price: '250', features: ['5GB Storage Node', 'Advanced ML Indexing', 'Multi-Shard Support', 'Priority Compute', 'Direct Support'], color: 'indigo-600', popular: true },
                                            { tier: 'F3', name: 'Global Cluster', price: 'Custom', features: ['Unlimited Storage', 'Governance Access', 'Restricted API access', '24/7 Managed Nodes', 'Dedicated Scientist'], color: 'slate-900' },
                                        ].map((sub) => (
                                            <div key={sub.tier} className={`bg-white border rounded-[3rem] p-12 flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-xl ${sub.popular ? 'border-violet-600 ring-4 ring-indigo-50 shadow-lg' : 'border-border'}`}>
                                                {sub.popular && (
                                                    <div className="absolute top-0 right-0 py-1.5 px-10 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest transform rotate-45 translate-x-10 translate-y-4">
                                                        Recommended
                                                    </div>
                                                )}

                                                <div className="mb-10 text-center">
                                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${sub.popular ? 'text-violet-600' : 'text-muted-foreground'}`}>{sub.tier} Protocol</p>
                                                    <h3 className="text-2xl font-bold tracking-tight mb-8">{sub.name}</h3>
                                                    <div className="flex items-baseline justify-center gap-1.5 ">
                                                        <span className="text-5xl font-bold tracking-tighter">{sub.price}</span>
                                                        <span className="text-xs font-bold text-muted-foreground uppercase">{sub.price === 'Custom' ? '' : 'AZG / MO'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-5 mb-12">
                                                    {sub.features.map(f => (
                                                        <div key={f} className="flex items-center gap-4">
                                                            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-violet-600">
                                                                <Check size={12} />
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-600">{f}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button className={`w-full py-5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${sub.tier === (userProfile?.subscription_tier || 'F1')
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-foreground text-white hover:bg-violet-600 hover:scale-[1.02] shadow-md'}`}>
                                                    {sub.tier === (userProfile?.subscription_tier || 'F1') ? 'Currently Active' : 'Upgrade Node'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Locked States */}
                            {(activeTab === 'telemetry' || activeTab === 'datasets' || activeTab === 'tokens' || activeTab === 'settings') && (
                                <motion.div variants={itemVariants} className="flex items-center justify-center py-20">
                                    <div className="bg-white border border-border rounded-[3rem] p-20 text-center max-w-2xl shadow-sm relative overflow-hidden group">
                                        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-10 group-hover:text-violet-600 transition-colors">
                                            <Lock size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight mb-4">Node Authorization Required</h3>
                                        <p className="text-sm font-semibold text-muted-foreground max-w-md mx-auto mb-12 leading-relaxed">
                                            The requested research cluster is restricted to professional protocol tiers. Scale your subscription to deploy this module.
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('subscriptions')}
                                            className="px-12 py-4 rounded-full bg-foreground text-white text-xs font-bold uppercase tracking-widest hover:bg-violet-600 transition-all shadow-lg"
                                        >
                                            View access tiers
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cccccc; }
            `}</style>
        </div>
    );
};

export default ResearcherDashboard;
