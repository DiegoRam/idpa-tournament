"use client";

import { useTranslations } from 'next-intl';

export function SkipNavigation() {
  const t = useTranslations('accessibility');

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 
                 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium 
                 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                 transition-all duration-200"
      onFocus={(e) => {
        e.currentTarget.scrollIntoView();
      }}
    >
      {t('skipToContent')}
    </a>
  );
}