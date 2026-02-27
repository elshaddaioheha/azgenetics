'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import React, { useTransition } from 'react';

export default function LanguageSwitcher() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = useLocale();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <div className="flex items-center gap-2">
            <select
                className="bg-transparent border border-border text-foreground text-xs font-bold uppercase p-2 rounded-md outline-none cursor-pointer focus:ring-1 focus:ring-fern transition-all"
                defaultValue={currentLocale}
                onChange={handleLanguageChange}
                disabled={isPending}
            >
                <option value="en">EN</option>
                <option value="de">DE</option>
                <option value="fr">FR</option>
                <option value="es">ES</option>
            </select>
        </div>
    );
}
