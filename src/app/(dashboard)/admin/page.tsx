"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building, 
  Calendar, 
  AlertTriangle,
  Shield,
  Activity,
  Settings,
  BarChart3,
  Database,
  UserCog,
  Clock,
  Target
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const systemAnalytics = useQuery(api.systemAdmin.getSystemAnalytics, {});
  const systemHealth = useQuery(api.systemAdmin.getSystemHealth, {});
  const userStatistics = useQuery(api.admin.getUserStatistics, {});
  const clubPerformance = useQuery(api.clubs.getClubPerformanceMetrics, { limit: 5 });

  // Redirect if not admin
  if (currentUser === null || (currentUser && currentUser.role !== "admin")) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">Administrator access required</p>
          <Button onClick={() => window.location.href = "/dashboard"}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (currentUser === undefined || systemAnalytics === undefined || systemHealth === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-green-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "good": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "warning": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "critical": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-red-400" />
              <div>
                <h1 className="text-2xl font-bold text-red-400">
                  System Administration
                </h1>
                <p className="text-gray-400">
                  IDPA Tournament Management System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="tactical" className="bg-red-400/10 text-red-400 border-red-400/20">
                Administrator
              </Badge>
              <span className="text-gray-300">{currentUser.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className={`bg-slate-800 border-slate-600 ${getHealthStatusColor(systemHealth.status)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Activity className="h-5 w-5" />
                  <Badge variant="outline" className={getHealthStatusColor(systemHealth.status)}>
                    {systemHealth.status.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="text-lg">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.healthScore}%</div>
                <p className="text-sm opacity-70">Health Score</p>
                {systemHealth.alerts.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center text-xs text-red-400">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {systemHealth.alerts.length} alert(s)
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <Users className="h-5 w-5 text-blue-400 mb-2" />
                <CardTitle className="text-lg">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {systemAnalytics.overview.totalUsers}
                </div>
                <p className="text-sm text-gray-400">
                  {systemAnalytics.overview.activeUsers} active
                </p>
                <div className="mt-2">
                  <div className="text-xs text-green-400">
                    +{userStatistics?.growth.newUsersThisPeriod || 0} this month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <Building className="h-5 w-5 text-purple-400 mb-2" />
                <CardTitle className="text-lg">Clubs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {systemAnalytics.overview.totalClubs}
                </div>
                <p className="text-sm text-gray-400">
                  {clubPerformance?.summary.activeClubs || 0} active
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <Calendar className="h-5 w-5 text-green-400 mb-2" />
                <CardTitle className="text-lg">Tournaments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {systemAnalytics.overview.totalTournaments}
                </div>
                <p className="text-sm text-gray-400">
                  {systemAnalytics.overview.recentTournaments} recent
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Administrative Tools</CardTitle>
              <CardDescription>Quick access to system management functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <UserCog className="h-6 w-6 text-blue-400" />
                    <span>Manage Users</span>
                  </Button>
                </Link>
                
                <Link href="/admin/clubs">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <Building className="h-6 w-6 text-purple-400" />
                    <span>Manage Clubs</span>
                  </Button>
                </Link>
                
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <BarChart3 className="h-6 w-6 text-green-400" />
                    <span>Analytics</span>
                  </Button>
                </Link>
                
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <Settings className="h-6 w-6 text-yellow-400" />
                    <span>System Settings</span>
                  </Button>
                </Link>
                
                <Link href="/admin/security">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <Shield className="h-6 w-6 text-red-400" />
                    <span>Security Logs</span>
                  </Button>
                </Link>
                
                <Link href="/admin/audit">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <Clock className="h-6 w-6 text-orange-400" />
                    <span>Audit Trail</span>
                  </Button>
                </Link>
                
                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <Database className="h-6 w-6 text-cyan-400" />
                    <span>Reports</span>
                  </Button>
                </Link>
                
                <Link href="/admin/monitoring">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <Activity className="h-6 w-6 text-pink-400" />
                    <span>Monitoring</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Distribution */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400">User Distribution</CardTitle>
                <CardDescription>Users by role and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(systemAnalytics.breakdowns.usersByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          role === "admin" ? "bg-red-400" :
                          role === "clubOwner" ? "bg-purple-400" :
                          role === "securityOfficer" ? "bg-orange-400" :
                          "bg-blue-400"
                        }`} />
                        <span className="text-gray-300 capitalize">
                          {role.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Active Users (30d):</span>
                    <span className="text-green-400">
                      {userStatistics?.growth.activeUserRate || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tournament Status */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400">Tournament Status</CardTitle>
                <CardDescription>Current tournament pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(systemAnalytics.breakdowns.tournamentsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          status === "draft" ? "bg-gray-400" :
                          status === "published" ? "bg-blue-400" :
                          status === "active" ? "bg-green-400" :
                          "bg-purple-400"
                        }`} />
                        <span className="text-gray-300 capitalize">{status}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Registrations:</span>
                      <span className="text-white">{systemAnalytics.overview.totalRegistrations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Growth (30d):</span>
                      <span className="text-green-400">
                        +{systemAnalytics.trends.registrationGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Clubs */}
          {clubPerformance && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400">Top Performing Clubs</CardTitle>
                <CardDescription>Most active clubs by engagement score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clubPerformance.clubs.slice(0, 5).map((clubData, index) => (
                    <div key={clubData.club._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                        <div>
                          <h4 className="font-medium text-white">{clubData.club.name}</h4>
                          <p className="text-sm text-gray-400">
                            {clubData.club.location.city}, {clubData.club.location.state}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-400">
                          Score: {clubData.metrics.activityScore}
                        </div>
                        <div className="text-xs text-gray-400">
                          {clubData.metrics.totalMembers} members • {clubData.metrics.recentTournaments} recent tournaments
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Alerts */}
          {systemHealth.alerts.length > 0 && (
            <Card className="bg-red-900/20 border-red-800">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>System Alerts</span>
                </CardTitle>
                <CardDescription>Issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {systemHealth.alerts.map((alert, index) => (
                    <div key={index} className="flex items-center space-x-2 text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{alert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}