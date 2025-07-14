"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api, Id } from "@/lib/convex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Eye,
  Trophy, 
  Users,
  Target,
  Activity,
  MapPin,
  Calendar,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { formatTime } from "@/types/scoring";

export default function SpectatorModePage() {
  const params = useParams();
  const tournamentId = params.tournamentId as Id<"tournaments">;
  
  const spectatorData = useQuery(api.scoring.getSpectatorData, { tournamentId });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Update timestamp when data changes
  useEffect(() => {
    if (spectatorData) {
      setLastUpdated(new Date());
    }
  }, [spectatorData]);
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!spectatorData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Eye className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">Tournament not available</p>
            <p className="text-sm text-gray-500">
              This tournament may not be active or accessible for spectators
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { tournament, stats, leaderboard } = spectatorData;
  
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-400 flex items-center gap-3">
                <Eye className="h-6 w-6" />
                {tournament.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(tournament.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {tournament.location.venue}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  {tournament.club}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <Badge className="bg-green-600 mb-2">
                <Activity className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
              <p className="text-xs text-gray-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Tournament Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Shooters</p>
                  <p className="text-2xl font-bold text-green-400">{stats.totalShooters}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Scored</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.completedScores}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Progress</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.totalShooters > 0 
                      ? Math.round((stats.completedScores / stats.totalShooters) * 100)
                      : 0}%
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="text-2xl font-bold text-purple-400 capitalize">
                    {tournament.status}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Division Breakdown */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-gray-200">Division Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {Object.entries(stats.divisionCounts).map(([division, count]) => (
                <div key={division} className="text-center p-3 bg-gray-800/50 rounded">
                  <p className="text-sm font-bold text-green-400">{division}</p>
                  <p className="text-lg font-bold text-gray-200">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Live Leaderboard */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-green-400 flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Live Leaderboard - Top 10
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No scores yet</p>
                <p className="text-sm text-gray-500">
                  Results will appear here as shooting begins
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((shooter, index) => (
                  <SpectatorLeaderboardRow 
                    key={shooter.shooterId} 
                    shooter={shooter}
                    rank={index + 1}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center py-4 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            Live spectator view • Updates automatically every 30 seconds
          </p>
          <p className="text-xs text-gray-600 mt-1">
            IDPA Tournament Management System
          </p>
        </div>
      </div>
    </div>
  );
}

interface SpectatorLeaderboardRowProps {
  shooter: {
    shooterId?: string;
    shooterName?: string;
    division?: string;
    classification?: string;
    totalTime?: number;
    completedStages?: number;
    totalStages?: number;
    dnf?: boolean;
    dq?: boolean;
  };
  rank: number;
}

function SpectatorLeaderboardRow({ shooter, rank }: SpectatorLeaderboardRowProps) {
  const isTop3 = rank <= 3 && !shooter.dnf && !shooter.dq;
  const completionPercentage = shooter.completedStages && shooter.totalStages 
    ? (shooter.completedStages / shooter.totalStages) * 100 
    : 0;
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2: return <Trophy className="h-5 w-5 text-gray-300" />;
      case 3: return <Trophy className="h-5 w-5 text-orange-400" />;
      default: return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };
  
  return (
    <div className={`p-4 rounded transition-all ${
      isTop3 ? "bg-gradient-to-r from-gray-800 to-gray-700/50 border border-green-800" : "bg-gray-800/50"
    }`}>
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
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-100 text-lg">
                {shooter.shooterName || "Unknown Shooter"}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-blue-900/20 border-blue-800">
                  {shooter.division || "UN"}
                </Badge>
                <Badge variant="outline" className="text-xs bg-purple-900/20 border-purple-800">
                  {shooter.classification || "UN"}
                </Badge>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex items-center gap-2">
              <Progress value={completionPercentage} className="h-2 flex-1" />
              <span className="text-xs text-gray-500 min-w-0">
                {shooter.completedStages || 0}/{shooter.totalStages || 0}
              </span>
            </div>
          </div>
        </div>
        
        {/* Score */}
        <div className="text-right">
          {shooter.dnf || shooter.dq ? (
            <div className="text-red-400 font-bold">
              {shooter.dnf ? "DNF" : "DQ"}
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold text-green-400 font-mono">
                {formatTime(shooter.totalTime || 0)}
              </div>
              {shooter.completedStages && shooter.totalTime && shooter.completedStages > 0 && (
                <div className="text-sm text-gray-500">
                  Avg: {formatTime(shooter.totalTime / shooter.completedStages)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}