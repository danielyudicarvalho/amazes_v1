// Level loading and caching
import { 
  LevelDefinition, 
  LevelLoadOptions, 
  LevelLoadResult,
  ValidationResult,
  ValidationError,
  HandcraftedLayout,
  ProceduralParameters,
  Position,
  MazeCell
} from '../core/types/Level';
import { LevelValidator, LevelSchemaManager } from '../core/LevelDefinition';
import { 
  generateMaze, 
  validateMaze, 
  validateOrbPlacements,
  MazeGenerationOptions,
  MazeGenerationResult,
  MazeValidationOptions,
  MazeValidationResult,
  OrbValidationResult
} from '../engine/MazeGen';
import { SeededRandom } from '../utils/rng';
import { ValidationError as EventValidationError } from '../core/types/Events';

export interface ILevelService {
  /**
   * Loads a level definition by ID
   */
  loadLevel(levelId: string, options?: LevelLoadOptions): Promise<LevelDefinition>;

  /**
   * Loads a level definition and returns detailed result
   */
  loadLevelWithResult(levelId: string, options?: LevelLoadOptions): Promise<LevelLoadResult>;

  /**
   * Loads multiple levels by IDs
   */
  loadLevels(levelIds: string[], options?: LevelLoadOptions): Promise<LevelDefinition[]>;

  /**
   * Gets a cached level if available
   */
  getCachedLevel(levelId: string): LevelDefinition | null;

  /**
   * Preloads levels into cache
   */
  preloadLevels(levelIds: string[], options?: LevelLoadOptions): Promise<void>;

  /**
   * Clears the level cache
   */
  clearCache(): void;

  /**
   * Gets cache statistics
   */
  getCacheStats(): { size: number; hitRate: number; totalRequests: number };

  /**
   * Validates a level definition
   */
  validateLevel(levelDefinition: any): ValidationResult;

  /**
   * Lists available level IDs
   */
  listAvailableLevels(): Promise<string[]>;

  /**
   * Generates a complete level from a level definition
   */
  generateLevel(levelDefinition: LevelDefinition, seed?: number): Promise<GeneratedLevel>;

  /**
   * Validates that a generated level meets requirements
   */
  validateGeneratedLevel(generatedLevel: GeneratedLevel): ValidationResult;
}

export interface LevelCacheEntry {
  level: LevelDefinition;
  loadTime: number;
  lastAccessed: number;
  accessCount: number;
  migrated: boolean;
}

export interface LevelCacheStats {
  size: number;
  hitRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
}

export interface GeneratedLevel {
  definition: LevelDefinition;
  maze: MazeCell[][];
  startPosition: Position;
  goalPosition: Position;
  orbPositions: Array<Position & { value: number; id: string }>;
  powerupPositions: Array<Position & { type: string; id: string }>;
  metadata: {
    seed: number;
    generationTime: number;
    algorithm?: string;
    solvable: boolean;
    pathLength: number;
    complexity: number;
  };
}

export interface LevelGenerationError extends Error {
  code: 'GENERATION_FAILED' | 'VALIDATION_FAILED' | 'UNSUPPORTED_TYPE' | 'INVALID_PARAMETERS';
  levelId: string;
  details?: any;
}

export class LevelService implements ILevelService {
  private levelCache: Map<string, LevelCacheEntry> = new Map();
  private cacheStats: LevelCacheStats = {
    size: 0,
    hitRate: 0,
    totalRequests: 0,
    totalHits: 0,
    totalMisses: 0
  };
  private maxCacheSize: number;
  private embeddedLevels: Map<string, any> = new Map();

  constructor(maxCacheSize: number = 100) {
    this.maxCacheSize = maxCacheSize;
    this.initializeEmbeddedLevels();
  }

  async loadLevel(levelId: string, options?: LevelLoadOptions): Promise<LevelDefinition> {
    const result = await this.loadLevelWithResult(levelId, options);
    return result.level;
  }

