# Vercel Deployment Guide

## Prerequisites

✅ Code pushed to GitHub  
✅ Vercel account created  
✅ GCP project set up  

## Step 1: Deploy to Vercel

1. Go to: https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository (`color-vibe-app`)
4. Vercel will auto-detect Next.js
5. **Don't deploy yet** - we need to set environment variables first

## Step 2: Set Environment Variables in Vercel

Go to your project settings → Environment Variables and add:

### Required Variables

```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1009062340844-50altrfh24hvqdt9ii1lt4ueho6fr8ru.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# NextAuth
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=Pe8gl+DvK/g6BBSPviYZmoF4M+Rc5fAAu6iwtfFeh5g=

# GCP Configuration
GCP_PROJECT_ID=project-85abd5a7-0107-4dd9-b21
GCS_BUCKET=color-vibe-previews
FIRESTORE_DATABASE_ID=color-vibe
```

**Important:** 
- Replace `NEXTAUTH_URL` with your actual Vercel URL (you'll get this after first deploy)
- Or use a custom domain if you have one

### GCP Authentication (Choose One)

**Option A: Service Account Key (if you can get one from admin)**
```env
GCP_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```
Paste the entire JSON key as a single line.

**Option B: Workload Identity Federation (Recommended for production)**
- More secure, no keys needed
- See: https://cloud.google.com/iam/docs/workload-identity-federation
- Requires additional setup

**Option C: For now - Use public URLs (if IAM conditions are set)**
- Leave GCP credentials empty
- Make sure IAM conditions allow public read access
- This works but is less secure

## Step 3: Update Google OAuth Redirect URI

1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add to "Authorized redirect URIs":
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
4. Save

## Step 4: Deploy

1. In Vercel, click "Deploy"
2. Wait for build to complete
3. Check the deployment logs for any errors

## Step 5: Test Production

1. Visit your Vercel URL
2. Sign in with Google
3. Create a card
4. Save to library
5. Verify everything works

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Verify all environment variables are set
- Check TypeScript errors locally first

### Authentication Fails
- Verify `NEXTAUTH_URL` matches your Vercel domain
- Check redirect URI is added to Google OAuth
- Verify `NEXTAUTH_SECRET` is set

### GCP Errors
- If using ADC: Won't work on Vercel (needs service account key)
- If using service account key: Verify JSON is valid (single line, escaped quotes)
- If using public URLs: Verify IAM conditions are set

### Images Not Loading
- Check GCS bucket permissions
- Verify IAM conditions allow public read
- Check browser console for CORS errors

## Next Steps After Deployment

1. Set up a custom domain (optional)
2. Enable Vercel Analytics (optional)
3. Set up error monitoring (Sentry, etc.)
4. Configure production GCP resources if needed
