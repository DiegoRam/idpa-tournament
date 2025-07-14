"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, MapPin, Users, Clock, Share2, Download, Home } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Id } from "@/lib/convex";

export default function RegistrationSuccessPage() {
  const params = useParams();
  const tournamentId = params.tournamentId as string;

  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const tournament = useQuery(api.tournaments.getTournamentById, 
    tournamentId ? { tournamentId: tournamentId as Id<"tournaments"> } : "skip"
  );
  const registration = useQuery(api.registrations.getRegistrationByUserAndTournament,
    tournament && currentUser ? {
      userId: currentUser._id,
      tournamentId: tournament._id
    } : "skip"
  );
  const squads = useQuery(api.squads.getSquadsByTournamentWithDetails,
    tournament ? { tournamentId: tournament._id } : "skip"
  );

  if (!tournament || !currentUser || !registration || !squads) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  const registeredSquad = squads.find(s => s._id === registration.squadId);

  const handleAddToCalendar = () => {
    // Generate calendar event data
    const startDate = new Date(tournament.date);
    const endDate = new Date(tournament.date);
    endDate.setHours(endDate.getHours() + 8); // Assume 8-hour event

    const eventDetails = {
      title: `IDPA Tournament: ${tournament.name}`,
      details: `Squad: ${registeredSquad?.name} at ${registeredSquad?.timeSlot}\nDivision: ${registration.division}\nClassification: ${registration.classification}`,
      location: `${tournament.location.venue}, ${tournament.location.address}`,
      startDate: startDate.toISOString().replace(/-|:|\.\d\d\d/g, ''),
      endDate: endDate.toISOString().replace(/-|:|\.\d\d\d/g, ''),
    };

    // Google Calendar URL
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&details=${encodeURIComponent(eventDetails.details)}&location=${encodeURIComponent(eventDetails.location)}&dates=${eventDetails.startDate}/${eventDetails.endDate}`;
    
    window.open(googleUrl, '_blank');
  };

  const handleShare = () => {
    const shareText = `I just registered for ${tournament.name}! Squad ${registeredSquad?.name} at ${registeredSquad?.timeSlot}. See you at the range! 🎯 #IDPA #IDPAArgentina`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Tournament Registration',
        text: shareText,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Registration details copied to clipboard!');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4 animate-pulse" />
        <h1 className="text-4xl font-bold text-green-400 mb-2">Registration Successful!</h1>
        <p className="text-xl text-gray-300">You&apos;re all set for {tournament.name}</p>
      </div>

      {/* Registration Details */}
      <Card className="bg-gray-900/50 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="text-green-400">Registration Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Tournament</p>
                <p className="font-semibold text-gray-100">{tournament.name}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="font-medium text-gray-100">{formatDate(tournament.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-medium text-gray-100">{tournament.location.venue}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Squad</p>
                  <p className="font-medium text-gray-100">{registeredSquad?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Time Slot</p>
                  <p className="font-medium text-gray-100">{registeredSquad?.timeSlot}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Division & Classification</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                    {registration.division}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/50">
                    {registration.classification}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gray-900/50 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="text-green-400">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <div>
                <p className="font-medium">Complete Payment</p>
                <p className="text-sm text-gray-400">Entry fee payment instructions will be sent to your email</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <div>
                <p className="font-medium">Prepare Your Gear</p>
                <p className="text-sm text-gray-400">Make sure your equipment meets {registration.division} division requirements</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <div>
                <p className="font-medium">Arrive Early</p>
                <p className="text-sm text-gray-400">Check-in opens 30 minutes before your squad time</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleAddToCalendar}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Add to Calendar
        </Button>
        
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share Registration
        </Button>
        
        <Link href={`/tournaments/${tournamentId}`}>
          <Button variant="outline" className="flex items-center gap-2 w-full">
            <Download className="h-4 w-4" />
            View Tournament
          </Button>
        </Link>
        
        <Link href="/dashboard">
          <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2 w-full">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}