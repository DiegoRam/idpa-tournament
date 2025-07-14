"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/convex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Target,
  Settings
} from "lucide-react";
import Link from "next/link";
import SquadList from "@/components/squads/SquadList";
import SOAssignmentModal from "@/components/squads/SOAssignmentModal";
import SquadEditModal from "@/components/squads/SquadEditModal";


export default function SquadManagementPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as string;
  
  const tournament = useQuery(api.tournaments.getTournamentById, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tournamentId ? { tournamentId: tournamentId as any } : "skip"
  );
  
  const squads = useQuery(api.squads.getSquadsByTournamentWithDetails, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tournamentId ? { tournamentId: tournamentId as any } : "skip"
  );
  
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  
  const [selectedSquad, setSelectedSquad] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSOModal, setShowSOModal] = useState(false);

  // Redirect if not Club Owner or not owner of this tournament
  if (currentUser && tournament && currentUser.role !== "clubOwner") {
    router.push(`/tournaments/${tournamentId}`);
    return null;
  }

  if (!tournament || !squads) {
    return (
      <div className="min-h-screen bg-slate-950 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading squad information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short", 
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/tournaments/${tournamentId}`}
            className="inline-flex items-center text-gray-400 hover:text-green-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournament
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Target className="h-8 w-8 text-green-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Squad Management</h1>
                <p className="text-gray-400">{tournament.name}</p>
                <p className="text-sm text-gray-500">{formatTime(tournament.date)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Summary */}
        <Card className="bg-slate-900 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Squad Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{squads.length}</div>
                <div className="text-sm text-gray-400">Total Squads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{tournament.capacity}</div>
                <div className="text-sm text-gray-400">Tournament Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {squads.filter(s => s.status === "open").length}
                </div>
                <div className="text-sm text-gray-400">Open Squads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {squads.reduce((total, squad) => total + squad.currentShooters, 0)}
                </div>
                <div className="text-sm text-gray-400">Total Registered</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Squad List Component */}
        <SquadList
          squads={squads.map(squad => ({
            _id: squad._id,
            name: squad.name,
            timeSlot: squad.timeSlot,
            maxShooters: squad.maxShooters,
            currentShooters: squad.currentShooters,
            status: squad.status,
            assignedSO: squad.assignedSO,
            assignedSOName: squad.assignedSOName
          }))}
          onEditSquad={(squadId) => {
            setSelectedSquad(squadId);
            setShowEditModal(true);
          }}
          onViewSquad={(squadId) => {
            router.push(`/tournaments/${tournamentId}/squads/${squadId}`);
          }}
          onAssignSO={(squadId) => {
            setSelectedSquad(squadId);
            setShowSOModal(true);
          }}
          title="Tournament Squads"
          description="Manage squad configuration and Security Officer assignments"
        />

        {/* Modals */}
        {selectedSquad && (
          <>
            <SOAssignmentModal
              isOpen={showSOModal}
              onClose={() => {
                setShowSOModal(false);
                setSelectedSquad(null);
              }}
              squadId={selectedSquad}
              squadName={squads.find(s => s._id === selectedSquad)?.name || ""}
              currentSOId={squads.find(s => s._id === selectedSquad)?.assignedSO}
              tournamentId={tournamentId}
            />
            
            <SquadEditModal
              isOpen={showEditModal}
              onClose={() => {
                setShowEditModal(false);
                setSelectedSquad(null);
              }}
              squadId={selectedSquad}
            />
          </>
        )}
      </div>
    </div>
  );
}