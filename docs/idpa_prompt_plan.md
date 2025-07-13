# IDPA Tournament Management System - Claude Code Implementation Plan

## Overview
This prompt plan implements the complete IDPA Tournament Management System as specified in the PRD. Each step produces functional, testable code that builds upon previous steps.

## Prerequisites
- Node.js 18+ installed
- Convex account setup
- Vercel account (for deployment)

---

## Step 1: Project Foundation & Authentication
**Goal:** Set up Next.js 14 with Convex, basic auth, and user roles

### Prompt 1.1: Manual Project Setup
**Goal:** Create the Next.js project using official command, then set up custom structure

#### Step 1.1a: Create Next.js App
Run this command in your terminal:

```bash
npx create-next-app@latest idpa-tournament-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

When prompted, select:
- ✅ TypeScript
- ✅ ESLint  
- ✅ Tailwind CSS
- ✅ `src/` directory
- ✅ App Router
- ✅ Import alias (@/*)
- ❌ Turbopack (not needed for this project)

Then navigate to the project:
```bash
cd idpa-tournament-app
```

#### Step 1.1b: Create Custom Folder Structure
Add the IDPA-specific folder structure from PRD section 6.4.1:

```bash
# Create the folder structure from PRD section 6.4.1
mkdir -p src/app/\(auth\)
mkdir -p src/app/\(dashboard\)
mkdir -p src/components/features/{scoring,tournaments,squads,badges}
mkdir -p src/components/layouts
mkdir -p src/lib/{convex,hooks}
mkdir -p src/types
mkdir -p convex

# Create initial files
touch src/components/ui/.gitkeep
touch src/types/index.ts
touch convex/schema.ts
touch convex/_generated/.gitkeep

# Create environment files
touch .env.example
```

#### Step 1.1c: Install Additional Dependencies
Add the IDPA-specific dependencies:

```bash
npm install convex clsx tailwind-merge lucide-react class-variance-authority @radix-ui/react-slot concurrently
```

#### Step 1.1d: Update package.json Scripts
Update the scripts in `package.json` to include Convex:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run convex:dev\" \"next dev\"",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "convex:dev": "convex dev",
    "convex:deploy": "convex deploy"
  }
}
```

#### Step 1.1e: Create Environment Example
Create `.env.example`:
```
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Social Auth (for later)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
```

#### Step 1.1f: Update .gitignore
Add Convex-specific entries to `.gitignore`:
```
# Convex
.convex/
```

### Prompt 1.1g: Windsurf Implementation
**Now use this prompt in Windsurf to implement the actual application:**

```
I have created a Next.js 14 project using create-next-app with TypeScript, Tailwind, and App Router. I've also added the custom IDPA folder structure and installed Convex dependencies. Now implement the complete application foundation with these requirements:

EXISTING SETUP:
- Next.js 14 with App Router, TypeScript, Tailwind CSS (already configured)
- Custom folder structure added for IDPA features
- Convex and additional dependencies installed
- Updated package.json scripts for Convex development

IMPLEMENT THESE COMPONENTS:

1. CONVEX SETUP:
   - Configure convex/schema.ts with initial user tables
   - Set up Convex configuration files
   - Initialize authentication system

2. TAILWIND DARK TACTICAL THEME:
   - Update tailwind.config.js with dark tactical colors
   - Colors: blacks (#000, #1a1a1a), grays (#2a2a2a, #404040), tactical green (#1a4a3a)
   - Military-inspired design tokens
   - High contrast for outdoor readability

3. SHADCN/UI SETUP:
   - Initialize shadcn/ui with dark theme
   - Create essential UI components (Button, Card, Input, etc.)
   - Apply tactical styling to all components

4. APPLICATION LAYOUT:
   - Update src/app/layout.tsx with tactical theme
   - Create navigation component in src/components/layouts/
   - Implement responsive mobile-first design
   - Add IDPA branding elements

5. LANDING PAGE:
   - Update src/app/page.tsx with professional IDPA landing page
   - Include hero section with IDPA mission
   - Feature highlights (tournament management, real-time scoring, etc.)
   - Call-to-action buttons for different user roles

6. UTILITIES & TYPES:
   - Set up src/lib/utils.ts with common utilities
   - Create src/types/index.ts with initial type definitions
   - Add Convex client configuration

7. BASIC ROUTING:
   - Prepare route groups for (auth) and (dashboard)
   - Create placeholder pages for main sections
   - Implement protected route structure

IDPA DESIGN REQUIREMENTS:
- Dark tactical theme throughout
- Military stencil-style fonts where appropriate
- Neon accent colors for interactive elements
- High contrast for outdoor visibility
- Retro gaming subtle elements
- Mobile-first responsive design
- Touch-optimized interfaces

FUNCTIONAL REQUIREMENTS:
- Working Convex connection
- Real-time data capabilities set up
- Authentication foundation ready
- Role-based access preparation
- Mobile-optimized navigation

DELIVERABLES:
- Complete working Next.js app with dark tactical theme
- Convex backend connected and configured
- Professional IDPA-branded landing page
- Responsive navigation system
- shadcn/ui components with tactical styling
- Development environment fully operational

The basic Next.js structure is ready - please implement all the IDPA-specific configuration, theming, and initial application code.
```

