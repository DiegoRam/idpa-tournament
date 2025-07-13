# Product Requirements Document: IDPA Tournament Management System

## Table of Contents
1. Executive Summary
2. Product Vision & Goals
3. User Personas & Roles
4. Functional Requirements
5. Non-Functional Requirements
6. Technical Architecture
7. User Interface Design
8. User Flow Examples
9. Success Metrics
10. Implementation Roadmap
11. Risks & Mitigation
12. Compliance & Regulations
13. Success Criteria
14. Appendices
    - A. IDPA Scoring Rules Reference
    - B. Technical Specifications
    - C. Design System Documentation
    - D. User Stories
    - E. Database Schema (Convex)
    - F. Wireframes
    - G. API Specifications
    - H. Badge Design Templates
    - I. Push Notification Strategy
    - J. Spectator Mode Design

## 1. Executive Summary

### 1.1 Product Overview
The IDPA Tournament Management System is a mobile-first Progressive Web Application (PWA) designed to digitize and streamline the management of IDPA (International Defensive Pistol Association) shooting tournaments, with a primary focus on the Argentine market. The application will provide comprehensive tournament management, real-time scoring, and offline capabilities to ensure uninterrupted operation in areas with limited connectivity.

### 1.2 Key Features
- Multi-role user management system
- Tournament calendar with advanced filtering
- Smart squad selection with member visibility
- Tournament creation and management
- IDPA-compliant division and classification system
- Custom award categories (Ladies, Veterans, etc.)
- Real-time scoring with IDPA rules compliance
- Live performance tracking for shooters
- Digital achievement badges with social sharing
- Visual stage designer tool
- Offline-first architecture with automatic synchronization
- Dark tactical UI with retro gaming aesthetics

### 1.3 Target Market
- Primary: IDPA clubs and organizations in Argentina
- Secondary: Latin American IDPA community
- Tertiary: Global IDPA tournament organizers

## 2. Product Vision & Goals

### 2.1 Vision Statement
To become the leading digital platform for IDPA tournament management in Argentina and Latin America, providing a seamless, reliable, and intuitive experience for tournament organizers, security officers, and shooters.

### 2.2 Product Goals
1. **Reliability**: 100% operational capability in offline mode
2. **Efficiency**: Reduce tournament administration time by 70%
3. **Accuracy**: Eliminate manual scoring errors
4. **Accessibility**: Support multiple devices and screen sizes
5. **Compliance**: Full adherence to IDPA rules and regulations
6. **Engagement**: Increase shooter participation through gamification and social features

## 3. User Personas & Roles

### 3.1 Admin
**Profile**: System administrator with full control
**Responsibilities**:
- System configuration and maintenance
- User management across all clubs
- Global settings and rule updates
- Data backup and security management

### 3.2 Club Owner
**Profile**: IDPA club managers and tournament directors
**Responsibilities**:
- Create and manage tournaments
- Assign security officers to squads
- Design and configure stages
- Generate reports and rankings

### 3.3 Security Officer (SO)
**Profile**: Certified IDPA range officers
**Responsibilities**:
- Score shooters on assigned stages
- Manage stage flow and safety
- Record penalties and disqualifications
- Validate and submit scores

### 3.4 Shooter
**Profile**: IDPA competitors across all divisions and skill levels
**Responsibilities**:
- Register for tournaments
- Select appropriate division (SSP, ESP, CDP, CCP, REV, BUG, PCC, CO)
- Maintain accurate classification (MA, EX, SS, MM, NV, UN)
- View schedules and squad assignments
- Track personal scores and rankings in real-time
- Monitor live match performance
- Access stage briefings
- Register for applicable custom categories (Ladies, Veterans, etc.)
- Collect and share digital achievement badges
- Follow other shooters' progress during matches

## 4. Functional Requirements

### 4.1 User Management

#### 4.1.1 Registration & Authentication
- Email-based registration with verification
- Social login options (Google, Facebook)
- Two-factor authentication for Admin and Club Owner roles
- Password recovery mechanism
- Profile management with IDPA member number integration

#### 4.1.2 Role Management
- Role assignment by Admin or Club Owner
- Role-based access control (RBAC)
- Multiple role support (e.g., Shooter who is also an SO)
- Role verification for Security Officers (certificate validation)

### 4.2 Tournament Management

#### 4.2.1 Tournament Creation
- Tournament metadata (name, date, location, match type)
- Division setup:
  - Select from official IDPA divisions:
    - Stock Service Pistol (SSP)
    - Enhanced Service Pistol (ESP)
    - Custom Defensive Pistol (CDP)
    - Compact Carry Pistol (CCP)
    - Revolver (REV)
    - Back-Up Gun (BUG)
    - Pistol Caliber Carbine (PCC)
    - Carry Optics (CO)
  - Enable/disable specific divisions
- Custom category creation:
  - Ladies
  - Veterans
  - Junior
  - Senior
  - Law Enforcement
  - Custom categories defined by club owner
- Award configuration per division/category
- Entry fee configuration (per division if needed)
- Capacity limits and waitlist management
- Squad configuration:
  - Number of squads available
  - Maximum shooters per squad
  - Squad time slots
  - Squad naming/numbering
- Registration open/close dates
- Tournament visibility settings (public/private)

#### 4.2.2 Stage Designer
- Visual drag-and-drop interface
- Element library:
  - IDPA targets (threat/non-threat)
  - Hard cover and soft cover
  - Walls and barriers
  - Fault lines
  - Starting positions
  - Props (tables, chairs, vehicles)
  - Moving targets
  - Hostages/no-shoots
- String configuration per stage
- Par time settings
- Stage descriptions and briefings
- Save/load stage templates

#### 4.2.3 Registration Management
- Online registration with payment integration
- Division and classification selection:
  - Shooter selects their division from enabled options
  - Classification verification:
    - Master (MA)
    - Expert (EX)
    - Sharpshooter (SS)
    - Marksman (MM)
    - Novice (NV)
    - Unclassified (UN)
  - Optional custom category selection (if applicable)
- Squad selection interface:
  - Real-time squad capacity display
  - Current registered shooters list per squad
  - Shooter profiles preview (name, classification, division, club)
  - Friend/favorite shooter indicators
  - Squad availability status (open/full/waitlist)
- Automatic waitlist management
- Squad transfer requests
- Check-in process with division/classification confirmation
- IDPA member number validation

#### 4.2.4 Tournament Calendar
- Calendar view (month/week/list)
- Filter options:
  - By location/distance
  - By division
  - By club
  - By date range
- Tournament cards showing:
  - Basic tournament info
  - Registration status
  - Squad availability
  - Entry fee
  - Distance from user location
- Quick registration from calendar
- Add to personal calendar integration
- Tournament reminders/notifications
- Upcoming tournaments widget on dashboard

### 4.3 Scoring System

#### 4.3.1 Stage Scoring Interface
- Stage selection by Security Officer
- Squad roster display
- Shooter-by-shooter scoring workflow
- String-by-string time entry
- Hit zone recording:
  - Down zero (-0): Perfect hits in center zones
  - Down one (-1): Hits in -1 zone
  - Down three (-3): Hits in -3 zone
  - Miss (-5): Complete misses
