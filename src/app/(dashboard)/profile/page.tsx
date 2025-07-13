"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Shield, 
  Target, 
  Settings, 
  Save,
  ArrowLeft
} from "lucide-react";
import { IDPA_DIVISIONS, IDPA_CLASSIFICATIONS } from "@/lib/utils";
import Link from "next/link";

export default function ProfilePage() {
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const updateProfile = useMutation(api.users.updateUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    idpaMemberNumber: "",
    primaryDivision: "",
    notifications: true,
    defaultDivision: "",
  });

  // Initialize form data when user loads
  useState(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        idpaMemberNumber: currentUser.idpaMemberNumber || "",
        primaryDivision: currentUser.primaryDivision || "",
        notifications: currentUser.preferences?.notifications ?? true,
        defaultDivision: currentUser.preferences?.defaultDivision || "",
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      await updateProfile({
        userId: currentUser._id,
        name: formData.name,
        idpaMemberNumber: formData.idpaMemberNumber || undefined,
        primaryDivision: formData.primaryDivision || undefined,
        preferences: {
          notifications: formData.notifications,
          defaultDivision: formData.defaultDivision || undefined,
          homeLocation: currentUser.preferences?.homeLocation,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        idpaMemberNumber: currentUser.idpaMemberNumber || "",
        primaryDivision: currentUser.primaryDivision || "",
        notifications: currentUser.preferences?.notifications ?? true,
        defaultDivision: currentUser.preferences?.defaultDivision || "",
      });
    }
    setIsEditing(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-green-400" />
                <h1 className="text-xl font-bold text-green-400">User Profile</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button
                  variant="tactical"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="tactical"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Information */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Your account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-white p-2 bg-slate-800 rounded-md">{currentUser.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-white">{currentUser.email}</p>
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <Badge variant="tactical" className="capitalize">
                      {currentUser.role.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberSince">Member Since</Label>
                  <p className="text-white p-2 bg-slate-800 rounded-md">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IDPA Information */}
          {(currentUser.role === "shooter" || currentUser.role === "securityOfficer") && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>IDPA Information</span>
                </CardTitle>
                <CardDescription>
                  Your IDPA membership and competition details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idpaMemberNumber">IDPA Member Number</Label>
                    {isEditing ? (
                      <Input
                        id="idpaMemberNumber"
                        value={formData.idpaMemberNumber}
                        onChange={(e) => setFormData({ ...formData, idpaMemberNumber: e.target.value })}
                        placeholder="Enter your IDPA member number"
                      />
                    ) : (
                      <p className="text-white p-2 bg-slate-800 rounded-md">
                        {currentUser.idpaMemberNumber || "Not provided"}
                      </p>
                    )}
                  </div>
                  
                  {currentUser.role === "shooter" && (
                    <div className="space-y-2">
                      <Label htmlFor="primaryDivision">Primary Division</Label>
                      {isEditing ? (
                        <Select 
                          value={formData.primaryDivision} 
                          onValueChange={(value) => setFormData({ ...formData, primaryDivision: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your primary division" />
                          </SelectTrigger>
                          <SelectContent>
                            {IDPA_DIVISIONS.map((division) => (
                              <SelectItem key={division.value} value={division.value}>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="division" className="text-xs">
                                    {division.label}
                                  </Badge>
                                  <span className="text-sm">{division.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 bg-slate-800 rounded-md">
                          {currentUser.primaryDivision ? (
                            <Badge variant="division">{currentUser.primaryDivision}</Badge>
                          ) : (
                            <span className="text-gray-400">Not selected</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Classifications Display */}
                {currentUser.role === "shooter" && (
                  <div className="space-y-2">
                    <Label>Current Classifications</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {IDPA_DIVISIONS.map((division) => {
                        const classification = currentUser.classifications?.[division.value as keyof typeof currentUser.classifications];
                        return (
                          <div key={division.value} className="p-3 bg-slate-800 rounded-lg text-center">
                            <Badge variant="division" className="mb-2 text-xs">
                              {division.label}
                            </Badge>
                            <div>
                              {classification ? (
                                <Badge variant="classification" className="text-xs">
                                  {classification}
                                </Badge>
                              ) : (
                                <span className="text-xs text-gray-400">Unclassified</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Preferences */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Preferences</span>
              </CardTitle>
              <CardDescription>
                Customize your account settings and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-400">
                    Receive notifications about tournaments and scores
                  </p>
                </div>
                {isEditing ? (
                  <Switch
                    checked={formData.notifications}
                    onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })}
                  />
                ) : (
                  <Badge variant={currentUser.preferences?.notifications ? "default" : "outline"}>
                    {currentUser.preferences?.notifications ? "Enabled" : "Disabled"}
                  </Badge>
                )}
              </div>

              <Separator className="bg-slate-700" />

              {currentUser.role === "shooter" && (
                <div className="space-y-2">
                  <Label htmlFor="defaultDivision">Default Division for Tournaments</Label>
                  {isEditing ? (
                    <Select 
                      value={formData.defaultDivision} 
                      onValueChange={(value) => setFormData({ ...formData, defaultDivision: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select default division" />
                      </SelectTrigger>
                      <SelectContent>
                        {IDPA_DIVISIONS.map((division) => (
                          <SelectItem key={division.value} value={division.value}>
                            <div className="flex items-center space-x-2">
                              <Badge variant="division" className="text-xs">
                                {division.label}
                              </Badge>
                              <span className="text-sm">{division.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-slate-800 rounded-md">
                      {currentUser.preferences?.defaultDivision ? (
                        <Badge variant="division">{currentUser.preferences.defaultDivision}</Badge>
                      ) : (
                        <span className="text-gray-400">Use primary division</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Account Statistics</CardTitle>
              <CardDescription>
                Your activity and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">0</div>
                  <p className="text-sm text-gray-400">Tournaments Participated</p>
                </div>
                <div className="text-center p-4 bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">0</div>
                  <p className="text-sm text-gray-400">Badges Earned</p>
                </div>
                <div className="text-center p-4 bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.floor((Date.now() - currentUser.createdAt) / (1000 * 60 * 60 * 24))}
                  </div>
                  <p className="text-sm text-gray-400">Days as Member</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}