Test: After implementation, run `npm run dev` and verify:
- Dark tactical theme loads correctly
- IDPA landing page displays professionally
- Navigation works on mobile and desktop
- Convex connection established (check browser dev tools)
- All styling is mobile-responsive
- No console errors

### ✅ Prompt 1.2: Authentication System - COMPLETED
```
✅ COMPLETED: Complete authentication system with IDPA-specific user roles

IMPLEMENTED FEATURES:
✅ Email/password registration and login with Convex Auth
✅ Progressive profile completion (IDPA data collected during tournament registration)
✅ Four user roles: Admin, Club Owner, Security Officer, Shooter
✅ Role-based dashboard layouts and permissions
✅ Protected routes with proper middleware

CONVEX IMPLEMENTATION:
✅ Complete users schema with IDPA classifications and profile data
✅ Authentication tables integration with custom user data
✅ Progressive profile completion system
✅ Role-based access control structure

UI COMPONENTS IMPLEMENTED:
✅ Login/register forms with role selection
✅ Role-specific dashboard layouts with quick actions
✅ User profile display with IDPA member information
✅ Protected route middleware using convexAuthNextjsMiddleware
✅ Responsive dark tactical theme design

AUTHENTICATION FLOW:
✅ Registration → Role selection → Login redirect
✅ Login → Session creation → Dashboard access
✅ Middleware protection for all protected routes
✅ Real-time authentication state management

TESTING COMPLETED:
✅ All 4 user roles can register and login successfully
✅ Dashboard shows role-specific content and actions
✅ Protected routes redirect properly
✅ Session persistence across page refreshes
✅ Manual testing plan executed for all user roles
```

---

## Step 2: Core Tournament Management
**Goal:** Basic tournament creation and calendar functionality

### ✅ Prompt 2.1: Tournament Schema & Basic CRUD - COMPLETED
```
✅ COMPLETED: Core tournament management system with club foundation

IMPLEMENTED FEATURES:
✅ Complete database schema (tournaments, clubs, squads, registrations)
✅ Club management system with creation and ownership validation
✅ Tournament discovery and browsing interface
✅ Role-based dashboard integration
✅ Authentication flow fixes and session management

CLUB MANAGEMENT FOUNDATION:
✅ Club creation flow for Club Owners with comprehensive form
✅ Club-user association with automatic role validation
✅ One-club-per-owner enforcement with proper error handling
✅ Dashboard shows club creation vs tournament management options

TOURNAMENT DISCOVERY SYSTEM:
✅ Tournament browsing page with search and filtering capabilities
✅ Division-based filtering with all 8 IDPA divisions
✅ Status-based filtering (draft, published, active, completed)
✅ Tournament cards with detailed information display
✅ Registration CTA buttons based on tournament status
✅ Distance calculation and location-based filtering

DASHBOARD INTEGRATION:
✅ Smart Club Owner dashboard (create club → manage tournaments flow)
✅ Shooter tournament browsing integration
✅ Role-specific content and navigation
✅ Authentication state management and redirects

AUTHENTICATION IMPROVEMENTS:
✅ Fixed middleware timing issues with Convex Auth
✅ Component-level authentication redirects for login/register pages
✅ Proper session establishment and redirect handling
✅ Eliminated URL encoding issues in authentication flow

BACKEND IMPLEMENTATION:
✅ Complete CRUD operations for tournaments and clubs
✅ User authentication with proper session management
✅ Role-based access control and validation
✅ Real-time queries and data synchronization

TESTING COMPLETED:
✅ Club Owners can create clubs and access tournament management
✅ All users can browse and filter tournaments effectively
✅ Authentication flow works properly across all user roles
✅ Session persistence and redirect logic functioning

NEXT PHASE: Tournament Creation Wizard Implementation
```

