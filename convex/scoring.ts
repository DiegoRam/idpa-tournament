import { v } from "convex/values";
import { mutation, query, action, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";

// IDPA scoring calculation utilities
function calculatePointsDown(hits: {
  down0: number;
  down1: number;
  down3: number;
  miss: number;
  nonThreat: number;
}): number {
  return (
    hits.down0 * 0 +
    hits.down1 * 1 +
    hits.down3 * 3 +
    hits.miss * 5 +
    hits.nonThreat * 5
  );
}

function calculatePenaltyTime(penalties: {
  procedural: number;
  nonThreat: number;
  failureToNeutralize: number;
  flagrant: number;
  ftdr: number;
  other: Array<{ count: number; seconds: number }>;
}): number {
  const standardPenalties =
    penalties.procedural * 3 +
    penalties.nonThreat * 5 +
    penalties.failureToNeutralize * 5 +
    penalties.flagrant * 10 +
    penalties.ftdr * 20;

  const otherPenalties = penalties.other.reduce(
    (total, penalty) => total + penalty.count * penalty.seconds,
    0
  );

  return standardPenalties + otherPenalties;
}

// Submit a score for a shooter on a stage
// Trigger badge generation when tournament is completed
export const triggerBadgeGeneration: any = action({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    try {
      // Generate tournament badges
      const result = await ctx.runAction((api.badges as any).generateTournamentBadges, {
        tournamentId: args.tournamentId,
      });
      
      return result;
    } catch (error) {
      console.error("Error triggering badge generation:", error);
      throw new Error(`Failed to generate badges: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const submitScore = mutation({
  args: {
    stageId: v.id("stages"),
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
    scoredBy: v.id("users"),
    strings: v.array(v.object({
      time: v.number(),
      hits: v.object({
        down0: v.number(),
        down1: v.number(),
        down3: v.number(),
        miss: v.number(),
        nonThreat: v.number(),
      }),
    })),
    penalties: v.object({
      procedural: v.number(),
      nonThreat: v.number(),
      failureToNeutralize: v.number(),
      flagrant: v.number(),
      ftdr: v.number(),
      other: v.array(v.object({
        type: v.string(),
        count: v.number(),
        seconds: v.number(),
        description: v.optional(v.string()),
      })),
    }),
    dnf: v.optional(v.boolean()),
    dq: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate stage exists
    const stage = await ctx.db.get(args.stageId);
    if (!stage) {
      throw new Error("Stage not found");
    }

    // Validate scorer is an SO or admin
    const scorer = await ctx.db.get(args.scoredBy);
    if (!scorer || (scorer.role !== "securityOfficer" && scorer.role !== "admin")) {
      throw new Error("Only Security Officers can submit scores");
    }

    // Check if score already exists
    const existingScore = await ctx.db
      .query("scores")
      .withIndex("by_stage_shooter", (q) => 
        q.eq("stageId", args.stageId).eq("shooterId", args.shooterId)
      )
      .first();

    if (existingScore) {
      throw new Error("Score already exists for this shooter on this stage. Use updateScore instead.");
    }

    // Validate string count matches stage configuration
    if (args.strings.length !== stage.strings) {
      throw new Error(`Stage requires ${stage.strings} strings, but ${args.strings.length} were provided`);
    }

    // Calculate IDPA score
    const rawTime = args.strings.reduce((total, string) => total + string.time, 0);
    
    // Calculate total points down across all strings
    let totalPointsDown = 0;
    args.strings.forEach(string => {
      totalPointsDown += calculatePointsDown(string.hits);
    });

    // Calculate penalty time
    const penaltyTime = calculatePenaltyTime(args.penalties);

    // Final time = raw time + points down + penalty time
    const finalTime = rawTime + totalPointsDown + penaltyTime;

    // Create score record
    const scoreId = await ctx.db.insert("scores", {
      stageId: args.stageId,
      shooterId: args.shooterId,
      squadId: args.squadId,
      division: args.division,
      classification: args.classification,
      scoredBy: args.scoredBy,
      strings: args.strings,
      penalties: args.penalties,
      rawTime,
      pointsDown: totalPointsDown,
      penaltyTime,
      finalTime,
      stagePoints: 0, // Will be calculated when all scores are in
      dnf: args.dnf || false,
      dq: args.dq || false,
      scoredAt: Date.now(),
    });

    // Get tournament ID from stage to trigger notifications
    const tournament = await ctx.db.get(stage.tournamentId);
    if (tournament) {
      // Trigger score posted notification
      await ctx.scheduler.runAfter(0, internal.notificationTriggers.onScorePosted, {
        scoreId,
        stageId: args.stageId,
        shooterId: args.shooterId,
        tournamentId: tournament._id,
        scoredBy: args.scoredBy,
      });
    }

    return { scoreId, finalTime };
  },
});

// Update an existing score
export const updateScore = mutation({
  args: {
    scoreId: v.id("scores"),
    scoredBy: v.id("users"),
    strings: v.optional(v.array(v.object({
      time: v.number(),
      hits: v.object({
        down0: v.number(),
        down1: v.number(),
        down3: v.number(),
        miss: v.number(),
        nonThreat: v.number(),
      }),
    }))),
    penalties: v.optional(v.object({
      procedural: v.number(),
      nonThreat: v.number(),
      failureToNeutralize: v.number(),
      flagrant: v.number(),
      ftdr: v.number(),
      other: v.array(v.object({
        type: v.string(),
        count: v.number(),
        seconds: v.number(),
        description: v.optional(v.string()),
      })),
    })),
    dnf: v.optional(v.boolean()),
    dq: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { scoreId, scoredBy, ...updates } = args;

    // Validate scorer is an SO or admin
    const scorer = await ctx.db.get(scoredBy);
    if (!scorer || (scorer.role !== "securityOfficer" && scorer.role !== "admin")) {
      throw new Error("Only Security Officers can update scores");
    }

    const existingScore = await ctx.db.get(scoreId);
    if (!existingScore) {
      throw new Error("Score not found");
    }

    // If updating strings or penalties, recalculate scores
    if (updates.strings || updates.penalties) {
      const strings = updates.strings || existingScore.strings;
      const penalties = updates.penalties || existingScore.penalties;

      const rawTime = strings.reduce((total, string) => total + string.time, 0);
      
      let totalPointsDown = 0;
      strings.forEach(string => {
        totalPointsDown += calculatePointsDown(string.hits);
      });

      const penaltyTime = calculatePenaltyTime(penalties);
      const finalTime = rawTime + totalPointsDown + penaltyTime;

      await ctx.db.patch(scoreId, {
        ...updates,
        rawTime,
        pointsDown: totalPointsDown,
        penaltyTime,
        finalTime,
        scoredBy,
        scoredAt: Date.now(),
      });

      // Get stage and tournament to trigger notifications
      const stage = await ctx.db.get(existingScore.stageId);
      if (stage) {
        const tournament = await ctx.db.get(stage.tournamentId);
        if (tournament) {
          // Trigger score updated notification
          await ctx.scheduler.runAfter(0, internal.notificationTriggers.onScorePosted, {
            scoreId,
            stageId: existingScore.stageId,
            shooterId: existingScore.shooterId,
            tournamentId: tournament._id,
            scoredBy,
          });
        }
      }

      return { scoreId, finalTime };
    }

    // Otherwise just update the provided fields
    await ctx.db.patch(scoreId, {
      ...updates,
      scoredBy,
      scoredAt: Date.now(),
    });

    const updatedScore = await ctx.db.get(scoreId);
    return { scoreId, finalTime: updatedScore?.finalTime };
  },
});

// Get score by stage and shooter
export const getScoreByStageAndShooter = query({
  args: {
    stageId: v.id("stages"),
    shooterId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const score = await ctx.db
      .query("scores")
      .withIndex("by_stage_shooter", (q) => 
        q.eq("stageId", args.stageId).eq("shooterId", args.shooterId)
      )
      .first();

    if (score) {
      // Get scorer name
      const scorer = await ctx.db.get(score.scoredBy);
      return {
        ...score,
        scorerName: scorer?.name,
      };
    }

    return null;
  },
});

// Get all scores for a stage
export const getScoresByStage = query({
  args: {
    stageId: v.id("stages"),
    division: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
  },
  handler: async (ctx, args) => {
    let scores = await ctx.db
      .query("scores")
      .withIndex("by_stage_shooter")
      .filter((q) => q.eq(q.field("stageId"), args.stageId))
      .collect();

    // Filter by division if specified
    if (args.division) {
      scores = scores.filter(score => score.division === args.division);
    }

    // Get shooter details
    const scoresWithDetails = await Promise.all(
      scores.map(async (score) => {
        const shooter = await ctx.db.get(score.shooterId);
        return {
          ...score,
          shooterName: shooter?.name || "Unknown",
        };
      })
    );

    // Sort by final time (DNF/DQ last)
    return scoresWithDetails.sort((a, b) => {
      if (a.dnf || a.dq) return 1;
      if (b.dnf || b.dq) return -1;
      return a.finalTime - b.finalTime;
    });
  },
});

// Get all scores for a shooter
export const getScoresByShooter = query({
  args: {
    shooterId: v.id("users"),
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    // Get all stages for the tournament
    const stages = await ctx.db
      .query("stages")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    const stageIds = stages.map(stage => stage._id);

    // Get all scores for this shooter in these stages
    const scores = await ctx.db
      .query("scores")
      .filter((q) => q.eq(q.field("shooterId"), args.shooterId))
      .collect();

    // Filter to only scores from this tournament's stages
    const tournamentScores = scores.filter(score => 
      stageIds.includes(score.stageId)
    );

    // Add stage details
    const scoresWithStages = tournamentScores.map(score => {
      const stage = stages.find(s => s._id === score.stageId);
      return {
        ...score,
        stageName: stage?.name || "Unknown",
        stageNumber: stage?.stageNumber || 0,
      };
    });

    // Sort by stage number
    return scoresWithStages.sort((a, b) => a.stageNumber - b.stageNumber);
  },
});

// Calculate stage rankings
export const calculateStageRankings = query({
  args: {
    stageId: v.id("stages"),
  },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_stage_shooter")
      .filter((q) => q.eq(q.field("stageId"), args.stageId))
      .collect();

    // Group by division
    const divisionGroups: Record<string, typeof scores> = {};
    scores.forEach(score => {
      if (!divisionGroups[score.division]) {
        divisionGroups[score.division] = [];
      }
      divisionGroups[score.division].push(score);
    });

    // Calculate rankings for each division
    const rankings: Array<{
      division: string;
      rankings: Array<{
        rank: number;
        scoreId: string;
        shooterId: string;
        shooterName: string;
        finalTime: number;
        dnf: boolean;
        dq: boolean;
      }>;
    }> = [];

    for (const [division, divisionScores] of Object.entries(divisionGroups)) {
      // Sort by final time (DNF/DQ last)
      const sorted = divisionScores.sort((a, b) => {
        if (a.dnf || a.dq) return 1;
        if (b.dnf || b.dq) return -1;
        return a.finalTime - b.finalTime;
      });

      // Assign ranks
      const divisionRankings = await Promise.all(
        sorted.map(async (score, index) => {
          const shooter = await ctx.db.get(score.shooterId);
          return {
            rank: score.dnf || score.dq ? 999 : index + 1,
            scoreId: score._id,
            shooterId: score.shooterId,
            shooterName: shooter?.name || "Unknown",
            finalTime: score.finalTime,
            dnf: score.dnf,
            dq: score.dq,
          };
        })
      );

      rankings.push({
        division,
        rankings: divisionRankings,
      });
    }

    return rankings;
  },
});

// Get scoring progress for a squad
export const getSquadScoringProgress = query({
  args: {
    squadId: v.id("squads"),
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    // Get all stages for the tournament
    const stages = await ctx.db
      .query("stages")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Get all registered shooters in this squad
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_squad", (q) => q.eq("squadId", args.squadId))
      .filter((q) => q.eq(q.field("status"), "checked_in"))
      .collect();

    // For each shooter, check which stages they've completed
    const progress = await Promise.all(
      registrations.map(async (registration) => {
        const shooter = await ctx.db.get(registration.shooterId);
        
        const stageProgress = await Promise.all(
          stages.map(async (stage) => {
            const score = await ctx.db
              .query("scores")
              .withIndex("by_stage_shooter", (q) => 
                q.eq("stageId", stage._id).eq("shooterId", registration.shooterId)
              )
              .first();

            return {
              stageId: stage._id,
              stageNumber: stage.stageNumber,
              stageName: stage.name,
              scored: !!score,
              finalTime: score?.finalTime,
              dnf: score?.dnf || false,
              dq: score?.dq || false,
            };
          })
        );

        const completedStages = stageProgress.filter(s => s.scored).length;

        return {
          shooterId: registration.shooterId,
          shooterName: shooter?.name || "Unknown",
          division: registration.division,
          classification: registration.classification,
          stageProgress,
          completedStages,
          totalStages: stages.length,
          progressPercentage: stages.length > 0 
            ? Math.round((completedStages / stages.length) * 100)
            : 0,
        };
      })
    );

    return progress.sort((a, b) => a.shooterName.localeCompare(b.shooterName));
  },
});

// Internal function to calculate rankings
async function getOverallRankings(ctx: QueryCtx, tournamentId: Id<"tournaments">) {
    // Get all stages for the tournament
    const stages = await ctx.db
      .query("stages")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .collect();

    const stageIds = stages.map(stage => stage._id);

    // Get all scores for this tournament
    const allScores = await ctx.db
      .query("scores")
      .filter((q) => q.or(...stageIds.map(stageId => q.eq(q.field("stageId"), stageId))))
      .collect();

    // Group scores by shooter
    const shooterScores: Record<string, typeof allScores> = {};
    allScores.forEach(score => {
      if (!shooterScores[score.shooterId]) {
        shooterScores[score.shooterId] = [];
      }
      shooterScores[score.shooterId].push(score);
    });

    // Calculate total scores for each shooter
    const shooterTotals = await Promise.all(
      Object.entries(shooterScores).map(async ([shooterId, scores]) => {
        const shooter = await ctx.db.get(shooterId as Id<"users">);
        if (!shooter || !('name' in shooter)) return null;

        // Sum all stage times
        const totalTime = scores.reduce((sum, score) => {
          return sum + (score.dnf || score.dq ? 999999 : score.finalTime);
        }, 0);

        const completedStages = scores.filter(s => !s.dnf && !s.dq).length;
        const hasDNF = scores.some(s => s.dnf);
        const hasDQ = scores.some(s => s.dq);

        return {
          shooterId,
          shooterName: shooter.name,
          division: scores[0]?.division || "UN",
          classification: scores[0]?.classification || "UN",
          totalTime,
          completedStages,
          totalStages: stages.length,
          dnf: hasDNF,
          dq: hasDQ,
          scores: scores.length,
        };
      })
    );

    const validTotals = shooterTotals.filter(Boolean);

    // Sort by total time (DNF/DQ last)
    const sorted = validTotals.sort((a, b) => {
      if (a && (a.dnf || a.dq)) return 1;
      if (b && (b.dnf || b.dq)) return -1;
      if (a && b && a.completedStages !== b.completedStages) {
        return b.completedStages - a.completedStages;
      }
      return (a?.totalTime || 0) - (b?.totalTime || 0);
    });

    return sorted.map((shooter, index) => ({
      ...shooter,
      rank: shooter && (shooter.dnf || shooter.dq) ? 999 : index + 1,
    }));
}

// Calculate overall tournament rankings
export const calculateOverallRankings = query({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    return await getOverallRankings(ctx, args.tournamentId);
  },
});

// Calculate division-specific rankings
export const calculateDivisionRankings = query({
  args: {
    tournamentId: v.id("tournaments"),
    division: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
  },
  handler: async (ctx, args) => {
    const overallRankings = await getOverallRankings(ctx, args.tournamentId);
    
    // Filter by division if specified
    let filteredRankings = overallRankings;
    if (args.division) {
      filteredRankings = overallRankings.filter(r => r && r.division === args.division);
    }

    // Re-rank within division
    return filteredRankings.map((shooter, index) => ({
      ...shooter,
      divisionRank: shooter && (shooter.dnf || shooter.dq) ? 999 : index + 1,
    }));
  },
});

// Get live tournament leaderboard
export const getTournamentLeaderboard = query({
  args: {
    tournamentId: v.id("tournaments"),
    division: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
    classification: v.optional(v.union(
      v.literal("MA"), v.literal("EX"), v.literal("SS"), 
      v.literal("MM"), v.literal("NV"), v.literal("UN")
    )),
  },
  handler: async (ctx, args) => {
    const overallRankings = await getOverallRankings(ctx, args.tournamentId);
    
    // Filter by division if specified
    let rankings = overallRankings;
    if (args.division) {
      rankings = overallRankings.filter(r => r && r.division === args.division);
      // Re-rank within division
      rankings = rankings.map((shooter, index) => ({
        ...shooter,
        divisionRank: shooter && (shooter.dnf || shooter.dq) ? 999 : index + 1,
      }));
    }

    // Filter by classification if specified
    let filteredRankings = rankings;
    if (args.classification) {
      filteredRankings = rankings.filter(r => r && r.classification === args.classification);
    }

    return filteredRankings;
  },
});

// Get shooter progress and performance
export const getShooterProgress = query({
  args: {
    shooterId: v.id("users"),
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const shooter = await ctx.db.get(args.shooterId);
    if (!shooter) return null;

    // Get all stages for the tournament
    const stages = await ctx.db
      .query("stages")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Get all scores for this shooter in this tournament
    const stageIds = stages.map(stage => stage._id);
    const scores = await ctx.db
      .query("scores")
      .filter((q) => q.and(
        q.eq(q.field("shooterId"), args.shooterId),
        q.or(...stageIds.map(stageId => q.eq(q.field("stageId"), stageId)))
      ))
      .collect();

    // Get current rankings
    const overallRankings = await getOverallRankings(ctx, args.tournamentId);
    const shooterRanking = overallRankings.find(r => r && r.shooterId === args.shooterId);

    // Calculate performance metrics
    const completedScores = scores.filter(s => !s.dnf && !s.dq);
    const totalHits = completedScores.reduce((total, score) => {
      return total + score.strings.reduce((stringTotal, string) => {
        return stringTotal + string.hits.down0 + string.hits.down1 + string.hits.down3;
      }, 0);
    }, 0);

    const totalRounds = completedScores.reduce((total, score) => {
      return total + score.strings.reduce((stringTotal, string) => {
        return stringTotal + string.hits.down0 + string.hits.down1 + string.hits.down3 + string.hits.miss;
      }, 0);
    }, 0);

    const accuracy = totalRounds > 0 ? (totalHits / totalRounds) * 100 : 0;

    return {
      shooter: {
        id: shooter._id,
        name: shooter.name,
        division: scores[0]?.division || "UN",
        classification: scores[0]?.classification || "UN",
      },
      ranking: shooterRanking || null,
      performance: {
        completedStages: completedScores.length,
        totalStages: stages.length,
        accuracy: Math.round(accuracy * 100) / 100,
        totalTime: completedScores.reduce((sum, s) => sum + s.finalTime, 0),
        averageTime: completedScores.length > 0 
          ? completedScores.reduce((sum, s) => sum + s.finalTime, 0) / completedScores.length 
          : 0,
      },
      stageResults: stages.map(stage => {
        const stageScore = scores.find(s => s.stageId === stage._id);
        return {
          stageId: stage._id,
          stageNumber: stage.stageNumber,
          stageName: stage.name,
          scored: !!stageScore,
          score: stageScore || null,
        };
      }).sort((a, b) => a.stageNumber - b.stageNumber),
    };
  },
});

// Get spectator data (public, no auth required)
export const getSpectatorData = query({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament || tournament.status !== "active") {
      return null;
    }

    // Get basic tournament info
    const club = await ctx.db.get(tournament.clubId);
    
    // Get division counts
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .filter((q) => q.eq(q.field("status"), "checked_in"))
      .collect();

    const divisionCounts = registrations.reduce((counts, reg) => {
      counts[reg.division] = (counts[reg.division] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Get top 10 overall leaders
    const rankings = await getOverallRankings(ctx, args.tournamentId);
    const topShooters = rankings.slice(0, 10);

    return {
      tournament: {
        id: tournament._id,
        name: tournament.name,
        date: tournament.date,
        location: tournament.location,
        club: club?.name || "Unknown Club",
        status: tournament.status,
      },
      stats: {
        totalShooters: registrations.length,
        divisionCounts,
        completedScores: rankings.filter(r => r && r.completedStages && r.completedStages > 0).length,
      },
      leaderboard: topShooters,
    };
  },
});