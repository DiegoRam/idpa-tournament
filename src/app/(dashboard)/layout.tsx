"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { SyncIndicator } from "@/components/ui/SyncQueue";
import { InstallButton } from "@/components/ui/InstallPrompt";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (currentUser === null) {
      router.push("/login");
    }
  }, [currentUser, router]);

  // Show loading while checking authentication
  if (currentUser === undefined) {
    return (
      <div 
        className="min-h-screen bg-slate-950 flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Loading authentication status"
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"
            aria-hidden="true"
          />
          <p className="text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show nothing (redirect is happening)
  if (currentUser === null) {
    return null;
  }

  // User is authenticated, show the dashboard content
  return (
    <>
      <ConnectionStatus />
      <div className="fixed top-4 left-4 z-40 flex items-center gap-2" role="complementary" aria-label="Application status indicators">
        <SyncIndicator />
        <InstallButton />
      </div>
      {children}
    </>
  );
}