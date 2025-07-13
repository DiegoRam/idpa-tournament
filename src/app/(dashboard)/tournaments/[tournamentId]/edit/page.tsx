"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Target, 
  ArrowLeft,
  Save,
  Building
} from "lucide-react";
import { IDPA_DIVISIONS, MATCH_TYPES, CURRENCIES } from "@/lib/utils";
import Link from "next/link";

interface LocationData {
  venue: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface TournamentData {
  name: string;
  date: string;
  registrationOpens: string;
  registrationCloses: string;
  location: LocationData;
  matchType: string;
  divisions: string[];
  customCategories: Array<{
    id: string;
    name: string;
    description?: string;
    eligibilityCriteria?: string;
  }>;
  entryFee: number;
  currency: string;
  capacity: number;
  squadConfig: {
    numberOfSquads: number;
    maxShootersPerSquad: number;
  };
  description: string;
  rules: string;
}

export default function EditTournamentPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as string;
  
  const tournament = useQuery(api.tournaments.getTournamentById, 
    tournamentId ? { tournamentId: tournamentId as any } : "skip"
  );
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const userClub = useQuery(api.clubs.getUserClub);
  const updateTournament = useMutation(api.tournaments.updateTournament);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [tournamentData, setTournamentData] = useState<TournamentData>({
    name: "",
    date: "",
    registrationOpens: "",
    registrationCloses: "",
    location: {
      venue: "",
      address: "",
      coordinates: { lat: 0, lng: 0 }
    },
    matchType: "",
    divisions: [],
    customCategories: [],
    entryFee: 0,
    currency: "ARS",
    capacity: 80,
    squadConfig: {
      numberOfSquads: 8,
      maxShootersPerSquad: 10
    },
    description: "",
    rules: ""
  });

