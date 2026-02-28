"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/app/api/_context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/apiClient';
import toast from 'react-hot-toast';
import {
  Dna,
  Activity,
  Users,
  LayoutDashboard,
  Settings,
  Award,
  ChevronRight,
  Plus,
  Share2,
  Activity as HeartAction,
  LogOut,
  UploadCloud,
  ClipboardList,
  Star,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface GeneticData {
  id: string;
  name: string;
  type: 'genetic' | 'health' | 'report';
  date: string;
  size: string;
  nftCertified: boolean;
  sharedWith: number;
  hash: string;
  hedera_transaction_id: string;
}

interface HealthInsight {
  id: string;
  title: string;
  description: string;
  category: 'NUTRITION' | 'FITNESS' | 'HEALTH' | 'GENETIC';
  date: string;
  priority: 'high' | 'medium' | 'low';
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dataShared: number;
  lastActive: string;
}

const IndividualDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<GeneticData[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/en/sign-in');
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
          if (profile.user_role !== 'patient') {
            router.push('/en/dashboard');
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

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await api.get('files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const files = await response.json();

      const transformedFiles: GeneticData[] = files.map((file: any) => ({
        id: file.id,
        name: file.file_name,
        type: file.file_type === 'chemical/x-vcf' ? 'genetic' :
          file.file_type === 'text/csv' ? 'health' :
            file.file_type === 'application/pdf' ? 'report' :
              'health',
        date: new Date(file.created_at).toLocaleDateString(),
        size: '100 MB', // mock size for now
        nftCertified: !!file.nft_token_id,
        sharedWith: 0, // Mock for now
        hash: file.hash,
        hedera_transaction_id: file.hedera_transaction_id
      }));

      setUserData(transformedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadFiles();
    }
  }, [user, authLoading]);

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
      toast.success('Genetic asset uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Connection error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const healthInsights: HealthInsight[] = [
    { id: '1', title: 'LACTOSE_METABOLISM_DRIFT', description: 'Higher probability of lactose intolerance observed in markers.', category: 'NUTRITION', date: '2024-01-16', priority: 'high' },
    { id: '2', title: 'OPTIMAL_EXERTION_PROFILE', description: 'Genetic profile suggesting superior response to endurance training.', category: 'FITNESS', date: '2024-01-15', priority: 'medium' },
    { id: '3', title: 'VITAMIN_D_SYNTHESIS_CAP', description: 'Monitor levels due to sequence variations observed.', category: 'HEALTH', date: '2024-01-14', priority: 'medium' },
    { id: '4', title: 'CAFFEINE_CLEARANCE_SPEED', description: 'Normal metabolism signal based on CYP1A2 gene cluster.', category: 'GENETIC', date: '2024-01-13', priority: 'low' },
  ];

  const familyMembers: FamilyMember[] = [
    { id: '1', name: 'SARAH CHEN', relationship: 'MOTHER', dataShared: 3, lastActive: '2 DAYS AGO' },
    { id: '2', name: 'MICHAEL CHEN', relationship: 'BROTHER', dataShared: 2, lastActive: '1 WEEK AGO' },
    { id: '3', name: 'LISA CHEN', relationship: 'SISTER', dataShared: 1, lastActive: '3 DAYS AGO' },
  ];

  const quickStats = {
    totalData: '124 MB',
    nftCertified: 4,
    healthInsights: 12,
    familyConnected: 3,
    dataShares: 4,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="text-center group">
          <div className="w-24 h-24 rounded-[2rem] bg-fern/5 border border-fern/20 flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Dna size={48} className="text-fern" />
          </div>
          <p className="text-[10px] text-fern font-black uppercase tracking-[0.5em] italic">SYNCHRONIZING_NODE</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-obsidian text-white selection:bg-fern/20 selection:text-white relative overflow-hidden flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 320 : 100 }}
        className="h-screen sticky top-0 bg-[#0c0c0c] border-r border-white/5 flex flex-col z-50 overflow-hidden"
      >
        <div className="p-8 flex items-center gap-4 mb-20">
          <div className="w-12 h-12 rounded-2xl bg-fern flex items-center justify-center shadow-[0_0_30px_rgba(167,199,171,0.4)]">
            <Dna size={24} className="text-obsidian" />
          </div>
          {sidebarOpen && (
            <span className="text-2xl font-black tracking-tighter uppercase italic">genes</span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-3">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Vault Console' },
            { id: 'data', icon: Dna, label: 'Genetic Assets' },
            { id: 'insights', icon: HeartAction, label: 'Health Insights' },
            { id: 'family', icon: Users, label: 'Biological Network' },
            { id: 'nft', icon: Award, label: 'Proof Tokens' },
            { id: 'settings', icon: Settings, label: 'Node Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-5 rounded-2xl transition-all group ${activeTab === item.id
                ? 'bg-fern text-obsidian shadow-[0_0_30px_rgba(167,199,171,0.2)]'
                : 'text-white/30 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
              {sidebarOpen && (
                <span className="ml-5 text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
          <button
            onClick={() => supabase?.auth.signOut().then(() => router.push('/'))}
            className="w-full flex items-center gap-5 px-6 py-5 rounded-3xl text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-all group"
          >
            <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
            {sidebarOpen && <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Deauthorize</span>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 min-h-screen relative">
        {/* Background grid */}
        <div className="absolute inset-0 z-0 bg-grid opacity-[0.03] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-fern/5 blur-full rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none"></div>

        {/* Top Header */}
        <header className="relative z-10 px-12 py-10 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-12">
            <div>
              <p className="text-[10px] font-black text-fern uppercase tracking-[0.5em] mb-2 italic">NODE_INITIALIZED</p>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic">INDIVIDUAL_VAULT <span className="text-white/20 font-light mx-4">•</span> <span className="text-white/40">{userProfile?.full_name?.toUpperCase() || 'ALEX-IDENTITY'}</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.txt,.csv,.vcf,chemical/x-vcf,text/csv,text/plain,application/pdf"
            />
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="bg-fern text-obsidian px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] italic flex items-center gap-4 hover:bg-[#A7C7AB] transition-all shadow-[0_0_40px_rgba(167,199,171,0.2)] disabled:opacity-50"
            >
              {isUploading ? <Spinner size="sm" /> : <UploadCloud size={20} />}
              {isUploading ? 'UPLOADING...' : 'UPLOAD_SEQUENCE'}
            </button>
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-fern hover:border-fern/30 transition-all cursor-pointer group shadow-inner">
              <Settings size={22} className="group-hover:rotate-90 transition-transform duration-700" />
            </div>
          </div>
        </header>

        <div className="relative z-10 p-12 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="show"
              variants={{
                show: { transition: { staggerChildren: 0.1 } }
              }}
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-16">
                  {/* Hero Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                      { label: 'GENETIC_CLUSTERS', value: userData.length, icon: Dna },
                      { label: 'HECTARES_MAPPED', value: quickStats.totalData, icon: Share2 },
                      { label: 'CERTIFIED_PROOFS', value: quickStats.nftCertified, icon: Award },
                      { label: 'BIOLOGICAL_SIGNALS', value: quickStats.healthInsights, icon: HeartAction },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        variants={itemVariants}
                        className="glass-panel rounded-[3rem] p-10 group hover:border-fern/30 transition-all duration-700 relative overflow-hidden bg-white/[0.01]"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fern/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <stat.icon className="text-fern/10 group-hover:text-fern transition-all duration-700 mb-8" size={40} />
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-3 italic">{stat.label}</p>
                        <p className="text-4xl font-black text-white font-mono italic tracking-tighter">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Primary Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Recent Insights */}
                    <div className="lg:col-span-2 space-y-10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.5em] italic">Active_Biological_Insights</h3>
                        <button className="text-fern text-[9px] font-black uppercase tracking-[0.4em] italic hover:text-white transition-colors">Audit_All_Sequences</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {healthInsights.slice(0, 4).map((insight) => (
                          <div key={insight.id} className="glass-panel border-white/5 rounded-[3rem] p-10 bg-white/[0.01] hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-fern/5 group-hover:text-fern/10 transition-colors">
                              <Activity size={60} />
                            </div>
                            <div className="flex items-center gap-3 mb-8">
                              <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] italic ${insight.priority === 'high' ? 'bg-red-400/10 text-red-400 border border-red-400/20' :
                                insight.priority === 'medium' ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' :
                                  'bg-fern/10 text-fern border border-fern/20'
                                }`}>
                                {insight.priority}_PRIORITY
                              </span>
                              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] font-mono italic">{insight.category}</span>
                            </div>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic leading-none">{insight.title}</h4>
                            <p className="text-white/30 text-[11px] font-black uppercase tracking-widest leading-relaxed mb-10 italic">{insight.description}</p>
                            <div className="border-t border-white/5 pt-8 flex items-center justify-between">
                              <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic font-mono">{insight.date}</p>
                              <ChevronRight className="text-white/10 group-hover:text-fern transition-all" size={20} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Access Card */}
                    <div className="space-y-10">
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.5em] italic">Protocol_Actions</h3>
                      <div className="glass-panel border-white/5 rounded-[4rem] p-12 bg-white/[0.01] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-fern/5 blur-3xl rounded-full"></div>
                        <div className="space-y-6 relative z-10">
                          {[
                            { name: 'IDENTIFY_SEQUENCE', icon: Dna, color: 'fern' },
                            { name: 'MINT_GENETIC_NFT', icon: Award, color: 'white' },
                            { name: 'REPLICATE_NODE', icon: Share2, color: 'white' },
                            { name: 'HARDEN_ENCRYPTION', icon: ShieldCheck, color: 'white' },
                          ].map((btn, i) => (
                            <button key={i} className={`w-full py-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] italic transition-all flex items-center justify-center gap-4 ${btn.color === 'fern' ? 'bg-fern text-obsidian shadow-[0_0_30px_rgba(167,199,171,0.2)] hover:bg-[#A7C7AB]' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                              }`}>
                              <btn.icon size={18} /> {btn.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Genetic Data Tab */}
              {activeTab === 'data' && (
                <div className="space-y-12">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Sequence_Inventory</h2>
                      <p className="text-[10px] text-fern font-black uppercase tracking-[0.5em] italic mt-3">VERIFIED_GENOMIC_LOCI</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="glass-panel border-white/5 rounded-3xl px-8 py-4 flex items-center gap-4 text-white/30 text-xs font-black italic uppercase tracking-widest bg-white/[0.01]">
                        Filter: ALL_CLUSTERS <ChevronRight size={14} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {userData.length === 0 ? (
                      <div className="text-center py-20 text-white/30 text-sm font-bold uppercase tracking-widest italic border border-white/5 rounded-[3rem] border-dashed">
                        No genetic sequences detected in this vault.
                      </div>
                    ) : (
                      userData.map((item) => (
                        <div key={item.id} className="glass-panel border-white/5 rounded-3xl p-8 flex items-center justify-between group hover:bg-white/[0.02] transition-all bg-white/[0.01]">
                          <div className="flex items-center gap-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-fern transition-all group-hover:scale-110 shadow-inner">
                              {item.type === 'genetic' ? <Dna size={26} /> : <ClipboardList size={26} />}
                            </div>
                            <div>
                              <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic group-hover:text-fern transition-colors">{item.name}</h4>
                              <div className="flex items-center gap-6 mt-3">
                                <span className="text-[10px] text-white/20 font-black uppercase font-mono tracking-widest italic">{item.date}</span>
                                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                <span className="text-[10px] text-white/20 font-black uppercase font-mono tracking-widest italic">{item.size}</span>
                                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                <span className="text-[10px] text-fern font-black uppercase tracking-[0.3em] italic">SHARED_NODES: {item.sharedWith}</span>
                                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] italic font-mono truncate max-w-[150px]" title={item.hash}>NOTARIZED: {item.hash?.slice(0, 10)}...</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            {item.hedera_transaction_id && (
                              <a
                                href={`https://hashscan.io/testnet/transaction/${item.hedera_transaction_id.replace('@', '-')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2 rounded-full border border-fern/30 bg-fern/5 text-fern text-[9px] font-black uppercase tracking-[0.4em] italic hover:bg-fern/20 transition-all flex items-center gap-3 decoration-transparent"
                              >
                                <ShieldCheck size={14} /> Verify_On_Hedera
                              </a>
                            )}
                            {item.nftCertified ? (
                              <div className="px-6 py-2 rounded-full border border-fern/30 bg-fern/10 text-fern text-[9px] font-black uppercase tracking-[0.4em] italic">PROTOCOL_CERTIFIED</div>
                            ) : (
                              <button className="h-12 px-10 rounded-3xl bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.4em] italic transition-all hover:bg-fern hover:text-obsidian hover:border-fern">INITIALIZE_PROOF</button>
                            )}
                            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/20 flex items-center justify-center hover:text-white transition-colors"><ExternalLink size={18} /></button>
                          </div>
                        </div>
                      )))}
                  </div>
                </div>
              )}

              {/* Health Insights Tab */}
              {activeTab === 'insights' && (
                <div className="space-y-12">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Biological Signals</h2>
                      <p className="text-[10px] text-fern font-black uppercase tracking-[0.5em] italic mt-3">PROCESSED_GENOMIC_TELEMETRY</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {healthInsights.map((insight) => (
                      <div key={insight.id} className="glass-panel border-white/5 rounded-[4rem] p-12 bg-white/[0.01] hover:bg-white/[0.03] hover:border-fern/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 text-fern/5 group-hover:text-fern/10 transition-colors">
                          <Activity size={100} />
                        </div>
                        <div className="flex items-center gap-4 mb-10">
                          <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.4em] italic ${insight.priority === 'high' ? 'bg-red-400/10 text-red-400 border border-red-400/20' : 'bg-fern/10 text-fern border border-fern/20'
                            }`}>
                            {insight.priority}_PRIORITY
                          </span>
                          <span className="text-[9px] font-black text-white/20 font-mono tracking-[0.5em] italic">{insight.category}</span>
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-6 italic leading-none">{insight.title}</h3>
                        <p className="text-white/30 text-[13px] font-black uppercase tracking-widest leading-relaxed mb-12 italic">{insight.description}</p>
                        <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-white/10 font-black italic">{insight.date}</span>
                          <button className="bg-fern text-obsidian px-8 py-4 rounded-3xl text-[9px] font-black uppercase tracking-[0.4em] italic opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">DECODE_METRICS</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Family Tab */}
              {activeTab === 'family' && (
                <div className="space-y-12">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Biological_Network</h2>
                      <p className="text-[10px] text-fern font-black uppercase tracking-[0.5em] italic mt-3">LINKED_SOVEREIGN_NODES</p>
                    </div>
                    <button className="bg-fern text-obsidian px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] italic flex items-center gap-4 hover:bg-[#A7C7AB] transition-all shadow-[0_0_40px_rgba(167,199,171,0.2)]">
                      <Plus size={20} /> LINK_RELATIVE
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {familyMembers.map((member) => (
                      <div key={member.id} className="glass-panel border-white/5 rounded-[4rem] p-12 text-center bg-white/[0.01] hover:bg-white/[0.03] transition-all group overflow-hidden relative shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-fern/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-24 h-24 rounded-[2rem] bg-fern/10 border border-fern/30 flex items-center justify-center text-fern text-3xl font-black italic mx-auto mb-10 shadow-inner group-hover:scale-110 transition-transform duration-700">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic leading-none">{member.name}</h4>
                        <p className="text-[10px] text-fern font-black uppercase tracking-[0.4em] italic mb-12">{member.relationship}</p>

                        <div className="space-y-4 pt-10 border-t border-white/5 mb-12">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                            <span>Assets Shared</span>
                            <span className="text-white">{member.dataShared}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                            <span>Last Sync</span>
                            <span className="text-white">{member.lastActive}</span>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button className="flex-1 py-5 rounded-3xl bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.4em] italic hover:bg-white/10 transition-all">MANAGE</button>
                          <button className="flex-1 py-5 rounded-3xl bg-fern/10 border border-fern/20 text-fern text-[9px] font-black uppercase tracking-[0.4em] italic hover:bg-fern hover:text-obsidian transition-all">SIGNAL</button>
                        </div>
                      </div>
                    ))}

                    <button className="border-2 border-dashed border-white/5 rounded-[4rem] p-20 flex flex-col items-center justify-center gap-6 text-white/5 hover:text-fern hover:border-fern/30 hover:bg-fern/5 transition-all group min-h-[400px]">
                      <div className="w-24 h-24 rounded-full border-2 border-current flex items-center justify-center group-hover:rotate-90 transition-transform duration-700">
                        <Plus size={48} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.6em] italic">REPLICATE_RELATIVE</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Placeholders */}
              {['reports', 'subscriptions', 'nft', 'settings'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center min-h-[600px] text-center glass-panel border-white/5 rounded-[5rem] bg-white/[0.01] border-dashed relative overflow-hidden group">
                  <div className="absolute inset-0 bg-fern/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center text-fern/10 mb-10 border border-white/10 shadow-inner group-hover:text-fern group-hover:rotate-12 transition-all duration-1000">
                    {activeTab === 'subscriptions' ? <Star size={64} /> : activeTab === 'nft' ? <Award size={64} /> : <Activity size={64} />}
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter mb-6 uppercase italic">PROTOCOL_LAYER_v2.5_WIP</h3>
                  <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.6em] italic leading-relaxed max-w-xl mx-auto">
                    The requested sequence layer is currently undergoing cluster verification.<br />
                    Consensus synchronisation will resume in the next epoch.
                  </p>
                  <div className="mt-16 flex gap-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-fern animate-ping"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-fern animate-ping delay-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-fern animate-ping delay-700"></div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default IndividualDashboard;
