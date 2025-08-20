# Android Testing Guide for Labyrinth Leap

## Prerequisites Checklist

Before testing on Android, ensure you have:
- ✅ Android Studio installed and running
- ✅ Android SDK installed (API level 21+)
- ✅ Android Virtual Device (AVD) created
- ✅ Project built and synced

## Step-by-Step Testing Process

### 1. Set Up Android Virtual Device (AVD)

If you haven't created an AVD yet:

1. **Open AVD Manager in Android Studio:**
   - Click `Tools` → `AVD Manager`
   - Or click the AVD Manager icon in the toolbar

2. **Create Virtual Device:**
   - Click `Create Virtual Device`
   - Choose a device definition (recommended: Pixel 4, Pixel 5, or Pixel 6)
   - Click `Next`

3. **Select System Image:**
   - Choose API level 30+ (Android 11+) for best compatibility
   - Download if not already available
   - Click `Next`

4. **Configure AVD:**
   - Name: `Labyrinth_Leap_Test`
   - Advanced Settings (optional):
     - RAM: 2048 MB or higher
     - Internal Storage: 2048 MB
     - SD Card: 512 MB
   - Click `Finish`

### 2. Start the Emulator

1. **Launch AVD:**
   - In AVD Manager, click the ▶️ (Play) button next to your AVD
   - Wait for the emulator to fully boot (may take 2-3 minutes)

2. **Verify Emulator is Ready:**
   - Home screen should be visible
   - Status bar should show signal and battery
   - Device should be responsive to touch

### 3. Run the App

1. **In Android Studio:**
   - Make sure your project is open
   - Select your AVD from the device dropdown
   - Click the green ▶️ (Run) button
   - Or press `Shift + F10`

2. **Build Process:**
   - Gradle will build the project
   - APK will be installed on emulator
   - App will launch automatically

### 4. Testing Checklist

#### 🎮 Core Game Functionality
- [ ] App launches without crashes
- [ ] Main menu appears correctly
- [ ] Level selection works
- [ ] Game starts when level is selected
- [ ] Player can move using touch controls
- [ ] Maze renders correctly
- [ ] Orbs are visible and collectable
- [ ] Score updates when orbs are collected
- [ ] Game completion works
- [ ] Back navigation works

#### 📱 Mobile-Specific Features
- [ ] Touch controls are responsive
- [ ] Screen orientation works (portrait/landscape)
- [ ] App handles device rotation
- [ ] Performance is smooth (30+ FPS)
- [ ] No memory leaks during gameplay
- [ ] App resumes correctly after backgrounding
- [ ] Sound effects work (if implemented)

#### 🔧 Technical Validation
- [ ] No console errors in Chrome DevTools
- [ ] WebView loads all assets correctly
- [ ] Local storage works for progress saving
- [ ] App works offline
- [ ] Different screen sizes render correctly

### 5. Performance Testing

#### Frame Rate Testing
1. **Enable Developer Options on Emulator:**
   - Go to `Settings` → `About emulated device`
   - Tap `Build number` 7 times
   - Go back to `Settings` → `Developer options`
   - Enable `Profile GPU rendering`
   - Select `On screen as bars`

2. **Monitor Performance:**
   - Green bars should stay below the horizontal line (16ms)
   - Consistent frame times indicate smooth performance

#### Memory Testing
1. **In Android Studio:**
   - Open `View` → `Tool Windows` → `Profiler`
   - Select your app process
   - Monitor memory usage during gameplay
   - Look for memory leaks (constantly increasing memory)

### 6. Debug Common Issues

#### App Won't Launch
```bash
# Check if emulator is detected
adb devices

# Clear app data
adb shell pm clear com.example.maze

# Reinstall app
./gradlew installDebug
```

#### Performance Issues
- Reduce maze size in level definitions
- Check for memory leaks in browser DevTools
- Optimize image assets
- Enable hardware acceleration in emulator

