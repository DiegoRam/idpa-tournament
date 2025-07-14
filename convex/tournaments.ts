import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new tournament
export const createTournament = mutation({
  args: {
    name: v.string(),
    clubId: v.id("clubs"),
    date: v.number(),
    registrationOpens: v.number(),
    registrationCloses: v.number(),
    location: v.object({
      venue: v.string(),
      address: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    }),
    matchType: v.string(),
    divisions: v.array(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
    customCategories: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      eligibilityCriteria: v.optional(v.string()),
    }))),
    entryFee: v.number(),
    currency: v.string(),
    capacity: v.number(),
    squadConfig: v.object({
      numberOfSquads: v.number(),
      maxShootersPerSquad: v.number(),
    }),
    description: v.optional(v.string()),
    rules: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify the club exists
    const club = await ctx.db.get(args.clubId);
    if (!club) {
      throw new Error("Club not found");
    }

    // Validate dates
    if (args.registrationOpens >= args.registrationCloses) {
      throw new Error("Registration open date must be before close date");
    }

    if (args.registrationCloses >= args.date) {
      throw new Error("Registration must close before tournament date");
    }

    // Validate squad configuration
    if (args.squadConfig.numberOfSquads * args.squadConfig.maxShootersPerSquad < args.capacity) {
      throw new Error("Squad configuration cannot accommodate tournament capacity");
    }

    const now = Date.now();

    const tournamentId = await ctx.db.insert("tournaments", {
      name: args.name,
      clubId: args.clubId,
      date: args.date,
      registrationOpens: args.registrationOpens,
      registrationCloses: args.registrationCloses,
      location: args.location,
      matchType: args.matchType,
      divisions: args.divisions,
      customCategories: args.customCategories || [],
      entryFee: args.entryFee,
      currency: args.currency,
      capacity: args.capacity,
      squadConfig: args.squadConfig,
      status: "draft",
      description: args.description,
      rules: args.rules,
      createdAt: now,
      updatedAt: now,
    });

    // Create squads for the tournament
    const squadPromises = [];
    for (let i = 1; i <= args.squadConfig.numberOfSquads; i++) {
      squadPromises.push(
        ctx.db.insert("squads", {
          tournamentId,
          name: `Squad ${String.fromCharCode(64 + i)}`, // Squad A, B, C, etc.
          timeSlot: `TBD`, // To be determined later
          maxShooters: args.squadConfig.maxShootersPerSquad,
          currentShooters: 0,
          status: "open",
          createdAt: now,
        })
      );
    }

    await Promise.all(squadPromises);

    return tournamentId;
  },
});

// Get tournament by ID
export const getTournamentById = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tournamentId);
  },
});

// Get tournaments by club
export const getTournamentsByClub = query({
  args: { 
    clubId: v.id("clubs"),
    status: v.optional(v.union(
      v.literal("draft"), 
      v.literal("published"), 
      v.literal("active"), 
      v.literal("completed")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("tournaments").withIndex("by_club", (q) => q.eq("clubId", args.clubId));
    
    const tournaments = await query.collect();
    
    if (args.status) {
      return tournaments.filter(tournament => tournament.status === args.status);
    }
    
    return tournaments.sort((a, b) => b.date - a.date); // Most recent first
  },
});

// Get upcoming tournaments (calendar view)
export const getUpcomingTournaments = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    division: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
    maxDistance: v.optional(v.number()),
    userLocation: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const startDate = args.startDate || now;
    const endDate = args.endDate || (now + (365 * 24 * 60 * 60 * 1000)); // 1 year from now

    // Get published tournaments in date range
    let tournaments = await ctx.db
      .query("tournaments")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Filter by date range
    tournaments = tournaments.filter(tournament => 
      tournament.date >= startDate && tournament.date <= endDate
    );

    // Filter by division if specified
    if (args.division) {
      tournaments = tournaments.filter(tournament => 
        tournament.divisions.includes(args.division!)
      );
    }

    // Calculate distance and filter if location provided
    if (args.userLocation && args.maxDistance) {
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      tournaments = tournaments
        .map(tournament => ({
          ...tournament,
          distance: calculateDistance(
            args.userLocation!.lat,
            args.userLocation!.lng,
            tournament.location.coordinates.lat,
            tournament.location.coordinates.lng
          )
        }))
        .filter(tournament => tournament.distance <= args.maxDistance!);
    }

    return tournaments.sort((a, b) => a.date - b.date);
  },
});

// Update tournament
export const updateTournament = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    name: v.optional(v.string()),
    date: v.optional(v.number()),
    registrationOpens: v.optional(v.number()),
    registrationCloses: v.optional(v.number()),
    location: v.optional(v.object({
      venue: v.string(),
      address: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    })),
    divisions: v.optional(v.array(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    ))),
    customCategories: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      eligibilityCriteria: v.optional(v.string()),
    }))),
    entryFee: v.optional(v.number()),
    capacity: v.optional(v.number()),
    description: v.optional(v.string()),
    rules: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tournamentId, ...updates } = args;
    
    const tournament = await ctx.db.get(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Only allow updates if tournament is in draft status
    if (tournament.status !== "draft") {
      throw new Error("Can only update tournaments in draft status");
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(tournamentId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(tournamentId);
  },
});

