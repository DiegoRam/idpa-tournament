"use client";

import { useState, useEffect } from "react";
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
import { 
  Edit, 
  AlertCircle, 
  Clock,
  Users,
  Settings
} from "lucide-react";

interface SquadEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  squadId: string;
}

export default function SquadEditModal({
  isOpen,
  onClose,
  squadId
}: SquadEditModalProps) {
  const [name, setName] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [maxShooters, setMaxShooters] = useState<number>(10);
  const [status, setStatus] = useState<"open" | "full" | "closed">("open");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get squad details
  const squad = useQuery(api.squads.getSquadById, {
    squadId: squadId as any
  });

  // Update squad mutation
  const updateSquad = useMutation(api.squads.updateSquad);

  // Pre-fill form when squad data loads
  useEffect(() => {
    if (squad) {
      setName(squad.name);
      setTimeSlot(squad.timeSlot);
      setMaxShooters(squad.maxShooters);
      setStatus(squad.status);
    }
  }, [squad]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError("");
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!squad) return;

    // Validation
    if (!name.trim()) {
      setError("Squad name is required");
      return;
    }

    if (!timeSlot.trim()) {
      setError("Time slot is required");
      return;
    }

    if (maxShooters < 1) {
      setError("Maximum shooters must be at least 1");
      return;
    }

    if (maxShooters < squad.currentShooters) {
      setError(`Cannot reduce capacity below current registrations (${squad.currentShooters})`);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await updateSquad({
        squadId: squadId as any,
        name: name.trim(),
        timeSlot: timeSlot.trim(),
        maxShooters,
        status
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update squad");
    } finally {
      setIsLoading(false);
    }
  };

  // Common time slot options
  const timeSlotOptions = [
    "08:00 - 09:30",
    "09:45 - 11:15", 
    "11:30 - 13:00",
    "13:15 - 14:45",
    "15:00 - 16:30",
    "16:45 - 18:15",
    "Custom"
  ];

  const [isCustomTimeSlot, setIsCustomTimeSlot] = useState(false);

  useEffect(() => {
    if (squad && timeSlot) {
      setIsCustomTimeSlot(!timeSlotOptions.slice(0, -1).includes(timeSlot));
    }
  }, [squad, timeSlot]);

  if (!squad) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Edit className="h-5 w-5 mr-2 text-green-400" />
            Edit Squad
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update squad details and configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Squad Name */}
          <div className="space-y-2">
            <Label htmlFor="squadName">Squad Name *</Label>
            <Input
              id="squadName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Squad A"
              className="bg-slate-800 border-slate-600"
            />
          </div>

          {/* Time Slot */}
          <div className="space-y-2">
            <Label htmlFor="timeSlot">Time Slot *</Label>
            {!isCustomTimeSlot ? (
              <Select
                value={timeSlot}
                onValueChange={(value) => {
                  if (value === "Custom") {
                    setIsCustomTimeSlot(true);
                    setTimeSlot("");
                  } else {
                    setTimeSlot(value);
                  }
                }}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlotOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <Input
                  id="timeSlot"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="e.g., 08:00 - 09:30 or TBD"
                  className="bg-slate-800 border-slate-600"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCustomTimeSlot(false);
                    setTimeSlot("08:00 - 09:30");
                  }}
                >
                  Use preset times
                </Button>
              </div>
            )}
          </div>

          {/* Maximum Shooters */}
          <div className="space-y-2">
            <Label htmlFor="maxShooters">Maximum Shooters *</Label>
            <Input
              id="maxShooters"
              type="number"
              min="1"
              max="20"
              value={maxShooters}
              onChange={(e) => setMaxShooters(Number(e.target.value))}
              className="bg-slate-800 border-slate-600"
            />
            <div className="text-sm text-gray-400">
              Current registrations: {squad.currentShooters}
            </div>
          </div>

          {/* Squad Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Squad Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Open - Accepting registrations
                  </div>
                </SelectItem>
                <SelectItem value="closed">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    Closed - No new registrations
                  </div>
                </SelectItem>
                <SelectItem value="full">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                    Full - Capacity reached
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Squad Info */}
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-600">
            <div className="flex items-center mb-2">
              <Settings className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-400">Squad Information</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Capacity:</span>
                <span className="text-white">{squad.currentShooters}/{squad.maxShooters}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">New Capacity:</span>
                <span className="text-white">{squad.currentShooters}/{maxShooters}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available Spots:</span>
                <span className="text-white">{Math.max(0, maxShooters - squad.currentShooters)}</span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {maxShooters < squad.currentShooters && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center text-red-400">
                <AlertCircle className="h-4 w-4 mr-2" />
                Cannot reduce capacity below current registrations
              </div>
            </div>
          )}

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
          <Button 
            onClick={handleSave} 
            disabled={isLoading || maxShooters < squad.currentShooters}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}