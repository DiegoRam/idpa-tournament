import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";


// Badge Types
const badgeTypes = v.union(
  v.literal("participation"),
  v.literal("division_winner"),
  v.literal("class_winner"),
  v.literal("category_winner"),
  v.literal("stage_winner"),
  v.literal("personal_best"),
  v.literal("clean_stage"),
  v.literal("top_10_percent"),
  v.literal("most_improved"),
  v.literal("high_overall")
);

// Generate a unique verification code
function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new badge
export const createBadge = mutation({
  args: {
    shooterId: v.id("users"),
    tournamentId: v.id("tournaments"),
    type: badgeTypes,
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    thumbnailUrl: v.string(),
    metadata: v.object({
      division: v.optional(v.string()),
      classification: v.optional(v.string()),
      category: v.optional(v.string()),
      placement: v.optional(v.number()),
      score: v.optional(v.number()),
      stageNumber: v.optional(v.number()),
      improvement: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const verificationCode = generateVerificationCode();
    
    // Check if badge already exists to prevent duplicates
    const existingBadge = await ctx.db
      .query("badges")
      .withIndex("by_shooter_tournament_type", (q) =>
        q.eq("shooterId", args.shooterId)
         .eq("tournamentId", args.tournamentId)
         .eq("type", args.type)
      )
      .first();

    if (existingBadge) {
      return existingBadge._id;
    }

    const badgeId = await ctx.db.insert("badges", {
      ...args,
      verificationCode,
      shareCount: 0,
      createdAt: Date.now(),
    });

    // Trigger badge earned notification
    await ctx.scheduler.runAfter(0, internal.notificationTriggers.onBadgeEarned, {
      badgeId,
      shooterId: args.shooterId,
      tournamentId: args.tournamentId,
      badgeType: args.type,
      badgeTitle: args.title,
    });

    return badgeId;
  },
});

// Get badges for a specific shooter
export const getBadgesByShooter = query({
  args: {
    shooterId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const badges = await ctx.db
      .query("badges")
      .withIndex("by_shooter", (q) => q.eq("shooterId", args.shooterId))
      .order("desc")
      .take(args.limit || 50);

    // Get tournament details for each badge
    const badgesWithTournament = await Promise.all(
      badges.map(async (badge) => {
        const tournament = await ctx.db.get(badge.tournamentId);
        return {
          ...badge,
          tournament: tournament ? {
            name: tournament.name,
            date: tournament.date,
            location: tournament.location,
          } : null,
        };
      })
    );

    return badgesWithTournament;
  },
});

// Get badges for a specific tournament
export const getBadgesByTournament = query({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const badges = await ctx.db
      .query("badges")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Get shooter details for each badge
    const badgesWithShooter = await Promise.all(
      badges.map(async (badge) => {
        const shooter = await ctx.db.get(badge.shooterId);
        return {
          ...badge,
          shooter: shooter ? {
            name: shooter.name,
            email: shooter.email,
          } : null,
        };
      })
    );

    return badgesWithShooter;
  },
});

// Get a specific badge by ID
export const getBadgeById = query({
  args: {
    badgeId: v.id("badges"),
  },
  handler: async (ctx, args) => {
    const badge = await ctx.db.get(args.badgeId);
    if (!badge) return null;

    const shooter = await ctx.db.get(badge.shooterId);
    const tournament = await ctx.db.get(badge.tournamentId);

    return {
      ...badge,
      shooter: shooter ? {
        name: shooter.name,
        email: shooter.email,
      } : null,
      tournament: tournament ? {
        name: tournament.name,
        date: tournament.date,
        location: tournament.location,
      } : null,
    };
  },
});

// Get badge by verification code (for public verification)
export const getBadgeByVerificationCode = query({
  args: {
    verificationCode: v.string(),
  },
  handler: async (ctx, args) => {
    const badge = await ctx.db
      .query("badges")
      .withIndex("by_verification_code", (q) => 
        q.eq("verificationCode", args.verificationCode)
      )
      .first();

    if (!badge) return null;

    const shooter = await ctx.db.get(badge.shooterId);
    const tournament = await ctx.db.get(badge.tournamentId);

    return {
      ...badge,
      shooter: shooter ? {
        name: shooter.name,
        // Don't expose email for public verification
      } : null,
      tournament: tournament ? {
        name: tournament.name,
        date: tournament.date,
        location: tournament.location,
      } : null,
    };
  },
});

// Update badge share count
export const incrementShareCount = mutation({
  args: {
    badgeId: v.id("badges"),
  },
  handler: async (ctx, args) => {
    const badge = await ctx.db.get(args.badgeId);
    if (!badge) throw new Error("Badge not found");

    await ctx.db.patch(args.badgeId, {
      shareCount: (badge.shareCount || 0) + 1,
    });
  },
});

// Generate achievement badges automatically after tournament completion
// Internal mutation to create badges in bulk
export const createBadgesInBulk = mutation({
  args: {
    badges: v.array(v.object({
      shooterId: v.id("users"),
      tournamentId: v.id("tournaments"),
      type: badgeTypes,
      title: v.string(),
      description: v.string(),
      metadata: v.optional(v.object({
        division: v.optional(v.string()),
        classification: v.optional(v.string()),
        placement: v.optional(v.number()),
        score: v.optional(v.number()),
      })),
    })),
  },
  handler: async (ctx, args) => {
    const badgeIds = [];
    for (const badge of args.badges) {
      const id = await ctx.db.insert("badges", {
        shooterId: badge.shooterId,
        tournamentId: badge.tournamentId,
        type: badge.type,
        title: badge.title,
        description: badge.description,
        imageUrl: "",
        thumbnailUrl: "",
        metadata: badge.metadata || {},
        verificationCode: generateVerificationCode(),
        shareCount: 0,
        createdAt: Date.now(),
      });
      badgeIds.push(id);
    }
    return badgeIds;
  },
});

export const generateTournamentBadges: any = action({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    // Get tournament and all registrations
    const tournament = await ctx.runQuery(api.tournaments.getTournamentById, {
      tournamentId: args.tournamentId,
    });

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const registrations = await ctx.runQuery(api.registrations.getRegistrationsByTournament, {
      tournamentId: args.tournamentId,
    });

    if (!registrations || registrations.length === 0) {
      return { message: "No registrations found for tournament" };
    }

    // Get overall rankings
    const rankings = await ctx.runQuery(api.scoring.calculateOverallRankings, {
      tournamentId: args.tournamentId,
    });

    const badgesToCreate = [];

    // Generate participation badges for all shooters
    for (const registration of registrations) {
      if (registration.status === "checked_in") {
        badgesToCreate.push({
          shooterId: registration.shooterId,
          tournamentId: args.tournamentId,
          type: "participation" as const,
          title: `Tournament Participant - ${tournament.name}`,
          description: `Participated in ${tournament.name} at ${tournament.location.venue}`,
          metadata: {
            division: registration.division,
            classification: registration.classification,
          },
        });
      }
    }

    // Generate performance badges based on rankings
    if (rankings && rankings.length > 0) {
      // Division winners
      const divisionWinners = new Map();
      const classificationWinners = new Map();

      rankings.forEach((shooter: any, index: number) => {
        if (!shooter.dnf && !shooter.dq) {
          const divisionKey = shooter.division || "UN";
          const classKey = `${divisionKey}-${shooter.classification || "UN"}`;

          // Track division winners (first place in each division)
          if (!divisionWinners.has(divisionKey)) {
            divisionWinners.set(divisionKey, { shooter, rank: index + 1 });
          }

          // Track classification winners (first place in each div/class combo)
          if (!classificationWinners.has(classKey)) {
            classificationWinners.set(classKey, { shooter, rank: index + 1 });
          }
        }
      });

      // Generate division winner badges
      for (const [division, { shooter }] of divisionWinners) {
        badgesToCreate.push({
          shooterId: shooter.shooterId as Id<"users">,
          tournamentId: args.tournamentId,
          type: "division_winner" as const,
          title: `${division} Division Winner`,
          description: `First place in ${division} division at ${tournament.name}`,
          metadata: {
            division,
            classification: shooter.classification,
            placement: 1,
            score: shooter.totalTime,
          },
        });
      }

      // Generate classification winner badges
      for (const [classKey, { shooter }] of classificationWinners) {
        badgesToCreate.push({
          shooterId: shooter.shooterId as Id<"users">,
          tournamentId: args.tournamentId,
          type: "class_winner" as const,
          title: `${shooter.division} ${shooter.classification} Class Winner`,
          description: `First place in ${shooter.division} ${shooter.classification} at ${tournament.name}`,
          metadata: {
            division: shooter.division,
            classification: shooter.classification,
            placement: 1,
            score: shooter.totalTime,
          },
        });
      }

      // Generate high overall badge (overall winner)
      if (rankings.length > 0 && !rankings[0].dnf && !rankings[0].dq) {
        const overallWinner = rankings[0];
        badgesToCreate.push({
          shooterId: overallWinner.shooterId as Id<"users">,
          tournamentId: args.tournamentId,
          type: "high_overall" as const,
          title: "High Overall Winner",
          description: `Overall match winner at ${tournament.name}`,
          metadata: {
            division: overallWinner.division,
            classification: overallWinner.classification,
            placement: 1,
            score: overallWinner.totalTime,
          },
        });
      }

      // Generate top 10% badges
      const top10Count = Math.ceil(rankings.length * 0.1);
      const top10Shooters = rankings.slice(0, top10Count).filter((s: any) => !s.dnf && !s.dq);

      for (let i = 0; i < top10Shooters.length; i++) {
        const shooter = top10Shooters[i];
        if (i > 0) { // Skip overall winner (already has high_overall badge)
          badgesToCreate.push({
            shooterId: shooter.shooterId as Id<"users">,
            tournamentId: args.tournamentId,
            type: "top_10_percent" as const,
            title: "Top 10% Performer",
            description: `Finished in top 10% at ${tournament.name}`,
            metadata: {
              division: shooter.division,
              classification: shooter.classification,
              placement: i + 1,
              score: shooter.totalTime,
            },
          });
        }
      }
    }

    // Create all badges in a single mutation
    if (badgesToCreate.length > 0) {
      const badgeIds = await ctx.runMutation(api.badges.createBadgesInBulk, {
        badges: badgesToCreate,
      });
      
      return {
        message: `Generated ${badgeIds.length} badges for tournament ${tournament.name}`,
        badgeIds,
      };
    }
    
    return {
      message: "No badges generated",
      badgeIds: [],
    };
  },
});