// Publish tournament (make it visible for registration)
export const publishTournament = mutation({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "draft") {
      throw new Error("Tournament must be in draft status to publish");
    }

    // Validate tournament has required information
    if (tournament.divisions.length === 0) {
      throw new Error("Tournament must have at least one division");
    }

    const now = Date.now();
    
    // Validate dates are still valid
    if (tournament.registrationOpens <= now) {
      throw new Error("Registration open date must be in the future");
    }

    await ctx.db.patch(args.tournamentId, {
      status: "published",
      updatedAt: now,
    });

    return await ctx.db.get(args.tournamentId);
  },
});

// Start tournament (make it active)
export const startTournament = mutation({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "published") {
      throw new Error("Tournament must be published to start");
    }

    await ctx.db.patch(args.tournamentId, {
      status: "active",
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.tournamentId);
  },
});

// Complete tournament
export const completeTournament = mutation({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "active") {
      throw new Error("Tournament must be active to complete");
    }

    await ctx.db.patch(args.tournamentId, {
      status: "completed",
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.tournamentId);
  },
});

// Get tournament registration statistics
export const getTournamentStats = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Get all registrations for this tournament
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Get squads for this tournament
    const squads = await ctx.db
      .query("squads")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Calculate stats
    const totalRegistered = registrations.filter(r => r.status === "registered").length;
    const totalWaitlisted = registrations.filter(r => r.status === "waitlist").length;
    const totalCheckedIn = registrations.filter(r => r.status === "checked_in").length;

    // Stats by division
    const divisionStats = tournament.divisions.map(division => {
      const divisionRegistrations = registrations.filter(r => 
        r.division === division && r.status === "registered"
      );
      return {
        division,
        count: divisionRegistrations.length,
        classifications: {
          MA: divisionRegistrations.filter(r => r.classification === "MA").length,
          EX: divisionRegistrations.filter(r => r.classification === "EX").length,
          SS: divisionRegistrations.filter(r => r.classification === "SS").length,
          MM: divisionRegistrations.filter(r => r.classification === "MM").length,
          NV: divisionRegistrations.filter(r => r.classification === "NV").length,
          UN: divisionRegistrations.filter(r => r.classification === "UN").length,
        }
      };
    });

    // Squad fill rates
    const squadStats = squads.map(squad => ({
      squadId: squad._id,
      name: squad.name,
      filled: squad.currentShooters,
      capacity: squad.maxShooters,
      fillRate: (squad.currentShooters / squad.maxShooters) * 100,
      status: squad.status,
    }));

    return {
      tournament,
      registrationSummary: {
        totalRegistered,
        totalWaitlisted,
        totalCheckedIn,
        capacity: tournament.capacity,
        fillRate: (totalRegistered / tournament.capacity) * 100,
      },
      divisionStats,
      squadStats,
    };
  },
});

// Get tournaments with basic capacity info
export const getTournamentsWithCapacity = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"), 
      v.literal("published"), 
      v.literal("active"), 
      v.literal("completed")
    )),
  },
  handler: async (ctx, args) => {
    let tournaments = await ctx.db.query("tournaments").collect();
    
    // Filter by status if specified
    if (args.status) {
      tournaments = tournaments.filter(tournament => tournament.status === args.status);
    }
    
    // Get registration counts for each tournament
    const tournamentsWithCapacity = await Promise.all(
      tournaments.map(async (tournament) => {
        const registrations = await ctx.db
          .query("registrations")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
          .filter((q) => q.eq(q.field("status"), "registered"))
          .collect();
        
        const squads = await ctx.db
          .query("squads")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
          .collect();
        
        const openSquads = squads.filter(squad => squad.status === "open").length;
        const totalSquads = squads.length;
        
        return {
          ...tournament,
          registeredCount: registrations.length,
          availableSpots: tournament.capacity - registrations.length,
          openSquads,
          totalSquads
        };
      })
    );
    
    return tournamentsWithCapacity.sort((a, b) => a.date - b.date);
  },
});

// Search tournaments
export const searchTournaments = query({
  args: {
    searchTerm: v.string(),
    status: v.optional(v.union(
      v.literal("draft"), 
      v.literal("published"), 
      v.literal("active"), 
      v.literal("completed")
    )),
    division: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
  },
  handler: async (ctx, args) => {
    let tournaments = await ctx.db.query("tournaments").collect();
    
    // Filter by status if specified
    if (args.status) {
      tournaments = tournaments.filter(tournament => tournament.status === args.status);
    }
    
    // Filter by division if specified
    if (args.division) {
      tournaments = tournaments.filter(tournament => 
        tournament.divisions.includes(args.division!)
      );
    }
    
    // Search by name, venue, or location
    const searchTerm = args.searchTerm.toLowerCase();
    return tournaments.filter(tournament => 
      tournament.name.toLowerCase().includes(searchTerm) ||
      tournament.location.venue.toLowerCase().includes(searchTerm) ||
      tournament.location.address.toLowerCase().includes(searchTerm) ||
      tournament.matchType.toLowerCase().includes(searchTerm)
    );
  },
});