#!/bin/bash

echo "🔍 Maze Puzzler Log Analyzer"
echo "============================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️ $1${NC}"
}

# Check if logs directory exists
if [ ! -d "logs" ]; then
    print_error "No logs directory found. Run the test script first."
    exit 1
fi

# Find the most recent log files
LATEST_FULL_LOG=$(ls -t logs/maze_full_*.log 2>/dev/null | head -1)
LATEST_DEBUG_LOG=$(ls -t logs/maze_debug_*.log 2>/dev/null | head -1)
LATEST_ERROR_LOG=$(ls -t logs/maze_errors_*.log 2>/dev/null | head -1)
LATEST_TOUCH_LOG=$(ls -t logs/maze_touch_*.log 2>/dev/null | head -1)

if [ -z "$LATEST_FULL_LOG" ]; then
    print_error "No log files found. Run the test script first."
    exit 1
fi

print_success "Analyzing latest log files..."
echo "📄 Full log: $(basename "$LATEST_FULL_LOG")"
echo "🐛 Debug log: $(basename "$LATEST_DEBUG_LOG")"
echo "❌ Error log: $(basename "$LATEST_ERROR_LOG")"
echo "👆 Touch log: $(basename "$LATEST_TOUCH_LOG")"
echo ""

# Analysis functions
analyze_level_loading() {
    print_header "📋 LEVEL LOADING ANALYSIS"
    echo "=========================="
    
    if [ -f "$LATEST_FULL_LOG" ]; then
        # Check for level loading success/failure
        local level_loads=$(grep -c "Level loaded successfully" "$LATEST_FULL_LOG" 2>/dev/null || echo 0)
        local level_failures=$(grep -c "Failed to load level\|Level data not found" "$LATEST_FULL_LOG" 2>/dev/null || echo 0)
        
        echo "✅ Successful level loads: $level_loads"
        echo "❌ Failed level loads: $level_failures"
        
        if [ "$level_failures" -gt 0 ]; then
            print_warning "Level loading failures detected:"
            grep -i "failed to load level\|level data not found\|unable to open.*level" "$LATEST_FULL_LOG" | head -3
        fi
        
        # Check for ID mapping issues
        local id_issues=$(grep -c "Unknown variable dynamic import\|Failed to import.*Error" "$LATEST_FULL_LOG" 2>/dev/null || echo 0)
        if [ "$id_issues" -gt 0 ]; then
            print_error "Level ID mapping issues detected: $id_issues"
            grep -i "unknown variable dynamic import\|failed to import" "$LATEST_FULL_LOG" | head -2
        fi
    fi
    echo ""
}

analyze_touch_events() {
    print_header "👆 TOUCH EVENT ANALYSIS"
    echo "======================="
    
    if [ -f "$LATEST_TOUCH_LOG" ]; then
        local total_touches=$(wc -l < "$LATEST_TOUCH_LOG" 2>/dev/null || echo 0)
        local clicks=$(grep -c "CLICK" "$LATEST_TOUCH_LOG" 2>/dev/null || echo 0)
        local touches=$(grep -c "TOUCH" "$LATEST_TOUCH_LOG" 2>/dev/null || echo 0)
        local level_selections=$(grep -c "Level selected" "$LATEST_TOUCH_LOG" 2>/dev/null || echo 0)
        
        echo "📊 Total touch events: $total_touches"
        echo "🖱️ Clicks: $clicks"
        echo "👆 Touches: $touches"
        echo "🎯 Level selections: $level_selections"
        
        if [ "$level_selections" -gt 0 ]; then
            print_success "User successfully selected levels"
            echo "Selected levels:"
            grep "Level selected" "$LATEST_TOUCH_LOG" | sed 's/^/  /'
        fi
    fi
    echo ""
}

analyze_errors() {
    print_header "❌ ERROR ANALYSIS"
    echo "=================="
    
    if [ -f "$LATEST_ERROR_LOG" ]; then
        local total_errors=$(wc -l < "$LATEST_ERROR_LOG" 2>/dev/null || echo 0)
        echo "📊 Total error entries: $total_errors"
        
        if [ "$total_errors" -gt 0 ]; then
            print_warning "Top errors found:"
            
            # Categorize errors
            echo ""
            echo "🔍 Asset loading errors:"
            grep -i "unable to open asset\|failed to find entry" "$LATEST_ERROR_LOG" | head -3 | sed 's/^/  /'
            
            echo ""
            echo "🔍 Level loading errors:"
            grep -i "level.*not found\|failed to load level" "$LATEST_ERROR_LOG" | head -3 | sed 's/^/  /'
            
            echo ""
            echo "🔍 JavaScript errors:"
            grep -i "unknown variable\|failed to import" "$LATEST_ERROR_LOG" | head -3 | sed 's/^/  /'
            
            echo ""
            echo "🔍 Other errors:"
            grep -v -i "unable to open asset\|failed to find entry\|level.*not found\|failed to load level\|unknown variable\|failed to import" "$LATEST_ERROR_LOG" | head -3 | sed 's/^/  /'
        else
            print_success "No errors detected!"
        fi
    fi
    echo ""
}

