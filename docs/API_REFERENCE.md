# API Reference

## GameCore

The main game engine class providing core game functionality.

### Constructor

```typescript
new GameCore()
```

Creates a new GameCore instance with initialized event system.

### Methods

#### `initializeLevel(levelDefinition: LevelDefinition, seed?: number): void`

Initializes a new game level from a level definition.

**Parameters:**
- `levelDefinition` - The level configuration
- `seed` - Optional seed for deterministic generation

**Throws:** Error if level definition is invalid

**Example:**
```typescript
const level = await levelService.loadLevel('level-001');
gameCore.initializeLevel(level, 12345);
```

#### `startGame(): void`

Starts the game, transitioning to 'playing' state.

**Example:**
```typescript
gameCore.startGame();
console.log(gameCore.getGameState().status); // 'playing'
```

#### `pauseGame(): void`

Pauses the game, preserving current state.

#### `resumeGame(): void`

Resumes a paused game.

#### `resetGame(): void`

Resets the current level to initial state.

#### `movePlayer(direction: Direction): MoveResult`

Attempts to move the player in the specified direction.

**Parameters:**
- `direction` - 'up', 'down', 'left', or 'right'

**Returns:** `MoveResult` object with success status and details

**Example:**
```typescript
const result = gameCore.movePlayer('right');
if (result.success) {
  console.log('Player moved successfully');
} else {
  console.log('Move blocked:', result.reason);
}
```

#### `collectOrb(orbId: string): CollectionResult`

Attempts to collect an orb at the player's position.

**Parameters:**
- `orbId` - Unique identifier of the orb

**Returns:** `CollectionResult` with success status and points awarded

#### `getGameState(): Readonly<GameState>`

Gets the current game state as an immutable object.

**Returns:** Complete game state snapshot

#### `isGameComplete(): boolean`

Checks if the game is complete (won or lost).

**Returns:** True if all objectives are met or game failed

#### `getScore(): number`

Gets the current player score.

#### `getCurrentTime(): number`

Gets elapsed game time in milliseconds (excluding pauses).

### Event Methods

#### `on<T extends GameEventType>(event: T, callback: EventCallback<T>): void`

Subscribes to a game event.

**Example:**
```typescript
gameCore.on('player.moved', (event) => {
  console.log(`Player moved from ${event.from.x},${event.from.y} to ${event.to.x},${event.to.y}`);
});
```

#### `off<T extends GameEventType>(event: T, callback: EventCallback<T>): void`

Unsubscribes from a game event.

#### `once<T extends GameEventType>(event: T, callback: EventCallback<T>): void`

Subscribes to an event for a single occurrence.

## LevelService

Service for loading and managing game levels.

### Constructor

```typescript
new LevelService(maxCacheSize?: number)
```

**Parameters:**
- `maxCacheSize` - Maximum number of levels to cache (default: 100)

### Methods

#### `loadLevel(levelId: string, options?: LevelLoadOptions): Promise<LevelDefinition>`

Loads a level definition by ID.

**Parameters:**
- `levelId` - Unique level identifier
- `options` - Optional loading configuration

**Returns:** Promise resolving to level definition

**Example:**
```typescript
const level = await levelService.loadLevel('level-001');
console.log(level.metadata.name);
```

#### `loadLevels(levelIds: string[], options?: LevelLoadOptions): Promise<LevelDefinition[]>`

Loads multiple levels in parallel.

#### `listAvailableLevels(): Promise<string[]>`

Gets list of available level IDs.

#### `generateLevel(levelDefinition: LevelDefinition, seed?: number): Promise<GeneratedLevel>`

Generates a complete level with maze and orb placement.

**Returns:** Promise resolving to generated level data

#### `validateLevel(levelDefinition: any): ValidationResult`

Validates a level definition against the schema.

#### `getCachedLevel(levelId: string): LevelDefinition | null`

Gets a cached level if available.

#### `clearCache(): void`

Clears the level cache.

#### `getCacheStats(): CacheStats`

Gets cache performance statistics.

## ProgressManager

Manages player progress and statistics.

### Static Methods

#### `getInstance(): ProgressManager`

Gets the singleton ProgressManager instance.

### Methods

#### `getCurrentLevel(): number`

Gets the current level number (legacy support).

#### `getHighestLevel(): number`

Gets the highest unlocked level number.

#### `isLevelUnlocked(levelId: string | number): boolean`

Checks if a level is unlocked.

#### `unlockLevel(levelId: string): void`

Unlocks a specific level.

#### `completeLevel(levelId: string, time: number, stars: number): void`

Records level completion.

**Parameters:**
- `levelId` - Level identifier
- `time` - Completion time in milliseconds
- `stars` - Stars earned (1-3)

