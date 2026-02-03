# Setup Guide: Service Account Key Creation Disabled

If your GCP organization has disabled service account key creation (Organization Policy: `iam.disableServiceAccountKeyCreation`), use Application Default Credentials (ADC) for local development.

## ✅ Solution: Use Application Default Credentials

This is actually **more secure** and the recommended approach! You don't need service account keys for local development.

## Step-by-Step Setup

### 1. Install Google Cloud SDK (if not already installed)

```bash
# macOS
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### 2. Authenticate with Application Default Credentials

```bash
gcloud auth application-default login
```

This will:
- Open your browser
- Ask you to sign in with your Google account
- Grant permissions for local development
- Store credentials locally (no key file needed!)

### 3. Set Your GCP Project

```bash
gcloud config set project YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your actual GCP project ID.

### 4. Verify Authentication

```bash
gcloud auth application-default print-access-token
```

If you see a token, authentication is working! ✅

### 5. Update `.env.local`

Make sure these are set:

```env
GCP_PROJECT_ID=your-actual-project-id
GCS_BUCKET=color-vibe-previews

# Leave these EMPTY or COMMENTED OUT (we're using ADC)
# GOOGLE_APPLICATION_CREDENTIALS=
# GCP_SERVICE_ACCOUNT_KEY=
```

### 6. Grant Yourself Permissions

Your Google account needs these roles in your GCP project:

1. Go to: https://console.cloud.google.com/iam-admin/iam
2. Find your email address
3. Click "Edit" and add these roles:
   - **Storage Object Creator** (for Cloud Storage uploads)
   - **Cloud Datastore User** or **Firestore User** (for database access)

Or ask your GCP admin to grant these roles to your account.

### 7. Create GCP Resources

**Firestore Database:**
1. Go to: https://console.cloud.google.com/firestore
2. Click "Create database"
3. Choose "Native mode"
4. Select location: **us-central1** (free tier region)
5. Click "Create"

**Cloud Storage Bucket:**
1. Go to: https://console.cloud.google.com/storage
2. Click "Create bucket"
3. Name: `color-vibe-previews` (or your preferred name)
4. Location: **us-central1** (free tier region)
5. Access control: **Uniform**
6. Click "Create"

### 8. Test It!

```bash
npm run dev
```

Then try:
1. Sign in with Google ✅
2. Create a card with images
3. Save to library

If you see authentication errors, check:
- `gcloud auth application-default print-access-token` works
- Your GCP project ID is correct
- You have the required IAM roles

## For Vercel Deployment

Since service account keys are disabled, you have these options:

### Option A: Workload Identity Federation (Recommended)

This is the secure, modern way to authenticate without keys:

1. **Enable Workload Identity Federation** in your GCP project
2. **Create a Workload Identity Pool** for Vercel
3. **Configure Vercel** to use Workload Identity

See: https://cloud.google.com/iam/docs/workload-identity-federation

### Option B: Contact Your GCP Admin

Ask your Organization Policy Administrator to:
- Temporarily disable the policy for your project, OR
- Create a service account key for you directly

### Option C: Use a Different Project

If you have access to another GCP project where key creation is enabled:
1. Create service account and key there
2. Grant it access to your main project's resources
3. Use that key for Vercel

## Why ADC is Better

- ✅ **More secure** - No key files to manage
- ✅ **Easier** - No need to download/rotate keys
- ✅ **Recommended** - Google's best practice
- ✅ **Works locally** - Perfect for development

## Troubleshooting

**Error: "Could not load the default credentials"**
- Run: `gcloud auth application-default login` again
- Make sure you're logged in: `gcloud auth list`

**Error: "Permission denied"**
- Check your IAM roles in GCP Console
- Make sure you have Storage Object Creator and Firestore User roles

**Error: "Project not found"**
- Verify your GCP_PROJECT_ID in `.env.local`
- Run: `gcloud projects list` to see your projects

## Summary

✅ **Local Development**: Use ADC (`gcloud auth application-default login`)  
⏳ **Vercel Deployment**: Use Workload Identity Federation or contact admin

You're all set! The code will automatically use ADC when no service account keys are provided.
