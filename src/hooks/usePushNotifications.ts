"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { toast } from "sonner";

export interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
}

export function usePushNotifications() {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>({
    permission: "default",
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
  });

  const subscribeToPush = useMutation(api.pushNotifications.subscribeToPush);
  const unsubscribeFromPush = useMutation(api.pushNotifications.unsubscribeFromPush);
  const userSubscriptions = useQuery(api.pushNotifications.getUserPushSubscriptions);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = 
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      const permission = isSupported ? Notification.permission : "denied";
      
      setPermissionState(prev => ({
        ...prev,
        isSupported,
        permission,
        isLoading: false,
      }));
    };

    checkSupport();
  }, []);

  // Check subscription status
  useEffect(() => {
    if (userSubscriptions) {
      setPermissionState(prev => ({
        ...prev,
        isSubscribed: userSubscriptions.length > 0,
      }));
    }
  }, [userSubscriptions]);

  // Get current subscription
  const getCurrentSubscription = useCallback(async (): Promise<PushSubscription | null> => {
    if (!permissionState.isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Error getting push subscription:", error);
      return null;
    }
  }, [permissionState.isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!permissionState.isSupported) {
      toast.error("Push notifications are not supported in this browser");
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(prev => ({
        ...prev,
        permission,
      }));

      if (permission === "granted") {
        toast.success("Notification permissions granted!");
      } else if (permission === "denied") {
        toast.error("Notification permissions denied");
      }

      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Failed to request notification permissions");
      return "denied";
    }
  }, [permissionState.isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!permissionState.isSupported) {
      toast.error("Push notifications are not supported");
      return false;
    }

    try {
      setPermissionState(prev => ({ ...prev, isLoading: true }));

      // Request permission if not granted
      let permission = permissionState.permission;
      if (permission !== "granted") {
        permission = await requestPermission();
        if (permission !== "granted") {
          return false;
        }
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Subscribe to push notifications
        // Note: In production, you need actual VAPID keys
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
          "BJJ_ke_GUv8dqUwb8VqPvA5fOlvh7s2uLvh3h5O8F3c6s-M8_j1W-k0QhB9Wz8M0QhB9Wz8M0QhB9Wz8M0QhB9Wz8";

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      // Send subscription to server
      const subscriptionJson = subscription.toJSON();
      
      await subscribeToPush({
        endpoint: subscription.endpoint,
        p256dh: subscriptionJson.keys!.p256dh!,
        auth: subscriptionJson.keys!.auth!,
        userAgent: navigator.userAgent,
      });

      setPermissionState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }));

      toast.success("Successfully subscribed to push notifications!");
      return true;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      toast.error("Failed to subscribe to push notifications");
      
      setPermissionState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      return false;
    }
  }, [permissionState, subscribeToPush, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setPermissionState(prev => ({ ...prev, isLoading: true }));

      const subscription = await getCurrentSubscription();
      
      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe();
        
        // Remove from server
        await unsubscribeFromPush({
          endpoint: subscription.endpoint,
        });
      }

      setPermissionState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      toast.success("Successfully unsubscribed from push notifications");
      return true;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      toast.error("Failed to unsubscribe from push notifications");
      
      setPermissionState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      return false;
    }
  }, [getCurrentSubscription, unsubscribeFromPush]);

  // Test notification
  const sendTestNotification = useCallback(() => {
    if (permissionState.permission === "granted") {
      new Notification("IDPA Tournament Manager", {
        body: "Push notifications are working! You'll receive updates about tournaments, scores, and achievements.",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        tag: "test-notification",
        data: { type: "test" },
      });
    } else {
      toast.error("Notification permission not granted");
    }
  }, [permissionState.permission]);

  return {
    ...permissionState,
    subscribe,
    unsubscribe,
    requestPermission,
    sendTestNotification,
    getCurrentSubscription,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}