### Prompt 2.2: Tournament Calendar & Filtering
```
Build the tournament calendar with advanced filtering as specified in PRD:

CALENDAR FEATURES:
- Month/week/list view options
- Tournament cards with key information
- Real-time capacity tracking
- Distance calculation from user location

FILTERING SYSTEM:
- Filter by location/distance
- Filter by division
- Filter by club
- Filter by date range
- Search functionality

TOURNAMENT CARDS:
- Basic tournament info display
- Registration status indicators
- Squad availability counters
- Entry fee display
- Distance from user location

RESPONSIVE DESIGN:
- Mobile-first calendar interface
- Touch-optimized navigation
- Pull-to-refresh functionality
- Infinite scroll for large datasets

DELIVERABLES:
- Interactive tournament calendar
- Advanced filtering system
- Location-based distance calculation
- Mobile-optimized interface

Test: View calendar, apply filters, see tournaments update in real-time
```

---

## Step 3: Squad Management System
**Goal:** Smart squad selection with member visibility

### Prompt 3.1: Squad Creation & Configuration
```
Implement the squad management system for tournaments:

SQUAD FEATURES:
- Squad creation with configurable capacity
- Time slot assignment
- SO assignment to squads
- Squad status management (open/full/closed)

SQUAD CONFIGURATION:
- Number of squads per tournament
- Maximum shooters per squad
- Squad naming/numbering system
- Time slot scheduling

DATABASE IMPLEMENTATION:
- Squads table with proper relationships
- Real-time capacity tracking
- Squad member management
- Status updates and notifications

CLUB OWNER INTERFACE:
- Squad setup during tournament creation
- Squad management dashboard
- SO assignment interface
- Capacity monitoring

DELIVERABLES:
- Complete squad creation system
- Squad configuration interface
- Real-time capacity tracking
- SO assignment functionality

Test: Create tournament with multiple squads, assign SOs, verify capacity limits
```

### Prompt 3.2: Smart Squad Selection with Member Visibility
```
Build the smart squad selection interface with social features:

SQUAD SELECTION FEATURES:
- View all squads with current capacity (e.g., "7/10 filled")
- See registered shooters in each squad
- Display shooter profiles (name, classification, division, club)
- Friend/clubmate indicators
- Squad recommendations based on connections

SHOOTER PROFILES IN SQUADS:
- Display IDPA classification and division
- Club affiliation badges
- Recent match history indicators
- Friend connection status
- "Shoot with friends" recommendations

SOCIAL FEATURES:
- Friend connections between shooters
- Squad member recommendations
- "Similar skill level" suggestions
- Squad preference saving

REAL-TIME UPDATES:
- Live squad capacity updates
- Real-time member list updates
- Instant availability notifications
- Squad status changes

MOBILE INTERFACE:
- Touch-optimized squad cards
- Swipe gestures for navigation
- Responsive member profiles
- Quick registration actions

DELIVERABLES:
- Smart squad selection interface
- Real-time member visibility
- Social connection features
- Mobile-optimized experience

Test: Register for tournament, view squads with members, see friend indicators
```

---

## Step 4: IDPA Scoring System
**Goal:** Complete IDPA-compliant scoring with real-time updates