#### `getLevelStats(levelId: string): LevelStatsV2`

Gets statistics for a specific level.

#### `getTotalStars(): number`

Gets total stars earned across all levels.

## Types

### GameState

```typescript
interface GameState {
  levelId: string;
  levelConfig: LevelDefinition;
  status: 'initializing' | 'playing' | 'paused' | 'completed' | 'failed';
  startTime: number;
  currentTime: number;
  player: {
    position: Position;
    inventory: InventoryItem[];
    stats: PlayerStats;
  };
  maze: MazeCell[][];
  orbs: OrbState[];
  powerups: PowerupState[];
  objectives: ObjectiveProgress[];
  score: number;
  moves: number;
}
```

### LevelDefinition

```typescript
interface LevelDefinition {
  id: string;
  version: number;
  metadata: {
    name: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    estimatedTime: number;
    tags: string[];
  };
  generation: {
    type: 'procedural' | 'handcrafted';
    seed?: number;
    parameters?: ProceduralParameters;
    layout?: HandcraftedLayout;
  };
  config: {
    boardSize: { width: number; height: number };
    objectives: Objective[];
    constraints: Constraint[];
    powerups: PowerupConfig[];
  };
  progression: {
    starThresholds: StarThreshold[];
    rewards: Reward[];
    unlocks: string[];
  };
}
```

### MoveResult

```typescript
interface MoveResult {
  success: boolean;
  newPosition?: Position;
  reason?: string;
  blockedBy?: 'wall' | 'boundary' | 'obstacle';
  triggeredEvents?: string[];
}
```

### CollectionResult

```typescript
interface CollectionResult {
  success: boolean;
  orbId?: string;
  pointsAwarded?: number;
  reason?: string;
  objectivesCompleted?: string[];
}
```

## Events

### Game Events

#### `game.initialized`
Emitted when a level is successfully initialized.

**Payload:**
```typescript
{
  levelId: string;
  seed: number;
  generationTime: number;
}
```

#### `game.started`
Emitted when the game starts.

**Payload:**
```typescript
{
  timestamp: number;
}
```

#### `game.paused`
Emitted when the game is paused.

#### `game.completed`
Emitted when the game is completed.

**Payload:**
```typescript
{
  result: 'won' | 'lost';
  score: number;
  time: number;
  stars: number;
}
```

### Player Events

#### `player.moved`
Emitted when the player moves.

**Payload:**
```typescript
{
  from: Position;
  to: Position;
  direction: Direction;
  valid: boolean;
}
```

#### `orb.collected`
Emitted when an orb is collected.

**Payload:**
```typescript
{
  orbId: string;
  position: Position;
  value: number;
  totalScore: number;
}
```

### State Events

#### `state.changed`
Emitted when game state changes.

**Payload:**
```typescript
{
  changes: StateChange[];
  newState: GameState;
}
```

## Error Handling

### Error Types

All errors extend the base `GameError` class:

```typescript
abstract class GameError extends Error {
  abstract code: string;
  abstract recoverable: boolean;
}
```

#### `InvalidMoveError`
Thrown when an invalid move is attempted.

#### `LevelLoadError`
Thrown when level loading fails.

#### `ValidationError`
Thrown when data validation fails.

### Error Events

The system emits error events for non-fatal errors:

```typescript
gameCore.on('error', (event) => {
  console.error(`Error: ${event.error.message}`);
  if (event.recoverable) {
    // Handle recoverable error
  }
});
```

## Performance Considerations

### Optimization Tips

1. **Cache Levels**: Use LevelService caching for frequently accessed levels
2. **Batch Operations**: Group multiple state changes when possible
3. **Event Cleanup**: Always unsubscribe from events to prevent memory leaks
4. **State Access**: Minimize calls to `getGameState()` in tight loops

### Memory Management

```typescript
// Good: Store reference and reuse
const state = gameCore.getGameState();
const maze = state.maze;

// Bad: Multiple state accesses
for (let i = 0; i < gameCore.getGameState().maze.length; i++) {
  // Process gameCore.getGameState().maze[i]
}
```

### Event Performance

```typescript
// Good: Specific event subscription
gameCore.on('player.moved', handler);

// Avoid: Subscribing to high-frequency events unnecessarily
gameCore.on('state.changed', handler); // Emitted on every state change
```

## Migration Guide

### From Legacy System

1. **Replace direct state access** with `getGameState()`
2. **Use event system** instead of polling for changes
3. **Update level definitions** to new schema format
4. **Replace Math.random()** with seeded random for deterministic behavior

### Breaking Changes

- Game state is now immutable
- Events are required for UI updates
- Level definitions use new schema
- Progress tracking uses string IDs instead of numbers