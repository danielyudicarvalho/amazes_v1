// Immutable game state definitions and utilities
import { 
  GameState, 
  Position, 
  Player, 
  MazeCell, 
  OrbState, 
  PowerupState, 
  ObjectiveProgress,
  PlayerStats,
  GameStatus,
  GameResult
} from './types/GameState';
import { LevelDefinition } from './types/Level';

export class GameStateManager {
  private static readonly STATE_VERSION = 1;

  /**
   * Creates a new initial game state for a level
   */
  static createInitialState(levelDefinition: LevelDefinition, seed?: number): GameState {
    const now = Date.now();
    
    // Create initial player state
    const initialPlayer: Player = {
      position: { x: 0, y: 0 }, // Will be set to actual start position during maze generation
      inventory: [],
      stats: {
        totalMoves: 0,
        orbsCollected: 0,
        timeElapsed: 0,
        powerupsUsed: 0,
        hintsUsed: 0
      },
      activePowerups: []
    };

    // Create initial objectives progress
    const objectives: ObjectiveProgress[] = levelDefinition.config.objectives.map(obj => ({
      id: obj.id,
      type: obj.type,
      target: obj.target,
      current: 0,
      completed: false,
      description: obj.description,
      required: obj.required
    }));

    return {
      levelId: levelDefinition.id,
      levelConfig: levelDefinition,
      status: 'initializing',
      startTime: now,
      currentTime: now,
      pausedTime: 0,
      player: initialPlayer,
      maze: [], // Will be populated during maze generation
      orbs: [], // Will be populated during maze generation
      powerups: [], // Will be populated during maze generation
      objectives,
      score: 0,
      moves: 0,
      hintsUsed: 0,
      version: this.STATE_VERSION,
      seed
    };
  }

  /**
   * Creates a deep clone of the game state to maintain immutability
   */
  static cloneState(state: GameState): GameState {
    // Use structured cloning for better performance and handling of complex objects
    return this.deepClone(state);
  }

