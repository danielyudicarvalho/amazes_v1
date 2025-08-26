#!/bin/bash

echo "🔧 Setting up Android Testing Environment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check if Android Studio is installed
if [ -d ~/android-studio ]; then
    print_status "Android Studio found at ~/android-studio"
else
    print_error "Android Studio not found. Please install Android Studio first."
    exit 1
fi

# Set up environment variables
export ANDROID_HOME=~/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Check if Android SDK is installed
if [ -d "$ANDROID_HOME" ]; then
    print_status "Android SDK found at $ANDROID_HOME"
else
    print_warning "Android SDK not found at $ANDROID_HOME"
    print_info "Please install Android SDK through Android Studio:"
    print_info "1. Open Android Studio"
    print_info "2. Go to Tools → SDK Manager"
    print_info "3. Install Android SDK (API level 30+)"
    print_info "4. Install Android SDK Build-Tools"
    print_info "5. Install Android Emulator"
fi

# Check if ADB is available
if command -v adb &> /dev/null; then
    print_status "ADB is available"
    adb version
else
    print_warning "ADB not found in PATH"
    print_info "Adding Android SDK platform-tools to PATH..."
    
    # Add to current session
    if [ -d "$ANDROID_HOME/platform-tools" ]; then
        export PATH=$PATH:$ANDROID_HOME/platform-tools
        print_status "Added platform-tools to PATH for this session"
    fi
    
    # Add to bash profile for permanent setup
    if ! grep -q "ANDROID_HOME" ~/.bashrc; then
        echo "" >> ~/.bashrc
        echo "# Android SDK" >> ~/.bashrc
        echo "export ANDROID_HOME=~/Android/Sdk" >> ~/.bashrc
        echo "export ANDROID_SDK_ROOT=\$ANDROID_HOME" >> ~/.bashrc
        echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> ~/.bashrc
        echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> ~/.bashrc
        echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> ~/.bashrc
        echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc
        print_status "Added Android SDK paths to ~/.bashrc"
        print_info "Run 'source ~/.bashrc' or restart terminal to apply changes"
    fi
fi

# Check for emulators
print_info "Checking for available Android Virtual Devices..."
if command -v emulator &> /dev/null; then
    emulator -list-avds
    if [ $? -eq 0 ]; then
        print_status "Emulator command is working"
    else
        print_warning "No AVDs found. You'll need to create one in Android Studio."
    fi
else
    print_warning "Emulator command not found"
fi

# Check project setup
print_info "Checking project setup..."

if [ -f "capacitor.config.ts" ]; then
    print_status "Capacitor config found"
else
    print_error "Capacitor config not found"
fi

if [ -d "android" ]; then
    print_status "Android project directory exists"
else
    print_error "Android project not found. Run 'npx cap add android' first"
fi

if [ -f "android/gradlew" ]; then
    print_status "Gradle wrapper found"
else
    print_error "Gradle wrapper not found in android directory"
fi

# Test build
print_info "Testing project build..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Web build successful"
else
    print_error "Web build failed"
    exit 1
fi

# Sync to Android
print_info "Syncing to Android..."
npx cap sync android
if [ $? -eq 0 ]; then
    print_status "Android sync successful"
else
    print_error "Android sync failed"
    exit 1
fi

echo ""
echo "🎯 Setup Complete! Next Steps:"
echo "=============================="
echo "1. Open Android Studio: ~/android-studio/bin/studio.sh"
echo "2. Open this project: File → Open → $(pwd)/android"
echo "3. Wait for Gradle sync to complete"
echo "4. Create an AVD if you don't have one:"
echo "   - Tools → AVD Manager → Create Virtual Device"
echo "   - Choose Pixel 4 or similar"
echo "   - Select API 30+ system image"
echo "5. Run the app: Click green ▶️ button"
echo ""
echo "🔧 Useful Commands:"
echo "==================="
echo "# Check connected devices/emulators"
echo "adb devices"
echo ""
echo "# Start a specific emulator"
echo "emulator -avd <avd_name>"
echo ""
echo "# View app logs"
echo "adb logcat | grep -i maze"
echo ""
echo "# Install APK manually"
echo "adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "# Clear app data"
echo "adb shell pm clear com.example.maze"
echo ""

# Create a quick test script
cat > scripts/quick-android-test.sh << 'EOF'
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
EOF

chmod +x scripts/quick-android-test.sh
print_status "Created quick test script: scripts/quick-android-test.sh"

echo ""
print_info "Setup script completed! You can now test your app on Android."