#!/bin/bash

# Deploy script - commits and pushes all changes to staging

echo "🚀 Starting deployment to staging..."

# Check if there are any changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
else
    echo "📝 Committing changes..."
    git add .
    git commit -m "Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo "📤 Pushing to staging..."
git push origin staging

echo "✅ Deployment complete!"
echo "🌐 Your app should be live on staging" 