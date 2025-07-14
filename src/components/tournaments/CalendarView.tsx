"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  List,
  Clock,
  Users,
  Navigation
} from "lucide-react";

type ViewMode = "month" | "week" | "list";
interface Tournament {
  _id: string;
  name: string;
  date: number;
  location: {
    venue: string;
    address: string;
  };
  status: string;
  divisions: string[];
  capacity: number;
  entryFee: number;
  currency: string;
}

interface CalendarViewProps {
  tournaments: Tournament[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onTournamentClick: (tournament: Tournament) => void;
}

export default function CalendarView({ 
  tournaments, 
  viewMode, 
  onViewModeChange, 
  onTournamentClick 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());


  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getTournamentsByDate = (date: Date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return tournaments.filter(tournament => {
      const tournamentDate = new Date(tournament.date);
      return tournamentDate >= targetDate && tournamentDate < nextDay;
    });
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);

    // Start from Sunday of the week containing the first day
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    // End on Saturday of the week containing the last day
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const dates = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const TournamentCard = ({ tournament, compact = false }: { tournament: Tournament; compact?: boolean }) => (
    <div
      onClick={() => onTournamentClick(tournament)}
      className={`
        bg-slate-800 border border-slate-600 rounded p-1 sm:p-2 mb-1 cursor-pointer 
        hover:border-slate-500 transition-colors
        ${compact ? 'text-xs' : 'text-xs sm:text-sm'}
      `}
    >
      <div className="font-medium text-white truncate">{tournament.name}</div>
      <div className="text-gray-400 text-xs">{formatTime(tournament.date)}</div>
      {!compact && (
        <div className="flex items-center space-x-1 mt-1">
          <Badge 
            className={`text-xs ${
              tournament.status === 'published' ? 'bg-green-600' : 
              tournament.status === 'active' ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            {tournament.status}
          </Badge>
        </div>
      )}
    </div>
  );

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-white">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          {/* Week Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {monthDates.map((date, index) => {
              const dayTournaments = getTournamentsByDate(date);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div 
                  key={index} 
                  className={`
                    min-h-[80px] sm:min-h-[100px] p-1 border border-slate-700 rounded
                    ${isCurrentMonth ? 'bg-slate-800' : 'bg-slate-900'}
                    ${isToday ? 'ring-2 ring-green-400' : ''}
                  `}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isCurrentMonth ? 'text-white' : 'text-gray-500'}
                    ${isToday ? 'text-green-400' : ''}
                  `}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayTournaments.slice(0, 2).map(tournament => (
                      <TournamentCard 
                        key={tournament._id} 
                        tournament={tournament} 
                        compact={true} 
                      />
                    ))}
                    {dayTournaments.length > 2 && (
                      <div className="text-xs text-gray-400">
                        +{dayTournaments.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-white">
            {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {" "}
            {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week Grid */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 sm:p-4">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekDates.map((date, index) => {
              const dayTournaments = getTournamentsByDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div key={index} className="space-y-2">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-medium text-gray-400">{weekDays[index]}</div>
                    <div className={`
                      text-sm sm:text-lg font-semibold p-1 sm:p-2 rounded
                      ${isToday ? 'bg-green-400 text-black' : 'text-white'}
                    `}>
                      {date.getDate()}
                    </div>
                  </div>
                  <div className="min-h-[120px] sm:min-h-[200px] space-y-1">
                    {dayTournaments.map(tournament => (
                      <TournamentCard key={tournament._id} tournament={tournament} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const groupedTournaments = tournaments.reduce((groups: { [key: string]: Tournament[] }, tournament) => {
      const date = new Date(tournament.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tournament);
      return groups;
    }, {});

    const sortedDates = Object.keys(groupedTournaments).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return (
      <div className="space-y-6">
        {sortedDates.map(dateString => {
          const date = new Date(dateString);
          const dayTournaments = groupedTournaments[dateString];

          return (
            <div key={dateString}>
              <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                {date.toLocaleDateString("en-US", { 
                  weekday: "long",
                  month: "long", 
                  day: "numeric",
                  year: "numeric" 
                })}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dayTournaments.map(tournament => (
                  <Card 
                    key={tournament._id}
                    className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                    onClick={() => onTournamentClick(tournament)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white">{tournament.name}</h4>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(tournament.date)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={`${
                              tournament.status === 'published' ? 'bg-green-600' : 
                              tournament.status === 'active' ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                          >
                            {tournament.status}
                          </Badge>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <span className="text-sm text-gray-400">{(tournament as any).matchType}</span>
                        </div>
                        <div className="text-sm text-gray-300">{tournament.location.venue}</div>
                        <div className="flex items-center space-x-4 mt-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(tournament as any).registeredCount !== undefined && (
                            <div className="flex items-center text-gray-400 text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              <span>{(tournament as any).registeredCount}/{tournament.capacity}</span>
                            </div>
                          )}
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(tournament as any).distance && (
                            <div className="flex items-center text-gray-400 text-xs">
                              <Navigation className="h-3 w-3 mr-1" />
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              <span>{formatDistance((tournament as any).distance)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
        
        {sortedDates.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No Tournaments Found</h3>
            <p className="text-gray-400">Try adjusting your filters to see more tournaments.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-center space-x-1">
        <Button
          variant={viewMode === "month" ? "tactical" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("month")}
          className="flex items-center space-x-2"
        >
          <CalendarIcon className="h-4 w-4" />
          <span>Month</span>
        </Button>
        <Button
          variant={viewMode === "week" ? "tactical" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("week")}
          className="flex items-center space-x-2"
        >
          <Clock className="h-4 w-4" />
          <span>Week</span>
        </Button>
        <Button
          variant={viewMode === "list" ? "tactical" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("list")}
          className="flex items-center space-x-2"
        >
          <List className="h-4 w-4" />
          <span>List</span>
        </Button>
      </div>

      {/* Calendar Content */}
      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "list" && renderListView()}
    </div>
  );
}