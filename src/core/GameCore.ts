// Main game engine and state management
import { GameState, Position, MazeCell, OrbState } from './types/GameState';
import { LevelDefinition } from './types/Level';
import {
  GameEventType,
  EventCallback,
  MoveResult,
  CollectionResult,
  GameEventPayload,
  StateChange,
  GameResult
} from './types/Events';
import { EventEmitter } from './GameEvents';
import { GameStateManager } from './GameState';
import { genMaze, generateMaze, MazeGenerationOptions, validateMaze, getReachablePositions } from '../engine/MazeGen';
import { SeededRandom } from '../utils/rng';

/**
 * Represents the four cardinal directions for player movement.
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Interface defining the core game engine API.
 * 
 * The GameCore is responsible for managing game state, processing player actions,
 * and maintaining game rules. It provides a clean separation between game logic
 * and presentation layers through an event-driven architecture.
 */
export interface IGameCore {
  // Lifecycle Management

  /**
   * Initializes a new game level from a level definition.
   * 
   * @param levelDefinition - The level configuration including maze generation parameters
   * @param seed - Optional seed for deterministic level generation. If not provided, uses level's seed or current time
   * @throws {Error} When level definition is invalid or maze generation fails
   */
  initializeLevel(levelDefinition: LevelDefinition, seed?: number): void;

  /**
   * Starts the game, transitioning from 'initializing' to 'playing' state.
   * Records the start time for scoring and timing calculations.
   */
  startGame(): void;

  /**
   * Pauses the game, transitioning to 'paused' state.
   * Preserves current game state and tracks pause duration.
   */
  pauseGame(): void;

  /**
   * Resumes a paused game, returning to 'playing' state.
   * Adjusts timing calculations to account for pause duration.
   */
  resumeGame(): void;

  /**
   * Resets the current level to its initial state.
   * Preserves the level definition but resets player position, score, and objectives.
   */
  resetGame(): void;

  // Player Actions

  /**
   * Attempts to move the player in the specified direction.
   * 
   * @param direction - The direction to move ('up', 'down', 'left', 'right')
   * @returns MoveResult indicating success/failure and any state changes
   */
  movePlayer(direction: Direction): MoveResult;

  /**
   * Attempts to collect an orb at the player's current position.
   * 
   * @param orbId - Unique identifier of the orb to collect
   * @returns CollectionResult indicating success/failure and points awarded
   */
  collectOrb(orbId: string): CollectionResult;

  // State Access

  /**
   * Gets the current game state as a read-only object.
   * 
   * @returns Immutable snapshot of the current game state
   */
  getGameState(): Readonly<GameState>;

  /**
   * Checks if the current game is complete (won or lost).
   * 
   * @returns True if all required objectives are completed or game has failed
   */
  isGameComplete(): boolean;

  /**
   * Gets the current player score.
   * 
   * @returns Current score including orb collection and time bonuses
   */
  getScore(): number;

  /**
   * Gets the current game time in milliseconds.
   * 
   * @returns Elapsed time since game start, excluding pause duration
   */
  getCurrentTime(): number;

  /**
   * Gets the current level definition.
   * 
   * @returns The currently loaded level definition, or null if no level is loaded
   */
  getCurrentLevelDefinition(): LevelDefinition | null;

  // Event Management

  /**
   * Subscribes to a game event.
   * 
   * @param event - The event type to listen for
   * @param callback - Function to call when event is emitted
   */
  on<T extends GameEventType>(event: T, callback: EventCallback<T>): void;

  /**
   * Unsubscribes from a game event.
   * 
   * @param event - The event type to stop listening for
   * @param callback - The specific callback function to remove
   */
  off<T extends GameEventType>(event: T, callback: EventCallback<T>): void;

  /**
   * Subscribes to a game event for a single occurrence.
   * 
   * @param event - The event type to listen for once
   * @param callback - Function to call when event is emitted (auto-removed after first call)
   */
  once<T extends GameEventType>(event: T, callback: EventCallback<T>): void;
}

