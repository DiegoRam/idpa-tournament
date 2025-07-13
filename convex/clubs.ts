import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new IDPA club
export const createClub = mutation({
  args: {
    name: v.string(),
    ownerId: v.id("users"),
    location: v.object({
      address: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    }),
    contact: v.object({
      email: v.string(),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
    }),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify the owner exists and has appropriate role
    const owner = await ctx.db.get(args.ownerId);
    if (!owner) {
      throw new Error("Owner not found");
    }
    
    if (owner.role !== "clubOwner" && owner.role !== "admin") {
      throw new Error("User must be a club owner or admin to create a club");
    }

    // Check if club with same name exists
    const existingClub = await ctx.db
      .query("clubs")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingClub) {
      throw new Error("Club with this name already exists");
    }

    const clubId = await ctx.db.insert("clubs", {
      name: args.name,
      ownerId: args.ownerId,
      location: args.location,
      contact: args.contact,
      logo: args.logo,
      active: true,
      createdAt: Date.now(),
    });

    // Update the owner's clubId
    await ctx.db.patch(args.ownerId, {
      clubId: clubId,
    });

    return clubId;
  },
});

// Get club by ID
export const getClubById = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.clubId);
  },
});

// Get all active clubs
export const getActiveClubs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("clubs")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

// Get clubs by owner
export const getClubsByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clubs")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

// Update club information
export const updateClub = mutation({
  args: {
    clubId: v.id("clubs"),
    name: v.optional(v.string()),
    location: v.optional(v.object({
      address: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    })),
    contact: v.optional(v.object({
      email: v.string(),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
    })),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { clubId, ...updates } = args;
    
    const club = await ctx.db.get(clubId);
    if (!club) {
      throw new Error("Club not found");
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(clubId, filteredUpdates);
    return await ctx.db.get(clubId);
  },
});

// Get club members
export const getClubMembers = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
  },
});

// Get club members by role
export const getClubMembersByRole = query({
  args: {
    clubId: v.id("clubs"),
    role: v.union(
      v.literal("admin"),
      v.literal("clubOwner"), 
      v.literal("securityOfficer"),
      v.literal("shooter")
    ),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("users")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();

    return members.filter(member => member.role === args.role);
  },
});

// Add member to club
export const addMemberToClub = mutation({
  args: {
    clubId: v.id("clubs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    const user = await ctx.db.get(args.userId);

    if (!club || !user) {
      throw new Error("Club or user not found");
    }

    if (!club.active) {
      throw new Error("Cannot add members to inactive club");
    }

    if (user.clubId === args.clubId) {
      throw new Error("User is already a member of this club");
    }

    await ctx.db.patch(args.userId, {
      clubId: args.clubId,
    });

    return { success: true };
  },
});

// Remove member from club
export const removeMemberFromClub = mutation({
  args: {
    clubId: v.id("clubs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    const user = await ctx.db.get(args.userId);

    if (!club || !user) {
      throw new Error("Club or user not found");
    }

    if (user.clubId !== args.clubId) {
      throw new Error("User is not a member of this club");
    }

    // Don't allow removing the club owner
    if (club.ownerId === args.userId) {
      throw new Error("Cannot remove club owner from club");
    }

    await ctx.db.patch(args.userId, {
      clubId: undefined,
    });

    return { success: true };
  },
});

// Search clubs by name or location
export const searchClubs = query({
  args: {
    searchTerm: v.string(),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let clubs = await ctx.db.query("clubs").collect();
    
    // Filter by active status if specified
    if (args.activeOnly !== false) {
      clubs = clubs.filter(club => club.active);
    }
    
    // Search by name, city, or state
    const searchTerm = args.searchTerm.toLowerCase();
    return clubs.filter(club => 
      club.name.toLowerCase().includes(searchTerm) ||
      club.location.city.toLowerCase().includes(searchTerm) ||
      club.location.state.toLowerCase().includes(searchTerm) ||
      club.location.address.toLowerCase().includes(searchTerm)
    );
  },
});

// Get clubs near a location
export const getClubsNearLocation = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusKm: v.optional(v.number()), // Default to 50km
  },
  handler: async (ctx, args) => {
    const clubs = await ctx.db
      .query("clubs")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    const radius = args.radiusKm || 50;

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radius of the Earth in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // Distance in kilometers
    };

    return clubs
      .map(club => ({
        ...club,
        distance: calculateDistance(
          args.latitude,
          args.longitude,
          club.location.coordinates.lat,
          club.location.coordinates.lng
        )
      }))
      .filter(club => club.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  },
});

// Deactivate club
export const deactivateClub = mutation({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    if (!club) {
      throw new Error("Club not found");
    }

    await ctx.db.patch(args.clubId, {
      active: false,
    });

    return { success: true };
  },
});

// Reactivate club
export const reactivateClub = mutation({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    if (!club) {
      throw new Error("Club not found");
    }

    await ctx.db.patch(args.clubId, {
      active: true,
    });

    return { success: true };
  },
});