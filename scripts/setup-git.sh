#!/bin/bash

# Git Setup Script for Vercel Deployment
# This script helps initialize Git and prepare for deployment

set -e

echo "🚀 Setting up Git repository for Vercel deployment..."

# Check if Git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "Staging all files..."
    git add .
    
    echo "Creating initial commit..."
    git commit -m "Initial commit: Color Vibe App"
    echo "✅ Initial commit created"
else
    echo "No changes to commit"
fi

# Check if remote is configured
if ! git remote | grep -q "^origin$"; then
    echo ""
    echo "⚠️  No remote repository configured yet."
    echo ""
    echo "Next steps:"
    echo "1. Create a repository on GitHub/GitLab/Bitbucket"
    echo "2. Run: git remote add origin <your-repo-url>"
    echo "3. Run: git branch -M main"
    echo "4. Run: git push -u origin main"
    echo ""
else
    echo "✅ Remote repository configured"
    git remote -v
fi

echo ""
echo "📋 Summary:"
echo "  - Git repository: ✅ Initialized"
echo "  - Configuration files: ✅ Created (vercel.json, .github/workflows/ci.yml)"
echo ""
echo "Next: Push to remote and connect to Vercel"
echo "See DEPLOYMENT.md for detailed instructions"
