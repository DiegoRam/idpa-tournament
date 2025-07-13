"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Users, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Target className="h-12 w-12 text-green-400 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              IDPA Tournament Manager
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional tournament management for IDPA shooting competitions. 
            Real-time scoring, squad management, and digital achievements.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button 
              variant="tactical" 
              size="lg" 
              className="tactical-glow"
              onClick={() => window.location.href = '/test'}
            >
              Test System
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = '/register'}
            >
              Register (Coming Soon)
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-slate-900/50 border-slate-700 tactical-border">
            <CardHeader className="text-center">
              <Calendar className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-green-400">Tournament Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Browse and register for IDPA tournaments with advanced filtering by location, division, and date.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 tactical-border">
            <CardHeader className="text-center">
              <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-green-400">Squad Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See who&apos;s registered in each squad before joining. Find friends and clubmates easily.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 tactical-border">
            <CardHeader className="text-center">
              <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-green-400">Real-time Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                IDPA-compliant scoring with offline support. Live leaderboards and instant results.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 tactical-border">
            <CardHeader className="text-center">
              <Trophy className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-green-400">Digital Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Earn achievement badges and share your accomplishments on social media.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* IDPA Divisions */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-green-400 mb-8">Supported IDPA Divisions</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="division">Stock Service Pistol (SSP)</Badge>
            <Badge variant="division">Enhanced Service Pistol (ESP)</Badge>
            <Badge variant="division">Custom Defensive Pistol (CDP)</Badge>
            <Badge variant="division">Compact Carry Pistol (CCP)</Badge>
            <Badge variant="division">Revolver (REV)</Badge>
            <Badge variant="division">Back-Up Gun (BUG)</Badge>
            <Badge variant="division">Pistol Caliber Carbine (PCC)</Badge>
            <Badge variant="division">Carry Optics (CO)</Badge>
          </div>
        </div>

        {/* Classifications */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-green-400 mb-8">IDPA Classifications</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="classification">Master (MA)</Badge>
            <Badge variant="classification">Expert (EX)</Badge>
            <Badge variant="classification">Sharpshooter (SS)</Badge>
            <Badge variant="classification">Marksman (MM)</Badge>
            <Badge variant="classification">Novice (NV)</Badge>
            <Badge variant="classification">Unclassified (UN)</Badge>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Built for the IDPA shooting community with ❤️</p>
          <p className="text-sm mt-2">
            Powered by Next.js, Convex, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