- Penalty input:
  - Procedural errors (3 seconds each)
  - Hit on non-threat (5 seconds each)
  - Failure to neutralize
  - Other penalties per IDPA rulebook
- DNF (Did Not Finish) handling
- Score review and modification

#### 4.3.2 IDPA Scoring Rules Engine
- Automatic score calculation per IDPA rules:
  - Raw time + (points down × 1 second) + penalties
  - Points down calculation: (-0 = 0, -1 = 1, -3 = 3, miss = 5)
- Time plus penalties computation
- Stage point calculation
- Division-specific rule application
- Real-time leaderboard updates

#### 4.3.3 Score Verification
- SO review before submission
- Shooter acknowledgment option
- Score dispute mechanism
- Audit trail for all score changes

### 4.3.4 Squad Social Features
- Shooter profiles with:
  - IDPA classification and achievements
  - Club affiliation
  - Recent match history
  - Friend connections
- Squad chat (pre-tournament)
- Squad member recommendations
- "Shoot with friends" feature
- Squad preference saving

### 4.4 Offline Functionality

#### 4.4.1 Data Synchronization
- Convex's built-in sync mechanism
- Optimistic updates with automatic rollback
- Conflict resolution for concurrent edits
- Sync status indicators
- Background sync for tournament data
- Incremental sync for large datasets

#### 4.4.2 Offline Capabilities
- Full scoring functionality offline
- Cached tournament and squad data
- Local score queue with Convex offline support
- Automatic retry on connection restore
- Offline tournament download before event
- Squad roster offline availability

### 4.5 Digital Badges & Social Features

#### 4.5.1 Achievement Badge System
- Automatic badge generation upon match completion
- Badge types:
  - Participation badges (tournament logo + date)
  - Performance badges (division/class placement)
  - Special achievement badges:
    - Stage winner
    - Personal best
    - Clean stage (no penalties)
    - First place in division/class/category
    - Top 10% overall
    - Most improved
- Dynamic badge design with:
  - Tournament branding
  - Shooter name and classification
  - Achievement details
  - QR code linking to verified results
  - IDPA official logos (with permission)

#### 4.5.2 Social Media Integration
- One-click sharing to:
  - Instagram Stories/Posts
  - Facebook
  - Twitter/X
  - WhatsApp
  - LinkedIn
- Shareable formats:
  - Square badge (1080x1080) for Instagram
  - Story format (1080x1920)
  - Twitter card format
  - High-res for printing
