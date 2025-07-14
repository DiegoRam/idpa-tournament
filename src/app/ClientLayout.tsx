"use client";

import { InstallPrompt } from "@/components/ui/InstallPrompt";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt variant="banner" />
    </>
  );
}