analyze_performance() {
    print_header "📊 PERFORMANCE ANALYSIS"
    echo "======================="
    
    if [ -f "$LATEST_FULL_LOG" ]; then
        # Check for performance indicators
        local gc_events=$(grep -c "GC freed\|Garbage Collection" "$LATEST_FULL_LOG" 2>/dev/null || echo 0)
        local memory_warnings=$(grep -c "memory.*warning\|out of memory" "$LATEST_FULL_LOG" 2>/dev/null || echo 0)
        
        echo "🗑️ Garbage collection events: $gc_events"
        echo "⚠️ Memory warnings: $memory_warnings"
        
        # Check app startup time
        local startup_time=$(grep "Displayed.*MainActivity" "$LATEST_FULL_LOG" | tail -1 | grep -o "[0-9]*ms" | head -1)
        if [ ! -z "$startup_time" ]; then
            echo "🚀 App startup time: $startup_time"
        fi
        
        # Check for crashes
        local crashes=$(grep -c "app died\|force.*stop" "$LATEST_FULL_LOG" 2>/dev/null || echo 0)
        if [ "$crashes" -gt 0 ]; then
            print_error "App crashes detected: $crashes"
        else
            print_success "No crashes detected"
        fi
    fi
    echo ""
}

analyze_debug_flow() {
    print_header "🐛 DEBUG FLOW ANALYSIS"
    echo "======================"
    
    if [ -f "$LATEST_DEBUG_LOG" ]; then
        echo "🔄 Scene transitions:"
        grep -i "scene.*created\|starting.*scene" "$LATEST_DEBUG_LOG" | sed 's/^/  /'
        
        echo ""
        echo "🎮 Game events:"
        grep -i "game.*initialized\|level.*loaded\|core.*initialized" "$LATEST_DEBUG_LOG" | sed 's/^/  /'
        
        echo ""
        echo "📱 System events:"
        grep -i "debug.*initialized\|capacitor.*detected\|phaser.*detected" "$LATEST_DEBUG_LOG" | head -3 | sed 's/^/  /'
    fi
    echo ""
}

# Run all analyses
analyze_level_loading
analyze_touch_events
analyze_errors
analyze_performance
analyze_debug_flow

# Generate summary
print_header "📋 SUMMARY & RECOMMENDATIONS"
echo "============================"

# Check if the main issue is fixed
if [ -f "$LATEST_ERROR_LOG" ]; then
    local level_id_errors=$(grep -c "Level data not found for ID: 1\|Unknown variable dynamic import.*1\.json" "$LATEST_ERROR_LOG" 2>/dev/null || echo 0)
    
    if [ "$level_id_errors" -gt 0 ]; then
        print_error "❌ MAIN ISSUE STILL EXISTS: Level ID mapping problem"
        echo "The app is still trying to load level '1' instead of 'level-001-tutorial'"
        echo "Check GameScene.ts level loading logic"
    else
        print_success "✅ MAIN ISSUE APPEARS FIXED: No level ID mapping errors detected"
    fi
fi

# Check overall app health
if [ -f "$LATEST_TOUCH_LOG" ]; then
    local user_interactions=$(wc -l < "$LATEST_TOUCH_LOG" 2>/dev/null || echo 0)
    if [ "$user_interactions" -gt 10 ]; then
        print_success "✅ Good user interaction detected ($user_interactions events)"
    else
        print_warning "⚠️ Limited user interaction detected ($user_interactions events)"
    fi
fi

echo ""
print_info "💡 Next steps:"
echo "1. If errors persist, check the detailed error analysis above"
echo "2. Test the specific failing scenarios manually"
echo "3. Use the debug interface in the app (🐛 button) for real-time debugging"
echo "4. Run this analyzer again after making fixes"

echo ""
print_success "Analysis complete! Check the detailed sections above for specific issues."