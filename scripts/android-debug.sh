#!/bin/bash

echo "🐛 Android Debug Monitor for Labyrinth Leap"
echo "==========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Set Android SDK path
export PATH=$PATH:~/Android/Sdk/platform-tools

print_header() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️ $1${NC}"
}

# Check if device is connected
if ! adb devices | grep -q "device"; then
    print_error "No Android device/emulator connected"
    echo "Please start an emulator or connect a device first"
    exit 1
fi

print_success "Android device detected"

# Check if app is installed
if ! adb shell pm list packages | grep -q "com.example.maze"; then
    print_error "Maze app is not installed"
    echo "Run: ./scripts/quick-android-test.sh"
    exit 1
fi

print_success "Maze app is installed"

# Function to show menu
show_menu() {
    echo ""
    print_header "Debug Options:"
    echo "1. 📱 View live app logs"
    echo "2. 🐛 View debug logs only"
    echo "3. 📊 Monitor performance"
    echo "4. 📸 Take screenshot"
    echo "5. 🔄 Restart app"
    echo "6. 🗑️ Clear app data"
    echo "7. 📋 Export debug logs"
    echo "8. 🎮 Enable remote debugging"
    echo "9. 📱 Device info"
    echo "0. Exit"
    echo ""
    echo -n "Choose option (0-9): "
}

# Function to view live logs
view_live_logs() {
    print_info "Starting live log monitoring (Press Ctrl+C to stop)"
    echo "Filtering for: maze, capacitor, chromium, debug"
    echo ""
    
    adb logcat -c  # Clear existing logs
    adb logcat | grep -i --color=always "maze\|capacitor\|chromium\|debug\|error\|exception"
}

# Function to view debug logs only
view_debug_logs() {
    print_info "Showing debug logs only (Press Ctrl+C to stop)"
    echo ""
    
    adb logcat -c
    adb logcat | grep -i --color=always "MAZE_DEBUG\|🐛\|DEBUG"
}

# Function to monitor performance
monitor_performance() {
    print_info "Monitoring app performance (Press Ctrl+C to stop)"
    echo ""
    
    while true; do
        echo "$(date '+%H:%M:%S') - Memory Usage:"
        adb shell dumpsys meminfo com.example.maze | head -15 | tail -10
        echo ""
        echo "CPU Usage:"
        adb shell top -n 1 | grep "com.example.maze" | head -3
        echo ""
        echo "----------------------------------------"
        sleep 5
    done
}

# Function to take screenshot
take_screenshot() {
    timestamp=$(date +"%Y%m%d_%H%M%S")
    filename="maze_screenshot_${timestamp}.png"
    
    print_info "Taking screenshot..."
    adb shell screencap -p /sdcard/screenshot.png
    adb pull /sdcard/screenshot.png "./${filename}"
    adb shell rm /sdcard/screenshot.png
    
    if [ -f "./${filename}" ]; then
        print_success "Screenshot saved as: ${filename}"
    else
        print_error "Failed to take screenshot"
    fi
}

# Function to restart app
restart_app() {
    print_info "Restarting Maze app..."
    adb shell am force-stop com.example.maze
    sleep 2
    adb shell am start -n com.example.maze/.MainActivity
    print_success "App restarted"
}

# Function to clear app data
clear_app_data() {
    print_warning "This will clear all app data including progress!"
    echo -n "Are you sure? (y/N): "
    read -r confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        print_info "Clearing app data..."
        adb shell pm clear com.example.maze
        print_success "App data cleared"
    else
        print_info "Operation cancelled"
    fi
}

# Function to export debug logs
export_debug_logs() {
    timestamp=$(date +"%Y%m%d_%H%M%S")
    filename="maze_debug_${timestamp}.log"
    
    print_info "Exporting debug logs..."
    adb logcat -d | grep -i "maze\|capacitor\|chromium\|debug" > "./${filename}"
    
    if [ -f "./${filename}" ]; then
        print_success "Debug logs exported as: ${filename}"
        echo "Log entries: $(wc -l < ${filename})"
    else
        print_error "Failed to export logs"
    fi
}

# Function to enable remote debugging
enable_remote_debugging() {
    print_info "Setting up remote debugging..."
    
    # Forward Chrome DevTools port
    adb forward tcp:9222 localabstract:chrome_devtools_remote
    
    print_success "Remote debugging enabled"
    print_info "Open Chrome and go to: chrome://inspect"
    print_info "Or direct WebView debugging: http://localhost:9222"
    
    # Try to open Chrome DevTools automatically
    if command -v google-chrome &> /dev/null; then
        google-chrome "chrome://inspect" &
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser "chrome://inspect" &
    fi
}

# Function to show device info
show_device_info() {
    print_header "Device Information:"
    echo ""
    
    echo "Device Model:"
    adb shell getprop ro.product.model
    echo ""
    
    echo "Android Version:"
    adb shell getprop ro.build.version.release
    echo ""
    
    echo "API Level:"
    adb shell getprop ro.build.version.sdk
    echo ""
    
    echo "Screen Resolution:"
    adb shell wm size
    echo ""
    
    echo "Screen Density:"
    adb shell wm density
    echo ""
    
    echo "Available Memory:"
    adb shell cat /proc/meminfo | grep MemAvailable
    echo ""
    
    echo "App Info:"
    adb shell dumpsys package com.example.maze | grep -A 5 "versionName"
}

# Main loop
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1)
            view_live_logs
            ;;
        2)
            view_debug_logs
            ;;
        3)
            monitor_performance
            ;;
        4)
            take_screenshot
            ;;
        5)
            restart_app
            ;;
        6)
            clear_app_data
            ;;
        7)
            export_debug_logs
            ;;
        8)
            enable_remote_debugging
            ;;
        9)
            show_device_info
            ;;
        0)
            print_info "Exiting debug monitor"
            exit 0
            ;;
        *)
            print_error "Invalid option. Please choose 0-9."
            ;;
    esac
    
    echo ""
    echo "Press Enter to continue..."
    read -r
done