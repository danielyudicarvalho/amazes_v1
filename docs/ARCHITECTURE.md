# Labyrinth Leap - Architecture Documentation

## Overview

This document describes the architecture of the Labyrinth Leap maze game after the Phase 1 core architecture refactoring. The system has been redesigned to provide clean separation between game logic and presentation, deterministic behavior, and scalable level management.

## Architecture Principles

### 1. Separation of Concerns
- **Core Layer**: Pure game logic, deterministic and framework-agnostic
- **Presentation Layer**: UI rendering and user interaction (Phaser-based)
- **Service Layer**: Data management, level loading, and external integrations

### 2. Event-Driven Communication
- Core emits events for state changes
- Presentation layer subscribes to events for UI updates
- Loose coupling between layers

### 3. Deterministic Behavior
- Seeded random number generation
- Reproducible game states
- Support for replays and testing

### 4. Immutable State Management
- Game state is immutable
- State changes create new state objects
- Predictable state transitions

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ GameScene   │  │ UIManager   │  │ InputHandler        │  │
│  │ (Phaser)    │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                         Event Bus
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ LevelService│  │ GameService │  │ ProgressManager     │  │
│  │             │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                         Core API
                              │
┌─────────────────────────────────────────────────────────────┐
│                       Core Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ GameCore    │  │ GameState   │  │ GameEvents          │  │
│  │             │  │ Manager     │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ MazeGen     │  │ LevelDef    │  │ SeededRandom        │  │
│  │             │  │ Validator   │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### GameCore
The central game engine that manages all game logic and state.

**Responsibilities:**
- Level initialization and maze generation
- Player movement validation and processing
- Objective tracking and completion detection
- Score calculation and timing
- Event emission for state changes

**Key Features:**
- Deterministic behavior with seeded RNG
- Immutable state management
- Type-safe event system
- Comprehensive error handling

### GameState
Immutable data structure representing the complete game state.

**Structure:**
```typescript
interface GameState {
  // Level information
  levelId: string;
  levelConfig: LevelDefinition;
  
  // Game status
  status: 'initializing' | 'playing' | 'paused' | 'completed' | 'failed';
  startTime: number;
  currentTime: number;
  
  // Player state
  player: {
    position: Position;
    inventory: InventoryItem[];
    stats: PlayerStats;
  };
  
  // World state
  maze: MazeCell[][];
  orbs: OrbState[];
  powerups: PowerupState[];
  
  // Progress tracking
  objectives: ObjectiveProgress[];
  score: number;
  moves: number;
}
```

### LevelService
Manages level loading, caching, and generation.

**Features:**
- JSON-based level definitions
- Support for procedural and handcrafted levels
- Level validation and schema migration
- Intelligent caching with LRU eviction
- Batch loading for performance

### Event System
Type-safe event system for core-presentation communication.

**Event Types:**
- `game.*` - Game lifecycle events (started, paused, completed)
- `player.*` - Player action events (moved, collected orb)
- `level.*` - Level events (generated, loaded)
- `state.*` - State change events
- `error.*` - Error and debug events

## Level System

### Level Definition Schema
Levels are defined using a flexible JSON schema supporting both procedural generation and handcrafted layouts.

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

### Procedural Generation
Uses deterministic algorithms to generate mazes:
- **Recursive Backtrack**: Creates mazes with long winding paths
- **Prim's Algorithm**: Generates mazes with shorter, more branched paths
- **Configurable Parameters**: Complexity, branching factor, dead-end ratio

### Handcrafted Levels
Allows designers to create custom layouts:
- Direct maze cell specification
- Precise orb and powerup placement
- Custom start and goal positions
- Special cell properties and triggers

## State Management

### Immutability
All game state is immutable to ensure:
- Predictable state transitions
- Easy debugging and testing
- Support for undo/redo functionality
- Thread safety for future enhancements

### State Transitions
State changes follow a strict pattern:
1. Validate input action
2. Calculate new state
3. Emit relevant events
4. Return result to caller

### Serialization
Game state can be serialized for:
- Save/load functionality
- Network synchronization
- Replay systems
- Debug snapshots

## Performance Considerations

### Optimization Strategies
1. **Efficient Maze Representation**: Bit-packed wall data
2. **Object Pooling**: Reuse objects for frequent operations
3. **Lazy Evaluation**: Defer expensive calculations
4. **Caching**: Level definitions and generated content
5. **Event Batching**: Group related events to reduce overhead

### Memory Management
- Automatic cleanup on level transitions
- Weak references for event listeners
- Garbage collection friendly patterns
- Memory usage monitoring in development

### Scalability
The architecture supports:
- Thousands of levels through efficient loading
- Large maze sizes (tested up to 100x100)
- Multiple concurrent game instances
- Real-time multiplayer (future enhancement)

## Testing Strategy

### Unit Testing
- Core game logic with 100% coverage
- Deterministic behavior validation
- Edge case and boundary testing
- Performance regression detection

### Integration Testing
- Complete game flow testing
- Level loading and generation
- Save/load functionality
- Cross-component interaction

### Performance Testing
- Initialization time benchmarks
- Runtime operation profiling
- Memory usage validation
- Scalability testing

## Development Guidelines

### Code Organization
```
src/
├── core/           # Pure game logic
│   ├── GameCore.ts
│   ├── GameState.ts
│   ├── GameEvents.ts
│   └── types/
├── services/       # Data and external services
│   ├── LevelService.ts
│   └── GameService.ts
├── presentation/   # UI and rendering
│   ├── GameRenderer.ts
│   └── UIManager.ts
├── engine/         # Algorithms and utilities
│   └── MazeGen.ts
└── utils/          # Shared utilities
    └── rng.ts
```

### Coding Standards
- TypeScript strict mode enabled
- Comprehensive JSDoc documentation
- Consistent naming conventions
- Error handling at all boundaries
- Performance-conscious implementations

### Adding New Features
1. Define types in appropriate type files
2. Implement core logic in core layer
3. Add event types if needed
4. Update presentation layer to handle events
5. Add comprehensive tests
6. Update documentation

## Future Enhancements

### Planned Features
- **Multiplayer Support**: Real-time collaborative gameplay
- **Level Editor**: In-game level creation tools
- **Analytics**: Player behavior tracking and analysis
- **A/B Testing**: Dynamic level parameter testing
- **Cloud Sync**: Cross-device progress synchronization

### Architecture Evolution
- **Microservices**: Split services for scalability
- **WebAssembly**: Performance-critical algorithms
- **Web Workers**: Background processing
- **Progressive Web App**: Enhanced mobile experience

## Troubleshooting

### Common Issues
1. **Performance Degradation**: Check for memory leaks and inefficient algorithms
2. **State Inconsistency**: Verify immutability patterns and event ordering
3. **Level Loading Failures**: Validate level definitions and check file paths
4. **Event System Issues**: Ensure proper subscription/unsubscription

### Debugging Tools
- Performance profiler integration
- State inspection utilities
- Event tracing capabilities
- Memory usage monitoring

### Monitoring
- Performance metrics collection
- Error reporting and logging
- User behavior analytics
- System health monitoring

## Conclusion

The Phase 1 architecture provides a solid foundation for the Labyrinth Leap game with clean separation of concerns, deterministic behavior, and excellent scalability. The event-driven design enables easy extension and modification while maintaining system integrity and performance.