#### Touch Controls Not Working
- Verify touch events are properly handled
- Check CSS touch-action properties
- Test with different emulator configurations

#### WebView Issues
- Enable WebView debugging in app
- Use Chrome DevTools to inspect WebView
- Check for CORS issues with local assets

### 7. Testing on Different Devices

#### Test Matrix
| Device Type | Screen Size | API Level | Notes |
|-------------|-------------|-----------|-------|
| Phone Small | 5.0" | API 21+ | Minimum supported |
| Phone Medium | 6.0" | API 28+ | Most common |
| Phone Large | 6.7" | API 30+ | Modern devices |
| Tablet | 10.1" | API 28+ | Landscape testing |

#### Emulator Configurations
```bash
# Create different AVDs for testing
# Small phone
avdmanager create avd -n "Small_Phone" -k "system-images;android-28;google_apis;x86_64" -d "pixel"

# Large phone  
avdmanager create avd -n "Large_Phone" -k "system-images;android-30;google_apis;x86_64" -d "pixel_4_xl"

# Tablet
avdmanager create avd -n "Tablet" -k "system-images;android-30;google_apis;x86_64" -d "pixel_c"
```

### 8. Automated Testing

#### Create Test Script
```bash
#!/bin/bash
# automated-android-test.sh

echo "Starting automated Android testing..."

# Build and sync
npm run build
npx cap sync android

# Start emulator
emulator -avd Labyrinth_Leap_Test -no-snapshot-load &
sleep 60  # Wait for emulator to boot

# Install and run app
cd android
./gradlew installDebug
adb shell am start -n com.example.maze/.MainActivity

echo "App launched. Perform manual testing now."
```

### 9. Release Testing

#### Before Release
- [ ] Test on multiple device configurations
- [ ] Verify all levels are playable
- [ ] Check app permissions
- [ ] Test offline functionality
- [ ] Validate app signing
- [ ] Performance profiling complete

#### Release Build
```bash
# Build release APK
cd android
./gradlew assembleRelease

# Test release build
adb install app/build/outputs/apk/release/app-release.apk
```

### 10. Troubleshooting

#### Common Issues and Solutions

**Issue: App crashes on startup**
```bash
# Check logs
adb logcat | grep -i "maze"
```

**Issue: White screen after launch**
- Check network connectivity
- Verify all assets are bundled
- Check for JavaScript errors

**Issue: Touch not working**
- Verify emulator supports touch
- Check CSS touch-action properties
- Test with hardware device

**Issue: Poor performance**
- Enable hardware acceleration
- Reduce game complexity
- Check for memory leaks

### 11. Reporting Issues

When reporting issues, include:
- Device/emulator specifications
- Android version
- Steps to reproduce
- Screenshots/screen recordings
- Logcat output
- Performance profiler data

### 12. Next Steps

After successful testing:
1. **Optimize Performance**: Based on profiling results
2. **Add Mobile Features**: Haptic feedback, notifications
3. **Test on Real Devices**: Physical device testing
4. **Prepare for Store**: App store optimization
5. **Beta Testing**: Release to limited audience

## Quick Commands Reference

```bash
# Build and sync
npm run build && npx cap sync android

# Open in Android Studio
export CAPACITOR_ANDROID_STUDIO_PATH=~/android-studio/bin/studio.sh
npx cap open android

# Check connected devices
adb devices

# View logs
adb logcat

# Install APK
adb install path/to/app.apk

# Clear app data
adb shell pm clear com.example.maze

# Take screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

## Success Criteria

Your app is ready for release when:
- ✅ Launches consistently without crashes
- ✅ All game features work correctly
- ✅ Performance is smooth (30+ FPS)
- ✅ Works on multiple device sizes
- ✅ Handles device rotation properly
- ✅ Memory usage is stable
- ✅ Touch controls are responsive
- ✅ Progress saving works correctly