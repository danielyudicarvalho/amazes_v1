# Implementation Plan

- [x] 1. Set up core module structure and type definitions
  - Create directory structure for core, presentation, and services modules
  - Define TypeScript interfaces for GameState, LevelDefinition, and Events
  - Set up barrel exports for clean module imports
  - _Requirements: 1.1, 7.1, 7.5_

- [x] 2. Implement deterministic random number generator
  - [x] 2.1 Create SeededRandom class with mulberry32 algorithm
    - Write SeededRandom class with constructor accepting seed parameter
    - Implement next(), nextInt(), nextFloat(), and shuffle() methods
    - Add unit tests to verify deterministic behavior with same seeds
    - _Requirements: 2.2, 2.5_

  - [x] 2.2 Replace Math.random() usage in maze generation
    - Update MazeGenerator to use SeededRandom instead of Math.random()
    - Ensure maze generation is deterministic for given seed
    - Add tests to verify identical mazes from same seed
    - _Requirements: 2.1, 2.3_

- [x] 3. Create level definition schema and validation
  - [x] 3.1 Define LevelDefinition interface and types
    - Write comprehensive TypeScript interfaces for level schema
    - Include support for both procedural and handcrafted levels
    - Define objective, constraint, and reward type definitions
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 3.2 Implement level schema validation
    - Create validation functions for level definition structure
    - Add runtime type checking for level properties
    - Implement schema migration support for version compatibility
    - _Requirements: 3.5, 6.4_

  - [x] 3.3 Create sample level definitions
    - Write JSON level definitions for first 10 levels
    - Include mix of procedural and handcrafted examples
    - Test loading and validation of sample levels
    - _Requirements: 3.3, 6.1, 6.2_

- [x] 4. Implement core game state management
  - [x] 4.1 Create immutable GameState structure
    - Define GameState interface with all necessary game data
    - Implement state creation and update functions
    - Ensure state immutability using readonly types and deep cloning
    - _Requirements: 4.1, 4.4, 7.4_

  - [x] 4.2 Implement game state serialization
    - Add toJSON() and fromJSON() methods for GameState
    - Handle serialization of complex objects like Date and Map
    - Test state save/restore functionality
    - _Requirements: 2.4, 4.4_

  - [x] 4.3 Create state validation functions
    - Implement functions to validate game state consistency
    - Add checks for valid player position, orb states, and objectives
    - Create error handling for invalid state conditions
    - _Requirements: 4.2, 4.3, 7.3_

- [x] 5. Build event system for core-presentation communication
  - [x] 5.1 Implement type-safe event emitter
    - Create EventEmitter class with TypeScript generics for type safety
    - Support event subscription, unsubscription, and emission
    - Add error handling for event listener exceptions
    - _Requirements: 5.1, 5.4, 7.5_

  - [x] 5.2 Define game event types and payloads
    - Create comprehensive event type definitions for all game actions
    - Include events for player movement, orb collection, and game completion
    - Add state change events with detailed change information
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.3 Integrate event system with game core
    - Add event emission to all game state changes
    - Ensure events are emitted after state updates are complete
    - Test event emission and payload accuracy
    - _Requirements: 5.5, 1.2_

- [x] 6. Create GameCore class with clean API
  - [x] 6.1 Implement core game engine interface
    - Create GameCore class implementing IGameCore interface
    - Add methods for level initialization, game control, and player actions
    - Implement read-only state access and game status queries
    - _Requirements: 7.1, 7.2, 1.1_

  - [x] 6.2 Add game rule validation and processing
    - Move player movement validation from GameScene to GameCore
    - Implement orb collection logic and objective tracking
    - Add game completion detection and scoring calculation
    - _Requirements: 1.4, 1.5, 7.3_

  - [x] 6.3 Integrate maze generation with core
    - Connect MazeGenerator with GameCore for level initialization
    - Support both procedural and handcrafted level loading
    - Add error handling for maze generation failures
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 7. Extract maze generation to pure functions
  - [x] 7.1 Refactor MazeGen to pure functions
    - Remove side effects from maze generation functions
    - Make all functions accept parameters and return results without mutation
    - Ensure functions are testable without external dependencies
    - _Requirements: 1.1, 1.3, 8.5_

  - [x] 7.2 Add maze validation and solvability checking
    - Implement function to verify maze has valid path from start to goal
    - Add checks for minimum path length and complexity requirements
    - Create validation for orb placement accessibility
    - _Requirements: 8.3, 6.4_

