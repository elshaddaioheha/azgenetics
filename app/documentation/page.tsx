'use client';

import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FileText, BookOpen, ExternalLink, ShieldAlert, Cpu, Dna, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Documentation() {
  return (
    <div className="bg-[#fdfdfd] text-foreground font-sans selection:bg-fern/10 selection:text-fern overflow-x-hidden min-h-screen">
      <Head>
        <title>Documentation | AZ Genes</title>
      </Head>

      <Navbar />

      <section className="relative pt-40 pb-20 px-6 max-w-[1200px] mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeIn} className="flex items-center gap-3 px-5 py-2 mb-8 rounded-full bg-slate-50 border border-slate-100 shadow-sm w-fit">
            <BookOpen size={14} className="text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#111]">Technical Documentation</span>
          </motion.div>
          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-black text-[#111] tracking-tighter leading-[0.95] mb-6">
            Protocol Docs <br />& Developer Resources.
          </motion.h1>
          <motion.p variants={fadeIn} className="text-xl text-muted-foreground font-medium max-w-2xl mb-16">
            Detailed API endpoints, SDK integrations, and technical research about the AZ Genes decentralization and medical analysis protocol.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Doc Card */}
          <motion.div variants={fadeIn} className="p-8 glass-panel bg-white/50 border border-border shadow-sm rounded-3xl group hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                <Dna size={24} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">VCF Ingestion API</h3>
              <p className="text-muted-foreground font-medium text-sm mb-6">How to securely upload Variant Call Format files to the decentralized patient vault.</p>
            </div>
            <div className="flex items-center text-sm font-bold text-indigo-600 group-hover:gap-2 transition-all">
              View Guide <ArrowRight size={16} />
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="p-8 glass-panel bg-white/50 border border-border shadow-sm rounded-3xl group hover:shadow-xl hover:border-fern/30 transition-all cursor-pointer flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-fern/10 rounded-2xl flex items-center justify-center mb-6 text-fern">
                <Cpu size={24} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Health AI SDK</h3>
              <p className="text-muted-foreground font-medium text-sm mb-6">Retrieve diagnostic metadata and insights while maintaining complete data blindness on server.</p>
            </div>
            <div className="flex items-center text-sm font-bold text-fern group-hover:gap-2 transition-all">
              View Guide <ArrowRight size={16} />
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="p-8 glass-panel bg-white/50 border border-border shadow-sm rounded-3xl group hover:shadow-xl hover:border-med-purple/30 transition-all cursor-pointer flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-med-purple/10 rounded-2xl flex items-center justify-center mb-6 text-med-purple">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Hedera Hash Auth</h3>
              <p className="text-muted-foreground font-medium text-sm mb-6">Protocol references for minting and verifying medical data NFTs on the Hedera framework.</p>
            </div>
            <div className="flex items-center text-sm font-bold text-med-purple group-hover:gap-2 transition-all">
              View Guide <ArrowRight size={16} />
            </div>
          </motion.div>

        </motion.div>

        {/* Resources Table */}
        <div className="mt-20 border border-border rounded-[2rem] overflow-hidden shadow-sm bg-white">
          <div className="p-6 md:p-10 border-b border-border bg-slate-50">
            <h3 className="text-2xl font-bold tracking-tight">Whitepapers & Research</h3>
          </div>
          <div className="divide-y divide-border">
            {['AZ Protocol Lightpaper (2024)', 'Zero-Knowledge Genomic Computing', 'Decentralized Healthcare Security Standards'].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 md:px-10 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <FileText size={20} className="text-muted-foreground" />
                  <span className="font-semibold text-lg">{item}</span>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-border text-sm font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-all">
                  PDF <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