- Pre-filled captions with:
  - Tournament name and location
  - Achievement details
  - Relevant hashtags (#IDPA #IDPAArgentina)
  - Club mentions
- Verified badge authenticity:
  - Unique verification code
  - Link to official results
  - Anti-tampering watermark

#### 4.5.3 Digital Trophy Case
- Personal badge collection gallery
- Badge statistics and history
- Lifetime achievements tracking
- Shareable shooter profile page
- Badge rarity indicators
- Season/yearly compilations

### 4.6 Reporting & Analytics

#### 4.6.1 Real-time Dashboards
- Live leaderboards organized by:
  - Division (SSP, ESP, CDP, CCP, REV, BUG, PCC, CO)
  - Classification within each division (MA, EX, SS, MM, NV, UN)
  - Custom categories (Ladies, Veterans, etc.)
- Overall match leaders
- Stage completion progress
- Squad status tracking
- Performance analytics by division/classification
- Live spectator mode with real-time updates

#### 4.6.2 Match Results
- Automatic result compilation by:
  - Division rankings
  - Classification rankings within divisions
  - Combined division/classification standings
  - Custom category rankings
- Award calculations:
  - Division winners (1st, 2nd, 3rd)
  - Classification winners within each division
  - Custom category winners
  - High overall shooter
- Recognition badges for personal records
- Stage winner recognition
- Automatic badge generation for all participants

#### 4.6.3 Report Generation
- Final match results with full breakdowns
- Individual score sheets with classification info
- Award certificates generation
- Stage analysis reports by division
- Downloadable/printable formats (PDF, Excel)
- IDPA-compliant match reports for submission
- Custom category reports for special awards
- Badge collection export for printing

## 5. Non-Functional Requirements

### 5.1 Performance
- Page load time < 3 seconds on 3G
- Offline mode activation < 1 second
- Score submission latency < 500ms
- Support for 1000+ concurrent users

### 5.2 Security
- End-to-end encryption for sensitive data
- OWASP compliance
- Regular security audits
- Data privacy compliance (GDPR, Argentine data protection laws)
- Secure API authentication (JWT tokens)

### 5.3 Usability
- Mobile-first responsive design
- Touch-optimized interfaces
- Accessibility compliance (WCAG 2.1 AA)
- Multi-language support (Spanish primary, English secondary)
- Intuitive navigation with < 3 taps to any feature
- Push notifications for real-time updates
- Social media-ready content formats

### 5.4 Reliability
- 99.9% uptime for online services
- Automatic error recovery
- Data backup every 6 hours
- Disaster recovery plan

## 6. Technical Architecture

### 6.1 Frontend
- Framework: React/Next.js with TypeScript
- UI Library: Tailwind CSS with custom design system
- State Management: Convex reactive queries
- PWA: Workbox for service workers
- Offline Storage: Convex offline support with IndexedDB

### 6.2 Backend
- Platform: Convex.dev
  - Authentication: Convex Auth with social providers
  - Database: Convex's transactional document store
  - Real-time: Built-in reactive queries and subscriptions
  - File Storage: Convex file storage
  - Functions: Convex mutations and actions
- Additional Services:
  - Payment processing: Stripe/MercadoPago integration
  - Email notifications: SendGrid/Resend

### 6.3 Infrastructure
- Hosting: Vercel (Next.js) + Convex cloud
- CDN: Vercel Edge Network
- Monitoring: Sentry, Convex dashboard
- CI/CD: GitHub Actions

### 6.4 Convex.dev Benefits
- **Real-time by default**: Live tournament updates without additional WebSocket configuration
- **Built-in offline support**: Automatic sync and conflict resolution
- **ACID transactions**: Ensures data consistency for scoring
- **Type-safe from DB to UI**: End-to-end TypeScript support
- **Automatic scaling**: Handles tournament day traffic spikes
- **Integrated auth**: Simplified user management
- **File storage**: For stage diagrams and tournament documents

## 7. User Interface Design

### 7.1 Design Philosophy
- **Dark Tactical Theme**: Military-inspired color palette (blacks, grays, tactical greens)
- **Retro Gaming Elements**: Pixel art icons, 8-bit sound effects, arcade-style animations
- **High Contrast**: Ensure readability in bright outdoor conditions
- **Minimalist Layout**: Focus on essential information

### 7.2 Key UI Components
- Tactical-style navigation with military stencil fonts
- Neon accent colors for interactive elements
- Radar-style animations for loading states
- Terminal-style data tables
- HUD-inspired dashboard layouts
- Achievement badges with metallic/holographic effects
- Social media-optimized card layouts
- QR codes with tactical frame designs

### 7.3 Mobile Interactions
- Swipe gestures for navigation
- Long-press for additional options
- Pull-to-refresh for sync
- Haptic feedback for actions

## 8. User Flow Examples

### 8.1 Security Officer Scoring Flow
1. Login → Tournament Selection
2. Stage Assignment Selection
3. Squad Check-in
4. Shooter Selection
5. String-by-string scoring with IDPA hit zones (-0, -1, -3, miss)
6. Penalty application
7. Review & Submit
8. Next Shooter / Squad Complete

### 8.2 Club Owner Tournament Creation
1. Dashboard → Create Tournament
2. Basic Information Entry
3. Squad Configuration (number, capacity, times)
4. Stage Creation/Import
5. Registration Settings
6. SO Assignment
7. Publish Tournament

### 8.3 Shooter Registration Flow
1. Calendar View → Browse Tournaments
2. Tournament Details → Check Requirements
3. View Squad Availability
4. Browse Squad Members (see who's registered)
5. Select Preferred Squad
6. Complete Registration & Payment
7. Receive Confirmation & Add to Calendar

## 9. Success Metrics

### 9.1 Adoption Metrics
- Number of clubs onboarded
- Active tournaments per month
- User retention rate
- Badge shares on social media

### 9.2 Performance Metrics
- Average scoring time per shooter
- System uptime percentage
- Sync success rate
- Real-time update latency

### 9.3 User Satisfaction
- App store ratings (target: 4.5+)
- NPS score (target: 50+)
- Support ticket volume
- Social engagement rate

### 9.4 Engagement Metrics
- Average badges earned per shooter
- Social media share rate
- Spectator mode usage
- Return shooter percentage

## 10. Implementation Roadmap

### Phase 1: MVP (3 months)
- Basic user management
- Tournament creation with squad configuration
- Tournament calendar and registration
- Squad selection with member visibility
- Essential IDPA scoring functionality (-0, -1, -3, miss)
- Offline capability foundation
- Convex integration setup

### Phase 2: Enhanced Features (2 months)
- Visual stage designer
- Real-time score tracking system
- Digital badge generation and sharing
- Push notification system
- Spectator mode with QR codes
- Advanced reporting
- Payment integration
- Performance optimizations
- Social media integration

### Phase 3: Scale & Polish (2 months)
- Multi-language support
- Advanced analytics
- Third-party integrations
- UI/UX refinements

### Phase 4: Expansion (Ongoing)
- Additional shooting sport support
- International market adaptation
- AI-powered features
- Community features

## 11. Risks & Mitigation

### 11.1 Technical Risks
- **Offline sync conflicts**: Implement robust conflict resolution
- **Performance on low-end devices**: Progressive enhancement strategy
- **Data loss**: Multiple backup strategies

### 11.2 Market Risks
- **Competitor adoption**: Focus on unique features and local market needs
- **Resistance to change**: Gradual rollout with training programs

## 12. Compliance & Regulations

### 12.1 IDPA Compliance
- Regular rulebook updates integration
- Official IDPA certification/endorsement pursuit
- Strict adherence to official divisions:
  - Stock Service Pistol (SSP)
  - Enhanced Service Pistol (ESP)
  - Custom Defensive Pistol (CDP)
  - Compact Carry Pistol (CCP)
  - Revolver (REV)
  - Back-Up Gun (BUG)
  - Pistol Caliber Carbine (PCC)
  - Carry Optics (CO)
- Proper classification system implementation:
  - Master (MA)
  - Expert (EX)
  - Sharpshooter (SS)
  - Marksman (MM)
  - Novice (NV)
  - Unclassified (UN)
- Accurate IDPA scoring system:
  - Points down: -0, -1, -3, miss (-5)
  - Procedural errors: 3 seconds
  - Hit on non-threat: 5 seconds
  - Time plus scoring: Raw time + (points down × 1 second) + penalties
- Custom categories must not conflict with official IDPA rules

### 12.2 Legal Compliance
- Argentine data protection laws
- Payment processing regulations
- Terms of service and privacy policy

## 13. Success Criteria

The product will be considered successful when:
1. 50+ clubs actively using the platform
2. 90% of users can complete scoring without training
3. 99% accuracy in IDPA score calculations
4. 95% user satisfaction rating
5. Full offline functionality with <1% sync failures
6. 80% of participants share badges on social media
7. <2 second latency for real-time score updates
8. 60% of shooters use live tracking during matches

## 14. Appendices

### A. IDPA Scoring Rules Reference

#### Points Down System
IDPA uses a "time plus" scoring system where accuracy penalties are added to the raw time:
- **Down Zero (-0)**: Perfect hits in the center scoring zones = 0 seconds added
- **Down One (-1)**: Hits in the -1 zone = 1 second added per hit
- **Down Three (-3)**: Hits in the -3 zone = 3 seconds added per hit
- **Miss (-5)**: Complete misses = 5 seconds added per miss

#### Penalty System
- **Procedural Error (PE)**: 3 seconds per infraction
- **Hit on Non-Threat (HNT)**: 5 seconds per hit
- **Failure to Neutralize (FTN)**: 5 seconds
- **Flagrant Penalty (FP)**: 10 seconds
- **Failure to Do Right (FTDR)**: 20 seconds

#### Score Calculation
Final Score = Raw Time + (Points Down × 1 second) + Penalties

Example:
- Raw time: 25.34 seconds
- Hits: 8 down zero, 3 down one, 1 down three
- Penalties: 1 procedural error
- Calculation: 25.34 + (0×8 + 1×3 + 3×1) + 3 = 25.34 + 6 + 3 = 34.34 seconds

### B. Technical Specifications
- API documentation outline
- Database schema overview

### C. Design System Documentation
- Color palette
- Typography guidelines
- Component library

### D. User Stories

#### D.1 Tournament Calendar User Stories

**As a Shooter:**
- I want to view upcoming tournaments in a calendar format so I can plan my competition schedule
- I want to filter tournaments by location so I can find events near me
- I want to filter by division so I only see relevant competitions
- I want to see squad availability at a glance so I can quickly identify tournaments I can join
- I want to add tournaments to my personal calendar so I don't miss registration deadlines
- I want to receive notifications about tournaments I'm interested in

**As a Club Owner:**
- I want my tournaments to appear automatically in the calendar when published
- I want to set registration open/close dates that are clearly visible in the calendar
- I want to see registration progress from the calendar view
- I want to highlight special tournaments or championships

#### D.2 Squad Selection User Stories

**As a Shooter:**
- I want to see all available squads with their current capacity (e.g., 5/10 slots filled)
- I want to view the list of shooters registered in each squad before choosing
- I want to see shooter classifications so I can choose squads with similar skill levels
- I want to identify my friends/clubmates in squad lists easily
- I want to join a squad with one click if space is available
- I want to join a waitlist if my preferred squad is full
- I want to receive notification if a spot opens in my waitlisted squad
- I want to save squad preferences for recurring tournaments

**As a Club Owner:**
- I want to set the number of squads for my tournament
- I want to define maximum capacity for each squad
- I want to assign specific time slots to each squad
- I want to manually move shooters between squads if needed
- I want to close/open specific squads as needed
- I want to see real-time squad fill rates

**As a Security Officer:**
- I want to see my assigned squad roster before the tournament
- I want to access shooter profiles to understand experience levels
- I want to mark shooters as checked-in on match day

#### D.3 Custom Category User Stories

**As a Club Owner:**
- I want to create custom award categories for my tournament (Ladies, Veterans, Law Enforcement, etc.)
- I want to define eligibility criteria for each custom category
- I want to see which registered shooters qualify for each category
- I want to configure awards/medals for each category
- I want to generate award certificates for category winners

**As a Shooter:**
- I want to see which custom categories I'm eligible for during registration
- I want to opt-in to compete in relevant categories (e.g., Ladies, Veterans)
- I want to see my ranking in both my division/class and any custom categories
- I want my achievements in custom categories reflected in my profile

**As an Admin:**
- I want to ensure custom categories don't conflict with official IDPA rules
- I want to monitor category usage across different clubs
- I want to generate reports on category participation

#### D.4 Real-time Tracking User Stories

**As a Shooter:**
- I want to see my scores immediately after the SO enters them
- I want to track my current position in real-time during the match
- I want to compare my performance against my personal best
- I want to see how I'm performing relative to my squad mates
- I want to receive notifications when my scores are posted
- I want to see my projected final ranking based on current performance
- I want spectators to follow my progress via QR code

**As a Security Officer:**
- I want shooters to see their scores immediately after I submit them
- I want to confirm scores are synced before moving to next shooter
- I want to see clear IDPA scoring zones (-0, -1, -3, miss) in the interface

**As a Spectator:**
- I want to follow specific shooters' progress in real-time
- I want to see live leaderboard updates
- I want to scan a QR code to follow a shooter

#### D.5 Digital Badge User Stories

**As a Shooter:**
- I want to receive digital badges for my achievements automatically
- I want to share my badges on social media with one click
- I want to customize badge captions before sharing
- I want to build a collection of badges over time
- I want my badges to be verifiable and tamper-proof
- I want to download high-resolution versions for printing
- I want to see badge rarity and how many others earned the same badge

**As a Club Owner:**
- I want to customize badge designs with our club branding
- I want to define special achievement criteria for badges
- I want to track social media engagement from badge shares
- I want to use badges as marketing tools for future tournaments

**As an Admin:**
- I want to ensure badge authenticity and prevent tampering
- I want to track badge distribution and sharing statistics
- I want to manage badge templates and designs

### E. Database Schema (Convex)

```typescript
// users.ts
export const users = defineTable({
  email: v.string(),
  name: v.string(),
  role: v.union(v.literal("admin"), v.literal("clubOwner"), v.literal("securityOfficer"), v.literal("shooter")),
  idpaMemberNumber: v.optional(v.string()),
  classifications: v.object({
    SSP: v.optional(v.union(v.literal("MA"), v.literal("EX"), v.literal("SS"), v.literal("MM"), v.literal("NV"), v.literal("UN"))),
    ESP: v.optional(v.union(v.literal("MA"), v.literal("EX"), v.literal("SS"), v.literal("MM"), v.literal("NV"), v.literal("UN"))),
    CDP: v.optional(v.union(v.literal("MA"), v.literal("EX"), v.literal("SS"), v.literal("MM"), v.literal("NV"), v.literal("UN"))),
    CCP: v.optional(v.union(v.literal("MA"), v.literal("EX"), v.literal("SS"), v.literal("MM"), v.literal("NV"), v.literal("UN"))),
    REV: v.optional(v.union(v.literal("MA"), v.literal("EX"), v.literal("SS"), v.literal("MM"), v.literal("NV"), v.literal("UN"))),
    BUG: v.optional(v.union(v.literal("MA"), v.literal("EX"), v.literal("SS"), v.literal("MM"), v.literal("NV"), v.literal("UN"))),
    PCC: v.optional(v.union(v.literal("MA"), v.literal("EX"), v.literal("SS"), v.literal("MM"), v.literal("NV"), v.literal("UN"))),
    CO: v.optional(v.union(v.literal("MA"), v.literal("EX"), v.literal("SS"), v.literal("MM"), v.literal("NV"), v.literal("UN"))),
  }),
  primaryDivision: v.optional(v.union(v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), v.literal("CCP"), v.literal("REV"), v.literal("BUG"), v.literal("PCC"), v.literal("CO"))),
  clubId: v.optional(v.id("clubs")),
  profilePicture: v.optional(v.string()),
  friends: v.array(v.id("users")),
  preferences: v.object({
    notifications: v.boolean(),
    defaultDivision: v.optional(v.string()),
    homeLocation: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
  }),
  demographics: v.optional(v.object({
    gender: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    isVeteran: v.optional(v.boolean()),
    isLawEnforcement: v.optional(v.boolean()),
  })),
  createdAt: v.number(),
  lastActive: v.number(),
})
.index("by_email", ["email"])
.index("by_role", ["role"])
.index("by_club", ["clubId"]);

// clubs.ts
export const clubs = defineTable({
  name: v.string(),
  ownerId: v.id("users"),
  location: v.object({
    address: v.string(),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
  }),
  contact: v.object({
    email: v.string(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
  }),
  logo: v.optional(v.string()),
  active: v.boolean(),
  createdAt: v.number(),
})
.index("by_owner", ["ownerId"])
.index("by_active", ["active"]);

// tournaments.ts
export const tournaments = defineTable({
  name: v.string(),
  clubId: v.id("clubs"),
  date: v.number(),
  registrationOpens: v.number(),
  registrationCloses: v.number(),
  location: v.object({
    venue: v.string(),
    address: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
  }),
  matchType: v.string(),
  divisions: v.array(v.union(
    v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), 
    v.literal("CCP"), v.literal("REV"), v.literal("BUG"), 
    v.literal("PCC"), v.literal("CO")
  )),
  customCategories: v.array(v.object({
    id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    eligibilityCriteria: v.optional(v.string()),
  })),
  entryFee: v.number(),
  currency: v.string(),
  capacity: v.number(),
  squadConfig: v.object({
    numberOfSquads: v.number(),
    maxShootersPerSquad: v.number(),
  }),
  status: v.union(v.literal("draft"), v.literal("published"), v.literal("active"), v.literal("completed")),
  description: v.optional(v.string()),
  rules: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_club", ["clubId"])
.index("by_date", ["date"])
.index("by_status", ["status"])
.index("by_registration_opens", ["registrationOpens"]);

// squads.ts
export const squads = defineTable({
  tournamentId: v.id("tournaments"),
  name: v.string(),
  timeSlot: v.string(),
  maxShooters: v.number(),
  currentShooters: v.number(),
  status: v.union(v.literal("open"), v.literal("full"), v.literal("closed")),
  assignedSO: v.optional(v.id("users")),
  createdAt: v.number(),
})
.index("by_tournament", ["tournamentId"])
.index("by_status", ["status"]);

// registrations.ts
export const registrations = defineTable({
  tournamentId: v.id("tournaments"),
  shooterId: v.id("users"),
  squadId: v.id("squads"),
  division: v.union(
    v.literal("SSP"), v.literal("ESP"), v.literal("CDP"), 
    v.literal("CCP"), v.literal("REV"), v.literal("BUG"), 
    v.literal("PCC"), v.literal("CO")
  ),
  classification: v.union(
    v.literal("MA"), v.literal("EX"), v.literal("SS"), 
    v.literal("MM"), v.literal("NV"), v.literal("UN")
  ),
  customCategories: v.array(v.string()), // IDs of custom categories
  status: v.union(v.literal("registered"), v.literal("waitlist"), v.literal("checked_in"), v.literal("completed"), v.literal("cancelled")),
  paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("refunded")),
  paymentId: v.optional(v.string()),
  registeredAt: v.number(),
  checkedInAt: v.optional(v.number()),
})
.index("by_tournament", ["tournamentId"])
.index("by_shooter", ["shooterId"])
.index("by_squad", ["squadId"])
.index("by_status", ["status"])
.index("by_division", ["tournamentId", "division"]);

// matchResults.ts
export const matchResults = defineTable({
  tournamentId: v.id("tournaments"),
  shooterId: v.id("users"),
  division: v.string(),
  classification: v.string(),
  customCategories: v.array(v.string()),
  totalTime: v.number(),
  totalPointsDown: v.number(),
  totalPenalties: v.number(),
  finalScore: v.number(), // totalTime + totalPointsDown + totalPenalties
  rankings: v.object({
    overallRank: v.number(),
    divisionRank: v.number(),
    classificationRank: v.number(),
    customCategoryRanks: v.array(v.object({
      categoryId: v.string(),
      rank: v.number(),
    })),
  }),
  stageRanks: v.array(v.object({
    stageId: v.id("stages"),
    rank: v.number(),
  })),
  awards: v.array(v.string()), // e.g., "Division Winner", "High Lady", etc.
  dq: v.boolean(),
  dnf: v.boolean(),
  calculatedAt: v.number(),
})
.index("by_tournament", ["tournamentId"])
.index("by_shooter", ["shooterId"])
.index("by_division", ["tournamentId", "division"])
.index("by_classification", ["tournamentId", "division", "classification"]);

// stages.ts
export const stages = defineTable({
  tournamentId: v.id("tournaments"),
  stageNumber: v.number(),
  name: v.string(),
  description: v.string(),
  diagram: v.object({
    elements: v.array(v.object({
      type: v.string(), // wall, target, fault_line, etc.
      position: v.object({ x: v.number(), y: v.number() }),
      rotation: v.number(),
      properties: v.any(),
    })),
    dimensions: v.object({
      width: v.number(),
      height: v.number(),
    }),
  }),
  strings: v.number(),
  roundCount: v.number(),
  scoringType: v.string(),
  parTime: v.optional(v.number()),
  createdAt: v.number(),
})
.index("by_tournament", ["tournamentId"])
.index("by_stage_number", ["tournamentId", "stageNumber"]);

// scores.ts
export const scores = defineTable({
  stageId: v.id("stages"),
  shooterId: v.id("users"),
  squadId: v.id("squads"),
  division: v.string(),
  classification: v.string(),
  scoredBy: v.id("users"),
  strings: v.array(v.object({
    time: v.number(),
    hits: v.object({
      down0: v.number(),  // -0 zone hits (perfect)
      down1: v.number(),  // -1 zone hits
      down3: v.number(),  // -3 zone hits
      miss: v.number(),   // -5 points (complete misses)
      nonThreat: v.number(), // -5 points per hit on non-threat
    }),
  })),
  penalties: v.object({
    procedural: v.number(),      // 3 seconds each
    nonThreat: v.number(),       // 5 seconds each
    failureToNeutralize: v.number(), // 5 seconds
    flagrant: v.number(),        // 10 seconds each
    ftdr: v.number(),            // 20 seconds (Failure to Do Right)
    other: v.array(v.object({
      type: v.string(),
      count: v.number(),
      seconds: v.number(),
      description: v.optional(v.string()),
    })),
  }),
  rawTime: v.number(),           // Total raw time for all strings
  pointsDown: v.number(),        // Total points down (0×down0 + 1×down1 + 3×down3 + 5×miss)
  penaltyTime: v.number(),       // Total penalty time in seconds
  finalTime: v.number(),         // rawTime + pointsDown + penaltyTime
  stagePoints: v.number(),       // Stage points for match scoring
  stageRank: v.optional(v.number()),
  dnf: v.boolean(),
  dq: v.boolean(),
  scoredAt: v.number(),
  syncedAt: v.optional(v.number()),
})
.index("by_stage_shooter", ["stageId", "shooterId"])
.index("by_squad", ["squadId"])
.index("by_scored_at", ["scoredAt"])
.index("by_division", ["stageId", "division"])
.searchIndex("search_scores", {
  searchField: "shooterId",
  filterFields: ["stageId", "squadId", "division"],
});

// badges.ts
export const badges = defineTable({
  shooterId: v.id("users"),
  tournamentId: v.id("tournaments"),
  type: v.union(
    v.literal("participation"),
    v.literal("division_winner"),
    v.literal("class_winner"),
    v.literal("category_winner"),
    v.literal("stage_winner"),
    v.literal("personal_best"),
    v.literal("clean_stage"),
    v.literal("top_10_percent"),
    v.literal("most_improved"),
    v.literal("high_overall")
  ),
  title: v.string(),
  description: v.string(),
  imageUrl: v.string(),
  thumbnailUrl: v.string(),
  metadata: v.object({
    division: v.optional(v.string()),
    classification: v.optional(v.string()),
    category: v.optional(v.string()),
    placement: v.optional(v.number()),
    score: v.optional(v.number()),
    stageNumber: v.optional(v.number()),
    improvement: v.optional(v.number()),
  }),
  verificationCode: v.string(),
  shareCount: v.number(),
  earnedAt: v.number(),
})
.index("by_shooter", ["shooterId"])
.index("by_tournament", ["tournamentId"])
.index("by_type", ["type"])
.index("by_earned_date", ["earnedAt"]);

// offlineQueue.ts
export const offlineQueue = defineTable({
  userId: v.id("users"),
  action: v.string(),
  data: v.any(),
  createdAt: v.number(),
  retries: v.number(),
  status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
  error: v.optional(v.string()),
})
.index("by_user", ["userId"])
.index("by_status", ["status"])
.index("by_created", ["createdAt"]);
```

### F. Wireframes

#### F.1 Tournament Calendar View
```
┌─────────────────────────────────────────────────────────┐
│ [☰] IDPA Tournament Manager           [@] [🔔] [👤]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [List] [Week] [Month]               [+ Create]        │
│                                                         │
│  < July 2025 >                       [Filter ▼]        │
│                                                         │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐         │
│  │ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │         │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤         │
│  │     │  1  │  2  │  3  │  4  │  5  │  6  │         │
│  │     │     │     │ ● │     │     │ ●●  │         │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤         │
│  │  7  │  8  │  9  │ 10  │ 11  │ 12  │ 13  │         │
│  │     │     │     │     │     │     │ ●●● │         │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘         │
│                                                         │
│  ┌─────────────────────────────────────────┐          │
│  │ Saturday, July 13                       │          │
│  ├─────────────────────────────────────────┤          │
│  │ 🎯 Buenos Aires IDPA Championship       │          │
│  │ 📍 BA Shooting Club - 5km away          │          │
│  │ 💰 $50 USD │ 👥 45/60 │ ⏰ Reg closes 7/10│        │
│  │ [View Details] [Quick Register]         │          │
│  └─────────────────────────────────────────┘          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### F.2 Squad Selection Interface
```
┌─────────────────────────────────────────────────────────┐
│ [←] Select Squad - BA Championship                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your Division: Stock Service Pistol (SSP)              │
│  Your Classification: Sharpshooter                      │
│                                                         │
│  ┌─────────────────────────────────────────┐          │
│  │ Squad A - 8:00 AM          [7/10] 👥    │          │
│  ├─────────────────────────────────────────┤          │
│  │ • John Doe (EX) ⭐                      │          │
│  │ • Maria Garcia (SS)                     │          │
│  │ • Carlos Rodriguez (MM) 🤝              │          │
│  │ • Ana Silva (NV)                        │          │
│  │ • Luis Martinez (SS)                    │          │
│  │ • Patricia Lopez (EX)                   │          │
│  │ • Roberto Sanchez (SS) 🤝               │          │
│  │                                         │          │
│  │ [Join Squad A]                          │          │
│  └─────────────────────────────────────────┘          │
│                                                         │
│  ┌─────────────────────────────────────────┐          │
│  │ Squad B - 9:30 AM         [10/10] 👥🔒  │          │
│  ├─────────────────────────────────────────┤          │
│  │ FULL - [Join Waitlist]                  │          │
│  └─────────────────────────────────────────┘          │
│                                                         │
│  ┌─────────────────────────────────────────┐          │
│  │ Squad C - 11:00 AM         [3/10] 👥    │          │
│  ├─────────────────────────────────────────┤          │
│  │ • Diego Fernandez (MA)                  │          │
│  │ • Isabella Gomez (SS) 🤝                │          │
│  │ • Miguel Torres (EX)                    │          │
│  │                                         │          │
│  │ [Join Squad C]                          │          │
│  └─────────────────────────────────────────┘          │
│                                                         │
│  Legend: ⭐ Friend │ 🤝 Clubmate │ EX/SS/MM/NV Class  │
└─────────────────────────────────────────────────────────┘
```

#### F.3 Security Officer Scoring Interface
```
┌─────────────────────────────────────────────────────────┐
│ [←] Stage 3 - The Office                   Squad: Alpha │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Shooter: Maria Garcia (SSP/SS)           [4 of 10]    │
│                                                         │
│  ┌─────────────────────────────────────────┐          │
│  │           STRING 1 OF 2                  │          │
│  ├─────────────────────────────────────────┤          │
│  │                                          │          │
│  │  Time: [  23.45  ] seconds               │          │
│  │                                          │          │
│  │  ┌──────────────┐  ┌──────────────┐     │          │
│  │  │      T1      │  │      T2      │     │          │
│  │  │  ┌────────┐  │  │  ┌────────┐  │     │          │
│  │  │  │   -0   │  │  │  │   -0   │  │     │          │
│  │  │  │  [ 2 ] │  │  │  │  [ 2 ] │  │     │          │
│  │  │  └────────┘  │  │  └────────┘  │     │          │
│  │  │    -1 [ 0 ]  │  │    -1 [ 0 ]  │     │          │
│  │  │    -3 [ 0 ]  │  │    -3 [ 0 ]  │     │          │
│  │  │  Miss [ 0 ]  │  │  Miss [ 0 ]  │     │          │
│  │  └──────────────┘  └──────────────┘     │          │
│  │                                          │          │
│  │  ┌──────────────┐  ┌──────────────┐     │          │
│  │  │      T3      │  │   NT1 (HNT)  │     │          │
│  │  │  ┌────────┐  │  │  ┌────────┐  │     │          │
│  │  │  │   -0   │  │  │  │  HITS  │  │     │          │
│  │  │  │  [ 1 ] │  │  │  │  [ 0 ] │  │     │          │
│  │  │  └────────┘  │  │  └────────┘  │     │          │
│  │  │    -1 [ 1 ]  │  │              │     │          │
│  │  │    -3 [ 0 ]  │  │  Non-Threat  │     │          │
│  │  │  Miss [ 0 ]  │  │              │     │          │
│  │  └──────────────┘  └──────────────┘     │          │
│  │                                          │          │
│  │  Penalties:                              │          │
│  │  [ ] Procedural Error (3 sec)           │          │
│  │  [ ] Failure to Neutralize (5 sec)      │          │
│  │  [ ] Flagrant Penalty (10 sec)          │          │
│  │                                          │          │
│  └─────────────────────────────────────────┘          │
│                                                         │
│  String Score: 24.45 sec (Time: 23.45 + PD: 1)        │
│                                                         │
│  [Clear] [Next String →]                                │
└─────────────────────────────────────────────────────────┘
```

#### F.4 Match Results View
```
┌─────────────────────────────────────────────────────────┐
│ [☰] Match Results - BA Championship                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Overall] [By Division] [By Class] [Custom]           │
│                                                         │
│  Division: [All ▼]  Class: [All ▼]  Category: [All ▼] │
│                                                         │
│  ┌─────────────────────────────────────────┐          │
│  │ STOCK SERVICE PISTOL (SSP)              │          │
│  ├─────────────────────────────────────────┤          │
│  │ Master (MA)                             │          │
│  │ 🥇 1. John Doe         245.67 (100%)   │          │
│  │ 🥈 2. Carlos Lopez     251.34 (97.8%)  │          │
│  │ 🥉 3. Maria Garcia     253.21 (96.9%)  │          │
│  │                                         │          │
│  │ Expert (EX)                             │          │
│  │ 🥇 1. Ana Silva        267.89 (100%)   │          │
│  │ 🥈 2. Luis Martinez    271.45 (98.7%)  │          │
│  │ 🥉 3. Patricia Chen    275.12 (97.3%)  │          │
│  └─────────────────────────────────────────┘          │
│                                                         │
│  ┌─────────────────────────────────────────┐          │
│  │ CUSTOM CATEGORIES                        │          │
│  ├─────────────────────────────────────────┤          │
│  │ 🏆 High Lady: Ana Silva (SSP/EX)       │          │
│  │ 🏆 High Veteran: Roberto Sanchez (CDP) │          │
│  │ 🏆 High Senior: Miguel Torres (REV)    │          │
│  └─────────────────────────────────────────┘          │
│                                                         │
│  [📥 Download PDF] [📊 Export Excel]                   │
└─────────────────────────────────────────────────────────┘
```

#### F.5 Real-time Shooter Dashboard (Mobile)
```
┌─────────────────────────────────┐
│ [☰] Live Match Tracking     [🔔] │
├─────────────────────────────────┤
│                                 │
│  BA Championship 2025           │
│  Your Position: 12/45 Overall   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │     CURRENT STANDINGS       │ │
│ │ Division (ESP): 3rd of 12   │ │
│ │ Class (SS): 2nd of 8        │ │
│ │ ▲ +2 positions from Stage 3 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │    STAGE BREAKDOWN          │ │
│ │ ✓ Stage 1: 45.23s (5th)    │ │
│ │ ✓ Stage 2: 38.91s (3rd) 🏆 │ │
│ │ ✓ Stage 3: 52.14s (4th)    │ │
│ │ ⏳ Stage 4: Waiting...      │ │
│ │ ○ Stage 5: Not started     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  PERFORMANCE METRICS        │ │
│ │ Total Time: 136.28s         │ │
│ │ Points Down: 12             │ │
│ │ Penalties: 3s (1 PE)        │ │
│ │ Accuracy: 94%               │ │
│ │ vs Personal Best: -2.4s 🎯  │ │
│ └─────────────────────────────┘ │
│                                 │
│ [🔗 Share Progress] [📊 Details]│
└─────────────────────────────────┘
```

#### F.6 Digital Badge Share Screen
```
┌─────────────────────────────────┐
│ [←] Your Achievement Badge      │
├─────────────────────────────────┤
│                                 │
│   ┌─────────────────────────┐   │
│   │    [IDPA LOGO]          │   │
│   │                         │   │
│   │    🏆 3RD PLACE 🏆      │   │
│   │                         │   │
│   │   ENHANCED SERVICE      │   │
│   │   PISTOL - EXPERT       │   │
│   │                         │   │
│   │   MARIA GARCIA          │   │
│   │                         │   │
│   │  BA Championship 2025   │   │
│   │   July 13, 2025         │   │
│   │                         │   │
│   │ [QR CODE] Verify: A3X7K │   │
│   └─────────────────────────┘   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📝 Add Caption:            │ │
│ │ "3rd place ESP Expert! 🎯  │ │
│ │  Great match at BA Champ   │ │
│ │  #IDPA #IDPAArgentina"     │ │
│ └─────────────────────────────┘ │
│                                 │
│ Share to:                       │
│ [Instagram] [Facebook] [X]      │
│ [WhatsApp] [Download HD]        │
│                                 │
│ ✓ Include match link            │
│ ✓ Tag @IDPAArgentina           │
└─────────────────────────────────┘
```

### G. API Specifications (Convex Functions)

#### G.1 Tournament Calendar APIs

```typescript
// convex/tournaments.ts

// List tournaments with filtering
export const listTournaments = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    division: v.optional(v.string()),
    maxDistance: v.optional(v.number()),
    userLocation: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    clubId: v.optional(v.id("clubs")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Query tournaments based on filters
    // Calculate distance if userLocation provided
    // Return tournaments with registration counts
  },
});

