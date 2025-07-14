import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Trigger notifications when scores are posted
export const onScorePosted = internalMutation({
  args: {
    scoreId: v.id("scores"),
    stageId: v.id("stages"),
    shooterId: v.id("users"),
    tournamentId: v.id("tournaments"),
    scoredBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get tournament and stage info
    const tournament = await ctx.db.get(args.tournamentId);
    const stage = await ctx.db.get(args.stageId);
    const shooter = await ctx.db.get(args.shooterId);
    
    if (!tournament || !stage || !shooter) return;

    // Notify the shooter about their score
    await ctx.scheduler.runAfter(0, internal.pushNotifications.sendNotificationToUser, {
      userId: args.shooterId,
      type: "score_posted",
      title: "New Score Posted",
      body: `Your score for ${stage.name} has been recorded`,
      data: {
        tournamentId: args.tournamentId,
        stageId: args.stageId,
        scoreId: args.scoreId,
      },
      priority: "normal",
    });

    // Notify squad members about the score
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .filter((q) => q.eq(q.field("shooterId"), args.shooterId))
      .first();

    if (registration) {
      const squadMembers = await ctx.db
        .query("registrations")
        .withIndex("by_squad", (q) => q.eq("squadId", registration.squadId))
        .filter((q) => q.neq(q.field("shooterId"), args.shooterId))
        .collect();

      for (const member of squadMembers) {
        // Check notification preferences
        const preferences = await ctx.db
          .query("notificationPreferences")
          .withIndex("by_user", (q) => q.eq("userId", member.shooterId))
          .first();

        if (!preferences || preferences.preferences.scoreAlerts) {
          await ctx.scheduler.runAfter(0, internal.pushNotifications.sendNotificationToUser, {
            userId: member.shooterId,
            type: "score_posted",
            title: "Squad Score Update",
            body: `${shooter.name} scored ${stage.name}`,
            data: {
              tournamentId: args.tournamentId,
              stageId: args.stageId,
              shooterId: args.shooterId,
            },
            priority: "low",
          });
        }
      }
    }
  },
});

// Trigger notifications when badges are earned
export const onBadgeEarned = internalMutation({
  args: {
    badgeId: v.id("badges"),
    shooterId: v.id("users"),
    tournamentId: v.id("tournaments"),
    badgeType: v.string(),
    badgeTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const shooter = await ctx.db.get(args.shooterId);
    const tournament = await ctx.db.get(args.tournamentId);
    
    if (!shooter || !tournament) return;

    // Check notification preferences
    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.shooterId))
      .first();

    if (!preferences || preferences.preferences.badgeNotifications) {
      await ctx.scheduler.runAfter(0, internal.pushNotifications.sendNotificationToUser, {
        userId: args.shooterId,
        type: "badge_earned",
        title: "Achievement Unlocked! 🏆",
        body: `You earned "${args.badgeTitle}" at ${tournament.name}`,
        data: {
          badgeId: args.badgeId,
          tournamentId: args.tournamentId,
          badgeType: args.badgeType,
        },
        priority: "high",
      });
    }
  },
});

// Trigger notifications for tournament updates
export const onTournamentUpdate = internalMutation({
  args: {
    tournamentId: v.id("tournaments"),
    updateType: v.union(
      v.literal("registration_open"),
      v.literal("registration_closing"),
      v.literal("schedule_change"),
      v.literal("announcement"),
      v.literal("results_published")
    ),
    title: v.string(),
    message: v.string(),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) return;

    // Get all registered shooters
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Send notifications to all registered shooters
    for (const registration of registrations) {
      // Check notification preferences
      const preferences = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_user", (q) => q.eq("userId", registration.shooterId))
        .first();

      if (!preferences || preferences.preferences.tournamentUpdates) {
        await ctx.scheduler.runAfter(0, internal.pushNotifications.sendNotificationToUser, {
          userId: registration.shooterId,
          type: "tournament_update",
          title: args.title,
          body: args.message,
          data: {
            tournamentId: args.tournamentId,
            updateType: args.updateType,
          },
          priority: args.priority || "normal",
        });
      }
    }

    return registrations.length;
  },
});

// Trigger notifications for score conflicts
export const onScoreConflict = internalMutation({
  args: {
    scoreId: v.id("scores"),
    stageId: v.id("stages"),
    shooterId: v.id("users"),
    tournamentId: v.id("tournaments"),
    conflictType: v.string(),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    const stage = await ctx.db.get(args.stageId);
    const shooter = await ctx.db.get(args.shooterId);
    
    if (!tournament || !stage || !shooter) return;

    // Find Security Officers for this tournament
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    const securityOfficers = [];
    for (const registration of registrations) {
      const user = await ctx.db.get(registration.shooterId);
      if (user && user.role === "securityOfficer") {
        securityOfficers.push(user._id);
      }
    }

    // Also check for club owners and admins
    const club = await ctx.db.get(tournament.clubId);
    if (club) {
      securityOfficers.push(club.ownerId);
    }

    // Send urgent notifications to Security Officers
    for (const officerId of securityOfficers) {
      // Check notification preferences
      const preferences = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_user", (q) => q.eq("userId", officerId))
        .first();

      if (!preferences || preferences.preferences.conflictAlerts) {
        await ctx.scheduler.runAfter(0, internal.pushNotifications.sendNotificationToUser, {
          userId: officerId,
          type: "conflict_alert",
          title: "Score Conflict Detected",
          body: `Conflict in ${shooter.name}'s score for ${stage.name}`,
          data: {
            tournamentId: args.tournamentId,
            stageId: args.stageId,
            scoreId: args.scoreId,
            shooterId: args.shooterId,
            conflictType: args.conflictType,
          },
          priority: "urgent",
        });
      }
    }
  },
});

