import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth, signIn } from "./auth";

// Register a new user with IDPA-specific information
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
    idpaMemberNumber: v.optional(v.string()),
    primaryDivision: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
  },
  handler: async (ctx, args) => {
    // First, create the auth account
    await signIn(ctx, {
      provider: "password",
      params: {
        email: args.email,
        password: args.password,
        flow: "signUp",
      },
    });

    // Then create the user profile
    const userId = await ctx.runMutation(internal.userAuth.createUserProfile, {
      email: args.email,
      name: args.name,
      role: args.role,
      idpaMemberNumber: args.idpaMemberNumber,
      primaryDivision: args.primaryDivision,
    });

    return userId;
  },
});

// Internal mutation to create user profile
export const createUserProfile = mutation({
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
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: args.role,
      idpaMemberNumber: args.idpaMemberNumber,
      primaryDivision: args.primaryDivision,
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
      friends: [],
      preferences: {
        notifications: true,
        defaultDivision: args.primaryDivision,
      },
      createdAt: Date.now(),
      lastActive: Date.now(),
    });

    return userId;
  },
});

// Get current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    return user;
  },
});