// Get tournament details with squad availability
export const getTournamentDetails = query({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    // Fetch tournament
    // Fetch all squads with current capacity
    // Calculate registration stats
    // Return comprehensive tournament data
  },
});

// Quick registration check
export const checkRegistrationAvailability = query({
  args: {
    tournamentId: v.id("tournaments"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if registration is open
    // Check if user already registered
    // Check available squads
    // Return availability status
  },
});
```

#### G.2 Squad Management APIs

```typescript
// convex/squads.ts

// Get squads with member details
export const getSquadsWithMembers = query({
  args: {
    tournamentId: v.id("tournaments"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Fetch all squads for tournament
    // For each squad, fetch registered members
    // Include friend/clubmate indicators if userId provided
    // Return squads with detailed member info
  },
});

// Join squad
export const joinSquad = mutation({
  args: {
    squadId: v.id("squads"),
    shooterId: v.id("users"),
    division: v.string(),
    classification: v.string(),
    customCategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check squad capacity
    // Validate division/classification
    // Create registration
    // Update squad count
    // Send confirmation notification
  },
});

// Join waitlist
export const joinWaitlist = mutation({
  args: {
    squadId: v.id("squads"),
    shooterId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Add to waitlist
    // Set up notification trigger
  },
});

// Transfer squad
export const requestSquadTransfer = mutation({
  args: {
    registrationId: v.id("registrations"),
    targetSquadId: v.id("squads"),
  },
  handler: async (ctx, args) => {
    // Check target squad capacity
    // Process transfer
    // Update counts
    // Notify shooter
  },
});
```

#### G.3 Scoring APIs

```typescript
// convex/scoring.ts

// Submit stage score
export const submitScore = mutation({
  args: {
    stageId: v.id("stages"),
    shooterId: v.id("users"),
    squadId: v.id("squads"),
    strings: v.array(v.object({
      time: v.number(),
      hits: v.object({
        down0: v.number(),  // -0 hits
        down1: v.number(),  // -1 hits
        down3: v.number(),  // -3 hits
        miss: v.number(),   // misses
        nonThreat: v.number(), // hit on non-threat
      }),
    })),
    penalties: v.object({
      procedural: v.number(),
      nonThreat: v.number(),
      failureToNeutralize: v.number(),
      flagrant: v.number(),
      ftdr: v.number(),
      other: v.array(v.object({
        type: v.string(),
        count: v.number(),
        seconds: v.number(),
        description: v.optional(v.string()),
      })),
    }),
  },
  handler: async (ctx, args) => {
    // Calculate IDPA score:
    // 1. Sum raw times from all strings
    // 2. Calculate points down: (down1 × 1) + (down3 × 3) + (miss × 5)
    // 3. Calculate penalty time from all penalties
    // 4. Final time = raw time + points down + penalty time
    // Store score and update rankings
  },
});

// Get stage scores
export const getStageScores = query({
  args: {
    stageId: v.id("stages"),
    division: v.optional(v.string()),
    classification: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Fetch scores for stage
    // Filter by division/classification if provided
    // Calculate rankings
    // Return sorted results
  },
});
```

#### G.4 Results APIs

```typescript
// convex/results.ts

// Calculate match results
export const calculateMatchResults = mutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    // For each shooter:
    // 1. Sum all stage times (raw + points down + penalties)
    // 2. Calculate stage points
    // 3. Determine rankings by division/classification
    // 4. Calculate custom category rankings
    // Store final results
  },
});

