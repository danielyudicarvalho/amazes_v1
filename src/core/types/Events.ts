// Event system type definitions
import { GameState, Position, GameStatus } from './GameState';
import { Reward, LevelDefinition } from './Level';

export interface GameResult {
  completed: boolean;
  score: number;
  time: number;
  moves: number;
  stars: number;
  objectives: {
    id: string;
    completed: boolean;
    completedAt?: number;
  }[];
}

export interface StateChange {
  property: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

export interface MoveResult {
  success: boolean;
  newPosition: Position;
  reason?: string;
  moveCount: number;
}

export interface CollectionResult {
  success: boolean;
  orbId: string;
  scoreGained: number;
  reason?: string;
  totalScore: number;
}

export interface ValidationError {
  code: string;
  message: string;
  context?: any;
}

export interface LevelLoadResult {
  success: boolean;
  levelId: string;
  error?: string;
  fallbackUsed?: boolean;
}

// Event payload definitions

// Game lifecycle events
export interface GameInitializedEvent {
  state: GameState;
  levelDefinition: LevelDefinition;
  timestamp: number;
}

export interface GameStartedEvent {
  timestamp: number;
  levelId: string;
  seed: number;
}

export interface GamePausedEvent {
  timestamp: number;
  duration: number; // How long the game has been running
}

export interface GameResumedEvent {
  timestamp: number;
  pausedDuration: number; // How long it was paused
}

export interface GameResetEvent {
  timestamp: number;
  levelId: string;
  reason: 'user_request' | 'error' | 'level_change';
}

export interface GameCompletedEvent {
  result: GameResult;
  timestamp: number;
  duration: number;
}

export interface GameFailedEvent {
  reason: string;
  timestamp: number;
  state: GameState;
}

// Player action events
export interface PlayerMovedEvent {
  from: Position;
  to: Position;
  valid: boolean;
  moveCount: number;
  timestamp: number;
  reason?: string; // If invalid, why it failed
}

export interface PlayerMoveAttemptedEvent {
  from: Position;
  attemptedTo: Position;
  direction: 'north' | 'south' | 'east' | 'west';
  blocked: boolean;
  reason?: string;
  timestamp: number;
}

// Game object events
export interface OrbCollectedEvent {
  orbId: string;
  position: Position;
  score: number;
  totalScore: number;
  orbsRemaining: number;
  timestamp: number;
}

export interface OrbCollectionAttemptedEvent {
  orbId: string;
  position: Position;
  success: boolean;
  reason?: string;
  timestamp: number;
}

// Objective and progression events
export interface ObjectiveProgressEvent {
  objectiveId: string;
  previousProgress: number;
  newProgress: number;
  target: number;
  completed: boolean;
  timestamp: number;
}

export interface ObjectiveCompletedEvent {
  objectiveId: string;
  reward?: Reward;
  completionTime: number;
  timestamp: number;
}

export interface ScoreChangedEvent {
  previousScore: number;
  newScore: number;
  change: number;
  reason: 'orb_collected' | 'objective_completed' | 'time_bonus' | 'penalty';
  timestamp: number;
}

// Level events
export interface LevelLoadedEvent {
  levelId: string;
  levelDefinition: LevelDefinition;
  result: LevelLoadResult;
  timestamp: number;
}

export interface LevelGeneratedEvent {
  levelId: string;
  seed: number;
  generationTime: number;
  mazeSize: { width: number; height: number };
  orbCount: number;
  timestamp: number;
}

// State management events
export interface StateChangedEvent {
  state: GameState;
  changes: StateChange[];
  timestamp: number;
}

export interface StateValidationEvent {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  timestamp: number;
}

// Error and debug events
export interface ErrorEvent {
  error: Error;
  context: string;
  recoverable: boolean;
  timestamp: number;
}

export interface DebugEvent {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  timestamp: number;
}

// Event type mapping - comprehensive event system
export interface GameEvents {
  // Game lifecycle events
  'game.initialized': GameInitializedEvent;
  'game.started': GameStartedEvent;
  'game.paused': GamePausedEvent;
  'game.resumed': GameResumedEvent;
  'game.reset': GameResetEvent;
  'game.completed': GameCompletedEvent;
  'game.failed': GameFailedEvent;

  // Player action events
  'player.moved': PlayerMovedEvent;
  'player.move.attempted': PlayerMoveAttemptedEvent;

  // Game object events
  'orb.collected': OrbCollectedEvent;
  'orb.collection.attempted': OrbCollectionAttemptedEvent;

  // Objective and progression events
  'objective.progress': ObjectiveProgressEvent;
  'objective.completed': ObjectiveCompletedEvent;
  'score.changed': ScoreChangedEvent;

  // Level events
  'level.loaded': LevelLoadedEvent;
  'level.generated': LevelGeneratedEvent;

  // State management events
  'state.changed': StateChangedEvent;
  'state.validated': StateValidationEvent;

  // Error and debug events
  'error': ErrorEvent;
  'debug': DebugEvent;
}

export type GameEventType = keyof GameEvents;
export type GameEventPayload<T extends GameEventType> = GameEvents[T];

// Event callback type with improved type safety
export type EventCallback<T extends GameEventType = GameEventType> = (
  payload: GameEventPayload<T>
) => void;

// Event listener options
export interface EventListenerOptions {
  once?: boolean;
  priority?: number;
}

// Event emission options
export interface EventEmissionOptions {
  async?: boolean;
  skipValidation?: boolean;
}

// Helper types for event filtering and grouping
export type GameLifecycleEvents = Extract<GameEventType, `game.${string}`>;
export type PlayerEvents = Extract<GameEventType, `player.${string}`>;
export type OrbEvents = Extract<GameEventType, `orb.${string}`>;
export type ObjectiveEvents = Extract<GameEventType, `objective.${string}`>;
export type LevelEvents = Extract<GameEventType, `level.${string}`>;
export type StateEvents = Extract<GameEventType, `state.${string}`>;
export type SystemEvents = Extract<GameEventType, 'error' | 'debug'>;

// Event categories for easier management
export const EVENT_CATEGORIES = {
  GAME_LIFECYCLE: ['game.initialized', 'game.started', 'game.paused', 'game.resumed', 'game.reset', 'game.completed', 'game.failed'] as const,
  PLAYER_ACTIONS: ['player.moved', 'player.move.attempted'] as const,
  GAME_OBJECTS: ['orb.collected', 'orb.collection.attempted'] as const,
  PROGRESSION: ['objective.progress', 'objective.completed', 'score.changed'] as const,
  LEVEL_MANAGEMENT: ['level.loaded', 'level.generated'] as const,
  STATE_MANAGEMENT: ['state.changed', 'state.validated'] as const,
  SYSTEM: ['error', 'debug'] as const,
} as const;

export type EventCategory = keyof typeof EVENT_CATEGORIES;