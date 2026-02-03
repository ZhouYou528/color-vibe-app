# Detailed Step-by-Step: New GCP Project Setup

## Prerequisites

✅ New GCP project created  
✅ Project ID noted (you'll need this)

---

## Step 2: Set Up Resources

### 2.1 Enable Cloud Storage API

1. Go to: https://console.cloud.google.com/apis/library/storage-api.googleapis.com
2. **Important:** Make sure your **new project** is selected in the top dropdown (next to "Google Cloud")
3. Click **"Enable"**
4. Wait for it to enable (usually takes 10-30 seconds)
5. You should see "API enabled" confirmation

### 2.2 Enable Firestore API

1. Go to: https://console.cloud.google.com/apis/library/firestore.googleapis.com
2. **Important:** Make sure your **new project** is selected in the top dropdown
3. Click **"Enable"**
4. Wait for it to enable
5. You should see "API enabled" confirmation

**Alternative:** Enable both at once:
- Go to: https://console.cloud.google.com/apis/library
- Search for "Cloud Storage API" → Enable
- Search for "Cloud Firestore API" → Enable

### 2.3 Create Firestore Database

1. Go to: https://console.cloud.google.com/firestore
2. **Important:** Make sure your **new project** is selected in the top dropdown
3. Click **"Create database"** (or "Select Native Mode" if you see that)
4. **Database mode:** Select **"Start in Native mode"**
   - ⚠️ Do NOT select "Datastore mode"
5. Click **"Next"**
6. **Location:** Select **`us-central1` (Iowa)**
   - This is important for free tier eligibility
7. Click **"Enable"**
8. Wait for database creation (1-2 minutes)
9. You'll see the Firestore console when it's ready

**Verify:** You should see an empty Firestore console with "No collections" message.

### 2.4 Create Cloud Storage Bucket

1. Go to: https://console.cloud.google.com/storage/buckets
2. **Important:** Make sure your **new project** is selected in the top dropdown
3. Click **"Create bucket"**
4. **Name your bucket:**
   - Name: `color-vibe-previews`
   - ⚠️ Bucket names must be globally unique - if taken, add numbers/suffix (e.g., `color-vibe-previews-123`)
5. Click **"Continue"**
6. **Choose where to store your data:**
   - Select: **`us-central1 (Iowa)`**
   - This is important for free tier
7. Click **"Continue"**
8. **Choose a storage class:**
   - Select: **`Standard`** (default)
9. Click **"Continue"**
9. **Choose how to control access to objects:**
   - Select: **`Uniform`** (bucket-level access)
10. Click **"Continue"**
11. **Protect object data:**
   - Leave defaults (or enable if you want extra security)
12. Click **"Create"**
13. Wait for bucket creation (usually instant)

**Verify:** You should see your bucket in the list.

---

## Step 3: Create Service Account and Key

### 3.1 Navigate to Service Accounts

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. **Important:** Make sure your **new project** is selected in the top dropdown
3. You should see an empty list (or default service accounts)

### 3.2 Create Service Account

1. Click **"Create Service Account"** button (top of page)
2. **Service account details:**
   - **Service account name:** `color-vibe-app`
   - **Service account ID:** Auto-filled (usually `color-vibe-app`)
   - **Description:** (optional) "Service account for Color Vibe app"
3. Click **"Create and Continue"**

### 3.3 Grant Roles

1. **Grant this service account access to project:**
   - Click **"Select a role"** dropdown
   - Search for: `Storage Object Creator`
   - Select: **`Storage Object Creator`**
   - Click **"Add Another Role"**
   - Search for: `Cloud Datastore User`
   - Select: **`Cloud Datastore User`** (or `Firestore User` if you see it)
   - You should now see both roles listed
2. Click **"Continue"**

### 3.4 Grant Access to Users (Optional)

1. This step is optional - you can skip it
2. Click **"Done"**

### 3.5 Create Key

1. You should now see your service account in the list
2. Click on the service account name: **`color-vibe-app`**
3. Go to the **"Keys"** tab (top of the page)
4. Click **"Add Key"** → **"Create new key"**
5. **Key type:** Select **`JSON`**
6. Click **"Create"**
7. **The JSON file will automatically download**
   - ⚠️ **Important:** Save this file! You won't be able to download it again.
   - File name will be something like: `color-vibe-production-xxxxx.json`

**Verify:** You should see the key listed in the Keys tab with a creation date.

---

## Step 4: Update Vercel Environment Variables

### 4.1 Get Your New Project ID

1. Go to: https://console.cloud.google.com/home/dashboard
2. Make sure your **new project** is selected
3. **Project ID** is shown at the top (e.g., `color-vibe-production-123456`)
4. Copy this Project ID - you'll need it

### 4.2 Open the Service Account Key File

1. Find the downloaded JSON file (usually in your Downloads folder)
2. Open it with a text editor
3. It should look like:
   ```json
   {
     "type": "service_account",
     "project_id": "color-vibe-production-123456",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "color-vibe-app@color-vibe-production-123456.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     ...
   }
   ```
4. **Select all** (Cmd+A / Ctrl+A) and **copy** (Cmd+C / Ctrl+C)

### 4.3 Add Variables to Vercel

1. Go to: https://vercel.com
2. Click on your project: **`color-vibe-app`**
3. Go to **"Settings"** tab (top navigation)
4. Click **"Environment Variables"** (left sidebar)
5. You'll see a list of existing variables

#### Add/Update GCP_PROJECT_ID:

1. If `GCP_PROJECT_ID` exists, click the **pencil icon** to edit
2. If it doesn't exist, click **"Add New"**
3. **Key:** `GCP_PROJECT_ID`
4. **Value:** Paste your new project ID (e.g., `color-vibe-production-123456`)
5. **Environments:** Check all: ☑ Production, ☑ Preview, ☑ Development
6. Click **"Save"**

#### Add/Update GCS_BUCKET:

1. If `GCS_BUCKET` exists, click the **pencil icon** to edit
2. If it doesn't exist, click **"Add New"**
3. **Key:** `GCS_BUCKET`
4. **Value:** `color-vibe-previews` (or whatever you named your bucket)
5. **Environments:** Check all: ☑ Production, ☑ Preview, ☑ Development
6. Click **"Save"**

#### Add GCP_SERVICE_ACCOUNT_KEY:

1. Click **"Add New"**
2. **Key:** `GCP_SERVICE_ACCOUNT_KEY`
3. **Value:** Paste the **entire JSON** you copied from the key file
   - ✅ **Recommended:** Paste as **single-line JSON** (minified, no newlines)
     - In your text editor: Select all → Find & Replace → Replace newlines with nothing
     - Or use an online JSON minifier
   - ✅ **Alternative:** Paste with spaces/newlines (pretty-printed) - Vercel supports this, but single-line is more reliable
   - ✅ It should start with `{"type":"service_account",...`
   - ⚠️ **Note:** Vercel wraps values in quotes automatically, so don't add extra quotes
   - 💡 **Tip:** Single-line format avoids any potential issues with newline handling in Vercel's UI
4. **Environments:** Check all: ☑ Production, ☑ Preview, ☑ Development
5. Click **"Save"**

**Verify:** You should now see all three variables listed.

---

## Step 5: Redeploy

### Option A: Redeploy from Vercel Dashboard

1. Stay in Vercel dashboard
2. Go to **"Deployments"** tab (top navigation)
3. Find your latest deployment
4. Click the **"..."** menu (three dots) on the right
5. Click **"Redeploy"**
6. Confirm by clicking **"Redeploy"** again
7. Wait for deployment to complete (usually 1-3 minutes)

### Option B: Push a New Commit (Triggers Auto-Deploy)

1. Make a small change (e.g., add a comment to a file)
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update GCP project configuration"
   git push
   ```
3. Vercel will automatically deploy

### Verify Deployment

1. Watch the deployment logs in Vercel
2. Look for:
   - ✅ "Build Completed"
   - ✅ "Deployment Ready"
3. If you see errors, check the logs

---

## Step 6: Test Production

1. Visit your Vercel URL (e.g., `https://color-vibe-app.vercel.app`)
2. **Test Sign In:**
   - Click "Sign in with Google"
   - You should see account picker
   - Sign in with your account
3. **Test Card Creation:**
   - Click "From Photo Album"
   - Select some images
   - Fill in card details
   - Click "Generate"
   - Wait for analysis
4. **Test Save:**
   - Click "Save to Library"
   - Should see "Saved to Library" confirmation
5. **Test Library:**
   - Go to Library tab
   - Should see your saved card
6. **Test Card Details:**
   - Click on a saved card
   - Should see full card details with images

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all environment variables are set correctly
- Check for typos in variable names/values

### Authentication Fails
- Verify `NEXTAUTH_URL` matches your Vercel domain exactly
- Check Google OAuth redirect URI is added
- Verify `NEXTAUTH_SECRET` is set

### GCP Errors
- Verify service account has correct roles
- Check JSON key is valid (all on one line in Vercel)
- Verify project ID matches
- Check bucket name matches exactly

### Images Not Loading
- Check GCS bucket exists in new project
- Verify service account has Storage Object Creator role
- Check browser console for errors

---

## Quick Checklist

- [ ] Cloud Storage API enabled
- [ ] Firestore API enabled
- [ ] Firestore database created (Native mode, us-central1)
- [ ] GCS bucket created (us-central1)
- [ ] Service account created
- [ ] Storage Object Creator role granted
- [ ] Cloud Datastore User role granted
- [ ] Service account key created and downloaded
- [ ] GCP_PROJECT_ID updated in Vercel
- [ ] GCS_BUCKET updated in Vercel
- [ ] GCP_SERVICE_ACCOUNT_KEY added to Vercel
- [ ] App redeployed
- [ ] Tested sign in
- [ ] Tested card creation
- [ ] Tested save to library
- [ ] Tested library view
- [ ] Tested card details

---

**Estimated Time:** 10-15 minutes  
**Difficulty:** Easy  
**Result:** Fully working production app! 🎉
