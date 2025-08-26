#!/bin/bash

echo "🚀 Test Maze App with Automatic Log Export"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Set Android SDK path
export PATH=$PATH:~/Android/Sdk/platform-tools

# Step 1: Build and deploy the app
print_info "Step 1: Building and deploying app with fixes..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed"
else
    print_error "Build failed"
    exit 1
fi

npx cap sync android

if [ $? -eq 0 ]; then
    print_success "Sync completed"
else
    print_error "Sync failed"
    exit 1
fi

# Step 2: Check if emulator is running
if ! adb devices | grep -q "device"; then
    print_error "No Android device/emulator connected"
    echo "Please start an emulator first"
    exit 1
fi

print_success "Emulator detected"

# Step 3: Install and start the app
print_info "Step 3: Installing and starting app..."
cd android
./gradlew installDebug

if [ $? -eq 0 ]; then
    print_success "App installed"
else
    print_error "App installation failed"
    exit 1
fi

# Start the app
adb shell am start -n com.example.maze/.MainActivity
print_success "App started"

cd ..

# Step 4: Start automatic log export in background
print_info "Step 4: Starting automatic log export..."
./scripts/auto-log-export.sh &
LOG_PID=$!

print_success "Log export started (PID: $LOG_PID)"

# Step 5: Provide testing instructions
echo ""
print_info "🎮 TESTING INSTRUCTIONS:"
echo "========================"
echo "1. 📱 Open the emulator and find the Maze Puzzler app"
echo "2. 🎯 Tap on the first level (tutorial)"
echo "3. 🐛 Check if the level loads correctly now"
echo "4. 👆 Try different interactions (touch, swipe, etc.)"
echo "5. 🔄 Test going back to level selection"
echo "6. 📊 All interactions are being logged automatically"
echo ""
echo "When you're done testing:"
echo "- Press Ctrl+C to stop logging and save all files"
echo "- Check the 'logs/' directory for exported files"
echo ""

# Step 6: Monitor for specific issues
print_info "🔍 Monitoring for known issues..."
echo "Watching for:"
echo "- Level loading errors"
echo "- Touch event problems"
echo "- Scene transition issues"
echo ""

# Function to handle cleanup
cleanup() {
    print_info "Stopping test session..."
    
    # Kill log export process
    if [ ! -z "$LOG_PID" ]; then
        kill $LOG_PID 2>/dev/null
        wait $LOG_PID 2>/dev/null
    fi
    
    print_success "Test session completed!"
    echo ""
    echo "📁 Check the 'logs/' directory for exported log files"
    echo "📊 Look for the analysis report for a summary"
    
    exit 0
}

# Set up signal handler
trap cleanup SIGINT SIGTERM

# Wait for user to finish testing
print_warning "Press Ctrl+C when you finish testing to save all logs"
echo ""

# Keep script running until user stops it
while true; do
    sleep 5
    
    # Check if app is still running
    if ! adb shell dumpsys activity | grep -q "com.example.maze.*TOP"; then
        print_warning "App is not in foreground. Make sure it's running for proper logging."
    fi
done