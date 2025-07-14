import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import QRCode from 'qrcode';

export interface BadgeData {
  type: string;
  title: string;
  description: string;
  shooterName: string;
  tournamentName: string;
  tournamentDate: Date;
  tournamentLocation: string;
  verificationCode: string;
  metadata?: {
    division?: string;
    classification?: string;
    placement?: number;
    score?: number;
  };
}

export interface BadgeStyle {
  width: number;
  height: number;
  backgroundColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
}

// Predefined badge styles for different formats
export const BADGE_STYLES = {
  instagram_post: {
    width: 1080,
    height: 1080,
    backgroundColor: '#0a0a0a',
    titleColor: '#4ade80',
    textColor: '#ffffff',
    accentColor: '#22c55e',
  },
  instagram_story: {
    width: 1080,
    height: 1920,
    backgroundColor: '#0a0a0a',
    titleColor: '#4ade80',
    textColor: '#ffffff',
    accentColor: '#22c55e',
  },
  twitter_card: {
    width: 1200,
    height: 630,
    backgroundColor: '#0a0a0a',
    titleColor: '#4ade80',
    textColor: '#ffffff',
    accentColor: '#22c55e',
  },
  thumbnail: {
    width: 300,
    height: 300,
    backgroundColor: '#0a0a0a',
    titleColor: '#4ade80',
    textColor: '#ffffff',
    accentColor: '#22c55e',
  },
};

// Badge type configurations
const BADGE_TYPE_CONFIG = {
  participation: {
    emoji: '🎯',
    color: '#3b82f6',
    title: 'Tournament Participant',
  },
  division_winner: {
    emoji: '🥇',
    color: '#f59e0b',
    title: 'Division Winner',
  },
  class_winner: {
    emoji: '🏆',
    color: '#eab308',
    title: 'Class Winner',
  },
  category_winner: {
    emoji: '👑',
    color: '#a855f7',
    title: 'Category Winner',
  },
  stage_winner: {
    emoji: '⭐',
    color: '#06b6d4',
    title: 'Stage Winner',
  },
  personal_best: {
    emoji: '📈',
    color: '#10b981',
    title: 'Personal Best',
  },
  clean_stage: {
    emoji: '💎',
    color: '#14b8a6',
    title: 'Clean Stage',
  },
  top_10_percent: {
    emoji: '🔥',
    color: '#f97316',
    title: 'Top 10%',
  },
  most_improved: {
    emoji: '📊',
    color: '#8b5cf6',
    title: 'Most Improved',
  },
  high_overall: {
    emoji: '👑',
    color: '#dc2626',
    title: 'High Overall',
  },
};

class BadgeGenerator {
  private canvas: ReturnType<typeof createCanvas>;
  private ctx: CanvasRenderingContext2D;
  private style: BadgeStyle;

  constructor(style: BadgeStyle) {
    this.style = style;
    this.canvas = createCanvas(style.width, style.height);
    this.ctx = this.canvas.getContext('2d');
  }

  private drawBackground(): void {
    // Gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.style.height);
    gradient.addColorStop(0, this.style.backgroundColor);
    gradient.addColorStop(0.5, '#1a1a1a');
    gradient.addColorStop(1, this.style.backgroundColor);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.style.width, this.style.height);
    