// Get live results
export const getLiveResults = query({
  args: {
    tournamentId: v.id("tournaments"),
    division: v.optional(v.string()),
    classification: v.optional(v.string()),
    customCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Fetch current scores
    // Calculate rankings using IDPA scoring
    // Return sorted results
  },
});

// Get final results
export const getFinalResults = query({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    // Fetch all match results
    // Group by division, classification, custom categories
    // Include award winners
    // Return comprehensive results object
  },
});
```

#### G.5 Custom Categories & Awards APIs

```typescript
// convex/categories.ts

// Create custom category
export const createCustomCategory = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    name: v.string(),
    description: v.optional(v.string()),
    eligibilityCriteria: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate club owner permissions
    // Create category
    // Return category ID
  },
});

// Get eligible shooters for category
export const getEligibleShooters = query({
  args: {
    tournamentId: v.id("tournaments"),
    categoryId: v.string(),
  },
  handler: async (ctx, args) => {
    // Based on category criteria
    // Return list of eligible registered shooters
  },
});

// Calculate awards
export const calculateAwards = action({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    // Calculate division winners
    // Calculate classification winners per division
    // Calculate custom category winners
    // Store in matchResults
    // Return award assignments
  },
});
```

#### G.6 Social Features APIs

```typescript
// convex/social.ts

