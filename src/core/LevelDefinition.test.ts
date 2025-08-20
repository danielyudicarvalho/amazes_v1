import { describe, test, expect } from 'vitest';
import { LevelValidator, LevelSchema, LevelValidationError, LevelSchemaManager } from './LevelDefinition';
import { LevelDefinition } from './types/Level';

// Import sample level data
import level001 from '../data/levels/level-001-tutorial.json';
import level002 from '../data/levels/level-002-simple-path.json';
import level003 from '../data/levels/level-003-branching-paths.json';
import level004 from '../data/levels/level-004-time-pressure.json';
import level005 from '../data/levels/level-005-puzzle-chamber.json';
import level006 from '../data/levels/level-006-maze-runner.json';
import level007 from '../data/levels/level-007-symmetry-challenge.json';
import level008 from '../data/levels/level-008-trap-maze.json';
import level009 from '../data/levels/level-009-speed-demon.json';
import level010 from '../data/levels/level-010-master-challenge.json';

describe('LevelDefinition Validation', () => {
  const sampleLevels = [
    level001, level002, level003, level004, level005,
    level006, level007, level008, level009, level010
  ];

  describe('Sample Level Validation', () => {
    test.each(sampleLevels)('validates sample level: $id', (levelData) => {
      const result = LevelValidator.validate(levelData);
      
      if (!result.valid) {
        console.error(`Validation errors for ${levelData.id}:`, result.errors);
        console.warn(`Validation warnings for ${levelData.id}:`, result.warnings);
      }
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test.each(sampleLevels)('validates gameplay readiness: $id', (levelData) => {
      const result = LevelSchema.validateForGameplay(levelData as LevelDefinition);
      
      if (!result.valid) {
        console.error(`Gameplay validation errors for ${levelData.id}:`, result.errors);
      }
      
      expect(result.valid).toBe(true);
    });
  });

  describe('Level Type Guards', () => {
    test('isLevelDefinition works correctly', () => {
      expect(LevelValidator.isLevelDefinition(level001)).toBe(true);
      expect(LevelValidator.isLevelDefinition({})).toBe(false);
      expect(LevelValidator.isLevelDefinition(null)).toBe(false);
    });

    test('isLevelMetadata works correctly', () => {
      expect(LevelValidator.isLevelMetadata(level001.metadata)).toBe(true);
      expect(LevelValidator.isLevelMetadata({})).toBe(false);
    });

    test('isLevelGeneration works correctly', () => {
      expect(LevelValidator.isLevelGeneration(level001.generation)).toBe(true);
      expect(LevelValidator.isLevelGeneration(level002.generation)).toBe(true);
      expect(LevelValidator.isLevelGeneration({})).toBe(false);
    });
  });

  describe('Schema Validation', () => {
    test('validates against JSON schema', () => {
      const result = LevelSchema.validateSchema(level001);
      expect(result.valid).toBe(true);
    });

    test('calculates and verifies checksums', () => {
      const originalLevel = level001 as LevelDefinition;
      const checksum = LevelSchema.calculateChecksum(originalLevel);
      
      const levelWithChecksum = {
        ...originalLevel,
        checksum
      } as LevelDefinition;

      expect(LevelSchema.verifyIntegrity(levelWithChecksum)).toBe(true);
      
      // Modify the level and verify checksum fails
      const modifiedLevel = {
        ...levelWithChecksum,
        metadata: { ...levelWithChecksum.metadata, name: 'Modified Name' }
      } as LevelDefinition;
      
      expect(LevelSchema.verifyIntegrity(modifiedLevel)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('creates validation errors correctly', () => {
      const invalidLevel = { id: 123, version: 'invalid' };
      const result = LevelValidator.validate(invalidLevel);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const error = LevelValidationError.fromValidationResult(result, 'test');
      expect(error).toBeInstanceOf(LevelValidationError);
      expect(error.validationErrors).toEqual(result.errors);
    });

    test('formats error messages correctly', () => {
      const invalidLevel = { id: 123 };
      const result = LevelValidator.validate(invalidLevel);
      const error = LevelValidationError.fromValidationResult(result);
      
      const formatted = error.getFormattedErrors();
      expect(formatted).toContain('id:');
      expect(formatted).toContain('version:');
    });
  });

  describe('Level Variety Validation', () => {
    test('has mix of procedural and handcrafted levels', () => {
      const proceduralLevels = sampleLevels.filter(level => level.generation.type === 'procedural');
      const handcraftedLevels = sampleLevels.filter(level => level.generation.type === 'handcrafted');
      
      expect(proceduralLevels.length).toBeGreaterThan(0);
      expect(handcraftedLevels.length).toBeGreaterThan(0);
      expect(proceduralLevels.length + handcraftedLevels.length).toBe(sampleLevels.length);
    });

    test('has variety in difficulty levels', () => {
      const difficulties = sampleLevels.map(level => level.metadata.difficulty);
      const uniqueDifficulties = [...new Set(difficulties)];
      
      expect(uniqueDifficulties.length).toBeGreaterThan(2);
      expect(uniqueDifficulties).toContain('easy');
      expect(uniqueDifficulties).toContain('medium');
      expect(uniqueDifficulties).toContain('hard');
    });

    test('has progressive complexity', () => {
      // Check that board sizes generally increase
      const boardSizes = sampleLevels.map(level => 
        level.config.boardSize.width * level.config.boardSize.height
      );
      
      // First level should be smaller than last level
      expect(boardSizes[0]).toBeLessThan(boardSizes[boardSizes.length - 1]);
    });

    test('has variety in objectives and constraints', () => {
      const allObjectiveTypes = sampleLevels.flatMap(level => 
        level.config.objectives.map(obj => obj.type)
      );
      const uniqueObjectiveTypes = [...new Set(allObjectiveTypes)];
      
      expect(uniqueObjectiveTypes.length).toBeGreaterThan(3);
      expect(uniqueObjectiveTypes).toContain('reach_goal');
      expect(uniqueObjectiveTypes).toContain('collect_orbs');
      
      const allConstraintTypes = sampleLevels.flatMap(level => 
        level.config.constraints.map(constraint => constraint.type)
      );
      const uniqueConstraintTypes = [...new Set(allConstraintTypes)];
      
      expect(uniqueConstraintTypes.length).toBeGreaterThan(2);
    });
  });

  describe('Level Progression', () => {
    test('levels have proper unlock chains', () => {
      const levelIds = sampleLevels.map(level => level.id);
      
      // Check that each level (except the first) is unlocked by a previous level
      for (let i = 1; i < sampleLevels.length; i++) {
        const currentLevelId = sampleLevels[i].id;
        const previousLevels = sampleLevels.slice(0, i);
        
        const isUnlockedByPrevious = previousLevels.some(prevLevel => 
          prevLevel.progression.unlocks.includes(currentLevelId)
        );
        
        expect(isUnlockedByPrevious).toBe(true);
      }
    });

    test('star thresholds are properly ordered', () => {
      sampleLevels.forEach(level => {
        const thresholds = level.progression.starThresholds;
        
        for (let i = 1; i < thresholds.length; i++) {
          expect(thresholds[i].stars).toBeGreaterThan(thresholds[i-1].stars);
        }
      });
    });
  });
});

describe('Schema Migration', () => {
  test('migrates from version 0 to 1', () => {
    const oldLevel = {
      id: 'test-level',
      version: 0,
      name: 'Test Level',
      difficulty: 'easy'
    };

    const migrated = LevelSchemaManager.migrate(oldLevel, 0, 1);
    
    expect(migrated.version).toBe(1);
    expect(migrated.metadata).toBeDefined();
    expect(migrated.generation).toBeDefined();
    expect(migrated.config).toBeDefined();
    expect(migrated.progression).toBeDefined();
  });

  test('handles same version migration', () => {
    const level = level001 as LevelDefinition;
    const migrated = LevelSchemaManager.migrate(level, 1, 1);
    
    expect(migrated).toEqual(level);
  });
});