#!/bin/bash
echo "🚀 Quick Android Test"
echo "===================="

# Build and sync
npm run build && npx cap sync android

# Check for running emulators
if adb devices | grep -q "emulator"; then
    echo "✅ Emulator detected"
    
    # Install and run
    cd android
    ./gradlew installDebug
    adb shell am start -n com.example.maze/.MainActivity
    
    echo "📱 App should now be running on emulator"
    echo "📋 Check the app and test the game functionality"
else
    echo "⚠️  No emulator detected"
    echo "Please start an emulator first:"
    echo "1. Open Android Studio"
    echo "2. Tools → AVD Manager"
    echo "3. Click ▶️ next to your AVD"
    echo "4. Wait for emulator to boot"
    echo "5. Run this script again"
fi
