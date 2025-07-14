"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  Smartphone,
  Mail,
  Clock,
  Shield,
  Trophy,
  Target,
  Users,
  Calendar,
  AlertTriangle,
  TestTube,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const preferences = useQuery(api.pushNotifications.getNotificationPreferences);
  const updatePreferences = useMutation(api.pushNotifications.updateNotificationPreferences);
  
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    requestPermission,
    sendTestNotification
  } = usePushNotifications();

  const handleTogglePush = async (enabled: boolean) => {
    if (enabled) {
      if (permission !== "granted") {
        const newPermission = await requestPermission();
        if (newPermission !== "granted") {
          toast.error("Push notifications permission denied");
          return;
        }
      }
      
      const success = await subscribe();
      if (success) {
        await updatePreferences({ pushNotifications: true });
      }
    } else {
      const success = await unsubscribe();
      if (success) {
        await updatePreferences({ pushNotifications: false });
      }
    }
  };

  const handleUpdatePreference = async (key: string, value: boolean | object) => {
    try {
      if (key.startsWith("preferences.")) {
        const prefKey = key.split(".")[1];
        await updatePreferences({
          preferences: {
            tournamentUpdates: preferences?.preferences?.tournamentUpdates ?? true,
            scoreAlerts: preferences?.preferences?.scoreAlerts ?? true,
            badgeNotifications: preferences?.preferences?.badgeNotifications ?? true,
            systemUpdates: preferences?.preferences?.systemUpdates ?? true,
            conflictAlerts: preferences?.preferences?.conflictAlerts ?? true,
            socialUpdates: preferences?.preferences?.socialUpdates ?? false,
            [prefKey]: value
          }
        });
      } else {
        await updatePreferences({ [key]: value });
      }
      toast.success("Notification preferences updated");
    } catch (error) {
      console.error("Failed to update preferences:", error);
      toast.error("Failed to update preferences");
    }
  };

  const handleTestNotification = () => {
    if (permission === "granted") {
      sendTestNotification();
      toast.success("Test notification sent!");
    } else {
      toast.error("Push notifications not enabled");
    }
  };

  if (!preferences) {
    return (
      <Card className={cn("w-full max-w-2xl", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timezones = [
    { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
    { value: "America/Argentina/Cordoba", label: "Córdoba" },
    { value: "America/Argentina/Mendoza", label: "Mendoza" },
    { value: "America/Sao_Paulo", label: "São Paulo" },
    { value: "America/Santiago", label: "Santiago" },
    { value: "UTC", label: "UTC" }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Push Notifications Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Push notifications are not supported in this browser. 
                Please use a modern browser like Chrome, Firefox, or Safari.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Push Notifications</Label>
              <p className="text-sm text-gray-400">
                Receive real-time notifications about tournaments, scores, and achievements
              </p>
            </div>
            <Switch
              checked={isSupported && isSubscribed && preferences.pushNotifications}
              onCheckedChange={handleTogglePush}
              disabled={!isSupported || isLoading}
            />
          </div>
          
          {permission === "denied" && (
            <Alert>
              <X className="h-4 w-4" />
              <AlertDescription>
                Push notifications are blocked. Please enable them in your browser settings
                and refresh the page to receive tournament updates.
              </AlertDescription>
            </Alert>
          )}
          
          {isSubscribed && preferences.pushNotifications && (
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Check className="h-4 w-4" />
                <span className="font-medium">Push notifications enabled</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                You&apos;ll receive notifications for tournament updates, new scores, and achievements.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                className="text-xs"
              >
                <TestTube className="h-3 w-3 mr-1" />
                Send Test Notification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-gray-400">
                Receive important updates via email as a backup
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => handleUpdatePreference("emailNotifications", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <p className="text-sm text-gray-400">
            Choose which types of notifications you want to receive
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-blue-400" />
                <div>
                  <Label className="text-base">Tournament Updates</Label>
                  <p className="text-sm text-gray-400">Registration, schedule changes, announcements</p>
                </div>
              </div>
              <Switch
                checked={preferences.preferences.tournamentUpdates}
                onCheckedChange={(checked) => handleUpdatePreference("preferences.tournamentUpdates", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-green-400" />
                <div>
                  <Label className="text-base">Score Alerts</Label>
                  <p className="text-sm text-gray-400">New scores posted, leaderboard updates</p>
                </div>
              </div>
              <Switch
                checked={preferences.preferences.scoreAlerts}
                onCheckedChange={(checked) => handleUpdatePreference("preferences.scoreAlerts", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <div>
                  <Label className="text-base">Badge Notifications</Label>
                  <p className="text-sm text-gray-400">New achievements and personal records</p>
                </div>
              </div>
              <Switch
                checked={preferences.preferences.badgeNotifications}
                onCheckedChange={(checked) => handleUpdatePreference("preferences.badgeNotifications", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <div>
                  <Label className="text-base">Conflict Alerts</Label>
                  <p className="text-sm text-gray-400">Score conflicts requiring resolution (Security Officers)</p>
                </div>
              </div>
              <Switch
                checked={preferences.preferences.conflictAlerts}
                onCheckedChange={(checked) => handleUpdatePreference("preferences.conflictAlerts", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-purple-400" />
                <div>
                  <Label className="text-base">System Updates</Label>
                  <p className="text-sm text-gray-400">App updates, maintenance notifications</p>
                </div>
              </div>
              <Switch
                checked={preferences.preferences.systemUpdates}
                onCheckedChange={(checked) => handleUpdatePreference("preferences.systemUpdates", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-cyan-400" />
                <div>
                  <Label className="text-base">Social Updates</Label>
                  <p className="text-sm text-gray-400">Friend activities, social features (coming soon)</p>
                </div>
              </div>
              <Switch
                checked={preferences.preferences.socialUpdates}
                onCheckedChange={(checked) => handleUpdatePreference("preferences.socialUpdates", checked)}
                disabled={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <p className="text-sm text-gray-400">
            Set times when you don&apos;t want to receive notifications
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">Enable Quiet Hours</Label>
            <Switch
              checked={preferences.quietHours?.enabled || false}
              onCheckedChange={(checked) => 
                handleUpdatePreference("quietHours", {
                  ...preferences.quietHours,
                  enabled: checked
                })
              }
            />
          </div>

          {preferences.quietHours?.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Start Time</Label>
                  <Select
                    value={preferences.quietHours.startTime}
                    onValueChange={(value) =>
                      handleUpdatePreference("quietHours", {
                        ...preferences.quietHours,
                        startTime: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, "0");
                        return (
                          <SelectItem key={i} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">End Time</Label>
                  <Select
                    value={preferences.quietHours.endTime}
                    onValueChange={(value) =>
                      handleUpdatePreference("quietHours", {
                        ...preferences.quietHours,
                        endTime: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, "0");
                        return (
                          <SelectItem key={i} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm">Timezone</Label>
                <Select
                  value={preferences.quietHours.timezone}
                  onValueChange={(value) =>
                    handleUpdatePreference("quietHours", {
                      ...preferences.quietHours,
                      timezone: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}