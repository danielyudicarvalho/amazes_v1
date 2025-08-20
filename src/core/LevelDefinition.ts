// Level schema and validation
import { 
  LevelDefinition, 
  LevelMetadata, 
  LevelGeneration, 
  LevelConfig, 
  LevelProgression,
  ValidationError,
  ValidationResult,
  ProceduralParameters,
  HandcraftedLayout,
  Objective,
  Constraint,
  PowerupConfig,
  StarThreshold,
  Reward,
  Position,
  Size,
  MazeCell
} from './types/Level';

export class LevelValidator {
  private static readonly CURRENT_VERSION = 1;
  private static readonly SUPPORTED_VERSIONS = [1];
  
  /**
   * Runtime type guard for LevelDefinition
   */
  static isLevelDefinition(obj: any): obj is LevelDefinition {
    const result = this.validate(obj);
    return result.valid;
  }

  /**
   * Runtime type guard for LevelMetadata
   */
  static isLevelMetadata(obj: any): obj is LevelMetadata {
    const result = this.validateMetadata(obj);
    return result.valid;
  }

  /**
   * Runtime type guard for LevelGeneration
   */
  static isLevelGeneration(obj: any): obj is LevelGeneration {
    const result = this.validateGeneration(obj);
    return result.valid;
  }

  /**
   * Runtime type guard for LevelConfig
   */
  static isLevelConfig(obj: any): obj is LevelConfig {
    const result = this.validateConfig(obj);
    return result.valid;
  }

  /**
   * Runtime type guard for LevelProgression
   */
  static isLevelProgression(obj: any): obj is LevelProgression {
    const result = this.validateProgression(obj);
    return result.valid;
  }
  
