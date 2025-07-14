"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Id } from "@/lib/convex";
import { BadgeCard } from "./BadgeCard";
import { SocialShareModal } from "./SocialShareModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal,
  Award,
  Star,
  Target,
  TrendingUp,
  Crown,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeData {
  _id: string;
  type: string;
  title: string;
  description: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  verificationCode: string;
  shareCount: number;
  createdAt: number;
  metadata?: {
    division?: string;
    classification?: string;
    placement?: number;
    score?: number;
    additionalImages?: Record<string, string>;
  };
  tournament?: { 
    name: string; 
    date: number; 
    location?: { venue: string } 
  };
}

interface BadgeCollectionProps {
  shooterId?: string;
  className?: string;
}

const BADGE_TYPES = [
  { id: "all", label: "All Badges", icon: Trophy },
  { id: "participation", label: "Participation", icon: Target },
  { id: "division_winner", label: "Division Winners", icon: Trophy },
  { id: "class_winner", label: "Class Winners", icon: Medal },
  { id: "category_winner", label: "Category Winners", icon: Crown },
  { id: "stage_winner", label: "Stage Winners", icon: Star },
  { id: "personal_best", label: "Personal Best", icon: TrendingUp },
  { id: "top_10_percent", label: "Top 10%", icon: Flame },
  { id: "high_overall", label: "High Overall", icon: Award },
];

export function BadgeCollection({ shooterId, className }: BadgeCollectionProps) {
  const [selectedType, setSelectedType] = useState("all");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);

  // Get current user if shooterId not provided
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const targetShooterId = shooterId || currentUser?._id;

  // Get badges for the shooter
  const badges = useQuery(api.badges.getBadgesByShooter, 
    targetShooterId ? { shooterId: targetShooterId as Id<"users"> } : "skip"
  );

  // Get badge statistics
  const badgeStats = useQuery(api.badges.getBadgeStats,
    targetShooterId ? { shooterId: targetShooterId as Id<"users"> } : "skip"
  );

  if (!targetShooterId) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="h-12 w-12 text-gray-600 mb-4" />
          <p className="text-gray-400 mb-2">Please log in to view your badges</p>
        </CardContent>
      </Card>
    );
  }

  if (!badges || !badgeStats) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="h-12 w-12 text-gray-600 mb-4 animate-spin" />
          <p className="text-gray-400">Loading your badge collection...</p>
        </CardContent>
      </Card>
    );
  }

  // Filter badges by selected type
  const filteredBadges = selectedType === "all" 
    ? badges 
    : badges.filter(badge => badge.type === selectedType);

  const handleShare = (badge: BadgeData) => {
    setSelectedBadge(badge);
    setShareModalOpen(true);
  };

  const handleDownload = async (badge: BadgeData) => {
    try {
      // Download the main image
      if (!badge.imageUrl) {
        throw new Error("Badge has no image URL");
      }
      const response = await fetch(badge.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${badge.title.replace(/\s+/g, '_')}_badge.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading badge:', error);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with stats */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-green-400 flex items-center gap-3">
            <Trophy className="h-8 w-8" />
            Badge Collection
          </CardTitle>
          <p className="text-gray-400">
            Your achievement badges from IDPA tournaments
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Badge Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="text-center p-4 bg-gray-800/50 rounded">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-200">{badgeStats.total}</p>
              <p className="text-sm text-gray-400">Total Badges</p>
            </div>
            
            <div className="text-center p-4 bg-gray-800/50 rounded">
              <Medal className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-200">
                {badgeStats.division_winner + badgeStats.class_winner}
              </p>
              <p className="text-sm text-gray-400">Competition Wins</p>
            </div>
            
            <div className="text-center p-4 bg-gray-800/50 rounded">
              <Star className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-200">{badgeStats.participation}</p>
              <p className="text-sm text-gray-400">Tournaments</p>
            </div>
            
            <div className="text-center p-4 bg-gray-800/50 rounded">
              <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-200">{badgeStats.totalShares}</p>
              <p className="text-sm text-gray-400">Total Shares</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Type Filter */}
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-9 w-full">
          {BADGE_TYPES.map((type) => {
            const IconComponent = type.icon;
            const count = type.id === "all" ? badgeStats.total : badgeStats[type.id as keyof typeof badgeStats];
            
            return (
              <TabsTrigger 
                key={type.id} 
                value={type.id}
                className="text-xs data-[state=active]:bg-green-600 flex flex-col items-center gap-1"
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden lg:inline">{type.label}</span>
                <span className="lg:hidden">{type.id === "all" ? "All" : type.label.split(" ")[0]}</span>
                {typeof count === 'number' && count > 0 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          {/* Badge Grid */}
          {filteredBadges.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="h-12 w-12 text-gray-600 mb-4" />
                <p className="text-gray-400 mb-2">
                  {selectedType === "all" 
                    ? "No badges earned yet" 
                    : `No ${selectedType.replace(/_/g, ' ')} badges earned yet`
                  }
                </p>
                <p className="text-sm text-gray-500">
                  Participate in tournaments to start earning achievement badges!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBadges.map((badge) => {
                const mappedBadge = {
                  _id: badge._id,
                  type: badge.type,
                  title: badge.title,
                  description: badge.description,
                  imageUrl: badge.imageUrl || "/placeholder-badge.png",
                  thumbnailUrl: badge.thumbnailUrl || badge.imageUrl || "/placeholder-badge.png",
                  verificationCode: badge.verificationCode,
                  shareCount: badge.shareCount,
                  createdAt: badge._creationTime || badge.createdAt,
                  metadata: badge.metadata,
                  tournament: badge.tournament || undefined,
                };
                return (
                  <BadgeCard
                    key={badge._id}
                    badge={mappedBadge as Parameters<typeof BadgeCard>[0]['badge']}
                    onShare={handleShare}
                    onDownload={handleDownload}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Social Share Modal */}
      <SocialShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        badge={selectedBadge}
      />
    </div>
  );
}