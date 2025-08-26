// Debug system initialization
import { debugLogger } from './DebugLogger';
import { touchDebugger } from './TouchDebugger';

export class DebugInit {
  private static initialized = false;

  static initialize() {
    if (DebugInit.initialized) return;
    DebugInit.initialized = true;

    debugLogger.info('Debug', 'Initializing debug system');

    // Activate touch debugging
    touchDebugger.activate();

    // Log app startup
    debugLogger.info('App', 'Application starting', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight
      },
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      devicePixelRatio: window.devicePixelRatio,
      timestamp: new Date().toISOString()
    });

    // Log Capacitor info if available
    if (window.Capacitor) {
      debugLogger.info('Capacitor', 'Capacitor detected', {
        platform: window.Capacitor.getPlatform(),
        isNativePlatform: window.Capacitor.isNativePlatform(),
        plugins: Object.keys(window.Capacitor.Plugins || {})
      });
    }

    // Log Phaser info when available
    if (window.Phaser) {
      debugLogger.info('Phaser', 'Phaser detected', {
        version: window.Phaser.VERSION
      });
    }

    // Monitor window resize
    window.addEventListener('resize', () => {
      debugLogger.info('Window', 'Window resized', {
        newSize: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    });

    // Monitor orientation change
    window.addEventListener('orientationchange', () => {
      debugLogger.info('Device', 'Orientation changed', {
        orientation: screen.orientation?.angle || 'unknown',
        type: screen.orientation?.type || 'unknown'
      });
    });

    // Monitor visibility change (app backgrounding/foregrounding)
    document.addEventListener('visibilitychange', () => {
      debugLogger.info('App', `App ${document.hidden ? 'backgrounded' : 'foregrounded'}`, {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      });
    });

    // Monitor page load events
    window.addEventListener('load', () => {
      debugLogger.info('App', 'Page fully loaded');
    });

    window.addEventListener('beforeunload', () => {
      debugLogger.info('App', 'Page unloading');
    });

    // Add global debug commands
    (window as any).debugCommands = {
      showDebug: () => debugLogger.show(),
      hideDebug: () => debugLogger.hide(),
      toggleDebug: () => debugLogger.toggle(),
      clearDebug: () => debugLogger.clear(),
      exportLogs: () => {
        const logs = debugLogger.exportLogs();
        console.log('Exported logs:', logs);
        return logs;
      },
      enableTouchDebug: () => touchDebugger.activate(),
      disableTouchDebug: () => touchDebugger.deactivate(),
      logTest: () => {
        debugLogger.info('Test', 'Test log message', { test: true });
        debugLogger.click('Test', 'Test click', { x: 100, y: 100 }, { x: 100, y: 100 });
        debugLogger.error('Test', 'Test error', new Error('Test error'));
      }
    };

    debugLogger.info('Debug', 'Debug system initialized successfully', {
      touchDebugging: true,
      globalCommands: Object.keys((window as any).debugCommands)
    });

    // Show debug interface by default in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        debugLogger.show();
        debugLogger.info('Debug', 'Debug interface shown (development mode)');
      }, 1000);
    }
  }

  static logPhaserEvent(scene: string, event: string, data?: any) {
    debugLogger.game('Phaser', `${scene}: ${event}`, data);
  }

  static logCapacitorEvent(plugin: string, method: string, data?: any) {
    debugLogger.info('Capacitor', `${plugin}.${method}`, data);
  }

  static logLevelEvent(levelId: string, event: string, data?: any) {
    debugLogger.level('Level', `${levelId}: ${event}`, data);
  }

  static logUserAction(action: string, data?: any, position?: { x: number; y: number }) {
    debugLogger.click('User', action, data, position);
  }
}

// Auto-initialize when module is loaded
DebugInit.initialize();