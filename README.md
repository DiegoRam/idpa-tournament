# IDPA Tournament Management System 🎯

A professional, mobile-first Progressive Web Application for managing IDPA (International Defensive Pistol Association) shooting tournaments. Built with Next.js 15, TypeScript, and Convex.dev, this system digitizes the complete tournament experience with real-time scoring, squad management, and digital achievements.

![IDPA Tournament Manager](https://img.shields.io/badge/IDPA-Tournament%20Manager-green?style=for-the-badge&logo=target&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Production%20Ready-success?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)

## 🚀 Features

### Core Functionality
- **🔐 Multi-Role Authentication**: Admin, Club Owner, Security Officer, and Shooter roles
- **📅 Tournament Management**: Complete tournament lifecycle with advanced filtering
- **👥 Smart Squad Selection**: View squad members before joining with social indicators
- **🎯 IDPA-Compliant Scoring**: Real-time scoring with all official rules and penalties
- **🏆 Digital Badges**: Auto-generated achievement badges with social sharing
- **📊 Live Leaderboards**: Real-time rankings by division and classification
- **📱 Progressive Web App**: Full offline functionality with sync capabilities
- **🌐 Internationalization**: Complete Spanish/English support

### Technical Features
- **Real-time Updates**: Powered by Convex.dev for instant data synchronization
- **Offline-First Architecture**: Score tournaments without internet connectivity
- **Mobile Optimized**: Touch-friendly interfaces with haptic feedback
- **WCAG 2.1 AA Compliant**: Full accessibility support
- **Enterprise Security**: CSP headers, XSS protection, rate limiting
- **Performance Monitoring**: Core Web Vitals tracking and analytics

## 🏁 Quick Start

### Prerequisites
- Node.js 18+ installed
- Convex account (free tier available at [convex.dev](https://convex.dev))
- Git installed

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/DiegoRam/idpa-tournament.git
cd idpa-tournament-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Convex deployment credentials:
```env
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

4. **Initialize Convex**
```bash
npx convex dev
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 IDPA Divisions & Classifications

The system supports all official IDPA divisions and classifications:

### Divisions
- **SSP** - Stock Service Pistol
- **ESP** - Enhanced Service Pistol
- **CDP** - Custom Defensive Pistol
- **CCP** - Compact Carry Pistol
- **REV** - Revolver
- **BUG** - Back-Up Gun
- **PCC** - Pistol Caliber Carbine
- **CO** - Carry Optics

### Classifications
- **MA** - Master
- **EX** - Expert
- **SS** - Sharpshooter
- **MM** - Marksman
- **NV** - Novice
- **UN** - Unclassified

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS 4
- **Backend**: Convex.dev (real-time database, auth, file storage)
- **UI Components**: Radix UI, Lucide React icons, shadcn/ui
- **PWA**: next-pwa with offline capabilities
- **Deployment**: Vercel with GitHub Actions CI/CD

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API endpoints
├── components/            # React components
│   ├── features/          # Feature-specific components
│   │   ├── badges/        # Digital badge system
│   │   ├── scoring/       # IDPA scoring components
│   │   ├── squads/        # Squad management
│   │   └── tournaments/   # Tournament components
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript type definitions
└── i18n/                  # Internationalization files

convex/                    # Backend functions
├── schema.ts              # Database schema
├── auth.ts                # Authentication
├── tournaments.ts         # Tournament management
├── scoring.ts             # Scoring system
└── badges.ts              # Badge generation
```

## 📱 User Workflows

### For Shooters
1. Register with division and classification
2. Browse and register for tournaments
3. Select squads with member visibility
4. View real-time scores and rankings
5. Earn and share digital badges

### For Security Officers
1. Score shooters stage by stage
2. Apply IDPA penalties accurately
3. Monitor squad progress
4. Submit scores in real-time

### For Club Owners
1. Create and manage clubs
2. Set up tournaments with stages
3. Configure squads and assign SOs
4. Monitor tournament progress
5. Generate reports and analytics

### For Administrators
1. Manage users and permissions
2. Monitor system health
3. View platform analytics
4. Handle security events
5. Configure system settings

## 🔧 Development Commands

```bash
# Development (runs Next.js + Convex)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Deploy Convex backend
npm run convex:deploy

# Run Convex dev (one-time)
npx convex dev --once
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect to GitHub**
   - Fork this repository
   - Connect your GitHub account to Vercel

2. **Configure Environment Variables**
   ```
   CONVEX_DEPLOYMENT
   NEXT_PUBLIC_CONVEX_URL
   CONVEX_DEPLOY_KEY
   ```

3. **Deploy**
   - Push to main branch
   - Vercel will automatically deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy Convex backend
npm run convex:deploy

# Deploy to Vercel
vercel --prod
```

## 🔒 Security

- **Authentication**: Secure role-based access control
- **Data Protection**: All data encrypted in transit and at rest
- **Security Headers**: CSP, X-Frame-Options, XSS Protection
- **Rate Limiting**: API endpoint protection
- **Audit Logging**: Complete administrative action tracking

## 🌐 Internationalization

The application supports:
- **Spanish** (primary language)
- **English** (secondary language)

Switch languages using the language selector in the UI.

## 📊 Testing

### Development Testing
Visit [http://localhost:3000/test](http://localhost:3000/test) for the comprehensive test suite.

### Test Accounts
Create test accounts with different roles to explore functionality:
- Admin
- Club Owner
- Security Officer
- Shooter

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- IDPA for the official rulebook and scoring guidelines
- The Convex team for the real-time backend platform
- The Next.js team for an amazing framework
- All contributors and testers

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ for the IDPA shooting community 🎯