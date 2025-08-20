import { describe, test, expect, it } from 'vitest';
import { GameStateManager } from './GameState';
import { GameState, Position, GameStatus } from './types/GameState';
import { LevelDefinition } from './types/Level';

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
      },
      {
        id: 'reach-goal',
        type: 'reach_goal',
        target: 1,
        description: 'Reach the goal',
        required: true,
        priority: 2
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
      },
      {
        stars: 2,
        requirements: { time: 45 }
      },
      {
        stars: 3,
        requirements: { time: 30, moves: 50 }
      }
    ],
    rewards: [],
    unlocks: []
  }
};

describe('GameStateManager', () => {
  describe('createInitialState', () => {
    it('should create a valid initial game state', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition, 12345);
      
      expect(state.levelId).toBe('test-level-001');
      expect(state.levelConfig).toBe(mockLevelDefinition);
      expect(state.status).toBe('initializing');
      expect(state.seed).toBe(12345);
      expect(state.version).toBe(1);
      expect(state.score).toBe(0);
      expect(state.moves).toBe(0);
      expect(state.player.stats.totalMoves).toBe(0);
      expect(state.objectives).toHaveLength(2);
      expect(state.objectives[0].completed).toBe(false);
    });

    it('should create objectives from level definition', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition);
      
      expect(state.objectives).toHaveLength(2);
      expect(state.objectives[0].id).toBe('collect-all-orbs');
      expect(state.objectives[0].target).toBe(3);
      expect(state.objectives[0].current).toBe(0);
      expect(state.objectives[0].required).toBe(true);
    });
  });

  describe('cloneState', () => {
    it('should create a deep clone of the state', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      const clonedState = GameStateManager.cloneState(originalState);
      
      expect(clonedState).toEqual(originalState);
      expect(clonedState).not.toBe(originalState);
      expect(clonedState.player).not.toBe(originalState.player);
      expect(clonedState.objectives).not.toBe(originalState.objectives);
    });

    it('should handle nested objects correctly', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      originalState.player.position = { x: 5, y: 5 };
      
      const clonedState = GameStateManager.cloneState(originalState);
      clonedState.player.position = { x: 10, y: 10 };
      
      expect(originalState.player.position.x).toBe(5);
      expect(clonedState.player.position.x).toBe(10);
    });
  });

  describe('updateState', () => {
    it('should update state immutably', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      const updatedState = GameStateManager.updateState(originalState, {
        status: 'playing',
        score: 100
      });
      
      expect(originalState.status).toBe('initializing');
      expect(originalState.score).toBe(0);
      expect(updatedState.status).toBe('playing');
      expect(updatedState.score).toBe(100);
      expect(updatedState).not.toBe(originalState);
    });

    it('should handle nested updates', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      const updatedState = GameStateManager.updateState(originalState, {
        player: {
          position: { x: 5, y: 5 },
          stats: {
            totalMoves: 10
          }
        }
      });
      
      expect(originalState.player.position.x).toBe(0);
      expect(originalState.player.stats.totalMoves).toBe(0);
      expect(updatedState.player.position.x).toBe(5);
      expect(updatedState.player.stats.totalMoves).toBe(10);
      // Other stats should be preserved
      expect(updatedState.player.stats.orbsCollected).toBe(0);
    });
  });

  describe('updatePlayerPosition', () => {
    it('should update player position and increment moves', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      const newPosition: Position = { x: 3, y: 4 };
      const updatedState = GameStateManager.updatePlayerPosition(originalState, newPosition);
      
      expect(updatedState.player.position).toEqual(newPosition);
      expect(updatedState.moves).toBe(1);
      expect(updatedState.player.stats.totalMoves).toBe(1);
      expect(updatedState.currentTime).toBeGreaterThanOrEqual(originalState.currentTime);
    });
  });

  describe('collectOrb', () => {
    it('should collect an orb and update score', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      // Add an orb to the state
      const stateWithOrb = GameStateManager.updateState(originalState, {
        orbs: [
          {
            id: 'orb-1',
            position: { x: 2, y: 2 },
            collected: false,
            value: 50
          }
        ]
      });
      
      const updatedState = GameStateManager.collectOrb(stateWithOrb, 'orb-1');
      
      expect(updatedState.orbs[0].collected).toBe(true);
      expect(updatedState.orbs[0].collectedAt).toBeDefined();
      expect(updatedState.score).toBe(50);
      expect(updatedState.player.stats.orbsCollected).toBe(1);
    });

    it('should not collect an already collected orb', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      const stateWithCollectedOrb = GameStateManager.updateState(originalState, {
        orbs: [
          {
            id: 'orb-1',
            position: { x: 2, y: 2 },
            collected: true,
            value: 50,
            collectedAt: Date.now()
          }
        ]
      });
      
      const updatedState = GameStateManager.collectOrb(stateWithCollectedOrb, 'orb-1');
      
      expect(updatedState).toBe(stateWithCollectedOrb); // Should return same reference
    });
  });

  describe('updateObjectiveProgress', () => {
    it('should update objective progress', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      const updatedState = GameStateManager.updateObjectiveProgress(originalState, 'collect-all-orbs', 2);
      
      expect(updatedState.objectives[0].current).toBe(2);
      expect(updatedState.objectives[0].completed).toBe(false);
    });

    it('should mark objective as completed when target is reached', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      const updatedState = GameStateManager.updateObjectiveProgress(originalState, 'collect-all-orbs', 3);
      
      expect(updatedState.objectives[0].current).toBe(3);
      expect(updatedState.objectives[0].completed).toBe(true);
      expect(updatedState.objectives[0].completedAt).toBeDefined();
    });
  });

  describe('updateGameStatus', () => {
    it('should update game status', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      const updatedState = GameStateManager.updateGameStatus(originalState, 'playing');
      
      expect(updatedState.status).toBe('playing');
      expect(updatedState.currentTime).toBeGreaterThanOrEqual(originalState.currentTime);
    });

    it('should calculate game result when completed', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      // Mark all required objectives as completed
      const stateWithCompletedObjectives = GameStateManager.updateState(originalState, {
        objectives: originalState.objectives.map(obj => ({
          ...obj,
          completed: true,
          current: obj.target
        }))
      });
      
      const completedState = GameStateManager.updateGameStatus(stateWithCompletedObjectives, 'completed');
      
      expect(completedState.status).toBe('completed');
      expect(completedState.result).toBeDefined();
      expect(completedState.result!.completed).toBe(true);
      expect(completedState.result!.stars).toBeGreaterThan(0);
    });
  });

  describe('validateState', () => {
    it('should validate a correct state', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition);
      // Add minimal maze data for validation
      const stateWithMaze = GameStateManager.updateState(state, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ]
      });
      
      expect(GameStateManager.validateState(stateWithMaze)).toBe(true);
    });

    it('should reject invalid states', () => {
      expect(GameStateManager.validateState(null as any)).toBe(false);
      expect(GameStateManager.validateState({} as any)).toBe(false);
      
      const invalidState = GameStateManager.createInitialState(mockLevelDefinition);
      const invalidStateWithBadPosition = GameStateManager.updateState(invalidState, {
        player: {
          position: { x: -1, y: -1 }
        },
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ]
      });
      
      expect(GameStateManager.validateState(invalidStateWithBadPosition)).toBe(false);
    });

    it('should provide detailed validation results', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition);
      const validState = GameStateManager.updateState(state, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ]
      });
      
      const result = GameStateManager.validateStateDetailed(validState);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect player position out of bounds', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition);
      const invalidState = GameStateManager.updateState(state, {
        player: {
          position: { x: 10, y: 10 } // Outside 1x1 maze
        },
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ]
      });
      
      const result = GameStateManager.validateStateDetailed(invalidState);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'PLAYER_OUT_OF_BOUNDS')).toBe(true);
    });

    it('should detect invalid orb positions', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition);
      const invalidState = GameStateManager.updateState(state, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ],
        orbs: [
          {
            id: 'orb-1',
            position: { x: 5, y: 5 }, // Outside maze bounds
            collected: false,
            value: 50
          }
        ]
      });
      
      const result = GameStateManager.validateStateDetailed(invalidState);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'ORB_OUT_OF_BOUNDS')).toBe(true);
    });

    it('should detect duplicate orb IDs', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition);
      const invalidState = GameStateManager.updateState(state, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ],
        orbs: [
          {
            id: 'orb-1',
            position: { x: 0, y: 0 },
            collected: false,
            value: 50
          },
          {
            id: 'orb-1', // Duplicate ID
            position: { x: 0, y: 0 },
            collected: false,
            value: 25
          }
        ]
      });
      
      const result = GameStateManager.validateStateDetailed(invalidState);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'DUPLICATE_ORB_ID')).toBe(true);
    });

    it('should detect invalid maze structure', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition);
      const invalidState = GameStateManager.updateState(state, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }],
          [{ walls: 0, type: 'floor', properties: {} }, { walls: 0, type: 'floor', properties: {} }] // Different width
        ]
      });
      
      const result = GameStateManager.validateStateDetailed(invalidState);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INCONSISTENT_MAZE_WIDTH')).toBe(true);
    });

    it('should detect invalid cell walls', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition);
      const invalidState = GameStateManager.updateState(state, {
        maze: [
          [{ walls: 16, type: 'floor', properties: {} }] // Invalid walls value (> 15)
        ]
      });
      
      const result = GameStateManager.validateStateDetailed(invalidState);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_CELL_WALLS')).toBe(true);
    });

    it('should detect inconsistent objective completion', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition);
      const invalidState = GameStateManager.updateState(state, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ],
        objectives: [
          {
            id: 'test-objective',
            type: 'collect_orbs',
            target: 5,
            current: 2, // Less than target
            completed: true, // But marked as completed
            description: 'Test objective',
            required: true
          }
        ]
      });
      
      const result = GameStateManager.validateStateDetailed(invalidState);
      expect(result.warnings.some(w => w.code === 'COMPLETED_OBJECTIVE_INCONSISTENT')).toBe(true);
    });

    it('should detect moves mismatch between game state and player stats', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition);
      const invalidState = GameStateManager.updateState(state, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ],
        moves: 10,
        player: {
          stats: {
            totalMoves: 5 // Different from game moves
          }
        }
      });
      
      const result = GameStateManager.validateStateDetailed(invalidState);
      expect(result.warnings.some(w => w.code === 'MOVES_MISMATCH')).toBe(true);
    });

    it('should detect orbs collected mismatch', () => {
      const state = GameStateManager.createInitialState(mockLevelDefinition);
      const invalidState = GameStateManager.updateState(state, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ],
        orbs: [
          {
            id: 'orb-1',
            position: { x: 0, y: 0 },
            collected: true, // 1 orb collected
            value: 50
          }
        ],
        player: {
          stats: {
            orbsCollected: 2 // But stats say 2 collected
          }
        }
      });
      
      const result = GameStateManager.validateStateDetailed(invalidState);
      expect(result.warnings.some(w => w.code === 'ORBS_COLLECTED_MISMATCH')).toBe(true);
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize state correctly', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      // Add minimal maze data for validation
      const stateWithMaze = GameStateManager.updateState(originalState, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ]
      });
      
      const json = GameStateManager.toJSON(stateWithMaze);
      const deserializedState = GameStateManager.fromJSON(json);
      
      expect(deserializedState).toEqual(stateWithMaze);
    });

    it('should handle complex objects in serialization', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      const testDate = new Date('2024-01-01T12:00:00Z');
      
      // Test with a simpler structure that includes a Date at the top level
      const stateWithDate = GameStateManager.updateState(originalState, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ],
        startTime: testDate.getTime(), // Use timestamp instead of Date object
        orbs: [
          {
            id: 'orb-1',
            position: { x: 0, y: 0 }, // Keep within maze bounds
            collected: true,
            value: 50,
            collectedAt: testDate.getTime()
          }
        ]
      });
      
      const json = GameStateManager.toJSON(stateWithDate);
      const deserializedState = GameStateManager.fromJSON(json);
      
      // Check that the basic structure is preserved
      expect(deserializedState.levelId).toBe(stateWithDate.levelId);
      expect(deserializedState.orbs[0].collectedAt).toBe(testDate.getTime());
      expect(deserializedState.startTime).toBe(testDate.getTime());
      
      // Verify JSON contains the serialized data
      expect(json).toContain(stateWithDate.levelId);
      expect(json).toContain('"collectedAt":' + testDate.getTime());
    });

    it('should handle compressed serialization', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      const stateWithMaze = GameStateManager.updateState(originalState, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ]
      });
      
      const compressedJson = GameStateManager.toCompressedJSON(stateWithMaze);
      const deserializedState = GameStateManager.fromCompressedJSON(compressedJson, mockLevelDefinition);
      
      expect(deserializedState.levelId).toBe(stateWithMaze.levelId);
      expect(deserializedState.status).toBe(stateWithMaze.status);
      expect(deserializedState.player.position).toEqual(stateWithMaze.player.position);
      expect(deserializedState.maze).toEqual(stateWithMaze.maze);
    });

    it('should handle serialization errors', () => {
      // Create a circular reference to cause JSON.stringify to fail
      const circularObj: any = {};
      circularObj.self = circularObj;
      expect(() => GameStateManager.toJSON(circularObj)).toThrow();
    });

    it('should handle deserialization errors', () => {
      expect(() => GameStateManager.fromJSON('invalid json')).toThrow();
      expect(() => GameStateManager.fromJSON('{}')).toThrow();
      expect(() => GameStateManager.fromCompressedJSON('invalid json', mockLevelDefinition)).toThrow();
    });

    it('should preserve state version during serialization', () => {
      const originalState = GameStateManager.createInitialState(mockLevelDefinition);
      const stateWithMaze = GameStateManager.updateState(originalState, {
        maze: [
          [{ walls: 0, type: 'floor', properties: {} }]
        ]
      });
      
      const json = GameStateManager.toJSON(stateWithMaze);
      const deserializedState = GameStateManager.fromJSON(json);
      
      expect(deserializedState.version).toBe(stateWithMaze.version);
    });
  });
});