"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
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
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { IDPA_DIVISIONS } from "@/lib/utils";

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

export default function TournamentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Get current user to determine role-based actions
  const currentUser = useQuery(api.userAuth.getCurrentUser);

  // Get upcoming tournaments - include drafts for club owners
  const upcomingTournaments = useQuery(api.tournaments.searchTournaments, {
    searchTerm: "",
    status: currentUser?.role === "clubOwner" ? undefined : "published"
  });

  // Filter tournaments based on search and filters
  const filteredTournaments = upcomingTournaments?.filter(tournament => {
    const matchesSearch = !searchTerm || 
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.location.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDivision = !selectedDivision || selectedDivision === "all" ||
      tournament.divisions.includes(selectedDivision as any);
    
    const matchesStatus = !selectedStatus || selectedStatus === "all" || tournament.status === selectedStatus;
    
    return matchesSearch && matchesDivision && matchesStatus;
  }) || [];

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Tournament Grid */}
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
                  <div className="flex items-center text-gray-300">
                    <Users className="h-4 w-4 mr-2 text-green-400" />
                    <span>{tournament.capacity} shooters</span>
                  </div>
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