import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// User Management Functions for Admins
export const getAllUsers = query({
  args: {
    role: v.optional(v.union(
      v.literal("admin"),
      v.literal("clubOwner"),
      v.literal("securityOfficer"),
      v.literal("shooter")
    )),
    clubId: v.optional(v.id("clubs")),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify admin access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const limit = args.limit || 50;
    const offset = args.offset || 0;

    // Get all users
    let users = await ctx.db.query("users").collect();

    // Apply filters
    if (args.role) {
      users = users.filter(u => u.role === args.role);
    }

    if (args.clubId) {
      users = users.filter(u => u.clubId === args.clubId);
    }

    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm) ||
        (u.idpaMemberNumber && u.idpaMemberNumber.includes(searchTerm))
      );
    }

    // Sort by creation date (newest first)
    users = users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Paginate
    const paginatedUsers = users.slice(offset, offset + limit);

    // Enrich with club information
    const enrichedUsers = await Promise.all(
      paginatedUsers.map(async (user) => {
        let club = null;
        if (user.clubId) {
          club = await ctx.db.get(user.clubId);
        }

        // Get user's recent activity
        const recentActivity = await ctx.db
          .query("auditLogs")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .order("desc")
          .take(5);

        return {
          ...user,
          club: club ? {
            _id: club._id,
            name: club.name,
            location: club.location,
          } : null,
          recentActivity: recentActivity.length,
        };
      })
    );

    return {
      users: enrichedUsers,
      total: users.length,
      hasMore: offset + limit < users.length,
      pagination: {
        limit,
        offset,
        total: users.length,
      },
    };
  },
});

export const getUserDetails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Verify admin access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's club
    let club = null;
    if (user.clubId) {
      club = await ctx.db.get(user.clubId);
    }

    // Get user's tournaments (as participant)
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_shooter", (q) => q.eq("shooterId", user._id))
      .collect();

    const tournaments = await Promise.all(
      registrations.map(async (reg) => {
        const tournament = await ctx.db.get(reg.tournamentId);
        return tournament ? {
          ...tournament,
          registration: reg,
        } : null;
      })
    );

    // Get user's scores
    const scores = await ctx.db
      .query("scores")
      .filter((q) => q.eq(q.field("shooterId"), user._id))
      .order("desc")
      .take(10);

    // Get user's badges
    const badges = await ctx.db
      .query("badges")
      .withIndex("by_shooter", (q) => q.eq("shooterId", user._id))
      .order("desc")
      .take(10);

    // Get user's audit trail
    const auditLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);

    // Calculate user statistics
    const totalTournaments = tournaments.filter(t => t !== null).length;
    const completedTournaments = tournaments.filter(t => 
      t && t.status === "completed"
    ).length;
    const totalBadges = badges.length;
    const totalScores = scores.length;

    return {
      user,
      club,
      statistics: {
        totalTournaments,
        completedTournaments,
        totalBadges,
        totalScores,
        lastActive: user.lastActive,
        accountAge: user.createdAt ? Date.now() - user.createdAt : 0,
      },
      recentActivity: {
        tournaments: tournaments.filter(t => t !== null).slice(0, 5),
        scores: scores.slice(0, 5),
        badges: badges.slice(0, 5),
        auditLogs: auditLogs.slice(0, 5),
      },
    };
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(
      v.literal("admin"),
      v.literal("clubOwner"),
      v.literal("securityOfficer"),
      v.literal("shooter")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify admin access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    const oldRole = targetUser.role;

    // Update user role
    await ctx.db.patch(args.userId, {
      role: args.newRole,
      lastActive: Date.now(),
    });

    // Log the role change
    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "user_role_changed",
      entityType: "users",
      entityId: args.userId,
      oldValues: { role: oldRole },
      newValues: { role: args.newRole },
      timestamp: Date.now(),
      severity: "high",
    });

    // If role changed to/from clubOwner, handle club ownership
    if (oldRole === "clubOwner" && args.newRole !== "clubOwner") {
      // Remove club ownership
      if (targetUser.clubId) {
        await ctx.db.patch(targetUser.clubId, {
          active: false, // Deactivate club
        });
      }
    }

    return {
      success: true,
      oldRole,
      newRole: args.newRole,
      userId: args.userId,
    };
  },
});

