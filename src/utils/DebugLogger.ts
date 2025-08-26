// Debug logging system for mobile testing
export interface DebugEvent {
  timestamp: number;
  type: 'click' | 'touch' | 'scene' | 'level' | 'game' | 'error' | 'info';
  category: string;
  message: string;
  data?: any;
  position?: { x: number; y: number };
}

export class DebugLogger {
  private static instance: DebugLogger;
  private events: DebugEvent[] = [];
  private maxEvents = 100;
  private debugElement: HTMLElement | null = null;
  private isVisible = false;
  private logToConsole = true;
  private logToScreen = true;

  private constructor() {
    this.createDebugInterface();
    this.setupGlobalErrorHandling();
  }

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  log(type: DebugEvent['type'], category: string, message: string, data?: any, position?: { x: number; y: number }) {
    const event: DebugEvent = {
      timestamp: Date.now(),
      type,
      category,
      message,
      data,
      position
    };

    this.events.push(event);
    
    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console
    if (this.logToConsole) {
      const timeStr = new Date(event.timestamp).toLocaleTimeString();
      const posStr = position ? ` @(${position.x},${position.y})` : '';
      const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
      
      console.log(`🐛 [${timeStr}] ${type.toUpperCase()} | ${category} | ${message}${posStr}${dataStr}`);
    }

    // Update screen display
    if (this.logToScreen && this.isVisible) {
      this.updateDebugDisplay();
    }

    // Send to Android logcat with specific tag
    if (window.Android) {
      try {
        window.Android.log(`MAZE_DEBUG: [${type}] ${category}: ${message}`);
      } catch (e) {
        // Fallback if Android interface not available
      }
    }
  }

  // Convenience methods
  click(category: string, message: string, data?: any, position?: { x: number; y: number }) {
    this.log('click', category, message, data, position);
  }

  touch(category: string, message: string, data?: any, position?: { x: number; y: number }) {
    this.log('touch', category, message, data, position);
  }

  scene(category: string, message: string, data?: any) {
    this.log('scene', category, message, data);
  }

  level(category: string, message: string, data?: any) {
    this.log('level', category, message, data);
  }

  game(category: string, message: string, data?: any) {
    this.log('game', category, message, data);
  }

  error(category: string, message: string, error?: any) {
    this.log('error', category, message, error);
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  // Debug interface management
  toggle() {
    this.isVisible = !this.isVisible;
    if (this.debugElement) {
      this.debugElement.style.display = this.isVisible ? 'block' : 'none';
      if (this.isVisible) {
        this.updateDebugDisplay();
      }
    }
  }

  show() {
    this.isVisible = true;
    if (this.debugElement) {
      this.debugElement.style.display = 'block';
      this.updateDebugDisplay();
    }
  }

  hide() {
    this.isVisible = false;
    if (this.debugElement) {
      this.debugElement.style.display = 'none';
    }
  }

  clear() {
    this.events = [];
    this.updateDebugDisplay();
    console.clear();
  }

  getEvents(): DebugEvent[] {
    return [...this.events];
  }

  getRecentEvents(count: number = 10): DebugEvent[] {
    return this.events.slice(-count);
  }

  exportLogs(): string {
    return JSON.stringify(this.events, null, 2);
  }

  private createDebugInterface() {
    // Create debug overlay
    this.debugElement = document.createElement('div');
    this.debugElement.id = 'debug-overlay';
    this.debugElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 10px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      overflow-y: auto;
      display: none;
      border: 1px solid #00ff00;
    `;

    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '🐛';
    toggleButton.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      border: 1px solid #00ff00;
      border-radius: 50%;
      font-size: 16px;
      z-index: 10001;
      cursor: pointer;
    `;

    toggleButton.addEventListener('click', () => this.toggle());

    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = '🗑️';
    clearButton.style.cssText = `
      position: fixed;
      top: 60px;
      left: 10px;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.8);
      color: #ff0000;
      border: 1px solid #ff0000;
      border-radius: 50%;
      font-size: 16px;
      z-index: 10001;
      cursor: pointer;
    `;

    clearButton.addEventListener('click', () => this.clear());

    // Add to DOM when ready
    if (document.body) {
      document.body.appendChild(this.debugElement);
      document.body.appendChild(toggleButton);
      document.body.appendChild(clearButton);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(this.debugElement!);
        document.body.appendChild(toggleButton);
        document.body.appendChild(clearButton);
      });
    }

    // Add keyboard shortcut (Ctrl+D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  private updateDebugDisplay() {
    if (!this.debugElement || !this.isVisible) return;

    const recentEvents = this.getRecentEvents(20);
    const html = recentEvents.map(event => {
      const time = new Date(event.timestamp).toLocaleTimeString();
      const typeColor = this.getTypeColor(event.type);
      const posStr = event.position ? ` @(${event.position.x},${event.position.y})` : '';
      
      return `<div style="color: ${typeColor}; margin-bottom: 2px;">
        [${time}] ${event.type.toUpperCase()}<br>
        ${event.category}: ${event.message}${posStr}
        ${event.data ? `<br><small>${JSON.stringify(event.data)}</small>` : ''}
      </div>`;
    }).join('');

    this.debugElement.innerHTML = `
      <div style="color: #00ff00; font-weight: bold; margin-bottom: 10px;">
        🐛 Debug Log (${this.events.length} events)
      </div>
      ${html}
    `;

    // Auto-scroll to bottom
    this.debugElement.scrollTop = this.debugElement.scrollHeight;
  }

  private getTypeColor(type: DebugEvent['type']): string {
    const colors = {
      click: '#00ff00',
      touch: '#00ffff',
      scene: '#ffff00',
      level: '#ff8800',
      game: '#8800ff',
      error: '#ff0000',
      info: '#ffffff'
    };
    return colors[type] || '#ffffff';
  }

  private setupGlobalErrorHandling() {
    // Capture JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('JavaScript', `${event.message} at ${event.filename}:${event.lineno}`, {
        error: event.error,
        stack: event.error?.stack
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Promise', `Unhandled rejection: ${event.reason}`, {
        reason: event.reason
      });
    });

    // Capture Phaser errors if available
    if (window.Phaser) {
      // This will be set up when Phaser is initialized
    }
  }
}

// Global debug instance
export const debugLogger = DebugLogger.getInstance();

// Global functions for easy access
(window as any).debug = {
  log: (type: string, category: string, message: string, data?: any) => 
    debugLogger.log(type as any, category, message, data),
  click: (category: string, message: string, data?: any, position?: { x: number; y: number }) => 
    debugLogger.click(category, message, data, position),
  touch: (category: string, message: string, data?: any, position?: { x: number; y: number }) => 
    debugLogger.touch(category, message, data, position),
  scene: (category: string, message: string, data?: any) => 
    debugLogger.scene(category, message, data),
  level: (category: string, message: string, data?: any) => 
    debugLogger.level(category, message, data),
  game: (category: string, message: string, data?: any) => 
    debugLogger.game(category, message, data),
  error: (category: string, message: string, error?: any) => 
    debugLogger.error(category, message, error),
  info: (category: string, message: string, data?: any) => 
    debugLogger.info(category, message, data),
  toggle: () => debugLogger.toggle(),
  show: () => debugLogger.show(),
  hide: () => debugLogger.hide(),
  clear: () => debugLogger.clear(),
  export: () => debugLogger.exportLogs()
};