  async loadLevelWithResult(levelId: string, options?: LevelLoadOptions): Promise<LevelLoadResult> {
    const startTime = performance.now();
    this.cacheStats.totalRequests++;

    // Set default options
    const loadOptions: LevelLoadOptions = {
      validateSchema: true,
      migrateVersion: true,
      includeMetadata: true,
      cacheable: true,
      ...options
    };

    // Check cache first if cacheable
    if (loadOptions.cacheable) {
      const cached = this.getCachedLevelEntry(levelId);
      if (cached) {
        this.cacheStats.totalHits++;
        this.updateCacheStats();
        
        // Update access statistics
        cached.lastAccessed = Date.now();
        cached.accessCount++;

        return {
          level: cached.level,
          loadTime: performance.now() - startTime,
          fromCache: true,
          migrated: cached.migrated,
          validationResult: loadOptions.validateSchema ? 
            this.validateLevel(cached.level) : undefined
        };
      }
    }

    this.cacheStats.totalMisses++;

    try {
      // Load level data from source
      const rawLevelData = await this.loadLevelData(levelId);
      
      // Validate and migrate if needed
      let levelDefinition = rawLevelData;
      let migrated = false;
      let validationResult: ValidationResult | undefined;

      // Version migration
      if (loadOptions.migrateVersion && rawLevelData.version !== LevelSchemaManager.getCurrentVersion()) {
        levelDefinition = LevelSchemaManager.migrate(
          rawLevelData, 
          rawLevelData.version || 1, 
          LevelSchemaManager.getCurrentVersion()
        );
        migrated = true;
      }

      // Schema validation
      if (loadOptions.validateSchema) {
        validationResult = this.validateLevel(levelDefinition);
        if (!validationResult.valid) {
          throw new Error(`Level validation failed for ${levelId}: ${validationResult.errors.map(e => e.message).join(', ')}`);
        }
      }

      // Cache the level if cacheable
      if (loadOptions.cacheable) {
        this.cacheLevel(levelId, levelDefinition, migrated);
      }

      this.updateCacheStats();

      return {
        level: levelDefinition as LevelDefinition,
        loadTime: performance.now() - startTime,
        fromCache: false,
        migrated,
        validationResult
      };

    } catch (error) {
      this.updateCacheStats();
      throw new Error(`Failed to load level ${levelId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loadLevels(levelIds: string[], options?: LevelLoadOptions): Promise<LevelDefinition[]> {
    const promises = levelIds.map(id => this.loadLevel(id, options));
    return Promise.all(promises);
  }

  getCachedLevel(levelId: string): LevelDefinition | null {
    const entry = this.getCachedLevelEntry(levelId);
    return entry ? entry.level : null;
  }

  async preloadLevels(levelIds: string[], options?: LevelLoadOptions): Promise<void> {
    // Load levels in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < levelIds.length; i += batchSize) {
      const batch = levelIds.slice(i, i + batchSize);
      await Promise.all(batch.map(id => this.loadLevel(id, options)));
    }
  }

  clearCache(): void {
    this.levelCache.clear();
    this.cacheStats = {
      size: 0,
      hitRate: 0,
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0
    };
  }

  getCacheStats(): { size: number; hitRate: number; totalRequests: number } {
    return {
      size: this.cacheStats.size,
      hitRate: this.cacheStats.hitRate,
      totalRequests: this.cacheStats.totalRequests
    };
  }

  validateLevel(levelDefinition: any): ValidationResult {
    return LevelValidator.validate(levelDefinition);
  }

  async listAvailableLevels(): Promise<string[]> {
    // Get embedded level IDs
    const embeddedIds = Array.from(this.embeddedLevels.keys());
    
    // Get cached level IDs
    const cachedIds = Array.from(this.levelCache.keys());
    
    // Try to discover levels from known level files
    const knownLevelIds = [
      'level-001-tutorial',
      'level-002-simple-path',
      'level-003-branching-paths',
      'level-004-time-pressure',
      'level-005-puzzle-chamber',
      'level-006-maze-runner',
      'level-007-symmetry-challenge',
      'level-008-trap-maze',
      'level-009-speed-demon',
      'level-010-master-challenge'
    ];
    
    // Verify which levels actually exist by trying to load them
    const availableLevels: string[] = [];
    
    for (const levelId of knownLevelIds) {
      try {
        // Try to load the level to verify it exists
        await this.loadLevelData(levelId);
        availableLevels.push(levelId);
      } catch (error) {
        // Level doesn't exist or failed to load, skip it
        console.warn(`Level ${levelId} not available:`, error);
      }
    }
    
    // Combine all available levels
    const allIds = new Set([...embeddedIds, ...cachedIds, ...availableLevels]);
    return Array.from(allIds).sort();
  }

  private getCachedLevelEntry(levelId: string): LevelCacheEntry | null {
    return this.levelCache.get(levelId) || null;
  }

  private cacheLevel(levelId: string, level: LevelDefinition, migrated: boolean): void {
    // Implement LRU eviction if cache is full
    if (this.levelCache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    const entry: LevelCacheEntry = {
      level,
      loadTime: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      migrated
    };

    this.levelCache.set(levelId, entry);
    this.cacheStats.size = this.levelCache.size;
  }

  private evictLeastRecentlyUsed(): void {
    let oldestEntry: string | null = null;
    let oldestTime = Date.now();

    for (const [levelId, entry] of this.levelCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestEntry = levelId;
      }
    }

    if (oldestEntry) {
      this.levelCache.delete(oldestEntry);
    }
  }

  private updateCacheStats(): void {
    this.cacheStats.size = this.levelCache.size;
    if (this.cacheStats.totalRequests > 0) {
      this.cacheStats.hitRate = this.cacheStats.totalHits / this.cacheStats.totalRequests;
    }
  }

  private async loadLevelData(levelId: string): Promise<any> {
    // Try dynamic import for development (most reliable in build environment)
    try {
      const module = await import(`../data/levels/${levelId}.json`);
      return module.default || module;
    } catch (error) {
      console.warn(`Failed to import ${levelId}:`, error);
    }

    // Try to load from public assets (for production)
    try {
      const response = await fetch(`/src/data/levels/${levelId}.json`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Failed to fetch ${levelId}:`, error);
    }

    // Check if we have embedded metadata (fallback)
    const embeddedLevel = this.embeddedLevels.get(levelId);
    if (embeddedLevel) {
      console.warn(`Using embedded metadata for ${levelId}, full level data not available`);
      return embeddedLevel;
    }

    throw new Error(`Level data not found for ID: ${levelId}`);
  }