export const suspendUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
    duration: v.optional(v.number()), // Duration in milliseconds, null for permanent
  },
  handler: async (ctx, args) => {
    // Verify admin access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const suspensionEnd = args.duration ? now + args.duration : null;

    // Add suspension to user preferences
    const updatedPreferences = {
      notifications: true, // Default value
      ...targetUser.preferences,
      suspended: true,
      suspensionReason: args.reason,
      suspensionStart: now,
      suspensionEnd,
    };

    await ctx.db.patch(args.userId, {
      preferences: updatedPreferences,
    });

    // Log the suspension
    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "user_suspended",
      entityType: "users",
      entityId: args.userId,
      newValues: {
        reason: args.reason,
        duration: args.duration,
        suspensionEnd,
      },
      timestamp: now,
      severity: "critical",
    });

    // Record security event
    await ctx.db.insert("securityEvents", {
      eventType: "other",
      severity: "warning",
      userId: args.userId,
      ipAddress: "",
      description: `User suspended by admin: ${args.reason}`,
      metadata: {
        suspendedBy: currentUser._id,
        duration: args.duration,
        suspensionEnd,
      },
      resolved: false,
      timestamp: now,
    });

    return {
      success: true,
      suspensionEnd,
      reason: args.reason,
    };
  },
});

export const unsuspendUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Remove suspension from user preferences
    const updatedPreferences = {
      notifications: true, // Default value
      ...targetUser.preferences,
      suspended: false,
      suspensionReason: undefined,
      suspensionStart: undefined,
      suspensionEnd: undefined,
    };

    await ctx.db.patch(args.userId, {
      preferences: updatedPreferences,
    });

    // Log the unsuspension
    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "user_unsuspended",
      entityType: "users",
      entityId: args.userId,
      timestamp: Date.now(),
      severity: "medium",
    });

    return {
      success: true,
      userId: args.userId,
    };
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
    transferData: v.optional(v.boolean()), // Whether to transfer data to anonymous user
  },
  handler: async (ctx, args) => {
    // Verify admin access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Prevent deletion of last admin
    if (targetUser.role === "admin") {
      const adminCount = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .collect();
      
      if (adminCount.length <= 1) {
        throw new Error("Cannot delete the last admin user");
      }
    }

    const now = Date.now();

    // Handle data transfer/cleanup
    if (args.transferData) {
      // Keep scores and badges but anonymize them
      // This is useful for maintaining tournament integrity
      await ctx.db.patch(args.userId, {
        name: "Deleted User",
        email: `deleted_${now}@system.local`,
        role: undefined,
        idpaMemberNumber: undefined,
        clubId: undefined,
        profilePicture: undefined,
        friends: [],
        preferences: undefined,
        demographics: undefined,
        classifications: undefined,
        primaryDivision: undefined,
      });
    } else {
      // Full deletion - remove all related data
      
      // Delete registrations
      const registrations = await ctx.db
        .query("registrations")
        .withIndex("by_shooter", (q) => q.eq("shooterId", args.userId))
        .collect();
      
      for (const registration of registrations) {
        await ctx.db.delete(registration._id);
      }

      // Delete scores
      const scores = await ctx.db
        .query("scores")
        .filter((q) => q.eq(q.field("shooterId"), args.userId))
        .collect();
      
      for (const score of scores) {
        await ctx.db.delete(score._id);
      }

      // Delete badges
      const badges = await ctx.db
        .query("badges")
        .withIndex("by_shooter", (q) => q.eq("shooterId", args.userId))
        .collect();
      
      for (const badge of badges) {
        await ctx.db.delete(badge._id);
      }

      // Delete the user
      await ctx.db.delete(args.userId);
    }

    // Log the deletion
    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: args.transferData ? "user_anonymized" : "user_deleted",
      entityType: "users",
      entityId: args.userId,
      newValues: {
        reason: args.reason,
        transferData: args.transferData,
      },
      timestamp: now,
      severity: "critical",
    });

    return {
      success: true,
      action: args.transferData ? "anonymized" : "deleted",
      userId: args.userId,
    };
  },
});

