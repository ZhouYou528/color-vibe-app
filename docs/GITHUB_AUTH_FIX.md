# Fix GitHub Authentication

GitHub no longer accepts passwords. You need to use a **Personal Access Token** instead.

## Option 1: Personal Access Token (Quickest)

### Step 1: Create a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `color-vibe-app`
4. Select expiration: Choose your preference (90 days, 1 year, or no expiration)
5. **Select scopes**: Check `repo` (this gives full repository access)
6. Click **"Generate token"**
7. **⚠️ IMPORTANT**: Copy the token immediately - you won't see it again!

### Step 2: Use Token Instead of Password

When you run `git push`, use:
- **Username**: `ZhouYou528`
- **Password**: Paste your Personal Access Token (not your GitHub password)

### Step 3: Push Again

```bash
git push -u origin main
```

When prompted:
- Username: `ZhouYou528`
- Password: Paste your token

## Option 2: SSH Keys (Recommended for Long-term)

### Step 1: Check for Existing SSH Keys

```bash
ls -al ~/.ssh
```

Look for files like `id_rsa.pub` or `id_ed25519.pub`

### Step 2: Generate SSH Key (if needed)

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Press Enter to accept default location, then set a passphrase (optional).

### Step 3: Add SSH Key to GitHub

1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. Go to: https://github.com/settings/keys
3. Click **"New SSH key"**
4. Title: `My Mac` (or any name)
5. Key: Paste the public key
6. Click **"Add SSH key"**

### Step 4: Change Remote URL to SSH

```bash
git remote set-url origin git@github.com:ZhouYou528/color-vibe-app.git
git push -u origin main
```

## Option 3: GitHub CLI (Easiest)

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Authenticate
gh auth login

# Follow the prompts to authenticate
# Then push normally
git push -u origin main
```

## Quick Fix (Use Token Now)

1. Get token: https://github.com/settings/tokens → Generate new token (classic) → Check `repo` → Generate
2. Copy the token
3. Run: `git push -u origin main`
4. Username: `ZhouYou528`
5. Password: Paste the token
