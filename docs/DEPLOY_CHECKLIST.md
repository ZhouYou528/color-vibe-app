# Vercel Deployment Checklist

## ✅ Pre-Deployment

- [x] Code pushed to GitHub
- [ ] Environment variables ready
- [ ] Google OAuth redirect URI updated

## Step 1: Deploy to Vercel

1. Go to: https://vercel.com
2. Click "Add New Project" or "Import Project"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js ✅
5. **Click "Deploy"** (we'll add env vars after first deploy)

## Step 2: Get Your Vercel URL

After deployment, you'll get a URL like:
```
https://color-vibe-app-xxxxx.vercel.app
```

Copy this URL - you'll need it for the next steps.

## Step 3: Add Environment Variables in Vercel

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add these variables (one by one):

### Required Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `1009062340844-50altrfh24hvqdt9ii1lt4ueho6fr8ru.apps.googleusercontent.com` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `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` | Your Google OAuth Secret |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | **Replace with your actual Vercel URL** |
| `NEXTAUTH_SECRET` | `Pe8gl+DvK/g6BBSPviYZmoF4M+Rc5fAAu6iwtfFeh5g=` | Your NextAuth secret |
| `GCP_PROJECT_ID` | `project-85abd5a7-0107-4dd9-b21` | Your GCP Project ID |
| `GCS_BUCKET` | `color-vibe-previews` | Your GCS bucket name |
| `FIRESTORE_DATABASE_ID` | `color-vibe` | Your Firestore database ID |

### GCP Authentication (Choose One):

**Option 1: Service Account Key (if you can get one)**
- Variable: `GCP_SERVICE_ACCOUNT_KEY`
- Value: Paste entire JSON key as single line (all on one line, escaped)

**Option 2: Leave empty** (if IAM conditions allow public read)
- Don't add any GCP credential variables
- Make sure IAM conditions are set for public read access

4. **Important:** Select environments: **Production**, **Preview**, **Development**
5. Click "Save" for each variable

## Step 4: Update Google OAuth Redirect URI

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
   (Replace with your actual Vercel URL)
4. Click "Save"

## Step 5: Redeploy

1. Go back to Vercel
2. Click "Deployments" tab
3. Click the "..." menu on latest deployment
4. Click "Redeploy"
5. Or push a new commit to trigger auto-deploy

## Step 6: Test Production

1. Visit your Vercel URL
2. Test sign in with Google
3. Create a card
4. Save to library
5. View library
6. View card details

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all required env vars are set
- Check for TypeScript errors

### Auth Doesn't Work
- Verify `NEXTAUTH_URL` matches your domain exactly
- Check redirect URI is added to Google OAuth
- Verify `NEXTAUTH_SECRET` is set

### GCP Errors in Production
- **ADC won't work on Vercel** - you need a service account key
- Ask your GCP admin for a service account key
- Or set up Workload Identity Federation

### Images Not Loading
- Check GCS bucket IAM conditions
- Verify public read access is configured
- Check browser console for errors

## Quick Reference

**Your Values:**
- Project ID: `project-85abd5a7-0107-4dd9-b21`
- Bucket: `color-vibe-previews`
- Database: `color-vibe`
- Google Client ID: `1009062340844-50altrfh24hvqdt9ii1lt4ueho6fr8ru.apps.googleusercontent.com`

**Vercel URL:** (You'll get this after first deploy)
