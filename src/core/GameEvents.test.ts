// Tests for the EventEmitter class
import { describe, test, expect, it, beforeEach, vi } from 'vitest';
import { EventEmitter } from './GameEvents';
import { GameEventType, GameEventPayload } from './types/Events';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('Basic functionality', () => {
    it('should subscribe and emit events', () => {
      const callback = vi.fn();
      emitter.on('game.started', callback);
      
      const payload = { timestamp: Date.now() };
      emitter.emit('game.started', payload);
      
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('should unsubscribe from events', () => {
      const callback = vi.fn();
      emitter.on('game.started', callback);
      emitter.off('game.started', callback);
      
      emitter.emit('game.started', { timestamp: Date.now() });
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple listeners for the same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      emitter.on('game.started', callback1);
      emitter.on('game.started', callback2);
      
      const payload = { timestamp: Date.now() };
      emitter.emit('game.started', payload);
      
      expect(callback1).toHaveBeenCalledWith(payload);
      expect(callback2).toHaveBeenCalledWith(payload);
    });

    it('should handle once listeners correctly', () => {
      const callback = vi.fn();
      emitter.once('game.started', callback);
      
      const payload = { timestamp: Date.now() };
      emitter.emit('game.started', payload);
      emitter.emit('game.started', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(payload);
    });
  });

  describe('Error handling', () => {
    it('should handle listener exceptions gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const throwingCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();
      
      emitter.on('game.started', throwingCallback);
      emitter.on('game.started', normalCallback);
      
      const payload = { timestamp: Date.now() };
      emitter.emit('game.started', payload);
      
      expect(throwingCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalledWith(payload);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event listener for game.started:'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should use custom error handler when provided', () => {
      const errorHandler = vi.fn();
      const throwingCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      
      emitter.setErrorHandler(errorHandler);
      emitter.on('game.started', throwingCallback);
      
      const payload = { timestamp: Date.now() };
      emitter.emit('game.started', payload);
      
      expect(errorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        'game.started',
        payload
      );
    });

    it('should handle errors in custom error handler', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const throwingErrorHandler = vi.fn(() => {
        throw new Error('Error handler error');
      });
      const throwingCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      
      emitter.setErrorHandler(throwingErrorHandler);
      emitter.on('game.started', throwingCallback);
      
      const payload = { timestamp: Date.now() };
      emitter.emit('game.started', payload);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event error handler for game.started:'),
        expect.any(Error)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Original error:'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Utility methods', () => {
    it('should count listeners correctly', () => {
      expect(emitter.listenerCount('game.started')).toBe(0);
      
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      emitter.on('game.started', callback1);
      expect(emitter.listenerCount('game.started')).toBe(1);
      
      emitter.on('game.started', callback2);
      expect(emitter.listenerCount('game.started')).toBe(2);
      
      emitter.off('game.started', callback1);
      expect(emitter.listenerCount('game.started')).toBe(1);
    });

    it('should check if event has listeners', () => {
      expect(emitter.hasListeners('game.started')).toBe(false);
      
      const callback = vi.fn();
      emitter.on('game.started', callback);
      expect(emitter.hasListeners('game.started')).toBe(true);
      
      emitter.off('game.started', callback);
      expect(emitter.hasListeners('game.started')).toBe(false);
    });

    it('should return event names with listeners', () => {
      expect(emitter.eventNames()).toEqual([]);
      
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      emitter.on('game.started', callback1);
      emitter.on('player.moved', callback2);
      
      const eventNames = emitter.eventNames();
      expect(eventNames).toContain('game.started');
      expect(eventNames).toContain('player.moved');
      expect(eventNames).toHaveLength(2);
    });

    it('should remove all listeners for specific event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();
      
      emitter.on('game.started', callback1);
      emitter.on('game.started', callback2);
      emitter.on('player.moved', callback3);
      
      emitter.removeAllListeners('game.started');
      
      expect(emitter.listenerCount('game.started')).toBe(0);
      expect(emitter.listenerCount('player.moved')).toBe(1);
    });

    it('should remove all listeners when no event specified', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      emitter.on('game.started', callback1);
      emitter.on('player.moved', callback2);
      
      emitter.removeAllListeners();
      
      expect(emitter.listenerCount('game.started')).toBe(0);
      expect(emitter.listenerCount('player.moved')).toBe(0);
    });
  });

  describe('Type safety', () => {
    it('should maintain type safety for event payloads', () => {
      // This test mainly ensures TypeScript compilation works correctly
      const gameStartedCallback = (payload: { timestamp: number }) => {
        expect(typeof payload.timestamp).toBe('number');
      };
      
      const playerMovedCallback = (payload: { from: any; to: any; valid: boolean }) => {
        expect(typeof payload.valid).toBe('boolean');
      };
      
      emitter.on('game.started', gameStartedCallback);
      emitter.on('player.moved', playerMovedCallback);
      
      emitter.emit('game.started', { timestamp: 123456 });
      emitter.emit('player.moved', { 
        from: { x: 0, y: 0 }, 
        to: { x: 1, y: 0 }, 
        valid: true 
      });
    });
  });
});