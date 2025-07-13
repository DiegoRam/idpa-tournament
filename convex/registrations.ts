import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Register for tournament
export const registerForTournament = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    shooterId: v.id("users"),
    squadId: v.id("squads"),
    division: v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    ),
    classification: v.union(
      v.literal("MA"), v.literal("EX"), v.literal("SS"), 
      v.literal("MM"), v.literal("NV"), v.literal("UN")
    ),
    customCategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check if tournament exists and is published
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "published") {
      throw new Error("Tournament is not open for registration");
    }

    // Check registration window
    const now = Date.now();
    if (now < tournament.registrationOpens) {
      throw new Error("Registration has not opened yet");
    }

    if (now > tournament.registrationCloses) {
      throw new Error("Registration has closed");
    }

    // Check if division is allowed in tournament
    if (!tournament.divisions.includes(args.division)) {
      throw new Error("Division not allowed in this tournament");
    }

    // Check if user exists
    const shooter = await ctx.db.get(args.shooterId);
    if (!shooter) {
      throw new Error("Shooter not found");
    }

    // Check if already registered
    const existingRegistration = await ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .filter((q) => q.eq(q.field("shooterId"), args.shooterId))
      .first();

    if (existingRegistration) {
      throw new Error("Already registered for this tournament");
    }

    // Check squad availability
    const squad = await ctx.db.get(args.squadId);
    if (!squad) {
      throw new Error("Squad not found");
    }

    if (squad.tournamentId !== args.tournamentId) {
      throw new Error("Squad does not belong to this tournament");
    }

    let registrationStatus: "registered" | "waitlist" = "registered";

    // Check squad capacity
    if (squad.status === "closed") {
      throw new Error("Squad is closed for registration");
    }

    if (squad.currentShooters >= squad.maxShooters) {
      registrationStatus = "waitlist";
    }

    // Validate custom categories
    const validCategories = tournament.customCategories.map(cat => cat.id);
    const invalidCategories = (args.customCategories || []).filter(catId => 
      !validCategories.includes(catId)
    );

    if (invalidCategories.length > 0) {
      throw new Error(`Invalid custom categories: ${invalidCategories.join(", ")}`);
    }

    // Create registration
    const registrationId = await ctx.db.insert("registrations", {
      tournamentId: args.tournamentId,
      shooterId: args.shooterId,
      squadId: args.squadId,
      division: args.division,
      classification: args.classification,
      customCategories: args.customCategories || [],
      status: registrationStatus,
      paymentStatus: "pending",
      registeredAt: now,
    });

    // Update squad count if registered (not waitlisted)
    if (registrationStatus === "registered") {
      const newCount = squad.currentShooters + 1;
      const newStatus = newCount >= squad.maxShooters ? "full" : "open";

      await ctx.db.patch(args.squadId, {
        currentShooters: newCount,
        status: newStatus,
      });
    }

    return {
      registrationId,
      status: registrationStatus,
    };
  },
});

