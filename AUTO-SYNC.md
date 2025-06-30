# 🔄 Auto-Sync Setup

Your fitness app is now set up with automatic GitHub syncing! Here's how it works:

## 🚀 Quick Start

### Option 1: Development with Auto-Sync
```bash
npm run dev-sync
```
This starts both the development server AND auto-sync in parallel.

### Option 2: Auto-Sync Only
```bash
npm run sync
```
This only starts the auto-sync feature.

### Option 3: Manual Sync
```bash
git add .
git commit -m "Your message"
# Auto-push happens automatically via git hooks
```

## 🔧 How It Works

### Git Hooks (Automatic)
- **Post-commit**: Automatically pushes to GitHub after every commit
- **Pre-push**: Pulls latest changes before pushing

### File Watcher (Real-time)
- Monitors all file changes in your project
- Automatically commits and pushes changes
- Includes timestamps in commit messages

## 📁 What Gets Synced

- All source code files
- Configuration files
- Dependencies (package.json, etc.)
- Documentation

## ⚠️ Important Notes

1. **Authentication**: Make sure you have GitHub access configured
2. **Conflicts**: If there are merge conflicts, manual resolution may be needed
3. **Large Files**: The `.gitignore` file prevents syncing unnecessary files

## 🛠️ Troubleshooting

### If auto-sync fails:
```bash
# Check git status
git status

# Pull latest changes manually
git pull origin staging

# Check for conflicts
git diff
```

### If you want to stop auto-sync:
- Press `Ctrl+C` in the terminal running the sync
- Or close the terminal window

## 🎯 Benefits

✅ **Real-time backup** - Your work is always saved to GitHub  
✅ **Collaboration ready** - Others can see your changes immediately  
✅ **Version control** - Full history of all changes  
✅ **No manual work** - Set it and forget it  

---

**Your fitness app is now automatically syncing with GitHub! 🎉** 