"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Target, 
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Grid,
  List,
  Navigation
} from "lucide-react";
import Link from "next/link";
import { IDPA_DIVISIONS } from "@/lib/utils";
import CalendarView from "@/components/tournaments/CalendarView";

const TOURNAMENT_STATUS_COLORS = {
  draft: "bg-gray-500",
  published: "bg-green-500", 
  active: "bg-blue-500",
  completed: "bg-purple-500"
};

const DIVISION_COLORS = {
  SSP: "bg-blue-500",
  ESP: "bg-green-500", 
  CDP: "bg-yellow-500",
  CCP: "bg-red-500",
  REV: "bg-purple-500",
  BUG: "bg-pink-500",
  PCC: "bg-orange-500",
  CO: "bg-cyan-500"
};

type ViewMode = "month" | "week" | "list" | "grid";

export default function TournamentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedClub, setSelectedClub] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const router = useRouter();

  // Get current user to determine role-based actions
  const currentUser = useQuery(api.userAuth.getCurrentUser);

  // Get all active clubs for filtering
  const activeClubs = useQuery(api.clubs.getActiveClubs);

  // Get squad availability for capacity tracking
  const getSquadAvailability = (tournamentId: string) => {
    // This would be implemented with a separate query for each tournament
    // For now, we'll use the tournament capacity as a fallback
    return null;
  };

  // Get upcoming tournaments with location filtering
  const upcomingTournaments = useQuery(api.tournaments.getUpcomingTournaments, {
    userLocation: userLocation,
    maxDistance: maxDistance,
    division: selectedDivision === "all" ? undefined : selectedDivision
  });

  // Get tournaments with capacity tracking
  const tournamentsWithCapacity = useQuery(api.tournaments.getTournamentsWithCapacity, {
    status: currentUser?.role === "clubOwner" ? undefined : "published"
  });

  // Fallback search if location API is not available
  const searchTournaments = useQuery(api.tournaments.searchTournaments, {
    searchTerm: "",
    status: currentUser?.role === "clubOwner" ? undefined : "published"
  });

  // Use location-filtered tournaments if available, otherwise use capacity or search results
  const tournaments = upcomingTournaments || tournamentsWithCapacity || searchTournaments;

  // Calculate distance for display
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter tournaments based on search and filters
  const filteredTournaments = tournaments?.filter(tournament => {
    const matchesSearch = !searchTerm || 
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.location.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDivision = !selectedDivision || selectedDivision === "all" ||
      tournament.divisions.includes(selectedDivision as any);
    
    const matchesStatus = !selectedStatus || selectedStatus === "all" || tournament.status === selectedStatus;
    
    const matchesClub = !selectedClub || selectedClub === "all" || tournament.clubId === selectedClub;
    
    // Apply distance filter if Near Me is active
    const matchesDistance = !maxDistance || !userLocation || 
      calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        tournament.location.coordinates.lat, 
        tournament.location.coordinates.lng
      ) <= maxDistance;
    
    return matchesSearch && matchesDivision && matchesStatus && matchesClub && matchesDistance;
  })?.map(tournament => ({
    ...tournament,
    distance: userLocation ? calculateDistance(
      userLocation.lat,
      userLocation.lng,
      tournament.location.coordinates.lat,
      tournament.location.coordinates.lng
    ) : undefined
  })) || [];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short", 
      day: "numeric"
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setUserLocation(location);
      setMaxDistance(50); // Default to 50km radius
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Unable to get your location. Please check your browser settings.");
    } finally {
      setLocationLoading(false);
    }
  };

  const clearLocationFilter = () => {
    setUserLocation(null);
    setMaxDistance(null);
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-400 hover:text-green-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Target className="h-8 w-8 text-green-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">IDPA Tournaments</h1>
                <p className="text-gray-400">Discover and register for upcoming matches</p>
              </div>
            </div>
            {currentUser?.role === "clubOwner" && (
              <Button
                onClick={() => window.location.href = "/tournaments/create"}
                className="flex items-center space-x-2"
                variant="tactical"
              >
                <Plus className="h-4 w-4" />
                <span>Create Tournament</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-900 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Tournaments</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Tournament name, venue, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Division</Label>
                <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue placeholder="All Divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    {IDPA_DIVISIONS.map(division => (
                      <SelectItem key={division.code} value={division.code}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Open for Registration</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Club</Label>
                <Select value={selectedClub} onValueChange={setSelectedClub}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue placeholder="All Clubs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clubs</SelectItem>
                    {activeClubs?.map(club => (
                      <SelectItem key={club._id} value={club._id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                {!userLocation ? (
                  <Button
                    onClick={requestLocation}
                    disabled={locationLoading}
                    className="w-full flex items-center space-x-2"
                    variant="outline"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>{locationLoading ? "Getting Location..." : "Near Me"}</span>
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Select 
                      value={maxDistance?.toString() || "50"} 
                      onValueChange={(value) => setMaxDistance(parseInt(value))}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">Within 10km</SelectItem>
                        <SelectItem value="25">Within 25km</SelectItem>
                        <SelectItem value="50">Within 50km</SelectItem>
                        <SelectItem value="100">Within 100km</SelectItem>
                        <SelectItem value="200">Within 200km</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={clearLocationFilter}
                      size="sm"
                      variant="ghost"
                      className="w-full text-xs"
                    >
                      Clear Location Filter
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">View:</span>
            <div className="flex items-center space-x-1 flex-wrap">
              <Button
                variant={viewMode === "grid" ? "tactical" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center space-x-2"
              >
                <Grid className="h-4 w-4" />
                <span>Grid</span>
              </Button>
              <Button
                variant={viewMode === "month" ? "tactical" : "outline"}
                size="sm"
                onClick={() => setViewMode("month")}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Month</span>
              </Button>
              <Button
                variant={viewMode === "week" ? "tactical" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Week</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "tactical" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center space-x-2"
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            {filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Tournament Display */}
        {(viewMode === "month" || viewMode === "week" || viewMode === "list") ? (
          <CalendarView
            tournaments={filteredTournaments}
            viewMode={viewMode as "month" | "week" | "list"}
            onViewModeChange={(mode) => setViewMode(mode)}
            onTournamentClick={(tournament) => router.push(`/tournaments/${tournament._id}`)}
          />
        ) : (
          /* Tournament Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <Card 
              key={tournament._id} 
              className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
              onClick={() => window.location.href = `/tournaments/${tournament._id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-white mb-2">{tournament.name}</CardTitle>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        className={`${TOURNAMENT_STATUS_COLORS[tournament.status]} text-white capitalize`}
                      >
                        {tournament.status}
                      </Badge>
                      <Badge variant="outline" className="text-gray-300">
                        {tournament.matchType}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-2 text-green-400" />
                    <span>{formatDate(tournament.date)} at {formatTime(tournament.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="h-4 w-4 mr-2 text-green-400" />
                    <span className="truncate">{tournament.location.venue}, {tournament.location.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-green-400" />
                      <span>{tournament.capacity} shooters</span>
                    </div>
                    {tournament.registeredCount !== undefined && (
                      <span className="text-xs">
                        {tournament.registeredCount}/{tournament.capacity} registered
                      </span>
                    )}
                  </div>
                  {tournament.openSquads !== undefined && (
                    <div className="flex items-center justify-between text-gray-300">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2 text-green-400" />
                        <span>Squads</span>
                      </div>
                      <span className="text-xs">
                        {tournament.openSquads}/{tournament.totalSquads} open
                      </span>
                    </div>
                  )}
                  {tournament.distance && (
                    <div className="flex items-center text-gray-300">
                      <Navigation className="h-4 w-4 mr-2 text-green-400" />
                      <span>{formatDistance(tournament.distance)} away</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Divisions */}
                  <div>
                    <Label className="text-xs text-gray-400 mb-2 block">DIVISIONS</Label>
                    <div className="flex flex-wrap gap-1">
                      {tournament.divisions.map(division => (
                        <Badge 
                          key={division}
                          className={`${DIVISION_COLORS[division]} text-white text-xs`}
                        >
                          {division}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Entry Fee */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Entry Fee:</span>
                    <span className="text-sm font-semibold text-white">
                      ${tournament.entryFee} {tournament.currency}
                    </span>
                  </div>

                  {/* Registration Status */}
                  <div className="pt-2 border-t border-slate-700">
                    {tournament.status === "published" ? (
                      <Button 
                        variant="tactical" 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/tournaments/${tournament._id}/register`;
                        }}
                      >
                        Register Now
                      </Button>
                    ) : tournament.status === "active" ? (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        Tournament Active
                      </Button>
                    ) : tournament.status === "completed" ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/tournaments/${tournament._id}/results`;
                        }}
                      >
                        View Results
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        Not Open Yet
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTournaments.length === 0 && (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No tournaments found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || selectedDivision || selectedStatus 
                  ? "Try adjusting your search criteria"
                  : "No tournaments are currently available"
                }
              </p>
              {currentUser?.role === "clubOwner" && (
                <Button
                  onClick={() => window.location.href = "/tournaments/create"}
                  variant="tactical"
                >
                  Create First Tournament
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {upcomingTournaments === undefined && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <div className="h-4 bg-slate-700 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded animate-pulse w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-3 bg-slate-700 rounded animate-pulse w-5/6"></div>
                    <div className="h-3 bg-slate-700 rounded animate-pulse w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}