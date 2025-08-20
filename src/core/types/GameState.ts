// Core game state type definitions
import { LevelDefinition } from './Level';

export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface InventoryItem {
  readonly id: string;
  readonly type: string;
  readonly quantity: number;
}

export interface PlayerStats {
  readonly totalMoves: number;
  readonly orbsCollected: number;
  readonly timeElapsed: number;
  readonly powerupsUsed: number;
  readonly hintsUsed: number;
}

export interface Player {
  readonly position: Position;
  readonly inventory: readonly InventoryItem[];
  readonly stats: PlayerStats;
  readonly activePowerups: readonly string[];
}

export interface MazeCell {
  readonly walls: number; // Bit field: 1=East, 2=South, 4=West, 8=North
  readonly type: CellType;
  readonly properties: CellProperties;
}

export type CellType = 'floor' | 'wall' | 'special';

export interface CellProperties {
  readonly isStart?: boolean;
  readonly isGoal?: boolean;
  readonly hasOrb?: boolean;
  readonly hasPowerup?: boolean;
  readonly isVisited?: boolean;
  readonly metadata?: Record<string, any>;
}

export interface OrbState {
  readonly id: string;
  readonly position: Position;
  readonly collected: boolean;
  readonly value: number;
  readonly collectedAt?: number; // timestamp
}

export interface PowerupState {
  readonly id: string;
  readonly position: Position;
  readonly type: string;
  readonly active: boolean;
  readonly collected: boolean;
  readonly duration?: number;
  readonly activatedAt?: number; // timestamp
  readonly expiresAt?: number; // timestamp
}

export interface ObjectiveProgress {
  readonly id: string;
  readonly type: string;
  readonly target: number;
  readonly current: number;
  readonly completed: boolean;
  readonly completedAt?: number; // timestamp
  readonly description: string;
  readonly required: boolean;
}

export type GameStatus = 'initializing' | 'playing' | 'paused' | 'completed' | 'failed';

export interface GameResult {
  readonly completed: boolean;
  readonly score: number;
  readonly stars: number;
  readonly completionTime: number;
  readonly totalMoves: number;
  readonly orbsCollected: number;
  readonly objectivesCompleted: number;
  readonly constraintsViolated: number;
}

export interface GameState {
  // Level info
  readonly levelId: string;
  readonly levelConfig: LevelDefinition;
  
  // Game status
  readonly status: GameStatus;
  readonly startTime: number;
  readonly currentTime: number;
  readonly pausedTime: number; // total time spent paused
  
  // Player state
  readonly player: Player;
  
  // World state
  readonly maze: readonly (readonly MazeCell[])[];
  readonly orbs: readonly OrbState[];
  readonly powerups: readonly PowerupState[];
  
  // Progress
  readonly objectives: readonly ObjectiveProgress[];
  readonly score: number;
  readonly moves: number;
  readonly hintsUsed: number;
  
  // Game result (populated when game is completed)
  readonly result?: GameResult;
  
  // Metadata for serialization
  readonly version: number;
  readonly seed?: number;
}