'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, MessageSquare, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mimic API submission
    setTimeout(() => {
      setLoading(false);
      toast.success('Message sent! Our support team will respond shortly.');
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <div className="bg-[#fdfdfd] text-foreground font-sans selection:bg-fern/10 selection:text-fern overflow-x-hidden min-h-screen">
      <Head>
        <title>Contact Us | AZ Genes</title>
      </Head>

      <Navbar />

      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 max-w-[1200px] mx-auto min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 w-full">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-5 py-2 mb-8 rounded-full bg-slate-50 border border-slate-100 shadow-sm w-fit">
              <MessageSquare size={14} className="text-med-green" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#111]">Get in touch</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl lg:text-7xl font-black text-[#111] tracking-tighter leading-[0.95] mb-6">
              Contact our <br /> <span className="text-fern inline-block">Clinical Team.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-muted-foreground font-medium mb-12 max-w-md">
              Whether you are an individual wanting to secure genetic data or an institution seeking protocol integration, we are here to help.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center p-4 group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-widest uppercase text-muted-foreground mb-1">Email inquiries</h4>
                  <p className="text-lg font-bold">clinical@azgenes.app</p>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-fern/10 text-fern rounded-2xl flex items-center justify-center p-4 group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-widest uppercase text-muted-foreground mb-1">Research Hub</h4>
                  <p className="text-lg font-bold">1200 Bio-Tech Avenue, SF</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-panel border border-border shadow-2xl rounded-[3rem] p-10 md:p-14 bg-white/50 backdrop-blur-3xl relative">
            <h3 className="text-2xl font-bold tracking-tight mb-8">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-border/50 rounded-2xl px-6 py-4 focus:outline-none focus:border-fern focus:ring-1 focus:ring-fern transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-border/50 rounded-2xl px-6 py-4 focus:outline-none focus:border-fern focus:ring-1 focus:ring-fern transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3">Message</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-border/50 rounded-2xl px-6 py-4 focus:outline-none focus:border-fern focus:ring-1 focus:ring-fern transition-all resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-white rounded-full py-5 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-fern hover:text-obsidian transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Transmit Message'} <Send size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