// Cancel registration
export const cancelRegistration = mutation({
  args: {
    registrationId: v.id("registrations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    // Check if user owns this registration
    if (registration.shooterId !== args.userId) {
      throw new Error("Not authorized to cancel this registration");
    }

    // Check if tournament allows cancellation
    const tournament = await ctx.db.get(registration.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status === "active" || tournament.status === "completed") {
      throw new Error("Cannot cancel registration for active or completed tournament");
    }

    // Update registration status
    await ctx.db.patch(args.registrationId, {
      status: "cancelled",
    });

    // If this was a registered participant, update squad count and promote waitlist
    if (registration.status === "registered") {
      const squad = await ctx.db.get(registration.squadId);
      if (squad) {
        const newCount = Math.max(0, squad.currentShooters - 1);
        await ctx.db.patch(registration.squadId, {
          currentShooters: newCount,
          status: "open", // Squad is now open since someone left
        });

        // Promote first person from waitlist
        await promoteFromWaitlist(ctx, registration.squadId);
      }
    }

    return { success: true };
  },
});

// Transfer to different squad
export const transferSquad = mutation({
  args: {
    registrationId: v.id("registrations"),
    newSquadId: v.id("squads"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    // Check if user owns this registration
    if (registration.shooterId !== args.userId) {
      throw new Error("Not authorized to transfer this registration");
    }

    if (registration.status !== "registered") {
      throw new Error("Can only transfer active registrations");
    }

    // Check new squad availability
    const newSquad = await ctx.db.get(args.newSquadId);
    if (!newSquad) {
      throw new Error("Target squad not found");
    }

    if (newSquad.tournamentId !== registration.tournamentId) {
      throw new Error("Target squad must be in the same tournament");
    }

    if (newSquad.status === "closed") {
      throw new Error("Target squad is closed");
    }

    if (newSquad.currentShooters >= newSquad.maxShooters) {
      throw new Error("Target squad is full");
    }

    const oldSquad = await ctx.db.get(registration.squadId);
    
    // Update registration
    await ctx.db.patch(args.registrationId, {
      squadId: args.newSquadId,
    });

    // Update old squad count
    if (oldSquad) {
      const oldNewCount = Math.max(0, oldSquad.currentShooters - 1);
      await ctx.db.patch(registration.squadId, {
        currentShooters: oldNewCount,
        status: "open",
      });

      // Promote from waitlist in old squad
      await promoteFromWaitlist(ctx, registration.squadId);
    }

    // Update new squad count
    const newCount = newSquad.currentShooters + 1;
    const newStatus = newCount >= newSquad.maxShooters ? "full" : "open";
    
    await ctx.db.patch(args.newSquadId, {
      currentShooters: newCount,
      status: newStatus,
    });

    return { success: true };
  },
});

// Check in shooter
export const checkInShooter = mutation({
  args: {
    registrationId: v.id("registrations"),
    verifyDivision: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
    verifyClassification: v.optional(v.union(
      v.literal("MA"), v.literal("EX"), v.literal("SS"), 
      v.literal("MM"), v.literal("NV"), v.literal("UN")
    )),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.status !== "registered") {
      throw new Error("Can only check in registered participants");
    }

    if (registration.checkedInAt) {
      throw new Error("Shooter already checked in");
    }

    // Verify division and classification if provided
    const updates: any = {
      status: "checked_in",
      checkedInAt: Date.now(),
    };

    if (args.verifyDivision && args.verifyDivision !== registration.division) {
      updates.division = args.verifyDivision;
    }

    if (args.verifyClassification && args.verifyClassification !== registration.classification) {
      updates.classification = args.verifyClassification;
    }

    await ctx.db.patch(args.registrationId, updates);

    return await ctx.db.get(args.registrationId);
  },
});

// Get registrations for a tournament
export const getRegistrationsByTournament = query({
  args: {
    tournamentId: v.id("tournaments"),
    status: v.optional(v.union(
      v.literal("registered"), 
      v.literal("waitlist"), 
      v.literal("checked_in"), 
      v.literal("completed"), 
      v.literal("cancelled")
    )),
    division: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId));

    let registrations = await query.collect();

    // Filter by status if specified
    if (args.status) {
      registrations = registrations.filter(reg => reg.status === args.status);
    }

    // Filter by division if specified
    if (args.division) {
      registrations = registrations.filter(reg => reg.division === args.division);
    }

    return registrations;
  },
});

// Get registration by user and tournament
export const getRegistrationByUserAndTournament = query({
  args: {
    userId: v.id("users"),
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .filter((q) => q.eq(q.field("shooterId"), args.userId))
      .first();
  },
});

// Get registrations for a user
export const getRegistrationsByUser = query({
  args: { 
    userId: v.id("users"),
    status: v.optional(v.union(
      v.literal("registered"), 
      v.literal("waitlist"), 
      v.literal("checked_in"), 
      v.literal("completed"), 
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    let registrations = await ctx.db
      .query("registrations")
      .withIndex("by_shooter", (q) => q.eq("shooterId", args.userId))
      .collect();

    // Filter by status if specified
    if (args.status) {
      registrations = registrations.filter(reg => reg.status === args.status);
    }

    return registrations.sort((a, b) => b.registeredAt - a.registeredAt);
  },
});

// Helper function to promote from waitlist
async function promoteFromWaitlist(ctx: any, squadId: string) {
  // Find first person in waitlist for this squad
  const waitlistRegistration = await ctx.db
    .query("registrations")
    .withIndex("by_squad", (q: any) => q.eq("squadId", squadId))
    .filter((q: any) => q.eq(q.field("status"), "waitlist"))
    .order("asc")
    .first();

  if (waitlistRegistration) {
    const squad = await ctx.db.get(squadId);
    if (squad && squad.currentShooters < squad.maxShooters) {
      // Promote from waitlist
      await ctx.db.patch(waitlistRegistration._id, {
        status: "registered",
      });

      // Update squad count
      const newCount = squad.currentShooters + 1;
      const newStatus = newCount >= squad.maxShooters ? "full" : "open";

      await ctx.db.patch(squadId, {
        currentShooters: newCount,
        status: newStatus,
      });
    }
  }
}

// Get waitlist position
export const getWaitlistPosition = query({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration || registration.status !== "waitlist") {
      return null;
    }

    // Get all waitlist registrations for the same squad, ordered by registration time
    const waitlistRegistrations = await ctx.db
      .query("registrations")
      .withIndex("by_squad", (q) => q.eq("squadId", registration.squadId))
      .filter((q) => q.eq(q.field("status"), "waitlist"))
      .collect();

    // Sort by registration time and find position
    const sortedWaitlist = waitlistRegistrations
      .sort((a, b) => a.registeredAt - b.registeredAt);

    const position = sortedWaitlist.findIndex(reg => reg._id === args.registrationId) + 1;

    return {
      position,
      totalWaitlisted: sortedWaitlist.length,
    };
  },
});