// Get shooter profile
export const getShooterProfile = query({
  args: {
    shooterId: v.id("users"),
    requesterId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Fetch user details
    // Include match history
    // Check friend status if requesterId provided
    // Return profile data
  },
});

// Add friend
export const addFriend = mutation({
  args: {
    userId: v.id("users"),
    friendId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Add friend connection
    // Send notification
  },
});

// Get squad recommendations
export const getSquadRecommendations = query({
  args: {
    tournamentId: v.id("tournaments"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Find squads with friends
    // Find squads with similar skill level
    // Sort by recommendation score
    // Return top recommendations
  },
});
```

#### G.7 Real-time Tracking APIs

```typescript
// convex/liveTracking.ts

// Subscribe to live scores
export const subscribeLiveScores = query({
  args: {
    shooterId: v.id("users"),
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    // Return real-time score updates
    // Calculate current positions
    // Compare with personal best
    // Return performance metrics
  },
});

// Get shooter performance dashboard
export const getPerformanceDashboard = query({
  args: {
    shooterId: v.id("users"),
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    // Fetch all scores for shooter
    // Calculate rankings (overall/division/class)
    // Stage-by-stage breakdown with IDPA scoring
    // Performance trends
    // Return comprehensive dashboard data
  },
});

// Generate spectator link
export const generateSpectatorLink = mutation({
  args: {
    shooterId: v.id("users"),
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    // Generate unique QR code
    // Create shareable link
    // Set permissions for viewing
    // Return QR code and link
  },
});
```

#### G.8 Badge System APIs

```typescript
// convex/badges.ts

// Generate achievement badge
export const generateBadge = action({
  args: {
    shooterId: v.id("users"),
    tournamentId: v.id("tournaments"),
    achievementType: v.string(),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    // Determine badge design based on achievement
    // Generate badge image with Canvas API
    // Include verification code
    // Upload to storage
    // Create badge record
    // Return badge URLs
  },
});

// Get shooter badges
export const getShooterBadges = query({
  args: {
    shooterId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Fetch all badges for shooter
    // Group by tournament/type
    // Calculate badge statistics
    // Return badge collection
  },
});

// Share badge to social
export const shareBadge = action({
  args: {
    badgeId: v.id("badges"),
    platform: v.string(),
    caption: v.optional(v.string()),
    includeMatchLink: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Format badge for platform
    // Generate social media card
    // Add watermark and verification
    // Track share count
    // Return formatted content
  },
});

// Verify badge authenticity
export const verifyBadge = query({
  args: {
    verificationCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Lookup badge by code
    // Verify authenticity
    // Return badge details and match results
  },
});
```

### H. Badge Design Templates

#### H.1 Badge Types and Visual Design

##### Participation Badge
- **Design**: Tournament logo centered with date
- **Colors**: Club colors with IDPA blue accent
- **Elements**: Shooter name, division, classification
- **Size**: 1080x1080px (Instagram), 1080x1920px (Stories)

##### Achievement Badges
- **Division Winner**: Gold/Silver/Bronze metallic effect
- **Stage Winner**: Stage number with star burst effect
- **Personal Best**: Speedometer/timer graphic
- **Clean Stage**: Green checkmark with "NO PENALTIES"
- **Top 10%**: Elite badge with percentage display

##### Special Recognition
- **High Overall**: Diamond-shaped badge with holographic effect
- **Most Improved**: Upward arrow with improvement percentage
- **Category Winner**: Custom category name prominently displayed

#### H.2 Badge Components

1. **Header Section**
   - IDPA official logo (with permission)
   - Tournament name and date
   - Club logo

2. **Main Achievement Area**
   - Achievement title (large, bold)
   - Visual representation (medal, trophy, icon)
   - Specific details (time, score, placement)

3. **Shooter Information**
   - Name
   - Division and Classification
   - IDPA member number (optional)

4. **Footer Section**
   - QR code for verification
   - Unique verification code
   - Social media handles

5. **Security Features**
   - Watermark pattern
   - Unique serial number
   - Digital signature

### I. Push Notification Strategy

#### I.1 Notification Types

##### Pre-Tournament
- Registration confirmation
- Squad assignment
- Tournament reminders (24h, 1h before)
- Weather updates
- Stage briefing availability

##### During Tournament
- Squad call to staging
- Score posted notifications
- Real-time position updates
- Stage completion alerts
- Friend/squad mate achievements

##### Post-Tournament
- Final results available
- Badge earned notifications
- Award announcements
- Photos/videos available
- Next tournament suggestions

#### I.2 Notification Preferences

Users can customize:
- Notification frequency
- Types of notifications
- Quiet hours
- Friend activity alerts
- Performance milestone alerts

### J. Spectator Mode Design

#### J.1 Access Methods

##### QR Code Scanning
- Unique QR per shooter
- Displayed on shooter profile
- Time-limited access (match duration)
- Read-only permissions

##### Direct Link Sharing
- Shareable URL
- Optional password protection
- Analytics tracking
- Social media optimized preview

#### J.2 Spectator Features

##### Live Dashboard
- Current stage and position
- Real-time score updates
- Stage-by-stage breakdown
- Projected finish time
- Position changes alerts

##### Performance View
- Shot-by-shot details (if available)
- Penalty explanations
- Comparison with other shooters
- Historical performance

##### Social Features
- Cheer/support reactions
- Share moments
- Comment on performance
- Follow multiple shooters

#### J.3 Data Restrictions

Spectators can see:
- Live scores and times
- Current rankings
- Stage progression
- Public profile information

Spectators cannot see:
- Other shooters' personal data
- Squad assignments (privacy)
- Payment information
- Private messages

---

*Document Version: 2.4*  
*Last Updated: July 13, 2025*  
*Next Review: October 13, 2025*

### Version History:
- v1.0: Initial PRD with core features
- v1.1: Added tournament calendar and squad selection features
- v2.0: Added user stories, database schema, wireframes, and API specifications
- v2.1: Added IDPA divisions/classifications and custom category support
- v2.2: Added real-time score tracking and digital badge system
- v2.3: Added badge design templates, push notification strategy, and spectator mode design
- v2.4: **Corrected scoring system from IPSC (Alpha/Charlie/Delta) to IDPA points down system (-0, -1, -3, miss)**
  - Updated all scoring references throughout document
  - Modified database schema to use IDPA scoring fields
  - Updated wireframes to show IDPA scoring interface
  - Revised API specifications for IDPA score calculations
  - Added detailed IDPA scoring rules reference in Appendix A