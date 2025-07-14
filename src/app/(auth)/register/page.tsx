"use client";

import { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, User, Mail, Lock, Users, Building, Shield, Crosshair } from "lucide-react";
import Link from "next/link";

const USER_ROLES = [
  {
    value: "shooter",
    label: "Shooter",
    description: "Compete in IDPA tournaments",
    icon: Crosshair,
    color: "text-blue-400",
  },
  {
    value: "securityOfficer",
    label: "Security Officer",
    description: "Score stages and manage safety",
    icon: Shield,
    color: "text-orange-400",
  },
  {
    value: "clubOwner",
    label: "Club Owner",
    description: "Create and manage tournaments",
    icon: Building,
    color: "text-purple-400",
  },
  {
    value: "admin",
    label: "Administrator",
    description: "Full system access",
    icon: Users,
    color: "text-red-400",
  },
];

export default function RegisterPage() {
  const registerUser = useAction(api.userAuth.registerUser);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  
  // Check if user is already authenticated
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser) {
      console.log("User already authenticated, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const name = formData.get("name") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!selectedRole) {
      setError("Please select a role");
      setIsLoading(false);
      return;
    }

    try {
      await registerUser({
        email,
        password,
        name,
        role: selectedRole as "admin" | "clubOwner" | "securityOfficer" | "shooter",
      });
      
      router.push("/login?registered=true");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoleInfo = USER_ROLES.find(role => role.value === selectedRole);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Target className="h-12 w-12 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-400">
            Join IDPA Tournament System
          </CardTitle>
          <CardDescription>
            Create your account and select your role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      className="pl-10"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Select Your Role</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {USER_ROLES.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div
                      key={role.value}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedRole === role.value
                          ? "border-green-500 bg-green-500/10"
                          : "border-slate-600 hover:border-slate-500"
                      }`}
                      onClick={() => setSelectedRole(role.value)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${role.color}`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{role.label}</h4>
                          <p className="text-sm text-gray-400 mt-1">{role.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {selectedRoleInfo && (
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <strong>Selected:</strong> {selectedRoleInfo.label} - {selectedRoleInfo.description}
                  </p>
                </div>
              )}
            </div>

            {/* Role-specific Information */}
            {selectedRoleInfo && (
              <div className="p-4 bg-slate-800 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">Role Information</h4>
                <p className="text-sm text-gray-300">
                  As a <strong>{selectedRoleInfo.label}</strong>, you&apos;ll be able to {selectedRoleInfo.description.toLowerCase()}.
                </p>
                {(selectedRole === "shooter" || selectedRole === "securityOfficer") && (
                  <p className="text-xs text-gray-400 mt-2">
                    💡 You can add your IDPA member number and other details after registration.
                  </p>
                )}
              </div>
            )}
            
            {error && (
              <div className="text-red-400 text-sm text-center p-3 bg-red-400/10 rounded-lg border border-red-400/20">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              variant="tactical"
              className="w-full"
              disabled={isLoading || !selectedRole}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-green-400 hover:text-green-300 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}