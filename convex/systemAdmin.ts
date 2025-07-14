import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// System Analytics Functions
export const getSystemAnalytics = query({
  args: {
    period: v.optional(v.union(
      v.literal("hourly"),
      v.literal("daily"), 
      v.literal("weekly"),
      v.literal("monthly")
    )),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
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
    const period = args.period || "daily";
    const endDate = args.endDate || now;
    const startDate = args.startDate || (now - (30 * 24 * 60 * 60 * 1000)); // 30 days default

    // Get system metrics
    let metrics;
    
    if (args.period) {
      metrics = await ctx.db
        .query("systemAnalytics")
        .withIndex("by_period", (q) => q.eq("period", period))
        .filter((q) => 
          q.and(
            q.gte(q.field("timestamp"), startDate),
            q.lte(q.field("timestamp"), endDate)
          )
        )
        .collect();
    } else {
      metrics = await ctx.db
        .query("systemAnalytics")
        .filter((q) => 
          q.and(
            q.gte(q.field("timestamp"), startDate),
            q.lte(q.field("timestamp"), endDate)
          )
        )
        .collect();
    }

    // Calculate platform-wide statistics
    const totalUsers = await ctx.db.query("users").collect();
    const totalClubs = await ctx.db.query("clubs").collect();
    const totalTournaments = await ctx.db.query("tournaments").collect();
    const totalRegistrations = await ctx.db.query("registrations").collect();
    const totalScores = await ctx.db.query("scores").collect();

    // Active users (last 30 days)
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const activeUsers = totalUsers.filter(user => 
      user.lastActive && user.lastActive > thirtyDaysAgo
    );

    // Recent tournaments (last 90 days)
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    const recentTournaments = totalTournaments.filter(tournament =>
      tournament.date > ninetyDaysAgo
    );

    // Tournament status breakdown
    const tournamentsByStatus = {
      draft: totalTournaments.filter(t => t.status === "draft").length,
      published: totalTournaments.filter(t => t.status === "published").length,
      active: totalTournaments.filter(t => t.status === "active").length,
      completed: totalTournaments.filter(t => t.status === "completed").length,
    };

    // User role distribution
    const usersByRole = {
      admin: totalUsers.filter(u => u.role === "admin").length,
      clubOwner: totalUsers.filter(u => u.role === "clubOwner").length,
      securityOfficer: totalUsers.filter(u => u.role === "securityOfficer").length,
      shooter: totalUsers.filter(u => u.role === "shooter").length,
    };

    // Registration trends (last 30 days)
    const recentRegistrations = totalRegistrations.filter(reg =>
      reg.registeredAt > thirtyDaysAgo
    );

    return {
      overview: {
        totalUsers: totalUsers.length,
        activeUsers: activeUsers.length,
        totalClubs: totalClubs.length,
        totalTournaments: totalTournaments.length,
        recentTournaments: recentTournaments.length,
        totalRegistrations: totalRegistrations.length,
        totalScores: totalScores.length,
      },
      breakdowns: {
        tournamentsByStatus,
        usersByRole,
      },
      trends: {
        recentRegistrations: recentRegistrations.length,
        registrationGrowth: (recentRegistrations.length / Math.max(totalRegistrations.length, 1)) * 100,
        userGrowth: (activeUsers.length / Math.max(totalUsers.length, 1)) * 100,
      },
      metrics,
      period: {
        start: startDate,
        end: endDate,
        period,
      },
    };
  },
});

// System Health Monitoring
export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
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
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    // Check recent activity
    const recentLogins = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneHourAgo))
      .filter((q) => q.eq(q.field("action"), "user_login"))
      .collect();

    const recentErrors = await ctx.db
      .query("securityEvents")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneDayAgo))
      .filter((q) => q.eq(q.field("severity"), "error"))
      .collect();

    const criticalEvents = await ctx.db
      .query("securityEvents")
      .withIndex("by_severity", (q) => q.eq("severity", "critical"))
      .filter((q) => q.gte(q.field("timestamp"), oneDayAgo))
      .collect();

    // Check system components
    const pendingOfflineQueue = await ctx.db
      .query("offlineQueue")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const failedOfflineQueue = await ctx.db
      .query("offlineQueue")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();

    // Calculate health score
    let healthScore = 100;
    
    if (recentErrors.length > 10) healthScore -= 20;
    if (criticalEvents.length > 0) healthScore -= 30;
    if (failedOfflineQueue.length > 5) healthScore -= 15;
    if (pendingOfflineQueue.length > 100) healthScore -= 10;

    const healthStatus = healthScore >= 90 ? "excellent" : 
                        healthScore >= 70 ? "good" : 
                        healthScore >= 50 ? "warning" : "critical";

    return {
      healthScore,
      status: healthStatus,
      lastChecked: now,
      metrics: {
        recentLogins: recentLogins.length,
        recentErrors: recentErrors.length,
        criticalEvents: criticalEvents.length,
        pendingQueue: pendingOfflineQueue.length,
        failedQueue: failedOfflineQueue.length,
      },
      components: {
        database: "operational",
        authentication: "operational", 
        scoring: "operational",
        notifications: "operational",
        offline_sync: failedOfflineQueue.length > 10 ? "degraded" : "operational",
      },
      alerts: [
        ...(criticalEvents.length > 0 ? ["Critical security events detected"] : []),
        ...(recentErrors.length > 10 ? ["High error rate in last 24 hours"] : []),
        ...(failedOfflineQueue.length > 5 ? ["Multiple offline sync failures"] : []),
      ],
    };
  },
});