  /**
   * Validates a complete level definition against the schema
   */
  static validate(levelDefinition: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Basic structure validation
    if (!levelDefinition || typeof levelDefinition !== 'object') {
      errors.push({
        field: 'root',
        message: 'Level definition must be an object',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
      return { valid: false, errors, warnings };
    }

    // Required fields validation
    const requiredFields = ['id', 'version', 'metadata', 'generation', 'config', 'progression'];
    for (const field of requiredFields) {
      if (!(field in levelDefinition)) {
        errors.push({
          field,
          message: `Required field '${field}' is missing`,
          severity: 'error',
          code: 'MISSING_FIELD'
        });
      }
    }

    // Version validation
    if (typeof levelDefinition.version !== 'number') {
      errors.push({
        field: 'version',
        message: 'Version must be a number',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    } else if (!this.SUPPORTED_VERSIONS.includes(levelDefinition.version)) {
      warnings.push({
        field: 'version',
        message: `Version ${levelDefinition.version} may not be fully supported`,
        severity: 'warning',
        code: 'UNSUPPORTED_VERSION'
      });
    }

    // ID validation
    if (typeof levelDefinition.id !== 'string' || !levelDefinition.id.trim()) {
      errors.push({
        field: 'id',
        message: 'ID must be a non-empty string',
        severity: 'error',
        code: 'INVALID_ID'
      });
    } else if (!/^[a-zA-Z0-9_-]+$/.test(levelDefinition.id)) {
      errors.push({
        field: 'id',
        message: 'ID must contain only alphanumeric characters, underscores, and hyphens',
        severity: 'error',
        code: 'INVALID_ID_FORMAT'
      });
    }

    // Validate sub-components
    if (levelDefinition.metadata) {
      const metadataResult = this.validateMetadata(levelDefinition.metadata);
      errors.push(...metadataResult.errors);
      warnings.push(...metadataResult.warnings);
    }

    if (levelDefinition.generation) {
      const generationResult = this.validateGeneration(levelDefinition.generation);
      errors.push(...generationResult.errors);
      warnings.push(...generationResult.warnings);
    }

    if (levelDefinition.config) {
      const configResult = this.validateConfig(levelDefinition.config);
      errors.push(...configResult.errors);
      warnings.push(...configResult.warnings);
    }

    if (levelDefinition.progression) {
      const progressionResult = this.validateProgression(levelDefinition.progression);
      errors.push(...progressionResult.errors);
      warnings.push(...progressionResult.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates level metadata
   */
  static validateMetadata(metadata: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!metadata || typeof metadata !== 'object') {
      errors.push({
        field: 'metadata',
        message: 'Metadata must be an object',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
      return { valid: false, errors, warnings };
    }

    // Required fields
    const requiredFields = ['name', 'difficulty', 'estimatedTime', 'tags'];
    for (const field of requiredFields) {
      if (!(field in metadata)) {
        errors.push({
          field: `metadata.${field}`,
          message: `Required field '${field}' is missing`,
          severity: 'error',
          code: 'MISSING_FIELD'
        });
      }
    }

    // Name validation
    if (typeof metadata.name !== 'string' || !metadata.name.trim()) {
      errors.push({
        field: 'metadata.name',
        message: 'Name must be a non-empty string',
        severity: 'error',
        code: 'INVALID_NAME'
      });
    }

    // Difficulty validation
    const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
    if (!validDifficulties.includes(metadata.difficulty)) {
      errors.push({
        field: 'metadata.difficulty',
        message: `Difficulty must be one of: ${validDifficulties.join(', ')}`,
        severity: 'error',
        code: 'INVALID_DIFFICULTY'
      });
    }

    // Estimated time validation
    if (typeof metadata.estimatedTime !== 'number' || metadata.estimatedTime <= 0) {
      errors.push({
        field: 'metadata.estimatedTime',
        message: 'Estimated time must be a positive number',
        severity: 'error',
        code: 'INVALID_TIME'
      });
    }

    // Tags validation
    if (!Array.isArray(metadata.tags)) {
      errors.push({
        field: 'metadata.tags',
        message: 'Tags must be an array',
        severity: 'error',
        code: 'INVALID_TAGS'
      });
    } else {
      metadata.tags.forEach((tag: any, index: number) => {
        if (typeof tag !== 'string') {
          errors.push({
            field: `metadata.tags[${index}]`,
            message: 'Each tag must be a string',
            severity: 'error',
            code: 'INVALID_TAG'
          });
        }
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates level generation configuration
   */
  static validateGeneration(generation: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!generation || typeof generation !== 'object') {
      errors.push({
        field: 'generation',
        message: 'Generation must be an object',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
      return { valid: false, errors, warnings };
    }

    // Type validation
    const validTypes = ['procedural', 'handcrafted'];
    if (!validTypes.includes(generation.type)) {
      errors.push({
        field: 'generation.type',
        message: `Generation type must be one of: ${validTypes.join(', ')}`,
        severity: 'error',
        code: 'INVALID_GENERATION_TYPE'
      });
    }

    // Procedural validation
    if (generation.type === 'procedural') {
      if (typeof generation.seed !== 'number') {
        warnings.push({
          field: 'generation.seed',
          message: 'Procedural generation should include a seed for deterministic results',
          severity: 'warning',
          code: 'MISSING_SEED'
        });
      }

      if (generation.parameters) {
        const paramResult = this.validateProceduralParameters(generation.parameters);
        errors.push(...paramResult.errors);
        warnings.push(...paramResult.warnings);
      }
    }

    // Handcrafted validation
    if (generation.type === 'handcrafted') {
      if (!generation.layout) {
        errors.push({
          field: 'generation.layout',
          message: 'Handcrafted generation must include layout data',
          severity: 'error',
          code: 'MISSING_LAYOUT'
        });
      } else {
        const layoutResult = this.validateHandcraftedLayout(generation.layout);
        errors.push(...layoutResult.errors);
        warnings.push(...layoutResult.warnings);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates procedural generation parameters
   */
  static validateProceduralParameters(parameters: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const validAlgorithms = ['recursive_backtrack', 'kruskal', 'prim', 'wilson'];
    if (!validAlgorithms.includes(parameters.algorithm)) {
      errors.push({
        field: 'generation.parameters.algorithm',
        message: `Algorithm must be one of: ${validAlgorithms.join(', ')}`,
        severity: 'error',
        code: 'INVALID_ALGORITHM'
      });
    }

    // Validate numeric parameters are in valid ranges
    const numericParams = [
      { name: 'complexity', min: 0, max: 1 },
      { name: 'branchingFactor', min: 0, max: 1 },
      { name: 'deadEndRatio', min: 0, max: 1 }
    ];

    for (const param of numericParams) {
      const value = parameters[param.name];
      if (typeof value !== 'number' || value < param.min || value > param.max) {
        errors.push({
          field: `generation.parameters.${param.name}`,
          message: `${param.name} must be a number between ${param.min} and ${param.max}`,
          severity: 'error',
          code: 'INVALID_PARAMETER_RANGE'
        });
      }
    }

    // Orb count validation
    if (typeof parameters.orbCount !== 'number' || parameters.orbCount < 0) {
      errors.push({
        field: 'generation.parameters.orbCount',
        message: 'Orb count must be a non-negative number',
        severity: 'error',
        code: 'INVALID_ORB_COUNT'
      });
    }

    // Orb placement validation
    const validPlacements = ['random', 'strategic', 'path', 'corners'];
    if (!validPlacements.includes(parameters.orbPlacement)) {
      errors.push({
        field: 'generation.parameters.orbPlacement',
        message: `Orb placement must be one of: ${validPlacements.join(', ')}`,
        severity: 'error',
        code: 'INVALID_ORB_PLACEMENT'
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates handcrafted layout data
   */
  static validateHandcraftedLayout(layout: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Required fields
    const requiredFields = ['cells', 'startPosition', 'goalPosition', 'orbPositions'];
    for (const field of requiredFields) {
      if (!(field in layout)) {
        errors.push({
          field: `generation.layout.${field}`,
          message: `Required field '${field}' is missing`,
          severity: 'error',
          code: 'MISSING_FIELD'
        });
      }
    }

    // Validate positions
    if (layout.startPosition && !this.isValidPosition(layout.startPosition)) {
      errors.push({
        field: 'generation.layout.startPosition',
        message: 'Start position must have valid x and y coordinates',
        severity: 'error',
        code: 'INVALID_POSITION'
      });
    }

    if (layout.goalPosition && !this.isValidPosition(layout.goalPosition)) {
      errors.push({
        field: 'generation.layout.goalPosition',
        message: 'Goal position must have valid x and y coordinates',
        severity: 'error',
        code: 'INVALID_POSITION'
      });
    }

    // Validate orb positions
    if (Array.isArray(layout.orbPositions)) {
      layout.orbPositions.forEach((orb: any, index: number) => {
        if (!this.isValidPosition(orb) || typeof orb.value !== 'number') {
          errors.push({
            field: `generation.layout.orbPositions[${index}]`,
            message: 'Orb position must have valid x, y coordinates and numeric value',
            severity: 'error',
            code: 'INVALID_ORB_POSITION'
          });
        }
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates level game configuration
   */
  static validateConfig(config: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!config || typeof config !== 'object') {
      errors.push({
        field: 'config',
        message: 'Config must be an object',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
      return { valid: false, errors, warnings };
    }

    // Board size validation
    if (!config.boardSize || !this.isValidSize(config.boardSize)) {
      errors.push({
        field: 'config.boardSize',
        message: 'Board size must have valid width and height',
        severity: 'error',
        code: 'INVALID_BOARD_SIZE'
      });
    }

    // Objectives validation
    if (!Array.isArray(config.objectives)) {
      errors.push({
        field: 'config.objectives',
        message: 'Objectives must be an array',
        severity: 'error',
        code: 'INVALID_OBJECTIVES'
      });
    } else {
      config.objectives.forEach((objective: any, index: number) => {
        const objResult = this.validateObjective(objective, index);
        errors.push(...objResult.errors);
        warnings.push(...objResult.warnings);
      });
    }

    // Constraints validation
    if (!Array.isArray(config.constraints)) {
      errors.push({
        field: 'config.constraints',
        message: 'Constraints must be an array',
        severity: 'error',
        code: 'INVALID_CONSTRAINTS'
      });
    } else {
      config.constraints.forEach((constraint: any, index: number) => {
        const constResult = this.validateConstraint(constraint, index);
        errors.push(...constResult.errors);
        warnings.push(...constResult.warnings);
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates level progression configuration
   */
  static validateProgression(progression: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!progression || typeof progression !== 'object') {
      errors.push({
        field: 'progression',
        message: 'Progression must be an object',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
      return { valid: false, errors, warnings };
    }

    // Star thresholds validation
    if (!Array.isArray(progression.starThresholds)) {
      errors.push({
        field: 'progression.starThresholds',
        message: 'Star thresholds must be an array',
        severity: 'error',
        code: 'INVALID_STAR_THRESHOLDS'
      });
    } else if (progression.starThresholds.length === 0) {
      warnings.push({
        field: 'progression.starThresholds',
        message: 'No star thresholds defined',
        severity: 'warning',
        code: 'EMPTY_STAR_THRESHOLDS'
      });
    }

    // Rewards validation
    if (!Array.isArray(progression.rewards)) {
      errors.push({
        field: 'progression.rewards',
        message: 'Rewards must be an array',
        severity: 'error',
        code: 'INVALID_REWARDS'
      });
    }

    // Unlocks validation
    if (!Array.isArray(progression.unlocks)) {
      errors.push({
        field: 'progression.unlocks',
        message: 'Unlocks must be an array',
        severity: 'error',
        code: 'INVALID_UNLOCKS'
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Helper method to validate position objects
   */
  private static isValidPosition(pos: any): boolean {
    return pos && 
           typeof pos === 'object' && 
           typeof pos.x === 'number' && 
           typeof pos.y === 'number' &&
           pos.x >= 0 && pos.y >= 0;
  }

  /**
   * Helper method to validate size objects
   */
  private static isValidSize(size: any): boolean {
    return size && 
           typeof size === 'object' && 
           typeof size.width === 'number' && 
           typeof size.height === 'number' &&
           size.width > 0 && size.height > 0;
  }

  /**
   * Validates individual objective
   */
  private static validateObjective(objective: any, index: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const validTypes = ['collect_orbs', 'collect_all_orbs', 'reach_goal', 'time_limit', 'move_limit', 'collect_sequence', 'avoid_traps'];
    
    if (!validTypes.includes(objective.type)) {
      errors.push({
        field: `config.objectives[${index}].type`,
        message: `Objective type must be one of: ${validTypes.join(', ')}`,
        severity: 'error',
        code: 'INVALID_OBJECTIVE_TYPE'
      });
    }

    if (typeof objective.target !== 'number' || objective.target < 0) {
      errors.push({
        field: `config.objectives[${index}].target`,
        message: 'Objective target must be a non-negative number',
        severity: 'error',
        code: 'INVALID_OBJECTIVE_TARGET'
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates individual constraint
   */
  private static validateConstraint(constraint: any, index: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const validTypes = ['time_limit', 'move_limit', 'no_backtrack', 'no_diagonal', 'limited_vision', 'one_way_paths'];
    
    if (!validTypes.includes(constraint.type)) {
      errors.push({
        field: `config.constraints[${index}].type`,
        message: `Constraint type must be one of: ${validTypes.join(', ')}`,
        severity: 'error',
        code: 'INVALID_CONSTRAINT_TYPE'
      });
    }

    if (typeof constraint.value !== 'number' || constraint.value < 0) {
      errors.push({
        field: `config.constraints[${index}].value`,
        message: 'Constraint value must be a non-negative number',
        severity: 'error',
        code: 'INVALID_CONSTRAINT_VALUE'
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}

export class LevelSchemaManager {
  private static readonly CURRENT_VERSION = 1;
  
  /**
   * Migrates old level definitions to current schema version
   */
  static migrate(levelDefinition: any, fromVersion: number, toVersion: number = this.CURRENT_VERSION): LevelDefinition {
    if (fromVersion === toVersion) {
      return levelDefinition as LevelDefinition;
    }

    let migrated = { ...levelDefinition };

    // Migration from version 0 to 1 (if needed in future)
    if (fromVersion < 1 && toVersion >= 1) {
      migrated = this.migrateToV1(migrated);
    }

    // Update version number
    migrated.version = toVersion;

    return migrated as LevelDefinition;
  }

  /**
   * Gets the current schema version
   */
  static getCurrentVersion(): number {
    return this.CURRENT_VERSION;
  }

  /**
   * Checks if a version is supported
   */
  static isVersionSupported(version: number): boolean {
    return version <= this.CURRENT_VERSION && version >= 1;
  }

  /**
   * Migration logic for version 1 (placeholder for future migrations)
   */
  private static migrateToV1(levelDefinition: any): any {
    // Add any migration logic here when we have version changes
    // For now, just ensure required fields exist with defaults
    
    if (!levelDefinition.metadata) {
      levelDefinition.metadata = {
        name: levelDefinition.name || `Level ${levelDefinition.id}`,
        difficulty: levelDefinition.difficulty || 'medium',
        estimatedTime: levelDefinition.estimatedTime || 300,
        tags: levelDefinition.tags || []
      };
    }

    if (!levelDefinition.generation) {
      levelDefinition.generation = {
        type: 'procedural',
        seed: Math.floor(Math.random() * 1000000),
        parameters: {
          algorithm: 'recursive_backtrack',
          complexity: 0.5,
          branchingFactor: 0.3,
          deadEndRatio: 0.1,
          orbCount: 3,
          orbPlacement: 'random'
        }
      };
    }

    if (!levelDefinition.config) {
      levelDefinition.config = {
        boardSize: { width: 10, height: 10 },
        objectives: [{
          id: 'reach_goal',
          type: 'reach_goal',
          target: 1,
          description: 'Reach the goal',
          required: true,
          priority: 1
        }],
        constraints: [],
        powerups: []
      };
    }

    if (!levelDefinition.progression) {
      levelDefinition.progression = {
        starThresholds: [
          { stars: 1, requirements: {} },
          { stars: 2, requirements: { time: 300 } },
          { stars: 3, requirements: { time: 180 } }
        ],
        rewards: [],
        unlocks: []
      };
    }

    return levelDefinition;
  }
}

/**
 * Schema validation utilities and constants
 */
export class LevelSchema {
  static readonly SCHEMA_VERSION = '1.0.0';
  static readonly SCHEMA_URL = 'https://labyrinth-leap.com/schemas/level-v1.json';

  /**
   * Validates level definition against JSON schema
   */
  static validateSchema(levelDefinition: any): ValidationResult {
    // This would integrate with a JSON schema validator in a real implementation
    // For now, we use our custom validation logic
    return LevelValidator.validate(levelDefinition);
  }

  /**
   * Gets the JSON schema definition for level validation
   */
  static getJsonSchema(): object {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: this.SCHEMA_URL,
      title: 'Labyrinth Leap Level Definition',
      description: 'Schema for defining game levels in Labyrinth Leap',
      type: 'object',
      required: ['id', 'version', 'metadata', 'generation', 'config', 'progression'],
      properties: {
        id: {
          type: 'string',
          pattern: '^[a-zA-Z0-9_-]+$',
          description: 'Unique identifier for the level'
        },
        version: {
          type: 'integer',
          minimum: 1,
          description: 'Schema version number'
        },
        $schema: {
          type: 'string',
          description: 'JSON schema reference'
        },
        checksum: {
          type: 'string',
          description: 'Integrity checksum for the level data'
        },
        metadata: {
          type: 'object',
          required: ['name', 'difficulty', 'estimatedTime', 'tags'],
          properties: {
            name: { type: 'string', minLength: 1 },
            difficulty: { enum: ['easy', 'medium', 'hard', 'expert'] },
            estimatedTime: { type: 'number', minimum: 1 },
            tags: { type: 'array', items: { type: 'string' } },
            description: { type: 'string' },
            author: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        generation: {
          type: 'object',
          required: ['type'],
          properties: {
            type: { enum: ['procedural', 'handcrafted'] },
            seed: { type: 'number' }
          },
          oneOf: [
            {
              properties: {
                type: { const: 'procedural' },
                parameters: {
                  type: 'object',
                  required: ['algorithm', 'complexity', 'branchingFactor', 'deadEndRatio', 'orbCount', 'orbPlacement'],
                  properties: {
                    algorithm: { enum: ['recursive_backtrack', 'kruskal', 'prim', 'wilson'] },
                    complexity: { type: 'number', minimum: 0, maximum: 1 },
                    branchingFactor: { type: 'number', minimum: 0, maximum: 1 },
                    deadEndRatio: { type: 'number', minimum: 0, maximum: 1 },
                    orbCount: { type: 'integer', minimum: 0 },
                    orbPlacement: { enum: ['random', 'strategic', 'path', 'corners'] }
                  }
                }
              }
            },
            {
              properties: {
                type: { const: 'handcrafted' },
                layout: {
                  type: 'object',
                  required: ['cells', 'startPosition', 'goalPosition', 'orbPositions'],
                  properties: {
                    cells: { type: 'array' },
                    startPosition: {
                      type: 'object',
                      required: ['x', 'y'],
                      properties: {
                        x: { type: 'integer', minimum: 0 },
                        y: { type: 'integer', minimum: 0 }
                      }
                    },
                    goalPosition: {
                      type: 'object',
                      required: ['x', 'y'],
                      properties: {
                        x: { type: 'integer', minimum: 0 },
                        y: { type: 'integer', minimum: 0 }
                      }
                    },
                    orbPositions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['x', 'y', 'value'],
                        properties: {
                          x: { type: 'integer', minimum: 0 },
                          y: { type: 'integer', minimum: 0 },
                          value: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          ]
        },
        config: {
          type: 'object',
          required: ['boardSize', 'objectives', 'constraints', 'powerups'],
          properties: {
            boardSize: {
              type: 'object',
              required: ['width', 'height'],
              properties: {
                width: { type: 'integer', minimum: 3, maximum: 50 },
                height: { type: 'integer', minimum: 3, maximum: 50 }
              }
            },
            objectives: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'type', 'target', 'description', 'required', 'priority'],
                properties: {
                  id: { type: 'string' },
                  type: { enum: ['collect_orbs', 'collect_all_orbs', 'reach_goal', 'time_limit', 'move_limit', 'collect_sequence', 'avoid_traps'] },
                  target: { type: 'number', minimum: 0 },
                  description: { type: 'string' },
                  required: { type: 'boolean' },
                  priority: { type: 'integer', minimum: 1 }
                }
              }
            },
            constraints: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'type', 'value', 'description', 'severity'],
                properties: {
                  id: { type: 'string' },
                  type: { enum: ['time_limit', 'move_limit', 'no_backtrack', 'no_diagonal', 'limited_vision', 'one_way_paths'] },
                  value: { type: 'number', minimum: 0 },
                  description: { type: 'string' },
                  severity: { enum: ['warning', 'failure'] }
                }
              }
            },
            powerups: {
              type: 'array',
              items: {
                type: 'object',
                required: ['type', 'spawnRate', 'duration', 'effect', 'stackable'],
                properties: {
                  type: { type: 'string' },
                  spawnRate: { type: 'number', minimum: 0, maximum: 1 },
                  duration: { type: 'number', minimum: -1 },
                  effect: { type: 'string' },
                  stackable: { type: 'boolean' }
                }
              }
            }
          }
        },
        progression: {
          type: 'object',
          required: ['starThresholds', 'rewards', 'unlocks'],
          properties: {
            starThresholds: {
              type: 'array',
              items: {
                type: 'object',
                required: ['stars', 'requirements'],
                properties: {
                  stars: { type: 'integer', minimum: 1, maximum: 3 },
                  requirements: { type: 'object' }
                }
              }
            },
            rewards: {
              type: 'array',
              items: {
                type: 'object',
                required: ['type', 'value', 'description'],
                properties: {
                  type: { enum: ['stars', 'coins', 'unlock', 'achievement', 'powerup', 'cosmetic'] },
                  value: { type: 'number' },
                  description: { type: 'string' }
                }
              }
            },
            unlocks: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    };
  }

  /**
   * Validates level definition completeness for gameplay
   */
  static validateForGameplay(levelDefinition: LevelDefinition): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check that level has at least one objective
    if (levelDefinition.config.objectives.length === 0) {
      errors.push({
        field: 'config.objectives',
        message: 'Level must have at least one objective',
        severity: 'error',
        code: 'NO_OBJECTIVES'
      });
    }

    // Check that level has a way to complete (reach goal or collect all orbs)
    const hasCompletionObjective = levelDefinition.config.objectives.some(obj => 
      obj.type === 'reach_goal' || obj.type === 'collect_all_orbs'
    );

    if (!hasCompletionObjective) {
      warnings.push({
        field: 'config.objectives',
        message: 'Level should have a completion objective (reach_goal or collect_all_orbs)',
        severity: 'warning',
        code: 'NO_COMPLETION_OBJECTIVE'
      });
    }

    // Check board size is reasonable
    const { width, height } = levelDefinition.config.boardSize;
    if (width * height > 2500) { // 50x50 max
      warnings.push({
        field: 'config.boardSize',
        message: 'Large board sizes may impact performance',
        severity: 'warning',
        code: 'LARGE_BOARD_SIZE'
      });
    }

    if (width < 3 || height < 3) {
      errors.push({
        field: 'config.boardSize',
        message: 'Board size must be at least 3x3',
        severity: 'error',
        code: 'BOARD_TOO_SMALL'
      });
    }

    // Validate star thresholds are in ascending order
    const thresholds = levelDefinition.progression.starThresholds;
    for (let i = 1; i < thresholds.length; i++) {
      if (thresholds[i].stars <= thresholds[i-1].stars) {
        errors.push({
          field: `progression.starThresholds[${i}]`,
          message: 'Star thresholds must be in ascending order',
          severity: 'error',
          code: 'INVALID_STAR_ORDER'
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Calculates a checksum for level integrity verification
   */
  static calculateChecksum(levelDefinition: LevelDefinition): string {
    // Create a deterministic string representation
    const levelString = JSON.stringify(levelDefinition, (key, value) => {
      // Exclude checksum field from calculation
      if (key === 'checksum') return undefined;
      return value;
    }, 0); // No indentation for consistent formatting
    
    // Simple but effective hash function
    let hash = 0;
    for (let i = 0; i < levelString.length; i++) {
      const char = levelString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Verifies level integrity using checksum
   */
  static verifyIntegrity(levelDefinition: LevelDefinition): boolean {
    if (!levelDefinition.checksum) {
      return false; // No checksum to verify against
    }

    // Create a copy without the checksum field for calculation
    const { checksum, ...levelWithoutChecksum } = levelDefinition;
    const calculatedChecksum = this.calculateChecksum(levelWithoutChecksum as LevelDefinition);

    return calculatedChecksum === levelDefinition.checksum;
  }
}

/**
 * Level validation error types for better error handling
 */
export class LevelValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly validationErrors: ValidationError[],
    message?: string
  ) {
    super(message || `Validation failed for field: ${field}`);
    this.name = 'LevelValidationError';
  }

  /**
   * Creates a validation error from validation result
   */
  static fromValidationResult(result: ValidationResult, context?: string): LevelValidationError {
    const message = context 
      ? `Level validation failed in ${context}: ${result.errors.length} errors, ${result.warnings.length} warnings`
      : `Level validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings`;
    
    return new LevelValidationError('level', result.errors, message);
  }

  /**
   * Gets all error messages as a formatted string
   */
  getFormattedErrors(): string {
    return this.validationErrors
      .map(error => `${error.field}: ${error.message}`)
      .join('\n');
  }

  /**
   * Gets errors by severity
   */
  getErrorsBySeverity(severity: 'error' | 'warning'): ValidationError[] {
    return this.validationErrors.filter(error => error.severity === severity);
  }
}