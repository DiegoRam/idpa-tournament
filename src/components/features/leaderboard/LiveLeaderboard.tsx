"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api, Id } from "@/lib/convex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Medal, 
  Award, 
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/types/scoring";

interface LiveLeaderboardProps {
  tournamentId: Id<"tournaments">;
  className?: string;
}

export function LiveLeaderboard({ tournamentId, className }: LiveLeaderboardProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>("overall");
  const [selectedClassification, setSelectedClassification] = useState<string | undefined>();
  
  const leaderboard = useQuery(api.scoring.getTournamentLeaderboard, {
    tournamentId,
    division: selectedDivision === "overall" ? undefined : selectedDivision as "SSP" | "ESP" | "CDP" | "CCP" | "REV" | "BUG" | "PCC" | "CO",
    classification: selectedClassification as "MA" | "EX" | "SS" | "MM" | "NV" | "UN",
  });
  
  const tournament = useQuery(api.tournaments.getTournamentById, { tournamentId });
  
  if (!tournament || !leaderboard) {
    return null;
  }
  
  const divisions = ["overall", "SSP", "ESP", "CDP", "CCP", "REV", "BUG", "PCC", "CO"];
  const classifications = ["MA", "EX", "SS", "MM", "NV", "UN"];
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-green-400 flex items-center gap-3">
            <Trophy className="h-8 w-8" />
            Live Leaderboard
          </CardTitle>
          <p className="text-gray-400">
            {tournament.name} • {new Date(tournament.date).toLocaleDateString()}
          </p>
        </CardHeader>
      </Card>
      
      {/* Division Tabs */}
      <Tabs value={selectedDivision} onValueChange={setSelectedDivision}>
        <TabsList className="grid grid-cols-5 lg:grid-cols-9 w-full">
          {divisions.map((division) => (
            <TabsTrigger 
              key={division} 
              value={division}
              className="text-xs data-[state=active]:bg-green-600"
            >
              {division === "overall" ? "Overall" : division}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Classification Filter */}
        {selectedDivision !== "overall" && (
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedClassification(undefined)}
              className={cn(
                "px-3 py-1 text-xs rounded border transition-colors",
                !selectedClassification 
                  ? "bg-green-600 border-green-500 text-white" 
                  : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
              )}
            >
              All Classes
            </button>
            {classifications.map((classification) => (
              <button
                key={classification}
                onClick={() => setSelectedClassification(classification)}
                className={cn(
                  "px-3 py-1 text-xs rounded border transition-colors",
                  selectedClassification === classification
                    ? "bg-green-600 border-green-500 text-white" 
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                )}
              >
                {classification}
              </button>
            ))}
          </div>
        )}
        
        <TabsContent value={selectedDivision} className="mt-6">
          <LeaderboardTable 
            shooters={leaderboard} 
            showDivision={selectedDivision === "overall"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface LeaderboardTableProps {
  shooters: {
    shooterId?: string;
    shooterName?: string;
    division?: string;
    classification?: string;
    totalTime?: number;
    completedStages?: number;
    totalStages?: number;
    rank: number;
    divisionRank?: number;
    dnf?: boolean;
    dq?: boolean;
  }[];
  showDivision: boolean;
}

function LeaderboardTable({ shooters, showDivision }: LeaderboardTableProps) {
  if (shooters.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="h-12 w-12 text-gray-600 mb-4" />
          <p className="text-gray-400 mb-2">No scores yet</p>
          <p className="text-sm text-gray-500">
            Scores will appear here as Security Officers enter them
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-3">
      {shooters.map((shooter) => (
        <ShooterRankCard 
          key={shooter.shooterId} 
          shooter={shooter}
          showDivision={showDivision}
        />
      ))}
    </div>
  );
}

interface ShooterRankCardProps {
  shooter: {
    shooterId?: string;
    shooterName?: string;
    division?: string;
    classification?: string;
    totalTime?: number;
    completedStages?: number;
    totalStages?: number;
    rank: number;
    divisionRank?: number;
    dnf?: boolean;
    dq?: boolean;
  };
  showDivision: boolean;
}

function ShooterRankCard({ shooter, showDivision }: ShooterRankCardProps) {
  const rank = shooter.divisionRank || shooter.rank;
  const isTop3 = rank <= 3 && !shooter.dnf && !shooter.dq;
  const completionPercentage = shooter.completedStages && shooter.totalStages 
    ? (shooter.completedStages / shooter.totalStages) * 100 
    : 0;
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2: return <Medal className="h-5 w-5 text-gray-300" />;
      case 3: return <Award className="h-5 w-5 text-orange-400" />;
      default: return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };
  
  return (
    <Card className={cn(
      "transition-all duration-200 hover:border-gray-700",
      isTop3 ? "bg-gradient-to-r from-gray-900 to-gray-800/50 border-green-800" : "bg-gray-900/50 border-gray-800"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Rank and Shooter Info */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 flex items-center justify-center">
              {shooter.dnf || shooter.dq ? (
                <span className="text-red-400 font-bold text-xs">
                  {shooter.dnf ? "DNF" : "DQ"}
                </span>
              ) : (
                getRankIcon(rank)
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-gray-100 truncate">
                  {shooter.shooterName || "Unknown Shooter"}
                </h3>
                <div className="flex items-center gap-2">
                  {showDivision && (
                    <Badge variant="outline" className="text-xs bg-blue-900/20 border-blue-800">
                      {shooter.division || "UN"}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs bg-purple-900/20 border-purple-800">
                    {shooter.classification || "UN"}
                  </Badge>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <Progress 
                  value={completionPercentage} 
                  className="h-2 flex-1"
                />
                <span className="text-xs text-gray-500 min-w-0">
                  {shooter.completedStages || 0}/{shooter.totalStages || 0}
                </span>
              </div>
            </div>
          </div>
          
          {/* Score and Time */}
          <div className="text-right">
            {shooter.dnf || shooter.dq ? (
              <div className="text-red-400 font-bold">
                {shooter.dnf ? "Did Not Finish" : "Disqualified"}
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-400 font-mono">
                  {formatTime(shooter.totalTime || 0)}
                </div>
                <div className="text-xs text-gray-500">
                  {shooter.completedStages && shooter.totalTime && shooter.completedStages > 0 && (
                    <>Avg: {formatTime(shooter.totalTime / shooter.completedStages)}</>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Additional Stats for Top 10 */}
        {rank <= 10 && !shooter.dnf && !shooter.dq && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Stages</p>
                <p className="text-sm font-medium text-gray-300">
                  {shooter.completedStages || 0}/{shooter.totalStages || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Time</p>
                <p className="text-sm font-medium text-green-400 font-mono">
                  {formatTime(shooter.totalTime || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Position</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-medium text-gray-300">#{rank}</span>
                  {/* TODO: Add position change indicator */}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}