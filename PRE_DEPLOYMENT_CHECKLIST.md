# Pre-Deployment Checklist

Complete these checks before deploying to Vercel:

## Local Testing Completion

### ✅ Features Tested
- [ ] All 4 user roles can register and login
- [ ] Club creation and management works
- [ ] Tournament creation wizard completes
- [ ] Tournament publishing works
- [ ] Shooters can register for tournaments
- [ ] Squad selection shows members
- [ ] SO assignment works
- [ ] Stage creation and designer work
- [ ] Score entry calculates correctly
- [ ] Live leaderboard updates
- [ ] Badges generate and share
- [ ] Admin dashboard accessible
- [ ] Offline scoring syncs properly

### ✅ Quality Checks
- [ ] No console errors during testing
- [ ] All forms have proper validation
- [ ] Loading states show appropriately
- [ ] Error messages are user-friendly
- [ ] Mobile responsive on all pages
- [ ] PWA installs correctly
- [ ] Spanish translations complete

## Environment Configuration

### ✅ Environment Variables
Ensure these are set in Vercel:
```
NEXT_PUBLIC_CONVEX_URL=<your-production-convex-url>
CONVEX_DEPLOY_KEY=<your-convex-deploy-key>
NEXT_PUBLIC_APP_URL=<your-production-url>
```

### ✅ Convex Production Setup
- [ ] Production deployment created
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Functions deployed successfully

### ✅ Vercel Configuration
- [ ] Project imported from GitHub
- [ ] Build settings confirmed (Next.js)
- [ ] Environment variables added
- [ ] Domain configured (if custom)

## Final Checks

### ✅ Code Quality
```bash
# Run these commands one final time
npm run lint        # Should pass with no errors
npm run build       # Should build successfully
```

### ✅ Security Review
- [ ] No hardcoded credentials
- [ ] API keys in environment variables
- [ ] Sensitive routes protected
- [ ] CORS configured properly
- [ ] Rate limiting considered

### ✅ Performance
- [ ] Images optimized
- [ ] Bundle size reasonable
- [ ] Lighthouse score acceptable
- [ ] No memory leaks identified

## Deployment Steps

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to vercel.com
   - Import project from GitHub
   - Configure environment variables
   - Deploy

3. **Post-Deployment Tests:**
   - [ ] Site loads correctly
   - [ ] Can create new account
   - [ ] Convex connection works
   - [ ] PWA installation works
   - [ ] Basic user flow works

## Rollback Plan

If issues arise:
1. Vercel allows instant rollback to previous deployment
2. Keep local working version as backup
3. Monitor error logs in Vercel dashboard
4. Check Convex logs for backend issues

## Go-Live Communication

Prepare to share with testers:
- Production URL
- Known limitations
- Feedback collection method
- Support contact

---

Ready to deploy? 🚀