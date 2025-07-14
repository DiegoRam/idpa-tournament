import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Match Director Dashboard - Tournament Management
export const getMatchDirectorDashboard = query({
  args: {
    timeRange: v.optional(v.union(
      v.literal("current"),
      v.literal("upcoming"),
      v.literal("past"),
      v.literal("all")
    )),
  },
  handler: async (ctx, args) => {
    // Verify club owner access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || (user.role !== "clubOwner" && user.role !== "admin")) {
      throw new Error("Club Owner or Admin access required");
    }

    // Get user's club (or all clubs for admin)
    let clubs: any[] = [];
    if (user.role === "admin") {
      clubs = await ctx.db.query("clubs").collect();
    } else {
      const userClub = await ctx.db
        .query("clubs")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .first();
      if (userClub) {
        clubs = [userClub];
      }
    }

    if (clubs.length === 0) {
      return {
        tournaments: [],
        statistics: {
          total: 0,
          draft: 0,
          published: 0,
          active: 0,
          completed: 0,
        },
        recentActivity: [],
        upcomingDeadlines: [],
      };
    }

    const now = Date.now();
    const timeRange = args.timeRange || "all";

    // Get tournaments for user's clubs
    let allTournaments = [];
    for (const club of clubs) {
      const clubTournaments = await ctx.db
        .query("tournaments")
        .withIndex("by_club", (q) => q.eq("clubId", club._id))
        .collect();
      allTournaments.push(...clubTournaments.map(t => ({ ...t, club })));
    }

    // Filter by time range
    let tournaments = allTournaments;
    switch (timeRange) {
      case "current":
        tournaments = allTournaments.filter(t => 
          t.status === "active" || (t.status === "published" && t.date <= now + (7 * 24 * 60 * 60 * 1000))
        );
        break;
      case "upcoming":
        tournaments = allTournaments.filter(t => 
          t.date > now && (t.status === "draft" || t.status === "published")
        );
        break;
      case "past":
        tournaments = allTournaments.filter(t => 
          t.date < now || t.status === "completed"
        );
        break;
    }

    // Calculate statistics
    const statistics = {
      total: tournaments.length,
      draft: tournaments.filter(t => t.status === "draft").length,
      published: tournaments.filter(t => t.status === "published").length,
      active: tournaments.filter(t => t.status === "active").length,
      completed: tournaments.filter(t => t.status === "completed").length,
    };

    // Get recent activity (audit logs for tournaments)
    const recentActivity = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .filter((q) => 
        q.and(
          q.eq(q.field("entityType"), "tournaments"),
          q.eq(q.field("userId"), user._id)
        )
      )
      .take(10);

    // Calculate upcoming deadlines
    const upcomingDeadlines = tournaments
      .filter(t => t.status !== "completed")
      .map(t => {
        const deadlines = [];
        
        // Registration deadline
        if (t.registrationCloses > now) {
          deadlines.push({
            tournament: t,
            type: "registration_closes",
            deadline: t.registrationCloses,
            description: "Registration closes",
          });
        }
        
        // Tournament date
        if (t.date > now) {
          deadlines.push({
            tournament: t,
            type: "tournament_date",
            deadline: t.date,
            description: "Tournament starts",
          });
        }
        
        return deadlines;
      })
      .flat()
      .sort((a, b) => a.deadline - b.deadline)
      .slice(0, 5);

    return {
      tournaments: tournaments.slice(0, 20), // Limit for performance
      statistics,
      recentActivity,
      upcomingDeadlines,
    };
  },
});

