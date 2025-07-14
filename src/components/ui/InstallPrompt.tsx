"use client";

import { useState } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstallPromptProps {
  className?: string;
  variant?: "banner" | "card" | "inline";
}

export function InstallPrompt({ className, variant = "banner" }: InstallPromptProps) {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || isInstalled || dismissed) return null;

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result) {
      // Successfully installed
      setDismissed(true);
    }
  };

  if (variant === "inline") {
    return (
      <Button
        onClick={handleInstall}
        variant="outline"
        className={cn("gap-2", className)}
      >
        <Download className="h-4 w-4" />
        Install App
      </Button>
    );
  }

  if (variant === "card") {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install IDPA Tournament Manager</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Install the app for offline access, faster loading, and a better experience.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstall}>
                <Download className="h-4 w-4 mr-1" />
                Install
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setDismissed(true)}
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Banner variant (default)
  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t shadow-lg animate-in slide-in-from-bottom-4",
        className
      )}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Install IDPA Tournament Manager</p>
              <p className="text-sm text-muted-foreground">
                Get offline access and better performance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleInstall}>
              Install
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InstallButton({ className }: { className?: string }) {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  if (!isInstallable || isInstalled) return null;

  return (
    <Button
      onClick={promptInstall}
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9", className)}
      title="Install App"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
}