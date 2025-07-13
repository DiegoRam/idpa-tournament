"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateClubSimplePage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Simple form submission
    console.log("Form submitted!");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-8">Create IDPA Club (Simple)</h1>
        
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-green-400">Basic Information</CardTitle>
            <CardDescription>Essential club details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Club Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your Club Name"
                  required
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@club.com"
                  required
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              
              <Button
                type="submit"
                variant="tactical"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Creating..." : "Create Club"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}