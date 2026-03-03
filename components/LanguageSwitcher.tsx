'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import React, { useState, useTransition, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';

const REGIONS = [
    { code: 'en', name: 'English', region: 'Global', flag: '🌍' },
    { code: 'de', name: 'Deutsch', region: 'Europe', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', region: 'Europe', flag: '🇫🇷' },
    { code: 'es', name: 'Español', region: 'Global', flag: '🇪🇸' },
];

interface LanguageSwitcherProps {
    theme?: 'light' | 'dark';
}

export default function LanguageSwitcher({ theme = 'light' }: LanguageSwitcherProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentLocale = useLocale();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (nextLocale: string) => {
        if (nextLocale === currentLocale) {
            setIsOpen(false);
            return;
        }

        const searchStr = searchParams.toString();
        const fullPath = searchStr ? `${pathname}?${searchStr}` : pathname;

        startTransition(() => {
            router.replace(fullPath, { locale: nextLocale });
            setIsOpen(false);
        });
    };

    const currentRegion = REGIONS.find(r => r.code === currentLocale) || REGIONS[0];
    const isDark = theme === 'dark';

    const btnClass = isDark
        ? "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
        : "bg-slate-50 border border-border hover:bg-slate-100 text-foreground";

    const popoverClass = isDark
        ? "bg-[#0f1115] border border-white/10 text-white"
        : "bg-white border border-border text-foreground";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all shadow-sm ${btnClass} ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
            >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ${isDark ? 'bg-white/10' : 'bg-white'}`}>
                    {currentRegion.flag}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">{currentLocale}</span>
                <ChevronDown size={14} className={`opacity-60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 top-14 mt-1 w-56 rounded-[1.5rem] shadow-xl overflow-hidden z-50 flex flex-col ${popoverClass}`}
                    >
                        <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-border'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">Region Protocol</p>
                        </div>
                        <div className="p-2 space-y-1">
                            {REGIONS.map((region) => {
                                const isActive = currentLocale === region.code;
                                const itemClass = isActive
                                    ? (isDark ? 'bg-fern/20 text-fern' : 'bg-emerald-50 text-emerald-700')
                                    : (isDark ? 'hover:bg-white/5 text-white/70' : 'hover:bg-slate-50 text-foreground/80');

                                return (
                                    <button
                                        key={region.code}
                                        onClick={() => handleLanguageChange(region.code)}
                                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${itemClass}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{region.flag}</span>
                                            <div className="flex flex-col items-start gap-0.5">
                                                <span className="text-sm font-bold">{region.name}</span>
                                                <span className="text-[9px] uppercase tracking-widest opacity-60 font-semibold">{region.region}</span>
                                            </div>
                                        </div>
                                        {isActive && <Check size={16} className={isDark ? "text-fern" : "text-emerald-600"} />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
