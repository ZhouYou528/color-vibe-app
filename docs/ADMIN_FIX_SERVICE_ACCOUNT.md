# Admin Guide: Enable Service Account Key Creation

## Option 1: Disable Organization Policy (Temporary)

### Step 1: Go to Organization Policy

1. Go to: https://console.cloud.google.com/iam-admin/orgpolicies
2. Select your organization (or folder/project if policy is set there)
3. Search for: `iam.disableServiceAccountKeyCreation`
4. Click on the policy

### Step 2: Modify Policy

1. Click "Edit" or "Manage Policy"
2. Change from "Enforced" to "Not Enforced" (or set exception for your project)
3. Save changes

### Step 3: Create Service Account Key

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Select your project: `project-85abd5a7-0107-4dd9-b21`
3. Click "Create Service Account"
4. Name: `color-vibe-app` (or any name)
5. Click "Create and Continue"
6. Add roles:
   - **Storage Object Creator**
   - **Cloud Datastore User** (or **Firestore User**)
7. Click "Continue" → "Done"

### Step 4: Create Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Click "Create"
6. **Download the JSON file** (you won't see it again!)

### Step 5: Re-enable Policy (Optional)

If you want to keep the policy enforced:
1. Go back to Organization Policy
2. Re-enable `iam.disableServiceAccountKeyCreation`
3. The key you created will still work

---

## Option 2: Create Exception for Your Project

Instead of disabling the policy entirely:

1. Go to Organization Policy
2. Edit `iam.disableServiceAccountKeyCreation`
3. Add an exception for your project: `project-85abd5a7-0107-4dd9-b21`
4. Save

Then follow Steps 3-4 above to create the service account and key.

---

## After Creating the Key

1. **Add to Vercel:**
   - Open the JSON file
   - Copy entire contents
   - Go to Vercel → Settings → Environment Variables
   - Add `GCP_SERVICE_ACCOUNT_KEY` with the JSON value
   - Save

2. **Redeploy** your Vercel app

3. **Test** - everything should work!

---

## Quick Checklist

- [ ] Disable/modify organization policy
- [ ] Create service account
- [ ] Grant Storage Object Creator role
- [ ] Grant Firestore User role
- [ ] Create JSON key
- [ ] Download key file
- [ ] Add to Vercel as `GCP_SERVICE_ACCOUNT_KEY`
- [ ] Redeploy Vercel app
- [ ] (Optional) Re-enable organization policy
