# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TypeScript knowledge
- Basic understanding of game development concepts

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd labyrinth-leap

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

## Project Structure

```
src/
├── core/                   # Core game logic (framework-agnostic)
│   ├── GameCore.ts        # Main game engine
│   ├── GameState.ts       # State management
│   ├── GameEvents.ts      # Event system
│   ├── LevelDefinition.ts # Level validation
│   ├── types/             # TypeScript type definitions
│   └── __tests__/         # Core logic tests
├── services/              # External services and data management
│   ├── LevelService.ts    # Level loading and caching
│   ├── GameService.ts     # High-level game operations
│   └── EventBus.ts        # Event communication
├── presentation/          # UI and rendering (Phaser-based)
│   ├── GameRenderer.ts    # Game scene rendering
│   ├── UIManager.ts       # UI element management
│   └── InputHandler.ts    # Input processing
├── engine/                # Game algorithms and utilities
│   └── MazeGen.ts         # Maze generation algorithms
├── managers/              # Game state managers
│   └── ProgressManager.ts # Player progress tracking
├── utils/                 # Shared utilities
│   └── rng.ts             # Seeded random number generator
└── data/                  # Game data and assets
    └── levels/            # Level definitions
```

## Development Workflow

### 1. Core Development
When working on core game logic:

```typescript
// Always start with types
interface NewFeature {
  id: string;
  properties: FeatureProperties;
}

// Implement in core layer
class GameCore {
  processNewFeature(feature: NewFeature): FeatureResult {
    // Pure logic, no side effects
    // Emit events for state changes
    // Return results
  }
}

// Add comprehensive tests
describe('NewFeature', () => {
  it('should process feature correctly', () => {
    // Test implementation
  });
});
```

### 2. Event-Driven Updates
For UI updates, use the event system:

```typescript
// In core
this.emit('feature.processed', {
  featureId: feature.id,
  result: processResult
});

// In presentation
gameCore.on('feature.processed', (event) => {
  updateUI(event.result);
});
```

### 3. Level Development
Creating new levels:

```typescript
// Define level schema
const newLevel: LevelDefinition = {
  id: 'level-new',
  version: 1,
  metadata: {
    name: 'New Level',
    difficulty: 'medium',
    estimatedTime: 120,
    tags: ['puzzle', 'medium']
  },
  generation: {
    type: 'procedural', // or 'handcrafted'
    seed: 12345,
    parameters: {
      algorithm: 'recursive_backtrack',
      complexity: 0.6,
      // ... other parameters
    }
  },
  // ... rest of configuration
};

// Validate before use
const validation = LevelValidator.validate(newLevel);
if (!validation.valid) {
  console.error('Level validation failed:', validation.errors);
}
```

## Testing Guidelines

### Unit Tests
- Test all public methods
- Cover edge cases and error conditions
- Use deterministic inputs (seeded random)
- Mock external dependencies

```typescript
describe('GameCore', () => {
  let gameCore: GameCore;
  
  beforeEach(() => {
    gameCore = new GameCore();
  });
  
  it('should initialize level correctly', () => {
    const level = createTestLevel();
    gameCore.initializeLevel(level);
    
    const state = gameCore.getGameState();
    expect(state.levelId).toBe(level.id);
    expect(state.status).toBe('initializing');
  });
});
```

### Integration Tests
- Test complete workflows
- Verify cross-component interaction
- Test error handling and recovery

### Performance Tests
- Benchmark critical operations
- Monitor memory usage
- Test scalability limits

```typescript
it('should handle large mazes efficiently', () => {
  const startTime = performance.now();
  
  gameCore.initializeLevel(largeMazeLevel);
  
  const duration = performance.now() - startTime;
  expect(duration).toBeLessThan(100); // 100ms threshold
});
```

## Code Standards

### TypeScript
- Use strict mode
- Prefer interfaces over types for object shapes
- Use enums for constants
- Avoid `any` type

```typescript
// Good
interface PlayerState {
  position: Position;
  health: number;
  inventory: Item[];
}

// Avoid
let playerData: any = {
  position: { x: 0, y: 0 },
  health: 100
};
```

