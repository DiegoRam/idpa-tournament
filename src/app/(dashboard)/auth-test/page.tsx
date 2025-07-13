"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  User,
  Mail,
  Users,
  Building,
  Shield,
  Crosshair,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { IDPA_DIVISIONS } from "@/lib/utils";
import Link from "next/link";

const TEST_USERS = [
  {
    role: "admin",
    name: "Admin User",
    email: "admin@test.com",
    password: "test123",
    icon: Users,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    tests: [
      "Access all dashboard sections",
      "View all user roles in interface",
      "Access system-wide functions",
      "Manage other users (if implemented)",
    ]
  },
  {
    role: "clubOwner",
    name: "Club Owner",
    email: "clubowner@test.com", 
    password: "test123",
    icon: Building,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    tests: [
      "Access tournament creation features",
      "View club management options",
      "Access squad management",
      "Generate tournament reports",
    ]
  },
  {
    role: "securityOfficer",
    name: "Security Officer",
    email: "so@test.com",
    password: "test123",
    idpaMemberNumber: "SO123456",
    icon: Shield,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    tests: [
      "Access stage scoring interface",
      "View squad assignments",
      "Manage safety protocols",
      "Enter and modify scores",
    ]
  },
  {
    role: "shooter",
    name: "Test Shooter",
    email: "shooter@test.com",
    password: "test123",
    idpaMemberNumber: "SH789012",
    primaryDivision: "SSP",
    icon: Crosshair,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    tests: [
      "Register for tournaments",
      "Select tournament squads",
      "View personal scores and results",
      "Update profile and preferences",
    ]
  },
];

interface TestResult {
  role: string;
  test: string;
  status: "pass" | "fail" | "pending";
  message?: string;
}

