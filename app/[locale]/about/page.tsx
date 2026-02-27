'use client';

import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Dna, ShieldCheck, HeartPulse, Microscope } from 'lucide-react';
import Navbar from '@/components/Navbar';

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
    transition: { staggerChildren: 0.15 }
  }
};

export default function About() {
  return (
    <div className="bg-[#fdfdfd] text-foreground font-sans selection:bg-fern/10 selection:text-fern overflow-x-hidden min-h-screen">
      <Head>
        <title>About Us | AZ Genes</title>
      </Head>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-[10%] right-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-med-purple/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 flex flex-col items-center max-w-4xl"
        >
          <motion.div variants={fadeIn} className="flex items-center gap-3 px-5 py-2 mb-8 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
            <HeartPulse size={14} className="text-red-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#111]">Our Heritage</span>
          </motion.div>
          <motion.h1
            variants={fadeIn}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-[#111] tracking-tighter leading-[0.95] mb-8"
          >
            Protecting <br className="hidden md:block" /> <span className="text-med-purple">Generations.</span>
          </motion.h1>
          <motion.p
            variants={fadeIn}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed px-4"
          >
            At AZ Genes, we believe your genetic blueprint is your most valuable asset. We are composed of leading cryptographers and geneticists building a zero-trust biological registry.
          </motion.p>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="py-20 max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-8 glass-panel bg-white/50 backdrop-blur-md border border-border rounded-3xl text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 mx-auto bg-fern/10 text-fern rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Zero-Trust</h3>
            <p className="text-sm text-muted-foreground font-medium">We don't collect, share, or read your data. It is inherently self-sovereign.</p>
          </div>

          <div className="p-8 glass-panel bg-white/50 backdrop-blur-md border border-border rounded-3xl text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Microscope size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Clinical Grade</h3>
            <p className="text-sm text-muted-foreground font-medium">Built in collaboration with leading clinical AI and genomic researchers globally.</p>
          </div>

          <div className="p-8 glass-panel bg-white/50 backdrop-blur-md border border-border rounded-3xl text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 mx-auto bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
              <Dna size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Heritage Focus</h3>
            <p className="text-sm text-muted-foreground font-medium">Built to ensure your family's health genetics are safely passed on to the future.</p>
          </div>

          <div className="p-8 glass-panel bg-white/50 backdrop-blur-md border border-border rounded-3xl text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 mx-auto bg-purple-50 text-med-purple rounded-2xl flex items-center justify-center mb-6">
              <HeartPulse size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Health First</h3>
            <p className="text-sm text-muted-foreground font-medium">Accelerating medical insights securely so you can live a longer, healthier life.</p>
          </div>
        </div>
      </section>

      {/* Team / Lab Atmosphere */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="h-[500px] rounded-[3rem] overflow-hidden relative group shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&q=80&w=2000"
              alt="AZ Genes Medical Team"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12">
              <div>
                <h2 className="text-4xl text-white font-bold mb-4 tracking-tighter">Powered by Science.</h2>
                <p className="text-white/80 max-w-xl text-lg font-medium">Our clinical labs function continuously to ensure AZ Genes is the benchmark for secure medical AI interactions worldwide.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
