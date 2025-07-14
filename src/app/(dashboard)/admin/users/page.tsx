"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Id } from "@/lib/convex";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Filter,
  Shield,
  Building,
  Target,
  User,
  MoreVertical,
  UserX,
  UserCheck,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const usersData = useQuery(api.admin.getAllUsers, {
    search: searchTerm || undefined,
    role: roleFilter !== "all" ? (roleFilter as "admin" | "clubOwner" | "securityOfficer" | "shooter") : undefined,
    limit: 20,
    offset: page * 20,
  });

  const updateUserRole = useMutation(api.admin.updateUserRole);
  const suspendUser = useMutation(api.admin.suspendUser);
  const unsuspendUser = useMutation(api.admin.unsuspendUser);

  // Redirect if not admin
  if (currentUser === null || (currentUser && currentUser.role !== "admin")) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">Administrator access required</p>
          <Button onClick={() => window.location.href = "/admin"}>
            Return to Admin Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (currentUser === undefined || usersData === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-300">Loading users...</p>
        </div>
      </div>
    );
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole({
        userId: userId as Id<"users">,
        newRole: newRole as "admin" | "clubOwner" | "securityOfficer" | "shooter",
        reason: "Updated by administrator",
      });
      toast.success("User role updated successfully");
    } catch {
      toast.error("Failed to update user role");
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await suspendUser({
        userId: userId as Id<"users">,
        reason: "Suspended by administrator",
      });
      toast.success("User suspended successfully");
    } catch {
      toast.error("Failed to suspend user");
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    try {
      await unsuspendUser({
        userId: userId as Id<"users">,
      });
      toast.success("User unsuspended successfully");
    } catch {
      toast.error("Failed to unsuspend user");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="h-4 w-4 text-red-400" />;
      case "clubOwner": return <Building className="h-4 w-4 text-purple-400" />;
      case "securityOfficer": return <Target className="h-4 w-4 text-orange-400" />;
      case "shooter": return <User className="h-4 w-4 text-blue-400" />;
      default: return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-400/10 text-red-400 border-red-400/20";
      case "clubOwner": return "bg-purple-400/10 text-purple-400 border-purple-400/20";
      case "securityOfficer": return "bg-orange-400/10 text-orange-400 border-orange-400/20";
      case "shooter": return "bg-blue-400/10 text-blue-400 border-blue-400/20";
      default: return "bg-gray-400/10 text-gray-400 border-gray-400/20";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isUserSuspended = (user: any) => {
    return user.preferences?.suspended === true;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-blue-400">
                  User Management
                </h1>
                <p className="text-gray-400">
                  Manage system users and permissions
                </p>
              </div>
            </div>
            <Badge variant="tactical" className="bg-red-400/10 text-red-400 border-red-400/20">
              {usersData.total} Users
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or IDPA number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600"
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="clubOwner">Club Owner</SelectItem>
                      <SelectItem value="securityOfficer">Security Officer</SelectItem>
                      <SelectItem value="shooter">Shooter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Users</CardTitle>
              <CardDescription>
                Showing {usersData.users.length} of {usersData.total} users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usersData.users.map((user) => (
                  <div
                    key={user._id}
                    className={`p-4 bg-slate-800 rounded-lg border ${
                      isUserSuspended(user) ? "border-red-500/50" : "border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role || "shooter")}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-white">{user.name}</h3>
                              {isUserSuspended(user) && (
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            {user.idpaMemberNumber && (
                              <p className="text-xs text-gray-500">
                                IDPA: {user.idpaMemberNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Role Badge */}
                        <Badge className={getRoleBadgeColor(user.role || "shooter")}>
                          {(user.role || "shooter").replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>

                        {/* Club Info */}
                        {user.club && (
                          <Badge variant="outline" className="text-xs">
                            {user.club.name}
                          </Badge>
                        )}

                        {/* Last Active */}
                        <div className="text-xs text-gray-400 text-right">
                          <div>Joined: {formatDate(user.createdAt || 0)}</div>
                          <div>Active: {formatDate(user.lastActive || 0)}</div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {/* Role Change */}
                          <Select
                            value={user.role || "shooter"}
                            onValueChange={(newRole) => handleRoleChange(user._id, newRole)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs bg-slate-700 border-slate-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="clubOwner">Club Owner</SelectItem>
                              <SelectItem value="securityOfficer">Security Officer</SelectItem>
                              <SelectItem value="shooter">Shooter</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Suspend/Unsuspend */}
                          {isUserSuspended(user) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnsuspendUser(user._id)}
                              className="h-8 px-2"
                            >
                              <UserCheck className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSuspendUser(user._id)}
                              className="h-8 px-2 border-red-600 text-red-400 hover:bg-red-600/20"
                            >
                              <UserX className="h-3 w-3" />
                            </Button>
                          )}

                          {/* More Actions */}
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Suspension Notice */}
                    {isUserSuspended(user) && (
                      <div className="mt-3 p-2 bg-red-900/20 border border-red-800 rounded text-sm">
                        <div className="flex items-center space-x-2 text-red-400">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Suspended</span>
                        </div>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(user.preferences as any)?.suspensionReason && (
                          <p className="text-red-300 mt-1">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            Reason: {(user.preferences as any).suspensionReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
                <div className="text-sm text-gray-400">
                  Showing {page * 20 + 1} - {Math.min((page + 1) * 20, usersData.total)} of {usersData.total} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!usersData.hasMore}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}