/**
 * Core game engine implementation providing deterministic game logic and state management.
 * 
 * The GameCore class is the heart of the game system, responsible for:
 * - Managing game state and level progression
 * - Processing player actions and game rules
 * - Emitting events for UI updates
 * - Maintaining deterministic behavior for replays and testing
 * 
 * @example
 * ```typescript
 * const gameCore = new GameCore();
 * 
 * // Subscribe to events
 * gameCore.on('player.moved', (event) => {
 *   console.log(`Player moved to ${event.to.x}, ${event.to.y}`);
 * });
 * 
 * // Initialize and start a level
 * gameCore.initializeLevel(levelDefinition);
 * gameCore.startGame();
 * 
 * // Process player input
 * const result = gameCore.movePlayer('right');
 * if (result.success) {
 *   console.log('Move successful');
 * }
 * ```
 */
export class GameCore implements IGameCore {
  /** Current game state, null when no level is loaded */
  private gameState: GameState | null = null;

  /** Definition of the currently loaded level */
  private currentLevelDefinition: LevelDefinition | null = null;

  /** Event emitter for game state changes */
  private eventEmitter: EventEmitter;

  /** Timestamp when game was paused, null when not paused */
  private pausedAt: number | null = null;

  /** Total time spent paused in milliseconds */
  private totalPausedTime: number = 0;

  /**
   * Creates a new GameCore instance.
   * 
   * Initializes the event system and sets up error handling for event listeners.
   */
  constructor() {
    this.eventEmitter = new EventEmitter();

    // Set up error handling for event system
    this.eventEmitter.setErrorHandler((error, event, payload) => {
      this.emit('error', {
        error,
        context: `Event listener error for ${event}`,
        recoverable: true,
        timestamp: Date.now()
      });
    });
  }

