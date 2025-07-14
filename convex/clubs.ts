import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Create a new IDPA club (action that gets current user)
export const createClubWithCurrentUser: ReturnType<typeof action> = action({
  args: {
    name: v.string(),
    location: v.object({
      address: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    }),
    contact: v.object({
      email: v.string(),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
    }),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const currentUser = await ctx.runQuery(api.userAuth.getCurrentUser);
    if (!currentUser) {
      throw new Error("You must be logged in to create a club");
    }

    if (currentUser.role !== "clubOwner" && currentUser.role !== "admin") {
      throw new Error("Only Club Owners and Admins can create clubs");
    }

    // Check if user already owns a club
    const existingClub = await ctx.runQuery(api.clubs.getClubsByOwner, { 
      ownerId: currentUser._id 
    });
    
    if (existingClub.length > 0) {
      throw new Error("You already own a club. Each user can only own one club.");
    }

    // Create the club
    const clubId = await ctx.runMutation(api.clubs.createClub, {
      ...args,
      ownerId: currentUser._id,
    });

    return clubId;
  },
});

// Create a new IDPA club
export const createClub = mutation({
  args: {
    name: v.string(),
    ownerId: v.id("users"),
    location: v.object({
      address: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    }),
    contact: v.object({
      email: v.string(),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
    }),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify the owner exists and has appropriate role
    const owner = await ctx.db.get(args.ownerId);
    if (!owner) {
      throw new Error("Owner not found");
    }
    
    if (owner.role !== "clubOwner" && owner.role !== "admin") {
      throw new Error("User must be a club owner or admin to create a club");
    }

    // Check if club with same name exists
    const existingClub = await ctx.db
      .query("clubs")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingClub) {
      throw new Error("Club with this name already exists");
    }

    const clubId = await ctx.db.insert("clubs", {
      name: args.name,
      ownerId: args.ownerId,
      location: args.location,
      contact: args.contact,
      logo: args.logo,
      active: true,
      createdAt: Date.now(),
    });

    // Update the owner's clubId
    await ctx.db.patch(args.ownerId, {
      clubId: clubId,
    });

    return clubId;
  },
});

// Get club by ID
export const getClubById = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.clubId);
  },
});

// Get all active clubs
export const getActiveClubs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("clubs")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

// Get clubs by owner
export const getClubsByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clubs")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

// Update club information
export const updateClub = mutation({
  args: {
    clubId: v.id("clubs"),
    name: v.optional(v.string()),
    location: v.optional(v.object({
      address: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    })),
    contact: v.optional(v.object({
      email: v.string(),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
    })),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { clubId, ...updates } = args;
    
    const club = await ctx.db.get(clubId);
    if (!club) {
      throw new Error("Club not found");
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(clubId, filteredUpdates);
    return await ctx.db.get(clubId);
  },
});

// Get club members
export const getClubMembers = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
  },
});

// Get club members by role
export const getClubMembersByRole = query({
  args: {
    clubId: v.id("clubs"),
    role: v.union(
      v.literal("admin"),
      v.literal("clubOwner"), 
      v.literal("securityOfficer"),
      v.literal("shooter")
    ),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("users")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();

    return members.filter(member => member.role === args.role);
  },
});

