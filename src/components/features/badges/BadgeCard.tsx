"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Share2, 
  Download, 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  TrendingUp,
  Target,
  Crown,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface BadgeCardProps {
  badge: {
    _id: string;
    type: string;
    title: string;
    description: string;
    imageUrl: string;
    thumbnailUrl: string;
    verificationCode: string;
    shareCount: number;
    createdAt: number;
    metadata?: {
      division?: string;
      classification?: string;
      placement?: number;
      score?: number;
      additionalImages?: {
        instagramStory?: string;
        twitterCard?: string;
      };
    };
    tournament?: {
      name: string;
      date: number;
      location: {
        venue: string;
      };
    };
  };
  onShare?: (badge: {
    _id: string;
    type: string;
    title: string;
    description: string;
    imageUrl: string;
    thumbnailUrl: string;
    verificationCode: string;
    shareCount: number;
    createdAt: number;
    metadata?: {
      division?: string;
      classification?: string;
      placement?: number;
      score?: number;
      additionalImages?: {
        instagramStory?: string;
        twitterCard?: string;
      };
    };
    tournament?: {
      name: string;
      date: number;
      location: {
        venue: string;
      };
    };
  }) => void;
  onDownload?: (badge: {
    _id: string;
    type: string;
    title: string;
    description: string;
    imageUrl: string;
    thumbnailUrl: string;
    verificationCode: string;
    shareCount: number;
    createdAt: number;
    metadata?: {
      division?: string;
      classification?: string;
      placement?: number;
      score?: number;
      additionalImages?: {
        instagramStory?: string;
        twitterCard?: string;
      };
    };
    tournament?: {
      name: string;
      date: number;
      location: {
        venue: string;
      };
    };
  }) => void;
  className?: string;
}

// Badge type configurations with icons and colors
const BADGE_TYPE_CONFIG = {
  participation: {
    icon: Target,
    color: "bg-blue-500",
    bgGradient: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/50",
  },
  division_winner: {
    icon: Trophy,
    color: "bg-yellow-500",
    bgGradient: "from-yellow-500/20 to-yellow-600/20",
    borderColor: "border-yellow-500/50",
  },
  class_winner: {
    icon: Medal,
    color: "bg-orange-500",
    bgGradient: "from-orange-500/20 to-orange-600/20",
    borderColor: "border-orange-500/50",
  },
  category_winner: {
    icon: Crown,
    color: "bg-purple-500",
    bgGradient: "from-purple-500/20 to-purple-600/20",
    borderColor: "border-purple-500/50",
  },
  stage_winner: {
    icon: Star,
    color: "bg-cyan-500",
    bgGradient: "from-cyan-500/20 to-cyan-600/20",
    borderColor: "border-cyan-500/50",
  },
  personal_best: {
    icon: TrendingUp,
    color: "bg-green-500",
    bgGradient: "from-green-500/20 to-green-600/20",
    borderColor: "border-green-500/50",
  },
  clean_stage: {
    icon: Award,
    color: "bg-teal-500",
    bgGradient: "from-teal-500/20 to-teal-600/20",
    borderColor: "border-teal-500/50",
  },
  top_10_percent: {
    icon: Flame,
    color: "bg-red-500",
    bgGradient: "from-red-500/20 to-red-600/20",
    borderColor: "border-red-500/50",
  },
  most_improved: {
    icon: TrendingUp,
    color: "bg-indigo-500",
    bgGradient: "from-indigo-500/20 to-indigo-600/20",
    borderColor: "border-indigo-500/50",
  },
  high_overall: {
    icon: Crown,
    color: "bg-red-600",
    bgGradient: "from-red-600/20 to-red-700/20",
    borderColor: "border-red-600/50",
  },
};

export function BadgeCard({ badge, onShare, onDownload, className }: BadgeCardProps) {
  const config = BADGE_TYPE_CONFIG[badge.type as keyof typeof BADGE_TYPE_CONFIG] || BADGE_TYPE_CONFIG.participation;
  const IconComponent = config.icon;
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (onShare) {
      onShare(badge);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(badge);
    }
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:scale-105",
      "bg-gray-900/50 border-gray-800 hover:border-gray-700",
      className
    )}>
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-30 transition-opacity group-hover:opacity-50",
        `bg-gradient-to-br ${config.bgGradient}`
      )} />
      
      {/* Border accent */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 transition-colors",
        config.borderColor.replace("border-", "bg-")
      )} />
      
      <CardContent className="relative p-6">
        {/* Header with icon and type */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              config.color,
              "shadow-lg"
            )}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">
                {badge.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {badge.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
          
          {/* Placement badge */}
          {badge.metadata?.placement && (
            <Badge 
              variant="outline" 
              className={cn("border-yellow-500 text-yellow-400 bg-yellow-500/10")}
            >
              {badge.metadata.placement === 1 ? "1st" : 
               badge.metadata.placement === 2 ? "2nd" :
               badge.metadata.placement === 3 ? "3rd" : 
               `${badge.metadata.placement}th`}
            </Badge>
          )}
        </div>
        
        {/* Badge thumbnail */}
        {badge.thumbnailUrl && (
          <div className="mb-4 rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700">
            <Image 
              src={badge.thumbnailUrl} 
              alt={badge.title}
              width={300}
              height={192}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        {/* Tournament info */}
        {badge.tournament && (
          <div className="mb-4 space-y-2">
            <h4 className="font-semibold text-gray-200 text-base leading-tight">
              {badge.tournament.name}
            </h4>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{formatDate(badge.tournament.date)}</span>
              <span>{badge.tournament.location?.venue}</span>
            </div>
          </div>
        )}
        
        {/* Division and classification */}
        {(badge.metadata?.division || badge.metadata?.classification) && (
          <div className="flex items-center gap-2 mb-4">
            {badge.metadata.division && (
              <Badge variant="outline" className="text-xs bg-blue-900/20 border-blue-800">
                {badge.metadata.division}
              </Badge>
            )}
            {badge.metadata.classification && (
              <Badge variant="outline" className="text-xs bg-purple-900/20 border-purple-800">
                {badge.metadata.classification}
              </Badge>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
          
          {/* Share count */}
          <div className="text-xs text-gray-500">
            {badge.shareCount > 0 && `${badge.shareCount} shares`}
          </div>
        </div>
        
        {/* Verification code */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 font-mono">
            Verification: {badge.verificationCode}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}