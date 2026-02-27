'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { User, ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-2xl border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 h-20 flex items-center justify-between">
        <div className="flex items-center gap-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-fern flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
              AZ
            </div>
            <span className="text-foreground font-bold tracking-tight text-xl md:text-2xl uppercase">
              genes
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <Link href="/documentation" className="hover:text-foreground transition-all">Documentation</Link>
            <Link href="/how-it-works" className="hover:text-foreground transition-all">How it works</Link>
            <Link href="/about" className="hover:text-foreground transition-all">About Us</Link>
            <Link href="/contact" className="hover:text-foreground transition-all">Contact Us</Link>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/sign-in" className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors">
            <User size={16} />
            Sign in
          </Link>
          <Link href="/sign-up" className="bg-foreground text-white px-10 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 group shadow-xl hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 whitespace-nowrap">
            Initialize Vault
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground p-2">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-white border-b border-border shadow-xl py-6 px-6 flex flex-col gap-6 md:hidden select-none"
          >
            <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/documentation" className="hover:text-foreground py-2 border-b border-border/50">Documentation</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/how-it-works" className="hover:text-foreground py-2 border-b border-border/50">How it works</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/about" className="hover:text-foreground py-2 border-b border-border/50">About Us</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/contact" className="hover:text-foreground py-2 border-b border-border/50">Contact Us</Link>
            </div>
            <div className="flex flex-col gap-4 mt-2">
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/sign-in" className="flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-widest text-foreground bg-slate-100 py-4 rounded-full">
                <User size={16} />
                Sign in
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/sign-up" className="bg-foreground text-white py-4 rounded-full text-[13px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl">
                Initialize Vault
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="flex justify-center mt-4">
              <LanguageSwitcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
