"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission, UserRole } from "@/lib/auth";
import { ReactNode } from "react";

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, ANY permission
  fallback?: ReactNode;
  role?: UserRole; // Direct role check instead of permission check
}

export function PermissionGate({ 
  children, 
  permission, 
  permissions = [], 
  requireAll = false,
  fallback = null,
  role 
}: PermissionGateProps) {
  const currentUser = useQuery(api.userAuth.getCurrentUser);

  // Show nothing while loading
  if (currentUser === undefined) {
    return null;
  }

  // Show fallback if not authenticated
  if (currentUser === null) {
    return <>{fallback}</>;
  }

  const userRole = currentUser.role as UserRole;

  // Direct role check
  if (role) {
    if (userRole === role || userRole === "admin") {
      return <>{children}</>;
    }
    return <>{fallback}</>;
  }

  // Permission-based check
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(userRole, permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(userRole, permissions)
      : hasAnyPermission(userRole, permissions);
  } else {
    // If no specific permissions specified, just check if authenticated
    hasAccess = true;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Convenience components for common permission checks
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate role="admin" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function ClubOwnerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate role="clubOwner" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function SecurityOfficerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate role="securityOfficer" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function ShooterOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate role="shooter" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

// Component for roles that can manage tournaments (Club Owners and Admins)
export function TournamentManager({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="create_tournament" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

// Component for roles that can score (Security Officers and Admins)  
export function ScoreManager({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="score_stages" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}