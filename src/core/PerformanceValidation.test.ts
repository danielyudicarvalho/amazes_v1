// Comprehensive performance validation for the refactored system
import { describe, test, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { GameCore } from './GameCore';
import { LevelService } from '../services/LevelService';
import { ProgressManager } from '../managers/ProgressManager';
import { LevelDefinition } from './types/Level';

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

interface PerformanceMetrics {
  duration: number;
  memoryUsed?: number;
  operations: number;
}

function measurePerformance<T>(operation: () => T, operationCount: number = 1): PerformanceMetrics & { result: T } {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  const result = operation();
  
  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  return {
    duration: endTime - startTime,
    memoryUsed: endMemory - startMemory,
    operations: operationCount,
    result
  };
}

function createTestLevel(size: 'small' | 'medium' | 'large' | 'xlarge', seed: number = 12345): LevelDefinition {
  const sizes = {
    small: { width: 5, height: 5, orbs: 2 },
    medium: { width: 15, height: 15, orbs: 5 },
    large: { width: 30, height: 30, orbs: 10 },
    xlarge: { width: 50, height: 50, orbs: 20 }
  };
  
  const config = sizes[size];
  
  return {
    id: `perf-test-${size}-${seed}`,
    version: 1,
    metadata: {
      name: `Performance Test ${size}`,
      difficulty: 'medium',
      estimatedTime: 120,
      tags: ['test', 'performance', size]
    },
    generation: {
      type: 'procedural',
      seed,
      parameters: {
        algorithm: 'recursive_backtrack',
        complexity: 0.6,
        branchingFactor: 0.4,
        deadEndRatio: 0.3,
        orbCount: config.orbs,
        orbPlacement: 'random'
      }
    },
    config: {
      boardSize: { width: config.width, height: config.height },
      objectives: [
        {
          id: 'collect-orbs',
          type: 'collect_orbs',
          target: Math.floor(config.orbs * 0.7),
          description: `Collect ${Math.floor(config.orbs * 0.7)} orbs`,
          required: true,
          priority: 1
        }
      ],
      constraints: [],
      powerups: []
    },
    progression: {
      starThresholds: [
        { stars: 1, requirements: {} },
        { stars: 2, requirements: { time: 90 } },
        { stars: 3, requirements: { time: 60, moves: 100 } }
      ],
      rewards: [],
      unlocks: []
    }
  };
}

describe('Performance Validation and Optimization', () => {
  let gameCore: GameCore;
  let levelService: LevelService;
  let progressManager: ProgressManager;

  beforeEach(() => {
    gameCore = new GameCore();
    levelService = new LevelService();
    progressManager = ProgressManager.getInstance();
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('System Performance Profiling', () => {
    it('should profile complete game initialization performance', () => {
      const testLevel = createTestLevel('medium');
      
      const metrics = measurePerformance(() => {
        gameCore.initializeLevel(testLevel);
        return gameCore.getGameState();
      });
      
      console.log(`Game initialization: ${metrics.duration.toFixed(2)}ms`);
      
      // Should initialize within reasonable time
      expect(metrics.duration).toBeLessThan(100); // 100ms threshold
      expect(metrics.result.maze).toBeDefined();
      expect(metrics.result.orbs.length).toBeGreaterThan(0);
    });

    it('should profile level service performance', async () => {
      const testLevel = createTestLevel('medium');
      
      // Test level generation performance
      const generationMetrics = measurePerformance(async () => {
        return await levelService.generateLevel(testLevel);
      });
      
      console.log(`Level generation: ${generationMetrics.duration.toFixed(2)}ms`);
      
      // Should generate level within reasonable time
      expect(generationMetrics.duration).toBeLessThan(200); // 200ms threshold
    });

    it('should profile gameplay operation performance', () => {
      const testLevel = createTestLevel('small'); // Use small level for consistent timing
      gameCore.initializeLevel(testLevel);
      gameCore.startGame();
      
      // Profile move operations
      const moveMetrics = measurePerformance(() => {
        const directions = ['right', 'down', 'left', 'up'] as const;
        let successfulMoves = 0;
        
        for (let i = 0; i < 100; i++) {
          const result = gameCore.movePlayer(directions[i % directions.length]);
          if (result.success) successfulMoves++;
        }
        
        return successfulMoves;
      }, 100);
      
      console.log(`100 move operations: ${moveMetrics.duration.toFixed(2)}ms (${(moveMetrics.duration / 100).toFixed(3)}ms per move)`);
      
      // Should handle moves efficiently
      expect(moveMetrics.duration).toBeLessThan(50); // 50ms for 100 moves
      expect(moveMetrics.duration / 100).toBeLessThan(1); // Less than 1ms per move
    });

    it('should profile state access performance', () => {
      const testLevel = createTestLevel('medium');
      gameCore.initializeLevel(testLevel);
      
      const stateAccessMetrics = measurePerformance(() => {
        let totalCells = 0;
        
        for (let i = 0; i < 1000; i++) {
          const state = gameCore.getGameState();
          totalCells += state.maze.length * state.maze[0].length;
        }
        
        return totalCells;
      }, 1000);
      
      console.log(`1000 state accesses: ${stateAccessMetrics.duration.toFixed(2)}ms (${(stateAccessMetrics.duration / 1000).toFixed(3)}ms per access)`);
      
      // State access should be very fast
      expect(stateAccessMetrics.duration).toBeLessThan(20); // 20ms for 1000 accesses
      expect(stateAccessMetrics.duration / 1000).toBeLessThan(0.1); // Less than 0.1ms per access
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect performance regressions in core operations', () => {
      const testLevel = createTestLevel('medium');
      const samples: number[] = [];
      
      // Collect performance samples
      for (let i = 0; i < 10; i++) {
        const core = new GameCore();
        const metrics = measurePerformance(() => {
          core.initializeLevel(testLevel);
          core.startGame();
          
          // Perform some operations
          for (let j = 0; j < 10; j++) {
            core.movePlayer(['right', 'down', 'left', 'up'][j % 4] as any);
          }
          
          return core.getGameState();
        });
        
        samples.push(metrics.duration);
      }
      
      const avgDuration = samples.reduce((sum, d) => sum + d, 0) / samples.length;
      const maxDuration = Math.max(...samples);
      const minDuration = Math.min(...samples);
      const variance = samples.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / samples.length;
      const stdDev = Math.sqrt(variance);
      
      console.log(`Performance statistics:
        Average: ${avgDuration.toFixed(2)}ms
        Min: ${minDuration.toFixed(2)}ms
        Max: ${maxDuration.toFixed(2)}ms
        Std Dev: ${stdDev.toFixed(2)}ms
        Variance: ${variance.toFixed(2)}`);
      
      // Performance should be consistent
      expect(maxDuration).toBeLessThan(avgDuration * 3); // Max shouldn't be more than 3x average
      expect(stdDev).toBeLessThan(avgDuration * 0.5); // Standard deviation should be reasonable
      expect(avgDuration).toBeLessThan(150); // Average should be under 150ms
    });

    it('should validate performance across different level sizes', () => {
      const sizes = ['small', 'medium', 'large'] as const;
      const results: Record<string, number> = {};
      
      sizes.forEach(size => {
        const testLevel = createTestLevel(size);
        const metrics = measurePerformance(() => {
          const core = new GameCore();
          core.initializeLevel(testLevel);
          return core.getGameState();
        });
        
        results[size] = metrics.duration;
        console.log(`${size} level initialization: ${metrics.duration.toFixed(2)}ms`);
      });
      
      // Performance should scale reasonably with size
      expect(results.small).toBeLessThan(50);
      expect(results.medium).toBeLessThan(150);
      expect(results.large).toBeLessThan(500);
      
      // Larger levels should take more time, but not exponentially more
      expect(results.medium / results.small).toBeLessThan(10);
      expect(results.large / results.medium).toBeLessThan(10);
    });
  });

  describe('Memory Usage Validation', () => {
    it('should validate memory usage during gameplay', () => {
      const testLevel = createTestLevel('medium');
      
      // Measure memory usage during extended gameplay
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      gameCore.initializeLevel(testLevel);
      gameCore.startGame();
      
      // Simulate extended gameplay
      for (let session = 0; session < 5; session++) {
        for (let move = 0; move < 50; move++) {
          gameCore.movePlayer(['right', 'down', 'left', 'up'][move % 4] as any);
        }
        
        // Reset and restart
        gameCore.resetGame();
        gameCore.startGame();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`Memory usage: Initial=${initialMemory}, Final=${finalMemory}, Increase=${memoryIncrease}`);
      
      // Memory increase should be reasonable (less than 10MB for this test)
      if (initialMemory > 0 && finalMemory > 0) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
      }
    });

    it('should validate memory cleanup on level changes', () => {
      const levels = [
        createTestLevel('small', 111),
        createTestLevel('medium', 222),
        createTestLevel('large', 333)
      ];
      
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Load different levels multiple times
      for (let cycle = 0; cycle < 3; cycle++) {
        levels.forEach(level => {
          gameCore.initializeLevel(level);
          gameCore.startGame();
          
          // Play briefly
          for (let i = 0; i < 10; i++) {
            gameCore.movePlayer(['right', 'down', 'left', 'up'][i % 4] as any);
          }
          
          gameCore.resetGame();
        });
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`Memory after level cycling: Initial=${initialMemory}, Final=${finalMemory}, Increase=${memoryIncrease}`);
      
      // Memory should not grow significantly after multiple level loads
      if (initialMemory > 0 && finalMemory > 0) {
        expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024); // 20MB threshold
      }
    });
  });

  describe('Optimization Validation', () => {
    it('should validate optimized maze generation', () => {
      const testLevel = createTestLevel('large');
      const samples: number[] = [];
      
      // Test maze generation performance multiple times
      for (let i = 0; i < 5; i++) {
        const metrics = measurePerformance(() => {
          const core = new GameCore();
          core.initializeLevel(testLevel);
          return core.getGameState().maze;
        });
        
        samples.push(metrics.duration);
        
        // Verify maze quality
        const maze = metrics.result;
        expect(maze.length).toBe(testLevel.config.boardSize.height);
        expect(maze[0].length).toBe(testLevel.config.boardSize.width);
      }
      
      const avgDuration = samples.reduce((sum, d) => sum + d, 0) / samples.length;
      console.log(`Large maze generation average: ${avgDuration.toFixed(2)}ms`);
      
      // Should generate large mazes efficiently
      expect(avgDuration).toBeLessThan(500); // 500ms threshold for large mazes
      
      // Performance should be consistent
      const maxDuration = Math.max(...samples);
      const minDuration = Math.min(...samples);
      expect(maxDuration / minDuration).toBeLessThan(3);
    });

    it('should validate optimized state management', () => {
      const testLevel = createTestLevel('medium');
      gameCore.initializeLevel(testLevel);
      gameCore.startGame();
      
      // Test state update performance
      const stateUpdateMetrics = measurePerformance(() => {
        let totalUpdates = 0;
        
        for (let i = 0; i < 100; i++) {
          const result = gameCore.movePlayer(['right', 'down', 'left', 'up'][i % 4] as any);
          if (result.success) {
            totalUpdates++;
          }
          
          // Access state after each update
          const state = gameCore.getGameState();
          expect(state).toBeDefined();
        }
        
        return totalUpdates;
      }, 100);
      
      console.log(`100 state updates: ${stateUpdateMetrics.duration.toFixed(2)}ms`);
      
      // State updates should be fast
      expect(stateUpdateMetrics.duration).toBeLessThan(100); // 100ms for 100 updates
      expect(stateUpdateMetrics.duration / 100).toBeLessThan(2); // Less than 2ms per update
    });

    it('should validate event system performance', () => {
      const testLevel = createTestLevel('small');
      gameCore.initializeLevel(testLevel);
      
      let eventCount = 0;
      const eventHandler = () => { eventCount++; };
      
      // Subscribe to events
      gameCore.on('player.moved', eventHandler);
      gameCore.on('state.changed', eventHandler);
      
      gameCore.startGame();
      
      // Test event emission performance
      const eventMetrics = measurePerformance(() => {
        for (let i = 0; i < 50; i++) {
          gameCore.movePlayer(['right', 'down', 'left', 'up'][i % 4] as any);
        }
        return eventCount;
      }, 50);
      
      console.log(`50 moves with events: ${eventMetrics.duration.toFixed(2)}ms, ${eventCount} events emitted`);
      
      // Event system should not significantly impact performance
      expect(eventMetrics.duration).toBeLessThan(100); // 100ms for 50 moves with events
      expect(eventCount).toBeGreaterThan(0); // Events should be emitted
      
      // Clean up
      gameCore.off('player.moved', eventHandler);
      gameCore.off('state.changed', eventHandler);
    });
  });

  describe('Scalability Validation', () => {
    it('should handle concurrent operations efficiently', async () => {
      const testLevel = createTestLevel('medium');
      
      // Test concurrent game core instances
      const concurrentMetrics = measurePerformance(() => {
        const cores = Array.from({ length: 5 }, () => new GameCore());
        
        cores.forEach(core => {
          core.initializeLevel(testLevel);
          core.startGame();
          
          // Perform some operations
          for (let i = 0; i < 10; i++) {
            core.movePlayer(['right', 'down', 'left', 'up'][i % 4] as any);
          }
        });
        
        return cores.map(core => core.getGameState());
      });
      
      console.log(`5 concurrent game instances: ${concurrentMetrics.duration.toFixed(2)}ms`);
      
      // Should handle multiple instances efficiently
      expect(concurrentMetrics.duration).toBeLessThan(1000); // 1 second for 5 instances
      expect(concurrentMetrics.result.length).toBe(5);
      
      // All instances should have valid states
      concurrentMetrics.result.forEach(state => {
        expect(state.maze).toBeDefined();
        expect(state.moves).toBeGreaterThanOrEqual(0);
      });
    });

    it('should validate performance with many objectives', () => {
      // Create level with many objectives
      const complexLevel: LevelDefinition = {
        ...createTestLevel('medium'),
        config: {
          ...createTestLevel('medium').config,
          objectives: Array.from({ length: 10 }, (_, i) => ({
            id: `objective-${i}`,
            type: 'collect_orbs',
            target: i + 1,
            description: `Collect ${i + 1} orbs`,
            required: i < 5,
            priority: i + 1
          }))
        }
      };
      
      const complexMetrics = measurePerformance(() => {
        gameCore.initializeLevel(complexLevel);
        gameCore.startGame();
        
        // Perform operations that might trigger objective checks
        for (let i = 0; i < 20; i++) {
          gameCore.movePlayer(['right', 'down', 'left', 'up'][i % 4] as any);
        }
        
        return gameCore.getGameState();
      });
      
      console.log(`Complex level with 10 objectives: ${complexMetrics.duration.toFixed(2)}ms`);
      
      // Should handle complex levels efficiently
      expect(complexMetrics.duration).toBeLessThan(200); // 200ms threshold
      expect(complexMetrics.result.objectives.length).toBe(10);
    });
  });
});