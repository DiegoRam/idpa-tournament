# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **IDPA Tournament Management System** - a mobile-first Progressive Web Application built with Next.js 15, TypeScript, and Convex.dev as the backend. The application is designed to digitize IDPA (International Defensive Pistol Association) shooting tournaments, with a primary focus on the Argentine market.

### Key Technologies
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS 4
- **Backend**: Convex.dev (real-time database, auth, file storage)
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS with custom design system
- **Development**: ESLint, Turbopack for fast development

## Development Commands

### Essential Commands
```bash
# Start development (runs both Next.js and Convex)
npm run dev

# Start Next.js only (for frontend work)
next dev --turbopack

# Start Convex backend only
npm run convex:dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Deploy Convex backend
npm run convex:deploy
```

### Important Notes
- **Always run `npm run dev`** for full-stack development (includes both Next.js and Convex)
- Convex runs on a separate process and provides real-time database capabilities
- Use `--turbopack` flag for faster Next.js development builds
- **For Convex commands, use `npx convex dev --once`** to avoid timeout errors when running as agent

### Testing Commands
```bash
# Run complete test suite
# Visit http://localhost:3000/test after starting dev server

# Deploy Convex schema and functions once
npx convex dev --once
```

## Architecture Overview

### Application Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes group
│   ├── (dashboard)/       # Dashboard routes group  
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── features/          # Feature-specific components
│   │   ├── badges/        # Digital achievement badges
│   │   ├── scoring/       # IDPA scoring system
│   │   ├── squads/        # Squad management
│   │   └── tournaments/   # Tournament management
│   └── layouts/           # Layout components
├── lib/                   # Utility libraries
│   ├── convex/           # Convex client configuration
│   └── hooks/            # Custom React hooks
└── types/                # TypeScript type definitions

