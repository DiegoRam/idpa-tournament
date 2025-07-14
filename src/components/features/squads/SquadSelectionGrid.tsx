"use client";

import React, { useState } from "react";
import { SquadSelectionCard } from "./SquadSelectionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SquadMember {
  userId: string;
  name: string;
  division: string;
  classification: string;
  clubId?: string;
  clubName?: string;
  isFriend: boolean;
  isClubmate: boolean;
  profilePicture?: string;
}

interface Squad {
  _id: string;
  name: string;
  timeSlot: string;
  maxShooters: number;
  currentShooters: number;
  status: "open" | "full" | "closed";
  assignedSOName?: string;
  members: SquadMember[];
  availableSlots: number;
}

interface SquadSelectionGridProps {
  squads: Squad[];
  onJoinSquad: (squadId: string) => void;
  onJoinWaitlist?: (squadId: string) => void;
  isRegistering?: boolean;
  currentUserId?: string;
  className?: string;
}

export function SquadSelectionGrid({
  squads,
  onJoinSquad,
  onJoinWaitlist,
  isRegistering = false,
  currentUserId,
  className,
}: SquadSelectionGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "full" | "closed">("all");
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);

  // Filter squads based on search and filters
  const filteredSquads = squads.filter((squad) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        squad.name.toLowerCase().includes(search) ||
        squad.timeSlot.toLowerCase().includes(search) ||
        squad.assignedSOName?.toLowerCase().includes(search) ||
        squad.members.some(member => 
          member.name.toLowerCase().includes(search) ||
          member.clubName?.toLowerCase().includes(search)
        );
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filterStatus !== "all" && squad.status !== filterStatus) {
      return false;
    }

    // Friends filter
    if (showFriendsOnly && !squad.members.some(member => member.isFriend)) {
      return false;
    }

    return true;
  });

  // Calculate stats
  const stats = {
    totalSquads: squads.length,
    openSquads: squads.filter(s => s.status === "open").length,
    totalSlots: squads.reduce((acc, s) => acc + s.maxShooters, 0),
    availableSlots: squads.reduce((acc, s) => acc + s.availableSlots, 0),
    squadsWithFriends: squads.filter(s => s.members.some(m => m.isFriend)).length,
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-900/50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{stats.openSquads}</p>
          <p className="text-sm text-gray-400">Open Squads</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.availableSlots}</p>
          <p className="text-sm text-gray-400">Available Slots</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.squadsWithFriends}</p>
          <p className="text-sm text-gray-400">Squads with Friends</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-400">{stats.totalSquads}</p>
          <p className="text-sm text-gray-400">Total Squads</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search squads, shooters, or clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-700 text-gray-100"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              className={filterStatus === "all" ? "bg-green-600" : ""}
            >
              All
            </Button>
            <Button
              variant={filterStatus === "open" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("open")}
              className={filterStatus === "open" ? "bg-green-600" : ""}
            >
              Open
            </Button>
            <Button
              variant={filterStatus === "full" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("full")}
              className={filterStatus === "full" ? "bg-orange-600" : ""}
            >
              Full
            </Button>
            <Button
              variant={showFriendsOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFriendsOnly(!showFriendsOnly)}
              className={showFriendsOnly ? "bg-yellow-600" : ""}
            >
              <Users className="h-4 w-4 mr-1" />
              Friends
            </Button>
          </div>
        </div>

        {(searchTerm || filterStatus !== "all" || showFriendsOnly) && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Filter className="h-4 w-4" />
            <span>Showing {filteredSquads.length} of {squads.length} squads</span>
          </div>
        )}
      </div>

      {/* Squad Grid */}
      {filteredSquads.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No squads found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSquads.map((squad) => (
            <SquadSelectionCard
              key={squad._id}
              squad={squad}
              onJoinSquad={onJoinSquad}
              onJoinWaitlist={onJoinWaitlist}
              isRegistering={isRegistering}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}