// Add member to club
export const addMemberToClub = mutation({
  args: {
    clubId: v.id("clubs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    const user = await ctx.db.get(args.userId);

    if (!club || !user) {
      throw new Error("Club or user not found");
    }

    if (!club.active) {
      throw new Error("Cannot add members to inactive club");
    }

    if (user.clubId === args.clubId) {
      throw new Error("User is already a member of this club");
    }

    await ctx.db.patch(args.userId, {
      clubId: args.clubId,
    });

    return { success: true };
  },
});

// Remove member from club
export const removeMemberFromClub = mutation({
  args: {
    clubId: v.id("clubs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    const user = await ctx.db.get(args.userId);

    if (!club || !user) {
      throw new Error("Club or user not found");
    }

    if (user.clubId !== args.clubId) {
      throw new Error("User is not a member of this club");
    }

    // Don't allow removing the club owner
    if (club.ownerId === args.userId) {
      throw new Error("Cannot remove club owner from club");
    }

    await ctx.db.patch(args.userId, {
      clubId: undefined,
    });

    return { success: true };
  },
});

// Search clubs by name or location
export const searchClubs = query({
  args: {
    searchTerm: v.string(),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let clubs = await ctx.db.query("clubs").collect();
    
    // Filter by active status if specified
    if (args.activeOnly !== false) {
      clubs = clubs.filter(club => club.active);
    }
    
    // Search by name, city, or state
    const searchTerm = args.searchTerm.toLowerCase();
    return clubs.filter(club => 
      club.name.toLowerCase().includes(searchTerm) ||
      club.location.city.toLowerCase().includes(searchTerm) ||
      club.location.state.toLowerCase().includes(searchTerm) ||
      club.location.address.toLowerCase().includes(searchTerm)
    );
  },
});

// Get clubs near a location
export const getClubsNearLocation = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusKm: v.optional(v.number()), // Default to 50km
  },
  handler: async (ctx, args) => {
    const clubs = await ctx.db
      .query("clubs")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    const radius = args.radiusKm || 50;

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radius of the Earth in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // Distance in kilometers
    };

    return clubs
      .map(club => ({
        ...club,
        distance: calculateDistance(
          args.latitude,
          args.longitude,
          club.location.coordinates.lat,
          club.location.coordinates.lng
        )
      }))
      .filter(club => club.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  },
});

// Deactivate club
export const deactivateClub = mutation({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    if (!club) {
      throw new Error("Club not found");
    }

    await ctx.db.patch(args.clubId, {
      active: false,
    });

    return { success: true };
  },
});

// Reactivate club
export const reactivateClub = mutation({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    if (!club) {
      throw new Error("Club not found");
    }

    await ctx.db.patch(args.clubId, {
      active: true,
    });

    return { success: true };
  },
});

// Get user's club (simplified for dashboard)
export const getUserClub = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get the user record
    const userId = identity.subject.split('|')[0];
    const authAccount = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!authAccount) {
      return null;
    }

    const user = await ctx.db.get(authAccount.userId);
    if (!user) {
      return null;
    }

    // If user is a club owner, find their club
    if (user.role === "clubOwner") {
      const club = await ctx.db
        .query("clubs")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .first();
      return club;
    }

    return null;
  },
});

