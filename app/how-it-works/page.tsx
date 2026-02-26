'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Dna,
  Database,
  Lock,
  Zap,
  Network,
  Cpu,
  Fingerprint
} from 'lucide-react';
import Navbar from '@/components/Navbar'; // I'll create a shared Navbar

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as any
    }
  }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function HowItWorks() {
  return (
    <div className="bg-[#fdfdfd] text-foreground font-sans selection:bg-fern/10 selection:text-fern overflow-x-hidden min-h-screen">
      <Head>
        <title>How It Works | AZ Genes</title>
      </Head>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-fern/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 flex flex-col items-center max-w-4xl"
        >
          <motion.div variants={fadeIn} className="flex items-center gap-3 px-5 py-2 mb-8 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
            <Zap size={14} className="text-fern" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#111]">The AZ Protocol</span>
          </motion.div>
          <motion.h1
            variants={fadeIn}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-[#111] tracking-tighter leading-[0.95] mb-8"
          >
            How it <span className="text-fern relative inline-block">works.<div className="absolute -bottom-2 left-0 w-full h-[8px] bg-fern/20 rounded-full"></div></span>
          </motion.h1>
          <motion.p
            variants={fadeIn}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed px-4"
          >
            A sovereign infrastructure for your biological data. Explore the encrypted pipeline from sequence upload to infinite secure storage.
          </motion.p>
        </motion.div>
      </section>

      {/* Detailed Graphic / Interactive Infographic Section */}
      <section className="py-20 relative">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="relative glass-panel rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 border border-border shadow-xl md:shadow-2xl bg-white/50 backdrop-blur-2xl overflow-hidden">
            {/* Background glowing line */}
            <div className="absolute top-[50%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fern to-transparent opacity-20 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
              {/* Step 1 */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <Database size={32} className="text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">1. Secure Upload</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your genetic sequence (VCF, BAM) or medical history is uploaded locally. Client-side encryption ensures the asset is scrambled before it ever touches our servers using military-grade AES-256.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="hidden md:absolute top-10 left-[-50%] w-full h-[2px] bg-gradient-to-r from-indigo-200 to-fern shadow-[0_0_15px_rgba(167,199,171,0.5)] z-0" />
                <div className="w-20 h-20 rounded-3xl bg-fern/10 border border-fern/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(167,199,171,0.3)] group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <Network size={32} className="text-fern" />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">2. Distributed Vault</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The encrypted chunks are decentralized across IPFS nodes. An irrefutable SHA-256 hash footprint is submitted to the Hedera Hashgraph, creating an immutable timeline of your data.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="hidden md:absolute top-10 left-[-50%] w-full h-[2px] bg-gradient-to-r from-fern to-purple-200 shadow-[0_0_15px_rgba(167,199,171,0.5)] z-0" />
                <div className="w-20 h-20 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <Fingerprint size={32} className="text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">3. Sovereign Verification</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Only your private key can decrypt the sequences. Institute a zero-trust consensus for sharing specific genetic loci with medical labs using Protocol Certified NFTs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Architecture */}
      <section className="py-24 bg-slate-50 mt-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Engineered for absolute privacy.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">We use zero-knowledge principles. We cannot read your genetic data, meaning it can never be sold, mined, or compromised.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 bg-white rounded-[2rem] border border-border shadow-sm hover:shadow-xl transition-all">
              <Lock size={32} className="text-indigo-600 mb-6" />
              <h4 className="text-2xl font-bold mb-4">Post-Quantum Cryptography Ready</h4>
              <p className="text-muted-foreground">Encryption protocols designed to withstand future decryption efforts, securing your family's heritage indefinitely.</p>
            </div>
            <div className="p-10 bg-white rounded-[2rem] border border-border shadow-sm hover:shadow-xl transition-all">
              <Cpu size={32} className="text-fern mb-6" />
              <h4 className="text-2xl font-bold mb-4">AI-Assisted Processing Engine</h4>
              <p className="text-muted-foreground">Opt-in to local AI processing that derives health insights from your raw sequence without exposing the source asset.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
