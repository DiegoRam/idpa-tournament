"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellOff,
  Trophy,
  Target,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Settings,
  CheckCheck,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface NotificationCenterProps {
  className?: string;
  onClose?: () => void;
}

export function NotificationCenter({ className, onClose }: NotificationCenterProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  
  const notifications = useQuery(api.pushNotifications.getUserNotifications, {
    limit: 50,
    unreadOnly: filter === "unread",
  });
  
  const markAsRead = useMutation(api.pushNotifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.pushNotifications.markAllNotificationsAsRead);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as Id<"notifications"> });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "badge_earned":
        return <Trophy className="h-4 w-4 text-yellow-400" />;
      case "score_posted":
        return <Target className="h-4 w-4 text-green-400" />;
      case "tournament_update":
        return <Calendar className="h-4 w-4 text-blue-400" />;
      case "conflict_alert":
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "stage_completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "final_results":
        return <Trophy className="h-4 w-4 text-purple-400" />;
      case "registration_reminder":
        return <Clock className="h-4 w-4 text-orange-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "normal":
        return "bg-blue-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getNotificationUrl = (notification: { type: string; data?: Record<string, unknown> }) => {
    const data = notification.data || {};
    
    switch (notification.type) {
      case "score_posted":
        return data.tournamentId ? `/tournaments/${data.tournamentId}/leaderboard` : "/dashboard";
      case "badge_earned":
        return "/badges";
      case "tournament_update":
        return data.tournamentId ? `/tournaments/${data.tournamentId}` : "/tournaments";
      case "conflict_alert":
        return data.tournamentId && data.stageId 
          ? `/scoring/${data.tournamentId}/stages/${data.stageId}`
          : "/scoring";
      case "final_results":
        return data.tournamentId ? `/tournaments/${data.tournamentId}/leaderboard` : "/tournaments";
      default:
        return "/dashboard";
    }
  };

  if (!notifications) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter(filter === "all" ? "unread" : "all")}
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              {filter === "all" ? "All" : "Unread"}
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
        
        {unreadCount > 0 && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-gray-400">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BellOff className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-400 text-sm">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                You&apos;ll see tournament updates, scores, and achievements here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "p-4 hover:bg-gray-800/30 transition-colors cursor-pointer relative",
                    !notification.isRead && "bg-gray-800/20"
                  )}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification._id);
                    }
                    const url = getNotificationUrl(notification);
                    if (url !== window.location.pathname) {
                      window.location.href = url;
                    }
                    onClose?.();
                  }}
                >
                  {/* Priority indicator */}
                  {notification.priority !== "normal" && (
                    <div 
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        getPriorityColor(notification.priority)
                      )}
                    />
                  )}
                  
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="absolute right-2 top-2 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          "text-sm font-medium truncate",
                          !notification.isRead ? "text-white" : "text-gray-300"
                        )}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className={cn(
                        "text-xs mt-1 line-clamp-2",
                        !notification.isRead ? "text-gray-300" : "text-gray-400"
                      )}>
                        {notification.body}
                      </p>
                      
                      {notification.type && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-0.5"
                          >
                            {notification.type.replace("_", " ").toUpperCase()}
                          </Badge>
                          
                          {notification.priority === "urgent" && (
                            <Badge variant="destructive" className="text-xs px-2 py-0.5">
                              URGENT
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick action button */}
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-8 top-2 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => window.location.href = "/notifications"}
              >
                <Settings className="h-3 w-3 mr-1" />
                View All & Settings
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}