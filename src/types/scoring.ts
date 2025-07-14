// IDPA Scoring Types and Interfaces

export type IDPADivision = "SSP" | "ESP" | "CDP" | "CCP" | "REV" | "BUG" | "PCC" | "CO";
export type IDPAClassification = "MA" | "EX" | "SS" | "MM" | "NV" | "UN";

// Hit zone types for IDPA targets
export interface HitZone {
  down0: number;  // Center hits (0 points down)
  down1: number;  // -1 zone hits (1 point down each)
  down3: number;  // -3 zone hits (3 points down each)
  miss: number;   // Complete misses (5 points down each)
  nonThreat: number; // Hits on non-threat targets (5 points down each)
}

// String scoring data
export interface StringScore {
  time: number;
  hits: HitZone;
}

// IDPA Penalty types
export interface IDPAPenalties {
  procedural: number;      // PE: 3 seconds each
  nonThreat: number;       // HNT: 5 seconds each (separate from hit tracking)
  failureToNeutralize: number; // FTN: 5 seconds
  flagrant: number;        // FP: 10 seconds each
  ftdr: number;            // FTDR: 20 seconds (Failure to Do Right)
  other: CustomPenalty[];
}

export interface CustomPenalty {
  type: string;
  count: number;
  seconds: number;
  description?: string;
}

// Complete score for a stage
export interface StageScore {
  stageId: string;
  shooterId: string;
  squadId: string;
  division: IDPADivision;
  classification: IDPAClassification;
  scoredBy: string;
  strings: StringScore[];
  penalties: IDPAPenalties;
  rawTime: number;
  pointsDown: number;
  penaltyTime: number;
  finalTime: number;
  stagePoints: number;
  stageRank?: number;
  dnf: boolean;
  dq: boolean;
  scoredAt: number;
  syncedAt?: number;
}

// Stage configuration
export interface Stage {
  _id: string;
  tournamentId: string;
  stageNumber: number;
  name: string;
  description: string;
  strings: number;
  roundCount: number;
  scoringType: string;
  parTime?: number;
  diagram: StageDiagram;
  createdAt: number;
}

export interface StageDiagram {
  elements: DiagramElement[];
  dimensions: {
    width: number;
    height: number;
  };
}

export interface DiagramElement {
  type: "target" | "non-threat" | "wall" | "fault-line" | "prop";
  position: { x: number; y: number };
  rotation: number;
  properties: Record<string, unknown>;
}

// Target display configuration
export interface TargetConfig {
  id: string;
  type: "threat" | "non-threat";
  position: { x: number; y: number };
  rotation: number;
  hits?: HitZone;
}

// Scoring progress tracking
export interface ShooterProgress {
  shooterId: string;
  shooterName: string;
  division: IDPADivision;
  classification: IDPAClassification;
  stageProgress: StageProgress[];
  completedStages: number;
  totalStages: number;
  progressPercentage: number;
}

export interface StageProgress {
  stageId: string;
  stageNumber: number;
  stageName: string;
  scored: boolean;
  finalTime?: number;
  dnf: boolean;
  dq: boolean;
}

// Ranking data
export interface StageRanking {
  division: IDPADivision;
  rankings: RankEntry[];
}

export interface RankEntry {
  rank: number;
  scoreId: string;
  shooterId: string;
  shooterName: string;
  finalTime: number;
  dnf: boolean;
  dq: boolean;
}

// Score validation rules
export interface ScoreValidation {
  isValid: boolean;
  errors: string[];
}

// Common penalty descriptions
export const PENALTY_DESCRIPTIONS = {
  procedural: "Procedural Error (PE) - 3 seconds",
  nonThreat: "Hit on Non-Threat (HNT) - 5 seconds",
  failureToNeutralize: "Failure to Neutralize (FTN) - 5 seconds",
  flagrant: "Flagrant Penalty (FP) - 10 seconds",
  ftdr: "Failure to Do Right (FTDR) - 20 seconds",
} as const;

// Helper to calculate total hits for validation
export function getTotalHits(hits: HitZone): number {
  return hits.down0 + hits.down1 + hits.down3 + hits.miss;
}

// Helper to validate hit count against round count
export function validateHitCount(hits: HitZone, expectedRounds: number): boolean {
  const totalHits = getTotalHits(hits);
  return totalHits <= expectedRounds;
}

// Helper to format time for display (MM:SS.SS)
export function formatTime(seconds: number): string {
  if (seconds < 0) return "0:00.00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
}

// Helper to calculate IDPA score breakdown
export function calculateScoreBreakdown(
  strings: StringScore[],
  penalties: IDPAPenalties
): {
  rawTime: number;
  pointsDown: number;
  penaltyTime: number;
  finalTime: number;
} {
  // Calculate raw time
  const rawTime = strings.reduce((total, string) => total + string.time, 0);
  
  // Calculate points down
  let pointsDown = 0;
  strings.forEach(string => {
    pointsDown += 
      string.hits.down0 * 0 +
      string.hits.down1 * 1 +
      string.hits.down3 * 3 +
      string.hits.miss * 5 +
      string.hits.nonThreat * 5;
  });
  
  // Calculate penalty time
  const penaltyTime = 
    penalties.procedural * 3 +
    penalties.nonThreat * 5 +
    penalties.failureToNeutralize * 5 +
    penalties.flagrant * 10 +
    penalties.ftdr * 20 +
    penalties.other.reduce((total, p) => total + p.count * p.seconds, 0);
  
  const finalTime = rawTime + pointsDown + penaltyTime;
  
  return {
    rawTime,
    pointsDown,
    penaltyTime,
    finalTime,
  };
}