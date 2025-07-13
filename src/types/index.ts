import { type Id } from "../../convex/_generated/dataModel";

// IDPA specific types
export type IDPADivision = "SSP" | "ESP" | "CDP" | "CCP" | "REV" | "BUG" | "PCC" | "CO";

export type IDPAClassification = "MA" | "EX" | "SS" | "MM" | "NV" | "UN";

export type UserRole = "admin" | "clubOwner" | "securityOfficer" | "shooter";

export type TournamentStatus = "draft" | "published" | "active" | "completed";

export type RegistrationStatus = "registered" | "waitlist" | "checked_in" | "completed" | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded";

export type SquadStatus = "open" | "full" | "closed";

export type BadgeType = 
  | "participation"
  | "division_winner"
  | "class_winner"
  | "category_winner"
  | "stage_winner"
  | "personal_best"
  | "clean_stage"
  | "top_10_percent"
  | "most_improved"
  | "high_overall";

// User related interfaces
export interface User {
  _id: Id<"users">;
  email: string;
  name: string;
  role: UserRole;
  idpaMemberNumber?: string;
  classifications: {
    SSP?: IDPAClassification;
    ESP?: IDPAClassification;
    CDP?: IDPAClassification;
    CCP?: IDPAClassification;
    REV?: IDPAClassification;
    BUG?: IDPAClassification;
    PCC?: IDPAClassification;
    CO?: IDPAClassification;
  };
  primaryDivision?: IDPADivision;
  clubId?: Id<"clubs">;
  profilePicture?: string;
  friends: Id<"users">[];
  preferences: {
    notifications: boolean;
    defaultDivision?: string;
    homeLocation?: {
      lat: number;
      lng: number;
    };
  };
  demographics?: {
    gender?: string;
    birthDate?: number;
    isVeteran?: boolean;
    isLawEnforcement?: boolean;
  };
  createdAt: number;
  lastActive: number;
}

// Club related interfaces
export interface Club {
  _id: Id<"clubs">;
  name: string;
  ownerId: Id<"users">;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
  logo?: string;
  active: boolean;
  createdAt: number;
}

// Tournament related interfaces
export interface CustomCategory {
  id: string;
  name: string;
  description?: string;
  eligibilityCriteria?: string;
}

