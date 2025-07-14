"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api, Id } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { ScoreEntryForm } from "@/components/features/scoring/ScoreEntryForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function ScoreEntryPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as Id<"tournaments">;
  const stageId = params.stageId as Id<"stages">;
  const shooterId = params.shooterId as Id<"users">;
  
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const tournament = useQuery(api.tournaments.getTournamentById, { tournamentId });
  const stage = useQuery(api.stages.getStage, { stageId });
  const registration = useQuery(api.registrations.getRegistrationByShooterAndTournament, {
    shooterId,
    tournamentId,
  });
  
  // Check access
  const hasAccess = currentUser && (
    currentUser.role === "admin" || 
    currentUser.role === "securityOfficer"
  );
  
  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-red-900/20 border-red-800">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              You are not authorized to score this tournament.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!tournament || !stage || !registration) {
    return null;
  }
  
  const squadId = registration.squadId;
  if (!squadId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-red-900/20 border-red-800">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              No Squad Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              This shooter is not assigned to a squad.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleComplete = () => {
    // Navigate back to squad scoring page
    router.push(`/scoring/${tournamentId}/squad/${squadId}`);
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Navigation */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Squad
        </Button>
        
        {/* Score Entry Form */}
        <ScoreEntryForm
          tournamentId={tournamentId}
          stageId={stageId}
          shooterId={shooterId}
          squadId={squadId}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}