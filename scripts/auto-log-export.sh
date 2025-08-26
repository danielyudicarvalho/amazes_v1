#!/bin/bash

echo "📋 Auto Log Export System for Maze Puzzler"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Set Android SDK path
export PATH=$PATH:~/Android/Sdk/platform-tools

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Check if device is connected
if ! adb devices | grep -q "device"; then
    print_error "No Android device/emulator connected"
    echo "Please start an emulator or connect a device first"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Generate timestamp for log files
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_DIR="logs"
FULL_LOG_FILE="${LOG_DIR}/maze_full_${TIMESTAMP}.log"
DEBUG_LOG_FILE="${LOG_DIR}/maze_debug_${TIMESTAMP}.log"
ERROR_LOG_FILE="${LOG_DIR}/maze_errors_${TIMESTAMP}.log"
TOUCH_LOG_FILE="${LOG_DIR}/maze_touch_${TIMESTAMP}.log"
PERFORMANCE_LOG_FILE="${LOG_DIR}/maze_performance_${TIMESTAMP}.log"

print_info "Starting automatic log export..."
print_info "Log files will be saved to:"
echo "  📄 Full logs: ${FULL_LOG_FILE}"
echo "  🐛 Debug logs: ${DEBUG_LOG_FILE}"
echo "  ❌ Error logs: ${ERROR_LOG_FILE}"
echo "  👆 Touch logs: ${TOUCH_LOG_FILE}"
echo "  📊 Performance logs: ${PERFORMANCE_LOG_FILE}"
echo ""

# Clear existing logcat buffer
adb logcat -c

print_success "Log export started. Press Ctrl+C to stop and save logs."
echo ""

# Function to handle cleanup on exit
cleanup() {
    print_info "Stopping log export and saving files..."
    
    # Kill background processes
    jobs -p | xargs -r kill
    
    # Add summary to each log file
    add_summary() {
        local file=$1
        local type=$2
        local count=$(wc -l < "$file" 2>/dev/null || echo "0")
        
        echo "" >> "$file"
        echo "=== LOG SUMMARY ===" >> "$file"
        echo "Export Date: $(date)" >> "$file"
        echo "Log Type: $type" >> "$file"
        echo "Total Lines: $count" >> "$file"
        echo "Device: $(adb shell getprop ro.product.model 2>/dev/null || echo 'Unknown')" >> "$file"
        echo "Android Version: $(adb shell getprop ro.build.version.release 2>/dev/null || echo 'Unknown')" >> "$file"
        echo "App Package: com.example.maze" >> "$file"
        echo "===================" >> "$file"
    }
    
    # Add summaries to all log files
    if [ -f "$FULL_LOG_FILE" ]; then
        add_summary "$FULL_LOG_FILE" "Full Application Logs"
        print_success "Full logs saved: $FULL_LOG_FILE ($(wc -l < "$FULL_LOG_FILE") lines)"
    fi
    
    if [ -f "$DEBUG_LOG_FILE" ]; then
        add_summary "$DEBUG_LOG_FILE" "Debug Messages"
        print_success "Debug logs saved: $DEBUG_LOG_FILE ($(wc -l < "$DEBUG_LOG_FILE") lines)"
    fi
    
    if [ -f "$ERROR_LOG_FILE" ]; then
        add_summary "$ERROR_LOG_FILE" "Errors and Warnings"
        print_success "Error logs saved: $ERROR_LOG_FILE ($(wc -l < "$ERROR_LOG_FILE") lines)"
    fi
    
    if [ -f "$TOUCH_LOG_FILE" ]; then
        add_summary "$TOUCH_LOG_FILE" "Touch and Click Events"
        print_success "Touch logs saved: $TOUCH_LOG_FILE ($(wc -l < "$TOUCH_LOG_FILE") lines)"
    fi
    
    if [ -f "$PERFORMANCE_LOG_FILE" ]; then
        add_summary "$PERFORMANCE_LOG_FILE" "Performance Metrics"
        print_success "Performance logs saved: $PERFORMANCE_LOG_FILE ($(wc -l < "$PERFORMANCE_LOG_FILE") lines)"
    fi
    
    # Create a combined analysis file
    ANALYSIS_FILE="${LOG_DIR}/maze_analysis_${TIMESTAMP}.txt"
    create_analysis_report "$ANALYSIS_FILE"
    
    print_success "Log export completed!"
    echo ""
    echo "📁 All files saved in: $LOG_DIR/"
    echo "📊 Analysis report: $ANALYSIS_FILE"
    
    exit 0
}

