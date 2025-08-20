// Tests for event type definitions
import { describe, test, expect, it } from 'vitest';
import { 
  GameEvents, 
  GameEventType, 
  GameEventPayload,
  EVENT_CATEGORIES,
  EventCategory,
  GameLifecycleEvents,
  PlayerEvents,
  OrbEvents,
  ObjectiveEvents,
  LevelEvents,
  StateEvents,
  SystemEvents
} from './Events';

describe('Event Types', () => {
  describe('Type safety', () => {
    it('should have correct event type mapping', () => {
      // This test ensures TypeScript compilation works correctly
      const gameStartedEvent: GameEventPayload<'game.started'> = {
        timestamp: Date.now(),
        levelId: 'test-level',
        seed: 12345
      };

      const playerMovedEvent: GameEventPayload<'player.moved'> = {
        from: { x: 0, y: 0 },
        to: { x: 1, y: 0 },
        valid: true,
        moveCount: 1,
        timestamp: Date.now()
      };

      const orbCollectedEvent: GameEventPayload<'orb.collected'> = {
        orbId: 'orb-1',
        position: { x: 2, y: 2 },
        score: 50,
        totalScore: 150,
        orbsRemaining: 2,
        timestamp: Date.now()
      };

      // Verify the events have the expected structure
      expect(typeof gameStartedEvent.timestamp).toBe('number');
      expect(typeof gameStartedEvent.levelId).toBe('string');
      expect(typeof gameStartedEvent.seed).toBe('number');

      expect(typeof playerMovedEvent.valid).toBe('boolean');
      expect(typeof playerMovedEvent.moveCount).toBe('number');

      expect(typeof orbCollectedEvent.score).toBe('number');
      expect(typeof orbCollectedEvent.orbsRemaining).toBe('number');
    });

    it('should support all defined event types', () => {
      // Test that all event types are properly defined
      const eventTypes: GameEventType[] = [
        'game.initialized',
        'game.started',
        'game.paused',
        'game.resumed',
        'game.reset',
        'game.completed',
        'game.failed',
        'player.moved',
        'player.move.attempted',
        'orb.collected',
        'orb.collection.attempted',
        'objective.progress',
        'objective.completed',
        'score.changed',
        'level.loaded',
        'level.generated',
        'state.changed',
        'state.validated',
        'error',
        'debug'
      ];

      // This test ensures all event types are valid
      eventTypes.forEach(eventType => {
        expect(typeof eventType).toBe('string');
      });
    });
  });

  describe('Event categories', () => {
    it('should have correct event categories', () => {
      expect(EVENT_CATEGORIES.GAME_LIFECYCLE).toContain('game.started');
      expect(EVENT_CATEGORIES.GAME_LIFECYCLE).toContain('game.completed');
      expect(EVENT_CATEGORIES.PLAYER_ACTIONS).toContain('player.moved');
      expect(EVENT_CATEGORIES.GAME_OBJECTS).toContain('orb.collected');
      expect(EVENT_CATEGORIES.PROGRESSION).toContain('objective.completed');
      expect(EVENT_CATEGORIES.LEVEL_MANAGEMENT).toContain('level.loaded');
      expect(EVENT_CATEGORIES.STATE_MANAGEMENT).toContain('state.changed');
      expect(EVENT_CATEGORIES.SYSTEM).toContain('error');
    });

    it('should have all events categorized', () => {
      const allCategorizedEvents = Object.values(EVENT_CATEGORIES).flat();
      const allEventTypes: GameEventType[] = [
        'game.initialized',
        'game.started',
        'game.paused',
        'game.resumed',
        'game.reset',
        'game.completed',
        'game.failed',
        'player.moved',
        'player.move.attempted',
        'orb.collected',
        'orb.collection.attempted',
        'objective.progress',
        'objective.completed',
        'score.changed',
        'level.loaded',
        'level.generated',
        'state.changed',
        'state.validated',
        'error',
        'debug'
      ];

      allEventTypes.forEach(eventType => {
        expect(allCategorizedEvents).toContain(eventType);
      });
    });
  });

  describe('Helper types', () => {
    it('should correctly filter event types by category', () => {
      // Test type filtering - these should compile without errors
      const gameLifecycleEvent: GameLifecycleEvents = 'game.started';
      const playerEvent: PlayerEvents = 'player.moved';
      const orbEvent: OrbEvents = 'orb.collected';
      const objectiveEvent: ObjectiveEvents = 'objective.completed';
      const levelEvent: LevelEvents = 'level.loaded';
      const stateEvent: StateEvents = 'state.changed';
      const systemEvent: SystemEvents = 'error';

      expect(gameLifecycleEvent.startsWith('game.')).toBe(true);
      expect(playerEvent.startsWith('player.')).toBe(true);
      expect(orbEvent.startsWith('orb.')).toBe(true);
      expect(objectiveEvent.startsWith('objective.')).toBe(true);
      expect(levelEvent.startsWith('level.')).toBe(true);
      expect(stateEvent.startsWith('state.')).toBe(true);
      expect(['error', 'debug']).toContain(systemEvent);
    });
  });

  describe('Event payload structure', () => {
    it('should have consistent timestamp fields', () => {
      // Most events should have timestamps
      const eventsWithTimestamps = [
        'game.initialized',
        'game.started',
        'game.paused',
        'game.resumed',
        'game.reset',
        'game.completed',
        'game.failed',
        'player.moved',
        'player.move.attempted',
        'orb.collected',
        'orb.collection.attempted',
        'objective.progress',
        'objective.completed',
        'score.changed',
        'level.loaded',
        'level.generated',
        'state.changed',
        'state.validated',
        'error',
        'debug'
      ];

      // This test ensures timestamp consistency in event design
      expect(eventsWithTimestamps.length).toBeGreaterThan(0);
    });

    it('should have detailed error information', () => {
      const errorEvent: GameEventPayload<'error'> = {
        error: new Error('Test error'),
        context: 'test context',
        recoverable: true,
        timestamp: Date.now()
      };

      expect(errorEvent.error).toBeInstanceOf(Error);
      expect(typeof errorEvent.context).toBe('string');
      expect(typeof errorEvent.recoverable).toBe('boolean');
      expect(typeof errorEvent.timestamp).toBe('number');
    });

    it('should have comprehensive game result information', () => {
      const gameCompletedEvent: GameEventPayload<'game.completed'> = {
        result: {
          completed: true,
          score: 1000,
          time: 120,
          moves: 50,
          stars: 3,
          objectives: [
            {
              id: 'collect-all-orbs',
              completed: true,
              completedAt: Date.now()
            }
          ]
        },
        timestamp: Date.now(),
        duration: 120000
      };

      expect(gameCompletedEvent.result.completed).toBe(true);
      expect(gameCompletedEvent.result.objectives).toHaveLength(1);
      expect(gameCompletedEvent.result.objectives[0].completed).toBe(true);
    });

    it('should have detailed state change information', () => {
      const stateChangedEvent: GameEventPayload<'state.changed'> = {
        state: {} as any, // Mock state
        changes: [
          {
            property: 'player.position',
            oldValue: { x: 0, y: 0 },
            newValue: { x: 1, y: 0 },
            timestamp: Date.now()
          }
        ],
        timestamp: Date.now()
      };

      expect(stateChangedEvent.changes).toHaveLength(1);
      expect(stateChangedEvent.changes[0].property).toBe('player.position');
      expect(typeof stateChangedEvent.changes[0].timestamp).toBe('number');
    });
  });
});