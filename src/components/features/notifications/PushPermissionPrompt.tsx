"use client";

import React, { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BellRing,
  Target,
  Trophy,
  Calendar,
  AlertTriangle,
  X,
  Check,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PushPermissionPromptProps {
  onDismiss?: () => void;
  onGranted?: () => void;
  className?: string;
  autoShow?: boolean;
}

export function PushPermissionPrompt({ 
  onDismiss, 
  onGranted,
  className,
  autoShow = true 
}: PushPermissionPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    requestPermission
  } = usePushNotifications();

  // Show prompt logic
  useEffect(() => {
    if (!autoShow) return;
    
    // Check if user has already dismissed this prompt
    const dismissed = localStorage.getItem("push-permission-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt if:
    // - Push notifications are supported
    // - Permission is default (not granted or denied)
    // - User is not already subscribed
    if (isSupported && permission === "default" && !isSubscribed && !isLoading) {
      // Delay showing the prompt to avoid interrupting the user experience
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, isSubscribed, isLoading, autoShow]);

  const handleEnable = async () => {
    try {
      const granted = await requestPermission();
      
      if (granted === "granted") {
        const subscribed = await subscribe();
        
        if (subscribed) {
          setIsVisible(false);
          onGranted?.();
        }
      } else {
        // Permission denied - hide prompt
        setIsVisible(false);
        handleDismiss();
      }
    } catch (error) {
      console.error("Failed to enable push notifications:", error);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    
    // Remember that user dismissed this prompt
    localStorage.setItem("push-permission-dismissed", Date.now().toString());
    
    onDismiss?.();
  };

  // Don't show if not supported, already subscribed, or dismissed
  if (!isSupported || isSubscribed || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",
      className
    )}>
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BellRing className="h-5 w-5 text-green-400" />
              Stay Updated
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss()}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            Get instant notifications about your IDPA tournaments, scores, and achievements. 
            Never miss important updates!
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Target className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="text-gray-300">Real-time score updates and leaderboards</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Trophy className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              <span className="text-gray-300">Achievement badges and personal records</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="text-gray-300">Tournament registration and schedule updates</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
              <span className="text-gray-300">Important announcements and alerts</span>
            </div>
          </div>
          
          <Alert className="bg-blue-900/20 border-blue-800">
            <Smartphone className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Notifications work even when the app is closed. You can customize or disable them anytime in settings.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => handleDismiss()}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleEnable}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Enable Notifications
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            We respect your privacy. Notifications are sent securely and you can opt out anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}