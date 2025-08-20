# Design Document

## Overview

Phase 1 implements a clean separation between game logic and presentation by extracting the core game mechanics into a pure, deterministic module. This establishes the foundation for a scalable architecture that can support thousands of levels, replay systems, and advanced features like A/B testing and anti-cheat mechanisms.

## Architecture

### Core Module Structure
```
src/core/
├── GameCore.ts          # Main game engine and state management
├── GameState.ts         # Immutable game state definitions
├── GameEvents.ts        # Event system for core-to-presentation communication
├── LevelDefinition.ts   # Level schema and validation
├── MazeGenerator.ts     # Pure maze generation logic
├── GameRules.ts         # Game rule validation and scoring
└── types/
    ├── Level.ts         # Level type definitions
    ├── GameState.ts     # Game state type definitions
    └── Events.ts        # Event type definitions
```

### Presentation Layer Structure
```
src/presentation/
├── GameRenderer.ts      # Phaser scene that renders game state
├── UIManager.ts         # UI element management and updates
├── InputHandler.ts      # Input processing and core command dispatch
└── AssetManager.ts      # Asset loading and management
```

### Service Layer Structure
```
src/services/
├── LevelService.ts      # Level loading and caching
├── GameService.ts       # High-level game operations
└── EventBus.ts          # Event communication system
```

## Components and Interfaces

### GameCore Interface
The core game engine provides a clean API for game operations:

```typescript
interface IGameCore {
  // Lifecycle
  initializeLevel(levelDefinition: LevelDefinition): void
  startGame(): void
  pauseGame(): void
  resetGame(): void
  
  // Actions
  movePlayer(direction: Direction): MoveResult
  collectOrb(orbId: string): CollectionResult
  
  // State Access
  getGameState(): Readonly<GameState>
  isGameComplete(): boolean
  getScore(): number
  
  // Events
  on(event: GameEvent, callback: EventCallback): void
  off(event: GameEvent, callback: EventCallback): void
}
```

### Level Definition Schema
Levels are defined using a JSON schema that supports both procedural and handcrafted content:

```typescript
interface LevelDefinition {
  id: string
  version: number
  metadata: {
    name: string
    difficulty: 'easy' | 'medium' | 'hard' | 'expert'
    estimatedTime: number
    tags: string[]
  }
  
  // Generation method
  generation: {
    type: 'procedural' | 'handcrafted'
    seed?: number
    parameters?: ProceduralParameters
    layout?: HandcraftedLayout
  }
  
  // Game configuration
  config: {
    boardSize: { width: number, height: number }
    objectives: Objective[]
    constraints: Constraint[]
    powerups: PowerupConfig[]
  }
  
  // Progression
  progression: {
    starThresholds: { time: number, moves?: number }[]
    rewards: Reward[]
    unlocks: string[]
  }
}
```

### Game State Management
The game state is immutable and contains all information needed to render and resume the game:

```typescript
interface GameState {
  // Level info
  levelId: string
  levelConfig: LevelDefinition
  
  // Game status
  status: 'initializing' | 'playing' | 'paused' | 'completed' | 'failed'
  startTime: number
  currentTime: number
  
  // Player state
  player: {
    position: Position
    inventory: InventoryItem[]
    stats: PlayerStats
  }
  
  // World state
  maze: MazeCell[][]
  orbs: OrbState[]
  powerups: PowerupState[]
  
  // Progress
  objectives: ObjectiveProgress[]
  score: number
  moves: number
}
```

### Event System
The core communicates with the presentation layer through a type-safe event system:

```typescript
type GameEvents = {
  'game.initialized': { state: GameState }
  'game.started': { timestamp: number }
  'game.paused': { timestamp: number }
  'game.completed': { result: GameResult }
  
  'player.moved': { from: Position, to: Position, valid: boolean }
  'orb.collected': { orbId: string, position: Position, score: number }
  'objective.completed': { objectiveId: string, reward: Reward }
  
  'state.changed': { state: GameState, changes: StateChange[] }
}
```

## Data Models

### Maze Representation
The maze uses a compact bit-field representation for efficient storage and processing:

```typescript
interface MazeCell {
  walls: number        // Bit field: 1=East, 2=South, 4=West, 8=North
  type: CellType       // floor, wall, special
  properties: CellProperties
}

interface MazeData {
  width: number
  height: number
  cells: MazeCell[][]
  metadata: MazeMetadata
}
```

### Deterministic Random Number Generation
All randomness uses a seeded PRNG for deterministic behavior:

```typescript
class SeededRandom {
  constructor(seed: number)
  next(): number
  nextInt(min: number, max: number): number
  nextFloat(min: number, max: number): number
  shuffle<T>(array: T[]): T[]
}
```

## Error Handling

### Validation Strategy
- **Level Definition Validation**: JSON Schema validation with detailed error messages
- **Game State Validation**: Runtime checks for state consistency
- **Input Validation**: Strict validation of all player actions
- **Graceful Degradation**: Fallback behaviors for invalid states

### Error Types
```typescript
abstract class GameError extends Error {
  abstract code: string
  abstract recoverable: boolean
}

class InvalidMoveError extends GameError {
  code = 'INVALID_MOVE'
  recoverable = true
}

class LevelLoadError extends GameError {
  code = 'LEVEL_LOAD_FAILED'
  recoverable = false
}
```

## Testing Strategy

### Unit Testing
- **Core Logic**: Test all game rules and state transitions
- **Maze Generation**: Verify solvability and constraint compliance
- **Event System**: Test event emission and subscription
- **Serialization**: Test state save/restore functionality

### Integration Testing
- **Level Loading**: Test various level definition formats
- **Game Flow**: Test complete game sessions from start to finish
- **Error Handling**: Test error conditions and recovery

### Golden Testing
- **Deterministic Behavior**: Record expected outputs for specific seeds
- **Regression Prevention**: Detect unintended changes in game behavior
- **Cross-Platform Consistency**: Ensure identical behavior across platforms

### Performance Testing
- **Memory Usage**: Monitor memory consumption during gameplay
- **CPU Performance**: Profile critical paths like maze generation
- **Garbage Collection**: Minimize object allocation in hot paths

## Implementation Phases

### Phase 1a: Core Foundation
1. Create basic GameCore class with state management
2. Implement event system for core-presentation communication
3. Define level schema and validation
4. Extract maze generation to pure functions

### Phase 1b: Game Logic Migration
1. Move game rules from GameScene to GameCore
2. Implement deterministic player movement
3. Add orb collection and objective tracking
4. Create game completion logic

### Phase 1c: Presentation Refactor
1. Refactor GameScene to be a thin renderer
2. Subscribe to core events for state updates
3. Remove game logic from presentation layer
4. Implement input handling delegation

### Phase 1d: Testing and Validation
1. Add comprehensive unit tests for core logic
2. Implement golden tests for deterministic behavior
3. Add integration tests for level loading
4. Performance profiling and optimization

This design provides a solid foundation for the scalable architecture while maintaining the existing game functionality and user experience.