// Tournament Operations for Match Directors
export const getTournamentManagementData = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    // Verify access
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

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check permissions
    if (user.role !== "admin") {
      const club = await ctx.db.get(tournament.clubId);
      if (!club || club.ownerId !== user._id) {
        throw new Error("Access denied - not tournament owner");
      }
    }

    // Get tournament data
    const squads = await ctx.db
      .query("squads")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    const stages = await ctx.db
      .query("stages")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Get enriched registration data with shooter details
    const enrichedRegistrations = await Promise.all(
      registrations.map(async (reg) => {
        const shooter = await ctx.db.get(reg.shooterId);
        const squad = await ctx.db.get(reg.squadId);
        return {
          ...reg,
          shooter: shooter ? {
            _id: shooter._id,
            name: shooter.name,
            email: shooter.email,
            idpaMemberNumber: shooter.idpaMemberNumber,
          } : null,
          squad: squad ? {
            _id: squad._id,
            name: squad.name,
            timeSlot: squad.timeSlot,
          } : null,
        };
      })
    );

    // Get Security Officers
    const securityOfficers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "securityOfficer"))
      .collect();

    // Calculate tournament progress
    const totalExpectedScores = registrations.length * stages.length;
    let totalActualScores = 0;
    
    if (totalExpectedScores > 0) {
      for (const stage of stages) {
        const stageScores = await ctx.db
          .query("scores")
          .withIndex("by_stage_shooter", (q) => q.eq("stageId", stage._id))
          .collect();
        totalActualScores += stageScores.length;
      }
    }

    const completionPercentage = totalExpectedScores > 0 ? 
      Math.round((totalActualScores / totalExpectedScores) * 100) : 0;

    // Get recent scoring activity
    const recentScores = await ctx.db
      .query("scores")
      .order("desc")
      .filter((q) => {
        // Filter scores for this tournament's stages
        const stageIds = stages.map(s => s._id);
        return stageIds.some(stageId => q.eq(q.field("stageId"), stageId));
      })
      .take(10);

    return {
      tournament,
      squads,
      registrations: enrichedRegistrations,
      stages,
      securityOfficers,
      statistics: {
        totalRegistrations: registrations.length,
        registrationsByStatus: {
          registered: registrations.filter(r => r.status === "registered").length,
          checkedIn: registrations.filter(r => r.status === "checked_in").length,
          completed: registrations.filter(r => r.status === "completed").length,
          cancelled: registrations.filter(r => r.status === "cancelled").length,
        },
        squadUtilization: squads.map(squad => ({
          squadId: squad._id,
          name: squad.name,
          capacity: squad.maxShooters,
          filled: registrations.filter(r => r.squadId === squad._id).length,
          percentage: Math.round((registrations.filter(r => r.squadId === squad._id).length / squad.maxShooters) * 100),
        })),
        scoringProgress: {
          totalExpected: totalExpectedScores,
          totalCompleted: totalActualScores,
          percentage: completionPercentage,
        },
      },
      recentScores,
    };
  },
});

// Squad Management for Match Directors
export const manageSquadAssignments = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    squadId: v.id("squads"),
    securityOfficerId: v.optional(v.id("users")),
    timeSlot: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify access
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

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check permissions
    if (user.role !== "admin") {
      const club = await ctx.db.get(tournament.clubId);
      if (!club || club.ownerId !== user._id) {
        throw new Error("Access denied - not tournament owner");
      }
    }

    const squad = await ctx.db.get(args.squadId);
    if (!squad) {
      throw new Error("Squad not found");
    }

    // Verify SO if provided
    if (args.securityOfficerId) {
      const securityOfficer = await ctx.db.get(args.securityOfficerId);
      if (!securityOfficer || securityOfficer.role !== "securityOfficer") {
        throw new Error("Invalid Security Officer");
      }
    }

    // Update squad
    const updates: any = {};
    if (args.securityOfficerId !== undefined) {
      updates.assignedSO = args.securityOfficerId;
    }
    if (args.timeSlot !== undefined) {
      updates.timeSlot = args.timeSlot;
    }

    await ctx.db.patch(args.squadId, updates);

    // Log the assignment
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "squad_assignment_updated",
      entityType: "squads",
      entityId: args.squadId,
      newValues: updates,
      timestamp: Date.now(),
      severity: "low",
    });

    return { success: true };
  },
});

// Registration Management
export const updateRegistrationStatus = mutation({
  args: {
    registrationId: v.id("registrations"),
    status: v.union(
      v.literal("registered"),
      v.literal("waitlist"),
      v.literal("checked_in"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify access
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

    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    const tournament = await ctx.db.get(registration.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check permissions
    if (user.role !== "admin") {
      const club = await ctx.db.get(tournament.clubId);
      if (!club || club.ownerId !== user._id) {
        throw new Error("Access denied - not tournament owner");
      }
    }

    const oldStatus = registration.status;

    // Update registration
    const updates: any = { status: args.status };
    
    if (args.status === "checked_in") {
      updates.checkedInAt = Date.now();
    }

    await ctx.db.patch(args.registrationId, updates);

    // Update squad capacity if needed
    if (oldStatus !== args.status) {
      const squad = await ctx.db.get(registration.squadId);
      if (squad) {
        const squadRegistrations = await ctx.db
          .query("registrations")
          .withIndex("by_squad", (q) => q.eq("squadId", registration.squadId))
          .collect();
        
        const activeRegistrations = squadRegistrations.filter(r => 
          r.status === "registered" || r.status === "checked_in"
        );

        await ctx.db.patch(registration.squadId, {
          currentShooters: activeRegistrations.length,
          status: activeRegistrations.length >= squad.maxShooters ? "full" : "open",
        });
      }
    }

    // Log the status change
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "registration_status_updated",
      entityType: "registrations",
      entityId: args.registrationId,
      oldValues: { status: oldStatus },
      newValues: { status: args.status, reason: args.reason },
      timestamp: Date.now(),
      severity: "medium",
    });

    return { success: true, oldStatus, newStatus: args.status };
  },
});

// Tournament Status Management
export const updateTournamentStatus = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("active"),
      v.literal("completed")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify access
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

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check permissions
    if (user.role !== "admin") {
      const club = await ctx.db.get(tournament.clubId);
      if (!club || club.ownerId !== user._id) {
        throw new Error("Access denied - not tournament owner");
      }
    }

    const oldStatus = tournament.status;

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      draft: ["published", "cancelled"],
      published: ["active", "cancelled"],
      active: ["completed"],
      completed: [], // No transitions from completed
    };

    if (!validTransitions[oldStatus]?.includes(args.status)) {
      throw new Error(`Invalid status transition from ${oldStatus} to ${args.status}`);
    }

    // Update tournament
    await ctx.db.patch(args.tournamentId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Log the status change
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "tournament_status_updated",
      entityType: "tournaments",
      entityId: args.tournamentId,
      oldValues: { status: oldStatus },
      newValues: { status: args.status, reason: args.reason },
      timestamp: Date.now(),
      severity: "high",
    });

    return { success: true, oldStatus, newStatus: args.status };
  },
});

