# Deploy to Vercel - Complete Guide

## Quick Start

1. **Push code to GitHub** (if not already done)
2. **Import project in Vercel**
3. **Add environment variables**
4. **Update Google OAuth redirect URI**
5. **Redeploy**

---

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Add Gemini AI integration"
git push origin main
```

Verify your code is on GitHub: https://github.com/ZhouYou528/color-vibe-app

---

## Step 2: Deploy to Vercel

### Via Dashboard (Recommended)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New Project"** or **"Import Project"**
4. Select **`color-vibe-app`** repository
5. Vercel auto-detects Next.js ✅
6. Click **"Deploy"** (we'll add env vars next)

### Via CLI

```bash
npm install -g vercel
vercel login
cd /Users/yzhou/color-vibe-app
vercel --prod
```

---

## Step 3: Add Environment Variables

After first deployment, go to **Project Settings → Environment Variables** and add:

### Required Variables

| Variable | Description | Get From |
|----------|-------------|----------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | Same as above |
| `NEXTAUTH_URL` | Your Vercel URL | `https://your-app-name.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth secret | Generate with: `openssl rand -base64 32` |
| `GCP_PROJECT_ID` | GCP Project ID | Your GCP project |
| `GCS_BUCKET` | GCS bucket name | `color-vibe-previews` |
| `FIRESTORE_DATABASE_ID` | Firestore database | `color-vibe` |
| **`GEMINI_API_KEY`** | **Gemini AI API key** | **[Google AI Studio](https://aistudio.google.com/apikey)** |

### GCP Authentication (Choose One)

**Option 1: Service Account Key (Recommended for Vercel)**
- Variable: `GCP_SERVICE_ACCOUNT_KEY`
- Value: Paste entire JSON key as a single line (all escaped on one line)
- Example: `{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}`

**Option 2: Application Default Credentials**
- Variable: `GOOGLE_APPLICATION_CREDENTIALS`
- Value: Not recommended for Vercel (requires file system)

### Important Notes

- **Select environments:** Check **Production**, **Preview**, and **Development** for each variable
- **NEXTAUTH_URL:** Must match your exact Vercel domain (e.g., `https://color-vibe-app.vercel.app`)
- **GEMINI_API_KEY:** Get free key from https://aistudio.google.com/apikey (no credit card)

---

## Step 4: Update Google OAuth Redirect URI

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **"Authorized redirect URIs"**, add:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
   (Replace `your-app-name` with your actual Vercel project name)
4. Click **"Save"**

---

## Step 5: Redeploy

After adding environment variables:

1. Go to Vercel Dashboard → **Deployments**
2. Click **"..."** on latest deployment → **"Redeploy"**
3. Or push a new commit to trigger auto-deploy:
   ```bash
   git commit --allow-empty -m "Trigger redeploy with env vars"
   git push origin main
   ```

---

## Step 6: Verify Deployment

### Test Checklist

- [ ] Landing page loads
- [ ] Sign in with Google works
- [ ] Photo selection works
- [ ] Card details form works
- [ ] Analysis generates results (color palette)
- [ ] **Gemini AI analysis appears** (new sections below palette)
- [ ] Save to Library works
- [ ] Library page loads saved cards
- [ ] Card detail page shows Gemini analysis

### Check Logs

- Go to Vercel Dashboard → **Deployments** → Click latest → **"View Function Logs"**
- Look for any errors, especially:
  - Gemini API errors (check API key)
  - GCP authentication errors (check service account)
  - NextAuth errors (check redirect URI)

---

## Environment Variables Reference

Copy from your `.env.local`:

```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret

# NextAuth
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secret

# GCP
GCP_PROJECT_ID=your-project-id
GCS_BUCKET=color-vibe-previews
FIRESTORE_DATABASE_ID=color-vibe
GCP_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Gemini AI (NEW)
GEMINI_API_KEY=your-gemini-api-key
```

---

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Run `npm run build` locally to catch errors first
- Verify all environment variables are set

### Gemini AI Not Working

- Check `GEMINI_API_KEY` is set in Vercel
- Check function logs for API errors
- Verify API key is valid at https://aistudio.google.com/apikey
- Check rate limits (10 RPM, 250/day for gemini-2.5-flash)

### Authentication Fails

- Verify `NEXTAUTH_URL` matches your domain exactly (no trailing slash)
- Check redirect URI is added to Google OAuth console
- Verify `NEXTAUTH_SECRET` is set

### GCP Errors

- **Service account key required** - ADC doesn't work on Vercel
- Add `GCP_SERVICE_ACCOUNT_KEY` as environment variable
- Verify service account has permissions for Firestore and GCS

### Images Not Loading

- Check GCS bucket IAM conditions
- Verify public read access is configured
- Check browser console for CORS errors

---

## Quick Commands

```bash
# Deploy via CLI
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# Link local project to Vercel
vercel link
```

---

## Next Steps After Deployment

- [ ] Test all features in production
- [ ] Set up custom domain (optional)
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up error tracking (Sentry, optional)
- [ ] Configure preview deployments for branches
- [ ] Monitor Gemini API usage (stay within free tier limits)

---

## Support

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Gemini API Docs:** https://ai.google.dev/gemini-api/docs
- **Google AI Studio:** https://aistudio.google.com/