// Enhanced Club Analytics for Admin Dashboard
export const getClubAnalytics = query({
  args: {
    clubId: v.optional(v.id("clubs")),
    timeRange: v.optional(v.union(
      v.literal("7d"),
      v.literal("30d"),
      v.literal("90d"),
      v.literal("1y")
    )),
  },
  handler: async (ctx, args) => {
    // Verify admin access or club owner access
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

    // Check permissions
    if (user.role !== "admin" && user.role !== "clubOwner") {
      throw new Error("Admin or Club Owner access required");
    }

    const now = Date.now();
    const timeRanges = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      "1y": 365 * 24 * 60 * 60 * 1000,
    };

    const range = args.timeRange || "30d";
    const startTime = now - timeRanges[range];

    // If specific club requested, verify access
    let targetClubId = args.clubId;
    if (user.role === "clubOwner" && !args.clubId) {
      // Get club owner's club
      const ownedClub = await ctx.db
        .query("clubs")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .first();
      targetClubId = ownedClub?._id;
    }

    if (user.role === "clubOwner" && args.clubId && user.clubId !== args.clubId) {
      throw new Error("Can only view analytics for your own club");
    }

    // Get club data
    const club = targetClubId ? await ctx.db.get(targetClubId) : null;
    if (targetClubId && !club) {
      throw new Error("Club not found");
    }

    // Get club members
    const members = targetClubId ? await ctx.db
      .query("users")
      .withIndex("by_club", (q) => q.eq("clubId", targetClubId))
      .collect() : [];

    // Get club tournaments
    const tournaments = targetClubId ? await ctx.db
      .query("tournaments")
      .withIndex("by_club", (q) => q.eq("clubId", targetClubId))
      .collect() : [];

    // Filter tournaments by time range
    const recentTournaments = tournaments.filter(t => t.date > startTime);

    // Get registrations for club tournaments
    const allRegistrations = await Promise.all(
      tournaments.map(async (tournament) => {
        const registrations = await ctx.db
          .query("registrations")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
          .collect();
        return registrations.map(reg => ({ ...reg, tournament }));
      })
    );

    const registrations = allRegistrations.flat();
    const recentRegistrations = registrations.filter(r => 
      r.registeredAt > startTime
    );

    // Get scores for club tournaments
    const allScores = await Promise.all(
      tournaments.map(async (tournament) => {
        const stages = await ctx.db
          .query("stages")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
          .collect();
        
        const stageScores = await Promise.all(
          stages.map(async (stage) => {
            const scores = await ctx.db
              .query("scores")
              .withIndex("by_stage_shooter", (q) => q.eq("stageId", stage._id))
              .collect();
            return scores.map(score => ({ ...score, stage, tournament }));
          })
        );
        
        return stageScores.flat();
      })
    );

    const scores = allScores.flat();
    const recentScores = scores.filter(s => s.scoredAt > startTime);

    // Calculate analytics
    const analytics = {
      overview: {
        clubName: club?.name || "All Clubs",
        totalMembers: members.length,
        totalTournaments: tournaments.length,
        recentTournaments: recentTournaments.length,
        totalRegistrations: registrations.length,
        recentRegistrations: recentRegistrations.length,
        averageTournamentSize: tournaments.length > 0 ? 
          Math.round(registrations.length / tournaments.length) : 0,
      },
      memberBreakdown: {
        byRole: {
          shooters: members.filter(m => m.role === "shooter").length,
          securityOfficers: members.filter(m => m.role === "securityOfficer").length,
          clubOwners: members.filter(m => m.role === "clubOwner").length,
          admins: members.filter(m => m.role === "admin").length,
        },
        byDivision: members.reduce((acc, member) => {
          const division = member.primaryDivision || "unspecified";
          acc[division] = (acc[division] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        activeMembers: members.filter(m => 
          m.lastActive && m.lastActive > startTime
        ).length,
      },
      tournamentPerformance: {
        totalTournaments: tournaments.length,
        publishedTournaments: tournaments.filter(t => t.status === "published").length,
        activeTournaments: tournaments.filter(t => t.status === "active").length,
        completedTournaments: tournaments.filter(t => t.status === "completed").length,
        averageRegistrations: tournaments.length > 0 ? 
          Math.round(registrations.length / tournaments.length) : 0,
        capacityUtilization: tournaments.length > 0 ? 
          Math.round((registrations.length / tournaments.reduce((sum, t) => sum + t.capacity, 0)) * 100) : 0,
      },
      registrationTrends: {
        totalRegistrations: registrations.length,
        recentRegistrations: recentRegistrations.length,
        registrationGrowth: registrations.length > 0 ? 
          Math.round((recentRegistrations.length / registrations.length) * 100) : 0,
        divisionBreakdown: recentRegistrations.reduce((acc, reg) => {
          acc[reg.division] = (acc[reg.division] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        statusBreakdown: {
          registered: registrations.filter(r => r.status === "registered").length,
          checkedIn: registrations.filter(r => r.status === "checked_in").length,
          completed: registrations.filter(r => r.status === "completed").length,
          cancelled: registrations.filter(r => r.status === "cancelled").length,
        },
      },
      scoringData: {
        totalScores: scores.length,
        recentScores: recentScores.length,
        averageCompletionRate: tournaments.length > 0 ? 
          Math.round((scores.length / (registrations.length * recentTournaments.length || 1)) * 100) : 0,
        dnfRate: scores.length > 0 ? 
          Math.round((scores.filter(s => s.dnf).length / scores.length) * 100) : 0,
        dqRate: scores.length > 0 ? 
          Math.round((scores.filter(s => s.dq).length / scores.length) * 100) : 0,
      },
      timeRange: {
        range,
        startTime,
        endTime: now,
      },
    };

    return analytics;
  },
});

// Get club performance metrics for admin dashboard
export const getClubPerformanceMetrics = query({
  args: {
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

    const limit = args.limit || 20;
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Get all clubs
    const clubs = await ctx.db.query("clubs").collect();

    // Calculate metrics for each club
    const clubMetrics = await Promise.all(
      clubs.map(async (club) => {
        // Get club members
        const members = await ctx.db
          .query("users")
          .withIndex("by_club", (q) => q.eq("clubId", club._id))
          .collect();

        // Get club tournaments
        const tournaments = await ctx.db
          .query("tournaments")
          .withIndex("by_club", (q) => q.eq("clubId", club._id))
          .collect();

        const recentTournaments = tournaments.filter(t => t.date > thirtyDaysAgo);

        // Get registrations for club tournaments
        const allRegistrations = await Promise.all(
          tournaments.map(async (tournament) => {
            return await ctx.db
              .query("registrations")
              .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
              .collect();
          })
        );

        const registrations = allRegistrations.flat();
        const recentRegistrations = registrations.filter(r => 
          r.registeredAt > thirtyDaysAgo
        );

        // Calculate activity score
        const activityScore = 
          (recentTournaments.length * 10) +
          (recentRegistrations.length * 2) +
          (members.filter(m => m.lastActive && m.lastActive > thirtyDaysAgo).length * 1);

        return {
          club,
          metrics: {
            totalMembers: members.length,
            activeMembers: members.filter(m => 
              m.lastActive && m.lastActive > thirtyDaysAgo
            ).length,
            totalTournaments: tournaments.length,
            recentTournaments: recentTournaments.length,
            totalRegistrations: registrations.length,
            recentRegistrations: recentRegistrations.length,
            activityScore,
            averageTournamentSize: tournaments.length > 0 ? 
              Math.round(registrations.length / tournaments.length) : 0,
          },
        };
      })
    );

    // Sort by activity score
    const sortedClubs = clubMetrics
      .sort((a, b) => b.metrics.activityScore - a.metrics.activityScore)
      .slice(0, limit);

    return {
      clubs: sortedClubs,
      summary: {
        totalClubs: clubs.length,
        activeClubs: clubs.filter(c => c.active).length,
        inactiveClubs: clubs.filter(c => !c.active).length,
        averageMembers: Math.round(
          clubMetrics.reduce((sum, c) => sum + c.metrics.totalMembers, 0) / clubs.length
        ),
        totalTournaments: clubMetrics.reduce((sum, c) => sum + c.metrics.totalTournaments, 0),
        totalRegistrations: clubMetrics.reduce((sum, c) => sum + c.metrics.totalRegistrations, 0),
      },
    };
  },
});

// Get detailed club information for admin management
export const getClubDetailsForAdmin = query({
  args: { clubId: v.id("clubs") },
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

    const club = await ctx.db.get(args.clubId);
    if (!club) {
      throw new Error("Club not found");
    }

    // Get club owner details
    const owner = await ctx.db.get(club.ownerId);

    // Get all club members
    const members = await ctx.db
      .query("users")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();

    // Get club tournaments
    const tournaments = await ctx.db
      .query("tournaments")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();

    // Get audit logs for this club
    const auditLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_entity", (q) => q.eq("entityType", "clubs").eq("entityId", args.clubId))
      .order("desc")
      .take(10);

    return {
      club,
      owner,
      members,
      tournaments,
      auditLogs,
      statistics: {
        totalMembers: members.length,
        membersByRole: {
          shooters: members.filter(m => m.role === "shooter").length,
          securityOfficers: members.filter(m => m.role === "securityOfficer").length,
          clubOwners: members.filter(m => m.role === "clubOwner").length,
          admins: members.filter(m => m.role === "admin").length,
        },
        tournamentStats: {
          total: tournaments.length,
          draft: tournaments.filter(t => t.status === "draft").length,
          published: tournaments.filter(t => t.status === "published").length,
          active: tournaments.filter(t => t.status === "active").length,
          completed: tournaments.filter(t => t.status === "completed").length,
        },
        accountAge: club.createdAt ? Date.now() - club.createdAt : 0,
      },
    };
  },
});

// Admin function to manage club status
export const updateClubStatus = mutation({
  args: {
    clubId: v.id("clubs"),
    active: v.boolean(),
    reason: v.optional(v.string()),
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

    const club = await ctx.db.get(args.clubId);
    if (!club) {
      throw new Error("Club not found");
    }

    const oldStatus = club.active;

    // Update club status
    await ctx.db.patch(args.clubId, {
      active: args.active,
    });

    // Log the status change
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: args.active ? "club_activated" : "club_deactivated",
      entityType: "clubs",
      entityId: args.clubId,
      oldValues: { active: oldStatus },
      newValues: { active: args.active },
      timestamp: Date.now(),
      severity: "medium",
    });

    return {
      success: true,
      oldStatus,
      newStatus: args.active,
      reason: args.reason,
    };
  },
});