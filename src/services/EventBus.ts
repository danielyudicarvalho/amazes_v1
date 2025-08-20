// Event communication system
import { EventEmitter } from '../core/GameEvents';
import { GameEventType, EventCallback } from '../core/types/Events';

/**
 * Global event bus for cross-module communication
 */
export class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
  }

  /**
   * Gets the singleton instance of the event bus
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Resets the event bus (useful for testing)
   */
  static reset(): void {
    if (EventBus.instance) {
      EventBus.instance.removeAllListeners();
    }
    EventBus.instance = new EventBus();
  }
}

// Export a default instance for convenience
export const eventBus = EventBus.getInstance();