  initializeLevel(levelDefinition: LevelDefinition, seed?: number): void {
    try {
      const actualSeed = seed ?? levelDefinition.generation.seed ?? Date.now();
      const rng = new SeededRandom(actualSeed);

      // Create initial game state
      this.gameState = GameStateManager.createInitialState(levelDefinition, actualSeed);
      this.currentLevelDefinition = levelDefinition;
      this.pausedAt = null;
      this.totalPausedTime = 0;

      // Generate or load maze based on level type
      const generationStartTime = Date.now();
      try {
        if (levelDefinition.generation.type === 'procedural') {
          this.generateProceduralMaze(levelDefinition, rng);
        } else if (levelDefinition.generation.type === 'handcrafted') {
          this.loadHandcraftedMaze(levelDefinition);
        } else {
          throw new Error(`Unsupported level generation type: ${levelDefinition.generation.type}`);
        }
      } catch (mazeError) {
        // Try to generate a fallback maze
        this.emit('debug', {
          level: 'warn',
          message: `Maze generation failed, attempting fallback: ${mazeError.message}`,
          data: { originalError: mazeError, levelId: levelDefinition.id },
          timestamp: Date.now()
        });

        this.generateFallbackMaze(levelDefinition, rng);
      }
      const generationTime = Date.now() - generationStartTime;

      // Emit level generation event
      this.emit('level.generated', {
        levelId: levelDefinition.id,
        seed: actualSeed,
        generationTime,
        mazeSize: levelDefinition.config.boardSize,
        orbCount: this.gameState!.orbs.length,
        timestamp: Date.now()
      });

      // Emit initialization event
      this.emit('game.initialized', {
        state: this.gameState!,
        levelDefinition,
        timestamp: Date.now()
      });

      this.emit('debug', {
        level: 'info',
        message: `Level initialized: ${levelDefinition.id}`,
        data: {
          seed: actualSeed,
          levelId: levelDefinition.id,
          generationTime,
          mazeSize: levelDefinition.config.boardSize,
          orbCount: this.gameState!.orbs.length
        },
        timestamp: Date.now()
      });

    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'Level initialization',
        recoverable: false,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  startGame(): void {
    if (!this.gameState || !this.currentLevelDefinition) {
      throw new Error('Game not initialized');
    }

    const timestamp = Date.now();
    const previousState = this.gameState;

    // Update game state to playing
    this.gameState = GameStateManager.updateGameStatus(this.gameState, 'playing');

    // Emit events
    this.emit('game.started', {
      timestamp,
      levelId: this.currentLevelDefinition.id,
      seed: this.gameState.seed
    });

    this.emitStateChanged(previousState, this.gameState, 'Game started');
  }

  pauseGame(): void {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    if (this.gameState.status !== 'playing') {
      return; // Already paused or not started
    }

    const timestamp = Date.now();
    const previousState = this.gameState;
    const duration = timestamp - this.gameState.startTime - this.totalPausedTime;

    this.gameState = GameStateManager.updateGameStatus(this.gameState, 'paused');
    this.pausedAt = timestamp;

    this.emit('game.paused', {
      timestamp,
      duration
    });

    this.emitStateChanged(previousState, this.gameState, 'Game paused');
  }

  resumeGame(): void {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    if (this.gameState.status !== 'paused' || !this.pausedAt) {
      return; // Not paused
    }

    const timestamp = Date.now();
    const previousState = this.gameState;
    const pausedDuration = timestamp - this.pausedAt;

    this.totalPausedTime += pausedDuration;
    this.gameState = GameStateManager.updateGameStatus(this.gameState, 'playing');
    this.pausedAt = null;

    this.emit('game.resumed', {
      timestamp,
      pausedDuration
    });

    this.emitStateChanged(previousState, this.gameState, 'Game resumed');
  }

  resetGame(): void {
    if (!this.currentLevelDefinition) {
      throw new Error('No level to reset');
    }

    const timestamp = Date.now();
    const levelId = this.currentLevelDefinition.id;

    // Reinitialize with the same level
    this.initializeLevel(this.currentLevelDefinition);

    this.emit('game.reset', {
      timestamp,
      levelId,
      reason: 'user_request'
    });
  }

  movePlayer(direction: Direction): MoveResult {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    if (this.gameState.status !== 'playing') {
      return {
        success: false,
        newPosition: this.gameState.player.position,
        reason: 'Game not in playing state',
        moveCount: this.gameState.moves
      };
    }

    const currentPosition = this.gameState.player.position;
    const newPosition = this.calculateNewPosition(currentPosition, direction);
    const timestamp = Date.now();

    // Emit move attempt
    this.emit('player.move.attempted', {
      from: currentPosition,
      attemptedTo: newPosition,
      direction: this.directionToCardinal(direction),
      blocked: false, // Will be updated based on validation
      timestamp
    });

    // Validate move (simplified for now - full validation will be in later tasks)
    const isValidMove = this.isValidMove(currentPosition, newPosition);

    if (!isValidMove) {
      this.emit('player.move.attempted', {
        from: currentPosition,
        attemptedTo: newPosition,
        direction: this.directionToCardinal(direction),
        blocked: true,
        reason: 'Invalid move',
        timestamp
      });

      return {
        success: false,
        newPosition: currentPosition,
        reason: 'Invalid move',
        moveCount: this.gameState.moves
      };
    }

    // Update state
    const previousState = this.gameState;
    this.gameState = GameStateManager.updatePlayerPosition(this.gameState, newPosition);

    const result: MoveResult = {
      success: true,
      newPosition,
      moveCount: this.gameState.moves
    };

    // Emit successful move
    this.emit('player.moved', {
      from: currentPosition,
      to: newPosition,
      valid: true,
      moveCount: this.gameState.moves,
      timestamp
    });

    this.emitStateChanged(previousState, this.gameState, 'Player moved');

    // Check for automatic orb collection at new position
    this.checkAutomaticOrbCollection(newPosition);

    // Update objectives
    this.updateObjectives();

    // Check if game is complete
    this.checkGameCompletion();

    return result;
  }

  collectOrb(orbId: string): CollectionResult {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    const orb = this.gameState.orbs.find(o => o.id === orbId);
    if (!orb) {
      return {
        success: false,
        orbId,
        scoreGained: 0,
        reason: 'Orb not found',
        totalScore: this.gameState.score
      };
    }

    if (orb.collected) {
      return {
        success: false,
        orbId,
        scoreGained: 0,
        reason: 'Orb already collected',
        totalScore: this.gameState.score
      };
    }

    // Check if player is at orb position
    if (this.gameState.player.position.x !== orb.position.x ||
      this.gameState.player.position.y !== orb.position.y) {
      return {
        success: false,
        orbId,
        scoreGained: 0,
        reason: 'Player not at orb position',
        totalScore: this.gameState.score
      };
    }

    const timestamp = Date.now();
    const previousState = this.gameState;
    const previousScore = this.gameState.score;

    // Update state
    this.gameState = GameStateManager.collectOrb(this.gameState, orbId);
    const scoreGained = this.gameState.score - previousScore;
    const orbsRemaining = this.gameState.orbs.filter(o => !o.collected).length;

    // Update objectives related to orb collection
    this.updateObjectives();

    const result: CollectionResult = {
      success: true,
      orbId,
      scoreGained,
      totalScore: this.gameState.score
    };

    // Emit events
    this.emit('orb.collected', {
      orbId,
      position: orb.position,
      score: scoreGained,
      totalScore: this.gameState.score,
      orbsRemaining,
      timestamp
    });

    if (scoreGained > 0) {
      this.emit('score.changed', {
        previousScore,
        newScore: this.gameState.score,
        change: scoreGained,
        reason: 'orb_collected',
        timestamp
      });
    }

    this.emitStateChanged(previousState, this.gameState, 'Orb collected');

    // Check if game is complete after orb collection
    this.checkGameCompletion();

    return result;
  }

  getGameState(): Readonly<GameState> {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }
    return this.gameState;
  }

  isGameComplete(): boolean {
    if (!this.gameState) {
      return false;
    }

    // Check if all required objectives are completed
    return this.gameState.objectives
      .filter(obj => obj.required)
      .every(obj => obj.completed);
  }

  getScore(): number {
    return this.gameState?.score ?? 0;
  }

  getCurrentTime(): number {
    if (!this.gameState) {
      return 0;
    }

    const now = Date.now();
    const elapsed = now - this.gameState.startTime;
    const pausedTime = this.pausedAt ? (now - this.pausedAt) : 0;

    return elapsed - this.totalPausedTime - pausedTime;
  }

  getCurrentLevelDefinition(): LevelDefinition | null {
    return this.currentLevelDefinition;
  }

  // Event system delegation
  on<T extends GameEventType>(event: T, callback: EventCallback<T>): void {
    this.eventEmitter.on(event, callback);
  }

  off<T extends GameEventType>(event: T, callback: EventCallback<T>): void {
    this.eventEmitter.off(event, callback);
  }

  once<T extends GameEventType>(event: T, callback: EventCallback<T>): void {
    this.eventEmitter.once(event, callback);
  }

  // Protected methods for internal use
  protected emit<T extends GameEventType>(event: T, payload: GameEventPayload<T>): void {
    this.eventEmitter.emit(event, payload);
  }

  private emitStateChanged(previousState: GameState, newState: GameState, reason: string): void {
    const changes: StateChange[] = this.calculateStateChanges(previousState, newState);

    this.emit('state.changed', {
      state: newState,
      changes,
      timestamp: Date.now()
    });

    this.emit('debug', {
      level: 'debug',
      message: `State changed: ${reason}`,
      data: { changeCount: changes.length, changes },
      timestamp: Date.now()
    });
  }

  private calculateStateChanges(oldState: GameState, newState: GameState): StateChange[] {
    const changes: StateChange[] = [];
    const timestamp = Date.now();

    // Check for basic property changes
    if (oldState.status !== newState.status) {
      changes.push({
        property: 'status',
        oldValue: oldState.status,
        newValue: newState.status,
        timestamp
      });
    }

    if (oldState.score !== newState.score) {
      changes.push({
        property: 'score',
        oldValue: oldState.score,
        newValue: newState.score,
        timestamp
      });
    }

    if (oldState.moves !== newState.moves) {
      changes.push({
        property: 'moves',
        oldValue: oldState.moves,
        newValue: newState.moves,
        timestamp
      });
    }

    // Check player position
    if (oldState.player.position.x !== newState.player.position.x ||
      oldState.player.position.y !== newState.player.position.y) {
      changes.push({
        property: 'player.position',
        oldValue: oldState.player.position,
        newValue: newState.player.position,
        timestamp
      });
    }

    // Check orb states
    for (let i = 0; i < Math.max(oldState.orbs.length, newState.orbs.length); i++) {
      const oldOrb = oldState.orbs[i];
      const newOrb = newState.orbs[i];

      if (oldOrb && newOrb && oldOrb.collected !== newOrb.collected) {
        changes.push({
          property: `orbs[${i}].collected`,
          oldValue: oldOrb.collected,
          newValue: newOrb.collected,
          timestamp
        });
      }
    }

    return changes;
  }

  private calculateNewPosition(current: Position, direction: Direction): Position {
    switch (direction) {
      case 'up':
        return { x: current.x, y: current.y - 1 };
      case 'down':
        return { x: current.x, y: current.y + 1 };
      case 'left':
        return { x: current.x - 1, y: current.y };
      case 'right':
        return { x: current.x + 1, y: current.y };
      default:
        return current;
    }
  }

  private directionToCardinal(direction: Direction): 'north' | 'south' | 'east' | 'west' {
    switch (direction) {
      case 'up': return 'north';
      case 'down': return 'south';
      case 'left': return 'west';
      case 'right': return 'east';
      default: return 'north';
    }
  }

  private checkAutomaticOrbCollection(position: Position): void {
    if (!this.gameState) return;

    // Find orbs at the current position that haven't been collected
    const orbsAtPosition = this.gameState.orbs.filter(orb =>
      orb.position.x === position.x &&
      orb.position.y === position.y &&
      !orb.collected
    );

    // Collect all orbs at this position
    for (const orb of orbsAtPosition) {
      this.collectOrb(orb.id);
    }
  }

  private updateObjectives(): void {
    if (!this.gameState) return;

    const previousState = this.gameState;
    let stateChanged = false;

    for (const objective of this.gameState.objectives) {
      if (objective.completed) continue;

      let newProgress = objective.current;

      switch (objective.type) {
        case 'collect_orbs':
          newProgress = this.gameState.player.stats.orbsCollected;
          break;
        case 'reach_goal':
          const isAtGoal = this.isPlayerAtGoal();
          newProgress = isAtGoal ? 1 : 0;
          break;
        case 'collect_all_orbs':
          const totalOrbs = this.gameState.orbs.length;
          const collectedOrbs = this.gameState.orbs.filter(o => o.collected).length;
          newProgress = collectedOrbs === totalOrbs ? 1 : 0;
          break;
        case 'time_limit':
          const currentTime = this.getCurrentTime();
          newProgress = Math.max(0, objective.target - Math.floor(currentTime / 1000));
          break;
        case 'move_limit':
          newProgress = Math.max(0, objective.target - this.gameState.moves);
          break;
        default:
          continue;
      }

      if (newProgress !== objective.current) {
        this.gameState = GameStateManager.updateObjectiveProgress(
          this.gameState,
          objective.id,
          newProgress
        );
        stateChanged = true;

        // Emit objective progress event
        this.emit('objective.progress', {
          objectiveId: objective.id,
          previousProgress: objective.current,
          newProgress,
          target: objective.target,
          completed: newProgress >= objective.target,
          timestamp: Date.now()
        });

        // If objective just completed, emit completion event
        if (newProgress >= objective.target && objective.current < objective.target) {
          this.emit('objective.completed', {
            objectiveId: objective.id,
            completionTime: this.getCurrentTime(),
            timestamp: Date.now()
          });
        }
      }
    }

    if (stateChanged) {
      this.emitStateChanged(previousState, this.gameState, 'Objectives updated');
    }
  }

  private checkGameCompletion(): void {
    if (!this.gameState) return;

    // Check if all required objectives are completed
    const requiredObjectives = this.gameState.objectives.filter(obj => obj.required);
    const allRequiredCompleted = requiredObjectives.every(obj => obj.completed);

    if (allRequiredCompleted && this.gameState.status === 'playing') {
      const timestamp = Date.now();
      const duration = this.getCurrentTime();
      const previousState = this.gameState;

      // Update game state to completed
      this.gameState = GameStateManager.updateGameStatus(this.gameState, 'completed');

      // Calculate final result
      const result = this.calculateGameResult(duration);

      // Emit completion event
      this.emit('game.completed', {
        result,
        timestamp,
        duration
      });

      this.emitStateChanged(previousState, this.gameState, 'Game completed');
    }
  }

  private calculateGameResult(duration: number): GameResult {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    const completedObjectives = this.gameState.objectives.filter(obj => obj.completed).length;
    const requiredObjectives = this.gameState.objectives.filter(obj => obj.required);
    const allRequiredCompleted = requiredObjectives.every(obj => obj.completed);

    // Calculate stars based on performance
    let stars = 0;
    if (allRequiredCompleted) {
      stars = 1; // Base star for completion

      // Check star thresholds from level definition
      const thresholds = this.gameState.levelConfig.progression.starThresholds;
      for (const threshold of thresholds.sort((a, b) => b.stars - a.stars)) {
        let meetsThreshold = true;

        if (threshold.requirements.time && duration > threshold.requirements.time * 1000) {
          meetsThreshold = false;
        }
        if (threshold.requirements.moves && this.gameState.moves > threshold.requirements.moves) {
          meetsThreshold = false;
        }
        if (threshold.requirements.orbsCollected &&
          this.gameState.player.stats.orbsCollected < threshold.requirements.orbsCollected) {
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
      score: this.gameState.score,
      stars,
      completionTime: duration,
      totalMoves: this.gameState.moves,
      orbsCollected: this.gameState.player.stats.orbsCollected,
      objectivesCompleted: completedObjectives,
      constraintsViolated: 0 // Will be implemented when constraint system is added
    };
  }

  private generateProceduralMaze(levelDefinition: LevelDefinition, rng: SeededRandom): void {
    if (!this.gameState) throw new Error('Game state not initialized');

    const { width, height } = levelDefinition.config.boardSize;
    const parameters = levelDefinition.generation.parameters;

    // Generate maze using Prim's algorithm with enhanced options
    const mazeOptions: MazeGenerationOptions = {
      width,
      height,
      algorithm: (parameters?.algorithm as 'prim' | 'recursive-backtrack') || 'prim'
    };

    const mazeResult = generateMaze(mazeOptions, () => rng.next());
    
    // Determine start and goal positions
    const startPos = { x: 0, y: 0 };
    const goalPos = { x: width - 1, y: height - 1 };

    // Convert raw maze to MazeCell format
    const maze: MazeCell[][] = mazeResult.maze.map((row, y) =>
      row.map((cell, x) => ({
        walls: cell,
        type: (x === startPos.x && y === startPos.y) ? 'start' :
          (x === goalPos.x && y === goalPos.y) ? 'goal' : 'floor',
        properties: {
          isStart: x === startPos.x && y === startPos.y,
          isGoal: x === goalPos.x && y === goalPos.y,
          isVisited: false
        }
      }))
    );

    // Validate maze is solvable
    const validation = validateMaze(mazeResult.maze, startPos, goalPos);
    if (!validation.isSolvable) {
      throw new Error('Generated maze is not solvable');
    }

    // Generate orbs using intelligent placement
    const orbs = this.generateOrbsIntelligent(levelDefinition, rng, mazeResult.maze, startPos, goalPos);

    // Update game state with generated maze and orbs
    this.gameState = GameStateManager.updateState(this.gameState, {
      maze,
      orbs,
      player: {
        position: startPos
      }
    });
  }

  private loadHandcraftedMaze(levelDefinition: LevelDefinition): void {
    if (!this.gameState) throw new Error('Game state not initialized');

    const layout = levelDefinition.generation.layout;
    if (!layout) {
      throw new Error('Handcrafted level missing layout data');
    }

    // Convert handcrafted layout to game state format
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

    // Convert orb positions to OrbState
    const orbs: OrbState[] = layout.orbPositions.map((orbPos, index) => ({
      id: orbPos.id || `orb_${index}`,
      position: { x: orbPos.x, y: orbPos.y },
      collected: false,
      value: orbPos.value
    }));

    // Update game state
    this.gameState = GameStateManager.updateState(this.gameState, {
      maze,
      orbs,
      player: {
        position: layout.startPosition
      }
    });
  }

  private generateOrbsIntelligent(
    levelDefinition: LevelDefinition, 
    rng: SeededRandom, 
    rawMaze: number[][], 
    startPos: Position, 
    goalPos: Position
  ): OrbState[] {
    const parameters = levelDefinition.generation.parameters;
    if (!parameters) return [];

    const orbs: OrbState[] = [];
    const { width, height } = levelDefinition.config.boardSize;
    const orbCount = parameters.orbCount || 2;

    // Get all reachable positions from start
    const reachablePositions = getReachablePositions(rawMaze, startPos);
    const availablePositions: Position[] = [];

    // Convert reachable positions to array, excluding start and goal
    for (const posKey of reachablePositions) {
      const [x, y] = posKey.split(',').map(Number);
      if ((x !== startPos.x || y !== startPos.y) && (x !== goalPos.x || y !== goalPos.y)) {
        availablePositions.push({ x, y });
      }
    }

    if (availablePositions.length === 0) return [];

    // Intelligent placement based on strategy
    const placement = parameters.orbPlacement || 'random';
    let selectedPositions: Position[] = [];

    if (placement === 'balanced') {
      // Place orbs at strategic distances from start and goal
      selectedPositions = this.selectBalancedOrbPositions(availablePositions, startPos, goalPos, orbCount, rng);
    } else {
      // Random placement
      const shuffled = rng.shuffle([...availablePositions]);
      selectedPositions = shuffled.slice(0, Math.min(orbCount, shuffled.length));
    }

    // Create orb states
    selectedPositions.forEach((pos, index) => {
      orbs.push({
        id: `orb_${index + 1}`,
        position: pos,
        collected: false,
        value: 10 + (index * 5) // Increasing value for later orbs
      });
    });

    return orbs;
  }

  private selectBalancedOrbPositions(
    availablePositions: Position[],
    startPos: Position,
    goalPos: Position,
    orbCount: number,
    rng: SeededRandom
  ): Position[] {
    if (availablePositions.length === 0) return [];

    // Calculate distances from start for each position
    const positionsWithDistance = availablePositions.map(pos => ({
      position: pos,
      distanceFromStart: Math.abs(pos.x - startPos.x) + Math.abs(pos.y - startPos.y),
      distanceFromGoal: Math.abs(pos.x - goalPos.x) + Math.abs(pos.y - goalPos.y)
    }));

    // Sort by distance from start to create a progression
    positionsWithDistance.sort((a, b) => a.distanceFromStart - b.distanceFromStart);

    const selected: Position[] = [];
    const totalPositions = positionsWithDistance.length;

    for (let i = 0; i < orbCount && i < totalPositions; i++) {
      // Select positions at regular intervals to create balanced distribution
      const segmentSize = Math.floor(totalPositions / orbCount);
      const segmentStart = i * segmentSize;
      const segmentEnd = Math.min(segmentStart + segmentSize, totalPositions);
      
      if (segmentStart < totalPositions) {
        // Add some randomness within the segment
        const randomIndex = segmentStart + Math.floor(rng.next() * (segmentEnd - segmentStart));
        selected.push(positionsWithDistance[randomIndex].position);
      }
    }

    return selected;
  }

  private generateOrbs(levelDefinition: LevelDefinition, rng: SeededRandom, maze: MazeCell[][]): OrbState[] {
    const parameters = levelDefinition.generation.parameters;
    if (!parameters) return [];

    const orbs: OrbState[] = [];
    const { width, height } = levelDefinition.config.boardSize;
    const orbCount = parameters.orbCount || 3;

    // Get available positions (not start or goal)
    const availablePositions: Position[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = maze[y][x];
        if (!cell.properties.isStart && !cell.properties.isGoal) {
          availablePositions.push({ x, y });
        }
      }
    }

    // Shuffle available positions
    const shuffledPositions = rng.shuffle([...availablePositions]);

    // Place orbs based on placement strategy
    const placementStrategy = parameters.orbPlacement || 'random';
    let selectedPositions: Position[] = [];

    switch (placementStrategy) {
      case 'random':
        selectedPositions = shuffledPositions.slice(0, Math.min(orbCount, shuffledPositions.length));
        break;
      case 'corners':
        // Prefer corner positions
        const corners = shuffledPositions.filter(pos =>
          (pos.x === 0 || pos.x === width - 1) && (pos.y === 0 || pos.y === height - 1)
        );
        selectedPositions = [
          ...corners.slice(0, Math.min(orbCount, corners.length)),
          ...shuffledPositions.filter(pos => !corners.includes(pos)).slice(0, Math.max(0, orbCount - corners.length))
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
      orbs.push({
        id: `orb_${index}`,
        position,
        collected: false,
        value: 100 // Base orb value, could be made configurable
      });
    });

    return orbs;
  }

  private isPlayerAtGoal(): boolean {
    if (!this.gameState || !this.currentLevelDefinition) return false;

    // Check if player is at any goal position
    const playerPos = this.gameState.player.position;
    const cell = this.gameState.maze[playerPos.y]?.[playerPos.x];

    return cell?.properties.isGoal === true;
  }

  private generateFallbackMaze(levelDefinition: LevelDefinition, rng: SeededRandom): void {
    if (!this.gameState) throw new Error('Game state not initialized');

    const { width, height } = levelDefinition.config.boardSize;

    // Create a simple maze with all walls open (fully connected)
    const maze: MazeCell[][] = [];
    for (let y = 0; y < height; y++) {
      const row: MazeCell[] = [];
      for (let x = 0; x < width; x++) {
        let walls = 0;

        // Add walls for all directions that don't go out of bounds
        if (x < width - 1) walls |= 1;  // East
        if (y < height - 1) walls |= 2; // South
        if (x > 0) walls |= 4;          // West
        if (y > 0) walls |= 8;          // North

        row.push({
          walls,
          type: (x === 0 && y === 0) ? 'special' :
            (x === width - 1 && y === height - 1) ? 'special' : 'floor',
          properties: {
            isStart: x === 0 && y === 0,
            isGoal: x === width - 1 && y === height - 1,
            isVisited: false
          }
        });
      }
      maze.push(row);
    }

    // Generate minimal orbs for fallback
    const orbs: OrbState[] = [];
    const minOrbs = Math.min(2, Math.floor((width * height) / 4));

    for (let i = 0; i < minOrbs; i++) {
      let x, y;
      do {
        x = Math.floor(rng.next() * width);
        y = Math.floor(rng.next() * height);
      } while ((x === 0 && y === 0) || (x === width - 1 && y === height - 1));

      orbs.push({
        id: `fallback_orb_${i}`,
        position: { x, y },
        collected: false,
        value: 100
      });
    }

    // Update game state
    this.gameState = GameStateManager.updateState(this.gameState, {
      maze,
      orbs,
      player: {
        position: { x: 0, y: 0 }
      }
    });

    this.emit('debug', {
      level: 'info',
      message: 'Fallback maze generated successfully',
      data: {
        mazeSize: { width, height },
        orbCount: orbs.length
      },
      timestamp: Date.now()
    });
  }

  private isValidMove(from: Position, to: Position): boolean {
    if (!this.gameState) return false;

    // Check bounds
    if (to.x < 0 || to.y < 0) return false;
    if (this.gameState.maze.length === 0) return false; // No maze loaded

    const height = this.gameState.maze.length;
    const width = this.gameState.maze[0]?.length ?? 0;

    if (to.x >= width || to.y >= height) return false;

    // Check if move is to adjacent cell only
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (Math.abs(dx) + Math.abs(dy) !== 1) return false; // Only allow orthogonal moves

    // Get the cell walls at the current position
    const fromCell = this.gameState.maze[from.y][from.x];

    // Check walls based on direction
    // Wall bits: 1=East, 2=South, 4=West, 8=North
    if (dx === 1 && !(fromCell.walls & 1)) return false;  // Moving east, check east wall
    if (dx === -1 && !(fromCell.walls & 4)) return false; // Moving west, check west wall
    if (dy === 1 && !(fromCell.walls & 2)) return false;  // Moving south, check south wall
    if (dy === -1 && !(fromCell.walls & 8)) return false; // Moving north, check north wall

    return true;
  }
}