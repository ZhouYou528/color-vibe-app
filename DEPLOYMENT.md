# Vercel CI/CD Deployment Guide

This guide walks you through setting up continuous deployment with Vercel for your Next.js application.

## Prerequisites

- Git installed locally
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)

## Step-by-Step Setup

### 1. Initialize Git Repository

If Git is not already initialized, run:

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Create Remote Repository

1. Create a new repository on GitHub, GitLab, or Bitbucket
2. Add the remote and push:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

### 3. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js settings

### 4. Verify Build Settings

Vercel should auto-detect:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x or 20.x

If needed, verify these in Project Settings → General.

### 5. First Deployment

After connecting, Vercel will:
1. Automatically build your project
2. Deploy to production
3. Provide you with a production URL

### 6. Test the CI/CD Flow

1. Make a small change to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Watch Vercel automatically deploy the changes

## Branch-Based Deployments

### Production Branch
- **Branch**: `main` or `master`
- **URL**: Your production domain
- **Behavior**: Auto-deploys on every push

### Preview Deployments
- **Any other branch**: Gets a unique preview URL
- **Format**: `your-app-git-branch.vercel.app`
- **Pull Requests**: Automatic preview deployments with comments

### Example Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Vercel creates preview deployment automatically
# Share preview URL for review

# Create Pull Request on GitHub/GitLab
# Merge to main → Auto-deploys to production
```

## Environment Variables

If you need environment variables (for future API integrations):

1. Go to Project Settings → Environment Variables
2. Add variables for:
   - **Production**: Production environment
   - **Preview**: Preview/development environments
   - **Development**: Local development

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel handles SSL certificates automatically

## Monitoring

### Vercel Dashboard
- **Deployments**: View all deployments and their status
- **Build Logs**: Real-time build output
- **Analytics**: Enable Vercel Analytics for performance metrics
- **Function Logs**: Serverless function logs (if using API routes)

### Enable Analytics
1. Go to Project Settings → Analytics
2. Enable Vercel Analytics
3. View performance metrics in the dashboard

## GitHub Actions CI (Optional)

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs linting
- Type checks TypeScript
- Verifies build succeeds

This runs automatically on:
- Push to `main`/`master`
- Pull requests

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Verify Node version matches (18.x or 20.x)
- Ensure all dependencies are in `package.json`

### Environment Variables
- Ensure variables are set in Vercel dashboard
- Use correct environment (Production/Preview/Development)
- Never commit secrets to Git

### Rollback
- Go to Deployments in Vercel dashboard
- Click on previous successful deployment
- Click "Promote to Production"

## Next Steps

1. ✅ Test the deployment flow with a small change
2. ✅ Set up custom domain (if needed)
3. ✅ Enable Vercel Analytics
4. ✅ Configure environment variables (when needed)
5. ✅ Set up branch protection rules in Git
6. ✅ Add error tracking (e.g., Sentry integration)

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli) (for local testing)