// Get badge statistics for a shooter
export const getBadgeStats = query({
  args: {
    shooterId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const badges = await ctx.db
      .query("badges")
      .withIndex("by_shooter", (q) => q.eq("shooterId", args.shooterId))
      .collect();

    const stats = {
      total: badges.length,
      participation: 0,
      division_winner: 0,
      class_winner: 0,
      category_winner: 0,
      stage_winner: 0,
      personal_best: 0,
      clean_stage: 0,
      top_10_percent: 0,
      most_improved: 0,
      high_overall: 0,
      totalShares: 0,
    };

    badges.forEach(badge => {
      stats[badge.type]++;
      stats.totalShares += badge.shareCount || 0;
    });

    return stats;
  },
});

// Generate badge images and store them
export const generateBadgeImages = action({
  args: {
    badgeId: v.id("badges"),
  },
  handler: async (ctx, args) => {
    // Get badge data using query
    const badge = await ctx.runQuery(api.badges.getBadgeById, {
      badgeId: args.badgeId,
    });
    if (!badge) {
      throw new Error("Badge not found");
    }

    // Import badge generator (this will run on the server)
    const { generateBadgeImages } = await import("../src/lib/badgeGenerator");
    
    const badgeData = {
      type: badge.type,
      title: badge.title,
      description: badge.description,
      shooterName: badge.shooter?.name || "Unknown Shooter",
      tournamentName: badge.tournament?.name || "Unknown Tournament",
      tournamentDate: new Date(badge.tournament?.date || Date.now()),
      tournamentLocation: badge.tournament?.location?.venue || "Unknown Location",
      verificationCode: badge.verificationCode,
      metadata: badge.metadata,
    };

    try {
      // Generate badge images in multiple formats
      const images = await generateBadgeImages(badgeData);
      
      // Store images in Convex file storage
      const instagramPostBlob = new Blob([images.instagramPost], { type: 'image/png' });
      const instagramStoryBlob = new Blob([images.instagramStory], { type: 'image/png' });
      const twitterCardBlob = new Blob([images.twitterCard], { type: 'image/png' });
      const thumbnailBlob = new Blob([images.thumbnail], { type: 'image/png' });
      
      const [instagramPostId, instagramStoryId, twitterCardId, thumbnailId] = await Promise.all([
        ctx.storage.store(instagramPostBlob),
        ctx.storage.store(instagramStoryBlob),
        ctx.storage.store(twitterCardBlob),
        ctx.storage.store(thumbnailBlob),
      ]);

      // Get URLs for the stored images
      const [instagramPostUrl, instagramStoryUrl, twitterCardUrl, thumbnailUrl] = await Promise.all([
        ctx.storage.getUrl(instagramPostId),
        ctx.storage.getUrl(instagramStoryId),
        ctx.storage.getUrl(twitterCardId),
        ctx.storage.getUrl(thumbnailId),
      ]);

      // Update badge with image URLs
      await ctx.runMutation(api.badges.updateBadgeImages, {
        badgeId: args.badgeId,
        imageUrl: instagramPostUrl || "",
        thumbnailUrl: thumbnailUrl || "",
        additionalImages: {
          instagramStory: instagramStoryUrl || "",
          twitterCard: twitterCardUrl || "",
        },
      });

      return {
        success: true,
        urls: {
          instagramPost: instagramPostUrl,
          instagramStory: instagramStoryUrl,
          twitterCard: twitterCardUrl,
          thumbnail: thumbnailUrl,
        },
      };
    } catch (error) {
      console.error("Error generating badge images:", error);
      throw new Error(`Failed to generate badge images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Update badge with generated image URLs
export const updateBadgeImages = mutation({
  args: {
    badgeId: v.id("badges"),
    imageUrl: v.string(),
    thumbnailUrl: v.string(),
    additionalImages: v.optional(v.object({
      instagramStory: v.optional(v.string()),
      twitterCard: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const badge = await ctx.db.get(args.badgeId);
    if (!badge) {
      throw new Error("Badge not found");
    }

    await ctx.db.patch(args.badgeId, {
      imageUrl: args.imageUrl,
      thumbnailUrl: args.thumbnailUrl,
      // Metadata structure is fixed, so we can't add additionalImages
      // For now, we'll just update the main images
    });

    return { success: true };
  },
});