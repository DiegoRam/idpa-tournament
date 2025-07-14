# IDPA Tournament App - Manual Testing Guide

This comprehensive guide provides step-by-step instructions for manually testing all features of the IDPA Tournament Management System before production deployment.

## Table of Contents
1. [Pre-Test Setup](#pre-test-setup)
2. [Authentication Testing](#authentication-testing)
3. [Club Management Testing](#club-management-testing)
4. [Tournament Creation Testing](#tournament-creation-testing)
5. [Shooter Registration Testing](#shooter-registration-testing)
6. [Squad Management Testing](#squad-management-testing)
7. [Scoring System Testing](#scoring-system-testing)
8. [Live Features Testing](#live-features-testing)
9. [Badge System Testing](#badge-system-testing)
10. [Admin Features Testing](#admin-features-testing)
11. [Offline Testing](#offline-testing)
12. [Mobile & PWA Testing](#mobile--pwa-testing)
13. [Internationalization Testing](#internationalization-testing)
14. [Accessibility Testing](#accessibility-testing)
15. [Performance Testing](#performance-testing)

---

## Pre-Test Setup

### Environment Setup
1. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

2. **Verify Convex is running:**
   - Check the terminal for Convex connection messages
   - The Convex dashboard should be accessible

3. **Clear browser data:**
   - Clear localStorage, cookies, and cache
   - Use incognito/private mode for clean testing

### Test Data Requirements
You'll create the following test users:
- **Admin User**: Full system access
- **Club Owner**: Can create tournaments
- **Security Officer**: Can score matches
- **Shooter**: Regular participant

---

## Authentication Testing

### Test 1.1: Registration Flow

**As a new user:**
1. Navigate to `http://localhost:3000`
2. Click "Register (Coming Soon)" button
3. **On Registration Page:**
   - Fill in the form:
     - Name: "Test Shooter"
     - Email: "shooter@test.com"
     - Password: "TestPass123!"
     - Role: Shooter
     - IDPA Member Number: "A123456"
     - Primary Division: SSP
     - Classification: MM
   - Click "Create Account"
   
**Expected Results:**
- ✅ Form validation works (try empty fields, invalid email)
- ✅ Password strength indicator shows
- ✅ Successful registration redirects to dashboard
- ✅ User profile shows correct information

**Repeat for other roles:**
- **Club Owner**: email: "clubowner@test.com", role: Club Owner
- **Security Officer**: email: "so@test.com", role: Security Officer
- **Admin**: email: "admin@test.com", role: Admin

### Test 1.2: Login Flow

1. **Logout** (click profile icon → Logout)
2. Navigate to `/login`
3. **Test invalid credentials:**
   - Email: "wrong@test.com"
   - Password: "wrongpass"
   - Should show error message
4. **Test valid credentials:**
   - Email: "shooter@test.com"
   - Password: "TestPass123!"
   - Should redirect to dashboard

**Expected Results:**
- ✅ Invalid login shows error
- ✅ Valid login redirects to appropriate dashboard
- ✅ "Remember me" functionality works
- ✅ Protected routes redirect to login when not authenticated

---

## Club Management Testing

### Test 2.1: Create a Club (As Club Owner)

1. **Login as Club Owner**
2. Navigate to dashboard
3. Click "Create Club" or go to `/clubs/create`
4. **Fill in club details:**
   - Club Name: "Test Shooting Club"
   - Description: "Premier IDPA club for testing"
   - Location:
     - Address: "123 Range Road, Buenos Aires"
     - Coordinates: -34.6037, -58.3816
   - Contact Email: "info@testclub.com"
   - Contact Phone: "+54 11 1234-5678"
   - Website: "https://testclub.com"
   - Range Facilities: Check all available
   - Max Concurrent Squads: 8
   
5. Click "Create Club"

**Expected Results:**
- ✅ Form validation works
- ✅ Club created successfully
- ✅ Redirects to club management page
- ✅ Club appears in user's profile

---

## Tournament Creation Testing

### Test 3.1: Create a Tournament (As Club Owner)

1. Navigate to `/tournaments/create`
2. **Step 1 - Basic Info:**
   - Name: "Test Championship 2024"
   - Match Type: "Monthly Match"
   - Entry Fee: 5000 ARS
   - Capacity: 80
   - Click "Next"
   
3. **Step 2 - Dates & Location:**
   - Tournament Date: (Select date 2 weeks from today)
   - Registration Opens: (Tomorrow)
   - Registration Closes: (1 week from today)
   - Venue: "Test Shooting Club Range"
   - Address: (Should auto-fill from club)
   - Click "Next"
   
4. **Step 3 - Divisions & Categories:**
   - Select divisions: SSP, ESP, CDP, CO
   - Add custom category:
     - Name: "Ladies"
     - Description: "Female shooters"
   - Click "Next"
   
5. **Step 4 - Capacity & Squads:**
   - Number of Squads: 8
   - Max Shooters per Squad: 10
   - Verify total capacity: 80
   - Click "Next"
   
6. **Step 5 - Rules & Description:**
   - Description: "Monthly IDPA match with standard rules"
   - Rules: "Standard IDPA rules apply. Cold range."
   - Click "Next"
   
7. **Step 6 - Review:**
   - Review all information
   - Click "Save Draft"
   - Then click "Save & Publish"

**Expected Results:**
- ✅ Multi-step form navigation works
- ✅ Validation prevents invalid configurations
- ✅ Tournament created in draft status
- ✅ Publishing makes tournament visible
- ✅ Squads auto-generated (Squad A through H)

### Test 3.2: Edit Tournament

1. Go to `/tournaments`
2. Find your tournament and click "Manage"
3. Click "Edit Tournament"
4. Change capacity to 100
5. Save changes

**Expected Results:**
- ✅ Can only edit draft tournaments
- ✅ Changes save correctly
- ✅ Squad capacity updates automatically

---

## Shooter Registration Testing

### Test 4.1: Browse Tournaments (As Shooter)

1. **Login as Shooter**
2. Navigate to `/tournaments`
3. **Test filters:**
   - Filter by division (SSP)
   - Filter by date range
   - Search by name
   
**Expected Results:**
- ✅ All published tournaments visible
- ✅ Filters work correctly
- ✅ Shows capacity and registration status

### Test 4.2: Register for Tournament

1. Click on "Test Championship 2024"
2. Click "Register for Tournament"
3. **On registration page:**
   - Verify your profile info is pre-filled
   - Division: SSP (from profile)
   - Classification: MM
   - Select custom category: "None" or "Ladies" if applicable
   - Click "Continue to Squad Selection"
   
4. **Squad Selection:**
   - View different squads
   - Notice member visibility features:
     - See other registered shooters
     - Friend indicators (if any)
     - Club mate indicators
   - Select "Squad B"
   - Click "Confirm Registration"
   
5. **Payment (if applicable):**
   - Select payment method
   - Complete registration

**Expected Results:**
- ✅ Registration form pre-fills from profile
- ✅ Can see squad members before joining
- ✅ Squad capacity updates in real-time
- ✅ Success page shows registration details
- ✅ Receive confirmation (push notification if enabled)

---

## Squad Management Testing

### Test 5.1: Assign Security Officers (As Club Owner)

1. Navigate to your tournament
2. Go to "Squads" tab
3. For Squad A:
   - Click "Assign SO"
   - Search for SO user
   - Select and confirm
   
**Expected Results:**
- ✅ Only users with SO role appear in list
- ✅ Assignment saves correctly
- ✅ SO name appears on squad card

### Test 5.2: Squad Time Slots

1. For each squad:
   - Click "Edit"
   - Set time slot (e.g., "8:00 AM", "9:30 AM", etc.)
   - Save
   
**Expected Results:**
- ✅ Time slots save correctly
- ✅ Displayed on squad selection for shooters

---

## Scoring System Testing

### Test 6.1: Create Stages (As Admin/Club Owner)

1. Navigate to tournament → "Scoring" → "Manage Stages"
2. Click "Add Stage"
3. **Create Stage 1:**
   - Name: "Quick Draw"
   - Description: "18 rounds, 3 strings"
   - Strings: 3
   - Round Count: 18
   - Par Time: 15 seconds
   
4. **Use Stage Designer:**
   - Click "Design Stage"
   - Add elements:
     - 3 IDPA targets
     - 2 walls for cover
     - 1 fault line
     - Start position
   - Save design
   
5. Repeat for 2 more stages

**Expected Results:**
- ✅ Stages created successfully
- ✅ Visual designer works smoothly
- ✅ Can drag and rotate elements
- ✅ Grid snap works

### Test 6.2: Score Entry (As Security Officer)

1. **Login as SO**
2. Navigate to `/scoring`
3. Select tournament where you're assigned
4. **By Squad view:**
   - Click on your assigned squad
   - Select a shooter
   - Select Stage 1
   
5. **Enter scores:**
   - String 1:
     - Time: 5.23 seconds
     - Hits: 6 down-0
   - String 2:
     - Time: 4.87 seconds
     - Hits: 5 down-0, 1 down-1
   - String 3:
     - Time: 5.45 seconds
     - Hits: 4 down-0, 2 down-1
   - Penalties: 1 Procedural
   - Click "Save Score"
   
6. **Test offline scoring:**
   - Turn off WiFi/internet
   - Enter another score
   - Should queue for sync
   - Turn internet back on
   - Should auto-sync

**Expected Results:**
- ✅ Score calculations correct (15.55 + 2 + 3 = 20.55)
- ✅ Can only score assigned squads
- ✅ Offline scoring queues properly
- ✅ Sync indicator shows status

### Test 6.3: Score Conflicts

1. Have two SOs score the same shooter/stage
2. Enter different scores
3. System should detect conflict
4. Resolve by selecting correct score

**Expected Results:**
- ✅ Conflict detected and shown
- ✅ Can compare and resolve
- ✅ Resolution saves correctly

---

## Live Features Testing

### Test 7.1: Live Leaderboard

1. Navigate to tournament → "Live Leaderboard"
2. **Test features:**
   - Overall rankings
   - Filter by division (SSP)
   - Filter by classification (MM)
   - Watch scores update in real-time
   
**Expected Results:**
- ✅ Leaderboard updates without refresh
- ✅ Shows completion progress
- ✅ Rank changes show indicators
- ✅ DNF/DQ status displays correctly

### Test 7.2: Spectator Mode

1. From tournament page, click "Follow Live"
2. Note the URL with tournament ID
3. Open in another browser/incognito
4. Should see live updates without login

**Expected Results:**
- ✅ Public URL works without auth
- ✅ Shows live scores and progress
- ✅ Mobile-optimized view
- ✅ QR code generation works

---

## Badge System Testing

### Test 8.1: Earn Badges

Complete actions to earn badges:
1. **First Tournament Badge:**
   - Complete scoring for all stages
   - Badge should auto-generate
   
2. **Division Winner Badge:**
   - Be top scorer in division
   - Badge generates after tournament completion

### Test 8.2: View and Share Badges

1. Navigate to `/badges`
2. View your badge collection
3. Click on a badge
4. Test sharing:
   - Download image
   - Share to social (Instagram, Twitter)
   - Verify QR code

**Expected Results:**
- ✅ Badges display correctly
- ✅ Different formats available
- ✅ QR code links to verification
- ✅ Social sharing has correct metadata

---

## Admin Features Testing

### Test 9.1: User Management (As Admin)

1. **Login as Admin**
2. Navigate to `/admin/users`
3. **Test features:**
   - Search users by name/email
   - Filter by role
   - Edit user (change role)
   - Suspend user account
   - View user activity
   
**Expected Results:**
- ✅ All users visible
- ✅ Can modify user roles
- ✅ Activity logs show actions
- ✅ Bulk actions work

### Test 9.2: System Analytics

1. Navigate to `/admin`
2. **Review dashboards:**
   - System health metrics
   - Active users graph
   - Tournament statistics
   - Performance metrics
   
**Expected Results:**
- ✅ Real-time data updates
- ✅ Graphs render correctly
- ✅ Can export reports
- ✅ Date range filters work

### Test 9.3: Match Director Center

1. Find active tournament
2. Access Match Director controls
3. **Test emergency actions:**
   - DQ a shooter
   - Pause scoring
   - Make announcements
   
**Expected Results:**
- ✅ Actions take effect immediately
- ✅ Notifications sent to affected users
- ✅ Audit trail created

---

## Offline Testing

### Test 10.1: PWA Offline Functionality

1. **Install PWA:**
   - Click install prompt in browser
   - Or use browser menu → "Install app"
   
2. **Test offline scoring:**
   - Open installed PWA
   - Turn on airplane mode
   - Navigate to scoring page
   - Enter scores
   - Check sync queue indicator
   
3. **Test offline viewing:**
   - Browse previously loaded pages
   - Verify cached data displays
   
4. **Restore connection:**
   - Turn off airplane mode
   - Watch sync queue process
   - Verify all data synced

**Expected Results:**
- ✅ PWA installs correctly
- ✅ Offline indicator shows
- ✅ Can score while offline
- ✅ Sync queue visible
- ✅ Auto-sync when online
- ✅ No data loss

---

## Mobile & PWA Testing

### Test 11.1: Mobile Responsiveness

Test on actual mobile device or browser dev tools:

1. **Test all major pages:**
   - Home page
   - Registration/Login
   - Tournament list
   - Squad selection
   - Scoring interface
   - Leaderboard
   
2. **Test orientations:**
   - Portrait mode
   - Landscape mode
   - Rotation during use

**Expected Results:**
- ✅ All layouts responsive
- ✅ Touch targets adequate size
- ✅ No horizontal scroll
- ✅ Modals/dialogs fit screen
- ✅ Virtual keyboard doesn't break layout

### Test 11.2: PWA Features

1. **App-like experience:**
   - Status bar color matches
   - No browser UI
   - Smooth transitions
   
2. **Push notifications:**
   - Enable notifications
   - Trigger test notification
   - Verify delivery

**Expected Results:**
- ✅ Feels like native app
- ✅ Push notifications work
- ✅ App icon on home screen
- ✅ Splash screen shows

---

## Internationalization Testing

### Test 12.1: Language Switching

1. **Find language selector** (header or settings)
2. **Switch to Spanish:**
   - All UI text changes
   - IDPA terms translated correctly
   - Dates/numbers formatted for locale
   
3. **Test key areas in Spanish:**
   - Registration form
   - Tournament creation
   - Scoring interface
   - Error messages

**Expected Results:**
- ✅ Complete Spanish translation
- ✅ No missing translations
- ✅ Language persists on refresh
- ✅ RTL support (if applicable)

### Test 12.2: Content in Multiple Languages

1. Create content in Spanish
2. Switch to English
3. Verify user content remains in original language

**Expected Results:**
- ✅ UI language separate from content
- ✅ Can mix languages appropriately

---

## Accessibility Testing

### Test 13.1: Keyboard Navigation

1. **Put mouse away**
2. **Use only keyboard:**
   - Tab through all elements
   - Enter/Space activate buttons
   - Escape closes modals
   - Arrow keys in menus
   
3. **Test key workflows:**
   - Complete registration
   - Navigate tournament
   - Enter score

**Expected Results:**
- ✅ All interactive elements reachable
- ✅ Focus indicators visible
- ✅ Skip navigation works
- ✅ No keyboard traps

### Test 13.2: Screen Reader

1. **Enable screen reader** (NVDA, JAWS, or VoiceOver)
2. **Test announcements:**
   - Page titles
   - Form labels
   - Error messages
   - Live regions (scores)
   
**Expected Results:**
- ✅ All content readable
- ✅ ARIA labels appropriate
- ✅ Live updates announced
- ✅ Form errors clear

### Test 13.3: Visual Accessibility

1. **Test color contrast:**
   - Use browser tools or extensions
   - Check text on backgrounds
   
2. **Test with simulations:**
   - Color blindness modes
   - Low vision
   - Motion sensitivity

**Expected Results:**
- ✅ WCAG AA contrast ratios
- ✅ Not solely color-dependent
- ✅ Respects prefers-reduced-motion

---

## Performance Testing

### Test 14.1: Load Times

1. **Clear cache and hard reload**
2. **Measure key metrics:**
   - Time to first paint
   - Time to interactive
   - Largest Contentful Paint
   
3. **Test on slow connection:**
   - Use Chrome DevTools → Network → Slow 3G
   - Navigate through app
   - Check loading states

**Expected Results:**
- ✅ LCP under 2.5s
- ✅ FID under 100ms
- ✅ CLS under 0.1
- ✅ Loading states prevent confusion

### Test 14.2: Real-time Performance

1. **Open multiple leaderboards**
2. **Have SOs enter many scores rapidly**
3. **Monitor:**
   - Update latency
   - UI responsiveness
   - Memory usage

**Expected Results:**
- ✅ Updates within 1-2 seconds
- ✅ No UI freezing
- ✅ Memory stable over time

---

## Test Completion Checklist

### Core Features
- [ ] User registration (all 4 roles)
- [ ] User login/logout
- [ ] Club creation
- [ ] Tournament creation
- [ ] Tournament publishing
- [ ] Shooter registration
- [ ] Squad selection with visibility
- [ ] SO assignment
- [ ] Stage creation
- [ ] Score entry
- [ ] Live leaderboard
- [ ] Badge earning
- [ ] Badge sharing

### Advanced Features
- [ ] Offline scoring
- [ ] Score conflict resolution
- [ ] Admin user management
- [ ] System analytics
- [ ] Match Director controls
- [ ] Spectator mode
- [ ] Visual stage designer

### Quality Checks
- [ ] Mobile responsive
- [ ] PWA installation
- [ ] Offline functionality
- [ ] Spanish translation
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] Performance metrics
- [ ] Real-time updates

### Edge Cases
- [ ] Full squad handling
- [ ] Tournament capacity limits
- [ ] Network interruption recovery
- [ ] Concurrent score editing
- [ ] Browser back button behavior
- [ ] Session timeout handling

---

## Common Issues to Watch For

1. **Real-time sync delays** - Check Convex connection
2. **Offline queue not clearing** - Verify sync logic
3. **Translation missing** - Note specific keys
4. **Mobile layout breaks** - Screenshot specific pages
5. **Slow performance** - Note specific actions
6. **Accessibility barriers** - Document specifics

---

## Post-Test Cleanup

1. Document any bugs found
2. Note performance bottlenecks
3. List UI/UX improvements
4. Clear test data if needed
5. Prepare deployment notes

---

## Support Contacts

- Technical Issues: Check browser console
- Convex Issues: Check Convex dashboard
- Build Issues: Check Next.js build output

Remember to test with empathy - think like each user role and consider their real-world usage patterns!