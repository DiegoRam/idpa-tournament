"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Search, 
  User, 
  AlertCircle, 
  CheckCircle,
  UserMinus,
  UserPlus
} from "lucide-react";

interface SOAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  squadId: string;
  squadName: string;
  currentSOId?: string;
  tournamentId: string;
}

export default function SOAssignmentModal({
  isOpen,
  onClose,
  squadId,
  squadName,
  currentSOId,
  tournamentId
}: SOAssignmentModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSOId, setSelectedSOId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get all users with Security Officer or Admin role
  const securityOfficers = useQuery(api.users.getUsersByRole, {
    role: "securityOfficer"
  });

  // Get admin users as well (they can act as SOs)
  const adminUsers = useQuery(api.users.getUsersByRole, {
    role: "admin" 
  });

  // Get current squad assignments for this tournament to check availability
  const tournamentSquads = useQuery(api.squads.getSquadsByTournament, {
    tournamentId: tournamentId as any
  });

  // Get current SO details if assigned
  const currentSO = useQuery(
    currentSOId ? api.users.getUserById : "skip",
    currentSOId ? { userId: currentSOId as any } : "skip"
  );

  // Mutations
  const assignSO = useMutation(api.squads.assignSOToSquad);
  const removeSO = useMutation(api.squads.removeSOFromSquad);

  // Combine SOs and Admins
  const allEligibleUsers = [
    ...(securityOfficers || []),
    ...(adminUsers || [])
  ];

  // Filter users based on search
  const filteredUsers = allEligibleUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get assigned SOs for this tournament (excluding current squad)
  const assignedSOIds = new Set(
    tournamentSquads
      ?.filter(squad => squad._id !== squadId && squad.assignedSO)
      .map(squad => squad.assignedSO) || []
  );

  const handleAssignSO = async () => {
    if (!selectedSOId) return;

    setIsLoading(true);
    setError("");

    try {
      await assignSO({
        squadId: squadId as any,
        securityOfficerId: selectedSOId as any
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign Security Officer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSO = async () => {
    setIsLoading(true);
    setError("");

    try {
      await removeSO({
        squadId: squadId as any
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove Security Officer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-400" />
            Security Officer Assignment
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Assign a Security Officer to <span className="font-semibold text-white">{squadName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current SO Status */}
          {currentSOId && currentSO && (
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-green-400">Currently Assigned</div>
                  <div className="text-white font-semibold">{currentSO.name}</div>
                  <div className="text-sm text-gray-400">{currentSO.email}</div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveSO}
                  disabled={isLoading}
                >
                  <UserMinus className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Security Officers</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600"
              />
            </div>
          </div>

          {/* SO Selection */}
          <div className="space-y-2">
            <Label>Available Security Officers</Label>
            <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-600 rounded-lg p-2 bg-slate-800">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => {
                  const isAssignedElsewhere = assignedSOIds.has(user._id);
                  const isCurrentlyAssigned = currentSOId === user._id;
                  
                  return (
                    <div
                      key={user._id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedSOId === user._id
                          ? "border-green-400 bg-green-400/10"
                          : isAssignedElsewhere
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-slate-600 hover:border-slate-500"
                      } ${isCurrentlyAssigned ? "opacity-50" : ""}`}
                      onClick={() => {
                        if (!isCurrentlyAssigned) {
                          setSelectedSOId(selectedSOId === user._id ? "" : user._id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.role === "admin" ? "bg-purple-500" : "bg-blue-500"
                          }`}>
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge 
                            variant={user.role === "admin" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {user.role === "admin" ? "Admin" : "SO"}
                          </Badge>
                          {isAssignedElsewhere && (
                            <div className="flex items-center text-yellow-400 text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Assigned
                            </div>
                          )}
                          {isCurrentlyAssigned && (
                            <div className="flex items-center text-green-400 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Current
                            </div>
                          )}
                          {selectedSOId === user._id && !isCurrentlyAssigned && (
                            <div className="flex items-center text-green-400 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div>No Security Officers found</div>
                  {searchTerm && (
                    <div className="text-sm">Try adjusting your search criteria</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center text-red-400">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {selectedSOId && (
            <Button 
              onClick={handleAssignSO} 
              disabled={isLoading}
              className="flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isLoading ? "Assigning..." : "Assign Security Officer"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}