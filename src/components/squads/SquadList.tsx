"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search,
  Filter,
  Grid,
  List,
  Target,
  AlertCircle
} from "lucide-react";
import SquadCard, { Squad } from "./SquadCard";

interface SquadListProps {
  squads: Squad[];
  onEditSquad?: (squadId: string) => void;
  onViewSquad?: (squadId: string) => void;
  onAssignSO?: (squadId: string) => void;
  onRemoveSO?: (squadId: string) => void;
  showSearch?: boolean;
  showFilters?: boolean;
  compact?: boolean;
  title?: string;
  description?: string;
}

export default function SquadList({
  squads,
  onEditSquad,
  onViewSquad,
  onAssignSO,
  onRemoveSO,
  showSearch = true,
  showFilters = true,
  compact = false,
  title = "Squads",
  description = "Manage tournament squads and assignments"
}: SquadListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [soFilter, setSOFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter squads based on search and filters
  const filteredSquads = squads.filter(squad => {
    const matchesSearch = !searchTerm || 
      squad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      squad.timeSlot.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || squad.status === statusFilter;
    
    const matchesSO = soFilter === "all" || 
      (soFilter === "assigned" && squad.assignedSO) ||
      (soFilter === "unassigned" && !squad.assignedSO);
    
    return matchesSearch && matchesStatus && matchesSO;
  });

  // Get squad statistics
  const stats = {
    total: squads.length,
    open: squads.filter(s => s.status === "open").length,
    full: squads.filter(s => s.status === "full").length,
    closed: squads.filter(s => s.status === "closed").length,
    withSO: squads.filter(s => s.assignedSO).length,
    totalShooters: squads.reduce((sum, s) => sum + s.currentShooters, 0),
    totalCapacity: squads.reduce((sum, s) => sum + s.maxShooters, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400">{description}</p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "tactical" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "tactical" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-green-400">Squad Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-gray-400">Total Squads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.open}</div>
              <div className="text-xs text-gray-400">Open</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.full}</div>
              <div className="text-xs text-gray-400">Full</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.closed}</div>
              <div className="text-xs text-gray-400">Closed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.withSO}</div>
              <div className="text-xs text-gray-400">With SO</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.totalShooters}/{stats.totalCapacity}
              </div>
              <div className="text-xs text-gray-400">Registered</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {showSearch && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search squads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-600"
                    />
                  </div>
                </div>
              )}
              
              {showFilters && (
                <>
                  <div className="space-y-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Select value={soFilter} onValueChange={setSOFilter}>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Filter by SO" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Squads</SelectItem>
                        <SelectItem value="assigned">With SO</SelectItem>
                        <SelectItem value="unassigned">Without SO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {filteredSquads.length} of {squads.length} squad{squads.length !== 1 ? 's' : ''} shown
        </div>
      </div>

      {/* Squad Grid/List */}
      {filteredSquads.length > 0 ? (
        <div className={
          viewMode === "grid" 
            ? `grid grid-cols-1 ${compact ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"} gap-6`
            : "space-y-4"
        }>
          {filteredSquads.map(squad => (
            <SquadCard
              key={squad._id}
              squad={squad}
              onEdit={onEditSquad}
              onView={onViewSquad}
              onAssignSO={onAssignSO}
              onRemoveSO={onRemoveSO}
              compact={compact || viewMode === "list"}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              {squads.length === 0 ? "No squads found" : "No squads match your filters"}
            </h3>
            <p className="text-gray-400 mb-4">
              {squads.length === 0 
                ? "Squads should be created automatically when setting up the tournament."
                : "Try adjusting your search criteria or filters."
              }
            </p>
            {squads.length === 0 && (
              <div className="flex items-center justify-center space-x-2 text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Contact support if squads are missing</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}