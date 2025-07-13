"use client";

import { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Target, 
  ChevronLeft, 
  ChevronRight,
  Check,
  Building,
  Crosshair,
  Trophy,
  Settings,
  Eye,
  Save
} from "lucide-react";
import { IDPA_DIVISIONS, MATCH_TYPES, CURRENCIES } from "@/lib/utils";

interface LocationData {
  venue: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface TournamentData {
  name: string;
  date: string;
  registrationOpens: string;
  registrationCloses: string;
  location: LocationData;
  matchType: string;
  divisions: string[];
  customCategories: Array<{
    id: string;
    name: string;
    description?: string;
    eligibilityCriteria?: string;
  }>;
  entryFee: number;
  currency: string;
  capacity: number;
  squadConfig: {
    numberOfSquads: number;
    maxShootersPerSquad: number;
  };
  description: string;
  rules: string;
}

const WIZARD_STEPS = [
  { id: 1, title: "Basic Info", icon: Target, description: "Tournament details" },
  { id: 2, title: "Dates & Location", icon: Calendar, description: "When and where" },
  { id: 3, title: "Divisions & Categories", icon: Trophy, description: "Competition setup" },
  { id: 4, title: "Capacity & Squads", icon: Users, description: "Registration limits" },
  { id: 5, title: "Rules & Description", icon: Settings, description: "Additional details" },
  { id: 6, title: "Review & Publish", icon: Eye, description: "Final review" },
];

export default function CreateTournamentPage() {
  const router = useRouter();
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const userClub = useQuery(api.clubs.getUserClub);
  const createTournament = useAction(api.tournaments.createTournament);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [tournamentData, setTournamentData] = useState<TournamentData>({
    name: "",
    date: "",
    registrationOpens: "",
    registrationCloses: "",
    location: {
      venue: "",
      address: "",
      coordinates: { lat: 0, lng: 0 }
    },
    matchType: "",
    divisions: [],
    customCategories: [],
    entryFee: 0,
    currency: "ARS",
    capacity: 80,
    squadConfig: {
      numberOfSquads: 8,
      maxShootersPerSquad: 10
    },
    description: "",
    rules: ""
  });

  // Redirect if not Club Owner or no club
  useEffect(() => {
    if (currentUser && currentUser.role !== "clubOwner") {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (userClub && !tournamentData.location.venue) {
      setTournamentData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          venue: userClub.name + " Range",
          address: userClub.location.address,
          coordinates: userClub.location.coordinates
        }
      }));
    }
  }, [userClub, tournamentData.location.venue]);

  const updateTournamentData = (field: string, value: any) => {
    setTournamentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedData = (path: string[], value: any) => {
    setTournamentData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(tournamentData.name && tournamentData.matchType);
      case 2:
        return !!(
          tournamentData.date && 
          tournamentData.registrationOpens && 
          tournamentData.registrationCloses &&
          tournamentData.location.venue &&
          tournamentData.location.address
        );
      case 3:
        return tournamentData.divisions.length > 0;
      case 4:
        return !!(
          tournamentData.capacity > 0 &&
          tournamentData.squadConfig.numberOfSquads > 0 &&
          tournamentData.squadConfig.maxShootersPerSquad > 0
        );
      case 5:
        return true; // Optional fields
      case 6:
        return true; // Review step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
      setError("");
    } else {
      setError("Please complete all required fields");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleSubmit = async (publishImmediate: boolean = false) => {
    if (!userClub) {
      setError("Club information not found");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const tournamentId = await createTournament({
        name: tournamentData.name,
        clubId: userClub._id,
        date: new Date(tournamentData.date).getTime(),
        registrationOpens: new Date(tournamentData.registrationOpens).getTime(),
        registrationCloses: new Date(tournamentData.registrationCloses).getTime(),
        location: tournamentData.location,
        matchType: tournamentData.matchType,
        divisions: tournamentData.divisions as any,
        customCategories: tournamentData.customCategories,
        entryFee: tournamentData.entryFee,
        currency: tournamentData.currency,
        capacity: tournamentData.capacity,
        squadConfig: tournamentData.squadConfig,
        description: tournamentData.description || undefined,
        rules: tournamentData.rules || undefined,
      });

      // TODO: If publishImmediate, call publishTournament mutation

      router.push(`/dashboard/tournaments`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create tournament";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                value={tournamentData.name}
                onChange={(e) => updateTournamentData("name", e.target.value)}
                placeholder="e.g., Spring Championship 2024"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="matchType">Match Type *</Label>
              <Select
                value={tournamentData.matchType}
                onValueChange={(value) => updateTournamentData("matchType", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  {MATCH_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-400">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entryFee">Entry Fee *</Label>
                <div className="flex mt-1">
                  <Select
                    value={tournamentData.currency}
                    onValueChange={(value) => updateTournamentData("currency", value)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="entryFee"
                    type="number"
                    min="0"
                    value={tournamentData.entryFee}
                    onChange={(e) => updateTournamentData("entryFee", Number(e.target.value))}
                    placeholder="0"
                    className="ml-2 flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="capacity">Tournament Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={tournamentData.capacity}
                  onChange={(e) => updateTournamentData("capacity", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="date">Tournament Date *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={tournamentData.date}
                onChange={(e) => updateTournamentData("date", e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registrationOpens">Registration Opens *</Label>
                <Input
                  id="registrationOpens"
                  type="datetime-local"
                  value={tournamentData.registrationOpens}
                  onChange={(e) => updateTournamentData("registrationOpens", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="registrationCloses">Registration Closes *</Label>
                <Input
                  id="registrationCloses"
                  type="datetime-local"
                  value={tournamentData.registrationCloses}
                  onChange={(e) => updateTournamentData("registrationCloses", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="venue">Venue Name *</Label>
              <Input
                id="venue"
                value={tournamentData.location.venue}
                onChange={(e) => updateNestedData(["location", "venue"], e.target.value)}
                placeholder="Range name or venue"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={tournamentData.location.address}
                onChange={(e) => updateNestedData(["location", "address"], e.target.value)}
                placeholder="Full address including city and state"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={tournamentData.location.coordinates.lat}
                  onChange={(e) => updateNestedData(["location", "coordinates", "lat"], Number(e.target.value))}
                  placeholder="e.g., -34.6037"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={tournamentData.location.coordinates.lng}
                  onChange={(e) => updateNestedData(["location", "coordinates", "lng"], Number(e.target.value))}
                  placeholder="e.g., -58.3816"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              💡 Tip: Use Google Maps to find exact coordinates for your venue
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>IDPA Divisions * (Select at least one)</Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {IDPA_DIVISIONS.map((division) => (
                  <div key={division.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={division.code}
                      checked={tournamentData.divisions.includes(division.code)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateTournamentData("divisions", [...tournamentData.divisions, division.code]);
                        } else {
                          updateTournamentData("divisions", tournamentData.divisions.filter(d => d !== division.code));
                        }
                      }}
                    />
                    <Label htmlFor={division.code} className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">{division.code}</div>
                        <div className="text-sm text-gray-400">{division.name}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {tournamentData.divisions.length > 0 && (
              <div className="p-3 bg-slate-800 rounded-lg">
                <div className="text-sm font-medium text-green-400 mb-2">Selected Divisions:</div>
                <div className="flex flex-wrap gap-2">
                  {tournamentData.divisions.map((divisionCode) => {
                    const division = IDPA_DIVISIONS.find(d => d.code === divisionCode);
                    return (
                      <Badge key={divisionCode} variant="secondary">
                        {division?.code} - {division?.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <Label>Custom Categories (Optional)</Label>
              <div className="text-sm text-gray-400 mb-3">
                Add special categories like Ladies, Veterans, Junior, etc.
              </div>
              
              {tournamentData.customCategories.length === 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newCategory = {
                      id: `category_${Date.now()}`,
                      name: "",
                      description: "",
                      eligibilityCriteria: ""
                    };
                    updateTournamentData("customCategories", [...tournamentData.customCategories, newCategory]);
                  }}
                  className="w-full"
                >
                  Add Custom Category
                </Button>
              ) : (
                <div className="space-y-3">
                  {tournamentData.customCategories.map((category, index) => (
                    <Card key={category.id} className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Category name (e.g., Ladies)"
                          value={category.name}
                          onChange={(e) => {
                            const updated = [...tournamentData.customCategories];
                            updated[index].name = e.target.value;
                            updateTournamentData("customCategories", updated);
                          }}
                        />
                        <Input
                          placeholder="Eligibility criteria"
                          value={category.eligibilityCriteria || ""}
                          onChange={(e) => {
                            const updated = [...tournamentData.customCategories];
                            updated[index].eligibilityCriteria = e.target.value;
                            updateTournamentData("customCategories", updated);
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Input
                          placeholder="Description (optional)"
                          value={category.description || ""}
                          onChange={(e) => {
                            const updated = [...tournamentData.customCategories];
                            updated[index].description = e.target.value;
                            updateTournamentData("customCategories", updated);
                          }}
                          className="mr-2"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = tournamentData.customCategories.filter((_, i) => i !== index);
                            updateTournamentData("customCategories", updated);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newCategory = {
                        id: `category_${Date.now()}`,
                        name: "",
                        description: "",
                        eligibilityCriteria: ""
                      };
                      updateTournamentData("customCategories", [...tournamentData.customCategories, newCategory]);
                    }}
                    className="w-full"
                  >
                    Add Another Category
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        const totalSquadCapacity = tournamentData.squadConfig.numberOfSquads * tournamentData.squadConfig.maxShootersPerSquad;
        const isCapacityValid = totalSquadCapacity >= tournamentData.capacity;
        
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="capacity">Tournament Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={tournamentData.capacity}
                onChange={(e) => updateTournamentData("capacity", Number(e.target.value))}
                className="mt-1"
              />
              <div className="text-sm text-gray-400 mt-1">
                Maximum number of shooters for this tournament
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Squad Configuration</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfSquads">Number of Squads *</Label>
                  <Input
                    id="numberOfSquads"
                    type="number"
                    min="1"
                    value={tournamentData.squadConfig.numberOfSquads}
                    onChange={(e) => updateNestedData(["squadConfig", "numberOfSquads"], Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxShootersPerSquad">Max Shooters per Squad *</Label>
                  <Input
                    id="maxShootersPerSquad"
                    type="number"
                    min="1"
                    value={tournamentData.squadConfig.maxShootersPerSquad}
                    onChange={(e) => updateNestedData(["squadConfig", "maxShootersPerSquad"], Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="text-sm font-medium mb-2">Squad Summary:</div>
                <div className="space-y-2 text-sm">
                  <div>• {tournamentData.squadConfig.numberOfSquads} squads will be created</div>
                  <div>• Each squad can hold up to {tournamentData.squadConfig.maxShootersPerSquad} shooters</div>
                  <div className={`font-medium ${isCapacityValid ? "text-green-400" : "text-red-400"}`}>
                    • Total squad capacity: {totalSquadCapacity} shooters
                  </div>
                  <div>• Tournament capacity: {tournamentData.capacity} shooters</div>
                </div>
                
                {!isCapacityValid && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                    ⚠️ Squad capacity ({totalSquadCapacity}) is less than tournament capacity ({tournamentData.capacity}).
                    Increase squads or shooters per squad.
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-400">
                💡 Squads will be named automatically (Squad A, Squad B, etc.)
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="description">Tournament Description</Label>
              <Textarea
                id="description"
                value={tournamentData.description}
                onChange={(e) => updateTournamentData("description", e.target.value)}
                placeholder="Describe your tournament, any special features, prizes, etc."
                className="mt-1 h-32"
              />
            </div>

            <div>
              <Label htmlFor="rules">Special Rules & Information</Label>
              <Textarea
                id="rules"
                value={tournamentData.rules}
                onChange={(e) => updateTournamentData("rules", e.target.value)}
                placeholder="Any special rules, equipment requirements, or important information for shooters"
                className="mt-1 h-32"
              />
              <div className="text-sm text-gray-400 mt-1">
                Standard IDPA rules apply unless specified otherwise
              </div>
            </div>

            <div className="p-4 bg-slate-800 rounded-lg">
              <div className="text-sm font-medium text-green-400 mb-2">What happens next?</div>
              <div className="space-y-2 text-sm text-gray-300">
                <div>• Your tournament will be saved as a draft</div>
                <div>• You can edit details until you publish it</div>
                <div>• Once published, shooters can register</div>
                <div>• You'll be able to manage squads and check-ins</div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-400 mb-2">Ready to Create Tournament</h3>
              <p className="text-gray-400">Review your tournament details below</p>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold text-green-400 mb-2">Basic Information</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Name:</strong> {tournamentData.name}</div>
                  <div><strong>Type:</strong> {tournamentData.matchType}</div>
                  <div><strong>Entry Fee:</strong> {tournamentData.currency} {tournamentData.entryFee}</div>
                  <div><strong>Capacity:</strong> {tournamentData.capacity} shooters</div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-green-400 mb-2">Schedule & Location</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Date:</strong> {new Date(tournamentData.date).toLocaleString()}</div>
                  <div><strong>Registration Opens:</strong> {new Date(tournamentData.registrationOpens).toLocaleString()}</div>
                  <div><strong>Registration Closes:</strong> {new Date(tournamentData.registrationCloses).toLocaleString()}</div>
                  <div><strong>Venue:</strong> {tournamentData.location.venue}</div>
                  <div><strong>Address:</strong> {tournamentData.location.address}</div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-green-400 mb-2">Competition Setup</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Divisions:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tournamentData.divisions.map((division) => (
                        <Badge key={division} variant="secondary" className="text-xs">
                          {division}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div><strong>Squads:</strong> {tournamentData.squadConfig.numberOfSquads} squads, {tournamentData.squadConfig.maxShootersPerSquad} shooters each</div>
                  {tournamentData.customCategories.length > 0 && (
                    <div>
                      <strong>Custom Categories:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tournamentData.customCategories.map((category) => (
                          <Badge key={category.id} variant="outline" className="text-xs">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-sm text-blue-300">
                <strong>📋 Your tournament will be created as a draft.</strong><br />
                You can continue editing until you're ready to publish and open registration.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentUser || currentUser.role !== "clubOwner") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Club Owner Access Required</h2>
          <p className="text-gray-400">Only Club Owners can create tournaments.</p>
        </Card>
      </div>
    );
  }

  if (!userClub) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Club Required</h2>
          <p className="text-gray-400 mb-4">You need to create a club before creating tournaments.</p>
          <Button onClick={() => router.push("/dashboard/clubs/create")}>
            Create Club
          </Button>
        </Card>
      </div>
    );
  }

  const progress = (currentStep / WIZARD_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-gray-400 text-sm mb-4">
            <Building className="h-4 w-4" />
            <span>{userClub.name}</span>
            <ChevronRight className="h-4 w-4" />
            <span>Create Tournament</span>
          </div>
          
          <h1 className="text-3xl font-bold text-green-400 mb-2">Create New Tournament</h1>
          <p className="text-gray-400">Set up your IDPA tournament with our step-by-step wizard</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {WIZARD_STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2
                    ${isActive ? "border-green-400 bg-green-400/10 text-green-400" : 
                      isCompleted ? "border-green-600 bg-green-600 text-white" : 
                      "border-gray-600 text-gray-400"}
                  `}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${isActive ? "text-green-400" : "text-gray-400"}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-green-400">
              {WIZARD_STEPS[currentStep - 1]?.title}
            </CardTitle>
            <CardDescription>
              {WIZARD_STEPS[currentStep - 1]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
            
            {error && (
              <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <div className="text-sm text-gray-400">
                Step {currentStep} of {WIZARD_STEPS.length}
              </div>
              
              {currentStep < WIZARD_STEPS.length ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="flex items-center space-x-2"
                  variant="tactical"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    disabled={isLoading}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Draft</span>
                  </Button>
                  {/* TODO: Add publish option when publish mutation is ready */}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}