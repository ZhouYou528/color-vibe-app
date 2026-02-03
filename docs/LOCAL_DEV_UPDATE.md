# Update Local Development for New GCP Project

## Step 1: Get Your New Project Information

1. **Get your new Project ID:**
   - Go to: https://console.cloud.google.com/home/dashboard
   - Make sure your **new project** is selected
   - Copy the **Project ID** (e.g., `color-vibe-production-123456`)

2. **Check your Firestore Database ID:**
   - Go to: https://console.cloud.google.com/firestore
   - If you created a **named database** (not default), note the name
   - If you used the **default database**, you can leave `FIRESTORE_DATABASE_ID` empty

3. **Check your GCS Bucket name:**
   - Go to: https://console.cloud.google.com/storage/buckets
   - Note the bucket name (should be `color-vibe-previews` or similar)

---

## Step 2: Update OAuth Credentials (Important!)

Your Google OAuth credentials are tied to a specific GCP project. You have two options:

### Option A: Use Existing OAuth Credentials (Easier)

If your existing OAuth credentials are in the **old project**, you need to add localhost to the authorized redirect URIs:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Make sure your **old project** is selected (where your OAuth credentials are)
3. Click on your OAuth 2.0 Client ID
4. Under **"Authorized redirect URIs"**, add:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3001/api/auth/callback/google` (if port 3000 is busy)
5. Click **"Save"**

### Option B: Create New OAuth Credentials in New Project (Recommended)

1. Go to: https://console.cloud.google.com/apis/credentials
2. **Important:** Make sure your **new project** is selected
3. Click **"Create Credentials"** → **"OAuth client ID"**
4. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: `Color Vibe`
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"** through the steps
5. **Application type:** Web application
6. **Name:** `Color Vibe Web Client`
7. **Authorized redirect URIs:**
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3001/api/auth/callback/google`
8. Click **"Create"**
9. Copy the **Client ID** and **Client Secret**
10. Update your `.env.local` with these new values

---

## Step 3: Update `.env.local` File

Open `/Users/yzhou/color-vibe-app/.env.local` and update:

1. **GCP_PROJECT_ID:** Change to your new project ID
2. **GCS_BUCKET:** Verify it matches your new bucket name
3. **FIRESTORE_DATABASE_ID:** 
   - If you used default database: Leave empty or remove the line
   - If you used a named database: Update to that name
4. **GCP_SERVICE_ACCOUNT_KEY (Optional):**
   - If you want to use the service account key locally (instead of ADC):
     - Copy the entire JSON from your downloaded key file
     - Minify it (remove newlines/spaces) or paste as-is
     - Uncomment and add the `GCP_SERVICE_ACCOUNT_KEY` line
   - If you want to continue using ADC (Application Default Credentials):
     - Leave it commented out
     - Make sure you've run: `gcloud auth application-default login`
     - Make sure you've set the project: `gcloud config set project YOUR_NEW_PROJECT_ID`

---

## Step 4: Update gcloud Configuration (If Using ADC)

If you're using Application Default Credentials (not service account key):

```bash
# Set your new project as default
gcloud config set project YOUR_NEW_PROJECT_ID

# Verify it's set correctly
gcloud config get-value project

# Re-authenticate with ADC (if needed)
gcloud auth application-default login
```

---

## Step 5: Test Local Development

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test Sign In:**
   - Go to http://localhost:3000 (or 3001 if 3000 is busy)
   - Click "Sign in with Google"
   - Should work with account picker

3. **Test Card Creation:**
   - Create a card with images
   - Click "Save to Library"
   - Should save successfully

4. **Test Library:**
   - Go to Library tab
   - Should see your saved cards

---

## Troubleshooting

### OAuth Error: redirect_uri_mismatch
- Make sure you added `http://localhost:3000/api/auth/callback/google` to your OAuth credentials
- Check that you're using the correct Client ID/Secret for the project

### GCP Authentication Errors
- If using ADC: Run `gcloud auth application-default login` again
- If using service account key: Verify the JSON is valid and properly formatted
- Check that `GCP_PROJECT_ID` matches your new project

### Firestore Errors
- Verify the database exists in your new project
- Check `FIRESTORE_DATABASE_ID` is correct (or empty for default)
- Make sure Firestore API is enabled

### GCS Errors
- Verify the bucket exists in your new project
- Check `GCS_BUCKET` name matches exactly
- Make sure Storage API is enabled

---

## Quick Checklist

- [ ] New Project ID noted
- [ ] Firestore Database ID noted (or using default)
- [ ] GCS Bucket name verified
- [ ] OAuth credentials updated (or localhost added to existing)
- [ ] `.env.local` updated with new Project ID
- [ ] `.env.local` updated with correct Bucket name
- [ ] `.env.local` updated with correct Database ID (or removed)
- [ ] Service account key added (optional) OR ADC configured
- [ ] `gcloud config set project` run (if using ADC)
- [ ] Dev server started and tested
- [ ] Sign in works
- [ ] Card creation works
- [ ] Save to library works