// Trigger notifications for stage completions
export const onStageCompleted = internalMutation({
  args: {
    stageId: v.id("stages"),
    tournamentId: v.id("tournaments"),
    squadId: v.id("squads"),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    const stage = await ctx.db.get(args.stageId);
    const squad = await ctx.db.get(args.squadId);
    
    if (!tournament || !stage || !squad) return;

    // Get squad members
    const squadMembers = await ctx.db
      .query("registrations")
      .withIndex("by_squad", (q) => q.eq("squadId", args.squadId))
      .collect();

    // Notify squad members that stage is complete
    for (const member of squadMembers) {
      // Check notification preferences
      const preferences = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_user", (q) => q.eq("userId", member.shooterId))
        .first();

      if (!preferences || preferences.preferences.scoreAlerts) {
        await ctx.scheduler.runAfter(0, internal.pushNotifications.sendNotificationToUser, {
          userId: member.shooterId,
          type: "stage_completed",
          title: "Stage Complete",
          body: `${stage.name} scoring complete for ${squad.name}`,
          data: {
            tournamentId: args.tournamentId,
            stageId: args.stageId,
            squadId: args.squadId,
          },
          priority: "normal",
        });
      }
    }
  },
});

// Trigger notifications for registration reminders
export const sendRegistrationReminder = internalMutation({
  args: {
    tournamentId: v.id("tournaments"),
    hoursUntilClose: v.number(),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) return;

    // Find users who might be interested but haven't registered
    // For now, we'll send to all users with tournament notification preferences
    const allUsers = await ctx.db.query("users").collect();
    
    let sentCount = 0;

    for (const user of allUsers) {
      // Check if user is already registered
      const existingRegistration = await ctx.db
        .query("registrations")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
        .filter((q) => q.eq(q.field("shooterId"), user._id))
        .first();

      if (existingRegistration) continue;

      // Check notification preferences
      const preferences = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();

      if (!preferences || preferences.preferences.tournamentUpdates) {
        await ctx.scheduler.runAfter(0, internal.pushNotifications.sendNotificationToUser, {
          userId: user._id,
          type: "registration_reminder",
          title: "Registration Closing Soon",
          body: `Only ${args.hoursUntilClose} hours left to register for ${tournament.name}`,
          data: {
            tournamentId: args.tournamentId,
            hoursUntilClose: args.hoursUntilClose,
          },
          priority: "normal",
          expiresIn: args.hoursUntilClose * 60 * 60 * 1000, // Expire when registration closes
        });
        sentCount++;
      }
    }

    return sentCount;
  },
});

// Trigger notifications for final results
export const onFinalResults = internalMutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) return;

    // Get all registered shooters
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Send notifications to all registered shooters
    for (const registration of registrations) {
      // Check notification preferences
      const preferences = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_user", (q) => q.eq("userId", registration.shooterId))
        .first();

      if (!preferences || preferences.preferences.scoreAlerts) {
        await ctx.scheduler.runAfter(0, internal.pushNotifications.sendNotificationToUser, {
          userId: registration.shooterId,
          type: "final_results",
          title: "Final Results Available",
          body: `Final results for ${tournament.name} are now available`,
          data: {
            tournamentId: args.tournamentId,
          },
          priority: "high",
        });
      }
    }

    return registrations.length;
  },
});

// System update notifications
export const sendSystemUpdate = internalMutation({
  args: {
    title: v.string(),
    message: v.string(),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
    targetRoles: v.optional(v.array(v.union(
      v.literal("admin"),
      v.literal("clubOwner"),
      v.literal("securityOfficer"),
      v.literal("shooter")
    ))),
  },
  handler: async (ctx, args) => {
    // Get users based on target roles (if specified)
    let users = await ctx.db.query("users").collect();
    
    if (args.targetRoles && args.targetRoles.length > 0) {
      users = users.filter(user => 
        user.role && args.targetRoles!.includes(user.role)
      );
    }

    let sentCount = 0;

    for (const user of users) {
      // Check notification preferences
      const preferences = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();

      if (!preferences || preferences.preferences.systemUpdates) {
        await ctx.scheduler.runAfter(0, internal.pushNotifications.sendNotificationToUser, {
          userId: user._id,
          type: "system_update",
          title: args.title,
          body: args.message,
          data: {
            systemUpdate: true,
          },
          priority: args.priority || "normal",
        });
        sentCount++;
      }
    }

    return sentCount;
  },
});