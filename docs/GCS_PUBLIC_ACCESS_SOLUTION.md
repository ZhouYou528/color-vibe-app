# GCS Public Access Solution

## Problem
- Your bucket has "public access prevention" enabled
- Signed URLs require a service account key (which you can't create)
- You need to display images publicly

## Solutions

### Option 1: Get Service Account Key from Admin (Recommended)

Ask your GCP Organization Policy Administrator to:
1. Create a service account for your project
2. Grant it "Storage Object Creator" and "Storage Object Viewer" roles
3. Create a key file for that service account
4. Provide you with the JSON key file

Then update `.env.local`:
```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

The code will automatically use signed URLs with the service account.

### Option 2: Use IAM Conditions (No Keys Needed)

Configure IAM to allow public read access to specific paths:

1. Go to: https://console.cloud.google.com/storage/buckets/color-vibe-previews/permissions
2. Click "Grant Access"
3. Add:
   - **Principal**: `allUsers`
   - **Role**: `Storage Object Viewer`
   - **Condition**: 
     ```
     resource.name.startsWith("projects/_/buckets/color-vibe-previews/objects/users/")
     ```
4. This allows public read access only to objects in the `users/` path

Then the public URLs will work without signed URLs.

### Option 3: Temporary Workaround - Use a Different Storage

If neither option works immediately, you could:
- Use a different GCP project where you have full access
- Use a different storage service temporarily
- Store images as base64 in Firestore (not recommended for production)

## Current Status

The code currently returns public URLs (`https://storage.googleapis.com/...`). These will only work if:
- The bucket is public, OR
- IAM conditions allow public read access to your paths, OR
- You have a service account key for signed URLs

## Next Steps

1. **Try Option 2 first** (IAM conditions) - no keys needed
2. If that doesn't work, **contact your GCP admin** for Option 1
3. Once you have a solution, images will display correctly
