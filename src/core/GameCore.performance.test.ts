// Performance and memory tests for GameCore
import { describe, test, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { GameCore } from './GameCore';
import { LevelDefinition } from './types/Level';

// Performance test configurations
const PERFORMANCE_THRESHOLDS = {
  SMALL_MAZE_INIT: 50,      // ms - Small maze initialization
  MEDIUM_MAZE_INIT: 200,    // ms - Medium maze initialization  
  LARGE_MAZE_INIT: 1000,    // ms - Large maze initialization
  MOVE_OPERATION: 5,        // ms - Single move operation
  ORB_COLLECTION: 5,        // ms - Single orb collection
  STATE_SERIALIZATION: 50,  // ms - State serialization
  BATCH_OPERATIONS: 100,    // ms - Batch of 100 operations
  MEMORY_LEAK_THRESHOLD: 10 // MB - Memory growth threshold
} as const;

// Test level definitions for performance testing
const performanceTestLevels = {
  small: {
    id: 'perf-small',
    version: 1,
    metadata: {
      name: 'Small Performance Test',
      difficulty: 'easy',
      estimatedTime: 60,
      tags: ['performance', 'small']
    },
    generation: {
      type: 'procedural',
      seed: 42,
      parameters: {
        algorithm: 'recursive_backtrack',
        complexity: 0.3,
        branchingFactor: 0.2,
        deadEndRatio: 0.1,
        orbCount: 3,
        orbPlacement: 'random'
      }
    },
    config: {
      boardSize: { width: 5, height: 5 },
      objectives: [
        {
          id: 'collect-orbs',
          type: 'collect_orbs',
          target: 2,
          description: 'Collect orbs',
          required: true,
          priority: 1
        }
      ],
      constraints: [],
      powerups: []
    },
    progression: {
      starThresholds: [{ stars: 1, requirements: {} }],
      rewards: [],
      unlocks: []
    }
  } as LevelDefinition,

  medium: {
    id: 'perf-medium',
    version: 1,
    metadata: {
      name: 'Medium Performance Test',
      difficulty: 'medium',
      estimatedTime: 120,
      tags: ['performance', 'medium']
    },
    generation: {
      type: 'procedural',
      seed: 12345,
      parameters: {
        algorithm: 'recursive_backtrack',
        complexity: 0.5,
        branchingFactor: 0.3,
        deadEndRatio: 0.2,
        orbCount: 10,
        orbPlacement: 'random'
      }
    },
    config: {
      boardSize: { width: 20, height: 20 },
      objectives: [
        {
          id: 'collect-orbs',
          type: 'collect_orbs',
          target: 5,
          description: 'Collect orbs',
          required: true,
          priority: 1
        }
      ],
      constraints: [],
      powerups: []
    },
    progression: {
      starThresholds: [{ stars: 1, requirements: {} }],
      rewards: [],
      unlocks: []
    }
  } as LevelDefinition,

  large: {
    id: 'perf-large',
    version: 1,
    metadata: {
      name: 'Large Performance Test',
      difficulty: 'hard',
      estimatedTime: 300,
      tags: ['performance', 'large']
    },
    generation: {
      type: 'procedural',
      seed: 99999,
      parameters: {
        algorithm: 'recursive_backtrack',
        complexity: 0.7,
        branchingFactor: 0.4,
        deadEndRatio: 0.3,
        orbCount: 25,
        orbPlacement: 'random'
      }
    },
    config: {
      boardSize: { width: 50, height: 50 },
      objectives: [
        {
          id: 'collect-orbs',
          type: 'collect_orbs',
          target: 15,
          description: 'Collect orbs',
          required: true,
          priority: 1
        }
      ],
      constraints: [],
      powerups: []
    },
    progression: {
      starThresholds: [{ stars: 1, requirements: {} }],
      rewards: [],
      unlocks: []
    }
  } as LevelDefinition,

  extraLarge: {
    id: 'perf-xl',
    version: 1,
    metadata: {
      name: 'Extra Large Performance Test',
      difficulty: 'expert',
      estimatedTime: 600,
      tags: ['performance', 'xl']
    },
    generation: {
      type: 'procedural',
      seed: 777777,
      parameters: {
        algorithm: 'recursive_backtrack',
        complexity: 0.8,
        branchingFactor: 0.5,
        deadEndRatio: 0.4,
        orbCount: 50,
        orbPlacement: 'random'
      }
    },
    config: {
      boardSize: { width: 100, height: 100 },
      objectives: [
        {
          id: 'collect-orbs',
          type: 'collect_orbs',
          target: 30,
          description: 'Collect orbs',
          required: true,
          priority: 1
        }
      ],
      constraints: [],
      powerups: []
    },
    progression: {
      starThresholds: [{ stars: 1, requirements: {} }],
      rewards: [],
      unlocks: []
    }
  } as LevelDefinition
};

// Memory tracking utilities
class MemoryTracker {
  private initialMemory: number = 0;
  private samples: number[] = [];

  start(): void {
    if (global.gc) {
      global.gc();
    }
    this.initialMemory = this.getCurrentMemoryUsage();
    this.samples = [this.initialMemory];
  }

  sample(): void {
    this.samples.push(this.getCurrentMemoryUsage());
  }

  getMemoryGrowth(): number {
    if (this.samples.length < 2) return 0;
    return Math.max(...this.samples) - this.initialMemory;
  }

  getAverageMemoryUsage(): number {
    if (this.samples.length === 0) return 0;
    return this.samples.reduce((sum, sample) => sum + sample, 0) / this.samples.length;
  }

  private getCurrentMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024; // MB
    }
    // Fallback for browser environments
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
}

