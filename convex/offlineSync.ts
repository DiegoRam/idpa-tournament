import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Add an item to the offline queue
export const addToOfflineQueue = mutation({
  args: {
    action: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", user.email!))
      .first();
    
    if (!currentUser) throw new Error("User not found");

    return await ctx.db.insert("offlineQueue", {
      userId: currentUser._id,
      action: args.action,
      data: args.data,
      createdAt: Date.now(),
      retries: 0,
      status: "pending",
    });
  },
});

// Get pending items from the offline queue
export const getPendingOfflineItems = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", user.email!))
      .first();
    
    if (!currentUser) return [];

    return await ctx.db
      .query("offlineQueue")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", currentUser._id).eq("status", "pending")
      )
      .order("asc")
      .collect();
  },
});

// Process an offline queue item
export const processOfflineItem = mutation({
  args: {
    queueId: v.id("offlineQueue"),
  },
  handler: async (ctx, args) => {
    const queueItem = await ctx.db.get(args.queueId);
    if (!queueItem) throw new Error("Queue item not found");

    // Mark as processing
    await ctx.db.patch(args.queueId, { status: "processing" });

    try {
      // Process based on action type
      switch (queueItem.action) {
        case "submitScore": {
          const scoreData = queueItem.data as any;
          
          // Check if score already exists to avoid duplicates
          const existingScore = await ctx.db
            .query("scores")
            .withIndex("by_stage_shooter", (q) => 
              q.eq("stageId", scoreData.stageId).eq("shooterId", scoreData.shooterId)
            )
            .first();
          
          if (!existingScore) {
            // Directly insert the score since we're in a mutation context
            await ctx.db.insert("scores", {
              stageId: scoreData.stageId,
              shooterId: scoreData.shooterId,
              squadId: scoreData.squadId,
              division: scoreData.division,
              classification: scoreData.classification,
              scoredBy: scoreData.scoredBy,
              strings: scoreData.strings,
              penalties: scoreData.penalties,
              dnf: scoreData.dnf || false,
              dq: scoreData.dq || false,
              rawTime: 0, // Will be calculated
              pointsDown: 0, // Will be calculated
              penaltyTime: 0, // Will be calculated
              finalTime: 0, // Will be calculated
              stagePoints: 0, // Will be calculated
              scoredAt: Date.now(),
            });
          }
          break;
        }
        
        case "updateScore": {
          const scoreData = queueItem.data as any;
          
          // Directly patch the score since we're in a mutation context
          await ctx.db.patch(scoreData.scoreId, {
            strings: scoreData.strings,
            penalties: scoreData.penalties,
            dnf: scoreData.dnf || false,
            dq: scoreData.dq || false,
            scoredAt: Date.now(),
          });
          break;
        }
        
        case "updateProfile": {
          const profileData = queueItem.data as any;
          
          // Process profile update
          await ctx.db.patch(profileData.userId, profileData.updates);
          break;
        }
        
        case "createRegistration": {
          const registrationData = queueItem.data as any;
          
          // Check if registration already exists
          const existingRegistration = await ctx.db
            .query("registrations")
            .withIndex("by_tournament", (q) => 
              q.eq("tournamentId", registrationData.tournamentId)
            )
            .filter((q) => q.eq(q.field("shooterId"), registrationData.shooterId))
            .first();
          
          if (!existingRegistration) {
            // Directly insert the registration since we're in a mutation context
            await ctx.db.insert("registrations", {
              tournamentId: registrationData.tournamentId,
              shooterId: registrationData.shooterId,
              squadId: registrationData.squadId,
              division: registrationData.division,
              classification: registrationData.classification,
              customCategories: registrationData.customCategories || [],
              status: "registered",
              paymentStatus: "pending",
              registeredAt: Date.now(),
            });
          }
          break;
        }
        
        // Add more action types as needed
        default:
          throw new Error(`Unknown action: ${queueItem.action}`);
      }

      // Mark as completed
      await ctx.db.patch(args.queueId, { 
        status: "completed",
        completedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      // Increment retry count
      const retries = queueItem.retries + 1;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (retries >= 3) {
        // Mark as failed after 3 retries
        await ctx.db.patch(args.queueId, { 
          status: "failed",
          error: errorMessage,
        });
      } else {
        // Reset to pending for retry
        await ctx.db.patch(args.queueId, { 
          status: "pending",
          retries,
          lastError: errorMessage,
        });
      }

      throw error;
    }
  },
});

// Clear completed items from the queue
export const clearCompletedItems = mutation({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", user.email!))
      .first();
    
    if (!currentUser) throw new Error("User not found");

    const completedItems = await ctx.db
      .query("offlineQueue")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", currentUser._id).eq("status", "completed")
      )
      .collect();

    // Delete completed items older than 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    for (const item of completedItems) {
      if (item.completedAt && item.completedAt < oneDayAgo) {
        await ctx.db.delete(item._id);
      }
    }

    return { cleared: completedItems.length };
  },
});

// Get sync status
export const getSyncStatus = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return { pending: 0, processing: 0, failed: 0, completed: 0 };

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", user.email!))
      .first();
    
    if (!currentUser) return { pending: 0, processing: 0, failed: 0, completed: 0 };

    const items = await ctx.db
      .query("offlineQueue")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .collect();

    const status = {
      pending: 0,
      processing: 0,
      failed: 0,
      completed: 0,
    };

    items.forEach(item => {
      status[item.status as keyof typeof status]++;
    });

    return status;
  },
});