  // Initialize form data when tournament loads
  useEffect(() => {
    if (tournament && !isInitialized) {
      const formatDateForInput = (timestamp: number) => {
        const date = new Date(timestamp);
        // Format for datetime-local input (YYYY-MM-DDTHH:MM)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setTournamentData({
        name: tournament.name,
        date: formatDateForInput(tournament.date),
        registrationOpens: formatDateForInput(tournament.registrationOpens),
        registrationCloses: formatDateForInput(tournament.registrationCloses),
        location: tournament.location,
        matchType: tournament.matchType,
        divisions: tournament.divisions,
        customCategories: tournament.customCategories || [],
        entryFee: tournament.entryFee,
        currency: tournament.currency,
        capacity: tournament.capacity,
        squadConfig: tournament.squadConfig,
        description: tournament.description || "",
        rules: tournament.rules || ""
      });
      setIsInitialized(true);
    }
  }, [tournament, isInitialized]);

  // Check permissions
  useEffect(() => {
    if (currentUser && currentUser.role !== "clubOwner" && currentUser.role !== "admin") {
      router.push("/tournaments");
    }
  }, [currentUser, router]);

  const updateTournamentData = (field: string, value: any) => {
    setTournamentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedData = (path: string[], value: any) => {
    setTournamentData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tournament) return;

    setIsLoading(true);
    setError("");

    try {
      await updateTournament({
        tournamentId: tournament._id,
        name: tournamentData.name,
        date: new Date(tournamentData.date).getTime(),
        registrationOpens: new Date(tournamentData.registrationOpens).getTime(),
        registrationCloses: new Date(tournamentData.registrationCloses).getTime(),
        location: tournamentData.location,
        divisions: tournamentData.divisions as any,
        customCategories: tournamentData.customCategories,
        entryFee: tournamentData.entryFee,
        capacity: tournamentData.capacity,
        description: tournamentData.description || undefined,
        rules: tournamentData.rules || undefined,
      });

      router.push(`/tournaments/${tournamentId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update tournament";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (tournament === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-green-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-300">Loading tournament...</p>
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
          <p className="text-gray-400 mb-4">The tournament you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.push("/tournaments")}>
            Back to Tournaments
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentUser || (currentUser.role !== "clubOwner" && currentUser.role !== "admin")) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Access Denied</h2>
          <p className="text-gray-400">Only tournament organizers can edit tournaments.</p>
        </Card>
      </div>
    );
  }

  // Show notice if tournament is published
  const canEdit = tournament.status === "draft";

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/tournaments/${tournamentId}`} 
            className="inline-flex items-center text-gray-400 hover:text-green-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournament
          </Link>
          
          <h1 className="text-3xl font-bold text-green-400 mb-2">Edit Tournament</h1>
          <p className="text-gray-400">Update your tournament details</p>
          
          {!canEdit && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">
                ⚠️ This tournament is published. Only basic details can be modified.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Basic Information</CardTitle>
              <CardDescription>Essential tournament details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Tournament Name *</Label>
                <Input
                  id="name"
                  value={tournamentData.name}
                  onChange={(e) => updateTournamentData("name", e.target.value)}
                  placeholder="e.g., Spring Championship 2024"
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="matchType">Match Type *</Label>
                  <Select
                    value={tournamentData.matchType}
                    onValueChange={(value) => updateTournamentData("matchType", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select match type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATCH_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-400">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="entryFee">Entry Fee *</Label>
                  <div className="flex mt-1">
                    <Select
                      value={tournamentData.currency}
                      onValueChange={(value) => updateTournamentData("currency", value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="entryFee"
                      type="number"
                      min="0"
                      value={tournamentData.entryFee}
                      onChange={(e) => updateTournamentData("entryFee", Number(e.target.value))}
                      placeholder="0"
                      className="ml-2 flex-1"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates & Location */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Dates & Location</CardTitle>
              <CardDescription>Schedule and venue information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="date">Tournament Date *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={tournamentData.date}
                  onChange={(e) => updateTournamentData("date", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationOpens">Registration Opens *</Label>
                  <Input
                    id="registrationOpens"
                    type="datetime-local"
                    value={tournamentData.registrationOpens}
                    onChange={(e) => updateTournamentData("registrationOpens", e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="registrationCloses">Registration Closes *</Label>
                  <Input
                    id="registrationCloses"
                    type="datetime-local"
                    value={tournamentData.registrationCloses}
                    onChange={(e) => updateTournamentData("registrationCloses", e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="venue">Venue Name *</Label>
                <Input
                  id="venue"
                  value={tournamentData.location.venue}
                  onChange={(e) => updateNestedData(["location", "venue"], e.target.value)}
                  placeholder="Range name or venue"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={tournamentData.location.address}
                  onChange={(e) => updateNestedData(["location", "address"], e.target.value)}
                  placeholder="Full address including city and state"
                  className="mt-1"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Divisions */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Divisions & Categories</CardTitle>
              <CardDescription>Competition setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>IDPA Divisions * (Select at least one)</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {IDPA_DIVISIONS.map((division) => (
                    <div key={division.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={division.code}
                        checked={tournamentData.divisions.includes(division.code)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateTournamentData("divisions", [...tournamentData.divisions, division.code]);
                          } else {
                            updateTournamentData("divisions", tournamentData.divisions.filter(d => d !== division.code));
                          }
                        }}
                      />
                      <Label htmlFor={division.code} className="flex-1 cursor-pointer">
                        <div>
                          <div className="font-medium">{division.code}</div>
                          <div className="text-sm text-gray-400">{division.name}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {tournamentData.divisions.length > 0 && (
                <div className="p-3 bg-slate-800 rounded-lg">
                  <div className="text-sm font-medium text-green-400 mb-2">Selected Divisions:</div>
                  <div className="flex flex-wrap gap-2">
                    {tournamentData.divisions.map((divisionCode) => {
                      const division = IDPA_DIVISIONS.find(d => d.code === divisionCode);
                      return (
                        <Badge key={divisionCode} variant="secondary">
                          {division?.code} - {division?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capacity */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Capacity</CardTitle>
              <CardDescription>Tournament size limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="capacity">Tournament Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={tournamentData.capacity}
                  onChange={(e) => updateTournamentData("capacity", Number(e.target.value))}
                  className="mt-1"
                  required
                />
                <div className="text-sm text-gray-400 mt-1">
                  Maximum number of shooters for this tournament
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description & Rules */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Additional Details</CardTitle>
              <CardDescription>Optional tournament information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="description">Tournament Description</Label>
                <Textarea
                  id="description"
                  value={tournamentData.description}
                  onChange={(e) => updateTournamentData("description", e.target.value)}
                  placeholder="Describe your tournament, any special features, prizes, etc."
                  className="mt-1 h-32"
                />
              </div>

              <div>
                <Label htmlFor="rules">Special Rules & Information</Label>
                <Textarea
                  id="rules"
                  value={tournamentData.rules}
                  onChange={(e) => updateTournamentData("rules", e.target.value)}
                  placeholder="Any special rules, equipment requirements, or important information for shooters"
                  className="mt-1 h-32"
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="text-red-400 text-sm text-center p-3 bg-red-400/10 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/tournaments/${tournamentId}`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="tactical"
              disabled={isLoading}
              className="min-w-[120px] flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}