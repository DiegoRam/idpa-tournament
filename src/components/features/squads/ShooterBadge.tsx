import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Building2, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShooterBadgeProps {
  shooter: {
    userId: string;
    name: string;
    division: string;
    classification: string;
    clubId?: string;
    clubName?: string;
    isFriend: boolean;
    isClubmate: boolean;
    profilePicture?: string;
  };
  className?: string;
  showClub?: boolean;
}

const DIVISION_COLORS: Record<string, string> = {
  SSP: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  ESP: "bg-purple-500/20 text-purple-300 border-purple-500/50",
  CDP: "bg-red-500/20 text-red-300 border-red-500/50",
  CCP: "bg-green-500/20 text-green-300 border-green-500/50",
  REV: "bg-orange-500/20 text-orange-300 border-orange-500/50",
  BUG: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
  PCC: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
  CO: "bg-pink-500/20 text-pink-300 border-pink-500/50",
};

const CLASSIFICATION_ABBREVIATIONS: Record<string, string> = {
  MA: "Master",
  EX: "Expert",
  SS: "Sharpshooter",
  MM: "Marksman",
  NV: "Novice",
  UN: "Unclassified",
};

export function ShooterBadge({ shooter, className, showClub = false }: ShooterBadgeProps) {
  const initials = shooter.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("flex items-center gap-3 p-2 rounded-lg bg-black/40", className)}>
      <Avatar className="h-10 w-10 border border-gray-700">
        <AvatarImage src={shooter.profilePicture} alt={shooter.name} />
        <AvatarFallback className="bg-gray-800 text-gray-300">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-100 truncate">{shooter.name}</span>
          {shooter.isFriend && (
            <span title="Friend">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </span>
          )}
          {shooter.isClubmate && (
            <span title="Clubmate">
              <UserCheck className="h-4 w-4 text-blue-400" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs px-2 py-0.5",
              DIVISION_COLORS[shooter.division] || "bg-gray-500/20 text-gray-300"
            )}
          >
            {shooter.division}
          </Badge>
          
          <span className="text-xs text-gray-400">
            {CLASSIFICATION_ABBREVIATIONS[shooter.classification] || shooter.classification}
          </span>

          {showClub && shooter.clubName && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{shooter.clubName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}