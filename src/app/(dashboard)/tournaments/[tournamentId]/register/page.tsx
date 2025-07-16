"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SquadSelectionGrid } from "@/components/features/squads/SquadSelectionGrid";
import { ArrowLeft, Calendar, MapPin, DollarSign, Target, AlertCircle, Info, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Id } from "@/lib/convex";

const DIVISIONS = [
  { value: "SSP", label: "Stock Service Pistol" },
  { value: "ESP", label: "Enhanced Service Pistol" },
  { value: "CDP", label: "Custom Defensive Pistol" },
  { value: "CCP", label: "Compact Carry Pistol" },
  { value: "REV", label: "Revolver" },
  { value: "BUG", label: "Back-Up Gun" },
  { value: "PCC", label: "Pistol Caliber Carbine" },
  { value: "CO", label: "Carry Optics" },
] as const;

const CLASSIFICATIONS = [
  { value: "MA", label: "Master" },
  { value: "EX", label: "Expert" },
  { value: "SS", label: "Sharpshooter" },
  { value: "MM", label: "Marksman" },
  { value: "NV", label: "Novice" },
  { value: "UN", label: "Unclassified" },
] as const;

export default function TournamentRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as string;

  // State
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedClassification, setSelectedClassification] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  // Queries
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const tournament = useQuery(api.tournaments.getTournamentById, 
    tournamentId ? { tournamentId: tournamentId as Id<"tournaments"> } : "skip"
  );
  const squadsWithMembers = useQuery(api.squads.getSquadsWithMembers,
    tournament && currentUser ? { 
      tournamentId: tournament._id,
      userId: currentUser._id
    } : "skip"
  );
  const existingRegistration = useQuery(api.registrations.getRegistrationByUserAndTournament,
    tournament && currentUser ? {
      userId: currentUser._id,
      tournamentId: tournament._id
    } : "skip"
  );

  // Mutations
  const registerForTournament = useMutation(api.registrations.registerForTournament);

  // Check registration window
  const now = Date.now();
  const registrationNotOpen = tournament && now < tournament.registrationOpens;
  const registrationClosed = tournament && now > tournament.registrationCloses;
  const canRegister = tournament && !registrationNotOpen && !registrationClosed && tournament.status === "published";

  // Format dates for display
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    };
  };

  // Calculate time until registration opens/closes
  const getTimeUntil = (timestamp: number) => {
    const diff = timestamp - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  // Set default division and classification from user profile
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.primaryDivision && !selectedDivision) {
        setSelectedDivision(currentUser.primaryDivision);
      }
      if (currentUser.primaryDivision && currentUser.classifications && currentUser.classifications[currentUser.primaryDivision]) {
        const classification = currentUser.classifications[currentUser.primaryDivision];
        if (classification) {
          setSelectedClassification(classification);
        }
      }
    }
  }, [currentUser, selectedDivision]);

  const handleJoinSquad = (squadId: string) => {
    if (!canRegister) {
      if (registrationNotOpen) {
        setError(`Registration opens on ${formatDateTime(tournament.registrationOpens).date} at ${formatDateTime(tournament.registrationOpens).time}`);
      } else if (registrationClosed) {
        setError(`Registration closed on ${formatDateTime(tournament.registrationCloses).date} at ${formatDateTime(tournament.registrationCloses).time}`);
      } else {
        setError("Tournament is not open for registration");
      }
      return;
    }
    
    if (!selectedDivision || !selectedClassification) {
      setError("Please select your division and classification first");
      return;
    }
    setSelectedSquadId(squadId);
    setShowConfirmDialog(true);
  };

  const handleConfirmRegistration = async () => {
    if (!currentUser || !tournament || !selectedSquadId || !selectedDivision || !selectedClassification) {
      return;
    }

    setIsRegistering(true);
    setError("");

    try {
      await registerForTournament({
        tournamentId: tournament._id,
        shooterId: currentUser._id,
        squadId: selectedSquadId as Id<"squads">,
        division: selectedDivision as "SSP" | "ESP" | "CDP" | "CCP" | "REV" | "BUG" | "PCC" | "CO",
        classification: selectedClassification as "MA" | "EX" | "SS" | "MM" | "NV" | "UN",
        customCategories: selectedCategories,
      });

      // Navigate to success page
      router.push(`/tournaments/${tournamentId}/register/success`);
    } catch (err) {
      setError((err as Error).message || "Failed to register for tournament");
      setShowConfirmDialog(false);
    } finally {
      setIsRegistering(false);
    }
  };

  if (!tournament || !currentUser || !squadsWithMembers) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (existingRegistration) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Already Registered</h2>
            <p className="text-gray-400 mb-6">
              You are already registered for this tournament in{" "}
              <span className="font-semibold text-green-400">
                {squadsWithMembers.find(s => s._id === existingRegistration.squadId)?.name}
              </span>
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/tournaments/${tournamentId}`}>
                <Button variant="outline">View Tournament Details</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedSquad = squadsWithMembers.find(s => s._id === selectedSquadId);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/tournaments/${tournamentId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournament
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-400 mb-2">Register for Tournament</h1>
            <h2 className="text-xl text-gray-300">{tournament.name}</h2>
          </div>
          {registrationNotOpen && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              Opens in {getTimeUntil(tournament.registrationOpens)}
            </Badge>
          )}
          {registrationClosed && (
            <Badge variant="outline" className="text-red-400 border-red-400">
              Registration Closed
            </Badge>
          )}
          {canRegister && (
            <Badge variant="outline" className="text-green-400 border-green-400">
              Registration Open
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tournament Info */}
      <Card className="bg-gray-900/50 border-gray-800 mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="font-medium text-gray-100">{formatDate(tournament.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-medium text-gray-100">{tournament.location.venue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Entry Fee</p>
                <p className="font-medium text-gray-100">
                  {formatCurrency(tournament.entryFee, tournament.currency)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Registration Window Info */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Registration Opens</p>
                  <p className="font-medium text-gray-100">
                    {formatDateTime(tournament.registrationOpens).date} at {formatDateTime(tournament.registrationOpens).time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Registration Closes</p>
                  <p className="font-medium text-gray-100">
                    {formatDateTime(tournament.registrationCloses).date} at {formatDateTime(tournament.registrationCloses).time}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Window Alert */}
      {registrationNotOpen && (
        <Alert className="mb-6 border-yellow-400/50 bg-yellow-400/10">
          <Info className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-gray-100">
            Registration will open in <strong>{getTimeUntil(tournament.registrationOpens)}</strong> on{" "}
            {formatDateTime(tournament.registrationOpens).date} at {formatDateTime(tournament.registrationOpens).time}
          </AlertDescription>
        </Alert>
      )}
      
      {registrationClosed && (
        <Alert className="mb-6 border-red-400/50 bg-red-400/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-gray-100">
            Registration closed on {formatDateTime(tournament.registrationCloses).date} at{" "}
            {formatDateTime(tournament.registrationCloses).time}
          </AlertDescription>
        </Alert>
      )}

      {/* Division & Classification Selection */}
      <Card className="bg-gray-900/50 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select Your Division & Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                <SelectTrigger id="division" className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select your division" />
                </SelectTrigger>
                <SelectContent>
                  {DIVISIONS.filter(div => tournament.divisions.includes(div.value)).map((division) => (
                    <SelectItem key={division.value} value={division.value}>
                      {division.label} ({division.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="classification">Classification</Label>
              <Select value={selectedClassification} onValueChange={setSelectedClassification}>
                <SelectTrigger id="classification" className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select your classification" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSIFICATIONS.map((classification) => (
                    <SelectItem key={classification.value} value={classification.value}>
                      {classification.label} ({classification.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {tournament.customCategories && tournament.customCategories.length > 0 && (
            <div className="mt-6 space-y-3">
              <Label>Custom Categories (Optional)</Label>
              <div className="space-y-2">
                {tournament.customCategories.map((category) => (
                  <div key={category.id} className="flex items-start gap-3">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, category.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== category.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={category.id} className="text-sm font-medium cursor-pointer">
                        {category.name}
                      </Label>
                      {category.description && (
                        <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert className="mt-4 bg-blue-900/20 border-blue-800">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              Make sure your division and classification match your current IDPA rating
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Squad Selection */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-green-400">Select Your Squad</CardTitle>
        </CardHeader>
        <CardContent>
          {!canRegister ? (
            <Alert className="bg-gray-900/50 border-gray-700">
              <AlertCircle className="h-4 w-4 text-gray-400" />
              <AlertDescription className="text-gray-300">
                Squad selection is not available at this time.{" "}
                {registrationNotOpen && "Registration has not opened yet."}
                {registrationClosed && "Registration has closed."}
              </AlertDescription>
            </Alert>
          ) : (!selectedDivision || !selectedClassification) ? (
            <Alert className="bg-yellow-900/20 border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300">
                Please select your division and classification before choosing a squad
              </AlertDescription>
            </Alert>
          ) : (
            <SquadSelectionGrid
              squads={squadsWithMembers}
              onJoinSquad={handleJoinSquad}
              isRegistering={isRegistering}
              currentUserId={currentUser._id}
            />
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-green-400">Confirm Registration</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please review your registration details before confirming
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Tournament</p>
              <p className="font-medium text-gray-100">{tournament.name}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Squad</p>
              <p className="font-medium text-gray-100">{selectedSquad?.name} - {selectedSquad?.timeSlot}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Division & Classification</p>
              <p className="font-medium text-gray-100">
                {DIVISIONS.find(d => d.value === selectedDivision)?.label} ({selectedClassification})
              </p>
            </div>
            
            {selectedCategories.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Custom Categories</p>
                <p className="font-medium text-gray-100">
                  {selectedCategories.map(catId => 
                    tournament.customCategories.find(c => c.id === catId)?.name
                  ).filter(Boolean).join(", ")}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Entry Fee</p>
              <p className="font-medium text-gray-100">
                {formatCurrency(tournament.entryFee, tournament.currency)}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isRegistering}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRegistration}
              disabled={isRegistering}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRegistering ? "Registering..." : "Confirm Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}