"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
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

    // Add the flow parameter to the form data
    formData.set("flow", "signIn");

    try {
      await signIn("password", {
        email: email,
        password: password,
        flow: "signIn"
      });
      
      // Wait longer for session to be established, then redirect
      setTimeout(() => {
        console.log("Redirecting to dashboard after login");
        window.location.href = "/dashboard";
      }, 2000);
      
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Target className="h-12 w-12 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-400">
            IDPA Tournament System
          </CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
            
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}
            
            <Button
              type="submit"
              variant="tactical"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link 
                href="/register" 
                className="text-green-400 hover:text-green-300 font-medium"
              >
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}