export default function AuthTestPage() {
  const registerUser = useAction(api.userAuth.registerUser);
  const [isCreatingUsers, setIsCreatingUsers] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [createdUsers, setCreatedUsers] = useState<string[]>([]);

  const addTestResult = (role: string, test: string, status: "pass" | "fail" | "pending", message?: string) => {
    setTestResults(prev => [
      ...prev.filter(r => !(r.role === role && r.test === test)),
      { role, test, status, message }
    ]);
  };

  const createTestUsers = async () => {
    setIsCreatingUsers(true);
    setTestResults([]);
    const created: string[] = [];

    for (const user of TEST_USERS) {
      try {
        addTestResult(user.role, "User Creation", "pending", "Creating user...");
        
        await registerUser({
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role as any,
          idpaMemberNumber: user.idpaMemberNumber,
          primaryDivision: user.primaryDivision as any,
        });

        addTestResult(user.role, "User Creation", "pass", `✅ Created ${user.name}`);
        created.push(user.email);
      } catch (error: any) {
        addTestResult(user.role, "User Creation", "fail", `❌ Failed: ${error.message}`);
      }
    }

    setCreatedUsers(created);
    setIsCreatingUsers(false);
  };

  const getTestStatusColor = (status: "pass" | "fail" | "pending") => {
    switch (status) {
      case "pass": return "text-green-400";
      case "fail": return "text-red-400"; 
      case "pending": return "text-yellow-400";
    }
  };

  const getTestStatusIcon = (status: "pass" | "fail" | "pending") => {
    switch (status) {
      case "pass": return CheckCircle;
      case "fail": return XCircle;
      case "pending": return AlertCircle;
    }
  };

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
                <Target className="h-6 w-6 text-green-400" />
                <h1 className="text-xl font-bold text-green-400">Authentication Testing</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Introduction */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Manual Testing Plan</CardTitle>
              <CardDescription>
                Comprehensive testing procedures for all IDPA user roles and authentication features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">
                  This page provides a systematic approach to testing the authentication system 
                  with all four user roles. Follow the steps below to verify that each role 
                  has appropriate access and functionality.
                </p>
                
                <div className="p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">Testing Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                    <li>Create test users for all roles using the button below</li>
                    <li>Sign out of your current account</li>
                    <li>Sign in as each test user and verify role-specific functionality</li>
                    <li>Test the manual scenarios listed for each role</li>
                    <li>Document any issues or unexpected behavior</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test User Creation */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Step 1: Create Test Users</CardTitle>
              <CardDescription>
                Generate test accounts for all four IDPA user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={createTestUsers}
                  disabled={isCreatingUsers}
                  variant="tactical"
                  className="w-full"
                >
                  {isCreatingUsers ? "Creating Test Users..." : "Create All Test Users"}
                </Button>

                {/* Test Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {TEST_USERS.map((user) => {
                    const Icon = user.icon;
                    const userCreated = createdUsers.includes(user.email);
                    const creationResult = testResults.find(r => r.role === user.role && r.test === "User Creation");
                    
                    return (
                      <div
                        key={user.role}
                        className={`p-4 rounded-lg border ${user.bgColor} border-slate-600`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <Icon className={`h-5 w-5 ${user.color}`} />
                          <div>
                            <h4 className="font-medium text-white">{user.name}</h4>
                            <p className="text-xs text-gray-400 capitalize">
                              {user.role.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-gray-400">Email:</span>
                            <p className="text-white">{user.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Password:</span>
                            <p className="text-white font-mono">{user.password}</p>
                          </div>
                          {user.idpaMemberNumber && (
                            <div>
                              <span className="text-gray-400">IDPA #:</span>
                              <p className="text-white">{user.idpaMemberNumber}</p>
                            </div>
                          )}
                          {user.primaryDivision && (
                            <div>
                              <span className="text-gray-400">Division:</span>
                              <Badge variant="division" className="text-xs">
                                {user.primaryDivision}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {creationResult && (
                          <div className="mt-3 pt-3 border-t border-slate-600">
                            <p className={`text-xs ${getTestStatusColor(creationResult.status)}`}>
                              {creationResult.message}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Testing Procedures */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-400">Step 2: Manual Testing Procedures</h2>
            
            {TEST_USERS.map((user) => {
              const Icon = user.icon;
              
              return (
                <Card key={user.role} className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <CardTitle className={`${user.color} flex items-center space-x-2`}>
                      <Icon className="h-5 w-5" />
                      <span>{user.name} Testing</span>
                      <Badge variant="outline" className="capitalize">
                        {user.role.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Test procedures for {user.role} role functionality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Login Instructions */}
                      <div className="p-3 bg-slate-800 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Login Credentials:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Email:</span>
                            <span className="ml-2 text-white font-mono">{user.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Password:</span>
                            <span className="ml-2 text-white font-mono">{user.password}</span>
                          </div>
                        </div>
                      </div>

                      {/* Test Scenarios */}
                      <div>
                        <h4 className="font-medium text-white mb-3">Test Scenarios:</h4>
                        <div className="space-y-2">
                          {user.tests.map((test, index) => (
                            <div key={index} className="flex items-start space-x-3 p-2 bg-slate-800 rounded">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-gray-300">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-300">{test}</p>
                              </div>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="outline" className="h-6 w-12 text-xs">
                                  Pass
                                </Button>
                                <Button size="sm" variant="destructive" className="h-6 w-12 text-xs">
                                  Fail
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Role-specific Testing Notes */}
                      <div className="p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                        <h4 className="font-semibold text-blue-400 mb-2">Additional Notes:</h4>
                        <div className="text-sm text-gray-300">
                          {user.role === "admin" && (
                            <ul className="list-disc list-inside space-y-1">
                              <li>Should see all dashboard sections and features</li>
                              <li>Verify access to admin-only functionality</li>
                              <li>Test system-wide permissions</li>
                              <li>Confirm ability to access all other role features</li>
                            </ul>
                          )}
                          {user.role === "clubOwner" && (
                            <ul className="list-disc list-inside space-y-1">
                              <li>Should see tournament creation and management options</li>
                              <li>Verify club management capabilities</li>
                              <li>Test squad assignment functionality</li>
                              <li>Cannot access admin-only features</li>
                            </ul>
                          )}
                          {user.role === "securityOfficer" && (
                            <ul className="list-disc list-inside space-y-1">
                              <li>Should see scoring interface and safety tools</li>
                              <li>Verify squad assignment visibility</li>
                              <li>Test score entry and modification</li>
                              <li>Cannot create tournaments or access admin features</li>
                            </ul>
                          )}
                          {user.role === "shooter" && (
                            <ul className="list-disc list-inside space-y-1">
                              <li>Should see tournament browsing and registration</li>
                              <li>Verify squad selection capabilities</li>
                              <li>Test profile management and preferences</li>
                              <li>Cannot access management or admin features</li>
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* General Authentication Tests */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Step 3: General Authentication Tests</CardTitle>
              <CardDescription>
                Core authentication functionality that applies to all roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Login/Logout Flow",
                      tests: [
                        "Login with valid credentials",
                        "Login with invalid credentials (should fail)",
                        "Logout functionality works",
                        "Redirects to login when accessing protected routes",
                      ]
                    },
                    {
                      title: "Registration Process", 
                      tests: [
                        "Register new account with all roles",
                        "Email validation works",
                        "Password confirmation works",
                        "Role selection functions properly",
                      ]
                    },
                    {
                      title: "Profile Management",
                      tests: [
                        "View profile information",
                        "Edit profile details",
                        "Update IDPA information",
                        "Change preferences and settings",
                      ]
                    },
                    {
                      title: "Protected Routes",
                      tests: [
                        "Dashboard access requires authentication",
                        "Role-based feature visibility",
                        "Unauthorized access blocked",
                        "Proper error messages displayed",
                      ]
                    },
                  ].map((category) => (
                    <div key={category.title} className="p-4 bg-slate-800 rounded-lg">
                      <h4 className="font-medium text-white mb-3">{category.title}</h4>
                      <div className="space-y-2">
                        {category.tests.map((test, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{test}</span>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline" className="h-6 w-8 text-xs p-0">
                                ✓
                              </Button>
                              <Button size="sm" variant="destructive" className="h-6 w-8 text-xs p-0">
                                ✗
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testing Checklist */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Testing Checklist</CardTitle>
              <CardDescription>
                Mark off completed testing scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "✅ Test users created successfully",
                  "⚪ Admin role tested and verified",
                  "⚪ Club Owner role tested and verified", 
                  "⚪ Security Officer role tested and verified",
                  "⚪ Shooter role tested and verified",
                  "⚪ Login/logout functionality verified",
                  "⚪ Registration process tested",
                  "⚪ Profile management tested",
                  "⚪ Protected routes working correctly",
                  "⚪ Role-based permissions enforced",
                  "⚪ All authentication flows functional",
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-lg">{item.startsWith("✅") ? "✅" : "⚪"}</span>
                    <span className="text-gray-300">{item.slice(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}