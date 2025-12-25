'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/apiClient';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { useHederaWallet } from '@/context/HederaWalletContext';
import { Icon } from '@iconify/react';
import { TableSkeleton } from '@/components/ui/Skeleton';
import Spinner from '@/components/ui/Spinner';

// Imports from shared components/types
import { DataItem, TokenTransaction, AccessRequest, UserProfile } from '@/types/dashboard';
import { ConnectWalletModal } from '@/components/dashboard/doctor/ConnectWalletModal';
import { PrivateDataAccessPanel } from '@/components/dashboard/doctor/PrivateDataAccessPanel';
import { DataItemRow } from '@/components/dashboard/doctor/DataItemRow';

const AZGenesDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isConnected: isWalletConnected, accountId, connectWallet, disconnectWallet } = useHederaWallet();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPrivateDataUnlocked, setIsPrivateDataUnlocked] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userData, setUserData] = useState<DataItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [loadingAccessRequests, setLoadingAccessRequests] = useState(false);
  const [nftCertificates, setNftCertificates] = useState<any[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [mintingFileId, setMintingFileId] = useState<string | null>(null); // Added state for minting
  const [tokenTransactions, setTokenTransactions] = useState<any[]>([]);
  const [loadingTokenTransactions, setLoadingTokenTransactions] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const toast = useToast();

  // Fetch user files
  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await api.get('files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const files = await response.json();

      // Transform files to match DataItem interface
      const transformedFiles: DataItem[] = files.map((file: any) => ({
        id: file.id,
        name: file.file_name,
        type: file.file_type === 'chemical/x-vcf' ? 'genetic' :
          file.file_type === 'text/csv' ? 'health' :
            file.file_type === 'application/pdf' ? 'professional' :
              'health',
        date: new Date(file.created_at).toLocaleDateString(),
        size: '100 MB', // TODO: Get actual size
        accessCount: 0, // TODO: Get actual access count
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

  // Fetch user profile
  const loadProfile = async () => {
    try {
      const response = await api.get('get-profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const profile = await response.json();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Load access requests
  const loadAccessRequests = async () => {
    setLoadingAccessRequests(true);
    try {
      const response = await api.get('get-access-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch access requests');
      }
      const requests = await response.json();
      setAccessRequests(requests);
    } catch (error) {
      console.error('Error loading access requests:', error);
    } finally {
      setLoadingAccessRequests(false);
    }
  };

  // Load NFT certificates
  const loadNFTs = async () => {
    setLoadingNFTs(true);
    try {
      const files = await api.get('files');
      if (files.ok) {
        const filesData = await files.json();
        const nfts = filesData
          .filter((file: any) => file.nft_token_id)
          .map((file: any) => ({
            id: file.id,
            file_name: file.file_name,
            token_id: file.nft_token_id,
            serial_number: file.nft_serial_number,
            created_at: file.created_at
          }));
        setNftCertificates(nfts);
      }
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoadingNFTs(false);
    }
  };

  // Load files and profile on mount
  useEffect(() => {
    if (user && !authLoading) {
      loadFiles();
      loadProfile();
      loadAccessRequests();
      loadNFTs();
      loadTokenTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Handle role-based redirection
  useEffect(() => {
    if (userProfile && !authLoading) {
      if (userProfile.user_role === 'doctor') {
        router.push('/dashboard/doctor');
      } else if (userProfile.user_role === 'researcher') {
        router.push('/dashboard/researcher');
      } else if (userProfile.user_role === 'patient') {
        // Stay here
        // router.push('/dashboard/individual'); // Uncomment if patient route is different
      }
    }
  }, [userProfile, authLoading, router]);

  // Load data when switching tabs
  useEffect(() => {
    if (!authLoading && user) {
      if (activeTab === 'sharing') {
        loadAccessRequests();
      } else if (activeTab === 'nft') {
        loadNFTs();
      } else if (activeTab === 'tokens') {
        loadTokenTransactions();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Show welcome/login success messages
  useEffect(() => {
    if (!authLoading && user) {
      // Check for welcome message (sign up)
      const showWelcome = window.localStorage.getItem('showWelcomeMessage');
      if (showWelcome === 'true') {
        toast.success('Welcome! Your account has been created successfully.');
        window.localStorage.removeItem('showWelcomeMessage');
      }

      // Check for login success message
      const showLoginSuccess = window.localStorage.getItem('showLoginSuccessMessage');
      if (showLoginSuccess === 'true') {
        toast.success('Login successful! Welcome back.');
        window.localStorage.removeItem('showLoginSuccessMessage');
      }
    }
  }, [authLoading, user, toast]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileDropdown && !(event.target as Element).closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const privateData = userData.filter(item => item.isPrivate);
  const publicData = userData.filter(item => !item.isPrivate);

  // Load token transactions
  const loadTokenTransactions = async () => {
    setLoadingTokenTransactions(true);
    try {
      const response = await api.get('get-token-transactions');
      if (response.ok) {
        const transactions = await response.json();
        setTokenTransactions(transactions);

        // Calculate balance from transactions
        const balance = transactions.reduce((acc: number, tx: any) => {
          if (tx.type === 'received' || tx.type === 'earned') {
            return acc + Number(tx.amount);
          } else if (tx.type === 'spent') {
            return acc - Number(tx.amount);
          }
          return acc;
        }, 0);
        setTokenBalance(balance);
      }
    } catch (error) {
      console.error('Error loading token transactions:', error);
    } finally {
      setLoadingTokenTransactions(false);
    }
  };

  // Calculate stats from actual data
  const stats = {
    totalData: userData.length > 0 ? `${userData.length * 100} MB` : '0 MB',
    nftCertified: userData.filter(item => item.nftCertified).length,
    totalTokens: tokenBalance,
    activeShares: 2,
    dataRequests: 3,
    privateFiles: privateData.length,
    encryptedFiles: userData.filter(item => item.encrypted).length,
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Ensure user is authenticated before attempting upload
    if (!user) {
      toast.error('Please sign in to upload files');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('upload-file', formData);

      if (!response.ok) {
        const error = await response.json();
        toast.error(`Failed to upload file: ${error.error}`);
        return;
      }

      // Reload files
      await loadFiles();
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = async () => {
    try {
      // Sign out with Supabase
      const { supabase } = await import('@/app/api/_context');
      if (supabase) {
        await supabase.auth.signOut();
      }
      toast.success('Logged out successfully');
      setShowProfileDropdown(false);
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out');
    }
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      toast.error(errorMessage.includes('project ID') ? 'Wallet Connect not configured. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID' : 'Failed to connect wallet');
      setIsConnecting(false);
    }
  };

  // Monitor wallet connection status
  useEffect(() => {
    if (isWalletConnected && accountId) {
      toast.success('Wallet connected successfully!');
      setShowConnectModal(false);
      setIsConnecting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletConnected, accountId]);

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      setIsPrivateDataUnlocked(false);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleUnlockPrivateData = () => {
    if (!isWalletConnected) {
      setShowConnectModal(true);
      return;
    }
    setIsPrivateDataUnlocked(true);
  };

  const handleLockPrivateData = () => {
    setIsPrivateDataUnlocked(false);
  };

  const handleMintNFT = async (fileId: string) => {
    if (!isWalletConnected) {
      setShowConnectModal(true);
      return;
    }

    setMintingFileId(fileId); // Set loading state for specific file
    try {
      const response = await api.post('mint-nft-certificate', { fileId });

      if (!response.ok) {
        const error = await response.json();
        toast.error(`Failed to mint NFT: ${error.error}`);
        return;
      }

      toast.success('NFT Certificate minted successfully!');
      await loadNFTs();
      await loadFiles();
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT certificate');
    } finally {
      setMintingFileId(null);
    }
  };

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [authLoading, user, router]);

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

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Dashboard | AZ genes</title>
        <meta name="description" content="Secure genomic data management on Hedera" />
      </Head>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept=".vcf,.csv,.txt,.tsv,.23andme,.txt,.pdf"
      />

      {showConnectModal && (
        <ConnectWalletModal
          onClose={() => setShowConnectModal(false)}
          isConnecting={isConnecting}
          setIsConnecting={setIsConnecting}
          onConnect={handleConnectWallet}
          accountId={accountId}
        />
      )}

      <div className="flex h-screen bg-background text-slate-600 selection:bg-emerald-500/30">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} glass-panel border-r border-border transition-all duration-300 flex flex-col z-50`}>
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Icon icon="lucide:dna" className="text-emerald-500" width="20" />
                  </div>
                  <h1 className="text-lg font-bold text-foreground tracking-tight">AZ genes</h1>
                </div>
              )}
              {!sidebarOpen && (
                <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <Icon icon="lucide:dna" className="text-emerald-500" width="20" />
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 mt-6 px-3 space-y-1">
            {[
              { id: 'overview', name: 'Overview', icon: 'lucide:layout-dashboard' },
              { id: 'data', name: 'My Data', icon: 'lucide:dna' },
              { id: 'tokens', name: 'Token Wallet', icon: 'lucide:wallet' },
              { id: 'sharing', name: 'Data Sharing', icon: 'lucide:share-2' },
              { id: 'nft', name: 'NFT Certificates', icon: 'lucide:award' },
              { id: 'analytics', name: 'Analytics', icon: 'lucide:bar-chart-3' },
              { id: 'settings', name: 'Settings', icon: 'lucide:settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeTab === item.id
                  ? 'bg-emerald-500/10 text-emerald-600 shadow-sm border border-emerald-500/10'
                  : 'text-slate-500 hover:text-foreground hover:bg-slate-100'
                  }`}
              >
                <Icon icon={item.icon} className={`flex-shrink-0 ${activeTab === item.id ? '' : 'group-hover:text-emerald-500 transition-colors'}`} width="20" />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer / Toggle */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-foreground transition-colors group"
            >
              <Icon icon={sidebarOpen ? "lucide:chevron-left" : "lucide:chevron-right"} width="20" />
              {sidebarOpen && <span className="text-xs font-medium uppercase tracking-wider">Collapse Menu</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>

          {/* Header */}
          <header className="glass-panel border-b border-border z-40 sticky top-0">
            <div className="flex items-center justify-between px-8 py-4">
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  {activeTab === 'overview' ? 'Dashboard Overview' : activeTab.replace('-', ' ')}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secure Data Vault • <span className="text-emerald-500">Hedera Network</span>
                </p>
              </div>

              <div className="flex items-center gap-6">
                {/* Wallet Connection Status */}
                {isWalletConnected && accountId && (
                  <div className="flex items-center gap-3 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 leading-none">Connected Wallet</span>
                      <span className="text-xs font-mono text-emerald-600 font-medium">
                        {accountId.toString()}
                      </span>
                    </div>
                    <button
                      onClick={handleDisconnectWallet}
                      className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded transition-colors"
                      title="Disconnect Wallet"
                    >
                      <Icon icon="lucide:log-out" width="14" />
                    </button>
                  </div>
                )}

                {!isWalletConnected && (
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <Icon icon="lucide:wallet" className="text-white" width="16" />
                    <span>Connect Wallet</span>
                  </button>
                )}

                <div className="h-8 w-[1px] bg-border"></div>

                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 border border-slate-300 uppercase font-bold text-xs">
                        {userProfile?.name ? userProfile.name.slice(0, 2) : 'US'}
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-xs font-medium text-foreground">{userProfile?.name || 'User'}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{userProfile?.user_role || 'Patient'}</p>
                      </div>
                      <Icon icon="lucide:chevron-down" width="14" className="text-slate-400" />
                    </button>

                    {showProfileDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 glass-panel border border-border rounded-xl shadow-lg p-2 profile-dropdown">
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2">
                          <Icon icon="lucide:log-out" width="14" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-8 relative z-0">
            {/* Private Data Warning Panel */}
            {privateData.length > 0 && (activeTab === 'overview' || activeTab === 'data') && (
              <PrivateDataAccessPanel
                isPrivateDataUnlocked={isPrivateDataUnlocked}
                isWalletConnected={isWalletConnected}
                onUnlock={handleUnlockPrivateData}
                onLock={handleLockPrivateData}
              />
            )}

            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Data Storage', value: stats.totalData, icon: 'lucide:database', color: 'blue' },
                    { label: 'Token Balance', value: `${stats.totalTokens} AZG`, icon: 'lucide:coins', color: 'emerald' },
                    { label: 'Private Files', value: stats.privateFiles, icon: 'lucide:lock', color: 'purple' },
                    { label: 'NFT Certificates', value: stats.nftCertified, icon: 'lucide:award', color: 'indigo' },
                  ].map((stat, i) => (
                    <div key={i} className="glass-panel border-border p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors`}>
                          <Icon icon={stat.icon} width="24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Files Section used to be here */}
                <div className="glass-panel border-border rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Your Genomic Assets</h3>
                    <button onClick={() => setActiveTab('data')} className="text-xs font-bold text-emerald-600 hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-border">
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asset</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Size</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Proof</th>
                          <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {loadingFiles ? (
                          <tr>
                            <td colSpan={6} className="p-4"><TableSkeleton rows={3} /></td>
                          </tr>
                        ) : userData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">No assets found. Upload your first file to get started.</td>
                          </tr>
                        ) : (
                          userData.slice(0, 5).map(item => (
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
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">My Data Vault</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUploadClick}
                      disabled={isUploading}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm"
                    >
                      {isUploading ? <Spinner size="sm" /> : <Icon icon="lucide:upload-cloud" width="16" />}
                      {isUploading ? 'Uploading...' : 'Upload Data'}
                    </button>
                  </div>
                </div>

                <div className="glass-panel border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-border">
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asset</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Size</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Proof</th>
                          <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {loadingFiles ? (
                          <tr>
                            <td colSpan={6} className="p-6"><TableSkeleton rows={5} /></td>
                          </tr>
                        ) : userData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-12 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                  <Icon icon="lucide:folder-open" width="32" />
                                </div>
                                <h3 className="text-foreground font-medium mb-1">Vault is Empty</h3>
                                <p className="text-slate-500 text-sm mb-4">Upload your genetic or health data to secure it.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          userData.map(item => (
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
                </div>
              </div>
            )}

            {/* Placeholder for other tabs if needed, consistent with Doctor Page */}
            {['tokens', 'sharing', 'nft', 'analytics', 'settings'].includes(activeTab) && (
              <div className="flex items-center justify-center h-64 text-center">
                <div>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Icon icon="lucide:construction" width="32" />
                  </div>
                  <h3 className="text-foreground font-medium mb-1">Under Construction</h3>
                  <p className="text-slate-500 text-sm">This module is currently being updated for the new protocol layer.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default AZGenesDashboard;