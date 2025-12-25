"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/apiClient';
import { Icon } from '@iconify/react';
import Spinner from '@/components/ui/Spinner';

// Types
interface GeneticData {
  id: string;
  name: string;
  type: 'dna' | 'health' | 'report';
  date: string;
  size: string;
  nftCertified: boolean;
  sharedWith: number;
}

interface HealthInsight {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'fitness' | 'health' | 'genetic';
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
          if (profile.user_role !== 'patient') {
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

  // Mock data for individual user
  const geneticData: GeneticData[] = [
    { id: '1', name: '23andMe Raw Data', type: 'dna', date: '2024-01-15', size: '45 MB', nftCertified: true, sharedWith: 2 },
    { id: '2', name: 'AncestryDNA Results', type: 'dna', date: '2024-01-10', size: '38 MB', nftCertified: true, sharedWith: 1 },
    { id: '3', name: 'Blood Test Report', type: 'health', date: '2024-01-08', size: '2 MB', nftCertified: false, sharedWith: 0 },
    { id: '4', name: 'Wellness DNA Report', type: 'report', date: '2024-01-05', size: '5 MB', nftCertified: true, sharedWith: 1 },
  ];

  const healthInsights: HealthInsight[] = [
    { id: '1', title: 'Lactose Intolerance Risk', description: 'Based on your genetic markers, you have a higher probability of lactose intolerance', category: 'nutrition', date: '2024-01-16', priority: 'high' },
    { id: '2', title: 'Optimal Exercise Type', description: 'Your genetic profile suggests better response to endurance training', category: 'fitness', date: '2024-01-15', priority: 'medium' },
    { id: '3', title: 'Vitamin D Metabolism', description: 'Consider monitoring Vitamin D levels due to genetic variations', category: 'health', date: '2024-01-14', priority: 'medium' },
    { id: '4', title: 'Caffeine Sensitivity', description: 'Normal caffeine metabolism based on CYP1A2 gene', category: 'genetic', date: '2024-01-13', priority: 'low' },
  ];

  const familyMembers: FamilyMember[] = [
    { id: '1', name: 'Sarah Chen', relationship: 'Mother', dataShared: 3, lastActive: '2 days ago' },
    { id: '2', name: 'Michael Chen', relationship: 'Brother', dataShared: 2, lastActive: '1 week ago' },
    { id: '3', name: 'Lisa Chen', relationship: 'Sister', dataShared: 1, lastActive: '3 days ago' },
  ];

  const quickStats = {
    totalData: '90 MB',
    nftCertified: 3,
    healthInsights: 12,
    familyConnected: 3,
    dataShares: 4,
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-slate-600 selection:bg-emerald-500/20 relative overflow-hidden">
      <div className="fixed inset-0 z-0 bg-grid pointer-events-none opacity-20"></div>

      {/* Header */}
      <div className="relative z-10 glass-panel border-border p-6 mb-6 rounded-none border-x-0 border-t-0 bg-white/60 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-2">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Genomic Health <span className="text-slate-400 font-normal">/ alex-identity</span></h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-1">Status: <span className="text-emerald-600">Node Synchronized</span></p>
          </div>
          <div className="flex items-center gap-4">
            <button className="h-9 px-4 rounded bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">
              <Icon icon="lucide:upload-cloud" width="16" />
              Upload Asset
            </button>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold font-mono">
              AL
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="glass-panel border-border p-4 rounded-xl sticky top-24 bg-white">
              <nav className="space-y-1">
                {[
                  { id: 'overview', name: 'Overview', icon: 'lucide:layout-dashboard' },
                  { id: 'my-data', name: 'Genetic Data', icon: 'lucide:dna' },
                  { id: 'insights', name: 'Health Insights', icon: 'lucide:sparkles' },
                  { id: 'family', name: 'Family Network', icon: 'lucide:users' },
                  { id: 'reports', name: 'Protocol Reports', icon: 'lucide:clipboard-list' },
                  { id: 'subscriptions', name: 'Protocol Tier', icon: 'lucide:star' },
                  { id: 'settings', name: 'Node Settings', icon: 'lucide:settings' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-xs font-medium uppercase tracking-widest ${activeTab === item.id
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'text-slate-500 hover:text-foreground hover:bg-slate-50'
                      }`}
                  >
                    <Icon icon={item.icon} width="14" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Protocol Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Total Assets</span>
                    <span className="text-xs font-mono text-foreground">{quickStats.totalData}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Certified</span>
                    <span className="text-xs font-mono text-emerald-600">{quickStats.nftCertified}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Insights</span>
                    <span className="text-xs font-mono text-teal-600">{quickStats.healthInsights}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="glass-panel p-6 rounded-xl border-border bg-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Icon icon="lucide:dna" width="48" className="text-slate-800" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assets Stored</p>
                    <p className="text-3xl font-bold text-foreground font-mono">{geneticData.length}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold">Encrypted</span>
                    </div>
                  </div>

                  <div className="glass-panel p-6 rounded-xl border-border bg-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Icon icon="lucide:sparkles" width="48" className="text-slate-800" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Insights</p>
                    <p className="text-3xl font-bold text-foreground font-mono">{healthInsights.length}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                      <span className="text-[10px] text-teal-600 uppercase tracking-widest font-bold">Processed</span>
                    </div>
                  </div>

                  <div className="glass-panel p-6 rounded-xl border-border bg-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Icon icon="lucide:users" width="48" className="text-slate-800" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Family Network</p>
                    <p className="text-3xl font-bold text-foreground font-mono">{familyMembers.length}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                      <span className="text-[10px] text-purple-600 uppercase tracking-widest font-bold">Connected</span>
                    </div>
                  </div>
                </div>

                {/* Recent Health Insights */}
                <div className="glass-panel rounded-xl border-border overflow-hidden bg-white">
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground tracking-tight">Recent Protocol Insights</h3>
                    <button className="text-[10px] text-emerald-600 hover:text-emerald-500 font-bold uppercase tracking-widest">
                      Audit All
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {healthInsights.slice(0, 3).map((insight) => (
                        <div key={insight.id} className="flex items-start gap-4 p-4 border border-border rounded-xl hover:border-emerald-500/30 transition-all group bg-slate-50">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <Icon icon="lucide:sparkles" width="20" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-semibold text-foreground group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{insight.title}</h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${insight.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' :
                                insight.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}>
                                {insight.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{insight.description}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest">{insight.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-panel border-border p-6 rounded-xl bg-white">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-6 px-1">Node Operations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { name: 'Upload Data', desc: 'Secure Asset Ingest', icon: 'lucide:upload-cloud', color: 'bg-emerald-500' },
                      { name: 'Share Data', desc: 'Manage Encrypted Links', icon: 'lucide:share-2', color: 'bg-blue-500' },
                      { name: 'Get Certified', desc: 'Mint Proof NFT', icon: 'lucide:award', color: 'bg-purple-500' },
                      { name: 'Generate Report', desc: 'Synthesize Health Data', icon: 'lucide:file-text', color: 'bg-teal-500' },
                    ].map((action) => (
                      <button key={action.name} className="p-4 glass-panel border-border rounded-xl hover:border-emerald-500/30 hover:bg-slate-50 transition-all group text-left bg-white shadow-sm">
                        <div className={`w-10 h-10 rounded-lg ${action.color}/10 border ${action.color}/20 flex items-center justify-center text-slate-700 mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon icon={action.icon} width="20" className={`text-${action.color.split('-')[1]}-600`} />
                        </div>
                        <p className="text-xs font-bold text-foreground mb-1 uppercase tracking-tight">{action.name}</p>
                        <p className="text-[10px] text-slate-500 leading-tight uppercase tracking-wider">{action.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* My Genetic Data Tab */}
            {activeTab === 'my-data' && (
              <div className="glass-panel border-border rounded-xl overflow-hidden bg-white">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground tracking-tight uppercase tracking-[0.15em]">Sequence Inventory</h3>
                  <button className="h-8 px-4 rounded bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold uppercase tracking-widest transition-all flext items-center gap-2 shadow-sm">
                    <Icon icon="lucide:plus" width="12" />
                    Ingest Sequence
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {geneticData.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <Icon icon={item.type === 'dna' ? 'lucide:dna' : 'lucide:file-text'} width="20" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{item.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                              <span className="text-[10px] text-slate-500 font-mono">{item.size}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                              <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Shared: {item.sharedWith}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {item.nftCertified ? (
                            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                              Protocol Certified
                            </span>
                          ) : (
                            <button className="text-slate-500 hover:text-emerald-600 text-[10px] font-bold uppercase tracking-widest transition-colors">
                              Initialize Proof
                            </button>
                          )}
                          <button className="p-2 text-slate-400 hover:text-foreground transition-colors">
                            <Icon icon="lucide:more-vertical" width="14" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Health Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-8">
                <div className="glass-panel border-border rounded-xl overflow-hidden bg-white">
                  <div className="p-6 border-b border-border">
                    <h3 className="text-sm font-bold text-foreground tracking-tight uppercase tracking-[0.15em]">Sovereign Insights</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {healthInsights.map((insight) => (
                        <div key={insight.id} className="glass-panel border-border rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition-all group">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
                              <Icon icon="lucide:sparkles" width="20" />
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{insight.date}</span>
                          </div>
                          <h4 className="text-sm font-bold text-foreground mb-2 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{insight.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mb-6">{insight.description}</p>
                          <button className="text-[10px] text-emerald-600 hover:text-emerald-500 font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1">
                            Expand Evidence <Icon icon="lucide:arrow-right" width="10" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Family Sharing Tab */}
            {activeTab === 'family' && (
              <div className="space-y-8">
                <div className="glass-panel border-border rounded-xl overflow-hidden bg-white">
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground tracking-tight uppercase tracking-[0.15em]">Biological Network</h3>
                    <button className="h-8 px-4 rounded bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold uppercase tracking-widest transition-all flext items-center gap-2 shadow-sm">
                      <Icon icon="lucide:user-plus" width="12" />
                      Add Relation
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {familyMembers.map((member) => (
                        <div key={member.id} className="glass-panel border-border rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-all group">
                          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 text-xl font-bold font-mono mx-auto mb-4 group-hover:scale-110 transition-transform">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <h4 className="text-sm font-bold text-foreground uppercase tracking-tight mb-1">{member.name}</h4>
                          <p className="text-[10px] text-emerald-600/80 uppercase tracking-widest font-bold mb-4">{member.relationship}</p>
                          <div className="flex flex-col items-center gap-1 text-[10px] text-slate-500 font-mono uppercase tracking-widest border-t border-border pt-4">
                            <span>{member.dataShared} Assets Shared</span>
                            <span className="text-slate-600">Last Synced: {member.lastActive}</span>
                          </div>
                          <div className="mt-6 flex justify-center gap-3">
                            <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                              Manage
                            </button>
                            <button className="px-3 py-1.5 rounded-lg border border-border text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">
                              Signal
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Family Member Card */}
                      <button className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group min-h-[220px]">
                        <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon icon="lucide:plus" width="24" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest">Register Relative</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs can be implemented similarly */}
            {(activeTab === 'reports' || activeTab === 'settings') && (
              <div className="glass-panel border-border rounded-xl p-12 text-center bg-white">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-border flex items-center justify-center text-slate-400 mx-auto mb-6">
                  <Icon icon="lucide:construction" width="32" />
                </div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-[0.2em] mb-2">Protocol Layer Under Construction</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
                  {activeTab === 'reports'
                    ? 'Synthesized health reports and protocol consensus logs are currently being integrated into the individual node view.'
                    : 'System configuration and encryption key management settings will be available in the next protocol update.'}
                </p>
                <button className="h-9 px-6 rounded border border-border text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 mx-auto">
                  <Icon icon="lucide:bell" width="14" />
                  Notify Arrival
                </button>
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <h2 className="text-2xl font-bold text-foreground tracking-tighter uppercase mb-4">Node Tier Selection</h2>
                  <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-widest">
                    Unlock higher consensus priority and advanced genomic indexing by elevating your protocol tier.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { tier: 'F1', name: 'Standard Node', price: 'Free', features: ['100MB Storage', 'Basic Health Insights', 'Family Sharing (3 slots)', 'Consensus v1.0'], color: 'slate' },
                    { tier: 'F2', name: 'Premium Helix', price: '150 GENE/mo', features: ['5GB Private Storage', 'Advanced AI Insights', 'Unlimited Sharing', '2x Reward Multiplier', 'Consensus v2.0'], color: 'emerald', popular: true },
                    { tier: 'F3', name: 'Protocol Alpha', price: '500 GENE/mo', features: ['Unlimited Storage', 'Sequence Forge Access', 'Priority Consensus', 'Ecosystem Governance', 'Alpha Feature Pilot'], color: 'purple' },
                  ].map((sub) => (
                    <div key={sub.tier} className={`glass-panel border-border rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 ${sub.popular ? 'bg-emerald-500/[0.03] ring-1 ring-emerald-500/30' : 'bg-white'}`}>
                      {sub.popular && (
                        <div className="absolute top-0 right-0 py-2 px-8 bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-[0.2em] transform rotate-45 translate-x-[25px] translate-y-[10px]">
                          Popular
                        </div>
                      )}
                      <div className="mb-10">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-4 ${sub.color === 'emerald' ? 'text-emerald-600' : sub.color === 'purple' ? 'text-purple-600' : 'text-slate-500'}`}>{sub.tier} Protocol</p>
                        <h3 className="text-xl font-bold text-foreground uppercase tracking-tighter mb-2">{sub.name}</h3>
                        <div className="flex items-baseline gap-2 mt-4">
                          <span className="text-3xl font-bold text-foreground font-mono">{sub.price.split(' ')[0]}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sub.price.includes('GENE') ? 'GENE / MO' : ''}</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4 mb-10">
                        {sub.features.map(f => (
                          <div key={f} className="flex items-center gap-3">
                            <Icon icon="lucide:check" className="text-emerald-500" width="14" />
                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{f}</span>
                          </div>
                        ))}
                      </div>
                      <button className={`w-full py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${sub.tier === 'F1' ? 'bg-slate-100 text-slate-400 cursor-default border border-border' : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}>
                        {sub.tier === 'F1' ? 'Active Tier' : 'Upgrade Protocol'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;