// Global Settings Management
export const getGlobalSettings = query({
  args: {
    category: v.optional(v.string()),
    includePrivate: v.optional(v.boolean()),
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

    let allSettings;

    if (args.category) {
      allSettings = await ctx.db
        .query("systemSettings")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      allSettings = await ctx.db.query("systemSettings").collect();
    }

    // Filter based on privacy if not admin requesting private settings
    const settings = args.includePrivate ? allSettings : 
      allSettings.filter(setting => setting.isPublic);

    return settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
        category: setting.category,
        isPublic: setting.isPublic,
        lastModified: setting.lastModifiedAt,
        lastModifiedBy: setting.lastModifiedBy,
      };
      return acc;
    }, {} as Record<string, any>);
  },
});

export const updateGlobalSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
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

    // Check if setting exists
    const existingSetting = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existingSetting) {
      // Update existing setting
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        description: args.description || existingSetting.description,
        category: args.category || existingSetting.category,
        isPublic: args.isPublic !== undefined ? args.isPublic : existingSetting.isPublic,
        lastModifiedBy: user._id,
        lastModifiedAt: now,
      });

      // Log the change
      await ctx.db.insert("auditLogs", {
        userId: user._id,
        action: "setting_updated",
        entityType: "systemSettings",
        entityId: existingSetting._id,
        oldValues: { value: existingSetting.value },
        newValues: { value: args.value },
        timestamp: now,
        severity: "medium",
      });

      return existingSetting._id;
    } else {
      // Create new setting
      const settingId = await ctx.db.insert("systemSettings", {
        key: args.key,
        value: args.value,
        description: args.description || "",
        category: args.category || "general",
        isPublic: args.isPublic !== undefined ? args.isPublic : false,
        lastModifiedBy: user._id,
        lastModifiedAt: now,
        createdAt: now,
      });

      // Log the creation
      await ctx.db.insert("auditLogs", {
        userId: user._id,
        action: "setting_created",
        entityType: "systemSettings",
        entityId: settingId,
        newValues: { value: args.value },
        timestamp: now,
        severity: "low",
      });

      return settingId;
    }
  },
});

// Audit Trail Functions
export const getAuditTrail = query({
  args: {
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    severity: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    )),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
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
    const endDate = args.endDate || now;
    const startDate = args.startDate || (now - (7 * 24 * 60 * 60 * 1000)); // 7 days default
    const limit = args.limit || 100;

    let auditQuery = ctx.db.query("auditLogs").withIndex("by_timestamp");

    // Apply filters
    let logs = await auditQuery.collect();

    // Filter by date range
    logs = logs.filter(log => 
      log.timestamp >= startDate && log.timestamp <= endDate
    );

    // Filter by entity type
    if (args.entityType) {
      logs = logs.filter(log => log.entityType === args.entityType);
    }

    // Filter by entity ID
    if (args.entityId) {
      logs = logs.filter(log => log.entityId === args.entityId);
    }

    // Filter by user
    if (args.userId) {
      logs = logs.filter(log => log.userId === args.userId);
    }

    // Filter by severity
    if (args.severity) {
      logs = logs.filter(log => log.severity === args.severity);
    }

    // Sort by timestamp (newest first) and limit
    logs = logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    // Enrich with user information
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const logUser = await ctx.db.get(log.userId);
        return {
          ...log,
          user: logUser ? {
            _id: logUser._id,
            name: logUser.name,
            email: logUser.email,
            role: logUser.role,
          } : null,
        };
      })
    );

    return {
      logs: enrichedLogs,
      total: logs.length,
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalLogs: logs.length,
        severityBreakdown: {
          low: logs.filter(l => l.severity === "low").length,
          medium: logs.filter(l => l.severity === "medium").length,
          high: logs.filter(l => l.severity === "high").length,
          critical: logs.filter(l => l.severity === "critical").length,
        },
        actionBreakdown: logs.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  },
});

// Record audit log entry
export const recordAuditLog = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      oldValues: args.oldValues,
      newValues: args.newValues,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
      severity: args.severity,
    });
  },
});

// Record analytics metric
export const recordAnalyticsMetric = mutation({
  args: {
    metric: v.string(),
    value: v.number(),
    dimensions: v.optional(v.any()),
    period: v.union(
      v.literal("hourly"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
  },
  handler: async (ctx, args) => {
    // This can be called by system processes, no auth required
    return await ctx.db.insert("systemAnalytics", {
      metric: args.metric,
      value: args.value,
      dimensions: args.dimensions,
      timestamp: Date.now(),
      period: args.period,
    });
  },
});

// Bulk analytics recording action
export const recordBulkAnalytics: ReturnType<typeof action> = action({
  args: {
    metrics: v.array(v.object({
      metric: v.string(),
      value: v.number(),
      dimensions: v.optional(v.any()),
      period: v.union(
        v.literal("hourly"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      ),
    })),
  },
  handler: async (ctx, args) => {
    // Record multiple metrics efficiently
    const results = await Promise.all(
      args.metrics.map(metric =>
        ctx.runMutation(api.systemAdmin.recordAnalyticsMetric, metric)
      )
    );

    return {
      recorded: results.length,
      metrics: results,
    };
  },
});