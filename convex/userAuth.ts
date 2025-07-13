import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth, signIn } from "./auth";

// Register a new user with basic information
export const registerUser = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("clubOwner"), 
      v.literal("securityOfficer"),
      v.literal("shooter")
    ),
  },
  handler: async (ctx, args) => {
    // First, create the auth account - this will automatically create a user with minimal data
    const result = await signIn(ctx, {
      provider: "password",
      params: {
        email: args.email,
        password: args.password,
        flow: "signUp",
        name: args.name,
      },
    });

    // Update the automatically created user with our role
    await ctx.runMutation(internal.userAuth.updateUserRole, {
      email: args.email,
      role: args.role,
    });

    return result;
  },
});

// Internal mutation to update user role after auth creation
export const updateUserRole = mutation({
  args: {
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("clubOwner"), 
      v.literal("securityOfficer"),
      v.literal("shooter")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      role: args.role,
      profileCompleted: false,
      createdAt: Date.now(),
      lastActive: Date.now(),
    });

    return user._id;
  },
});

// Complete IDPA profile with tournament-specific data
export const completeProfile = mutation({
  args: {
    userId: v.id("users"),
    idpaMemberNumber: v.optional(v.string()),
    primaryDivision: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
    demographics: v.optional(v.object({
      gender: v.optional(v.string()),
      birthDate: v.optional(v.number()),
      isVeteran: v.optional(v.boolean()),
      isLawEnforcement: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const { userId, ...profileData } = args;
    
    await ctx.db.patch(userId, {
      ...profileData,
      preferences: {
        notifications: true,
        defaultDivision: args.primaryDivision,
      },
      profileCompleted: true,
      lastActive: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

// Get current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("getCurrentUser - identity:", identity);
    
    if (!identity) {
      console.log("getCurrentUser - no identity found");
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    console.log("getCurrentUser - user found:", user ? "yes" : "no", user?.email);
    return user;
  },
});

// Debug function to check user existence
export const checkUserExists = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    return {
      exists: !!user,
      user: user ? {
        email: user.email,
        name: user.name,
        role: user.role,
        hasAuthData: !!user.email,
      } : null
    };
  },
});