// Match Day Operations
export const getMatchDayDashboard = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    // Verify access
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

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check permissions
    if (user.role !== "admin") {
      const club = await ctx.db.get(tournament.clubId);
      if (!club || club.ownerId !== user._id) {
        throw new Error("Access denied - not tournament owner");
      }
    }

    // Get all tournament data for match day
    const squads = await ctx.db
      .query("squads")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    const stages = await ctx.db
      .query("stages")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Get scoring progress for each squad
    const squadProgress = await Promise.all(
      squads.map(async (squad) => {
        const squadRegistrations = registrations.filter(r => r.squadId === squad._id);
        const expectedScores = squadRegistrations.length * stages.length;
        
        let completedScores = 0;
        for (const stage of stages) {
          const stageScores = await ctx.db
            .query("scores")
            .withIndex("by_stage_shooter", (q) => q.eq("stageId", stage._id))
            .collect();
          
          const squadScores = stageScores.filter(score => 
            squadRegistrations.some(reg => reg.shooterId === score.shooterId)
          );
          
          completedScores += squadScores.length;
        }

        // Get assigned SO
        const assignedSO = squad.assignedSO ? await ctx.db.get(squad.assignedSO) : null;

        return {
          squad,
          assignedSO: assignedSO ? {
            _id: assignedSO._id,
            name: assignedSO.name,
            email: assignedSO.email,
          } : null,
          registrations: squadRegistrations,
          progress: {
            expected: expectedScores,
            completed: completedScores,
            percentage: expectedScores > 0 ? Math.round((completedScores / expectedScores) * 100) : 0,
          },
        };
      })
    );

    // Calculate overall tournament progress
    const totalExpected = squadProgress.reduce((sum, sq) => sum + sq.progress.expected, 0);
    const totalCompleted = squadProgress.reduce((sum, sq) => sum + sq.progress.completed, 0);
    const overallProgress = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

    // Get recent scoring activity
    const recentScores = await ctx.db
      .query("scores")
      .order("desc")
      .filter((q) => {
        const stageIds = stages.map(s => s._id);
        return stageIds.some(stageId => q.eq(q.field("stageId"), stageId));
      })
      .take(20);

    // Enrich recent scores with shooter and stage info
    const enrichedRecentScores = await Promise.all(
      recentScores.map(async (score) => {
        const shooter = await ctx.db.get(score.shooterId);
        const stage = stages.find(s => s._id === score.stageId);
        return {
          ...score,
          shooter: shooter ? {
            _id: shooter._id,
            name: shooter.name,
          } : null,
          stage: stage ? {
            _id: stage._id,
            name: stage.name,
            stageNumber: stage.stageNumber,
          } : null,
        };
      })
    );

    return {
      tournament,
      squadProgress,
      stages,
      overallProgress: {
        expected: totalExpected,
        completed: totalCompleted,
        percentage: overallProgress,
      },
      recentActivity: enrichedRecentScores,
      checkedInShooters: registrations.filter(r => r.status === "checked_in").length,
      totalRegistrations: registrations.length,
    };
  },
});

// Bulk Operations for Match Directors
export const bulkUpdateRegistrations = action({
  args: {
    tournamentId: v.id("tournaments"),
    registrationIds: v.array(v.id("registrations")),
    action: v.union(
      v.literal("check_in"),
      v.literal("cancel"),
      v.literal("move_to_waitlist"),
      v.literal("approve_from_waitlist")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const registrationId of args.registrationIds) {
      try {
        let newStatus: "registered" | "waitlist" | "checked_in" | "completed" | "cancelled";
        
        switch (args.action) {
          case "check_in":
            newStatus = "checked_in";
            break;
          case "cancel":
            newStatus = "cancelled";
            break;
          case "move_to_waitlist":
            newStatus = "waitlist";
            break;
          case "approve_from_waitlist":
            newStatus = "registered";
            break;
          default:
            throw new Error("Invalid action");
        }

        await ctx.runMutation(api.matchDirector.updateRegistrationStatus, {
          registrationId,
          status: newStatus,
          reason: args.reason,
        });

        results.push({ registrationId, success: true });
      } catch (error) {
        results.push({ 
          registrationId, 
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