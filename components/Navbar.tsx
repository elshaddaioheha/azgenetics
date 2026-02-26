'use client';

import React from 'react';
import Link from 'next/link';
import { User, ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-2xl border-b border-border">
      <div className="max-w-[1400px] mx-auto px-10 h-20 flex items-center justify-between">
        <div className="flex items-center gap-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-fern flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
              AZ
            </div>
            <span className="text-foreground font-bold tracking-tight text-2xl uppercase">
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

        <div className="flex items-center gap-8">
          <Link href="/sign-in" className="hidden md:flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors">
            <User size={16} />
            Sign in
          </Link>
          <Link href="/sign-up" className="bg-foreground text-white px-10 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 group shadow-xl hover:bg-indigo-600 hover:scale-[1.02] active:scale-95">
            Initialize Vault
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
