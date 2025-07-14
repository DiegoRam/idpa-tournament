import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get squads for a tournament
export const getSquadsByTournament = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("squads")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
  },
});

// Get squads for a tournament with detailed information including SO names
export const getSquadsByTournamentWithDetails = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const squads = await ctx.db
      .query("squads")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Get detailed squad information including SO names
    const squadsWithDetails = await Promise.all(
      squads.map(async (squad) => {
        let assignedSOName: string | undefined;
        
        if (squad.assignedSO) {
          const so = await ctx.db.get(squad.assignedSO);
          assignedSOName = so?.name;
        }

        return {
          ...squad,
          assignedSOName
        };
      })
    );

    return squadsWithDetails.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Get squad by ID
export const getSquadById = query({
  args: { squadId: v.id("squads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.squadId);
  },
});

// Get squads with member details
export const getSquadsWithMembers = query({
  args: {
    tournamentId: v.id("tournaments"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Get all squads for the tournament
    const squads = await ctx.db
      .query("squads")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Get all registrations for this tournament
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .filter((q) => q.eq(q.field("status"), "registered"))
      .collect();

    // Get user details and check friendships if userId provided
    let userFriends: string[] = [];
    let userClubId: string | undefined;
    
    if (args.userId) {
      const user = await ctx.db.get(args.userId);
      if (user) {
        userFriends = user.friends;
        userClubId = user.clubId;
      }
    }

    // For each squad, get member details
    const squadsWithMembers = await Promise.all(
      squads.map(async (squad) => {
        const squadRegistrations = registrations.filter(r => r.squadId === squad._id);
        
        const members = await Promise.all(
          squadRegistrations.map(async (registration) => {
            const shooter = await ctx.db.get(registration.shooterId);
            if (!shooter) return null;

            return {
              userId: shooter._id,
              name: shooter.name,
              division: registration.division,
              classification: registration.classification,
              clubId: shooter.clubId,
              isFriend: userFriends.includes(shooter._id),
              isClubmate: userClubId === shooter.clubId,
              profilePicture: shooter.profilePicture,
            };
          })
        );

        return {
          ...squad,
          members: members.filter(member => member !== null),
          availableSlots: squad.maxShooters - squad.currentShooters,
        };
      })
    );

    return squadsWithMembers.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Update squad information
export const updateSquad = mutation({
  args: {
    squadId: v.id("squads"),
    name: v.optional(v.string()),
    timeSlot: v.optional(v.string()),
    maxShooters: v.optional(v.number()),
    assignedSO: v.optional(v.id("users")),
    status: v.optional(v.union(
      v.literal("open"), 
      v.literal("full"), 
      v.literal("closed")
    )),
  },
  handler: async (ctx, args) => {
    const { squadId, ...updates } = args;
    
    const squad = await ctx.db.get(squadId);
    if (!squad) {
      throw new Error("Squad not found");
    }

    // If changing maxShooters, validate it's not less than current shooters
    if (updates.maxShooters !== undefined && updates.maxShooters < squad.currentShooters) {
      throw new Error("Cannot reduce max shooters below current shooter count");
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(squadId, filteredUpdates);

    // Update status based on capacity if maxShooters was changed
    if (updates.maxShooters !== undefined) {
      const newMaxShooters = updates.maxShooters;
      let newStatus = squad.status;
      
      if (squad.currentShooters >= newMaxShooters) {
        newStatus = "full";
      } else if (squad.status === "full" && squad.currentShooters < newMaxShooters) {
        newStatus = "open";
      }

      if (newStatus !== squad.status) {
        await ctx.db.patch(squadId, { status: newStatus });
      }
    }

    return await ctx.db.get(squadId);
  },
});

// Assign Security Officer to squad
export const assignSOToSquad = mutation({
  args: {
    squadId: v.id("squads"),
    securityOfficerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const squad = await ctx.db.get(args.squadId);
    const so = await ctx.db.get(args.securityOfficerId);

    if (!squad || !so) {
      throw new Error("Squad or Security Officer not found");
    }

    if (so.role !== "securityOfficer" && so.role !== "admin") {
      throw new Error("User must be a Security Officer or Admin");
    }

    await ctx.db.patch(args.squadId, {
      assignedSO: args.securityOfficerId,
    });

    return await ctx.db.get(args.squadId);
  },
});

// Remove Security Officer from squad
export const removeSOFromSquad = mutation({
  args: { squadId: v.id("squads") },
  handler: async (ctx, args) => {
    const squad = await ctx.db.get(args.squadId);
    if (!squad) {
      throw new Error("Squad not found");
    }

    await ctx.db.patch(args.squadId, {
      assignedSO: undefined,
    });

    return await ctx.db.get(args.squadId);
  },
});

// Get squads assigned to a Security Officer
export const getSquadsBySecurityOfficer = query({
  args: { 
    securityOfficerId: v.id("users"),
    tournamentId: v.optional(v.id("tournaments")),
  },
  handler: async (ctx, args) => {
    let squads = await ctx.db.query("squads").collect();
    
    // Filter by assigned SO
    squads = squads.filter(squad => squad.assignedSO === args.securityOfficerId);
    
    // Filter by tournament if specified
    if (args.tournamentId) {
      squads = squads.filter(squad => squad.tournamentId === args.tournamentId);
    }
    
    return squads;
  },
});

// Get available squads for registration
export const getAvailableSquads = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const squads = await ctx.db
      .query("squads")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Only return open squads with available slots
    return squads
      .filter(squad => squad.status === "open" && squad.currentShooters < squad.maxShooters)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Close squad for registration
export const closeSquad = mutation({
  args: { squadId: v.id("squads") },
  handler: async (ctx, args) => {
    const squad = await ctx.db.get(args.squadId);
    if (!squad) {
      throw new Error("Squad not found");
    }

    await ctx.db.patch(args.squadId, {
      status: "closed",
    });

    return await ctx.db.get(args.squadId);
  },
});

// Open squad for registration
export const openSquad = mutation({
  args: { squadId: v.id("squads") },
  handler: async (ctx, args) => {
    const squad = await ctx.db.get(args.squadId);
    if (!squad) {
      throw new Error("Squad not found");
    }

    // Check if squad has capacity
    const status = squad.currentShooters >= squad.maxShooters ? "full" : "open";

    await ctx.db.patch(args.squadId, {
      status,
    });

    return await ctx.db.get(args.squadId);
  },
});

// Get squad roster for Security Officer
export const getSquadRoster = query({
  args: { squadId: v.id("squads") },
  handler: async (ctx, args) => {
    const squad = await ctx.db.get(args.squadId);
    if (!squad) {
      throw new Error("Squad not found");
    }

    // Get all registrations for this squad
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_squad", (q) => q.eq("squadId", args.squadId))
      .filter((q) => q.eq(q.field("status"), "registered"))
      .collect();

    // Get shooter details
    const roster = await Promise.all(
      registrations.map(async (registration) => {
        const shooter = await ctx.db.get(registration.shooterId);
        if (!shooter) return null;

        return {
          registrationId: registration._id,
          shooterId: shooter._id,
          name: shooter.name,
          email: shooter.email,
          idpaMemberNumber: shooter.idpaMemberNumber,
          division: registration.division,
          classification: registration.classification,
          customCategories: registration.customCategories,
          checkedIn: registration.status === "checked_in",
          checkedInAt: registration.checkedInAt,
        };
      })
    );

    return {
      squad,
      roster: roster.filter(entry => entry !== null),
    };
  },
});