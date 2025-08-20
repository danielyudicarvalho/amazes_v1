#!/bin/bash

# Launch Android Studio
echo "Launching Android Studio..."

# Check if Android Studio is installed
if [ -f ~/android-studio/bin/studio.sh ]; then
    echo "Found Android Studio installation"
    ~/android-studio/bin/studio.sh &
    echo "Android Studio is starting..."
    echo "This may take a few minutes on first launch."
else
    echo "Android Studio not found. Please install it first."
    echo "Download from: https://developer.android.com/studio"
fi