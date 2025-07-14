"use client";

import { useEffect, useState } from "react";

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return;

    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger sync when coming back online
        window.dispatchEvent(new CustomEvent("app:online"));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      window.dispatchEvent(new CustomEvent("app:offline"));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check connection periodically (for flaky connections)
    const interval = setInterval(() => {
      if (navigator.onLine !== isOnline) {
        setIsOnline(navigator.onLine);
        window.dispatchEvent(
          new CustomEvent(navigator.onLine ? "app:online" : "app:offline")
        );
      }
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [isOnline, wasOffline]);

  return { isOnline, wasOffline };
}