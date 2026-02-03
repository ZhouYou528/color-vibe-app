# Options When You Can't Modify Organization Policy

Even if you're the admin, the policy might be set at a higher level. Here are your options:

## Option 1: Create a New GCP Project (Easiest) ⭐

Create a fresh project where you have full control:

1. **Create New Project:**
   - Go to: https://console.cloud.google.com/projectcreate
   - Project name: `color-vibe-production` (or any name)
   - Click "Create"

2. **Enable APIs:**
   - Cloud Storage API
   - Firestore API

3. **Create Resources:**
   - Firestore database (Native mode, `us-central1`)
   - GCS bucket (`color-vibe-previews`, `us-central1`)

4. **Create Service Account & Key:**
   - Go to IAM & Admin → Service Accounts
   - Create service account
   - Grant roles: Storage Object Creator, Firestore User
   - Create key → Download JSON

5. **Update Your App:**
   - Use the new project ID in Vercel env vars
   - Use the new bucket name
   - Use the service account key

**Pros:** Full control, can create keys  
**Cons:** New project, need to migrate data (if any)

---

## Option 2: Use Workload Identity Federation

This allows Vercel to authenticate without service account keys:

### Setup Steps:

1. **Enable Workload Identity Federation API:**
   ```
   gcloud services enable iamcredentials.googleapis.com
   ```

2. **Create Workload Identity Pool:**
   ```bash
   gcloud iam workload-identity-pools create vercel-pool \
     --project=project-85abd5a7-0107-4dd9-b21 \
     --location=global \
     --display-name="Vercel Pool"
   ```

3. **Create Workload Identity Provider:**
   ```bash
   gcloud iam workload-identity-pools providers create-oidc vercel-provider \
     --project=project-85abd5a7-0107-4dd9-b21 \
     --location=global \
     --workload-identity-pool=vercel-pool \
     --display-name="Vercel Provider" \
     --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
     --issuer-uri="https://token.actions.githubusercontent.com"
   ```

4. **Grant Access:**
   ```bash
   gcloud iam service-accounts add-iam-policy-binding \
     SERVICE_ACCOUNT_EMAIL@project-85abd5a7-0107-4dd9-b21.iam.gserviceaccount.com \
     --project=project-85abd5a7-0107-4dd9-b21 \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/vercel-pool/*"
   ```

5. **Configure Vercel:**
   - Add Workload Identity configuration
   - Vercel will authenticate using the provider

**Pros:** No keys needed, more secure  
**Cons:** More complex setup

---

## Option 3: Check Policy Level

The policy might be set at different levels:

1. **Organization Level:** You need Org Admin role
2. **Folder Level:** You need Folder Admin role  
3. **Project Level:** You should have access as Project Owner

Check where the policy is set:
- Go to: https://console.cloud.google.com/iam-admin/orgpolicies
- Look at the policy hierarchy
- See if you can modify it at the project level

---

## Option 4: Use IAM Conditions (If Already Working)

If your IAM conditions are already set up for public read access:

1. **Verify IAM Conditions:**
   - Go to: https://console.cloud.google.com/storage/buckets/color-vibe-previews/permissions
   - Check if `allUsers` has `Storage Object Viewer` with condition

2. **Deploy Without Keys:**
   - Don't add `GCP_SERVICE_ACCOUNT_KEY` to Vercel
   - The code will use public URLs
   - Should work if IAM conditions allow public read

---

## Recommended: Option 1 (New Project)

If you can't modify the policy, creating a new GCP project is the **fastest and easiest** solution:

1. Takes 5 minutes to set up
2. Full control over everything
3. Can create service account keys
4. No policy restrictions

Then update your Vercel environment variables to use the new project.

---

## Quick Decision Tree

- **Can create new project?** → Option 1 (New Project) ⭐
- **Want more secure setup?** → Option 2 (Workload Identity)
- **IAM conditions already work?** → Option 4 (Public URLs)
- **Need to check permissions?** → Option 3 (Check Policy Level)
