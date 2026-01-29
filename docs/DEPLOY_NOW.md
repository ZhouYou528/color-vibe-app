# Deploy to Vercel - Quick Guide

## 🔐 Step 1: Fix GitHub Authentication (Do This First!)

GitHub requires a Personal Access Token instead of a password.

### Create Token:
1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `color-vibe-app`
4. Check **`repo`** scope
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

### Push Your Code:
```bash
cd /Users/yzhou/color-vibe-app
git push -u origin main
```

When prompted:
- **Username**: `ZhouYou528`
- **Password**: Paste your token (not your GitHub password)

✅ Once pushed, verify at: https://github.com/ZhouYou528/color-vibe-app

---

## 🚀 Step 2: Deploy to Vercel

### Quick Deploy (5 minutes):

1. **Go to Vercel:**
   - Visit: **https://vercel.com**
   - Click **"Sign Up"** or **"Log In"**
   - Choose **"Continue with GitHub"** (easiest!)

2. **Import Project:**
   - Click **"Add New Project"**
   - You'll see your GitHub repositories
   - Find **`color-vibe-app`**
   - Click **"Import"**

3. **Deploy:**
   - Vercel auto-detects Next.js ✅
   - Click **"Deploy"** (use default settings)
   - Wait 1-3 minutes for build

4. **Done!**
   - You'll get a live URL: `https://color-vibe-app-xxxxx.vercel.app`
   - Your app is live! 🎉

---

## ✅ Step 3: Test Your Deployment

Visit your Vercel URL and test:
- ✅ Landing page loads
- ✅ Photo selection works
- ✅ Card details form works
- ✅ Analysis generates results

---

## 🔄 Step 4: Test CI/CD

Make a change and push:
```bash
# Make any small change
echo "Test" >> README.md
git add .
git commit -m "Test deployment"
git push origin main
```

Watch Vercel automatically deploy your changes!

---

## 📋 Summary

**Current Status:**
- ✅ Git repository initialized
- ✅ Files committed locally
- ✅ Remote configured: `https://github.com/ZhouYou528/color-vibe-app.git`
- ⏳ Need to push to GitHub (requires token)
- ⏳ Need to deploy to Vercel

**Next Actions:**
1. Get GitHub token → Push code
2. Sign up Vercel → Import repo → Deploy
3. Done! 🎉

---

## 🆘 Need Help?

- **GitHub Auth:** See `GITHUB_AUTH_FIX.md`
- **Detailed Guide:** See `VERCEL_DEPLOY.md`
- **Vercel Docs:** https://vercel.com/docs
