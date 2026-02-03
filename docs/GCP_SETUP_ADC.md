# GCP Setup Without Service Account Keys

If service account key creation is disabled in your GCP organization, use Application Default Credentials (ADC) instead.

## Local Development Setup

### Step 1: Install Google Cloud SDK (if not already installed)

```bash
# macOS
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### Step 2: Authenticate with Application Default Credentials

```bash
gcloud auth application-default login
```

This will:
- Open your browser
- Ask you to sign in with your Google account
- Grant permissions to use your user credentials for local development

### Step 3: Set Your GCP Project

```bash
gcloud config set project YOUR_PROJECT_ID
```

### Step 4: Verify Authentication

```bash
gcloud auth application-default print-access-token
```

If you see a token, you're all set!

### Step 5: Update `.env.local`

Make sure these are set (but leave credentials empty):

```env
GCP_PROJECT_ID=your-project-id
GCS_BUCKET=color-vibe-previews
# Leave GOOGLE_APPLICATION_CREDENTIALS and GCP_SERVICE_ACCOUNT_KEY empty/commented
```

The code will automatically use Application Default Credentials.

## For Vercel Deployment

If service account keys are disabled, you have a few options:

### Option A: Use Workload Identity Federation (Recommended)

This allows Vercel to authenticate without service account keys.

1. **Enable Workload Identity Federation** in your GCP project
2. **Create a Workload Identity Pool**:
   ```bash
   gcloud iam workload-identity-pools create vercel-pool \
     --project=YOUR_PROJECT_ID \
     --location=global
   ```

3. **Create a Workload Identity Provider** for Vercel
4. **Configure Vercel** to use Workload Identity

This is more complex but more secure. See: https://cloud.google.com/iam/docs/workload-identity-federation

### Option B: Request Service Account Key Access

Contact your GCP organization admin to:
- Enable service account key creation for your project
- Or create a service account key for you

### Option C: Use a Different Service Account

If you have access to another GCP project where key creation is enabled:
1. Create the service account there
2. Grant it access to your main project's resources
3. Use that service account's key

## Testing Locally

Once ADC is set up, test your connection:

```bash
npm run dev
```

Then try:
1. Sign in with Google
2. Create a card with images
3. Save to library

If you see errors about authentication, check:
- `gcloud auth application-default print-access-token` works
- Your GCP project ID is correct in `.env.local`
- The service account (or your user) has the right permissions

## Required Permissions

Your user account (or service account) needs:
- **Storage Object Creator** (for GCS uploads)
- **Cloud Datastore User** or **Firestore User** (for database access)

You can grant these permissions in:
- IAM & Admin → IAM
- Find your user/service account
- Add the required roles
