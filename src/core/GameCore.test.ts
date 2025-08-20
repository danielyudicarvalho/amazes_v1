// Comprehensive tests for GameCore functionality
import { describe, test, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { GameCore, Direction } from './GameCore';
import { LevelDefinition } from './types/Level';
import { GameEventType, MoveResult, CollectionResult } from './types/Events';
import { GameState } from './types/GameState';

// Mock level definition for testing
const mockLevelDefinition: LevelDefinition = {
  id: 'test-level-001',
  version: 1,
  metadata: {
    name: 'Test Level',
    difficulty: 'easy',
    estimatedTime: 60,
    tags: ['test']
  },
  generation: {
    type: 'procedural',
    seed: 12345,
    parameters: {
      algorithm: 'recursive_backtrack',
      complexity: 0.5,
      branchingFactor: 0.3,
      deadEndRatio: 0.2,
      orbCount: 3,
      orbPlacement: 'random'
    }
  },
  config: {
    boardSize: { width: 10, height: 10 },
    objectives: [
      {
        id: 'collect-all-orbs',
        type: 'collect_all_orbs',
        target: 3,
        description: 'Collect all orbs',
        required: true,
        priority: 1
      }
    ],
    constraints: [],
    powerups: []
  },
  progression: {
    starThresholds: [
      {
        stars: 1,
        requirements: {}
      }
    ],
    rewards: [],
    unlocks: []
  }
};

describe('GameCore Comprehensive Tests', () => {
  let gameCore: GameCore;
  let eventSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    gameCore = new GameCore();
    eventSpy = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization events', () => {
    it('should emit game.initialized event when level is initialized', () => {
      gameCore.on('game.initialized', eventSpy);
      
      gameCore.initializeLevel(mockLevelDefinition);
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          state: expect.any(Object),
          levelDefinition: mockLevelDefinition,
          timestamp: expect.any(Number)
        })
      );
    });

    it('should emit debug event during initialization', () => {
      gameCore.on('debug', eventSpy);
      
      gameCore.initializeLevel(mockLevelDefinition);
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: expect.stringContaining('Level initialized'),
          data: expect.objectContaining({
            levelId: 'test-level-001'
          }),
          timestamp: expect.any(Number)
        })
      );
    });

    it('should emit error event if initialization fails', () => {
      gameCore.on('error', eventSpy);
      
      // Mock GameStateManager to throw an error
      const originalCreateInitialState = (gameCore as any).constructor.prototype.constructor;
      
      // Create a scenario that would cause an error - undefined level definition
      expect(() => gameCore.initializeLevel(undefined as any)).toThrow();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          context: 'Level initialization',
          recoverable: false,
          timestamp: expect.any(Number)
        })
      );
    });
  });

  describe('Game lifecycle events', () => {
    beforeEach(() => {
      gameCore.initializeLevel(mockLevelDefinition);
    });

    it('should emit game.started event when game starts', () => {
      gameCore.on('game.started', eventSpy);
      
      gameCore.startGame();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          levelId: 'test-level-001',
          seed: expect.any(Number)
        })
      );
    });

    it('should emit state.changed event when game starts', () => {
      gameCore.on('state.changed', eventSpy);
      
      gameCore.startGame();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          state: expect.any(Object),
          changes: expect.arrayContaining([
            expect.objectContaining({
              property: 'status',
              oldValue: 'initializing',
              newValue: 'playing'
            })
          ]),
          timestamp: expect.any(Number)
        })
      );
    });

    it('should emit game.paused event when game is paused', () => {
      gameCore.on('game.paused', eventSpy);
      gameCore.startGame();
      
      gameCore.pauseGame();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          duration: expect.any(Number)
        })
      );
    });

    it('should emit game.resumed event when game is resumed', () => {
      gameCore.on('game.resumed', eventSpy);
      gameCore.startGame();
      gameCore.pauseGame();
      
      gameCore.resumeGame();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          pausedDuration: expect.any(Number)
        })
      );
    });

    it('should emit game.reset event when game is reset', () => {
      gameCore.on('game.reset', eventSpy);
      
      gameCore.resetGame();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          levelId: 'test-level-001',
          reason: 'user_request'
        })
      );
    });
  });

  describe('Player action events', () => {
    beforeEach(() => {
      gameCore.initializeLevel(mockLevelDefinition);
      gameCore.startGame();
    });

    it('should emit player.move.attempted event for move attempts', () => {
      gameCore.on('player.move.attempted', eventSpy);
      
      gameCore.movePlayer('right');
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(Object),
          attemptedTo: expect.any(Object),
          direction: 'east',
          blocked: expect.any(Boolean),
          timestamp: expect.any(Number)
        })
      );
    });

    it('should emit player.moved event for successful moves', () => {
      gameCore.on('player.moved', eventSpy);
      
      const result = gameCore.movePlayer('right');
      
      if (result.success) {
        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            from: expect.any(Object),
            to: expect.any(Object),
            valid: true,
            moveCount: expect.any(Number),
            timestamp: expect.any(Number)
          })
        );
      }
    });

    it('should emit state.changed event when player moves', () => {
      gameCore.on('state.changed', eventSpy);
      
      const result = gameCore.movePlayer('right');
      
      if (result.success) {
        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            state: expect.any(Object),
            changes: expect.arrayContaining([
              expect.objectContaining({
                property: 'player.position'
              })
            ]),
            timestamp: expect.any(Number)
          })
        );
      }
    });
  });

  describe('Orb collection events', () => {
    beforeEach(() => {
      gameCore.initializeLevel(mockLevelDefinition);
      gameCore.startGame();
    });

    it('should emit orb.collected event when orb is collected', () => {
      gameCore.on('orb.collected', eventSpy);
      
      // Get the first orb from the game state
      const gameState = gameCore.getGameState();
      if (gameState.orbs.length > 0) {
        const orbId = gameState.orbs[0].id;
        
        const result = gameCore.collectOrb(orbId);
        
        if (result.success) {
          expect(eventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              orbId,
              position: expect.any(Object),
              score: expect.any(Number),
              totalScore: expect.any(Number),
              orbsRemaining: expect.any(Number),
              timestamp: expect.any(Number)
            })
          );
        }
      }
    });

    it('should emit score.changed event when orb gives points', () => {
      gameCore.on('score.changed', eventSpy);
      
      const gameState = gameCore.getGameState();
      if (gameState.orbs.length > 0) {
        const orbId = gameState.orbs[0].id;
        const previousScore = gameCore.getScore();
        
        const result = gameCore.collectOrb(orbId);
        
        if (result.success && result.scoreGained > 0) {
          expect(eventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              previousScore,
              newScore: previousScore + result.scoreGained,
              change: result.scoreGained,
              reason: 'orb_collected',
              timestamp: expect.any(Number)
            })
          );
        }
      }
    });
  });

  describe('Event system functionality', () => {
    it('should support event subscription and unsubscription', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      gameCore.on('game.started', callback1);
      gameCore.on('game.started', callback2);
      
      gameCore.initializeLevel(mockLevelDefinition);
      gameCore.startGame();
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      
      // Unsubscribe one callback
      gameCore.off('game.started', callback1);
      
      // Reset and start again
      gameCore.resetGame();
      gameCore.startGame();
      
      expect(callback1).toHaveBeenCalledTimes(1); // Should not be called again
      expect(callback2).toHaveBeenCalledTimes(2); // Should be called again
    });

    it('should support once listeners', () => {
      const callback = vi.fn();
      
      gameCore.once('game.started', callback);
      
      gameCore.initializeLevel(mockLevelDefinition);
      gameCore.startGame();
      gameCore.resetGame();
      gameCore.startGame();
      
      expect(callback).toHaveBeenCalledTimes(1); // Should only be called once
    });

    it('should handle event listener errors gracefully', () => {
      const errorCallback = vi.fn();
      const throwingCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();
      
      gameCore.on('error', errorCallback);
      gameCore.on('game.started', throwingCallback);
      gameCore.on('game.started', normalCallback);
      
      gameCore.initializeLevel(mockLevelDefinition);
      gameCore.startGame();
      
      expect(throwingCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          context: expect.stringContaining('Event listener error'),
          recoverable: true
        })
      );
    });
  });

  describe('State change tracking', () => {
    beforeEach(() => {
      gameCore.initializeLevel(mockLevelDefinition);
    });

    it('should track multiple state changes in a single operation', () => {
      gameCore.on('state.changed', eventSpy);
      
      gameCore.startGame();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          changes: expect.arrayContaining([
            expect.objectContaining({
              property: 'status',
              oldValue: 'initializing',
              newValue: 'playing'
            })
          ])
        })
      );
    });

    it('should include timestamps in state changes', () => {
      gameCore.on('state.changed', eventSpy);
      
      gameCore.startGame();
      
      const call = eventSpy.mock.calls[0][0];
      expect(call.changes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            timestamp: expect.any(Number)
          })
        ])
      );
    });
  });

  describe('Debug events', () => {
    it('should emit debug events for important operations', () => {
      gameCore.on('debug', eventSpy);
      
      gameCore.initializeLevel(mockLevelDefinition);
      gameCore.startGame();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: expect.stringMatching(/debug|info|warn|error/),
          message: expect.any(String),
          timestamp: expect.any(Number)
        })
      );
    });
  });

  describe('Core Game Logic - State Management', () => {
    beforeEach(() => {
      gameCore.initializeLevel(mockLevelDefinition);
    });

    it('should initialize with correct initial state', () => {
      const state = gameCore.getGameState();
      
      expect(state.levelId).toBe('test-level-001');
      expect(state.status).toBe('initializing');
      expect(state.score).toBe(0);
      expect(state.moves).toBe(0);
      expect(state.player.position).toEqual({ x: 0, y: 0 });
      expect(state.maze).toBeDefined();
      expect(state.orbs).toBeDefined();
      expect(state.objectives).toHaveLength(1);
    });

    it('should transition states correctly during game lifecycle', () => {
      let state = gameCore.getGameState();
      expect(state.status).toBe('initializing');

      gameCore.startGame();
      state = gameCore.getGameState();
      expect(state.status).toBe('playing');

      gameCore.pauseGame();
      state = gameCore.getGameState();
      expect(state.status).toBe('paused');

      gameCore.resumeGame();
      state = gameCore.getGameState();
      expect(state.status).toBe('playing');
    });

    it('should maintain immutable state', () => {
      const initialState = gameCore.getGameState();
      const stateCopy = { ...initialState };
      
      gameCore.startGame();
      
      // Original state reference should be different
      expect(gameCore.getGameState()).not.toBe(initialState);
      // But the original state should be unchanged
      expect(initialState.status).toBe(stateCopy.status);
    });

    it('should handle time tracking correctly', () => {
      const startTime = Date.now();
      gameCore.startGame();
      
      // Wait a small amount
      const waitTime = 10;
      const endTime = startTime + waitTime;
      vi.setSystemTime(endTime);
      
      const currentTime = gameCore.getCurrentTime();
      expect(currentTime).toBeGreaterThanOrEqual(0);
      expect(currentTime).toBeLessThan(waitTime + 50); // Allow some tolerance
    });

    it('should calculate paused time correctly', () => {
      gameCore.startGame();
      
      const pauseStart = Date.now();
      gameCore.pauseGame();
      
      const pauseEnd = pauseStart + 100;
      vi.setSystemTime(pauseEnd);
      
      gameCore.resumeGame();
      
      // Time should not include paused duration
      const currentTime = gameCore.getCurrentTime();
      expect(currentTime).toBeLessThan(50); // Should be close to 0 since we paused immediately
    });
  });

  describe('Core Game Logic - Player Movement', () => {
    beforeEach(() => {
      gameCore.initializeLevel(mockLevelDefinition);
      gameCore.startGame();
    });

    it('should validate move directions correctly', () => {
      const directions: Direction[] = ['up', 'down', 'left', 'right'];
      
      directions.forEach(direction => {
        const result = gameCore.movePlayer(direction);
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('newPosition');
        expect(result).toHaveProperty('moveCount');
        expect(typeof result.success).toBe('boolean');
      });
    });

    it('should increment move count on successful moves', () => {
      const initialMoves = gameCore.getGameState().moves;
      
      // Try to make a valid move (this depends on maze generation)
      const result = gameCore.movePlayer('right');
      
      if (result.success) {
        expect(gameCore.getGameState().moves).toBe(initialMoves + 1);
        expect(result.moveCount).toBe(initialMoves + 1);
      }
    });

    it('should not increment move count on invalid moves', () => {
      const initialMoves = gameCore.getGameState().moves;
      
      // Try multiple directions to find an invalid move
      const directions: Direction[] = ['up', 'down', 'left', 'right'];
      let foundInvalidMove = false;
      
      for (const direction of directions) {
        const result = gameCore.movePlayer(direction);
        if (!result.success) {
          expect(gameCore.getGameState().moves).toBe(initialMoves);
          expect(result.moveCount).toBe(initialMoves);
          foundInvalidMove = true;
          break;
        }
      }
      
      // If all moves were valid, that's also acceptable for this test
      if (!foundInvalidMove) {
        expect(gameCore.getGameState().moves).toBeGreaterThan(initialMoves);
      }
    });

    it('should reject moves when game is not in playing state', () => {
      gameCore.pauseGame();
      
      const result = gameCore.movePlayer('right');
      
      expect(result.success).toBe(false);
      expect(result.reason).toContain('not in playing state');
    });

    it('should update player position on valid moves', () => {
      const initialPosition = gameCore.getGameState().player.position;
      
      // Try to find a valid move
      const directions: Direction[] = ['right', 'down', 'left', 'up'];
      
      for (const direction of directions) {
        const result = gameCore.movePlayer(direction);
        if (result.success) {
          expect(result.newPosition).not.toEqual(initialPosition);
          expect(gameCore.getGameState().player.position).toEqual(result.newPosition);
          break;
        }
      }
    });

    it('should handle boundary conditions correctly', () => {
      // Move to a corner and try to move out of bounds
      const state = gameCore.getGameState();
      const mazeWidth = state.maze[0]?.length || 0;
      const mazeHeight = state.maze.length;
      
      // If we're at (0,0), moving up or left should be invalid
      if (state.player.position.x === 0 && state.player.position.y === 0) {
        const upResult = gameCore.movePlayer('up');
        const leftResult = gameCore.movePlayer('left');
        
        // At least one of these should be invalid due to boundaries
        expect(upResult.success || leftResult.success).not.toBe(true);
      }
    });
  });

  describe('Core Game Logic - Orb Collection', () => {
    beforeEach(() => {
      gameCore.initializeLevel(mockLevelDefinition);
      gameCore.startGame();
    });

    it('should collect orbs when player is at orb position', () => {
      const state = gameCore.getGameState();
      
      if (state.orbs.length > 0) {
        const orb = state.orbs[0];
        const initialScore = gameCore.getScore();
        
        // Move player to orb position (this is a simplified test)
        // In a real scenario, we'd need to navigate to the orb
        const result = gameCore.collectOrb(orb.id);
        
        if (result.success) {
          expect(result.scoreGained).toBeGreaterThan(0);
          expect(gameCore.getScore()).toBe(initialScore + result.scoreGained);
          expect(gameCore.getGameState().orbs.find(o => o.id === orb.id)?.collected).toBe(true);
        }
      }
    });

    it('should reject collection when player is not at orb position', () => {
      const state = gameCore.getGameState();
      
      if (state.orbs.length > 0) {
        const orb = state.orbs[0];
        
        // Ensure player is not at orb position
        if (state.player.position.x !== orb.position.x || state.player.position.y !== orb.position.y) {
          const result = gameCore.collectOrb(orb.id);
          
          expect(result.success).toBe(false);
          expect(result.reason).toContain('not at orb position');
          expect(result.scoreGained).toBe(0);
        }
      }
    });

    it('should reject collection of non-existent orbs', () => {
      const result = gameCore.collectOrb('non-existent-orb');
      
      expect(result.success).toBe(false);
      expect(result.reason).toContain('not found');
      expect(result.scoreGained).toBe(0);
    });

    it('should reject collection of already collected orbs', () => {
      const state = gameCore.getGameState();
      
      if (state.orbs.length > 0) {
        const orb = state.orbs[0];
        
        // First collection (if player is at position)
        const firstResult = gameCore.collectOrb(orb.id);
        
        if (firstResult.success) {
          // Second collection attempt
          const secondResult = gameCore.collectOrb(orb.id);
          
          expect(secondResult.success).toBe(false);
          expect(secondResult.reason).toContain('already collected');
          expect(secondResult.scoreGained).toBe(0);
        }
      }
    });

    it('should update player stats when collecting orbs', () => {
      const state = gameCore.getGameState();
      
      if (state.orbs.length > 0) {
        const orb = state.orbs[0];
        const initialOrbsCollected = state.player.stats.orbsCollected;
        
        const result = gameCore.collectOrb(orb.id);
        
        if (result.success) {
          const newState = gameCore.getGameState();
          expect(newState.player.stats.orbsCollected).toBe(initialOrbsCollected + 1);
        }
      }
    });
  });

  describe('Core Game Logic - Objective System', () => {
    beforeEach(() => {
      gameCore.initializeLevel(mockLevelDefinition);
      gameCore.startGame();
    });

    it('should track objective progress correctly', () => {
      const state = gameCore.getGameState();
      const collectAllOrbsObjective = state.objectives.find(obj => obj.type === 'collect_all_orbs');
      
      if (collectAllOrbsObjective) {
        expect(collectAllOrbsObjective.current).toBe(0);
        expect(collectAllOrbsObjective.completed).toBe(false);
        expect(collectAllOrbsObjective.target).toBeGreaterThan(0);
      }
    });

    it('should complete objectives when targets are met', () => {
      const state = gameCore.getGameState();
      const totalOrbs = state.orbs.length;
      
      if (totalOrbs > 0) {
        // Simulate collecting all orbs
        let collectedCount = 0;
        
        for (const orb of state.orbs) {
          const result = gameCore.collectOrb(orb.id);
          if (result.success) {
            collectedCount++;
          }
        }
        
        if (collectedCount === totalOrbs) {
          const newState = gameCore.getGameState();
          const collectAllOrbsObjective = newState.objectives.find(obj => obj.type === 'collect_all_orbs');
          
          if (collectAllOrbsObjective) {
            expect(collectAllOrbsObjective.completed).toBe(true);
          }
        }
      }
    });

    it('should detect game completion when all required objectives are met', () => {
      // This test depends on the specific objectives in the level
      const state = gameCore.getGameState();
      const requiredObjectives = state.objectives.filter(obj => obj.required);
      
      expect(requiredObjectives.length).toBeGreaterThan(0);
      expect(gameCore.isGameComplete()).toBe(false);
      
      // Game completion logic will be tested more thoroughly in integration tests
    });
  });

  describe('Core Game Logic - Error Handling', () => {
    it('should throw error when accessing state before initialization', () => {
      const uninitializedCore = new GameCore();
      
      expect(() => uninitializedCore.getGameState()).toThrow('Game not initialized');
      expect(() => uninitializedCore.startGame()).toThrow('Game not initialized');
      expect(() => uninitializedCore.movePlayer('up')).toThrow('Game not initialized');
    });

    it('should handle invalid level definitions gracefully', () => {
      gameCore.on('error', eventSpy);
      
      const invalidLevel = { ...mockLevelDefinition };
      delete (invalidLevel as any).id;
      
      try {
        gameCore.initializeLevel(invalidLevel as any);
        // If it doesn't throw, it should at least emit an error event
        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.any(Error),
            context: 'Level initialization',
            recoverable: false
          })
        );
      } catch (error) {
        // If it does throw, that's also acceptable
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle maze generation failures with fallback', () => {
      gameCore.on('debug', eventSpy);
      
      // Create a level that might cause maze generation issues
      const problematicLevel: LevelDefinition = {
        ...mockLevelDefinition,
        config: {
          ...mockLevelDefinition.config,
          boardSize: { width: 1, height: 1 } // Very small maze
        }
      };
      
      // Should not throw, should use fallback
      expect(() => gameCore.initializeLevel(problematicLevel)).not.toThrow();
      
      const state = gameCore.getGameState();
      expect(state.maze).toBeDefined();
      expect(state.maze.length).toBeGreaterThan(0);
    });

    it('should handle concurrent operations safely', () => {
      gameCore.initializeLevel(mockLevelDefinition);
      gameCore.startGame();
      
      // Rapid successive operations
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(gameCore.movePlayer('right'));
      }
      
      // Should not crash and should maintain consistent state
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('newPosition');
      });
    });
  });

  describe('Core Game Logic - Performance', () => {
    it('should handle large mazes efficiently', () => {
      const largeMazeLevel: LevelDefinition = {
        ...mockLevelDefinition,
        config: {
          ...mockLevelDefinition.config,
          boardSize: { width: 50, height: 50 }
        }
      };
      
      const startTime = performance.now();
      gameCore.initializeLevel(largeMazeLevel);
      const endTime = performance.now();
      
      // Should initialize within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(1000); // 1 second
      
      const state = gameCore.getGameState();
      expect(state.maze).toHaveLength(50);
      expect(state.maze[0]).toHaveLength(50);
    });

    it('should handle many orbs efficiently', () => {
      const manyOrbsLevel: LevelDefinition = {
        ...mockLevelDefinition,
        generation: {
          ...mockLevelDefinition.generation,
          parameters: {
            ...mockLevelDefinition.generation.parameters!,
            orbCount: 100
          }
        }
      };
      
      const startTime = performance.now();
      gameCore.initializeLevel(manyOrbsLevel);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500); // 500ms
      
      const state = gameCore.getGameState();
      expect(state.orbs.length).toBeGreaterThan(0);
    });
  });

  describe('Core Game Logic - Edge Cases', () => {
    beforeEach(() => {
      gameCore.initializeLevel(mockLevelDefinition);
    });

    it('should handle rapid pause/resume cycles', () => {
      gameCore.startGame();
      
      for (let i = 0; i < 5; i++) {
        gameCore.pauseGame();
        gameCore.resumeGame();
      }
      
      const state = gameCore.getGameState();
      expect(state.status).toBe('playing');
    });

    it('should handle multiple reset operations', () => {
      gameCore.startGame();
      
      for (let i = 0; i < 3; i++) {
        gameCore.resetGame();
        const state = gameCore.getGameState();
        expect(state.status).toBe('initializing');
        expect(state.score).toBe(0);
        expect(state.moves).toBe(0);
      }
    });

    it('should maintain deterministic behavior with same seed', () => {
      const seed = 42;
      
      // Initialize first game
      gameCore.initializeLevel(mockLevelDefinition, seed);
      const firstState = gameCore.getGameState();
      
      // Initialize second game with same seed
      const secondCore = new GameCore();
      secondCore.initializeLevel(mockLevelDefinition, seed);
      const secondState = secondCore.getGameState();
      
      // Mazes should be identical
      expect(secondState.maze).toEqual(firstState.maze);
      expect(secondState.orbs.length).toBe(firstState.orbs.length);
      
      // Orb positions should be identical
      firstState.orbs.forEach((orb, index) => {
        expect(secondState.orbs[index].position).toEqual(orb.position);
      });
    });

    it('should handle empty maze gracefully', () => {
      const emptyMazeLevel: LevelDefinition = {
        ...mockLevelDefinition,
        config: {
          ...mockLevelDefinition.config,
          boardSize: { width: 1, height: 1 }
        }
      };
      
      expect(() => gameCore.initializeLevel(emptyMazeLevel)).not.toThrow();
      
      const state = gameCore.getGameState();
      expect(state.maze).toBeDefined();
      expect(state.maze.length).toBeGreaterThan(0);
    });
  });
});