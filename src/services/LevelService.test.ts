// LevelService tests
import { describe, it, expect, beforeEach } from 'vitest';
import { LevelService } from './LevelService';
import { LevelDefinition } from '../core/types/Level';

describe('LevelService', () => {
  let levelService: LevelService;

  beforeEach(() => {
    levelService = new LevelService(10); // Small cache for testing
  });

  describe('Cache Management', () => {
    it('should initialize with empty cache', () => {
      const stats = levelService.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.totalRequests).toBe(0);
      expect(stats.hitRate).toBe(0);
    });

    it('should return null for non-existent cached level', () => {
      const cached = levelService.getCachedLevel('non-existent');
      expect(cached).toBeNull();
    });

    it('should clear cache correctly', () => {
      levelService.clearCache();
      const stats = levelService.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Level Validation', () => {
    it('should validate a valid level definition', () => {
      const validLevel: LevelDefinition = {
        id: 'test-level',
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
            algorithm: 'prim',
            complexity: 0.5,
            branchingFactor: 0.3,
            deadEndRatio: 0.1,
            orbCount: 3,
            orbPlacement: 'random'
          }
        },
        config: {
          boardSize: { width: 10, height: 10 },
          objectives: [{
            id: 'reach-goal',
            type: 'reach_goal',
            target: 1,
            description: 'Reach the goal',
            required: true,
            priority: 1
          }],
          constraints: [],
          powerups: []
        },
        progression: {
          starThresholds: [{
            stars: 1,
            requirements: {}
          }],
          rewards: [],
          unlocks: []
        }
      };

      const result = levelService.validateLevel(validLevel);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid level definition', () => {
      const invalidLevel = {
        id: 'test-level',
        // Missing required fields
      };

      const result = levelService.validateLevel(invalidLevel);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Level Generation', () => {
    it('should generate a procedural level', async () => {
      const levelDefinition: LevelDefinition = {
        id: 'test-procedural',
        version: 1,
        metadata: {
          name: 'Test Procedural Level',
          difficulty: 'easy',
          estimatedTime: 60,
          tags: ['test', 'procedural']
        },
        generation: {
          type: 'procedural',
          seed: 12345,
          parameters: {
            algorithm: 'prim',
            complexity: 0.5,
            branchingFactor: 0.3,
            deadEndRatio: 0.1,
            orbCount: 3,
            orbPlacement: 'random'
          }
        },
        config: {
          boardSize: { width: 5, height: 5 },
          objectives: [{
            id: 'reach-goal',
            type: 'reach_goal',
            target: 1,
            description: 'Reach the goal',
            required: true,
            priority: 1
          }],
          constraints: [],
          powerups: []
        },
        progression: {
          starThresholds: [{
            stars: 1,
            requirements: {}
          }],
          rewards: [],
          unlocks: []
        }
      };

      const generatedLevel = await levelService.generateLevel(levelDefinition, 12345);
      
      expect(generatedLevel).toBeDefined();
      expect(generatedLevel.definition).toEqual(levelDefinition);
      expect(generatedLevel.maze).toBeDefined();
      expect(generatedLevel.maze.length).toBe(5);
      expect(generatedLevel.maze[0].length).toBe(5);
      expect(generatedLevel.startPosition).toEqual({ x: 0, y: 0 });
      expect(generatedLevel.goalPosition).toEqual({ x: 4, y: 4 });
      expect(generatedLevel.orbPositions.length).toBe(3);
      expect(generatedLevel.metadata.seed).toBe(12345);
      expect(generatedLevel.metadata.solvable).toBe(true);
    });

    it('should generate a handcrafted level', async () => {
      const levelDefinition: LevelDefinition = {
        id: 'test-handcrafted',
        version: 1,
        metadata: {
          name: 'Test Handcrafted Level',
          difficulty: 'easy',
          estimatedTime: 60,
          tags: ['test', 'handcrafted']
        },
        generation: {
          type: 'handcrafted',
          layout: {
            cells: [
              [{ walls: 15, type: 'floor' }, { walls: 15, type: 'floor' }, { walls: 15, type: 'floor' }],
              [{ walls: 15, type: 'start' }, { walls: 15, type: 'floor' }, { walls: 15, type: 'floor' }],
              [{ walls: 15, type: 'floor' }, { walls: 15, type: 'floor' }, { walls: 15, type: 'goal' }]
            ],
            startPosition: { x: 0, y: 1 },
            goalPosition: { x: 2, y: 2 },
            orbPositions: [{ x: 1, y: 1, value: 100, id: 'orb-1' }],
            powerupPositions: []
          }
        },
        config: {
          boardSize: { width: 3, height: 3 },
          objectives: [{
            id: 'reach-goal',
            type: 'reach_goal',
            target: 1,
            description: 'Reach the goal',
            required: true,
            priority: 1
          }],
          constraints: [],
          powerups: []
        },
        progression: {
          starThresholds: [{
            stars: 1,
            requirements: {}
          }],
          rewards: [],
          unlocks: []
        }
      };

      const generatedLevel = await levelService.generateLevel(levelDefinition, 12345);
      
      
      expect(generatedLevel).toBeDefined();
      expect(generatedLevel.definition).toEqual(levelDefinition);
      expect(generatedLevel.maze).toBeDefined();
      expect(generatedLevel.maze.length).toBe(3);
      expect(generatedLevel.maze[0].length).toBe(3);
      expect(generatedLevel.startPosition).toEqual({ x: 0, y: 1 });
      expect(generatedLevel.goalPosition).toEqual({ x: 2, y: 2 });
      expect(generatedLevel.orbPositions.length).toBe(1);
      expect(generatedLevel.orbPositions[0]).toEqual({ x: 1, y: 1, value: 100, id: 'orb-1' });
    });

    it('should validate generated level correctly', async () => {
      const levelDefinition: LevelDefinition = {
        id: 'test-validation',
        version: 1,
        metadata: {
          name: 'Test Validation Level',
          difficulty: 'easy',
          estimatedTime: 60,
          tags: ['test']
        },
        generation: {
          type: 'procedural',
          seed: 12345,
          parameters: {
            algorithm: 'prim',
            complexity: 0.5,
            branchingFactor: 0.3,
            deadEndRatio: 0.1,
            orbCount: 2,
            orbPlacement: 'random'
          }
        },
        config: {
          boardSize: { width: 4, height: 4 },
          objectives: [{
            id: 'reach-goal',
            type: 'reach_goal',
            target: 1,
            description: 'Reach the goal',
            required: true,
            priority: 1
          }],
          constraints: [],
          powerups: []
        },
        progression: {
          starThresholds: [{
            stars: 1,
            requirements: {}
          }],
          rewards: [],
          unlocks: []
        }
      };

      const generatedLevel = await levelService.generateLevel(levelDefinition);
      const validationResult = levelService.validateGeneratedLevel(generatedLevel);
      
      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });
  });

  describe('Available Levels', () => {
    it('should list available levels', async () => {
      const levels = await levelService.listAvailableLevels();
      expect(Array.isArray(levels)).toBe(true);
    });
  });
});