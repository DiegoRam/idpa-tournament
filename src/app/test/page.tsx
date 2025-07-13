"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Building, Calendar, Target } from "lucide-react";
import { ComponentTest } from "@/components/test/ComponentTest";

export default function TestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  
  // Mutations for testing
  const createUser = useMutation(api.users.createUser);
  const createClub = useMutation(api.clubs.createClub);
  const createTournament = useMutation(api.tournaments.createTournament);
  
  // Queries for testing
  const users = useQuery(api.users.getUsersByRole, { role: "shooter" });
  const clubs = useQuery(api.clubs.getActiveClubs);
  const tournaments = useQuery(api.tournaments.getTournamentsByClub, clubs?.[0] ? { clubId: clubs[0]._id } : "skip");

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testUserCreation = async () => {
    try {
      const userId = await createUser({
        email: "test.shooter@example.com",
        name: "Test Shooter",
        role: "shooter",
        idpaMemberNumber: "123456",
        primaryDivision: "SSP",
      });
      addTestResult(`✅ User created successfully: ${userId}`);
    } catch (error) {
      addTestResult(`❌ User creation failed: ${error}`);
    }
  };

  const testClubCreation = async () => {
    try {
      // First create a club owner
      const ownerId = await createUser({
        email: "club.owner@example.com",
        name: "Club Owner",
        role: "clubOwner",
      });

      const clubId = await createClub({
        name: "Test IDPA Club",
        ownerId,
        location: {
          address: "123 Range Road",
          city: "Buenos Aires",
          state: "Buenos Aires",
          country: "Argentina",
          coordinates: {
            lat: -34.6037,
            lng: -58.3816,
          },
        },
        contact: {
          email: "contact@testclub.com",
          phone: "+54 11 1234-5678",
          website: "https://testclub.com",
        },
      });
      addTestResult(`✅ Club created successfully: ${clubId}`);
    } catch (error) {
      addTestResult(`❌ Club creation failed: ${error}`);
    }
  };

  const testTournamentCreation = async () => {
    if (!clubs || clubs.length === 0) {
      addTestResult("❌ No clubs available - create a club first");
      return;
    }

    try {
      const now = Date.now();
      const tournamentDate = now + (7 * 24 * 60 * 60 * 1000); // 1 week from now
      
      const tournamentId = await createTournament({
        name: "Test IDPA Championship",
        clubId: clubs[0]._id,
        date: tournamentDate,
        registrationOpens: now,
        registrationCloses: now + (5 * 24 * 60 * 60 * 1000), // 5 days from now
        location: {
          venue: "Test Range",
          address: "456 Competition Lane",
          coordinates: {
            lat: -34.6037,
            lng: -58.3816,
          },
        },
        matchType: "Classifier",
        divisions: ["SSP", "ESP", "CDP"],
        entryFee: 50,
        currency: "USD",
        capacity: 60,
        squadConfig: {
          numberOfSquads: 6,
          maxShootersPerSquad: 10,
        },
        description: "Test tournament for system validation",
      });
      addTestResult(`✅ Tournament created successfully: ${tournamentId}`);
    } catch (error) {
      addTestResult(`❌ Tournament creation failed: ${error}`);
    }
  };

  const testSecurityOfficer = async () => {
    try {
      const soId = await createUser({
        email: "security.officer@example.com",
        name: "Security Officer",
        role: "securityOfficer",
        idpaMemberNumber: "789012",
      });
      addTestResult(`✅ Security Officer created successfully: ${soId}`);
    } catch (error) {
      addTestResult(`❌ Security Officer creation failed: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <Target className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-green-400 mb-2">
            IDPA System Test Suite
          </h1>
          <p className="text-gray-300">
            Test all Phase 1 functionality to ensure everything works correctly
          </p>
        </div>

        {/* Test Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="text-center">
              <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-sm">User Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={testUserCreation} className="w-full" size="sm">
                Create Test Shooter
              </Button>
              <Button onClick={testSecurityOfficer} className="w-full" size="sm">
                Create Security Officer
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="text-center">
              <Building className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-sm">Club Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testClubCreation} className="w-full" size="sm">
                Create Test Club
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="text-center">
              <Calendar className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-sm">Tournament Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testTournamentCreation} className="w-full" size="sm">
                Create Test Tournament
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="text-center">
              <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-sm">Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={clearResults} variant="outline" className="w-full" size="sm">
                Clear Results
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Data Display */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Users</CardTitle>
              <CardDescription>Current system users</CardDescription>
            </CardHeader>
            <CardContent>
              {users ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">Total shooters: {users.length}</p>
                  {users.slice(0, 3).map((user) => (
                    <div key={user._id} className="flex items-center justify-between">
                      <span className="text-sm">{user.name}</span>
                      <Badge variant="secondary">{user.primaryDivision || "No Division"}</Badge>
                    </div>
                  ))}
                  {users.length > 3 && (
                    <p className="text-xs text-gray-400">...and {users.length - 3} more</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Loading users...</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Clubs</CardTitle>
              <CardDescription>Active IDPA clubs</CardDescription>
            </CardHeader>
            <CardContent>
              {clubs ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">Total clubs: {clubs.length}</p>
                  {clubs.slice(0, 3).map((club) => (
                    <div key={club._id} className="space-y-1">
                      <p className="text-sm font-medium">{club.name}</p>
                      <p className="text-xs text-gray-400">{club.location.city}, {club.location.country}</p>
                    </div>
                  ))}
                  {clubs.length > 3 && (
                    <p className="text-xs text-gray-400">...and {clubs.length - 3} more</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Loading clubs...</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Tournaments</CardTitle>
              <CardDescription>Upcoming tournaments</CardDescription>
            </CardHeader>
            <CardContent>
              {tournaments ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">Total tournaments: {tournaments.length}</p>
                  {tournaments.slice(0, 3).map((tournament) => (
                    <div key={tournament._id} className="space-y-1">
                      <p className="text-sm font-medium">{tournament.name}</p>
                      <div className="flex gap-1">
                        {tournament.divisions.slice(0, 3).map((division) => (
                          <Badge key={division} variant="division" className="text-xs">
                            {division}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  {tournaments.length > 3 && (
                    <p className="text-xs text-gray-400">...and {tournaments.length - 3} more</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Loading tournaments...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-green-400">Test Results</CardTitle>
            <CardDescription>Live testing output and system validation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-400">No tests run yet. Click the test buttons above to start.</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-slate-900 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-green-400">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-300 space-y-2">
            <p><strong>1. Create Users:</strong> Test user creation with different roles (shooter, securityOfficer)</p>
            <p><strong>2. Create Club:</strong> Test club creation with location and contact info</p>
            <p><strong>3. Create Tournament:</strong> Test tournament creation with IDPA divisions and squad config</p>
            <p><strong>4. Watch Results:</strong> Monitor the test results panel for success/error messages</p>
            <p><strong>5. Verify Data:</strong> Check the data display cards to see created entities</p>
          </CardContent>
        </Card>

        {/* Component Testing */}
        <div className="mt-8">
          <ComponentTest />
        </div>
      </div>
    </div>
  );
}