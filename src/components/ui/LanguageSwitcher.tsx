"use client";

import { useLocale } from 'next-intl';
import { Button } from './button';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();

  const switchLanguage = () => {
    const newLocale = locale === 'es' ? 'en' : 'es';
    document.cookie = `locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLanguage}
      className={cn("gap-2", className)}
      aria-label={`Switch to ${locale === 'es' ? 'English' : 'Spanish'}`}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium">
        {locale === 'es' ? 'EN' : 'ES'}
      </span>
    </Button>
  );
}