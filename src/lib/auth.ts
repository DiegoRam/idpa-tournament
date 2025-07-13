// Role-based access control utilities
export const USER_ROLES = {
  ADMIN: "admin",
  CLUB_OWNER: "clubOwner", 
  SECURITY_OFFICER: "securityOfficer",
  SHOOTER: "shooter",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Permission definitions
export const PERMISSIONS = {
  // System administration
  MANAGE_SYSTEM: "manage_system",
  MANAGE_ALL_USERS: "manage_all_users",
  MANAGE_ALL_CLUBS: "manage_all_clubs",
  VIEW_SYSTEM_ANALYTICS: "view_system_analytics",
  
  // Club management
  MANAGE_CLUB: "manage_club",
  CREATE_TOURNAMENT: "create_tournament",
  MANAGE_TOURNAMENT: "manage_tournament",
  ASSIGN_SECURITY_OFFICERS: "assign_security_officers",
  GENERATE_REPORTS: "generate_reports",
  
  // Security officer functions
  SCORE_STAGES: "score_stages",
  MANAGE_STAGE_SAFETY: "manage_stage_safety",
  VIEW_SQUAD_ASSIGNMENTS: "view_squad_assignments",
  MODIFY_SCORES: "modify_scores",
  
  // Shooter functions
  REGISTER_FOR_TOURNAMENTS: "register_for_tournaments",
  VIEW_OWN_SCORES: "view_own_scores",
  VIEW_TOURNAMENT_RESULTS: "view_tournament_results",
  MANAGE_OWN_PROFILE: "manage_own_profile",
  SELECT_SQUADS: "select_squads",
  
  // Common permissions
  VIEW_TOURNAMENTS: "view_tournaments",
  VIEW_PUBLIC_RESULTS: "view_public_results",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_SYSTEM,
    PERMISSIONS.MANAGE_ALL_USERS,
    PERMISSIONS.MANAGE_ALL_CLUBS,
    PERMISSIONS.VIEW_SYSTEM_ANALYTICS,
    PERMISSIONS.MANAGE_CLUB,
    PERMISSIONS.CREATE_TOURNAMENT,
    PERMISSIONS.MANAGE_TOURNAMENT,
    PERMISSIONS.ASSIGN_SECURITY_OFFICERS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.SCORE_STAGES,
    PERMISSIONS.MANAGE_STAGE_SAFETY,
    PERMISSIONS.VIEW_SQUAD_ASSIGNMENTS,
    PERMISSIONS.MODIFY_SCORES,
    PERMISSIONS.REGISTER_FOR_TOURNAMENTS,
    PERMISSIONS.VIEW_OWN_SCORES,
    PERMISSIONS.VIEW_TOURNAMENT_RESULTS,
    PERMISSIONS.MANAGE_OWN_PROFILE,
    PERMISSIONS.SELECT_SQUADS,
    PERMISSIONS.VIEW_TOURNAMENTS,
    PERMISSIONS.VIEW_PUBLIC_RESULTS,
  ],
  
  [USER_ROLES.CLUB_OWNER]: [
    PERMISSIONS.MANAGE_CLUB,
    PERMISSIONS.CREATE_TOURNAMENT,
    PERMISSIONS.MANAGE_TOURNAMENT,
    PERMISSIONS.ASSIGN_SECURITY_OFFICERS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.REGISTER_FOR_TOURNAMENTS,
    PERMISSIONS.VIEW_OWN_SCORES,
    PERMISSIONS.VIEW_TOURNAMENT_RESULTS,
    PERMISSIONS.MANAGE_OWN_PROFILE,
    PERMISSIONS.SELECT_SQUADS,
    PERMISSIONS.VIEW_TOURNAMENTS,
    PERMISSIONS.VIEW_PUBLIC_RESULTS,
  ],
  
  [USER_ROLES.SECURITY_OFFICER]: [
    PERMISSIONS.SCORE_STAGES,
    PERMISSIONS.MANAGE_STAGE_SAFETY,
    PERMISSIONS.VIEW_SQUAD_ASSIGNMENTS,
    PERMISSIONS.MODIFY_SCORES,
    PERMISSIONS.REGISTER_FOR_TOURNAMENTS,
    PERMISSIONS.VIEW_OWN_SCORES,
    PERMISSIONS.VIEW_TOURNAMENT_RESULTS,
    PERMISSIONS.MANAGE_OWN_PROFILE,
    PERMISSIONS.SELECT_SQUADS,
    PERMISSIONS.VIEW_TOURNAMENTS,
    PERMISSIONS.VIEW_PUBLIC_RESULTS,
  ],
  
  [USER_ROLES.SHOOTER]: [
    PERMISSIONS.REGISTER_FOR_TOURNAMENTS,
    PERMISSIONS.VIEW_OWN_SCORES,
    PERMISSIONS.VIEW_TOURNAMENT_RESULTS,
    PERMISSIONS.MANAGE_OWN_PROFILE,
    PERMISSIONS.SELECT_SQUADS,
    PERMISSIONS.VIEW_TOURNAMENTS,
    PERMISSIONS.VIEW_PUBLIC_RESULTS,
  ],
};

// Check if user has specific permission
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

// Check if user has any of the specified permissions
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// Check if user has all of the specified permissions
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Get all permissions for a role
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] ?? [];
}

// Role hierarchy (higher roles inherit lower role permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.ADMIN]: 4,
  [USER_ROLES.CLUB_OWNER]: 3,
  [USER_ROLES.SECURITY_OFFICER]: 2,
  [USER_ROLES.SHOOTER]: 1,
};

// Check if one role is higher than another
export function isRoleHigherThan(role1: UserRole, role2: UserRole): boolean {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
}

// Route access definitions
export const PROTECTED_ROUTES = {
  // Admin only routes
  ADMIN: [
    "/admin",
    "/admin/users",
    "/admin/clubs", 
    "/admin/system",
    "/admin/analytics",
  ],
  
  // Club owner routes
  CLUB_OWNER: [
    "/tournaments/create",
    "/tournaments/manage",
    "/tournaments/[id]/edit",
    "/squads/manage",
    "/reports",
  ],
  
  // Security officer routes
  SECURITY_OFFICER: [
    "/scoring",
    "/scoring/[stageId]",
    "/squads/my-assignment",
  ],
  
  // Shooter routes (all authenticated users can access these)
  SHOOTER: [
    "/tournaments",
    "/tournaments/[id]",
    "/tournaments/[id]/register", 
    "/profile",
    "/results",
    "/badges",
  ],
} as const;

// Check if user can access a route
export function canAccessRoute(userRole: UserRole, pathname: string): boolean {
  // Admin can access everything
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }
  
  // Check specific role routes
  for (const [role, routes] of Object.entries(PROTECTED_ROUTES)) {
    if (role === userRole.toUpperCase() || isRoleHigherThan(userRole, role.toLowerCase() as UserRole)) {
      const canAccess = routes.some(route => {
        // Handle dynamic routes
        const routePattern = route.replace(/\[.*?\]/g, "[^/]+");
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(pathname);
      });
      
      if (canAccess) return true;
    }
  }
  
  // Check if it's a common route that all authenticated users can access
  const commonRoutes = [
    "/dashboard",
    "/profile", 
    "/tournaments",
    "/results",
  ];
  
  return commonRoutes.some(route => pathname.startsWith(route));
}