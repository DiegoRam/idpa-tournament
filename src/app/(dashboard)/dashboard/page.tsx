"use client";

import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Users, 
  Calendar, 
  Trophy, 
  LogOut,
  User,
  Building,
  Shield,
  Crosshair
} from "lucide-react";

const ROLE_CONFIG = {
  admin: {
    icon: Users,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/20",
  },
  clubOwner: {
    icon: Building,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
  },
  securityOfficer: {
    icon: Shield,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
  },
  shooter: {
    icon: Crosshair,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
  },
};

export default function DashboardPage() {
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.userAuth.getCurrentUser);

  const handleSignOut = async () => {
    await signOut();
  };

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-green-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (currentUser === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Authentication required</p>
          <Button onClick={() => window.location.href = "/login"}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const roleConfig = ROLE_CONFIG[currentUser.role];
  const RoleIcon = roleConfig.icon;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Target className="h-8 w-8 text-green-400" />
              <h1 className="text-2xl font-bold text-green-400">
                IDPA Tournament System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RoleIcon className={`h-5 w-5 ${roleConfig.color}`} />
                <span className="text-gray-300">{currentUser.name}</span>
                <Badge variant="tactical" className="capitalize">
                  {currentUser.role.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back, {currentUser.name}!
            </h2>
            <p className="text-gray-400">
              You&apos;re signed in as a {currentUser.role.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </p>
          </div>

          {/* Role-specific Dashboard */}
          <div className={`p-6 rounded-lg border ${roleConfig.bgColor} ${roleConfig.borderColor}`}>
            <div className="flex items-center space-x-4 mb-6">
              <RoleIcon className={`h-8 w-8 ${roleConfig.color}`} />
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {currentUser.role === "clubOwner" ? "Club Owner" : 
                   currentUser.role === "securityOfficer" ? "Security Officer" :
                   currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard
                </h3>
                <p className="text-gray-400">
                  {currentUser.role === "admin" && "Manage the entire IDPA tournament system"}
                  {currentUser.role === "clubOwner" && "Create and manage tournaments for your club"}
                  {currentUser.role === "securityOfficer" && "Score stages and ensure safety compliance"}
                  {currentUser.role === "shooter" && "Register for tournaments and track your performance"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentUser.role === "admin" && (
                <>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <Users className="h-6 w-6 text-red-400 mb-2" />
                      <CardTitle className="text-sm">Manage Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View All Users
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <Building className="h-6 w-6 text-red-400 mb-2" />
                      <CardTitle className="text-sm">Manage Clubs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View All Clubs
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <Target className="h-6 w-6 text-red-400 mb-2" />
                      <CardTitle className="text-sm">System Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        Configure System
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {currentUser.role === "clubOwner" && (
                <>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <Calendar className="h-6 w-6 text-purple-400 mb-2" />
                      <CardTitle className="text-sm">Create Tournament</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="tactical" size="sm" className="w-full">
                        New Tournament
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <Users className="h-6 w-6 text-purple-400 mb-2" />
                      <CardTitle className="text-sm">Manage Squads</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        Squad Manager
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <Trophy className="h-6 w-6 text-purple-400 mb-2" />
                      <CardTitle className="text-sm">Tournament Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View Results
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {currentUser.role === "securityOfficer" && (
                <>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <Target className="h-6 w-6 text-orange-400 mb-2" />
                      <CardTitle className="text-sm">Score Stages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="tactical" size="sm" className="w-full">
                        Start Scoring
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <Users className="h-6 w-6 text-orange-400 mb-2" />
                      <CardTitle className="text-sm">My Squad</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View Assignment
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <Shield className="h-6 w-6 text-orange-400 mb-2" />
                      <CardTitle className="text-sm">Safety Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View Log
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {currentUser.role === "shooter" && (
                <>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <Calendar className="h-6 w-6 text-blue-400 mb-2" />
                      <CardTitle className="text-sm">Find Tournaments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="tactical" size="sm" className="w-full">
                        Browse Events
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <Trophy className="h-6 w-6 text-blue-400 mb-2" />
                      <CardTitle className="text-sm">My Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View Scores
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader className="pb-3">
                      <User className="h-6 w-6 text-blue-400 mb-2" />
                      <CardTitle className="text-sm">My Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* User Profile Info */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Profile Information</CardTitle>
              <CardDescription>Your IDPA account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white">{currentUser.email}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Role</Label>
                  <p className="text-white capitalize">
                    {currentUser.role.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                {currentUser.idpaMemberNumber && (
                  <div>
                    <Label className="text-gray-400">IDPA Member Number</Label>
                    <p className="text-white">{currentUser.idpaMemberNumber}</p>
                  </div>
                )}
                {currentUser.primaryDivision && (
                  <div>
                    <Label className="text-gray-400">Primary Division</Label>
                    <Badge variant="division">{currentUser.primaryDivision}</Badge>
                  </div>
                )}
                <div>
                  <Label className="text-gray-400">Profile Status</Label>
                  <div className="flex items-center space-x-2">
                    {currentUser.profileCompleted ? (
                      <Badge variant="default" className="bg-green-600">Complete</Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-400">Incomplete</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">Member Since</Label>
                  <p className="text-white">
                    {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "Recent"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">Last Active</Label>
                  <p className="text-white">
                    {currentUser.lastActive ? new Date(currentUser.lastActive).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm font-medium ${className}`}>{children}</div>;
}