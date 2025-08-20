// Level definition type definitions

// Basic position and size types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Level metadata
export interface LevelMetadata {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedTime: number; // in seconds
  tags: string[];
  description?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Procedural generation parameters
export interface ProceduralParameters {
  algorithm: 'recursive_backtrack' | 'kruskal' | 'prim' | 'wilson';
  complexity: number; // 0-1 scale
  branchingFactor: number; // 0-1 scale, affects maze connectivity
  deadEndRatio: number; // 0-1 scale, ratio of dead ends to keep
  orbCount: number;
  orbPlacement: 'random' | 'strategic' | 'path' | 'corners';
  minPathLength?: number; // minimum path from start to goal
  maxPathLength?: number; // maximum path from start to goal
  symmetry?: 'none' | 'horizontal' | 'vertical' | 'rotational';
}

// Handcrafted level layout
export interface MazeCell {
  walls: number; // Bit field: 1=East, 2=South, 4=West, 8=North
  type: 'floor' | 'wall' | 'start' | 'goal' | 'special';
  properties?: Record<string, any>;
}

export interface HandcraftedLayout {
  cells: MazeCell[][];
  startPosition: Position;
  goalPosition: Position;
  orbPositions: Array<Position & { value: number; id?: string }>;
  powerupPositions: Array<Position & { type: string; id?: string }>;
  specialCells?: Array<Position & { type: string; properties: Record<string, any> }>;
}

// Level generation configuration
export interface LevelGeneration {
  type: 'procedural' | 'handcrafted';
  seed?: number;
  parameters?: ProceduralParameters;
  layout?: HandcraftedLayout;
}

// Game objectives
export interface Objective {
  id: string;
  type: 'collect_orbs' | 'collect_all_orbs' | 'reach_goal' | 'time_limit' | 'move_limit' | 'collect_sequence' | 'avoid_traps';
  target: number;
  description: string;
  required: boolean;
  priority: number; // for ordering objectives
  conditions?: Record<string, any>; // additional conditions for complex objectives
}

// Game constraints
export interface Constraint {
  id: string;
  type: 'time_limit' | 'move_limit' | 'no_backtrack' | 'no_diagonal' | 'limited_vision' | 'one_way_paths';
  value: number;
  description: string;
  severity: 'warning' | 'failure'; // what happens when constraint is violated
}

// Powerup configuration
export interface PowerupType {
  id: string;
  name: string;
  description: string;
  icon?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface PowerupConfig {
  type: string; // references PowerupType.id
  spawnRate: number; // 0-1 probability
  duration: number; // in seconds, -1 for permanent
  effect: string;
  stackable: boolean;
  maxStacks?: number;
  cooldown?: number; // seconds before can be used again
}

// Level game configuration
export interface LevelConfig {
  boardSize: Size;
  objectives: Objective[];
  constraints: Constraint[];
  powerups: PowerupConfig[];
  startingInventory?: Array<{ type: string; quantity: number }>;
  environmentEffects?: Array<{
    type: string;
    intensity: number;
    duration?: number;
  }>;
}

// Reward system
export interface Reward {
  type: 'stars' | 'coins' | 'unlock' | 'achievement' | 'powerup' | 'cosmetic';
  value: number;
  description: string;
  id?: string; // for specific unlocks/achievements
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Star threshold configuration
export interface StarThreshold {
  stars: number; // 1, 2, or 3 stars
  requirements: {
    time?: number; // complete within this time (seconds)
    moves?: number; // complete within this many moves
    orbsCollected?: number; // collect at least this many orbs
    objectivesCompleted?: string[]; // complete these specific objectives
    constraintsViolated?: number; // violate no more than this many constraints
  };
}

// Level progression and rewards
export interface LevelProgression {
  starThresholds: StarThreshold[];
  rewards: Reward[];
  unlocks: string[]; // level IDs that this level unlocks
  prerequisites?: string[]; // level IDs that must be completed first
  repeatRewards?: Reward[]; // rewards for replaying the level
}

// Validation result types
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Main level definition interface
export interface LevelDefinition {
  id: string;
  version: number;
  metadata: LevelMetadata;
  generation: LevelGeneration;
  config: LevelConfig;
  progression: LevelProgression;
  
  // Schema validation
  $schema?: string; // JSON schema version
  checksum?: string; // for integrity verification
}

// Level collection types
export interface LevelPack {
  id: string;
  name: string;
  description: string;
  version: number;
  levels: string[]; // level IDs in order
  metadata: {
    author: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'mixed';
    estimatedPlayTime: number; // total minutes
    tags: string[];
  };
}

// Level loading and caching
export interface LevelLoadOptions {
  validateSchema?: boolean;
  migrateVersion?: boolean;
  includeMetadata?: boolean;
  cacheable?: boolean;
}

export interface LevelLoadResult {
  level: LevelDefinition;
  loadTime: number;
  fromCache: boolean;
  migrated: boolean;
  validationResult?: ValidationResult;
}