export interface Tournament {
  _id: Id<"tournaments">;
  name: string;
  clubId: Id<"clubs">;
  date: number;
  registrationOpens: number;
  registrationCloses: number;
  location: {
    venue: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  matchType: string;
  divisions: IDPADivision[];
  customCategories: CustomCategory[];
  entryFee: number;
  currency: string;
  capacity: number;
  squadConfig: {
    numberOfSquads: number;
    maxShootersPerSquad: number;
  };
  status: TournamentStatus;
  description?: string;
  rules?: string;
  createdAt: number;
  updatedAt: number;
}

// Squad related interfaces
export interface Squad {
  _id: Id<"squads">;
  tournamentId: Id<"tournaments">;
  name: string;
  timeSlot: string;
  maxShooters: number;
  currentShooters: number;
  status: SquadStatus;
  assignedSO?: Id<"users">;
  createdAt: number;
}

export interface SquadMember {
  userId: Id<"users">;
  name: string;
  division: IDPADivision;
  classification: IDPAClassification;
  clubId?: Id<"clubs">;
  isFriend: boolean;
  isClubmate: boolean;
  profilePicture?: string;
}

export interface SquadWithMembers extends Squad {
  members: SquadMember[];
  availableSlots: number;
}

// Registration related interfaces
export interface Registration {
  _id: Id<"registrations">;
  tournamentId: Id<"tournaments">;
  shooterId: Id<"users">;
  squadId: Id<"squads">;
  division: IDPADivision;
  classification: IDPAClassification;
  customCategories: string[];
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  registeredAt: number;
  checkedInAt?: number;
}

// Stage related interfaces
export interface StageElement {
  type: string;
  position: { x: number; y: number };
  rotation: number;
  properties: any;
}

export interface Stage {
  _id: Id<"stages">;
  tournamentId: Id<"tournaments">;
  stageNumber: number;
  name: string;
  description: string;
  diagram: {
    elements: StageElement[];
    dimensions: {
      width: number;
      height: number;
    };
  };
  strings: number;
  roundCount: number;
  scoringType: string;
  parTime?: number;
  createdAt: number;
}

// Scoring related interfaces
export interface HitZones {
  down0: number;  // -0 zone hits (perfect)
  down1: number;  // -1 zone hits
  down3: number;  // -3 zone hits
  miss: number;   // -5 points (complete misses)
  nonThreat: number; // -5 points per hit on non-threat
}

export interface StringScore {
  time: number;
  hits: HitZones;
}

export interface Penalties {
  procedural: number;      // 3 seconds each
  nonThreat: number;       // 5 seconds each
  failureToNeutralize: number; // 5 seconds
  flagrant: number;        // 10 seconds each
  ftdr: number;            // 20 seconds (Failure to Do Right)
  other: Array<{
    type: string;
    count: number;
    seconds: number;
    description?: string;
  }>;
}

export interface Score {
  _id: Id<"scores">;
  stageId: Id<"stages">;
  shooterId: Id<"users">;
  squadId: Id<"squads">;
  division: string;
  classification: string;
  scoredBy: Id<"users">; // Security Officer who scored
  strings: StringScore[];
  penalties: Penalties;
  rawTime: number;           // Total raw time for all strings
  pointsDown: number;        // Total points down calculation
  penaltyTime: number;       // Total penalty time in seconds
  finalTime: number;         // rawTime + pointsDown + penaltyTime
  stagePoints: number;       // Stage points for match scoring
  stageRank?: number;
  dnf: boolean;
  dq: boolean;
  scoredAt: number;
  syncedAt?: number;
}

// Results related interfaces
export interface Ranking {
  overallRank: number;
  divisionRank: number;
  classificationRank: number;
  customCategoryRanks: Array<{
    categoryId: string;
    rank: number;
  }>;
}

export interface MatchResult {
  _id: Id<"matchResults">;
  tournamentId: Id<"tournaments">;
  shooterId: Id<"users">;
  division: string;
  classification: string;
  customCategories: string[];
  totalTime: number;
  totalPointsDown: number;
  totalPenalties: number;
  finalScore: number;
  rankings: Ranking;
  stageRanks: Array<{
    stageId: Id<"stages">;
    rank: number;
  }>;
  awards: string[];
  dq: boolean;
  dnf: boolean;
  calculatedAt: number;
}

// Badge related interfaces
export interface BadgeMetadata {
  division?: string;
  classification?: string;
  category?: string;
  placement?: number;
  score?: number;
  stageNumber?: number;
  improvement?: number;
}

export interface Badge {
  _id: Id<"badges">;
  shooterId: Id<"users">;
  tournamentId: Id<"tournaments">;
  type: BadgeType;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  metadata: BadgeMetadata;
  verificationCode: string;
  shareCount: number;
  earnedAt: number;
}

// API response types
export interface TournamentStats {
  tournament: Tournament;
  registrationSummary: {
    totalRegistered: number;
    totalWaitlisted: number;
    totalCheckedIn: number;
    capacity: number;
    fillRate: number;
  };
  divisionStats: Array<{
    division: IDPADivision;
    count: number;
    classifications: Record<IDPAClassification, number>;
  }>;
  squadStats: Array<{
    squadId: Id<"squads">;
    name: string;
    filled: number;
    capacity: number;
    fillRate: number;
    status: SquadStatus;
  }>;
}

export interface WaitlistPosition {
  position: number;
  totalWaitlisted: number;
}

// Form types for creating/updating entities
export interface CreateTournamentInput {
  name: string;
  clubId: Id<"clubs">;
  date: number;
  registrationOpens: number;
  registrationCloses: number;
  location: {
    venue: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  matchType: string;
  divisions: IDPADivision[];
  customCategories?: CustomCategory[];
  entryFee: number;
  currency: string;
  capacity: number;
  squadConfig: {
    numberOfSquads: number;
    maxShootersPerSquad: number;
  };
  description?: string;
  rules?: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: UserRole;
  idpaMemberNumber?: string;
  primaryDivision?: IDPADivision;
  clubId?: Id<"clubs">;
}

export interface CreateClubInput {
  name: string;
  ownerId: Id<"users">;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
  logo?: string;
}

// UI component props
export interface DivisionBadgeProps {
  division: IDPADivision;
  className?: string;
}

export interface ClassificationBadgeProps {
  classification: IDPAClassification;
  className?: string;
}

export interface StatusBadgeProps {
  status: TournamentStatus | RegistrationStatus | SquadStatus;
  className?: string;
}

// Utility types
export type WithLoading<T> = {
  data: T;
  isLoading: boolean;
  error?: string;
};

export type PaginatedResult<T> = {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  cursor?: string;
};