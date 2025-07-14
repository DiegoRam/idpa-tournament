"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api, Id } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveLeaderboard } from "@/components/features/leaderboard/LiveLeaderboard";
import { 
  ArrowLeft,
  Trophy, 
  Users,
  Target,
  Activity,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";

export default function TournamentLeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as Id<"tournaments">;
  
  const tournament = useQuery(api.tournaments.getTournamentById, { tournamentId });
  const leaderboard = useQuery(api.scoring.getTournamentLeaderboard, { tournamentId });
  const registrations = useQuery(api.registrations.getRegistrationsByTournament, { tournamentId });
  const stages = useQuery(api.stages.getStagesByTournament, { tournamentId });
  
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Update timestamp when leaderboard changes
  useEffect(() => {
    if (leaderboard) {
      setLastUpdated(new Date());
    }
  }, [leaderboard]);
  
  if (!tournament) {
    return null;
  }
  
  const checkedInShooters = registrations?.filter(r => r.status === "checked_in").length || 0;
  const totalStages = stages?.length || 0;
  const scoredShooters = leaderboard?.filter(s => s.completedStages && s.completedStages > 0).length || 0;
  
  // Calculate division statistics
  const divisionStats = registrations?.reduce((stats, reg) => {
    if (reg.status === "checked_in") {
      stats[reg.division] = (stats[reg.division] || 0) + 1;
    }
    return stats;
  }, {} as Record<string, number>) || {};
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/tournaments/${tournamentId}`)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournament
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-400 flex items-center gap-3">
              <Trophy className="h-8 w-8" />
              {tournament.name}
            </h1>
            <p className="text-gray-400 mt-1">
              Live Leaderboard • {new Date(tournament.date).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant={tournament.status === "active" ? "default" : "secondary"}
              className={tournament.status === "active" ? "bg-green-600" : ""}
            >
              <Activity className="h-3 w-3 mr-1" />
              {tournament.status}
            </Badge>
            <div className="text-right">
              <p className="text-xs text-gray-500">Last updated</p>
              <p className="text-sm text-gray-300">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tournament Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Shooters</p>
                <p className="text-2xl font-bold text-green-400">{checkedInShooters}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Stages</p>
                <p className="text-2xl font-bold text-blue-400">{totalStages}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Scored</p>
                <p className="text-2xl font-bold text-yellow-400">{scoredShooters}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Progress</p>
                <p className="text-2xl font-bold text-purple-400">
                  {checkedInShooters > 0 ? Math.round((scoredShooters / checkedInShooters) * 100) : 0}%
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
            {Object.entries(divisionStats).map(([division, count]) => (
              <div key={division} className="text-center p-3 bg-gray-800/50 rounded">
                <p className="text-sm font-bold text-green-400">{division}</p>
                <p className="text-lg font-bold text-gray-200">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Live Leaderboard */}
      <LiveLeaderboard tournamentId={tournamentId} />
    </div>
  );
}