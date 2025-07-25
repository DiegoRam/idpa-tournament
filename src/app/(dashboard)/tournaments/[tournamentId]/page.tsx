"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Target,
  Trophy,
  Eye,
  Edit,
  Settings
} from "lucide-react";
import Link from "next/link";

const TOURNAMENT_STATUS_COLORS = {
  draft: "bg-gray-500",
  published: "bg-green-500", 
  active: "bg-blue-500",
  completed: "bg-purple-500"
};

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as string;
  
  const tournament = useQuery(api.tournaments.getTournamentById, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tournamentId ? { tournamentId: tournamentId as any } : "skip"
  );
  
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const publishTournament = useMutation(api.tournaments.publishTournament);
  
  const existingRegistration = useQuery(api.registrations.getRegistrationByUserAndTournament,
    tournament && currentUser ? {
      userId: currentUser._id,
      tournamentId: tournament._id
    } : "skip"
  );
  
  const stages = useQuery(api.stages.getStagesByTournament,
    tournament ? { tournamentId: tournament._id } : "skip"
  );
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const handlePublishTournament = async () => {
    if (!tournament) return;
    
    setIsPublishing(true);
    setPublishError("");
    
    try {
      await publishTournament({ tournamentId: tournament._id });
      // Tournament will re-render with new status
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to publish tournament";
      setPublishError(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };
  
  if (tournament === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-green-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-300">Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (tournament === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Tournament Not Found</h2>
          <p className="text-gray-400 mb-4">The tournament you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button onClick={() => router.push("/tournaments")}>
            Back to Tournaments
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric", 
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const canRegister = tournament.status === "published" && 
    currentUser?.role === "shooter" &&
    tournament.registrationOpens <= Date.now() &&
    tournament.registrationCloses >= Date.now();

  const canManage = currentUser?.role === "clubOwner" || currentUser?.role === "admin";
  const canPublish = canManage && tournament.status === "draft";

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/tournaments" 
            className="inline-flex items-center text-gray-400 hover:text-green-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
              <div className="flex items-center space-x-3 mb-4">
                <Badge 
                  className={`${TOURNAMENT_STATUS_COLORS[tournament.status]} text-white capitalize`}
                >
                  {tournament.status}
                </Badge>
                <Badge variant="outline" className="text-gray-300">
                  {tournament.matchType}
                </Badge>
                <div className="flex items-center text-gray-400">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{tournament.currency} {tournament.entryFee}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              {publishError && (
                <div className="text-red-400 text-sm p-2 bg-red-400/10 rounded border border-red-400/20">
                  {publishError}
                </div>
              )}
              
              <div className="flex space-x-2">
                {canRegister && !existingRegistration && (
                  <Button 
                    variant="tactical" 
                    size="lg"
                    onClick={() => router.push(`/tournaments/${tournamentId}/register`)}
                  >
                    Register Now
                  </Button>
                )}
                
                {existingRegistration && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-4 py-2">
                    ✓ Registered
                  </Badge>
                )}
                
                {(tournament.status === "active" || tournament.status === "completed") && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => router.push(`/tournaments/${tournamentId}/leaderboard`)}
                    className="flex items-center space-x-2"
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Live Results</span>
                  </Button>
                )}
                
                {canPublish && (
                  <Button 
                    variant="tactical" 
                    size="lg" 
                    onClick={handlePublishTournament}
                    disabled={isPublishing}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{isPublishing ? "Publishing..." : "Publish Tournament"}</span>
                  </Button>
                )}
                
                {canManage && (
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => router.push(`/scoring/${tournamentId}/stages`)}
                      className="flex items-center space-x-2"
                    >
                      <Target className="h-4 w-4" />
                      <span>Manage Stages</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => router.push(`/tournaments/${tournamentId}/squads`)}
                      className="flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Manage Squads</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => router.push(`/tournaments/${tournamentId}/edit`)}
                      className="flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Tournament</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tournament Details */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Tournament Date</Label>
                    <p className="text-white">{formatDate(tournament.date)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Match Type</Label>
                    <p className="text-white">{tournament.matchType}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Registration Opens</Label>
                    <p className="text-white">{formatDate(tournament.registrationOpens)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Registration Closes</Label>
                    <p className="text-white">{formatDate(tournament.registrationCloses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">{tournament.location.venue}</h3>
                  <p className="text-gray-300">{tournament.location.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Divisions */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Divisions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tournament.divisions.map(division => (
                    <Badge key={division} variant="secondary" className="text-sm">
                      {division}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {tournament.description && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 whitespace-pre-wrap">{tournament.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Rules */}
            {tournament.rules && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Special Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 whitespace-pre-wrap">{tournament.rules}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Info */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Registration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-400">Capacity</Label>
                  <p className="text-white text-xl font-semibold">{tournament.capacity} shooters</p>
                </div>
                <div>
                  <Label className="text-gray-400">Entry Fee</Label>
                  <p className="text-white text-xl font-semibold">
                    {tournament.currency} {tournament.entryFee}
                  </p>
                </div>
                {tournament.status === "published" && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-sm font-medium">
                      ✅ Registration Open
                    </p>
                  </div>
                )}
                {tournament.status === "draft" && (
                  <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                    <p className="text-gray-400 text-sm font-medium mb-2">
                      📝 Draft - Not yet published
                    </p>
                    {canPublish && (
                      <p className="text-gray-500 text-xs">
                        Click &quot;Publish Tournament&quot; to open registration
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Squad Configuration */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Squad Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-gray-400">Number of Squads</Label>
                  <span className="text-white">{tournament.squadConfig.numberOfSquads}</span>
                </div>
                <div className="flex justify-between">
                  <Label className="text-gray-400">Max per Squad</Label>
                  <span className="text-white">{tournament.squadConfig.maxShootersPerSquad}</span>
                </div>
                <div className="flex justify-between">
                  <Label className="text-gray-400">Total Capacity</Label>
                  <span className="text-white font-semibold">
                    {tournament.squadConfig.numberOfSquads * tournament.squadConfig.maxShootersPerSquad}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Stages */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Stages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stages && stages.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-400">Total Stages</Label>
                      <span className="text-white font-semibold">{stages.length}</span>
                    </div>
                    <div className="space-y-2">
                      {stages.slice(0, 5).map((stage) => (
                        <div key={stage._id} className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">
                            Stage {stage.stageNumber}: {stage.name}
                          </span>
                          {stage.diagram && (
                            <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                              Designed
                            </Badge>
                          )}
                        </div>
                      ))}
                      {stages.length > 5 && (
                        <p className="text-gray-500 text-sm italic">
                          and {stages.length - 5} more...
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Target className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No stages created yet</p>
                    {canManage && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => router.push(`/scoring/${tournamentId}/stages`)}
                      >
                        Create Stages
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Categories */}
            {tournament.customCategories && tournament.customCategories.length > 0 && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Special Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tournament.customCategories.map(category => (
                    <div key={category.id} className="border-l-2 border-green-500 pl-3">
                      <h4 className="font-semibold text-white">{category.name}</h4>
                      {category.description && (
                        <p className="text-gray-400 text-sm">{category.description}</p>
                      )}
                      {category.eligibilityCriteria && (
                        <p className="text-gray-500 text-xs">
                          Eligibility: {category.eligibilityCriteria}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}