### Error Handling
- Use custom error types
- Provide meaningful error messages
- Handle errors at appropriate boundaries

```typescript
class LevelLoadError extends Error {
  constructor(levelId: string, cause: string) {
    super(`Failed to load level ${levelId}: ${cause}`);
    this.name = 'LevelLoadError';
  }
}
```

### Documentation
- Use JSDoc for all public APIs
- Include examples in documentation
- Document complex algorithms
- Keep README files updated

```typescript
/**
 * Moves the player in the specified direction.
 * 
 * @param direction - The direction to move ('up', 'down', 'left', 'right')
 * @returns Result indicating success/failure and new position
 * 
 * @example
 * ```typescript
 * const result = gameCore.movePlayer('right');
 * if (result.success) {
 *   console.log('Moved to:', result.newPosition);
 * }
 * ```
 */
movePlayer(direction: Direction): MoveResult {
  // Implementation
}
```

## Performance Guidelines

### Optimization Principles
1. **Measure First**: Profile before optimizing
2. **Avoid Premature Optimization**: Focus on correctness first
3. **Cache Wisely**: Cache expensive computations
4. **Minimize Allocations**: Reuse objects when possible

### Memory Management
```typescript
// Good: Reuse objects
const tempPosition = { x: 0, y: 0 };
function updatePosition(x: number, y: number) {
  tempPosition.x = x;
  tempPosition.y = y;
  return tempPosition;
}

// Avoid: Creating new objects frequently
function updatePosition(x: number, y: number) {
  return { x, y }; // New object every call
}
```

### Event System Performance
```typescript
// Good: Specific event subscriptions
gameCore.on('player.moved', handlePlayerMove);

// Avoid: Broad event subscriptions
gameCore.on('state.changed', handleAnyStateChange);
```

## Debugging

### Debug Tools
- Browser DevTools for performance profiling
- Console logging with structured data
- State inspection utilities
- Event tracing

### Common Issues
1. **State Mutations**: Ensure immutability
2. **Memory Leaks**: Unsubscribe from events
3. **Performance**: Profile hot paths
4. **Race Conditions**: Use proper async patterns

### Debug Logging
```typescript
// Use structured logging
console.log('Player moved', {
  from: oldPosition,
  to: newPosition,
  timestamp: Date.now(),
  levelId: currentLevel.id
});
```

## Contributing

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Run full test suite
5. Submit PR with clear description

### Code Review Checklist
- [ ] Tests cover new functionality
- [ ] Documentation is updated
- [ ] Performance impact considered
- [ ] Error handling implemented
- [ ] TypeScript types are correct
- [ ] No breaking changes (or properly documented)

### Commit Messages
Use conventional commit format:
```
feat: add new maze generation algorithm
fix: resolve memory leak in event system
docs: update API documentation
test: add performance tests for large mazes
```

## Deployment

### Build Process
```bash
# Run tests
npm test

# Build for production
npm run build

# Verify build
npm run preview
```

### Environment Configuration
- Development: Full debugging, hot reload
- Testing: Automated test execution
- Production: Optimized build, error reporting

## Troubleshooting

### Common Development Issues

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm install

# Check TypeScript configuration
npx tsc --noEmit
```

#### Test Failures
```bash
# Run specific test file
npm test -- GameCore.test.ts

# Run tests in watch mode
npm test -- --watch

# Debug test with verbose output
npm test -- --reporter=verbose
```

#### Performance Issues
```bash
# Profile with Chrome DevTools
npm run dev
# Open Chrome DevTools > Performance tab

# Run performance tests
npm test -- performance.test.ts
```

### Getting Help
- Check existing issues and documentation
- Run tests to verify setup
- Use TypeScript compiler for type checking
- Profile performance issues before reporting

## Best Practices Summary

1. **Separation of Concerns**: Keep core logic separate from presentation
2. **Immutability**: Use immutable state patterns
3. **Event-Driven**: Communicate through events, not direct calls
4. **Type Safety**: Leverage TypeScript's type system
5. **Testing**: Write tests for all new functionality
6. **Documentation**: Keep documentation current and comprehensive
7. **Performance**: Profile and optimize critical paths
8. **Error Handling**: Handle errors gracefully with meaningful messages