  /**
   * Deep clone utility that handles all types properly
   */
  private static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as T;
    }

    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  }

  /**
   * Updates the game state immutably with deep merging
   */
  static updateState(state: GameState, updates: DeepPartial<GameState>): GameState {
    const newState = this.cloneState(state);
    return this.deepMerge(newState, updates);
  }

  /**
   * Deep merge utility for nested updates
   */
  private static deepMerge<T>(target: T, source: DeepPartial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = target[key];
        
        if (sourceValue !== undefined) {
          if (this.isObject(sourceValue) && this.isObject(targetValue)) {
            (result as any)[key] = this.deepMerge(targetValue, sourceValue);
          } else {
            (result as any)[key] = sourceValue;
          }
        }
      }
    }
    
    return result;
  }

  private static isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Date);
  }

  /**
   * Updates player position immutably
   */
  static updatePlayerPosition(state: GameState, newPosition: Position): GameState {
    return this.updateState(state, {
      player: {
        position: newPosition,
        stats: {
          totalMoves: state.player.stats.totalMoves + 1
        }
      },
      moves: state.moves + 1,
      currentTime: Date.now()
    });
  }

  /**
   * Updates player stats immutably
   */
  static updatePlayerStats(state: GameState, statsUpdate: Partial<PlayerStats>): GameState {
    return this.updateState(state, {
      player: {
        stats: {
          ...state.player.stats,
          ...statsUpdate
        }
      }
    });
  }

  /**
   * Adds an orb collection to the state immutably
   */
  static collectOrb(state: GameState, orbId: string): GameState {
    const orbIndex = state.orbs.findIndex(orb => orb.id === orbId);
    if (orbIndex === -1 || state.orbs[orbIndex].collected) {
      return state; // Orb not found or already collected
    }

    const orb = state.orbs[orbIndex];
    const newOrbs = [...state.orbs];
    newOrbs[orbIndex] = {
      ...orb,
      collected: true,
      collectedAt: Date.now()
    };

    return this.updateState(state, {
      orbs: newOrbs,
      score: state.score + orb.value,
      player: {
        stats: {
          orbsCollected: state.player.stats.orbsCollected + 1
        }
      }
    });
  }

  /**
   * Updates objective progress immutably
   */
  static updateObjectiveProgress(state: GameState, objectiveId: string, progress: number): GameState {
    const objectiveIndex = state.objectives.findIndex(obj => obj.id === objectiveId);
    if (objectiveIndex === -1) {
      return state; // Objective not found
    }

    const objective = state.objectives[objectiveIndex];
    const newObjectives = [...state.objectives];
    const isCompleted = progress >= objective.target;
    
    newObjectives[objectiveIndex] = {
      ...objective,
      current: progress,
      completed: isCompleted,
      completedAt: isCompleted && !objective.completed ? Date.now() : objective.completedAt
    };

    return this.updateState(state, {
      objectives: newObjectives
    });
  }

  /**
   * Updates game status immutably
   */
  static updateGameStatus(state: GameState, status: GameStatus): GameState {
    const now = Date.now();
    const updates: DeepPartial<GameState> = {
      status,
      currentTime: now
    };

    // Handle specific status transitions
    if (status === 'playing' && state.status === 'paused') {
      // Resuming from pause
      const pauseDuration = now - state.currentTime;
      updates.pausedTime = state.pausedTime + pauseDuration;
    } else if (status === 'completed' || status === 'failed') {
      // Game ending
      const totalTime = now - state.startTime - state.pausedTime;
      updates.player = {
        stats: {
          timeElapsed: totalTime
        }
      };
      
      if (status === 'completed') {
        updates.result = this.calculateGameResult(state, totalTime);
      }
    }

    return this.updateState(state, updates);
  }

  /**
   * Calculates the final game result
   */
  private static calculateGameResult(state: GameState, totalTime: number): GameResult {
    const completedObjectives = state.objectives.filter(obj => obj.completed).length;
    const requiredObjectives = state.objectives.filter(obj => obj.required);
    const allRequiredCompleted = requiredObjectives.every(obj => obj.completed);
    
    // Calculate stars based on performance
    let stars = 0;
    if (allRequiredCompleted) {
      stars = 1; // Base star for completion
      
      // Check star thresholds from level definition
      const thresholds = state.levelConfig.progression.starThresholds;
      for (const threshold of thresholds.sort((a, b) => b.stars - a.stars)) {
        let meetsThreshold = true;
        
        if (threshold.requirements.time && totalTime > threshold.requirements.time * 1000) {
          meetsThreshold = false;
        }
        if (threshold.requirements.moves && state.moves > threshold.requirements.moves) {
          meetsThreshold = false;
        }
        if (threshold.requirements.orbsCollected && state.player.stats.orbsCollected < threshold.requirements.orbsCollected) {
          meetsThreshold = false;
        }
        
        if (meetsThreshold) {
          stars = Math.max(stars, threshold.stars);
          break;
        }
      }
    }

    return {
      completed: allRequiredCompleted,
      score: state.score,
      stars,
      completionTime: totalTime,
      totalMoves: state.moves,
      orbsCollected: state.player.stats.orbsCollected,
      objectivesCompleted: completedObjectives,
      constraintsViolated: 0 // Will be implemented when constraint system is added
    };
  }

  /**
   * Validates that a game state is consistent and valid
   */
  static validateState(state: GameState): boolean {
    const result = this.validateStateDetailed(state);
    return result.valid;
  }

  /**
   * Validates game state with detailed error reporting
   */
  static validateStateDetailed(state: GameState): GameStateValidationResult {
    const errors: GameStateValidationError[] = [];
    const warnings: GameStateValidationError[] = [];

    try {
      // Basic structure validation
      if (!state || typeof state !== 'object') {
        errors.push({ field: 'state', message: 'State must be a valid object', code: 'INVALID_STATE_TYPE' });
        return { valid: false, errors, warnings };
      }

      // Required fields validation
      this.validateRequiredFields(state, errors);
      
      // Player validation
      this.validatePlayer(state.player, state.maze, errors, warnings);
      
      // Maze validation
      this.validateMaze(state.maze, errors, warnings);
      
      // Orbs validation
      this.validateOrbs(state.orbs, state.maze, errors, warnings);
      
      // Powerups validation
      this.validatePowerups(state.powerups, state.maze, errors, warnings);
      
      // Objectives validation
      this.validateObjectives(state.objectives, state, errors, warnings);
      
      // Game metrics validation
      this.validateGameMetrics(state, errors, warnings);
      
      // Time validation
      this.validateTiming(state, errors, warnings);
      
      // Cross-validation checks
      this.validateCrossReferences(state, errors, warnings);

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push({ 
        field: 'validation', 
        message: `Validation failed with error: ${error.message}`, 
        code: 'VALIDATION_ERROR' 
      });
      return { valid: false, errors, warnings };
    }
  }

  private static validateRequiredFields(state: GameState, errors: GameStateValidationError[]): void {
    const requiredFields = [
      'levelId', 'levelConfig', 'status', 'startTime', 'currentTime', 
      'player', 'maze', 'orbs', 'objectives', 'score', 'moves'
    ];

    for (const field of requiredFields) {
      if (!(field in state) || state[field as keyof GameState] === null || state[field as keyof GameState] === undefined) {
        errors.push({ 
          field, 
          message: `Required field '${field}' is missing or null`, 
          code: 'MISSING_REQUIRED_FIELD' 
        });
      }
    }

    // Type validations
    if (typeof state.levelId !== 'string' || state.levelId.length === 0) {
      errors.push({ field: 'levelId', message: 'Level ID must be a non-empty string', code: 'INVALID_LEVEL_ID' });
    }

    if (!['initializing', 'playing', 'paused', 'completed', 'failed'].includes(state.status)) {
      errors.push({ field: 'status', message: 'Invalid game status', code: 'INVALID_STATUS' });
    }
  }

  private static validatePlayer(player: Player, maze: readonly (readonly MazeCell[])[], errors: GameStateValidationError[], warnings: GameStateValidationError[]): void {
    if (!player) {
      errors.push({ field: 'player', message: 'Player object is required', code: 'MISSING_PLAYER' });
      return;
    }

    // Position validation
    if (!this.isValidPosition(player.position)) {
      errors.push({ field: 'player.position', message: 'Player position is invalid', code: 'INVALID_PLAYER_POSITION' });
    } else if (maze.length > 0) {
      const mazeHeight = maze.length;
      const mazeWidth = maze[0]?.length || 0;
      
      if (player.position.x < 0 || player.position.x >= mazeWidth ||
          player.position.y < 0 || player.position.y >= mazeHeight) {
        errors.push({ 
          field: 'player.position', 
          message: `Player position (${player.position.x}, ${player.position.y}) is outside maze bounds (${mazeWidth}x${mazeHeight})`, 
          code: 'PLAYER_OUT_OF_BOUNDS' 
        });
      }
    }

    // Inventory validation
    if (!Array.isArray(player.inventory)) {
      errors.push({ field: 'player.inventory', message: 'Player inventory must be an array', code: 'INVALID_INVENTORY' });
    } else {
      player.inventory.forEach((item, index) => {
        if (!item.id || typeof item.id !== 'string') {
          errors.push({ field: `player.inventory[${index}].id`, message: 'Inventory item must have a valid ID', code: 'INVALID_INVENTORY_ITEM' });
        }
        if (typeof item.quantity !== 'number' || item.quantity < 0) {
          errors.push({ field: `player.inventory[${index}].quantity`, message: 'Inventory item quantity must be a non-negative number', code: 'INVALID_INVENTORY_QUANTITY' });
        }
      });
    }

    // Stats validation
    if (!player.stats) {
      errors.push({ field: 'player.stats', message: 'Player stats are required', code: 'MISSING_PLAYER_STATS' });
    } else {
      const stats = player.stats;
      if (typeof stats.totalMoves !== 'number' || stats.totalMoves < 0) {
        errors.push({ field: 'player.stats.totalMoves', message: 'Total moves must be a non-negative number', code: 'INVALID_TOTAL_MOVES' });
      }
      if (typeof stats.orbsCollected !== 'number' || stats.orbsCollected < 0) {
        errors.push({ field: 'player.stats.orbsCollected', message: 'Orbs collected must be a non-negative number', code: 'INVALID_ORBS_COLLECTED' });
      }
      if (typeof stats.timeElapsed !== 'number' || stats.timeElapsed < 0) {
        errors.push({ field: 'player.stats.timeElapsed', message: 'Time elapsed must be a non-negative number', code: 'INVALID_TIME_ELAPSED' });
      }
    }
  }

  private static validateMaze(maze: readonly (readonly MazeCell[])[], errors: GameStateValidationError[], warnings: GameStateValidationError[]): void {
    if (!Array.isArray(maze)) {
      errors.push({ field: 'maze', message: 'Maze must be an array', code: 'INVALID_MAZE_TYPE' });
      return;
    }

    if (maze.length === 0) {
      errors.push({ field: 'maze', message: 'Maze cannot be empty', code: 'EMPTY_MAZE' });
      return;
    }

    const expectedWidth = maze[0]?.length || 0;
    if (expectedWidth === 0) {
      errors.push({ field: 'maze[0]', message: 'Maze rows cannot be empty', code: 'EMPTY_MAZE_ROW' });
      return;
    }

    // Validate maze structure
    maze.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) {
        errors.push({ field: `maze[${rowIndex}]`, message: 'Maze row must be an array', code: 'INVALID_MAZE_ROW' });
        return;
      }

      if (row.length !== expectedWidth) {
        errors.push({ 
          field: `maze[${rowIndex}]`, 
          message: `Maze row ${rowIndex} has width ${row.length}, expected ${expectedWidth}`, 
          code: 'INCONSISTENT_MAZE_WIDTH' 
        });
      }

      row.forEach((cell, colIndex) => {
        if (!cell || typeof cell !== 'object') {
          errors.push({ field: `maze[${rowIndex}][${colIndex}]`, message: 'Maze cell must be an object', code: 'INVALID_MAZE_CELL' });
          return;
        }

        if (typeof cell.walls !== 'number' || cell.walls < 0 || cell.walls > 15) {
          errors.push({ 
            field: `maze[${rowIndex}][${colIndex}].walls`, 
            message: 'Cell walls must be a number between 0 and 15', 
            code: 'INVALID_CELL_WALLS' 
          });
        }

        if (!['floor', 'wall', 'special'].includes(cell.type)) {
          errors.push({ 
            field: `maze[${rowIndex}][${colIndex}].type`, 
            message: 'Cell type must be floor, wall, or special', 
            code: 'INVALID_CELL_TYPE' 
          });
        }
      });
    });
  }

  private static validateOrbs(orbs: readonly OrbState[], maze: readonly (readonly MazeCell[])[], errors: GameStateValidationError[], warnings: GameStateValidationError[]): void {
    if (!Array.isArray(orbs)) {
      errors.push({ field: 'orbs', message: 'Orbs must be an array', code: 'INVALID_ORBS_TYPE' });
      return;
    }

    const orbIds = new Set<string>();
    orbs.forEach((orb, index) => {
      if (!orb || typeof orb !== 'object') {
        errors.push({ field: `orbs[${index}]`, message: 'Orb must be an object', code: 'INVALID_ORB' });
        return;
      }

      if (!orb.id || typeof orb.id !== 'string') {
        errors.push({ field: `orbs[${index}].id`, message: 'Orb must have a valid ID', code: 'INVALID_ORB_ID' });
      } else if (orbIds.has(orb.id)) {
        errors.push({ field: `orbs[${index}].id`, message: `Duplicate orb ID: ${orb.id}`, code: 'DUPLICATE_ORB_ID' });
      } else {
        orbIds.add(orb.id);
      }

      if (!this.isValidPosition(orb.position)) {
        errors.push({ field: `orbs[${index}].position`, message: 'Orb position is invalid', code: 'INVALID_ORB_POSITION' });
      } else if (maze.length > 0) {
        const mazeHeight = maze.length;
        const mazeWidth = maze[0]?.length || 0;
        if (orb.position.x < 0 || orb.position.x >= mazeWidth ||
            orb.position.y < 0 || orb.position.y >= mazeHeight) {
          errors.push({ 
            field: `orbs[${index}].position`, 
            message: `Orb position (${orb.position.x}, ${orb.position.y}) is outside maze bounds`, 
            code: 'ORB_OUT_OF_BOUNDS' 
          });
        }
      }

      if (typeof orb.value !== 'number' || orb.value < 0) {
        errors.push({ field: `orbs[${index}].value`, message: 'Orb value must be a non-negative number', code: 'INVALID_ORB_VALUE' });
      }

      if (typeof orb.collected !== 'boolean') {
        errors.push({ field: `orbs[${index}].collected`, message: 'Orb collected status must be a boolean', code: 'INVALID_ORB_COLLECTED' });
      }
    });
  }

  private static validatePowerups(powerups: readonly PowerupState[], maze: readonly (readonly MazeCell[])[], errors: GameStateValidationError[], warnings: GameStateValidationError[]): void {
    if (!Array.isArray(powerups)) {
      errors.push({ field: 'powerups', message: 'Powerups must be an array', code: 'INVALID_POWERUPS_TYPE' });
      return;
    }

    const powerupIds = new Set<string>();
    powerups.forEach((powerup, index) => {
      if (!powerup || typeof powerup !== 'object') {
        errors.push({ field: `powerups[${index}]`, message: 'Powerup must be an object', code: 'INVALID_POWERUP' });
        return;
      }

      if (!powerup.id || typeof powerup.id !== 'string') {
        errors.push({ field: `powerups[${index}].id`, message: 'Powerup must have a valid ID', code: 'INVALID_POWERUP_ID' });
      } else if (powerupIds.has(powerup.id)) {
        errors.push({ field: `powerups[${index}].id`, message: `Duplicate powerup ID: ${powerup.id}`, code: 'DUPLICATE_POWERUP_ID' });
      } else {
        powerupIds.add(powerup.id);
      }

      if (!this.isValidPosition(powerup.position)) {
        errors.push({ field: `powerups[${index}].position`, message: 'Powerup position is invalid', code: 'INVALID_POWERUP_POSITION' });
      }

      if (!powerup.type || typeof powerup.type !== 'string') {
        errors.push({ field: `powerups[${index}].type`, message: 'Powerup must have a valid type', code: 'INVALID_POWERUP_TYPE' });
      }
    });
  }

  private static validateObjectives(objectives: readonly ObjectiveProgress[], state: GameState, errors: GameStateValidationError[], warnings: GameStateValidationError[]): void {
    if (!Array.isArray(objectives)) {
      errors.push({ field: 'objectives', message: 'Objectives must be an array', code: 'INVALID_OBJECTIVES_TYPE' });
      return;
    }

    const objectiveIds = new Set<string>();
    let hasRequiredObjective = false;

    objectives.forEach((objective, index) => {
      if (!objective || typeof objective !== 'object') {
        errors.push({ field: `objectives[${index}]`, message: 'Objective must be an object', code: 'INVALID_OBJECTIVE' });
        return;
      }

      if (!objective.id || typeof objective.id !== 'string') {
        errors.push({ field: `objectives[${index}].id`, message: 'Objective must have a valid ID', code: 'INVALID_OBJECTIVE_ID' });
      } else if (objectiveIds.has(objective.id)) {
        errors.push({ field: `objectives[${index}].id`, message: `Duplicate objective ID: ${objective.id}`, code: 'DUPLICATE_OBJECTIVE_ID' });
      } else {
        objectiveIds.add(objective.id);
      }

      if (typeof objective.current !== 'number' || objective.current < 0) {
        errors.push({ field: `objectives[${index}].current`, message: 'Objective current progress must be a non-negative number', code: 'INVALID_OBJECTIVE_CURRENT' });
      }

      if (typeof objective.target !== 'number' || objective.target < 0) {
        errors.push({ field: `objectives[${index}].target`, message: 'Objective target must be a non-negative number', code: 'INVALID_OBJECTIVE_TARGET' });
      }

      if (objective.current > objective.target && !['time_limit', 'move_limit'].includes(objective.type)) {
        warnings.push({ 
          field: `objectives[${index}].current`, 
          message: `Objective current (${objective.current}) exceeds target (${objective.target})`, 
          code: 'OBJECTIVE_EXCEEDS_TARGET' 
        });
      }

      if (typeof objective.completed !== 'boolean') {
        errors.push({ field: `objectives[${index}].completed`, message: 'Objective completed status must be a boolean', code: 'INVALID_OBJECTIVE_COMPLETED' });
      }

      if (objective.required) {
        hasRequiredObjective = true;
      }
    });

    if (!hasRequiredObjective && objectives.length > 0) {
      warnings.push({ field: 'objectives', message: 'No required objectives found', code: 'NO_REQUIRED_OBJECTIVES' });
    }
  }

  private static validateGameMetrics(state: GameState, errors: GameStateValidationError[], warnings: GameStateValidationError[]): void {
    if (typeof state.score !== 'number' || state.score < 0) {
      errors.push({ field: 'score', message: 'Score must be a non-negative number', code: 'INVALID_SCORE' });
    }

    if (typeof state.moves !== 'number' || state.moves < 0) {
      errors.push({ field: 'moves', message: 'Moves must be a non-negative number', code: 'INVALID_MOVES' });
    }

    if (typeof state.hintsUsed !== 'number' || state.hintsUsed < 0) {
      errors.push({ field: 'hintsUsed', message: 'Hints used must be a non-negative number', code: 'INVALID_HINTS_USED' });
    }

    // Cross-validation
    if (state.player?.stats && state.moves !== state.player.stats.totalMoves) {
      warnings.push({ 
        field: 'moves', 
        message: `Game moves (${state.moves}) doesn't match player stats (${state.player.stats.totalMoves})`, 
        code: 'MOVES_MISMATCH' 
      });
    }
  }

  private static validateTiming(state: GameState, errors: GameStateValidationError[], warnings: GameStateValidationError[]): void {
    if (typeof state.startTime !== 'number' || state.startTime <= 0) {
      errors.push({ field: 'startTime', message: 'Start time must be a positive number', code: 'INVALID_START_TIME' });
    }

    if (typeof state.currentTime !== 'number' || state.currentTime < 0) {
      errors.push({ field: 'currentTime', message: 'Current time must be a non-negative number', code: 'INVALID_CURRENT_TIME' });
    }

    if (state.startTime > 0 && state.currentTime > 0 && state.currentTime < state.startTime) {
      errors.push({ 
        field: 'currentTime', 
        message: 'Current time cannot be before start time', 
        code: 'CURRENT_TIME_BEFORE_START' 
      });
    }

    if (typeof state.pausedTime !== 'number' || state.pausedTime < 0) {
      errors.push({ field: 'pausedTime', message: 'Paused time must be a non-negative number', code: 'INVALID_PAUSED_TIME' });
    }

    // Check for reasonable time values
    const now = Date.now();
    if (state.startTime > now + 86400000) { // More than 1 day in the future
      warnings.push({ field: 'startTime', message: 'Start time is far in the future', code: 'FUTURE_START_TIME' });
    }
  }

  private static validateCrossReferences(state: GameState, errors: GameStateValidationError[], warnings: GameStateValidationError[]): void {
    // Validate that collected orbs count matches player stats
    const collectedOrbs = state.orbs.filter(orb => orb.collected).length;
    if (state.player?.stats && collectedOrbs !== state.player.stats.orbsCollected) {
      warnings.push({ 
        field: 'player.stats.orbsCollected', 
        message: `Player stats show ${state.player.stats.orbsCollected} orbs collected, but ${collectedOrbs} orbs are marked as collected`, 
        code: 'ORBS_COLLECTED_MISMATCH' 
      });
    }

    // Validate that completed objectives are consistent
    const completedObjectives = state.objectives.filter(obj => obj.completed);
    completedObjectives.forEach((objective, index) => {
      if (objective.current < objective.target && !['time_limit', 'move_limit'].includes(objective.type)) {
        warnings.push({ 
          field: `objectives[${index}]`, 
          message: `Objective marked as completed but current (${objective.current}) < target (${objective.target})`, 
          code: 'COMPLETED_OBJECTIVE_INCONSISTENT' 
        });
      }
    });
  }

  private static isValidPosition(position: Position): boolean {
    return position && 
           typeof position.x === 'number' && 
           typeof position.y === 'number' && 
           position.x >= 0 && 
           position.y >= 0 &&
           Number.isInteger(position.x) && 
           Number.isInteger(position.y);
  }

  /**
   * Serializes game state to JSON with proper handling of complex objects
   */
  static toJSON(state: GameState): string {
    try {
      return JSON.stringify(state, this.serializationReplacer, 0);
    } catch (error) {
      throw new Error(`Failed to serialize game state: ${error.message}`);
    }
  }

  /**
   * Deserializes game state from JSON with validation and complex object restoration
   */
  static fromJSON(json: string): GameState {
    try {
      const state = JSON.parse(json, this.serializationReviver) as GameState;
      
      // Migrate state if needed
      const migratedState = this.migrateState(state);
      
      // Validate the deserialized state
      if (!this.validateState(migratedState)) {
        throw new Error('Invalid game state structure');
      }
      
      return migratedState;
    } catch (error) {
      throw new Error(`Failed to deserialize game state: ${error.message}`);
    }
  }

  /**
   * JSON replacer function to handle complex objects during serialization
   */
  private static serializationReplacer(key: string, value: any): any {
    // Handle Date objects
    if (value instanceof Date) {
      return {
        __type: 'Date',
        __value: value.toISOString()
      };
    }
    
    // Handle Map objects
    if (value instanceof Map) {
      return {
        __type: 'Map',
        __value: Array.from(value.entries())
      };
    }
    
    // Handle Set objects
    if (value instanceof Set) {
      return {
        __type: 'Set',
        __value: Array.from(value)
      };
    }
    
    // Handle RegExp objects
    if (value instanceof RegExp) {
      return {
        __type: 'RegExp',
        __value: value.toString()
      };
    }
    
    // Handle undefined values (JSON.stringify normally omits these)
    if (value === undefined) {
      return {
        __type: 'undefined'
      };
    }
    
    return value;
  }

  /**
   * JSON reviver function to restore complex objects during deserialization
   */
  private static serializationReviver(key: string, value: any): any {
    if (value && typeof value === 'object' && value.__type) {
      switch (value.__type) {
        case 'Date':
          return new Date(value.__value);
        
        case 'Map':
          return new Map(value.__value);
        
        case 'Set':
          return new Set(value.__value);
        
        case 'RegExp':
          const regexMatch = value.__value.match(/^\/(.*)\/([gimuy]*)$/);
          if (regexMatch) {
            return new RegExp(regexMatch[1], regexMatch[2]);
          }
          return new RegExp(value.__value);
        
        case 'undefined':
          return undefined;
        
        default:
          return value;
      }
    }
    
    return value;
  }

  /**
   * Creates a compressed version of the game state for storage
   */
  static toCompressedJSON(state: GameState): string {
    // Create a minimal version of the state for storage
    const compressedState = {
      v: state.version,
      lid: state.levelId,
      st: state.status,
      stt: state.startTime,
      ct: state.currentTime,
      pt: state.pausedTime,
      p: {
        pos: state.player.position,
        inv: state.player.inventory,
        stats: state.player.stats,
        ap: state.player.activePowerups
      },
      m: state.maze,
      o: state.orbs,
      pu: state.powerups,
      obj: state.objectives,
      sc: state.score,
      mv: state.moves,
      h: state.hintsUsed,
      r: state.result,
      s: state.seed
    };
    
    return this.toJSON(compressedState as any);
  }

  /**
   * Restores a game state from compressed JSON
   */
  static fromCompressedJSON(json: string, levelConfig: LevelDefinition): GameState {
    try {
      const compressed = JSON.parse(json, this.serializationReviver);
      
      // Expand the compressed state back to full format
      const state: GameState = {
        version: compressed.v || this.STATE_VERSION,
        levelId: compressed.lid,
        levelConfig,
        status: compressed.st,
        startTime: compressed.stt,
        currentTime: compressed.ct,
        pausedTime: compressed.pt || 0,
        player: {
          position: compressed.p.pos,
          inventory: compressed.p.inv || [],
          stats: compressed.p.stats,
          activePowerups: compressed.p.ap || []
        },
        maze: compressed.m,
        orbs: compressed.o || [],
        powerups: compressed.pu || [],
        objectives: compressed.obj || [],
        score: compressed.sc || 0,
        moves: compressed.mv || 0,
        hintsUsed: compressed.h || 0,
        result: compressed.r,
        seed: compressed.s
      };
      
      // Validate the restored state
      if (!this.validateState(state)) {
        throw new Error('Invalid compressed game state structure');
      }
      
      return state;
    } catch (error) {
      throw new Error(`Failed to deserialize compressed game state: ${error.message}`);
    }
  }

  /**
   * Migrates old state versions to current version
   */
  static migrateState(state: any): GameState {
    if (!state.version || state.version < this.STATE_VERSION) {
      // Add migration logic here when needed
      state.version = this.STATE_VERSION;
    }
    return state as GameState;
  }
}

// Utility type for deep partial updates
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Validation types
export interface GameStateValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface GameStateValidationResult {
  readonly valid: boolean;
  readonly errors: GameStateValidationError[];
  readonly warnings: GameStateValidationError[];
}