  async generateLevel(levelDefinition: LevelDefinition, seed?: number): Promise<GeneratedLevel> {
    const startTime = performance.now();
    const actualSeed = seed ?? levelDefinition.generation.seed ?? Date.now();
    const rng = new SeededRandom(actualSeed);

    try {
      let generatedLevel: GeneratedLevel;

      if (levelDefinition.generation.type === 'procedural') {
        generatedLevel = await this.generateProceduralLevel(levelDefinition, rng, actualSeed);
      } else if (levelDefinition.generation.type === 'handcrafted') {
        generatedLevel = await this.generateHandcraftedLevel(levelDefinition, actualSeed);
      } else {
        const error = new Error(`Unsupported generation type: ${levelDefinition.generation.type}`) as LevelGenerationError;
        error.code = 'UNSUPPORTED_TYPE';
        error.levelId = levelDefinition.id;
        throw error;
      }

      // Update generation time
      generatedLevel.metadata.generationTime = performance.now() - startTime;

      // Validate the generated level
      const validationResult = this.validateGeneratedLevel(generatedLevel);
      if (!validationResult.valid) {
        // Try fallback generation if validation fails
        try {
          generatedLevel = await this.generateFallbackLevel(levelDefinition, rng, actualSeed);
          generatedLevel.metadata.generationTime = performance.now() - startTime;
        } catch (fallbackError) {
          const error = new Error(`Level generation and fallback failed: ${validationResult.errors.map(e => e.message).join(', ')}`) as LevelGenerationError;
          error.code = 'GENERATION_FAILED';
          error.levelId = levelDefinition.id;
          error.details = { validationErrors: validationResult.errors, fallbackError };
          throw error;
        }
      }

      return generatedLevel;

    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error; // Re-throw LevelGenerationError
      }
      
      const generationError = new Error(`Level generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`) as LevelGenerationError;
      generationError.code = 'GENERATION_FAILED';
      generationError.levelId = levelDefinition.id;
      generationError.details = { originalError: error };
      throw generationError;
    }
  }

  validateGeneratedLevel(generatedLevel: GeneratedLevel): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validate basic structure
    if (!generatedLevel.maze || generatedLevel.maze.length === 0) {
      errors.push({
        message: 'Generated maze is empty',
        severity: 'error',
        code: 'EMPTY_MAZE'
      });
      return { valid: false, errors, warnings };
    }

    // Validate maze dimensions match level config
    const { width, height } = generatedLevel.definition.config.boardSize;
    if (generatedLevel.maze.length !== height || generatedLevel.maze[0]?.length !== width) {
      errors.push({
        message: `Maze dimensions ${generatedLevel.maze[0]?.length}x${generatedLevel.maze.length} don't match config ${width}x${height}`,
        severity: 'error',
        code: 'DIMENSION_MISMATCH'
      });
    }

    // Validate positions are within bounds
    if (!this.isPositionInBounds(generatedLevel.startPosition, width, height)) {
      errors.push({
        message: 'Start position is outside maze bounds',
        severity: 'error',
        code: 'INVALID_START_POSITION'
      });
    }

    if (!this.isPositionInBounds(generatedLevel.goalPosition, width, height)) {
      errors.push({
        message: 'Goal position is outside maze bounds',
        severity: 'error',
        code: 'INVALID_GOAL_POSITION'
      });
    }

    // Validate orb positions
    for (let i = 0; i < generatedLevel.orbPositions.length; i++) {
      const orb = generatedLevel.orbPositions[i];
      if (!this.isPositionInBounds(orb, width, height)) {
        errors.push({
          message: `Orb position (${orb.x}, ${orb.y}) is outside maze bounds`,
          severity: 'error',
          code: 'INVALID_ORB_POSITION'
        });
      }
    }

    // Validate maze solvability
    if (!generatedLevel.metadata.solvable) {
      errors.push({
        message: 'Generated maze is not solvable',
        severity: 'error',
        code: 'UNSOLVABLE_MAZE'
      });
    }

    // Check minimum path length requirements
    const minPathLength = this.getMinPathLengthRequirement(generatedLevel.definition);
    if (minPathLength && generatedLevel.metadata.pathLength < minPathLength) {
      warnings.push({
        message: `Path length ${generatedLevel.metadata.pathLength} is below recommended minimum ${minPathLength}`,
        severity: 'warning',
        code: 'SHORT_PATH'
      });
    }

    // Check orb accessibility
    const orbValidation = validateOrbPlacements(
      generatedLevel.maze.map(row => row.map(cell => cell.walls)),
      generatedLevel.startPosition,
      generatedLevel.orbPositions
    );

    if (!orbValidation.allAccessible) {
      errors.push({
        message: `${orbValidation.inaccessibleOrbs.length} orbs are not accessible from start position`,
        severity: 'error',
        code: 'INACCESSIBLE_ORBS'
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private async generateProceduralLevel(
    levelDefinition: LevelDefinition, 
    rng: SeededRandom, 
    seed: number
  ): Promise<GeneratedLevel> {
    const parameters = levelDefinition.generation.parameters;
    if (!parameters) {
      throw new Error('Procedural generation requires parameters');
    }

    const { width, height } = levelDefinition.config.boardSize;

    // Generate maze using MazeGen
    const mazeOptions: MazeGenerationOptions = {
      width,
      height,
      algorithm: this.mapAlgorithm(parameters.algorithm),
      startPosition: { x: 0, y: 0 } // Default start position
    };

    const mazeResult = generateMaze(mazeOptions, () => rng.next());

    // Convert raw maze to MazeCell format
    const maze: MazeCell[][] = mazeResult.maze.map((row, y) => 
      row.map((cell, x) => ({
        walls: cell,
        type: this.determineCellType(x, y, width, height),
        properties: {
          isStart: x === 0 && y === 0,
          isGoal: x === width - 1 && y === height - 1,
          isVisited: false
        }
      }))
    );

    // Determine start and goal positions
    const startPosition = { x: 0, y: 0 };
    const goalPosition = { x: width - 1, y: height - 1 };

    // Generate orb positions
    const orbPositions = this.generateOrbPositions(
      parameters, 
      maze, 
      startPosition, 
      goalPosition, 
      rng
    );

    // Generate powerup positions (empty for now)
    const powerupPositions: Array<Position & { type: string; id: string }> = [];

    // Validate maze and calculate metadata
    const validationResult = validateMaze(
      maze.map(row => row.map(cell => cell.walls)),
      startPosition,
      goalPosition,
      this.getMazeValidationOptions(parameters)
    );

    return {
      definition: levelDefinition,
      maze,
      startPosition,
      goalPosition,
      orbPositions,
      powerupPositions,
      metadata: {
        seed,
        generationTime: 0, // Will be set by caller
        algorithm: parameters.algorithm,
        solvable: validationResult.isSolvable,
        pathLength: validationResult.pathLength,
        complexity: validationResult.complexity
      }
    };
  }

  private async generateHandcraftedLevel(
    levelDefinition: LevelDefinition, 
    seed: number
  ): Promise<GeneratedLevel> {
    const layout = levelDefinition.generation.layout;
    if (!layout) {
      throw new Error('Handcrafted generation requires layout data');
    }



    // Convert handcrafted layout to MazeCell format
    const maze: MazeCell[][] = layout.cells.map(row => 
      row.map(cell => ({
        walls: cell.walls,
        type: cell.type === 'start' || cell.type === 'goal' ? 'special' : cell.type,
        properties: {
          isStart: cell.type === 'start',
          isGoal: cell.type === 'goal',
          isVisited: false,
          ...cell.properties
        }
      }))
    );

    // Convert orb positions
    const orbPositions = layout.orbPositions.map((orbPos, index) => ({
      x: orbPos.x,
      y: orbPos.y,
      value: orbPos.value,
      id: orbPos.id || `orb_${index}`
    }));

    // Convert powerup positions
    const powerupPositions = layout.powerupPositions?.map((powerupPos, index) => ({
      x: powerupPos.x,
      y: powerupPos.y,
      type: powerupPos.type,
      id: powerupPos.id || `powerup_${index}`
    })) || [];

    // Validate maze and calculate metadata
    const validationResult = validateMaze(
      maze.map(row => row.map(cell => cell.walls)),
      layout.startPosition,
      layout.goalPosition
    );

    const result = {
      definition: levelDefinition,
      maze,
      startPosition: { ...layout.startPosition },
      goalPosition: { ...layout.goalPosition },
      orbPositions,
      powerupPositions,
      metadata: {
        seed,
        generationTime: 0, // Will be set by caller
        solvable: validationResult.isSolvable,
        pathLength: validationResult.pathLength,
        complexity: validationResult.complexity
      }
    };

    return result;
  }

  private async generateFallbackLevel(
    levelDefinition: LevelDefinition, 
    rng: SeededRandom, 
    seed: number
  ): Promise<GeneratedLevel> {
    const { width, height } = levelDefinition.config.boardSize;
    
    // Create a simple fully-connected maze
    const maze: MazeCell[][] = [];
    for (let y = 0; y < height; y++) {
      const row: MazeCell[] = [];
      for (let x = 0; x < width; x++) {
        let walls = 0;
        
        // Add connections to all valid adjacent cells
        if (x < width - 1) walls |= 1;  // East
        if (y < height - 1) walls |= 2; // South
        if (x > 0) walls |= 4;          // West
        if (y > 0) walls |= 8;          // North
        
        row.push({
          walls,
          type: this.determineCellType(x, y, width, height),
          properties: {
            isStart: x === 0 && y === 0,
            isGoal: x === width - 1 && y === height - 1,
            isVisited: false
          }
        });
      }
      maze.push(row);
    }

    const startPosition = { x: 0, y: 0 };
    const goalPosition = { x: width - 1, y: height - 1 };

    // Generate minimal orbs
    const orbCount = Math.min(2, Math.floor((width * height) / 8));
    const orbPositions: Array<Position & { value: number; id: string }> = [];
    
    for (let i = 0; i < orbCount; i++) {
      let x, y;
      do {
        x = Math.floor(rng.next() * width);
        y = Math.floor(rng.next() * height);
      } while ((x === 0 && y === 0) || (x === width - 1 && y === height - 1));
      
      orbPositions.push({
        x, y,
        value: 100,
        id: `fallback_orb_${i}`
      });
    }

    return {
      definition: levelDefinition,
      maze,
      startPosition,
      goalPosition,
      orbPositions,
      powerupPositions: [],
      metadata: {
        seed,
        generationTime: 0,
        algorithm: 'fallback',
        solvable: true,
        pathLength: Math.abs(goalPosition.x - startPosition.x) + Math.abs(goalPosition.y - startPosition.y),
        complexity: 0
      }
    };
  }

  private generateOrbPositions(
    parameters: ProceduralParameters,
    maze: MazeCell[][],
    startPosition: Position,
    goalPosition: Position,
    rng: SeededRandom
  ): Array<Position & { value: number; id: string }> {
    const orbPositions: Array<Position & { value: number; id: string }> = [];
    const height = maze.length;
    const width = maze[0]?.length || 0;
    const orbCount = parameters.orbCount || 3;

    // Get available positions (not start or goal)
    const availablePositions: Position[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!((x === startPosition.x && y === startPosition.y) || 
              (x === goalPosition.x && y === goalPosition.y))) {
          availablePositions.push({ x, y });
        }
      }
    }

    // Shuffle available positions
    const shuffledPositions = rng.shuffle([...availablePositions]);

    // Select positions based on placement strategy
    let selectedPositions: Position[] = [];
    const placementStrategy = parameters.orbPlacement || 'random';

    switch (placementStrategy) {
      case 'random':
        selectedPositions = shuffledPositions.slice(0, Math.min(orbCount, shuffledPositions.length));
        break;
      case 'corners':
        const corners = shuffledPositions.filter(pos => 
          (pos.x === 0 || pos.x === width - 1) && (pos.y === 0 || pos.y === height - 1)
        );
        selectedPositions = [
          ...corners.slice(0, Math.min(orbCount, corners.length)),
          ...shuffledPositions.filter(pos => !corners.includes(pos))
            .slice(0, Math.max(0, orbCount - corners.length))
        ];
        break;
      case 'strategic':
      case 'path':
      default:
        // For now, fall back to random placement
        selectedPositions = shuffledPositions.slice(0, Math.min(orbCount, shuffledPositions.length));
        break;
    }

    // Create orb objects
    selectedPositions.forEach((position, index) => {
      orbPositions.push({
        x: position.x,
        y: position.y,
        value: 100, // Base orb value
        id: `orb_${index}`
      });
    });

    return orbPositions;
  }

  private mapAlgorithm(algorithm: string): 'prim' | 'recursive-backtrack' {
    switch (algorithm) {
      case 'prim':
      case 'kruskal': // Map to prim for now
        return 'prim';
      case 'recursive_backtrack':
      case 'wilson': // Map to recursive-backtrack for now
        return 'recursive-backtrack';
      default:
        return 'prim';
    }
  }

  private determineCellType(x: number, y: number, width: number, height: number): 'floor' | 'wall' | 'start' | 'goal' | 'special' {
    if (x === 0 && y === 0) return 'special'; // Start
    if (x === width - 1 && y === height - 1) return 'special'; // Goal
    return 'floor';
  }

  private getMazeValidationOptions(parameters: ProceduralParameters): MazeValidationOptions {
    return {
      minPathLength: parameters.minPathLength,
      minComplexity: Math.floor(parameters.complexity * 10), // Convert 0-1 to reasonable complexity scale
      minReachableCells: Math.floor((parameters.branchingFactor || 0.3) * 20) // Minimum connected cells
    };
  }

  private getMinPathLengthRequirement(levelDefinition: LevelDefinition): number | undefined {
    const parameters = levelDefinition.generation.parameters;
    return parameters?.minPathLength;
  }

  private isPositionInBounds(position: Position, width: number, height: number): boolean {
    return position.x >= 0 && position.y >= 0 && position.x < width && position.y < height;
  }

  private initializeEmbeddedLevels(): void {
    // Initialize with basic level metadata for quick access
    // This provides fallback level information even if files can't be loaded
    const basicLevels = [
      { id: 'level-001-tutorial', name: 'Tutorial', difficulty: 'easy' },
      { id: 'level-002-simple-path', name: 'Simple Path', difficulty: 'easy' },
      { id: 'level-003-branching-paths', name: 'Branching Paths', difficulty: 'easy' },
      { id: 'level-004-time-pressure', name: 'Time Pressure', difficulty: 'medium' },
      { id: 'level-005-puzzle-chamber', name: 'Puzzle Chamber', difficulty: 'medium' },
      { id: 'level-006-maze-runner', name: 'Maze Runner', difficulty: 'medium' },
      { id: 'level-007-symmetry-challenge', name: 'Symmetry Challenge', difficulty: 'hard' },
      { id: 'level-008-trap-maze', name: 'Trap Maze', difficulty: 'hard' },
      { id: 'level-009-speed-demon', name: 'Speed Demon', difficulty: 'expert' },
      { id: 'level-010-master-challenge', name: 'Master Challenge', difficulty: 'expert' }
    ];
    
    // Store basic metadata (not full level definitions)
    basicLevels.forEach(level => {
      this.embeddedLevels.set(level.id, {
        id: level.id,
        name: level.name,
        difficulty: level.difficulty
      });
    });
  }
}