// Bulk User Operations
export const bulkUpdateUsers = action({
  args: {
    userIds: v.array(v.id("users")),
    updates: v.object({
      role: v.optional(v.union(
        v.literal("admin"),
        v.literal("clubOwner"),
        v.literal("securityOfficer"),
        v.literal("shooter")
      )),
      suspend: v.optional(v.boolean()),
      suspensionReason: v.optional(v.string()),
    }),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const userId of args.userIds) {
      try {
        if (args.updates.role) {
          await ctx.runMutation(api.admin.updateUserRole, {
            userId,
            newRole: args.updates.role,
            reason: args.reason,
          });
        }

        if (args.updates.suspend !== undefined) {
          if (args.updates.suspend) {
            await ctx.runMutation(api.admin.suspendUser, {
              userId,
              reason: args.updates.suspensionReason || args.reason,
            });
          } else {
            await ctx.runMutation(api.admin.unsuspendUser, { userId });
          }
        }

        results.push({ userId, success: true });
      } catch (error) {
        results.push({ 
          userId, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    return {
      results,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    };
  },
});

// User Statistics for Admin Dashboard
export const getUserStatistics = query({
  args: {
    timeRange: v.optional(v.union(
      v.literal("24h"),
      v.literal("7d"),
      v.literal("30d"),
      v.literal("90d")
    )),
  },
  handler: async (ctx, args) => {
    // Verify admin access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const now = Date.now();
    const timeRanges = {
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
    };

    const range = args.timeRange || "30d";
    const startTime = now - timeRanges[range];

    const allUsers = await ctx.db.query("users").collect();

    // User role distribution
    const roleDistribution = {
      admin: allUsers.filter(u => u.role === "admin").length,
      clubOwner: allUsers.filter(u => u.role === "clubOwner").length,
      securityOfficer: allUsers.filter(u => u.role === "securityOfficer").length,
      shooter: allUsers.filter(u => u.role === "shooter").length,
    };

    // Active users in time range
    const activeUsers = allUsers.filter(u => 
      u.lastActive && u.lastActive > startTime
    ).length;

    // New users in time range
    const newUsers = allUsers.filter(u => 
      u.createdAt && u.createdAt > startTime
    ).length;

    // Profile completion rate
    const completedProfiles = allUsers.filter(u => u.profileCompleted).length;
    const profileCompletionRate = (completedProfiles / allUsers.length) * 100;

    // Users by club
    const clubs = await ctx.db.query("clubs").collect();
    const usersByClub = clubs.map(club => ({
      clubId: club._id,
      clubName: club.name,
      userCount: allUsers.filter(u => u.clubId === club._id).length,
    }));

    // Recent activity
    const recentLogins = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", startTime))
      .filter((q) => q.eq(q.field("action"), "user_login"))
      .collect();

    return {
      overview: {
        totalUsers: allUsers.length,
        activeUsers,
        newUsers,
        profileCompletionRate: Math.round(profileCompletionRate),
      },
      distribution: {
        byRole: roleDistribution,
        byClub: usersByClub.sort((a, b) => b.userCount - a.userCount),
      },
      activity: {
        recentLogins: recentLogins.length,
        timeRange: range,
        period: {
          start: startTime,
          end: now,
        },
      },
      growth: {
        newUsersThisPeriod: newUsers,
        activeUserRate: Math.round((activeUsers / allUsers.length) * 100),
      },
    };
  },
});