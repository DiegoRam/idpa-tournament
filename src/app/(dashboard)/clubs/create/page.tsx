"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, MapPin, Mail, Phone, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateClubPage() {
  const createClub = useAction(api.clubs.createClubWithCurrentUser);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      const clubData = {
        name: formData.get("name") as string,
        location: {
          address: formData.get("address") as string,
          city: formData.get("city") as string,
          state: formData.get("state") as string,
          country: formData.get("country") as string,
          coordinates: {
            lat: parseFloat(formData.get("lat") as string) || 0,
            lng: parseFloat(formData.get("lng") as string) || 0,
          },
        },
        contact: {
          email: formData.get("email") as string,
          phone: formData.get("phone") as string || undefined,
          website: formData.get("website") as string || undefined,
        },
        logo: formData.get("logo") as string || undefined,
      };

      await createClub(clubData);
      router.push("/dashboard?clubCreated=true");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create club. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-400 hover:text-green-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <Building className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Create IDPA Club</h1>
              <p className="text-gray-400">Set up your club to start hosting tournaments</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Basic Information</CardTitle>
              <CardDescription>
                Essential details about your IDPA club
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Club Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Metro IDPA Club"
                    required
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Club Logo URL</Label>
                  <Input
                    id="logo"
                    name="logo"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location Details
              </CardTitle>
              <CardDescription>
                Where your club is located and holds events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Shooting Range Rd"
                  required
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="City"
                    required
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="State"
                    required
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Country"
                    required
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    name="lat"
                    type="number"
                    step="any"
                    placeholder="40.7128"
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    name="lng"
                    type="number"
                    step="any"
                    placeholder="-74.0060"
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-400">
                💡 Coordinates help shooters find tournaments near them. You can get these from Google Maps.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
              <CardDescription>
                How shooters can reach your club
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contact@yourclub.com"
                      className="pl-10 bg-slate-800 border-slate-600"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="pl-10 bg-slate-800 border-slate-600"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://www.yourclub.com"
                    className="pl-10 bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="text-red-400 text-sm text-center p-3 bg-red-400/10 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="tactical"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? "Creating..." : "Create Club"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}