#!/bin/bash

echo "🚀 Testing Labyrinth Leap on Android"
echo "======================================"

# Set Android Studio path
export CAPACITOR_ANDROID_STUDIO_PATH=~/android-studio/bin/studio.sh

echo "📦 Building web app..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo "🔄 Syncing to Android..."
npx cap sync android

if [ $? -eq 0 ]; then
    echo "✅ Sync successful"
else
    echo "❌ Sync failed"
    exit 1
fi

echo "📱 Opening in Android Studio..."
npx cap open android

echo ""
echo "🎯 Next Steps in Android Studio:"
echo "1. Wait for Gradle sync to complete"
echo "2. Create/start an Android Virtual Device (AVD)"
echo "3. Click the green ▶️ Run button"
echo "4. Select your emulator from the device list"
echo "5. Wait for the app to install and launch"
echo ""
echo "📋 Testing Checklist:"
echo "- App launches without crashes"
echo "- Main menu appears"
echo "- Level selection works"
echo "- Touch controls respond"
echo "- Game plays smoothly"
echo "- Progress saves correctly"
echo ""
echo "📖 For detailed testing guide, see: docs/ANDROID_TESTING_GUIDE.md"