'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Zap,
  Info,
  Dna,
  Activity,
  User,
  Heart,
  Smartphone,
  Shield,
  Globe,
  Database,
  Lock
} from 'lucide-react';

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

export default function Home() {
  return (
    <div className="bg-[#fdfdfd] text-foreground font-sans selection:bg-fern/10 selection:text-fern overflow-x-hidden min-h-screen">
      <Head>
        <title>AZ genes | Protect Your Genetic Heritage & Health History</title>
        <meta name="description" content="Secure, sovereign genomic data management for individuals and families." />
      </Head>

      {/* Navigation - Premium & Refined */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-36 md:pb-32 px-4 md:px-10 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Abstract background blur */}
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-med-blue/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-med-purple/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 flex flex-col items-center max-w-6xl"
        >
          <motion.div variants={fadeIn} className="flex items-center gap-3 px-5 py-2 mb-12 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-600" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Backed by Leading Genomic Institutes</span>
          </motion.div>

          <motion.h1
            variants={fadeIn}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] font-bold tracking-tighter text-foreground mb-6 md:mb-8 leading-[0.95] text-[#111]"
          >
            Own Your<br />Genetic Destiny.
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 md:mb-12 leading-relaxed font-semibold opacity-60 px-2"
          >
            Secure, sovereign genomic data management for the modern era.
            Carry your biological heritage anywhere, protected by decentralized encryption.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-wrap md:flex-nowrap gap-6 md:gap-10 items-center justify-center mb-16 px-4">
            <div className="flex flex-col items-center w-[40%] md:w-auto">
              <span className="text-2xl sm:text-3xl font-bold tracking-tighter">100%</span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Sovereign</span>
            </div>
            <div className="w-[1px] h-12 bg-border hidden md:block" />
            <div className="flex flex-col items-center w-[40%] md:w-auto">
              <span className="text-2xl sm:text-3xl font-bold tracking-tighter">Hedera</span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Powered Network</span>
            </div>
            <div className="w-[1px] h-12 bg-border hidden md:block" />
            <div className="flex flex-col items-center w-full md:w-auto mt-2 md:mt-0">
              <span className="text-2xl sm:text-3xl font-bold tracking-tighter">IPFS</span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Encrypted Storage</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Bento Grid Features */}
        <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-4 sm:px-6 mb-16 sm:mb-20">
          {/* Card 1 - Unified proportions rounded-[2.5rem] */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-med-blue aspect-[4/5] p-8 sm:p-10 flex flex-col justify-between text-white shadow-2xl hover:-translate-y-2 transition-transform duration-500"
          >
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">Biological Vault</span>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-med-blue transition-all duration-300 shadow-lg">
                <ArrowUpRight size={24} />
              </div>
            </div>
            <div className="relative z-10 text-left">
              <h3 className="text-4xl font-bold leading-[1] tracking-tight mb-4">Protect Your<br />Heritage</h3>
              <p className="text-sm font-semibold opacity-60 leading-relaxed max-w-[180px]">End-to-end encrypted storage for your full genomic sequence.</p>
            </div>
            <div className="absolute inset-0 z-0 group-hover:scale-105 transition-transform duration-1000">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-10" />
              <img
                src="/dna_abstract_1772094318671.png"
                alt=""
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                onError={(e) => { e.currentTarget.style.backgroundColor = '#a8c0d8' }}
              />
            </div>
          </motion.div>

          {/* Card 2 - Researcher Focus */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-med-green aspect-[4/5] p-8 sm:p-10 flex flex-col justify-between text-white shadow-2xl hover:-translate-y-2 transition-transform duration-500"
          >
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">Clinical Network</span>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-med-green transition-all duration-300 shadow-lg">
                <ArrowUpRight size={24} />
              </div>
            </div>
            <div className="relative z-10 text-left">
              <h3 className="text-4xl font-bold leading-[1] tracking-tight mb-4">Precision<br />Medicine</h3>
              <p className="text-sm font-semibold opacity-60 leading-relaxed max-w-[180px]">Collaborate with researchers while maintaining 100% data sovereignty.</p>
            </div>
            <div className="absolute inset-0 z-0 group-hover:scale-105 transition-transform duration-1000">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-10" />
              <img
                src="/medical_lab_tech_1772094355868.png"
                alt=""
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                onError={(e) => { e.currentTarget.style.backgroundColor = '#a3b18a' }}
              />
            </div>
          </motion.div>

          {/* Card 3 - Security Focus */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-med-tan aspect-[4/5] p-8 sm:p-10 flex flex-col justify-between text-white shadow-2xl hover:-translate-y-2 transition-transform duration-500"
          >
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">Encryption Layer</span>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-med-tan transition-all duration-300 shadow-lg">
                <ArrowUpRight size={24} />
              </div>
            </div>
            <div className="relative z-10 text-left">
              <h3 className="text-4xl font-bold leading-[1] tracking-tight mb-4">Immutable<br />Security</h3>
              <p className="text-sm font-semibold opacity-60 leading-relaxed max-w-[180px]">Blockchain-backed proof of authorship and genetic integrity.</p>
            </div>
            <div className="absolute inset-0 z-0 group-hover:scale-105 transition-transform duration-1000">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-10" />
              <img
                src="/secure_vault_medical_1772094379550.png"
                alt=""
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                onError={(e) => { e.currentTarget.style.backgroundColor = '#c8b6a6' }}
              />
            </div>
          </motion.div>

          {/* Card 4 - Global Hub */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-med-purple aspect-[4/5] p-8 sm:p-10 flex flex-col justify-between text-white shadow-2xl hover:-translate-y-2 transition-transform duration-500"
          >
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">Global Portability</span>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-med-purple transition-all duration-300 shadow-lg">
                <ArrowUpRight size={24} />
              </div>
            </div>
            <div className="relative z-10 text-left">
              <h3 className="text-4xl font-bold leading-[1] tracking-tight mb-4">Total<br />Control</h3>
              <p className="text-sm font-semibold opacity-60 leading-relaxed max-w-[180px]">Access your biological records from any authorized medical node worldwide.</p>
            </div>
            <div className="absolute inset-0 z-0 group-hover:scale-105 transition-transform duration-1000">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-10" />
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000"
                alt=""
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity mix-blend-overlay"
              />
              <div className="w-full h-full bg-[#a997bf] flex items-center justify-center">
                <Globe size={120} className="text-white/10" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Final CTA Section */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 mb-24 md:mb-32 mt-16 md:mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 bg-indigo-50 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 group text-center md:text-left"
          >
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-6xl font-black text-indigo-950 tracking-tighter leading-[1] mb-6">
                Ready to secure your biological legacy?
              </h2>
              <p className="text-lg md:text-xl text-indigo-900/60 font-medium leading-relaxed">
                Join the protocol. Decentralize your health records and access precision medical AI without compromising privacy.
              </p>
            </div>
            <Link href="/sign-up" className="px-8 py-4 sm:px-10 sm:py-6 rounded-full bg-indigo-600 text-white font-bold uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-3 sm:gap-4 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl whitespace-normal text-center min-w-[200px]">
              Initialize Vault <ArrowRight size={20} />
            </Link>
          </motion.div>
        </section>
      </section>

      {/* Social Proof / Trust - Smooth Reveal */}
      <section className="py-20 md:py-40 border-y border-border bg-[#fdfdfd]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="max-w-[1400px] mx-auto px-6 md:px-10"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
            <div className="max-w-md text-center lg:text-left">
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Strategic Clinical Partners.</h3>
              <p className="text-muted-foreground font-semibold leading-relaxed opacity-60">Integrated with leading institutions to ensure compliance and robust genomic data security.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-700 w-full lg:w-auto">
              <div className="flex flex-col items-center group">
                <span className="text-2xl font-black italic tracking-tighter uppercase group-hover:text-indigo-600 transition-colors">BioTrust</span>
              </div>
              <div className="flex flex-col items-center group">
                <span className="text-2xl font-black italic tracking-tighter uppercase group-hover:text-med-green transition-colors">GenX Labs</span>
              </div>
              <div className="flex flex-col items-center group">
                <span className="text-2xl font-black italic tracking-tighter uppercase group-hover:text-med-blue transition-colors">NodeCore</span>
              </div>
              <div className="flex flex-col items-center group">
                <span className="text-2xl font-black italic tracking-tighter uppercase group-hover:text-med-purple transition-colors">H-Protocol</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer - Professional Dark Contrast */}
      <footer className="py-16 md:py-24 bg-foreground text-white border-t border-white/5 mt-0">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-20 mb-12 lg:mb-20">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-8 md:mb-10">
                <div className="w-10 h-10 rounded-xl bg-fern flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform hover:scale-110">AZ</div>
                <span className="text-white font-bold tracking-tight text-3xl uppercase">genes</span>
              </div>
              <p className="text-white/60 text-base md:text-lg font-semibold leading-relaxed">
                The global infrastructure for biological data sovereignty. Built for individuals, refined for institutions.
              </p>
              <div className="flex gap-4 mt-8 md:mt-12">
                <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-sm"><Smartphone size={20} /></div>
                <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-sm"><Dna size={20} /></div>
                <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-sm"><Shield size={20} /></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 sm:gap-16 lg:gap-24 w-full lg:w-auto">
              <div>
                <h5 className="font-bold text-xs mb-10 uppercase tracking-[0.3em] text-white/40">Infrastructure</h5>
                <ul className="space-y-6 text-[14px] font-bold text-white/60">
                  <li className="hover:text-white cursor-pointer transition-colors">Vault Engine</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Hedera Node</li>
                  <li className="hover:text-white cursor-pointer transition-colors">IPFS Storage</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Asset Minting</li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-xs mb-10 uppercase tracking-[0.3em] text-white/40">Ecosystem</h5>
                <ul className="space-y-6 text-[14px] font-bold text-white/60">
                  <li className="hover:text-white cursor-pointer transition-colors">Developer API</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Researcher Hub</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Clinic Connect</li>
                </ul>
              </div>
              <div className="hidden sm:block">
                <h5 className="font-bold text-xs mb-10 uppercase tracking-[0.3em] text-white/40">Foundation</h5>
                <ul className="space-y-6 text-[14px] font-bold text-white/60">
                  <li className="hover:text-white cursor-pointer transition-colors">About Mission</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Transparency</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Contact Node</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 md:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] sm:text-[11px] font-bold text-white/30 gap-6 text-center md:text-left">
            <span className="tracking-[0.1em] md:tracking-[0.2em] uppercase">© 2026 AZ Genes Protocol | Clinical Grade Heritage Protection</span>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-12 items-center">
              <span className="hover:text-white cursor-pointer uppercase transition-colors tracking-widest">Privacy Protocol</span>
              <span className="hover:text-white cursor-pointer uppercase transition-colors tracking-widest">Node Terms</span>
              <span className="text-med-green uppercase tracking-widest">Network Synchronized</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