### Prompt 4.1: IDPA Scoring Engine
```
Implement the official IDPA scoring system with full compliance:

IDPA SCORING RULES:
- Points down system: -0, -1, -3, miss (-5)
- Time plus scoring: Raw time + (points down × 1 second) + penalties
- Penalty system: PE (3s), HNT (5s), FTN (5s), FP (10s), FTDR (20s)
- Stage point calculations

SCORING INTERFACE:
- String-by-string time entry
- Hit zone recording (-0, -1, -3, miss)
- Penalty input with IDPA types
- Score review and modification
- DNF handling

SCORING VALIDATION:
- IDPA rules engine for automatic calculation
- Score verification workflow
- SO review before submission
- Audit trail for score changes

TARGET SCORING:
- Official IDPA target zones
- Hit/miss determination
- Multiple string support
- Best hits scoring for unlimited stages

DELIVERABLES:
- Complete IDPA scoring engine
- String-by-string scoring interface
- Penalty application system
- Score validation and review

Test: SO can score shooter on stage, verify IDPA calculations are correct
```

### Prompt 4.2: Real-time Score Tracking & Live Results
```
Build real-time scoring with live leaderboards and performance tracking:

REAL-TIME FEATURES:
- Live score updates as SOs enter them
- Real-time leaderboard calculations
- Instant position updates
- Performance metrics tracking

LIVE LEADERBOARDS:
- Overall match leaders
- Division rankings (SSP, ESP, CDP, CCP, REV, BUG, PCC, CO)
- Classification rankings within divisions
- Custom category rankings (Ladies, Veterans, etc.)
- Stage completion progress

SHOOTER DASHBOARD:
- Current position tracking (overall/division/class)
- Stage-by-stage breakdown
- Performance metrics (accuracy, speed, penalties)
- Personal best comparisons
- Projected final ranking

SPECTATOR MODE:
- QR code generation for public viewing
- Live match following without authentication
- Shooter progress tracking
- Performance summaries

NOTIFICATIONS:
- Score posted alerts
- Position change notifications
- Achievement unlocked messages
- Real-time updates via push

DELIVERABLES:
- Real-time scoring system
- Live leaderboard displays
- Shooter performance dashboard
- Spectator mode with QR codes

Test: Score a shooter, verify real-time updates across all interfaces
```

---

## Step 5: Digital Badge System
**Goal:** Automatic badge generation with social sharing

### Prompt 5.1: Badge Generation Engine
```
Implement the digital achievement badge system:

BADGE TYPES:
- Participation badges (tournament completion)
- Performance badges (division/class placement)
- Special achievements (stage winner, personal best, clean stage)
- Category winners (Ladies, Veterans, etc.)
- Milestone badges (first match, improvement, etc.)

BADGE DESIGN:
- Dynamic badge generation with Canvas API
- Tournament branding integration
- Shooter name and achievement details
- QR code with verification link
- Multiple format support (Instagram, Stories, Twitter)

BADGE METADATA:
- Achievement details and criteria
- Tournament information
- Verification code for authenticity
- Rarity indicators
- Shareable statistics

AUTOMATIC GENERATION:
- Trigger badges upon match completion
- Calculate achievements automatically
- Generate multiple formats simultaneously
- Store high-resolution versions

VERIFICATION SYSTEM:
- Unique verification codes
- Tamper-proof watermarks
- Link to official results
- Anti-fraud measures

DELIVERABLES:
- Automatic badge generation
- Multiple design templates
- Verification system
- High-quality image output

Test: Complete a match, verify badges are automatically generated with correct data
```

### Prompt 5.2: Social Media Integration & Badge Sharing
```
Build comprehensive social media sharing with one-click publishing:

SOCIAL PLATFORMS:
- Instagram Posts (1080x1080) and Stories (1080x1920)
- Facebook posts and stories
- Twitter/X optimized cards
- WhatsApp sharing
- LinkedIn professional posts

SHARING FEATURES:
- One-click sharing to multiple platforms
- Pre-filled captions with achievement details
- Automatic hashtag generation (#IDPA #IDPAArgentina)
- Club and tournament mentions
- Downloadable HD versions for printing

BADGE COLLECTION:
- Personal trophy case interface
- Badge history and statistics
- Lifetime achievement tracking
- Season/yearly compilations
- Shareable shooter profile page

SOCIAL VERIFICATION:
- Verified badge authenticity
- Link to official match results
- Share count tracking
- Engagement metrics

MOBILE OPTIMIZATION:
- Native mobile sharing APIs
- Camera roll saving
- Direct platform integration
- Optimized for mobile workflows

DELIVERABLES:
- Complete social sharing system
- Badge collection interface
- Multiple platform support
- Mobile-optimized sharing

Test: Earn badge, share to Instagram/Facebook, verify formatting and links work
```

