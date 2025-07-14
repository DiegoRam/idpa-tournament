import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("clubOwner"), 
      v.literal("securityOfficer"),
      v.literal("shooter")
    ),
    idpaMemberNumber: v.optional(v.string()),
    primaryDivision: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
    clubId: v.optional(v.id("clubs")),
  },
  handler: async (ctx, args) => {
    // Check if user with email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const now = Date.now();

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: args.role,
      idpaMemberNumber: args.idpaMemberNumber,
      
      // Initialize empty classifications for all divisions
      classifications: {
        SSP: undefined,
        ESP: undefined,
        CDP: undefined,
        CCP: undefined,
        REV: undefined,
        BUG: undefined,
        PCC: undefined,
        CO: undefined,
      },
      
      primaryDivision: args.primaryDivision,
      clubId: args.clubId,
      friends: [],
      
      preferences: {
        notifications: true,
        defaultDivision: args.primaryDivision,
        homeLocation: undefined,
      },
      
      demographics: undefined,
      createdAt: now,
      lastActive: now,
    });

    return userId;
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    idpaMemberNumber: v.optional(v.string()),
    primaryDivision: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
    profilePicture: v.optional(v.string()),
    preferences: v.optional(v.object({
      notifications: v.boolean(),
      defaultDivision: v.optional(v.string()),
      homeLocation: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
      })),
    })),
    demographics: v.optional(v.object({
      gender: v.optional(v.string()),
      birthDate: v.optional(v.number()),
      isVeteran: v.optional(v.boolean()),
      isLawEnforcement: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(userId, {
      ...filteredUpdates,
      lastActive: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

// Update user classification for a specific division
export const updateUserClassification = mutation({
  args: {
    userId: v.id("users"),
    division: v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    ),
    classification: v.union(
      v.literal("MA"), v.literal("EX"), v.literal("SS"), 
      v.literal("MM"), v.literal("NV"), v.literal("UN")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedClassifications = {
      ...user.classifications,
      [args.division]: args.classification,
    };

    await ctx.db.patch(args.userId, {
      classifications: updatedClassifications,
      lastActive: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    userId: v.id("users"),
    notifications: v.optional(v.boolean()),
    defaultDivision: v.optional(v.string()),
    homeLocation: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const { userId, ...newPreferences } = args;
    
    // Filter out undefined values and merge with existing preferences
    const filteredPreferences = Object.fromEntries(
      Object.entries(newPreferences).filter(([_, value]) => value !== undefined)
    );

    const updatedPreferences = {
      notifications: true, // Default value
      ...user.preferences,
      ...filteredPreferences,
    };

    await ctx.db.patch(userId, {
      preferences: updatedPreferences,
      lastActive: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

// Add friend connection
export const addFriend = mutation({
  args: {
    userId: v.id("users"),
    friendId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.userId === args.friendId) {
      throw new Error("Cannot add yourself as friend");
    }

    const user = await ctx.db.get(args.userId);
    const friend = await ctx.db.get(args.friendId);
    
    if (!user || !friend) {
      throw new Error("User or friend not found");
    }

    // Check if already friends
    const userFriends = user.friends || [];
    if (userFriends.includes(args.friendId)) {
      throw new Error("Already friends");
    }

    // Add friend to both users
    await ctx.db.patch(args.userId, {
      friends: [...userFriends, args.friendId],
      lastActive: Date.now(),
    });

    const friendFriends = friend.friends || [];
    await ctx.db.patch(args.friendId, {
      friends: [...friendFriends, args.userId],
      lastActive: Date.now(),
    });

    return { success: true };
  },
});

// Remove friend connection
export const removeFriend = mutation({
  args: {
    userId: v.id("users"),
    friendId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const friend = await ctx.db.get(args.friendId);
    
    if (!user || !friend) {
      throw new Error("User or friend not found");
    }

    // Remove friend from both users
    const userFriends = user.friends || [];
    await ctx.db.patch(args.userId, {
      friends: userFriends.filter(id => id !== args.friendId),
      lastActive: Date.now(),
    });

    const friendFriends = friend.friends || [];
    await ctx.db.patch(args.friendId, {
      friends: friendFriends.filter(id => id !== args.userId),
      lastActive: Date.now(),
    });

    return { success: true };
  },
});

// Get users by role
export const getUsersByRole = query({
  args: {
    role: v.union(
      v.literal("admin"),
      v.literal("clubOwner"), 
      v.literal("securityOfficer"),
      v.literal("shooter")
    ),
    clubId: v.optional(v.id("clubs")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", args.role));
    
    const users = await query.collect();
    
    // Filter by club if specified
    if (args.clubId) {
      return users.filter(user => user.clubId === args.clubId);
    }
    
    return users;
  },
});

// Get user's friends with their details
export const getUserFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userFriends = user.friends || [];
    const friends = await Promise.all(
      userFriends.map(friendId => ctx.db.get(friendId))
    );

    // Filter out any null results (deleted users)
    return friends.filter(friend => friend !== null);
  },
});

// Search users by name or email
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    role: v.optional(v.union(
      v.literal("admin"),
      v.literal("clubOwner"), 
      v.literal("securityOfficer"),
      v.literal("shooter")
    )),
    clubId: v.optional(v.id("clubs")),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").collect();
    
    // Filter by role if specified
    if (args.role) {
      users = users.filter(user => user.role === args.role);
    }
    
    // Filter by club if specified
    if (args.clubId) {
      users = users.filter(user => user.clubId === args.clubId);
    }
    
    // Search by name or email
    const searchTerm = args.searchTerm.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.idpaMemberNumber && user.idpaMemberNumber.includes(searchTerm))
    );
  },
});

// Update last active timestamp
export const updateLastActive = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastActive: Date.now(),
    });
  },
});