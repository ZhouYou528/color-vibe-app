# Git Remote Repository Setup Guide

This guide will help you set up a remote repository and upload your project.

## Step 1: Commit Your Files Locally

First, let's commit all your files to the local Git repository:

```bash
git add .
git commit -m "Initial commit: Color Vibe App with Vercel CI/CD setup"
```

## Step 2: Create a Remote Repository

Choose one of these platforms:

### Option A: GitHub (Recommended)

1. Go to [github.com](https://github.com) and sign in (or create an account)
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `color-vibe-app` (or your preferred name)
   - **Description**: "Next.js app for photo color palette extraction and AI-style vibe analysis"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**
5. Copy the repository URL (e.g., `https://github.com/yourusername/color-vibe-app.git`)

### Option B: GitLab

1. Go to [gitlab.com](https://gitlab.com) and sign in
2. Click **"New project"** → **"Create blank project"**
3. Fill in:
   - **Project name**: `color-vibe-app`
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README
4. Click **"Create project"**
5. Copy the repository URL

### Option C: Bitbucket

1. Go to [bitbucket.org](https://bitbucket.org) and sign in
2. Click **"Create"** → **"Repository"**
3. Fill in:
   - **Repository name**: `color-vibe-app`
   - **Access level**: Choose Public or Private
   - **DO NOT** include README or .gitignore
4. Click **"Create repository"**
5. Copy the repository URL

## Step 3: Add Remote and Push

Once you have your repository URL, run these commands:

```bash
# Add the remote repository
git remote add origin <your-repo-url>

# Example for GitHub:
# git remote add origin https://github.com/yourusername/color-vibe-app.git

# Ensure you're on the main branch
git branch -M main

# Push your code to the remote repository
git push -u origin main
```

## Step 4: Verify

After pushing, verify everything worked:

```bash
# Check remote configuration
git remote -v

# Check your commits
git log --oneline
```

You should see your repository on GitHub/GitLab/Bitbucket with all your files!

## Troubleshooting

### If you get "repository not found" error:
- Check that the repository URL is correct
- Verify you have access to the repository
- Make sure you're authenticated (GitHub CLI or SSH keys)

### If you get authentication errors:

**For HTTPS:**
- GitHub: Use a Personal Access Token instead of password
- GitLab: Use a Personal Access Token
- Bitbucket: Use an App Password

**For SSH (recommended):**
- Set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- Use SSH URL format: `git@github.com:username/repo.git`

### If you need to change the remote URL:
```bash
git remote set-url origin <new-url>
```

## Next Steps

After pushing to remote:
1. ✅ Your code is now backed up in the cloud
2. ✅ You can connect to Vercel (see DEPLOYMENT.md)
3. ✅ CI/CD will work automatically once connected to Vercel
4. ✅ Team members can clone and contribute

## Quick Command Reference

```bash
# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Your commit message"

# Add remote (first time only)
git remote add origin <url>

# Push to remote
git push -u origin main

# Check remotes
git remote -v

# View commit history
git log --oneline
```
