"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api, Id } from "@/lib/convex";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Share2, 
  Download, 
  Copy,
  Check,
  ExternalLink,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SocialShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: {
    _id: string;
    title: string;
    description: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    verificationCode: string;
    shareCount: number;
    tournament?: {
      name: string;
      date: number;
    };
    metadata?: {
      division?: string;
      classification?: string;
      placement?: number;
      additionalImages?: Record<string, string>;
    };
  } | null;
}

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  shareUrl: (text: string, url: string, imageUrl?: string) => string;
  imageFormat?: 'instagramPost' | 'instagramStory' | 'twitterCard';
}

const SHARE_PLATFORMS: SharePlatform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20 border-pink-500/30',
    shareUrl: () => 'https://www.instagram.com/',
    imageFormat: 'instagramPost',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20 border-blue-500/30',
    shareUrl: (text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20 border-blue-500/30',
    shareUrl: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=IDPA,Shooting,Tournament`,
    imageFormat: 'twitterCard',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20 border-green-500/30',
    shareUrl: (text, url) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/20 border-blue-600/30',
    shareUrl: (text, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
  },
];

export function SocialShareModal({ open, onOpenChange, badge }: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);
  
  const incrementShareCount = useMutation(api.badges.incrementShareCount);

  if (!badge) return null;

  const generateShareText = (): string => {
    const parts = [];
    
    // Badge achievement
    parts.push(`🏆 Just earned: ${badge.title}!`);
    
    // Tournament info
    if (badge.tournament) {
      parts.push(`📍 ${badge.tournament.name}`);
      if (badge.tournament.date) {
        const date = new Date(badge.tournament.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        parts.push(`📅 ${date}`);
      }
    }
    
    // Division/classification info
    if (badge.metadata?.division) {
      let divInfo = badge.metadata.division;
      if (badge.metadata.classification) {
        divInfo += ` ${badge.metadata.classification}`;
      }
      if (badge.metadata.placement) {
        const place = badge.metadata.placement === 1 ? '1st' :
                     badge.metadata.placement === 2 ? '2nd' :
                     badge.metadata.placement === 3 ? '3rd' :
                     `${badge.metadata.placement}th`;
        divInfo += ` - ${place} Place`;
      }
      parts.push(`🎯 ${divInfo}`);
    }
    
    parts.push('#IDPA #Shooting #Tournament');
    
    return parts.join('\n');
  };

  const generateVerificationUrl = (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${baseUrl}/verify/${badge.verificationCode}`;
  };

  const handleShare = async (platform: SharePlatform) => {
    try {
      const shareText = generateShareText();
      const verificationUrl = generateVerificationUrl();
      
      // Track share
      await incrementShareCount({ badgeId: badge._id as Id<"badges"> });
      
      if (platform.id === 'instagram') {
        // For Instagram, we'll show instructions since direct sharing isn't possible
        toast.info("Instagram sharing instructions", {
          description: "Download the image and post it manually to Instagram with the generated caption.",
        });
        return;
      }
      
      // Generate share URL
      const shareUrl = platform.shareUrl(shareText, verificationUrl);
      
      // Open in new window
      window.open(shareUrl, '_blank', 'width=600,height=400');
      
      toast.success(`Shared to ${platform.name}!`);
    } catch (error) {
      console.error('Error sharing badge:', error);
      toast.error("Failed to share badge");
    }
  };

  const handleCopyLink = async () => {
    try {
      const verificationUrl = generateVerificationUrl();
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Verification link copied!");
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error("Failed to copy link");
    }
  };

  const handleCopyCaption = async () => {
    try {
      const shareText = generateShareText();
      await navigator.clipboard.writeText(shareText);
      toast.success("Caption copied!");
    } catch (error) {
      console.error('Error copying caption:', error);
      toast.error("Failed to copy caption");
    }
  };

  const handleDownloadImage = async (format: 'instagramPost' | 'instagramStory' | 'twitterCard' | 'thumbnail') => {
    try {
      let imageUrl = badge.imageUrl; // Default to main image
      
      // Use specific format if available
      if (format !== 'thumbnail' && badge.metadata?.additionalImages) {
        const formatUrl = badge.metadata.additionalImages[format];
        if (formatUrl) {
          imageUrl = formatUrl;
        }
      } else if (format === 'thumbnail') {
        imageUrl = badge.thumbnailUrl;
      }
      
      if (!imageUrl) {
        throw new Error("No image URL available for download");
      }
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      const formatNames = {
        instagramPost: 'Instagram_Post',
        instagramStory: 'Instagram_Story',
        twitterCard: 'Twitter_Card',
        thumbnail: 'Thumbnail'
      };
      a.download = `${badge.title.replace(/\s+/g, '_')}_${formatNames[format]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${formatNames[format]} downloaded!`);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error("Failed to download image");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: badge.title,
          text: generateShareText(),
          url: generateVerificationUrl(),
        });
        
        // Track share
        await incrementShareCount({ badgeId: badge._id as Id<"badges"> });
        toast.success("Badge shared!");
      } catch (error) {
        console.error('Error sharing via native API:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-green-400 flex items-center gap-2">
            <Share2 className="h-6 w-6" />
            Share Your Badge
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Share your achievement with friends and the IDPA community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badge Preview */}
          <div className="text-center">
            <Image 
              src={badge.thumbnailUrl || badge.imageUrl || ""} 
              alt={badge.title}
              width={192}
              height={192}
              className="w-48 h-48 mx-auto rounded-lg border border-gray-700"
            />
            <h3 className="mt-4 text-lg font-bold text-white">{badge.title}</h3>
            <p className="text-gray-400">{badge.description}</p>
          </div>

          <Tabs defaultValue="share" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="share">Share</TabsTrigger>
              <TabsTrigger value="download">Download</TabsTrigger>
              <TabsTrigger value="copy">Copy</TabsTrigger>
            </TabsList>

            <TabsContent value="share" className="space-y-4">
              {/* Native Share (if available) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <Button
                  onClick={handleNativeShare}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share via Device
                </Button>
              )}

              {/* Social Platforms */}
              <div className="grid gap-3 md:grid-cols-2">
                {SHARE_PLATFORMS.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <Button
                      key={platform.id}
                      variant="outline"
                      onClick={() => handleShare(platform)}
                      className={cn(
                        "flex items-center justify-start gap-3 p-4 h-auto",
                        platform.bgColor,
                        "border hover:bg-opacity-20"
                      )}
                    >
                      <IconComponent className={cn("h-5 w-5", platform.color)} />
                      <div className="text-left">
                        <p className="font-medium text-white">{platform.name}</p>
                        <p className="text-xs text-gray-400">
                          {platform.id === 'instagram' ? 'Manual sharing' : 'Direct sharing'}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                    </Button>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="download" className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadImage('instagramPost')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Instagram Post (1080x1080)
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleDownloadImage('instagramStory')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Instagram Story (1080x1920)
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleDownloadImage('twitterCard')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Twitter Card (1200x630)
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleDownloadImage('thumbnail')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Thumbnail (300x300)
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="copy" className="space-y-4">
              {/* Copy Caption */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Social Media Caption
                </label>
                <div className="p-3 bg-gray-800 rounded border border-gray-700 text-sm">
                  <pre className="whitespace-pre-wrap text-gray-300 font-sans">
                    {generateShareText()}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCopyCaption}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Caption
                </Button>
              </div>

              {/* Copy Verification Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Verification Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generateVerificationUrl()}
                    readOnly
                    className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className="px-3"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Stats */}
          <div className="text-center text-sm text-gray-500">
            This badge has been shared {badge.shareCount} times
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}