---

## Step 6: Advanced Features & PWA
**Goal:** Offline functionality and progressive web app features

### Prompt 6.1: Offline-First Architecture
```
Implement comprehensive offline functionality using Convex and PWA:

OFFLINE CAPABILITIES:
- Full scoring functionality offline
- Cached tournament and squad data
- Local score queue with sync
- Automatic retry on connection restore
- Background data synchronization

PWA FEATURES:
- Service worker with Workbox
- App installation prompts
- Offline page handling
- Background sync for scores
- Push notifications

DATA SYNCHRONIZATION:
- Convex built-in sync mechanism
- Optimistic updates with rollback
- Conflict resolution for concurrent edits
- Incremental sync for large datasets
- Sync status indicators

OFFLINE UI:
- Offline status indicators
- Cached data badges
- Sync progress displays
- Connection restoration alerts
- Graceful degradation

MOBILE APP EXPERIENCE:
- Native app-like performance
- Smooth offline transitions
- Background score submission
- Local data persistence

DELIVERABLES:
- Complete offline functionality
- PWA installation capability
- Background sync system
- Mobile-optimized experience

Test: Go offline, score matches, verify sync when connection restored
```

### Prompt 6.2: Push Notifications & Performance Optimization
```
Add push notifications and optimize performance for mobile devices:

PUSH NOTIFICATIONS:
- Pre-tournament reminders (24h, 1h before)
- Squad call notifications
- Score posted alerts
- Real-time position updates
- Achievement notifications

NOTIFICATION TYPES:
- Tournament reminders and updates
- Squad staging calls
- Score submissions and updates
- Friend/squad mate achievements
- Award announcements

PERFORMANCE OPTIMIZATION:
- React Server Components for static content
- Virtual scrolling for long lists
- Lazy loading for heavy components
- Optimized bundle splitting
- Image optimization with Next.js

MOBILE ENHANCEMENTS:
- Touch-optimized interactions
- Swipe gestures for navigation
- Haptic feedback integration
- Pull-to-refresh functionality
- Bottom sheet UI patterns

ANALYTICS & MONITORING:
- Vercel Analytics integration
- Error tracking with Sentry
- Performance monitoring
- User behavior tracking

DELIVERABLES:
- Complete push notification system
- Performance-optimized mobile experience
- Analytics and monitoring setup
- Production-ready optimizations

Test: Receive notifications, verify performance on mobile devices
```

---

## Step 7: Administrative Features
**Goal:** Complete admin dashboard and match management

### Prompt 7.1: Match Director Dashboard
```
Build comprehensive match management interface for Club Owners:

TOURNAMENT MANAGEMENT:
- Tournament creation wizard
- Stage designer with drag-and-drop
- Squad management interface
- SO assignment and scheduling
- Registration monitoring

STAGE DESIGNER:
- Visual drag-and-drop interface
- IDPA target library
- Cover and barrier placement
- Fault line configuration
- Stage briefing editor

MATCH DAY CONTROLS:
- Live tournament monitoring
- Squad progress tracking
- Score verification tools
- Result generation
- Award calculation

REPORTING SYSTEM:
- Final match results
- Individual score sheets
- Award certificates
- Stage analysis reports
- IDPA-compliant match reports

USER MANAGEMENT:
- Shooter registration approval
- SO certification verification
- Role assignment interface
- Club member management

DELIVERABLES:
- Complete MD dashboard
- Visual stage designer
- Match day management tools
- Comprehensive reporting

Test: Create tournament, design stages, manage match day operations
```

### Prompt 7.2: Admin Panel & System Management
```
Create system administration interface with full control:

SYSTEM ADMINISTRATION:
- User management across all clubs
- Global settings configuration
- Rule updates and enforcement
- Data backup and security

CLUB MANAGEMENT:
- Club creation and approval
- Owner assignment
- Activity monitoring
- Performance analytics

TOURNAMENT OVERSIGHT:
- Sanctioned match approval
- Rule compliance monitoring
- Result verification
- Official record keeping

ANALYTICS DASHBOARD:
- Usage statistics
- Performance metrics
- User engagement data
- System health monitoring

SECURITY FEATURES:
- Audit trail logging
- Access control management
- Security incident monitoring
- Data protection compliance

DELIVERABLES:
- Complete admin panel
- System monitoring tools
- Security management
- Analytics dashboard

Test: Manage users, monitor system health, verify security controls
```