- [x] 8. Implement LevelService for level loading
  - [x] 8.1 Create level loading and caching system
    - Implement LevelService class for managing level definitions
    - Add in-memory caching for frequently accessed levels
    - Support loading levels from JSON files and embedded data
    - _Requirements: 6.1, 6.5_

  - [x] 8.2 Add level generation pipeline
    - Create functions to generate levels from definitions
    - Support both procedural generation and handcrafted layout parsing
    - Add error handling and fallback level generation
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 9. Refactor GameScene to thin presentation layer
  - [x] 9.1 Remove game logic from GameScene
    - Extract all game rules, state management, and validation to GameCore
    - Keep only rendering, input handling, and UI updates in GameScene
    - Ensure GameScene subscribes to core events for state updates
    - _Requirements: 1.1, 1.2, 5.5_

  - [x] 9.2 Implement core event subscription in GameScene
    - Subscribe to all relevant game events from GameCore
    - Update UI elements based on received events
    - Handle event-driven animation and visual feedback
    - _Requirements: 5.5, 1.2_

  - [x] 9.3 Refactor input handling to use core API
    - Change input handlers to call GameCore methods instead of direct state manipulation
    - Validate input through core before applying changes
    - Handle input validation errors gracefully
    - _Requirements: 7.1, 7.3, 1.4_

- [x] 10. Add comprehensive testing suite
  - [x] 10.1 Create unit tests for core game logic
    - Write tests for all GameCore methods and state transitions
    - Test edge cases and boundary conditions for game rules
    - Verify event emission for all game actions
    - _Requirements: 8.1, 8.4_

  - [x] 10.2 Implement golden tests for deterministic behavior
    - Create test cases with known seeds and expected outcomes
    - Record expected maze layouts, game states, and final scores
    - Add regression tests to detect unintended behavior changes
    - _Requirements: 8.2, 2.1, 2.3_

  - [x] 10.3 Add integration tests for level loading
    - Test loading various level definition formats
    - Verify level validation and error handling
    - Test complete game flow from level load to completion
    - _Requirements: 8.3, 6.1, 6.4_

  - [x] 10.4 Create performance and memory tests
    - Profile GameCore performance during typical gameplay
    - Monitor memory usage and garbage collection patterns
    - Add benchmarks for maze generation and state updates
    - _Requirements: 8.5_

- [x] 11. Update existing scenes to use new architecture
  - [x] 11.1 Update LevelSelectScene to use LevelService
    - Modify level selection to load from LevelService instead of hardcoded generation
    - Display level metadata from level definitions
    - Handle level loading errors gracefully
    - _Requirements: 6.1, 6.4_

  - [x] 11.2 Update ProgressManager to work with new level system
    - Modify progress tracking to use level IDs from definitions
    - Update save/load to handle new level identification system
    - Ensure backward compatibility with existing save data
    - _Requirements: 4.1, 4.4_

- [x] 12. Integration and testing
  - [x] 12.1 End-to-end testing of refactored system
    - Test complete game flow from level select to completion
    - Verify all existing functionality works with new architecture
    - Test save/load functionality with new state management
    - _Requirements: 1.1, 4.4, 6.1_

  - [x] 12.2 Performance validation and optimization
    - Profile the refactored system for performance regressions
    - Optimize any performance bottlenecks discovered
    - Ensure memory usage remains within acceptable limits
    - _Requirements: 8.5_

  - [x] 12.3 Documentation and code cleanup
    - Add comprehensive JSDoc comments to all public APIs
    - Create developer documentation for the new architecture
    - Remove deprecated code and clean up imports
    - _Requirements: 7.5_