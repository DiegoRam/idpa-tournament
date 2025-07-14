import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Include Convex Auth tables but override users table
  ...authTables,
  
  // Override users table with simplified schema for auth compatibility
  users: defineTable({
    email: v.string(),
    name: v.string(),
    
    // Basic role - set after registration
    role: v.optional(v.union(
      v.literal("admin"),
      v.literal("clubOwner"), 
      v.literal("securityOfficer"),
      v.literal("shooter")
    )),
    
    // All IDPA-specific fields are optional - completed later
    idpaMemberNumber: v.optional(v.string()),
    
    // IDPA classifications per division - optional
    classifications: v.optional(v.object({
      SSP: v.optional(v.union(
        v.literal("MA"), v.literal("EX"), v.literal("SS"), 
        v.literal("MM"), v.literal("NV"), v.literal("UN")
      )),
      ESP: v.optional(v.union(
        v.literal("MA"), v.literal("EX"), v.literal("SS"), 
        v.literal("MM"), v.literal("NV"), v.literal("UN")
      )),
      CDP: v.optional(v.union(
        v.literal("MA"), v.literal("EX"), v.literal("SS"), 
        v.literal("MM"), v.literal("NV"), v.literal("UN")
      )),
      CCP: v.optional(v.union(
        v.literal("MA"), v.literal("EX"), v.literal("SS"), 
        v.literal("MM"), v.literal("NV"), v.literal("UN")
      )),
      REV: v.optional(v.union(
        v.literal("MA"), v.literal("EX"), v.literal("SS"), 
        v.literal("MM"), v.literal("NV"), v.literal("UN")
      )),
      BUG: v.optional(v.union(
        v.literal("MA"), v.literal("EX"), v.literal("SS"), 
        v.literal("MM"), v.literal("NV"), v.literal("UN")
      )),
      PCC: v.optional(v.union(
        v.literal("MA"), v.literal("EX"), v.literal("SS"), 
        v.literal("MM"), v.literal("NV"), v.literal("UN")
      )),
      CO: v.optional(v.union(
        v.literal("MA"), v.literal("EX"), v.literal("SS"), 
        v.literal("MM"), v.literal("NV"), v.literal("UN")
      )),
    })),
    
    primaryDivision: v.optional(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
    
    clubId: v.optional(v.id("clubs")),
    profilePicture: v.optional(v.string()),
    friends: v.optional(v.array(v.id("users"))),
    
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
    
    // Profile completion tracking
    profileCompleted: v.optional(v.boolean()),
    
    createdAt: v.optional(v.number()),
    lastActive: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_club", ["clubId"]),

  // IDPA Clubs
  clubs: defineTable({
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
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_active", ["active"]),

  // Tournaments
  tournaments: defineTable({
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
    
    // IDPA divisions enabled for this tournament
    divisions: v.array(v.union(
      v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"),
      v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO")
    )),
    
    // Custom award categories (Ladies, Veterans, etc.)
    customCategories: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      eligibilityCriteria: v.optional(v.string()),
    })),
    
    entryFee: v.number(),
    currency: v.string(),
    capacity: v.number(),
    
    squadConfig: v.object({
      numberOfSquads: v.number(),
      maxShootersPerSquad: v.number(),
    }),
    
    status: v.union(
      v.literal("draft"), 
      v.literal("published"), 
      v.literal("active"), 
      v.literal("completed")
    ),
    
    description: v.optional(v.string()),
    rules: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_club", ["clubId"])
    .index("by_date", ["date"])
    .index("by_status", ["status"])
    .index("by_registration_opens", ["registrationOpens"]),

  // Tournament squads
  squads: defineTable({
    tournamentId: v.id("tournaments"),
    name: v.string(),
    timeSlot: v.string(),
    maxShooters: v.number(),
    currentShooters: v.number(),
    
    status: v.union(
      v.literal("open"), 
      v.literal("full"), 
      v.literal("closed")
    ),
    
    assignedSO: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_tournament", ["tournamentId"])
    .index("by_status", ["status"]),

  // Tournament registrations
  registrations: defineTable({
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
    
    customCategories: v.array(v.string()), // IDs of custom categories
    
    status: v.union(
      v.literal("registered"), 
      v.literal("waitlist"), 
      v.literal("checked_in"), 
      v.literal("completed"), 
      v.literal("cancelled")
    ),
    
    paymentStatus: v.union(
      v.literal("pending"), 
      v.literal("paid"), 
      v.literal("refunded")
    ),
    
    paymentId: v.optional(v.string()),
    registeredAt: v.number(),
    checkedInAt: v.optional(v.number()),
  })
    .index("by_tournament", ["tournamentId"])
    .index("by_shooter", ["shooterId"])
    .index("by_squad", ["squadId"])
    .index("by_status", ["status"])
    .index("by_division", ["tournamentId", "division"]),

  // Tournament stages
  stages: defineTable({
    tournamentId: v.id("tournaments"),
    stageNumber: v.number(),
    name: v.string(),
    description: v.string(),
    
    // Visual stage designer data
    diagram: v.object({
      elements: v.array(v.object({
        type: v.string(), // wall, target, fault_line, etc.
        position: v.object({ x: v.number(), y: v.number() }),
        rotation: v.number(),
        properties: v.any(),
      })),
      dimensions: v.object({
        width: v.number(),
        height: v.number(),
      }),
    }),
    
    strings: v.number(),
    roundCount: v.number(),
    scoringType: v.string(),
    parTime: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_tournament", ["tournamentId"])
    .index("by_stage_number", ["tournamentId", "stageNumber"]),

  // IDPA Scores with real-time updates
  scores: defineTable({
    stageId: v.id("stages"),
    shooterId: v.id("users"),
    squadId: v.id("squads"),
    division: v.string(),
    classification: v.string(),
    scoredBy: v.id("users"), // Security Officer who scored
    
    // String-by-string scoring
    strings: v.array(v.object({
      time: v.number(),
      hits: v.object({
        down0: v.number(),  // -0 zone hits (perfect)
        down1: v.number(),  // -1 zone hits  
        down3: v.number(),  // -3 zone hits
        miss: v.number(),   // -5 points (complete misses)
        nonThreat: v.number(), // -5 points per hit on non-threat
      }),
    })),
    
    // IDPA penalty system
    penalties: v.object({
      procedural: v.number(),      // 3 seconds each
      nonThreat: v.number(),       // 5 seconds each  
      failureToNeutralize: v.number(), // 5 seconds
      flagrant: v.number(),        // 10 seconds each
      ftdr: v.number(),            // 20 seconds (Failure to Do Right)
      other: v.array(v.object({
        type: v.string(),
        count: v.number(),
        seconds: v.number(),
        description: v.optional(v.string()),
      })),
    }),
    
    // IDPA score calculations
    rawTime: v.number(),           // Total raw time for all strings
    pointsDown: v.number(),        // Total points down (0�down0 + 1�down1 + 3�down3 + 5�miss)
    penaltyTime: v.number(),       // Total penalty time in seconds  
    finalTime: v.number(),         // rawTime + pointsDown + penaltyTime
    stagePoints: v.number(),       // Stage points for match scoring
    stageRank: v.optional(v.number()),
    
    dnf: v.boolean(),
    dq: v.boolean(),
    scoredAt: v.number(),
    syncedAt: v.optional(v.number()),
  })
    .index("by_stage_shooter", ["stageId", "shooterId"])
    .index("by_squad", ["squadId"])
    .index("by_scored_at", ["scoredAt"])
    .index("by_division", ["stageId", "division"]),

  // Match results and rankings
  matchResults: defineTable({
    tournamentId: v.id("tournaments"),
    shooterId: v.id("users"),
    division: v.string(),
    classification: v.string(),
    customCategories: v.array(v.string()),
    
    totalTime: v.number(),
    totalPointsDown: v.number(),
    totalPenalties: v.number(),
    finalScore: v.number(), // totalTime + totalPointsDown + totalPenalties
    
    rankings: v.object({
      overallRank: v.number(),
      divisionRank: v.number(),
      classificationRank: v.number(),
      customCategoryRanks: v.array(v.object({
        categoryId: v.string(),
        rank: v.number(),
      })),
    }),
    
    stageRanks: v.array(v.object({
      stageId: v.id("stages"),
      rank: v.number(),
    })),
    
    awards: v.array(v.string()), // e.g., "Division Winner", "High Lady", etc.
    dq: v.boolean(),
    dnf: v.boolean(),
    calculatedAt: v.number(),
  })
    .index("by_tournament", ["tournamentId"])
    .index("by_shooter", ["shooterId"])
    .index("by_division", ["tournamentId", "division"])
    .index("by_classification", ["tournamentId", "division", "classification"]),

  // Digital achievement badges
  badges: defineTable({
    shooterId: v.id("users"),
    tournamentId: v.id("tournaments"),
    
    type: v.union(
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
    ),
    
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
    
    verificationCode: v.string(),
    shareCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_shooter", ["shooterId"])
    .index("by_tournament", ["tournamentId"])
    .index("by_type", ["type"])
    .index("by_created_date", ["createdAt"])
    .index("by_verification_code", ["verificationCode"])
    .index("by_shooter_tournament_type", ["shooterId", "tournamentId", "type"]),

  // Offline sync queue
  offlineQueue: defineTable({
    userId: v.id("users"),
    action: v.string(),
    data: v.any(),
    createdAt: v.number(),
    retries: v.number(),
    
    status: v.union(
      v.literal("pending"), 
      v.literal("processing"), 
      v.literal("completed"), 
      v.literal("failed")
    ),
    
    error: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_user_status", ["userId", "status"]),

  // Push notification subscriptions
  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    isActive: v.boolean(),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
    lastUsed: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_active", ["isActive"])
    .index("by_endpoint", ["endpoint"]),

  // In-app notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("tournament_update"),
      v.literal("score_posted"),
      v.literal("badge_earned"),
      v.literal("conflict_alert"),
      v.literal("registration_reminder"),
      v.literal("stage_completed"),
      v.literal("final_results"),
      v.literal("system_update")
    ),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    isRead: v.boolean(),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    sentAt: v.number(),
    readAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"])
    .index("by_type", ["type"])
    .index("by_priority", ["priority"])
    .index("by_sent_date", ["sentAt"]),

  // Notification preferences
  notificationPreferences: defineTable({
    userId: v.id("users"),
    emailNotifications: v.boolean(),
    pushNotifications: v.boolean(),
    preferences: v.object({
      tournamentUpdates: v.boolean(),
      scoreAlerts: v.boolean(),
      badgeNotifications: v.boolean(),
      systemUpdates: v.boolean(),
      conflictAlerts: v.boolean(),
      socialUpdates: v.boolean(),
    }),
    quietHours: v.optional(v.object({
      enabled: v.boolean(),
      startTime: v.string(), // "22:00"
      endTime: v.string(),   // "08:00"
      timezone: v.string(),
    })),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Audit trail for administrative actions
  auditLogs: defineTable({
    userId: v.id("users"), // Who performed the action
    action: v.string(), // What action was performed
    entityType: v.string(), // Type of entity affected (user, tournament, club, etc.)
    entityId: v.optional(v.string()), // ID of affected entity
    oldValues: v.optional(v.any()), // Previous state
    newValues: v.optional(v.any()), // New state
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_severity", ["severity"]),

  // System configuration and settings
  systemSettings: defineTable({
    key: v.string(), // Setting key (e.g., "maintenance_mode", "max_tournament_size")
    value: v.any(), // Setting value
    description: v.string(), // Human-readable description
    category: v.string(), // Category (system, tournament, scoring, etc.)
    isPublic: v.boolean(), // Whether setting is visible to non-admins
    lastModifiedBy: v.id("users"),
    lastModifiedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"]),

  // Security events and incidents
  securityEvents: defineTable({
    eventType: v.union(
      v.literal("login_attempt"),
      v.literal("failed_login"),
      v.literal("permission_denied"),
      v.literal("suspicious_activity"),
      v.literal("data_breach_attempt"),
      v.literal("system_intrusion"),
      v.literal("malware_detection"),
      v.literal("other")
    ),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("critical")
    ),
    userId: v.optional(v.id("users")), // User involved (if applicable)
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(v.any()), // Additional event data
    resolved: v.boolean(),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_severity", ["severity"])
    .index("by_type", ["eventType"])
    .index("by_resolved", ["resolved"])
    .index("by_user", ["userId"]),

  // Report templates for administrative reports
  reportTemplates: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("tournament_results"),
      v.literal("user_analytics"),
      v.literal("club_performance"),
      v.literal("financial"),
      v.literal("safety"),
      v.literal("custom")
    ),
    template: v.any(), // JSON template structure
    permissions: v.array(v.union(
      v.literal("admin"),
      v.literal("clubOwner"),
      v.literal("securityOfficer")
    )),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    lastUsed: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_active", ["isActive"])
    .index("by_creator", ["createdBy"]),

  // System analytics data
  systemAnalytics: defineTable({
    metric: v.string(), // Metric name (e.g., "daily_active_users", "tournament_count")
    value: v.number(), // Metric value
    dimensions: v.optional(v.any()), // Additional dimensions (e.g., by division, club)
    timestamp: v.number(), // When metric was recorded
    period: v.union(
      v.literal("hourly"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
  })
    .index("by_metric", ["metric"])
    .index("by_timestamp", ["timestamp"])
    .index("by_period", ["period"]),
});