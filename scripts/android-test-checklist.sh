#!/bin/bash

echo "📱 Android Testing Checklist for Labyrinth Leap"
echo "==============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_test() {
    echo -e "${BLUE}🧪${NC} $1"
}

print_pass() {
    echo -e "${GREEN}✅${NC} $1"
}

print_fail() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ️${NC} $1"
}

# Check if app is running
export PATH=$PATH:~/Android/Sdk/platform-tools

echo ""
print_test "Checking if app is running on emulator..."

if adb devices | grep -q "device"; then
    print_pass "Emulator is connected"
    
    # Check if app is installed
    if adb shell pm list packages | grep -q "com.example.maze"; then
        print_pass "App is installed"
        
        # Check if app is running
        if adb shell dumpsys activity | grep -q "com.example.maze.*TOP"; then
            print_pass "App is currently running (TOP activity)"
        else
            print_info "App is installed but not currently active"
            echo "Starting app..."
            adb shell am start -n com.example.maze/.MainActivity
        fi
    else
        print_fail "App is not installed"
        echo "Run: ./scripts/quick-android-test.sh"
        exit 1
    fi
else
    print_fail "No emulator connected"
    echo "Please start an emulator first"
    exit 1
fi

echo ""
echo "🎮 Manual Testing Checklist"
echo "==========================="
echo "Please test the following on your emulator:"
echo ""

# Core functionality tests
echo "📋 Core Functionality:"
echo "  [ ] App launches without crashing"
echo "  [ ] Main menu/level selection appears"
echo "  [ ] Can select a level (try Level 1 - Tutorial)"
echo "  [ ] Game scene loads correctly"
echo "  [ ] Maze is visible and properly rendered"
echo "  [ ] Player character is visible"
echo "  [ ] Can move player by touching/swiping"
echo "  [ ] Orbs are visible in the maze"
echo "  [ ] Orbs disappear when collected"
echo "  [ ] Score increases when collecting orbs"
echo "  [ ] Can reach the goal position"
echo "  [ ] Level completion works"
echo "  [ ] Can return to level selection"
echo ""

# Mobile-specific tests
echo "📱 Mobile-Specific Features:"
echo "  [ ] Touch controls are responsive"
echo "  [ ] No lag when moving player"
echo "  [ ] Screen orientation works (try rotating device)"
echo "  [ ] App handles device rotation gracefully"
echo "  [ ] Performance is smooth (no stuttering)"
echo "  [ ] App resumes correctly after backgrounding"
echo "  [ ] Back button navigation works"
echo ""

# Technical tests
echo "🔧 Technical Validation:"
echo "  [ ] No visible errors or crashes"
echo "  [ ] All UI elements are properly sized"
echo "  [ ] Text is readable on mobile screen"
echo "  [ ] Game fits screen properly"
echo "  [ ] No memory warnings in logcat"
echo ""

echo "🛠️ Debugging Commands:"
echo "======================"
echo "# View app logs:"
echo "adb logcat | grep -i 'maze\\|capacitor\\|chromium'"
echo ""
echo "# Check app memory usage:"
echo "adb shell dumpsys meminfo com.example.maze"
echo ""
echo "# Take screenshot:"
echo "adb shell screencap -p /sdcard/screenshot.png"
echo "adb pull /sdcard/screenshot.png ."
echo ""
echo "# Restart app:"
echo "adb shell am force-stop com.example.maze"
echo "adb shell am start -n com.example.maze/.MainActivity"
echo ""
echo "# Clear app data (reset progress):"
echo "adb shell pm clear com.example.maze"
echo ""

# Performance monitoring
echo "📊 Performance Monitoring:"
echo "========================="
echo "# Monitor CPU usage:"
echo "adb shell top | grep maze"
echo ""
echo "# Monitor memory:"
echo "adb shell dumpsys meminfo com.example.maze | head -20"
echo ""

# Start performance monitoring in background
print_info "Starting performance monitoring..."
adb shell "dumpsys meminfo com.example.maze | head -10" 2>/dev/null

echo ""
echo "🎯 Test Results:"
echo "==============="
echo "After testing, please report:"
echo "1. Which features work correctly ✅"
echo "2. Any issues or bugs found ❌"
echo "3. Performance observations 📊"
echo "4. Suggestions for improvements 💡"
echo ""
echo "Happy testing! 🚀"