---

## Step 8: Final Polish & Deployment
**Goal:** Production deployment and final optimizations

### Prompt 8.1: UI/UX Polish & Accessibility
```
Finalize the user interface with professional polish and accessibility:

DESIGN REFINEMENT:
- Consistent dark tactical theme
- Retro gaming elements integration
- Professional typography system
- Smooth animations and transitions

ACCESSIBILITY COMPLIANCE:
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation support
- High contrast mode
- Focus management

MOBILE OPTIMIZATION:
- Touch target sizing
- Gesture recognition
- Responsive breakpoints
- Mobile-first interactions

LOADING STATES:
- Skeleton screens
- Progressive loading
- Smooth transitions
- Error state handling

INTERNATIONALIZATION:
- Spanish primary language
- English secondary support
- Date/time localization
- Currency formatting

DELIVERABLES:
- Polished UI with consistent theming
- Full accessibility compliance
- Mobile-optimized experience
- Multi-language support

Test: Verify accessibility with screen reader, test on multiple devices
```

### Prompt 8.2: Production Deployment & Monitoring
```
Deploy to production with monitoring and maintenance systems:

DEPLOYMENT SETUP:
- Vercel hosting configuration
- Convex production environment
- Environment variable management
- Domain configuration

PERFORMANCE MONITORING:
- Real User Metrics (RUM)
- Error tracking and alerting
- Performance benchmarking
- Uptime monitoring

SECURITY IMPLEMENTATION:
- SSL/TLS configuration
- Security headers
- Rate limiting
- DDoS protection

BACKUP & RECOVERY:
- Automated database backups
- Disaster recovery procedures
- Data retention policies
- Recovery testing

MAINTENANCE PROCEDURES:
- Update deployment process
- Health check endpoints
- Log management
- Performance optimization

DELIVERABLES:
- Production deployment
- Monitoring and alerting
- Security configuration
- Maintenance procedures

Test: Deploy to production, verify all features work, monitor performance
```

---

## Testing Strategy for Each Step

### Functional Testing
- Each prompt should result in working, testable functionality
- Manual testing procedures included with each step
- Integration testing between components
- User acceptance testing with different roles

### Performance Testing
- Mobile device performance validation
- Offline functionality verification
- Real-time feature responsiveness
- Load testing for tournament day traffic

### Security Testing
- Authentication and authorization verification
- Data protection compliance
- Input validation and sanitization
- Access control testing

### User Experience Testing
- Role-based workflow validation
- Mobile interface usability
- Accessibility compliance verification
- Cross-browser compatibility

---

## Success Criteria

### Technical Success
- ✅ All features from PRD implemented
- ✅ IDPA rule compliance verified
- ✅ Real-time functionality working
- ✅ Offline capability functional
- ✅ Mobile-optimized experience
- ✅ Production deployment successful

### User Success
- ✅ All 4 user roles can complete their workflows
- ✅ Tournament creation and management works
- ✅ Squad selection with member visibility
- ✅ IDPA scoring system accurate
- ✅ Badge generation and sharing functional
- ✅ Real-time updates working correctly

### Business Success
- ✅ Scalable architecture for growth
- ✅ Monitoring and analytics in place
- ✅ Security and compliance verified
- ✅ Performance targets met
- ✅ User satisfaction validated

---

## Notes for Implementation

1. **Start with Prompt 1.1** and complete each step fully before moving to the next
2. **Test thoroughly** at each step - don't proceed if current step isn't working
3. **Keep the PRD handy** for reference on specific requirements
4. **Focus on IDPA compliance** - the scoring system must be exactly correct
5. **Mobile-first approach** - test on mobile devices throughout development
6. **Use the specified tech stack** - don't substitute technologies
7. **Build incrementally** - each step should add value and be demonstrable

This plan will result in a complete, production-ready IDPA Tournament Management System that meets all requirements specified in the PRD.