convex/                    # Convex backend
└── schema.ts             # Database schema
```

### IDPA-Specific Architecture

This application implements **IDPA (International Defensive Pistol Association)** rules and scoring:

#### IDPA Divisions
- **SSP** (Stock Service Pistol)
- **ESP** (Enhanced Service Pistol) 
- **CDP** (Custom Defensive Pistol)
- **CCP** (Compact Carry Pistol)
- **REV** (Revolver)
- **BUG** (Back-Up Gun)
- **PCC** (Pistol Caliber Carbine)
- **CO** (Carry Optics)

#### IDPA Classifications
- **MA** (Master)
- **EX** (Expert)
- **SS** (Sharpshooter)
- **MM** (Marksman)
- **NV** (Novice)
- **UN** (Unclassified)

#### IDPA Scoring System
Uses "time plus" scoring: `Final Score = Raw Time + Points Down + Penalties`
- **Down Zero (-0)**: Perfect hits = 0 seconds added
- **Down One (-1)**: 1 second added per hit
- **Down Three (-3)**: 3 seconds added per hit  
- **Miss**: 5 seconds added per miss
- **Penalties**: Procedural errors (3s), Hit on Non-Threat (5s), etc.

### Key Features
- **Tournament Calendar**: Advanced filtering by location, division, date
- **Squad Selection**: View registered shooters before joining squads
- **Real-time Scoring**: Live IDPA-compliant scoring with offline support
- **Digital Badges**: Auto-generated achievement badges with social sharing
- **Custom Categories**: Ladies, Veterans, Law Enforcement awards
- **Spectator Mode**: Real-time following via QR codes
- **Offline-First**: Full scoring capability without internet

## Convex Integration

### Database Design
The application uses Convex's real-time document database with these key collections:
- `users` - Multi-role user system (admin, clubOwner, securityOfficer, shooter)
- `tournaments` - Tournament management with IDPA divisions
- `squads` - Squad organization with capacity management
- `registrations` - Tournament registrations with division/classification
- `scores` - IDPA scoring with real-time updates
- `badges` - Digital achievement system
- `stages` - Visual stage designer data

### Real-time Features
- Live score updates during tournaments
- Real-time leaderboards by division/classification
- Automatic badge generation on achievement
- Squad capacity monitoring
- Spectator mode with live tracking

## UI/UX Design Philosophy

### Dark Tactical Theme
- Military-inspired color palette (blacks, grays, tactical greens)
- Retro gaming elements (pixel art icons, 8-bit effects)
- High contrast for outdoor visibility
- Mobile-first responsive design

### Component Organization
- Use Radix UI primitives for accessibility
- Implement design system with Tailwind CSS
- Feature-based component structure
- Responsive layouts for all screen sizes

## Development Patterns

### File Organization
- Group components by feature (tournaments, scoring, badges, squads)
- Use TypeScript for all components and utilities
- Implement proper type definitions in `src/types/`
- Follow Next.js App Router conventions

### Convex Patterns
- Queries for reading data (automatically reactive)
- Mutations for data changes (optimistic updates)
- Actions for complex server-side logic
- Real-time subscriptions for live features

### Performance Considerations
- Implement offline-first architecture
- Use Convex's built-in sync for real-time updates
- Optimize for mobile devices and slow connections
- Cache tournament data for offline scoring

## Testing and Quality

### Code Quality
- Run `npm run lint` before committing
- Follow TypeScript strict mode
- Use proper error handling for offline scenarios
- Implement proper loading states for real-time data

### IDPA Compliance
- Ensure accurate scoring calculations
- Validate division/classification combinations
- Follow official IDPA rules for penalties
- Test scoring accuracy against known results

### Production Notes
- **Test pages have been removed** for production security
- All hardcoded credentials and test data eliminated
- Production-ready with no TODOs remaining
- Full ESLint and TypeScript compliance
- Optimized for deployment

## Important Context

### Target Users
- **Primary**: IDPA clubs in Argentina
- **Secondary**: Latin American IDPA community
- **Tertiary**: Global IDPA tournament organizers

### Critical Requirements
- 100% offline scoring capability
- Real-time score synchronization
- IDPA rule compliance
- Mobile-first design for outdoor use
- Multi-language support (Spanish primary, English secondary)

## Implementation Status

### ✅ Phase 1: Foundation (COMPLETED)
- **Database Schema**: Complete 9-table schema with 28 optimized indexes
- **Backend Functions**: User management, club operations, tournament lifecycle  
- **UI Components**: Tactical theme with IDPA-specific components
- **Real-time Setup**: Convex provider configured for live data
- **Type Safety**: Complete TypeScript interfaces for all IDPA data
- **Authentication**: Multi-role system with proper authorization

### ✅ Phase 2: Core Features (COMPLETED)
- **Squad Selection**: Interface with member visibility and friend indicators
- **IDPA Scoring**: Complete scoring system with Security Officer interface
- **Tournament Calendar**: Advanced filtering by location, division, date
- **Real-time Leaderboards**: Live updates by division/classification
- **User Profiles**: Complete authentication and profile management

### ✅ Phase 3: Advanced Features (COMPLETED)
- **Digital Badges**: Auto-generated achievement badges with social sharing
- **Visual Stage Designer**: Professional IDPA stage layout tool
- **Offline Scoring**: Full offline capability with automatic sync
- **Custom Categories**: Ladies, Veterans, Law Enforcement awards
- **Spectator Mode**: Real-time following via QR codes

### ✅ Phase 4: Production Polish (COMPLETED)
- **Internationalization**: Spanish/English support with complete IDPA translations
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support
- **PWA Features**: Offline support, install prompts, service workers
- **Security**: Hardened with CSP, security headers, audit logging
- **Performance**: Optimized bundles, Core Web Vitals monitoring
- **Deployment**: Vercel-ready with CI/CD configuration

## Current Status: PRODUCTION READY ✅

The application is feature-complete and ready for production deployment. All planned features have been implemented, tested, and optimized.

## Documentation References

Refer to the comprehensive Product Requirements Document at `docs/idpa-prd-v24.md` for:
- Detailed user stories and workflows
- Complete database schema specifications
- UI wireframes and design specifications
- IDPA scoring rules and regulations
- Badge system and social features
- API specifications for all features

This PRD contains the complete technical and business requirements for the application.