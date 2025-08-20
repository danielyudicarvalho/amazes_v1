#!/bin/bash

echo "🔧 Applying Level Loading Fixes..."

# Build with fixes
echo "📦 Building..."
npm run build

# Sync to Android
echo "🔄 Syncing to Android..."
npx cap sync android

# Open in Android Studio
echo "📱 Opening in Android Studio..."
export CAPACITOR_ANDROID_STUDIO_PATH=~/android-studio/bin/studio.sh
npx cap open android

echo ""
echo "✅ Fixes Applied! Next steps:"
echo "1. In Android Studio, click the green ▶️ Run button"
echo "2. Check that 'Levels: 10' appears instead of 'Levels: 0'"
echo "3. Verify level buttons are visible"
echo "4. Test tapping a level to start the game"
echo ""
echo "🐛 If issues persist:"
echo "- Check Logcat for error messages"
echo "- Clear app data: adb shell pm clear com.example.maze"
echo "- Check browser console at chrome://inspect/#devices"