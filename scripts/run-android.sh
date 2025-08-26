#!/bin/bash

# Build and run on Android emulator
echo "Building web app..."
npm run build

echo "Syncing to Android..."
export CAPACITOR_ANDROID_STUDIO_PATH="/opt/android-studio/bin/studio.sh"
npx cap sync android

echo "Opening in Android Studio..."
npx cap open android

echo "Instructions:"
echo "1. Make sure an Android emulator is running"
echo "2. In Android Studio, click the 'Run' button (green play icon)"
echo "3. Select your emulator from the device list"
echo "4. The app will install and launch on the emulator"