// Performance measurement utilities
function measureTime<T>(operation: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = operation();
  const end = performance.now();
  return { result, duration: end - start };
}

async function measureAsyncTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await operation();
  const end = performance.now();
  return { result, duration: end - start };
}

describe('GameCore Performance Tests', () => {
  let gameCore: GameCore;
  let memoryTracker: MemoryTracker;

  beforeEach(() => {
    gameCore = new GameCore();
    memoryTracker = new MemoryTracker();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization Performance', () => {
    it('should initialize small mazes quickly', () => {
      const { duration } = measureTime(() => {
        gameCore.initializeLevel(performanceTestLevels.small);
      });

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SMALL_MAZE_INIT);
      
      const state = gameCore.getGameState();
      expect(state.maze).toHaveLength(5);
      expect(state.maze[0]).toHaveLength(5);
    });

    it('should initialize medium mazes within acceptable time', () => {
      const { duration } = measureTime(() => {
        gameCore.initializeLevel(performanceTestLevels.medium);
      });

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MEDIUM_MAZE_INIT);
      
      const state = gameCore.getGameState();
      expect(state.maze).toHaveLength(20);
      expect(state.maze[0]).toHaveLength(20);
    });

    it('should initialize large mazes within acceptable time', () => {
      const { duration } = measureTime(() => {
        gameCore.initializeLevel(performanceTestLevels.large);
      });

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_MAZE_INIT);
      
      const state = gameCore.getGameState();
      expect(state.maze).toHaveLength(50);
      expect(state.maze[0]).toHaveLength(50);
    });

    it('should handle multiple initializations efficiently', () => {
      const levels = [
        performanceTestLevels.small,
        performanceTestLevels.medium,
        performanceTestLevels.small
      ];

      const { duration } = measureTime(() => {
        levels.forEach(level => {
          const core = new GameCore();
          core.initializeLevel(level);
        });
      });

      // Should initialize all levels within reasonable total time
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MEDIUM_MAZE_INIT * 2);
    });

    it('should scale initialization time reasonably with maze size', () => {
      const sizes = [
        { level: performanceTestLevels.small, expectedSize: 25 },
        { level: performanceTestLevels.medium, expectedSize: 400 },
        { level: performanceTestLevels.large, expectedSize: 2500 }
      ];

      const results = sizes.map(({ level, expectedSize }) => {
        const { duration } = measureTime(() => {
          const core = new GameCore();
          core.initializeLevel(level);
        });
        return { size: expectedSize, duration };
      });

      // Verify that initialization time scales reasonably (not exponentially)
      const smallTime = results[0].duration;
      const mediumTime = results[1].duration;
      const largeTime = results[2].duration;

      // Medium should not be more than 15x slower than small
      expect(mediumTime).toBeLessThan(smallTime * 15);
      // Large should not be more than 100x slower than small (maze generation is O(n²), allow more variance)
      expect(largeTime).toBeLessThan(smallTime * 100);
    });
  });

  describe('Runtime Operation Performance', () => {
    beforeEach(() => {
      gameCore.initializeLevel(performanceTestLevels.medium);
      gameCore.startGame();
    });

    it('should perform move operations quickly', () => {
      const moves = ['right', 'down', 'left', 'up'] as const;
      
      moves.forEach(move => {
        const { duration } = measureTime(() => {
          gameCore.movePlayer(move);
        });
        
        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MOVE_OPERATION);
      });
    });

    it('should perform orb collection quickly', () => {
      const state = gameCore.getGameState();
      
      if (state.orbs.length > 0) {
        const orbId = state.orbs[0].id;
        
        const { duration } = measureTime(() => {
          gameCore.collectOrb(orbId);
        });
        
        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ORB_COLLECTION);
      }
    });

    it('should handle batch operations efficiently', () => {
      const operations = [];
      
      // Prepare 100 operations
      for (let i = 0; i < 100; i++) {
        const move = ['right', 'down', 'left', 'up'][i % 4] as const;
        operations.push(() => gameCore.movePlayer(move));
      }
      
      const { duration } = measureTime(() => {
        operations.forEach(op => op());
      });
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.BATCH_OPERATIONS);
    });

    it('should maintain consistent performance over time', () => {
      const durations: number[] = [];
      
      // Warm up the JIT compiler
      for (let i = 0; i < 10; i++) {
        gameCore.movePlayer('right');
        gameCore.movePlayer('left');
      }
      
      // Perform the same operation multiple times after warmup
      for (let i = 0; i < 30; i++) {
        const { duration } = measureTime(() => {
          gameCore.movePlayer('right');
          gameCore.movePlayer('left'); // Move back
        });
        durations.push(duration);
      }
      
      // Calculate performance statistics
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      
      // Performance should be reasonably consistent after warmup
      // Allow for more variation due to system scheduling and GC
      expect(maxDuration).toBeLessThan(Math.max(minDuration * 15, 2)); // At least 2ms tolerance
      expect(avgDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.MOVE_OPERATION * 3);
    });
  });

  describe('State Management Performance', () => {
    beforeEach(() => {
      gameCore.initializeLevel(performanceTestLevels.medium);
      gameCore.startGame();
    });

    it('should serialize state quickly', () => {
      const state = gameCore.getGameState();
      
      const { duration } = measureTime(() => {
        JSON.stringify(state);
      });
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.STATE_SERIALIZATION);
    });

    it('should handle state access efficiently', () => {
      const { duration } = measureTime(() => {
        for (let i = 0; i < 1000; i++) {
          const state = gameCore.getGameState();
          // Access various state properties
          const _ = state.player.position;
          const __ = state.score;
          const ___ = state.moves;
        }
      });
      
      // 1000 state accesses should be very fast
      expect(duration).toBeLessThan(50);
    });

    it('should maintain immutability without performance penalty', () => {
      const initialState = gameCore.getGameState();
      
      const { duration } = measureTime(() => {
        // Perform operations that create new state
        for (let i = 0; i < 10; i++) {
          gameCore.movePlayer('right');
          gameCore.movePlayer('left');
        }
      });
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.BATCH_OPERATIONS);
      
      // Verify immutability was maintained
      const currentState = gameCore.getGameState();
      expect(currentState).not.toBe(initialState);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory during repeated initializations', () => {
      memoryTracker.start();
      
      // Perform many initializations
      for (let i = 0; i < 20; i++) {
        const core = new GameCore();
        core.initializeLevel(performanceTestLevels.small);
        
        if (i % 5 === 0) {
          memoryTracker.sample();
          if (global.gc) global.gc(); // Force garbage collection
        }
      }
      
      const memoryGrowth = memoryTracker.getMemoryGrowth();
      expect(memoryGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LEAK_THRESHOLD);
    });

    it('should not leak memory during gameplay', () => {
      gameCore.initializeLevel(performanceTestLevels.medium);
      gameCore.startGame();
      
      memoryTracker.start();
      
      // Simulate extended gameplay
      for (let i = 0; i < 1000; i++) {
        const move = ['right', 'down', 'left', 'up'][i % 4] as const;
        gameCore.movePlayer(move);
        
        if (i % 100 === 0) {
          memoryTracker.sample();
          if (global.gc) global.gc();
        }
      }
      
      const memoryGrowth = memoryTracker.getMemoryGrowth();
      expect(memoryGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LEAK_THRESHOLD);
    });

    it('should handle large mazes without excessive memory usage', () => {
      memoryTracker.start();
      
      gameCore.initializeLevel(performanceTestLevels.large);
      memoryTracker.sample();
      
      gameCore.startGame();
      memoryTracker.sample();
      
      // Perform some operations
      for (let i = 0; i < 100; i++) {
        gameCore.movePlayer(['right', 'down', 'left', 'up'][i % 4] as const);
      }
      memoryTracker.sample();
      
      const memoryGrowth = memoryTracker.getMemoryGrowth();
      
      // Large maze should not use excessive memory (adjust threshold as needed)
      expect(memoryGrowth).toBeLessThan(50); // 50MB threshold for large maze
    });

    it('should clean up properly on reset', () => {
      gameCore.initializeLevel(performanceTestLevels.medium);
      gameCore.startGame();
      
      memoryTracker.start();
      
      // Perform operations then reset multiple times
      for (let i = 0; i < 10; i++) {
        // Do some operations
        for (let j = 0; j < 20; j++) {
          gameCore.movePlayer(['right', 'down', 'left', 'up'][j % 4] as const);
        }
        
        // Reset
        gameCore.resetGame();
        
        if (i % 3 === 0) {
          memoryTracker.sample();
          if (global.gc) global.gc();
        }
      }
      
      const memoryGrowth = memoryTracker.getMemoryGrowth();
      expect(memoryGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LEAK_THRESHOLD);
    });
  });

  describe('Scalability Tests', () => {
    it('should handle extra large mazes', () => {
      const { duration } = measureTime(() => {
        gameCore.initializeLevel(performanceTestLevels.extraLarge);
      });
      
      // Should complete within reasonable time (adjust as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds
      
      const state = gameCore.getGameState();
      expect(state.maze).toHaveLength(100);
      expect(state.maze[0]).toHaveLength(100);
      expect(state.orbs.length).toBeGreaterThan(0);
    });

    it('should handle many orbs efficiently', () => {
      const levelWithManyOrbs = {
        ...performanceTestLevels.medium,
        generation: {
          ...performanceTestLevels.medium.generation,
          parameters: {
            ...performanceTestLevels.medium.generation.parameters!,
            orbCount: 100
          }
        }
      };
      
      const { duration } = measureTime(() => {
        gameCore.initializeLevel(levelWithManyOrbs);
      });
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MEDIUM_MAZE_INIT * 2);
      
      const state = gameCore.getGameState();
      expect(state.orbs.length).toBeGreaterThan(0);
    });

    it('should handle concurrent operations', () => {
      gameCore.initializeLevel(performanceTestLevels.medium);
      gameCore.startGame();
      
      const { duration } = measureTime(() => {
        // Simulate concurrent-like operations
        const operations = [];
        
        for (let i = 0; i < 50; i++) {
          operations.push(() => gameCore.movePlayer('right'));
          operations.push(() => gameCore.getGameState());
          operations.push(() => gameCore.getCurrentTime());
          operations.push(() => gameCore.getScore());
        }
        
        // Execute all operations
        operations.forEach(op => op());
      });
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.BATCH_OPERATIONS * 2);
    });
  });

  describe('Performance Regression Detection', () => {
    it('should maintain baseline performance for standard operations', () => {
      // This test establishes performance baselines that can detect regressions
      
      const baselines = {
        smallMazeInit: 0,
        mediumMazeInit: 0,
        moveOperation: 0,
        stateAccess: 0
      };
      
      // Measure small maze initialization
      const { duration: smallInit } = measureTime(() => {
        const core = new GameCore();
        core.initializeLevel(performanceTestLevels.small);
      });
      baselines.smallMazeInit = smallInit;
      
      // Measure medium maze initialization
      const { duration: mediumInit } = measureTime(() => {
        const core = new GameCore();
        core.initializeLevel(performanceTestLevels.medium);
      });
      baselines.mediumMazeInit = mediumInit;
      
      // Measure move operation
      gameCore.initializeLevel(performanceTestLevels.small);
      gameCore.startGame();
      const { duration: moveTime } = measureTime(() => {
        gameCore.movePlayer('right');
      });
      baselines.moveOperation = moveTime;
      
      // Measure state access
      const { duration: stateTime } = measureTime(() => {
        for (let i = 0; i < 100; i++) {
          gameCore.getGameState();
        }
      });
      baselines.stateAccess = stateTime;
      
      // Log baselines for regression tracking
      console.log('Performance Baselines:', baselines);
      
      // Verify baselines are within expected ranges
      expect(baselines.smallMazeInit).toBeLessThan(PERFORMANCE_THRESHOLDS.SMALL_MAZE_INIT);
      expect(baselines.mediumMazeInit).toBeLessThan(PERFORMANCE_THRESHOLDS.MEDIUM_MAZE_INIT);
      expect(baselines.moveOperation).toBeLessThan(PERFORMANCE_THRESHOLDS.MOVE_OPERATION);
      expect(baselines.stateAccess).toBeLessThan(20); // 100 state accesses in 20ms
    });

    it('should detect performance degradation in maze generation', () => {
      const samples = [];
      
      // Generate multiple samples of the same operation
      for (let i = 0; i < 5; i++) {
        const { duration } = measureTime(() => {
          const core = new GameCore();
          core.initializeLevel(performanceTestLevels.medium);
        });
        samples.push(duration);
      }
      
      const avgDuration = samples.reduce((sum, d) => sum + d, 0) / samples.length;
      const maxDuration = Math.max(...samples);
      
      // Performance should be consistent (allow more variance for CI environments)
      expect(maxDuration).toBeLessThan(avgDuration * 5);
      expect(avgDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.MEDIUM_MAZE_INIT * 3);
      
      console.log(`Maze generation performance: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);
    });
  });
});