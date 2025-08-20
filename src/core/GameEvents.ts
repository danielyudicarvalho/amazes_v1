// Event system for core-to-presentation communication
import { GameEventType, EventCallback, GameEventPayload } from './types/Events';

/**
 * Type-safe event emitter with error handling for game events
 */
export class EventEmitter {
  private listeners: Map<GameEventType, EventCallback[]> = new Map();
  private errorHandler?: (error: Error, event: GameEventType, payload: any) => void;

  /**
   * Subscribe to an event with type safety
   */
  on<T extends GameEventType>(event: T, callback: EventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback as EventCallback);
  }

  /**
   * Subscribe to an event once - automatically unsubscribes after first emission
   */
  once<T extends GameEventType>(event: T, callback: EventCallback<T>): void {
    const onceWrapper = (payload: GameEventPayload<T>) => {
      this.off(event, onceWrapper as EventCallback<T>);
      callback(payload);
    };
    this.on(event, onceWrapper as EventCallback<T>);
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends GameEventType>(event: T, callback: EventCallback<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback as EventCallback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all subscribers with error handling
   */
  emit<T extends GameEventType>(event: T, payload: GameEventPayload<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      // Create a copy to avoid issues if listeners are modified during emission
      const listenersCopy = [...eventListeners];
      
      listenersCopy.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          const eventError = error instanceof Error ? error : new Error(String(error));
          
          if (this.errorHandler) {
            try {
              this.errorHandler(eventError, event, payload);
            } catch (handlerError) {
              console.error(`Error in event error handler for ${event}:`, handlerError);
              console.error(`Original error:`, eventError);
            }
          } else {
            console.error(`Error in event listener for ${event}:`, eventError);
          }
        }
      });
    }
  }

  /**
   * Set a custom error handler for listener exceptions
   */
  setErrorHandler(handler: (error: Error, event: GameEventType, payload: any) => void): void {
    this.errorHandler = handler;
  }

  /**
   * Remove the custom error handler
   */
  removeErrorHandler(): void {
    this.errorHandler = undefined;
  }

  /**
   * Remove all listeners for an event, or all listeners if no event specified
   */
  removeAllListeners(event?: GameEventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: GameEventType): number {
    return this.listeners.get(event)?.length ?? 0;
  }

  /**
   * Get all event types that have listeners
   */
  eventNames(): GameEventType[] {
    return Array.from(this.listeners.keys()).filter(event => this.listenerCount(event) > 0);
  }

  /**
   * Check if there are any listeners for an event
   */
  hasListeners(event: GameEventType): boolean {
    return this.listenerCount(event) > 0;
  }
}