#!/bin/bash

# Quick setup script for local development with new GCP project
# Usage: ./scripts/setup-local-dev.sh YOUR_NEW_PROJECT_ID

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your new GCP project ID"
    echo "Usage: ./scripts/setup-local-dev.sh YOUR_NEW_PROJECT_ID"
    exit 1
fi

NEW_PROJECT_ID=$1

echo "🚀 Setting up local development for project: $NEW_PROJECT_ID"
echo ""

# Set gcloud project
echo "📋 Setting gcloud default project..."
gcloud config set project "$NEW_PROJECT_ID"

# Verify project is set
CURRENT_PROJECT=$(gcloud config get-value project)
if [ "$CURRENT_PROJECT" != "$NEW_PROJECT_ID" ]; then
    echo "❌ Error: Failed to set project. Current project: $CURRENT_PROJECT"
    exit 1
fi

echo "✅ Project set to: $CURRENT_PROJECT"
echo ""

# Authenticate with ADC
echo "🔐 Authenticating with Application Default Credentials..."
echo "   (This will open a browser for you to sign in)"
gcloud auth application-default login

echo ""
echo "✅ Authentication complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env.local:"
echo "      - Set GCP_PROJECT_ID=$NEW_PROJECT_ID"
echo "      - Verify GCS_BUCKET matches your bucket name"
echo "      - Set FIRESTORE_DATABASE_ID (or leave empty for default)"
echo "   2. (Optional) Add GCP_SERVICE_ACCOUNT_KEY to .env.local if you prefer key-based auth"
echo "   3. Run: npm run dev"
echo ""
echo "📚 See docs/LOCAL_DEV_UPDATE.md for detailed instructions"
