# Making GCP Work on Vercel

Since Application Default Credentials (ADC) only work locally, you need one of these options for Vercel:

## Option 1: Get Service Account Key from Admin (Easiest) ⭐

### Step 1: Ask Your GCP Admin

Send them this request:

> "Hi, I need a service account key for my project `project-85abd5a7-0107-4dd9-b21` to deploy to Vercel. The service account needs these roles:
> - Storage Object Creator (for Cloud Storage uploads)
> - Cloud Datastore User or Firestore User (for database access)
> 
> Please create the key and provide the JSON file, or temporarily disable the `iam.disableServiceAccountKeyCreation` policy for my project."

### Step 2: Add Key to Vercel

Once you have the JSON key file:

1. Open the JSON file
2. Copy the **entire contents** (all on one line)
3. Go to Vercel → Your Project → Settings → Environment Variables
4. Add variable:
   - **Name**: `GCP_SERVICE_ACCOUNT_KEY`
   - **Value**: Paste the entire JSON (all on one line)
   - **Environments**: Production, Preview, Development
5. Save

### Step 3: Redeploy

Redeploy your app in Vercel. It should now work!

---

## Option 2: Workload Identity Federation (No Keys Needed)

This is more secure but requires setup. See Google's guide:
https://cloud.google.com/iam/docs/workload-identity-federation

**Quick steps:**
1. Enable Workload Identity Federation API
2. Create a Workload Identity Pool
3. Create a Workload Identity Provider for Vercel
4. Configure Vercel to use Workload Identity
5. Grant the provider access to your service account

This is more complex but doesn't require keys.

---

## Option 3: Use IAM Conditions (If Already Set Up)

If you've already set up IAM conditions for public read access:

1. Make sure IAM conditions allow `allUsers` to read objects in `users/` path
2. In Vercel, **don't add any GCP credential variables**
3. The code will use public URLs (which work if IAM conditions are set)

**Note:** This only works if IAM conditions are properly configured.

---

## Recommended: Option 1

Getting a service account key from your admin is the **easiest and fastest** way to get production working.

Once you have the key:
1. Add it to Vercel as `GCP_SERVICE_ACCOUNT_KEY`
2. Redeploy
3. Everything should work!

---

## Testing After Setup

1. Visit your Vercel URL
2. Sign in with Google
3. Create a card with images
4. Save to library
5. Verify images upload and display correctly

If you get errors, check:
- Service account has correct IAM roles
- JSON key is valid (all on one line in Vercel)
- All other environment variables are set
