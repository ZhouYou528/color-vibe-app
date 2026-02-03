# Fix GCS 403 Errors: Enable Public Read Access

## Problem
Images are returning 403 Forbidden errors because the bucket doesn't allow public read access.

## Solution: Grant Public Read Access to the Bucket

### Step 1: Go to Bucket Permissions

1. Go to: https://console.cloud.google.com/storage/buckets
2. Make sure your **new project** (`color-vibe-production`) is selected
3. Click on your bucket: **`color-vibe-previews`**

### Step 2: Grant Public Access

1. Click on the **"Permissions"** tab (at the top)
2. Click **"Grant Access"** button
3. In the **"New principals"** field, enter: `allUsers`
4. In the **"Select a role"** dropdown, select: **`Storage Object Viewer`**
5. Click **"Save"**

### Step 3: Confirm Public Access

You should see a warning about making the bucket public. Click **"Allow public access"** to confirm.

### Step 4: Verify

1. You should now see `allUsers` listed with the `Storage Object Viewer` role
2. Try accessing one of your image URLs in the browser
3. The 403 error should be gone!

---

## Alternative: Use IAM Conditions (More Secure)

If you want to restrict public access to only specific paths (e.g., only `users/` folder):

1. Go to bucket **Permissions** tab
2. Click **"Grant Access"**
3. **New principals:** `allUsers`
4. **Role:** `Storage Object Viewer`
5. Click **"Add Condition"** → **"Create condition"**
6. **Condition name:** `AllowPublicReadUsersPath`
7. **Condition expression:**
   ```
   resource.name.startsWith("projects/_/buckets/color-vibe-previews/objects/users/")
   ```
8. Click **"Save"** on the condition
9. Click **"Save"** on the permissions

This allows public read access only to objects in the `users/` path, not the entire bucket.

---

## Troubleshooting

### Still Getting 403?
- Make sure you're in the correct project
- Check that `allUsers` is listed in Permissions
- Verify the role is `Storage Object Viewer` (not `Storage Object Creator`)
- Try accessing the URL directly in an incognito window

### Public Access Prevention Policy?
If you see an error about "public access prevention", you may need to:
1. Go to bucket **Configuration** tab
2. Look for **"Public access prevention"**
3. If it's enforced, you'll need to use IAM conditions or contact your GCP admin

---

**After making these changes, refresh your Library page and images should load!** 🎉