# Function to create analysis report
create_analysis_report() {
    local analysis_file=$1
    
    echo "🔍 MAZE PUZZLER - LOG ANALYSIS REPORT" > "$analysis_file"
    echo "====================================" >> "$analysis_file"
    echo "Generated: $(date)" >> "$analysis_file"
    echo "Session: $TIMESTAMP" >> "$analysis_file"
    echo "" >> "$analysis_file"
    
    # Device info
    echo "📱 DEVICE INFORMATION:" >> "$analysis_file"
    echo "Model: $(adb shell getprop ro.product.model 2>/dev/null || echo 'Unknown')" >> "$analysis_file"
    echo "Android: $(adb shell getprop ro.build.version.release 2>/dev/null || echo 'Unknown')" >> "$analysis_file"
    echo "API Level: $(adb shell getprop ro.build.version.sdk 2>/dev/null || echo 'Unknown')" >> "$analysis_file"
    echo "" >> "$analysis_file"
    
    # Log statistics
    echo "📊 LOG STATISTICS:" >> "$analysis_file"
    if [ -f "$FULL_LOG_FILE" ]; then
        echo "Total log entries: $(wc -l < "$FULL_LOG_FILE")" >> "$analysis_file"
    fi
    if [ -f "$ERROR_LOG_FILE" ]; then
        echo "Error entries: $(wc -l < "$ERROR_LOG_FILE")" >> "$analysis_file"
    fi
    if [ -f "$TOUCH_LOG_FILE" ]; then
        echo "Touch events: $(wc -l < "$TOUCH_LOG_FILE")" >> "$analysis_file"
    fi
    echo "" >> "$analysis_file"
    
    # Error analysis
    if [ -f "$ERROR_LOG_FILE" ] && [ -s "$ERROR_LOG_FILE" ]; then
        echo "❌ TOP ERRORS:" >> "$analysis_file"
        grep -i "error\|exception\|failed" "$ERROR_LOG_FILE" | head -10 >> "$analysis_file"
        echo "" >> "$analysis_file"
    fi
    
    # Touch event analysis
    if [ -f "$TOUCH_LOG_FILE" ] && [ -s "$TOUCH_LOG_FILE" ]; then
        echo "👆 TOUCH EVENT SUMMARY:" >> "$analysis_file"
        echo "Clicks: $(grep -c "CLICK" "$TOUCH_LOG_FILE" 2>/dev/null || echo 0)" >> "$analysis_file"
        echo "Touches: $(grep -c "TOUCH" "$TOUCH_LOG_FILE" 2>/dev/null || echo 0)" >> "$analysis_file"
        echo "Level selections: $(grep -c "Level selected" "$TOUCH_LOG_FILE" 2>/dev/null || echo 0)" >> "$analysis_file"
        echo "" >> "$analysis_file"
    fi
    
    # Performance issues
    if [ -f "$FULL_LOG_FILE" ]; then
        echo "⚠️ POTENTIAL ISSUES:" >> "$analysis_file"
        grep -i "failed to load\|unable to open\|error.*level\|exception" "$FULL_LOG_FILE" | head -5 >> "$analysis_file"
        echo "" >> "$analysis_file"
    fi
    
    echo "📋 FILES GENERATED:" >> "$analysis_file"
    echo "- Full logs: $(basename "$FULL_LOG_FILE")" >> "$analysis_file"
    echo "- Debug logs: $(basename "$DEBUG_LOG_FILE")" >> "$analysis_file"
    echo "- Error logs: $(basename "$ERROR_LOG_FILE")" >> "$analysis_file"
    echo "- Touch logs: $(basename "$TOUCH_LOG_FILE")" >> "$analysis_file"
    echo "- Performance logs: $(basename "$PERFORMANCE_LOG_FILE")" >> "$analysis_file"
    echo "" >> "$analysis_file"
    
    print_success "Analysis report created: $analysis_file"
}

# Set up signal handler for cleanup
trap cleanup SIGINT SIGTERM

# Start logging in background with different filters
{
    # Full logs - everything from the maze app
    adb logcat | grep -i "maze\|capacitor" > "$FULL_LOG_FILE" &
    FULL_PID=$!
    
    # Debug logs - debug messages only
    adb logcat | grep -i "🐛\|debug\|MAZE_DEBUG" > "$DEBUG_LOG_FILE" &
    DEBUG_PID=$!
    
    # Error logs - errors and warnings
    adb logcat | grep -i "error\|exception\|failed\|unable\|warning" | grep -i "maze\|capacitor" > "$ERROR_LOG_FILE" &
    ERROR_PID=$!
    
    # Touch logs - touch and click events
    adb logcat | grep -i "touch\|click\|pointer\|TOUCH\|CLICK" | grep -i "maze" > "$TOUCH_LOG_FILE" &
    TOUCH_PID=$!
    
    # Performance logs - memory, CPU, GC
    adb logcat | grep -i "gc\|memory\|performance\|fps\|lag" | grep -i "maze" > "$PERFORMANCE_LOG_FILE" &
    PERFORMANCE_PID=$!
    
    # Show live preview of logs
    print_info "Live log preview (last 10 lines):"
    echo "=================================="
    
    while true; do
        # Clear screen and show latest logs
        clear
        echo -e "${BLUE}📱 Maze Puzzler - Live Log Monitor${NC}"
        echo "=================================="
        echo "Time: $(date)"
        echo "Logs saved to: $LOG_DIR/"
        echo ""
        
        # Show latest entries from each log type
        if [ -f "$FULL_LOG_FILE" ] && [ -s "$FULL_LOG_FILE" ]; then
            echo -e "${GREEN}📄 Latest Full Logs:${NC}"
            tail -3 "$FULL_LOG_FILE" 2>/dev/null | sed 's/^/  /'
            echo ""
        fi
        
        if [ -f "$DEBUG_LOG_FILE" ] && [ -s "$DEBUG_LOG_FILE" ]; then
            echo -e "${CYAN}🐛 Latest Debug:${NC}"
            tail -2 "$DEBUG_LOG_FILE" 2>/dev/null | sed 's/^/  /'
            echo ""
        fi
        
        if [ -f "$ERROR_LOG_FILE" ] && [ -s "$ERROR_LOG_FILE" ]; then
            echo -e "${RED}❌ Latest Errors:${NC}"
            tail -2 "$ERROR_LOG_FILE" 2>/dev/null | sed 's/^/  /'
            echo ""
        fi
        
        if [ -f "$TOUCH_LOG_FILE" ] && [ -s "$TOUCH_LOG_FILE" ]; then
            echo -e "${YELLOW}👆 Latest Touch Events:${NC}"
            tail -2 "$TOUCH_LOG_FILE" 2>/dev/null | sed 's/^/  /'
            echo ""
        fi
        
        echo "Press Ctrl+C to stop and save all logs"
        echo "======================================="
        
        sleep 2
    done
}

# Wait for background processes
wait