    // Add subtle tactical pattern
    this.drawTacticalPattern();
  }

  private drawTacticalPattern(): void {
    this.ctx.save();
    this.ctx.globalAlpha = 0.05;
    this.ctx.strokeStyle = this.style.accentColor;
    this.ctx.lineWidth = 2;
    
    // Draw geometric pattern
    const spacing = 40;
    for (let x = 0; x < this.style.width; x += spacing) {
      for (let y = 0; y < this.style.height; y += spacing) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 20, y + 20);
        this.ctx.stroke();
      }
    }
    
    this.ctx.restore();
  }

  private drawBorder(): void {
    const borderWidth = 8;
    const gradient = this.ctx.createLinearGradient(0, 0, this.style.width, 0);
    gradient.addColorStop(0, this.style.accentColor);
    gradient.addColorStop(0.5, this.style.titleColor);
    gradient.addColorStop(1, this.style.accentColor);
    
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = borderWidth;
    this.ctx.strokeRect(
      borderWidth / 2, 
      borderWidth / 2, 
      this.style.width - borderWidth, 
      this.style.height - borderWidth
    );
  }

  private drawTitle(badgeData: BadgeData): void {
    const config = BADGE_TYPE_CONFIG[badgeData.type as keyof typeof BADGE_TYPE_CONFIG];
    const titleSize = Math.floor(this.style.width / 25);
    
    this.ctx.font = `bold ${titleSize}px Arial, sans-serif`;
    this.ctx.fillStyle = this.style.titleColor;
    this.ctx.textAlign = 'center';
    
    // Draw emoji
    this.ctx.font = `${titleSize * 1.5}px Arial, sans-serif`;
    this.ctx.fillText(config.emoji, this.style.width / 2, this.style.height * 0.2);
    
    // Draw title
    this.ctx.font = `bold ${titleSize}px Arial, sans-serif`;
    this.ctx.fillText(badgeData.title, this.style.width / 2, this.style.height * 0.3);
  }

  private drawShooterInfo(badgeData: BadgeData): void {
    const nameSize = Math.floor(this.style.width / 30);
    const detailSize = Math.floor(this.style.width / 40);
    
    // Shooter name
    this.ctx.font = `bold ${nameSize}px Arial, sans-serif`;
    this.ctx.fillStyle = this.style.textColor;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(badgeData.shooterName, this.style.width / 2, this.style.height * 0.45);
    
    // Division and classification
    if (badgeData.metadata?.division) {
      this.ctx.font = `${detailSize}px Arial, sans-serif`;
      this.ctx.fillStyle = this.style.accentColor;
      const divClass = `${badgeData.metadata.division} ${badgeData.metadata.classification || ''}`.trim();
      this.ctx.fillText(divClass, this.style.width / 2, this.style.height * 0.52);
    }
    
    // Placement (if applicable)
    if (badgeData.metadata?.placement) {
      this.ctx.font = `bold ${nameSize}px Arial, sans-serif`;
      this.ctx.fillStyle = this.style.titleColor;
      let placementText = '';
      switch (badgeData.metadata.placement) {
        case 1: placementText = '1st Place'; break;
        case 2: placementText = '2nd Place'; break;
        case 3: placementText = '3rd Place'; break;
        default: placementText = `${badgeData.metadata.placement}th Place`;
      }
      this.ctx.fillText(placementText, this.style.width / 2, this.style.height * 0.6);
    }
  }

  private drawTournamentInfo(badgeData: BadgeData): void {
    const tournamentSize = Math.floor(this.style.width / 35);
    const detailSize = Math.floor(this.style.width / 45);
    
    this.ctx.font = `bold ${tournamentSize}px Arial, sans-serif`;
    this.ctx.fillStyle = this.style.textColor;
    this.ctx.textAlign = 'center';
    
    // Tournament name (truncate if too long)
    let tournamentName = badgeData.tournamentName;
    if (tournamentName.length > 30) {
      tournamentName = tournamentName.substring(0, 27) + '...';
    }
    this.ctx.fillText(tournamentName, this.style.width / 2, this.style.height * 0.75);
    
    // Date and location
    this.ctx.font = `${detailSize}px Arial, sans-serif`;
    this.ctx.fillStyle = this.style.accentColor;
    
    const dateText = badgeData.tournamentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    this.ctx.fillText(dateText, this.style.width / 2, this.style.height * 0.82);
    
    // Location (truncate if too long)
    let location = badgeData.tournamentLocation;
    if (location.length > 40) {
      location = location.substring(0, 37) + '...';
    }
    this.ctx.fillText(location, this.style.width / 2, this.style.height * 0.87);
  }

  private async drawQRCode(verificationCode: string): Promise<void> {
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://idpa-tournament.vercel.app'}/verify/${verificationCode}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: Math.floor(this.style.width / 8),
        margin: 0,
        color: {
          dark: this.style.textColor,
          light: 'transparent',
        }
      });
      
      const qrImage = await loadImage(qrCodeDataUrl);
      const qrSize = Math.floor(this.style.width / 8);
      const qrX = this.style.width - qrSize - 20;
      const qrY = this.style.height - qrSize - 20;
      
      this.ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      
      // Add "Verify" text
      this.ctx.font = `${Math.floor(this.style.width / 60)}px Arial, sans-serif`;
      this.ctx.fillStyle = this.style.accentColor;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('VERIFY', qrX + qrSize / 2, qrY - 10);
      
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  private drawWatermark(): void {
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.font = `${Math.floor(this.style.width / 50)}px Arial, sans-serif`;
    this.ctx.fillStyle = this.style.accentColor;
    this.ctx.textAlign = 'left';
    this.ctx.fillText('IDPA TOURNAMENT SYSTEM', 20, this.style.height - 20);
    this.ctx.restore();
  }

  async generateBadge(badgeData: BadgeData): Promise<Buffer> {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.style.width, this.style.height);
    
    // Draw all elements
    this.drawBackground();
    this.drawBorder();
    this.drawTitle(badgeData);
    this.drawShooterInfo(badgeData);
    this.drawTournamentInfo(badgeData);
    await this.drawQRCode(badgeData.verificationCode);
    this.drawWatermark();
    
    // Return canvas as buffer
    return this.canvas.toBuffer('image/png');
  }
}

// Main function to generate badges in multiple formats
export async function generateBadgeImages(badgeData: BadgeData): Promise<{
  instagramPost: Buffer;
  instagramStory: Buffer;
  twitterCard: Buffer;
  thumbnail: Buffer;
}> {
  const results = await Promise.all([
    new BadgeGenerator(BADGE_STYLES.instagram_post).generateBadge(badgeData),
    new BadgeGenerator(BADGE_STYLES.instagram_story).generateBadge(badgeData),
    new BadgeGenerator(BADGE_STYLES.twitter_card).generateBadge(badgeData),
    new BadgeGenerator(BADGE_STYLES.thumbnail).generateBadge(badgeData),
  ]);

  return {
    instagramPost: results[0],
    instagramStory: results[1],
    twitterCard: results[2],
    thumbnail: results[3],
  };
}

// Generate verification QR code URL
export function generateVerificationUrl(verificationCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://idpa-tournament.vercel.app';
  return `${baseUrl}/verify/${verificationCode}`;
}

// Get badge type configuration
export function getBadgeTypeConfig(type: string) {
  return BADGE_TYPE_CONFIG[type as keyof typeof BADGE_TYPE_CONFIG] || BADGE_TYPE_CONFIG.participation;
}