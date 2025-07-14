"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShooterBadge } from "./ShooterBadge";
import { Clock, Users, Shield, Star, AlertCircle } from "lucide-react";
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

interface SquadSelectionCardProps {
  squad: {
    _id: string;
    name: string;
    timeSlot: string;
    maxShooters: number;
    currentShooters: number;
    status: "open" | "full" | "closed";
    assignedSOName?: string;
    members: SquadMember[];
    availableSlots: number;
  };
  onJoinSquad: (squadId: string) => void;
  onJoinWaitlist?: (squadId: string) => void;
  isRegistering?: boolean;
  currentUserId?: string;
  className?: string;
}

export function SquadSelectionCard({
  squad,
  onJoinSquad,
  onJoinWaitlist,
  isRegistering = false,
  currentUserId,
  className,
}: SquadSelectionCardProps) {
  const capacityPercentage = (squad.currentShooters / squad.maxShooters) * 100;
  const hasFriends = squad.members.some((member) => member.isFriend);
  const hasClubmates = squad.members.some((member) => member.isClubmate);
  const isUserInSquad = squad.members.some((member) => member.userId === currentUserId);

  const getStatusColor = () => {
    if (squad.status === "closed") return "bg-red-500";
    if (squad.status === "full") return "bg-orange-500";
    if (capacityPercentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (squad.status === "closed") return "Closed";
    if (squad.status === "full") return "Full";
    return `${squad.availableSlots} slots left`;
  };

  return (
    <Card 
      className={cn(
        "bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all",
        isUserInSquad && "ring-2 ring-green-500/50",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-green-400 flex items-center gap-2">
              {squad.name}
              {hasFriends && (
                <span title="Has friends in this squad">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{squad.timeSlot}</span>
              </div>
              {squad.assignedSOName && (
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>SO: {squad.assignedSOName}</span>
                </div>
              )}
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs px-2 py-1",
              getStatusColor(),
              "text-white border-transparent"
            )}
          >
            {getStatusText()}
          </Badge>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              <Users className="h-4 w-4 inline mr-1" />
              {squad.currentShooters} / {squad.maxShooters} shooters
            </span>
            {(hasFriends || hasClubmates) && (
              <div className="flex items-center gap-2 text-xs">
                {hasFriends && <span className="text-yellow-400">Friends here</span>}
                {hasClubmates && <span className="text-blue-400">Clubmates here</span>}
              </div>
            )}
          </div>
          <Progress value={capacityPercentage} className="h-2 bg-gray-800" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {squad.members.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-300 mb-2">Registered Shooters:</p>
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
              {squad.members.map((member) => (
                <ShooterBadge
                  key={member.userId}
                  shooter={member}
                  showClub={true}
                  className={cn(
                    "bg-gray-800/50",
                    member.userId === currentUserId && "ring-1 ring-green-500"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {isUserInSquad ? (
          <div className="flex items-center gap-2 p-3 bg-green-900/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-green-400" />
            <span className="text-sm text-green-400">You are registered in this squad</span>
          </div>
        ) : (
          <div className="flex gap-2">
            {squad.status === "open" && (
              <Button
                onClick={() => onJoinSquad(squad._id)}
                disabled={isRegistering}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Join Squad
              </Button>
            )}
            {squad.status === "full" && onJoinWaitlist && (
              <Button
                onClick={() => onJoinWaitlist(squad._id)}
                disabled={isRegistering}
                variant="outline"
                className="flex-1 border-orange-500 text-orange-400 hover:bg-orange-500/20"
              >
                Join Waitlist
              </Button>
            )}
            {squad.status === "closed" && (
              <Button
                disabled
                variant="outline"
                className="flex-1 border-red-500 text-red-400"
              >
                Squad Closed
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}