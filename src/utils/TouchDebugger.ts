// Touch and click debugging system
import { debugLogger } from './DebugLogger';

export class TouchDebugger {
  private static instance: TouchDebugger;
  private isActive = false;
  private touchIndicators: HTMLElement[] = [];

  private constructor() {}

  static getInstance(): TouchDebugger {
    if (!TouchDebugger.instance) {
      TouchDebugger.instance = new TouchDebugger();
    }
    return TouchDebugger.instance;
  }

  activate() {
    if (this.isActive) return;
    this.isActive = true;

    debugLogger.info('TouchDebugger', 'Touch debugging activated');

    // Intercept all click events
    document.addEventListener('click', this.handleClick.bind(this), true);
    
    // Intercept all touch events
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), true);
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), true);
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), true);
    
    // Intercept pointer events (for better compatibility)
    document.addEventListener('pointerdown', this.handlePointerDown.bind(this), true);
    document.addEventListener('pointerup', this.handlePointerUp.bind(this), true);
    
    // Intercept mouse events (for desktop testing)
    document.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), true);
  }

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    debugLogger.info('TouchDebugger', 'Touch debugging deactivated');

    document.removeEventListener('click', this.handleClick.bind(this), true);
    document.removeEventListener('touchstart', this.handleTouchStart.bind(this), true);
    document.removeEventListener('touchmove', this.handleTouchMove.bind(this), true);
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this), true);
    document.removeEventListener('pointerdown', this.handlePointerDown.bind(this), true);
    document.removeEventListener('pointerup', this.handlePointerUp.bind(this), true);
    document.removeEventListener('mousedown', this.handleMouseDown.bind(this), true);
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this), true);

    this.clearTouchIndicators();
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const position = { x: event.clientX, y: event.clientY };
    
    debugLogger.click('DOM', `Click on ${this.getElementDescription(target)}`, {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      textContent: target.textContent?.substring(0, 50),
      position,
      button: event.button,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey
    }, position);

    this.showTouchIndicator(position, 'click');
  }

  private handleTouchStart(event: TouchEvent) {
    const target = event.target as HTMLElement;
    
    Array.from(event.touches).forEach((touch, index) => {
      const position = { x: touch.clientX, y: touch.clientY };
      
      debugLogger.touch('DOM', `Touch start ${index + 1}/${event.touches.length} on ${this.getElementDescription(target)}`, {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        textContent: target.textContent?.substring(0, 50),
        position,
        touchId: touch.identifier,
        force: touch.force,
        radiusX: touch.radiusX,
        radiusY: touch.radiusY
      }, position);

      this.showTouchIndicator(position, 'touchstart');
    });
  }

  private handleTouchMove(event: TouchEvent) {
    // Only log every 5th move event to avoid spam
    if (Math.random() > 0.2) return;

    const target = event.target as HTMLElement;
    
    Array.from(event.touches).forEach((touch, index) => {
      const position = { x: touch.clientX, y: touch.clientY };
      
      debugLogger.touch('DOM', `Touch move ${index + 1}/${event.touches.length}`, {
        tagName: target.tagName,
        position,
        touchId: touch.identifier
      }, position);
    });
  }

  private handleTouchEnd(event: TouchEvent) {
    const target = event.target as HTMLElement;
    
    Array.from(event.changedTouches).forEach((touch, index) => {
      const position = { x: touch.clientX, y: touch.clientY };
      
      debugLogger.touch('DOM', `Touch end ${index + 1} on ${this.getElementDescription(target)}`, {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        position,
        touchId: touch.identifier
      }, position);

      this.showTouchIndicator(position, 'touchend');
    });
  }

  private handlePointerDown(event: PointerEvent) {
    const target = event.target as HTMLElement;
    const position = { x: event.clientX, y: event.clientY };
    
    debugLogger.touch('DOM', `Pointer down (${event.pointerType}) on ${this.getElementDescription(target)}`, {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      position,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      pressure: event.pressure,
      width: event.width,
      height: event.height
    }, position);
  }

  private handlePointerUp(event: PointerEvent) {
    const target = event.target as HTMLElement;
    const position = { x: event.clientX, y: event.clientY };
    
    debugLogger.touch('DOM', `Pointer up (${event.pointerType}) on ${this.getElementDescription(target)}`, {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      position,
      pointerId: event.pointerId,
      pointerType: event.pointerType
    }, position);
  }

  private handleMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const position = { x: event.clientX, y: event.clientY };
    
    debugLogger.touch('DOM', `Mouse down on ${this.getElementDescription(target)}`, {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      position,
      button: event.button
    }, position);
  }

  private handleMouseUp(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const position = { x: event.clientX, y: event.clientY };
    
    debugLogger.touch('DOM', `Mouse up on ${this.getElementDescription(target)}`, {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      position,
      button: event.button
    }, position);
  }

  private getElementDescription(element: HTMLElement): string {
    let description = element.tagName.toLowerCase();
    
    if (element.id) {
      description += `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim()).slice(0, 2);
      if (classes.length > 0) {
        description += `.${classes.join('.')}`;
      }
    }
    
    if (element.textContent && element.textContent.trim()) {
      const text = element.textContent.trim().substring(0, 20);
      description += ` "${text}${element.textContent.length > 20 ? '...' : ''}"`;
    }
    
    return description;
  }

  private showTouchIndicator(position: { x: number; y: number }, type: string) {
    const indicator = document.createElement('div');
    const colors = {
      click: '#00ff00',
      touchstart: '#00ffff',
      touchend: '#ff00ff',
      default: '#ffff00'
    };
    
    const color = colors[type as keyof typeof colors] || colors.default;
    
    indicator.style.cssText = `
      position: fixed;
      left: ${position.x - 10}px;
      top: ${position.y - 10}px;
      width: 20px;
      height: 20px;
      border: 2px solid ${color};
      border-radius: 50%;
      background: ${color}33;
      z-index: 9999;
      pointer-events: none;
      animation: touchIndicator 1s ease-out forwards;
    `;

    // Add CSS animation if not already added
    if (!document.getElementById('touch-indicator-styles')) {
      const style = document.createElement('style');
      style.id = 'touch-indicator-styles';
      style.textContent = `
        @keyframes touchIndicator {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(indicator);
    this.touchIndicators.push(indicator);

    // Remove after animation
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
      const index = this.touchIndicators.indexOf(indicator);
      if (index > -1) {
        this.touchIndicators.splice(index, 1);
      }
    }, 1000);
  }

  private clearTouchIndicators() {
    this.touchIndicators.forEach(indicator => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    });
    this.touchIndicators = [];
  }
}

// Global touch debugger instance
export const touchDebugger = TouchDebugger.getInstance();