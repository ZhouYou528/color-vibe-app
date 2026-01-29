# Deploy to Vercel - Step-by-Step Guide

## Step 1: Fix GitHub Authentication (Required First)

You need to push your code to GitHub before Vercel can deploy it.

### Quick Fix: Use Personal Access Token

1. **Create a token:**
   - Go to: https://github.com/settings/tokens
   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - Name: `color-vibe-app`
   - Expiration: Your choice (90 days, 1 year, or no expiration)
   - **Check the `repo` scope** (full repository access)
   - Click **"Generate token"**
   - **Copy the token immediately** (you won't see it again!)

2. **Push using the token:**
   ```bash
   git push -u origin main
   ```
   - Username: `ZhouYou528`
   - Password: **Paste your token** (not your GitHub password)

3. **Verify push succeeded:**
   - Check https://github.com/ZhouYou528/color-vibe-app
   - You should see all your files

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**
   - Go to: https://vercel.com
   - Click **"Sign Up"** or **"Log In"**
   - Choose **"Continue with GitHub"** (easiest if your code is on GitHub)

2. **Import Your Project**
   - After logging in, click **"Add New Project"** or **"Import Project"**
   - You'll see a list of your GitHub repositories
   - Find and select **`color-vibe-app`**
   - Click **"Import"**

3. **Configure Project Settings**
   - Vercel will auto-detect Next.js settings:
     - Framework Preset: **Next.js** ✅
     - Build Command: `npm run build` ✅
     - Output Directory: `.next` ✅
     - Install Command: `npm install` ✅
   - **Project Name**: `color-vibe-app` (or change if you want)
   - **Root Directory**: `./` (leave as default)
   - Click **"Deploy"**

4. **Wait for Deployment**
   - Vercel will:
     - Install dependencies
     - Build your project
     - Deploy to production
   - This takes 1-3 minutes
   - You'll see build logs in real-time

5. **Get Your Live URL**
   - Once deployed, you'll see: **"Congratulations! Your project has been deployed."**
   - Your production URL: `https://color-vibe-app-xxxxx.vercel.app`
   - Click the URL to see your live site!

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd /Users/yzhou/color-vibe-app
   vercel
   ```
   - Follow the prompts
   - Choose defaults for most questions

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

---

## Step 3: Verify Deployment

### Check Your Live Site
- Visit your Vercel URL: `https://color-vibe-app-xxxxx.vercel.app`
- Test all features:
  - Landing page loads
  - Photo selection works
  - Card details form works
  - Analysis generates results

### Check Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Click on your project
- View:
  - Deployment history
  - Build logs
  - Analytics (if enabled)
  - Domain settings

---

## Step 4: Set Up Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to your project → **Settings** → **Domains**
   - Click **"Add Domain"**
   - Enter your domain (e.g., `colorvibe.app`)

2. **Configure DNS:**
   - Vercel will show DNS records to add
   - Add them to your domain registrar (GoDaddy, Namecheap, etc.)
   - Wait for DNS propagation (5-60 minutes)

3. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates
   - Your site will be HTTPS automatically

---

## Step 5: Enable Analytics (Optional)

1. **In Vercel Dashboard:**
   - Go to your project → **Analytics** tab
   - Click **"Enable Analytics"**
   - View page views, performance metrics, and more

---

## Step 6: Test CI/CD

Your CI/CD is already set up! Test it:

1. **Make a small change:**
   ```bash
   # Edit any file, e.g., README.md
   echo "# Test deployment" >> README.md
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Test CI/CD deployment"
   git push origin main
   ```

3. **Watch Vercel:**
   - Go to Vercel dashboard
   - You'll see a new deployment start automatically
   - Wait for it to complete (1-3 minutes)
   - Your changes are live!

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Common issues:
  - Missing dependencies in `package.json`
  - TypeScript errors (check with `npm run build` locally)
  - Environment variables missing

### Environment Variables
- Go to Project Settings → Environment Variables
- Add any needed variables:
  - Production
  - Preview
  - Development

### Rollback Deployment
- Go to Deployments tab
- Find previous successful deployment
- Click "..." → "Promote to Production"

---

## Next Steps

✅ **Deployed to Vercel**
✅ **CI/CD working** (auto-deploys on push)
✅ **Live URL** (share with users)

**Optional Enhancements:**
- Add custom domain
- Enable analytics
- Set up error tracking (Sentry)
- Configure environment variables
- Add preview deployments for branches

---

## Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard
**Project URL:** `https://color-vibe-app-xxxxx.vercel.app`
**GitHub Repo:** https://github.com/ZhouYou528/color-vibe-app

**Commands:**
```bash
# Push changes (triggers auto-deployment)
git add .
git commit -m "Your changes"
git push origin main

# Deploy manually via CLI
vercel --prod
```
