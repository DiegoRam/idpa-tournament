import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// IDPA-specific utilities
export const IDPA_DIVISIONS = [
  { value: "SSP", label: "Stock Service Pistol", description: "Factory stock service pistols" },
  { value: "ESP", label: "Enhanced Service Pistol", description: "Enhanced service pistols" },
  { value: "CDP", label: "Custom Defensive Pistol", description: "Custom defensive pistols" },
  { value: "CCP", label: "Compact Carry Pistol", description: "Compact carry pistols" },
  { value: "REV", label: "Revolver", description: "Revolvers" },
  { value: "BUG", label: "Back-Up Gun", description: "Back-up guns" },
  { value: "PCC", label: "Pistol Caliber Carbine", description: "Pistol caliber carbines" },
  { value: "CO", label: "Carry Optics", description: "Carry optics pistols" },
] as const;

export const IDPA_CLASSIFICATIONS = [
  { value: "MA", label: "Master", description: "Expert level competitor" },
  { value: "EX", label: "Expert", description: "Advanced competitor" },
  { value: "SS", label: "Sharpshooter", description: "Intermediate competitor" },
  { value: "MM", label: "Marksman", description: "Basic competitor" },
  { value: "NV", label: "Novice", description: "Beginning competitor" },
  { value: "UN", label: "Unclassified", description: "No classification yet" },
] as const;

export const USER_ROLES = [
  { value: "admin", label: "Admin", description: "System administrator" },
  { value: "clubOwner", label: "Club Owner", description: "IDPA club manager" },
  { value: "securityOfficer", label: "Security Officer", description: "Range safety officer" },
  { value: "shooter", label: "Shooter", description: "Tournament competitor" },
] as const;

export type IDPADivision = typeof IDPA_DIVISIONS[number]["value"];
export type IDPAClassification = typeof IDPA_CLASSIFICATIONS[number]["value"];
export type UserRole = typeof USER_ROLES[number]["value"];

// Format utilities
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toFixed(2)}`;
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// IDPA scoring utilities
export function calculateIDPAScore(
  rawTime: number,
  pointsDown: number,
  penaltyTime: number
): number {
  return rawTime + pointsDown + penaltyTime;
}

export function calculatePointsDown(hits: {
  down0: number;
  down1: number;
  down3: number;
  miss: number;
  nonThreat: number;
}): number {
  return (
    hits.down0 * 0 +
    hits.down1 * 1 +
    hits.down3 * 3 +
    hits.miss * 5 +
    hits.nonThreat * 5
  );
}

export function calculatePenaltyTime(penalties: {
  procedural: number;
  nonThreat: number;
  failureToNeutralize: number;
  flagrant: number;
  ftdr: number;
  other?: Array<{ count: number; seconds: number }>;
}): number {
  const standardPenalties =
    penalties.procedural * 3 +
    penalties.nonThreat * 5 +
    penalties.failureToNeutralize * 5 +
    penalties.flagrant * 10 +
    penalties.ftdr * 20;

  const otherPenalties = penalties.other?.reduce(
    (total, penalty) => total + penalty.count * penalty.seconds,
    0
  ) || 0;

  return standardPenalties + otherPenalties;
}

// Distance calculation
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidIDPAMemberNumber(memberNumber: string): boolean {
  // IDPA member numbers are typically 6 digits
  const idpaRegex = /^\d{6}$/;
  return idpaRegex.test(memberNumber);
}

// Storage utilities for offline functionality
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to remove from localStorage:", error);
  }
}

// Tournament status helpers
export function getTournamentStatusColor(status: string): string {
  switch (status) {
    case "draft":
      return "text-gray-500 bg-gray-100";
    case "published":
      return "text-blue-600 bg-blue-100";
    case "active":
      return "text-green-600 bg-green-100";
    case "completed":
      return "text-purple-600 bg-purple-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
}

export function getRegistrationStatusColor(status: string): string {
  switch (status) {
    case "registered":
      return "text-green-600 bg-green-100";
    case "waitlist":
      return "text-yellow-600 bg-yellow-100";
    case "checked_in":
      return "text-blue-600 bg-blue-100";
    case "completed":
      return "text-purple-600 bg-purple-100";
    case "cancelled":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
}

// Generate random IDs for client-side use
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}