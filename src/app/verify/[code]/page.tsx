"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Calendar, 
  MapPin, 
  Trophy, 
  User, 
  CheckCircle, 
  AlertCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function VerifyBadgePage() {
  const params = useParams();
  const verificationCode = params.code as string;

  const badge = useQuery(api.badges.getBadgeByVerificationCode, 
    verificationCode ? { verificationCode } : "skip"
  );

  if (badge === undefined) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-gray-600 mb-4 animate-spin" />
            <p className="text-gray-400">Verifying badge...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (badge === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Badge Not Found</h2>
            <p className="text-gray-400 mb-4">
              The verification code &quot;{verificationCode}&quot; is not valid or the badge may have been removed.
            </p>
            <Link href="/tournaments">
              <Button variant="outline">
                Browse Tournaments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBadgeTypeDisplay = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-green-400" />
            <div>
              <h1 className="text-2xl font-bold text-green-400">Badge Verification</h1>
              <p className="text-gray-400">Official IDPA Tournament Achievement Badge</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Badge Display */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-semibold">Verified Badge</span>
              </div>
              <CardTitle className="text-2xl text-white">
                {badge.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Badge Image */}
              {badge.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-gray-700">
                  <Image 
                    src={badge.imageUrl} 
                    alt={badge.title}
                    width={400}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Badge Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-300 mb-2">Badge Type</h3>
                  <Badge variant="outline" className="bg-blue-900/20 border-blue-800">
                    {getBadgeTypeDisplay(badge.type)}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-400">{badge.description}</p>
                </div>

                {/* Performance Details */}
                {(badge.metadata?.division || badge.metadata?.classification || badge.metadata?.placement) && (
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-2">Performance</h3>
                    <div className="flex flex-wrap gap-2">
                      {badge.metadata.division && (
                        <Badge variant="outline" className="bg-blue-900/20 border-blue-800">
                          {badge.metadata.division} Division
                        </Badge>
                      )}
                      {badge.metadata.classification && (
                        <Badge variant="outline" className="bg-purple-900/20 border-purple-800">
                          {badge.metadata.classification} Class
                        </Badge>
                      )}
                      {badge.metadata.placement && (
                        <Badge variant="outline" className="bg-yellow-900/20 border-yellow-800">
                          {badge.metadata.placement === 1 ? "1st Place" :
                           badge.metadata.placement === 2 ? "2nd Place" :
                           badge.metadata.placement === 3 ? "3rd Place" :
                           `${badge.metadata.placement}th Place`}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Verification Code */}
                <div>
                  <h3 className="font-semibold text-gray-300 mb-2">Verification Code</h3>
                  <code className="text-green-400 font-mono text-lg bg-gray-800 px-3 py-1 rounded">
                    {badge.verificationCode}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tournament & Shooter Info */}
          <div className="space-y-6">
            {/* Shooter Information */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-green-400 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Shooter Information
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-300 mb-1">Shooter Name</h3>
                  <p className="text-white text-lg">{badge.shooter?.name || "Not Available"}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-300 mb-1">Badge Earned</h3>
                  <p className="text-gray-400">
                    {formatDate(badge.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tournament Information */}
            {badge.tournament && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-green-400 flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Tournament Information
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-1">Tournament Name</h3>
                    <p className="text-white text-lg">{badge.tournament.name}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(badge.tournament.date)}</span>
                    </div>

                    {badge.tournament.location && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{badge.tournament.location.venue}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Status */}
            <Card className="bg-green-900/20 border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <div>
                    <h3 className="font-semibold text-green-400">Verified Authentic</h3>
                    <p className="text-gray-400 text-sm">
                      This badge has been verified as authentic by the IDPA Tournament System
                    </p>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Badge authenticity confirmed</p>
                  <p>• Tournament results verified</p>
                  <p>• Achievement criteria validated</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/tournaments">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Trophy className="h-4 w-4 mr-2" />
                  Browse IDPA Tournaments
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.print()}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Print Verification
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}