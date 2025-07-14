"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  Users,
  Shield,
  Edit,
  Eye,
  UserPlus,
  UserMinus,
  CircleDot
} from "lucide-react";

const SQUAD_STATUS_COLORS = {
  open: "bg-green-500",
  full: "bg-yellow-500", 
  closed: "bg-red-500"
};

const SQUAD_STATUS_TEXT = {
  open: "Open",
  full: "Full",
  closed: "Closed"
};

export interface Squad {
  _id: string;
  name: string;
  timeSlot: string;
  maxShooters: number;
  currentShooters: number;
  status: "open" | "full" | "closed";
  assignedSO?: string;
  assignedSOName?: string;
}

interface SquadCardProps {
  squad: Squad;
  onEdit?: (squadId: string) => void;
  onView?: (squadId: string) => void;
  onAssignSO?: (squadId: string) => void;
  onRemoveSO?: (squadId: string) => void;
  compact?: boolean;
  showActions?: boolean;
}

export default function SquadCard({ 
  squad, 
  onEdit, 
  onView, 
  onAssignSO, 
  onRemoveSO,
  compact = false,
  showActions = true 
}: SquadCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const capacityPercentage = Math.round((squad.currentShooters / squad.maxShooters) * 100);
  const isNearFull = squad.currentShooters >= squad.maxShooters * 0.8;
  const isFull = squad.currentShooters >= squad.maxShooters;

  const getCapacityColor = () => {
    if (isFull) return "bg-red-500";
    if (isNearFull) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card 
      className={`bg-slate-900 border-slate-700 hover:border-slate-600 transition-all duration-200 ${
        isHovered ? "shadow-lg" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className={compact ? "pb-2" : "pb-3"}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={`${compact ? "text-base" : "text-lg"} text-white mb-2`}>
              {squad.name}
            </CardTitle>
            <div className="flex items-center space-x-2 mb-2">
              <Badge 
                className={`${SQUAD_STATUS_COLORS[squad.status]} text-white capitalize text-xs`}
              >
                <CircleDot className="h-3 w-3 mr-1" />
                {SQUAD_STATUS_TEXT[squad.status]}
              </Badge>
              <Badge variant="outline" className="text-gray-300 text-xs">
                {squad.currentShooters}/{squad.maxShooters}
              </Badge>
            </div>
          </div>
          {showActions && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(squad._id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={`space-y-${compact ? "2" : "3"}`}>
        {/* Time Slot */}
        <div className="flex items-center text-gray-300">
          <Clock className="h-4 w-4 mr-2 text-green-400" />
          <span className={`${compact ? "text-xs" : "text-sm"}`}>
            {squad.timeSlot}
          </span>
        </div>

        {/* Capacity */}
        <div className="flex items-center text-gray-300">
          <Users className="h-4 w-4 mr-2 text-green-400" />
          <span className={`${compact ? "text-xs" : "text-sm"}`}>
            {squad.currentShooters} of {squad.maxShooters} shooters
          </span>
        </div>

        {/* Security Officer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-300">
            <Shield className="h-4 w-4 mr-2 text-green-400" />
            <span className={`${compact ? "text-xs" : "text-sm"}`}>
              {squad.assignedSOName || "No SO assigned"}
            </span>
          </div>
          {showActions && (
            <div className="flex space-x-1">
              {squad.assignedSO ? (
                onRemoveSO && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveSO(squad._id)}
                    className="h-6 w-6 p-0"
                  >
                    <UserMinus className="h-3 w-3" />
                  </Button>
                )
              ) : (
                onAssignSO && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAssignSO(squad._id)}
                    className="h-6 w-6 p-0"
                  >
                    <UserPlus className="h-3 w-3" />
                  </Button>
                )
              )}
            </div>
          )}
        </div>

        {/* Capacity Bar */}
        {!compact && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Capacity</span>
              <span>{capacityPercentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getCapacityColor()}`}
                style={{ 
                  width: `${Math.min(capacityPercentage, 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && !compact && (
          <div className="flex space-x-2 pt-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onView(squad._id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(squad._id)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        )}

        {/* Compact Action Buttons */}
        {showActions && compact && (
          <div className="flex justify-end space-x-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(squad._id)}
                className="h-6 w-6 p-0"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(squad._id)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}