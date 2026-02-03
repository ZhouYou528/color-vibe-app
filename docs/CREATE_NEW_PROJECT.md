# Create New GCP Project (5 Minutes)

Since you can't modify the organization policy, create a new project where you have full control.

## Step 1: Create New Project

1. Go to: https://console.cloud.google.com/projectcreate
2. **Project name:** `color-vibe-production` (or any name you like)
3. **Organization:** Select your organization (or leave default)
4. Click **"Create"**
5. Wait for project to be created
6. **Note the Project ID** (you'll need this)

## Step 2: Enable Required APIs

1. Go to: https://console.cloud.google.com/apis/library
2. Make sure your new project is selected (top dropdown)
3. Enable these APIs:
   - **Cloud Storage API**
   - **Cloud Firestore API**

## Step 3: Create Firestore Database

1. Go to: https://console.cloud.google.com/firestore
2. Make sure new project is selected
3. Click **"Create database"**
4. Choose **"Native mode"**
5. Select location: **`us-central1`** (free tier region)
6. Click **"Create"**
7. Wait for database to be created

## Step 4: Create Cloud Storage Bucket

1. Go to: https://console.cloud.google.com/storage/buckets
2. Make sure new project is selected
3. Click **"Create bucket"**
4. **Name:** `color-vibe-previews` (or your preferred name)
5. **Location:** `us-central1` (free tier region)
6. **Access control:** Uniform
7. Click **"Create"**

## Step 5: Create Service Account

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Make sure new project is selected
3. Click **"Create Service Account"**
4. **Service account name:** `color-vibe-app`
5. Click **"Create and Continue"**
6. **Grant roles:**
   - `Storage Object Creator`
   - `Cloud Datastore User` (or `Firestore User`)
7. Click **"Continue"** → **"Done"**

## Step 6: Create Service Account Key

1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose **"JSON"**
5. Click **"Create"**
6. **Download the JSON file** (save it securely - you won't see it again!)

## Step 7: Update Vercel Environment Variables

1. Open the downloaded JSON file
2. Copy the **entire contents**
3. Go to Vercel → Your Project → **Settings** → **Environment Variables**
4. Update these variables:

| Variable | New Value |
|----------|-----------|
| `GCP_PROJECT_ID` | Your new project ID |
| `GCS_BUCKET` | `color-vibe-previews` (or your bucket name) |
| `FIRESTORE_DATABASE_ID` | Leave empty (or `(default)`) |
| `GCP_SERVICE_ACCOUNT_KEY` | Paste entire JSON from downloaded file |

5. **Important:** Select all environments (Production, Preview, Development)
6. Click **"Save"** for each variable

## Step 8: Update Google OAuth (If Needed)

If you want to use the same OAuth credentials:
- No changes needed - OAuth works across projects

If you want separate OAuth:
- Create new OAuth credentials in the new project
- Update `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel

## Step 9: Redeploy

1. Go to Vercel → Your Project → **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger auto-deploy

## Step 10: Test

1. Visit your Vercel URL
2. Sign in with Google
3. Create a card
4. Save to library
5. Verify everything works!

## Benefits of New Project

✅ Full control - no policy restrictions  
✅ Can create service account keys  
✅ Clean slate - no conflicts  
✅ Same free tier limits apply  
✅ Easy to manage  

## Migration (If Needed)

If you have data in the old project:
- Export from old Firestore
- Import to new Firestore
- Or start fresh (recommended for new app)

---

**Time:** ~5-10 minutes  
**Difficulty:** Easy  
**Result:** Fully working production setup!
