#!/bin/bash

# Auto-sync script for fitness app
# Watches for file changes and automatically syncs with GitHub

echo "🔄 Starting auto-sync for fitness app..."
echo "📁 Watching for changes in: $(pwd)"
echo "🌐 Auto-syncing with: https://github.com/guilherme-t-l/fitness-app/tree/staging"
echo ""
echo "Press Ctrl+C to stop auto-sync"
echo ""

# Function to sync changes
sync_changes() {
    echo "🔄 Changes detected! Syncing..."
    
    # Add all changes
    git add .
    
    # Check if there are changes to commit
    if git diff --cached --quiet; then
        echo "ℹ️  No changes to commit"
        return
    fi
    
    # Commit with timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    git commit -m "Auto-sync: $timestamp"
    
    echo "✅ Changes committed and pushed to GitHub!"
}

# Watch for changes and sync
while true; do
    # Wait for any file changes
    inotifywait -r -e modify,create,delete,move . 2>/dev/null || fswatch -r . 2>/dev/null || echo "Waiting for changes..."
    
    # Sync changes
    sync_changes
    
    # Small delay to avoid excessive syncing
    sleep 2
done 