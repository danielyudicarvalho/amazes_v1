import { describe, it, expect } from 'vitest';
import { 
  genMaze, 
  generateMaze, 
  validateMaze, 
  validateOrbPlacements, 
  findShortestPath, 
  getReachablePositions,
  Cell, 
  MazeGenerationOptions 
} from './MazeGen';
import { SeededRandom } from '../utils/rng';

describe('MazeGen', () => {
  describe('deterministic maze generation', () => {
    it('should generate identical mazes for same seed', () => {
      const seed = 12345;
      const width = 5;
      const height = 5;

      // Generate first maze
      const rng1 = new SeededRandom(seed);
      const maze1 = genMaze(width, height, () => rng1.next());

      // Generate second maze with same seed
      const rng2 = new SeededRandom(seed);
      const maze2 = genMaze(width, height, () => rng2.next());

      expect(maze1).toEqual(maze2);
    });

    it('should generate different mazes for different seeds', () => {
      const width = 5;
      const height = 5;

      // Generate first maze
      const rng1 = new SeededRandom(12345);
      const maze1 = genMaze(width, height, () => rng1.next());

      // Generate second maze with different seed
      const rng2 = new SeededRandom(54321);
      const maze2 = genMaze(width, height, () => rng2.next());

      expect(maze1).not.toEqual(maze2);
    });

    it('should generate valid maze structure', () => {
      const width = 7;
      const height = 7;
      const rng = new SeededRandom(999);
      const maze = genMaze(width, height, () => rng.next());

      // Check dimensions
      expect(maze).toHaveLength(height);
      expect(maze[0]).toHaveLength(width);

      // Check that all cells are valid bit masks (0-15)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const cell = maze[y][x];
          expect(cell).toBeGreaterThanOrEqual(0);
          expect(cell).toBeLessThanOrEqual(15); // Max value for 4-bit mask
        }
      }
    });

    it('should create connected maze (basic connectivity test)', () => {
      const width = 5;
      const height = 5;
      const rng = new SeededRandom(777);
      const maze = genMaze(width, height, () => rng.next());

      // Count total connections (walls removed)
      let totalConnections = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const cell = maze[y][x];
          // Count set bits (connections)
          totalConnections += countSetBits(cell);
        }
      }

      // A connected maze should have at least (width * height - 1) connections
      // This is the minimum for a spanning tree
      const minConnections = (width * height - 1) * 2; // Each connection counted twice
      expect(totalConnections).toBeGreaterThanOrEqual(minConnections);
    });

    it('should be reproducible across multiple generations', () => {
      const seed = 42;
      const width = 6;
      const height = 6;
      const generations = 5;

      const mazes: Cell[][][] = [];

      // Generate multiple mazes with same seed
      for (let i = 0; i < generations; i++) {
        const rng = new SeededRandom(seed);
        const maze = genMaze(width, height, () => rng.next());
        mazes.push(maze);
      }

      // All mazes should be identical
      for (let i = 1; i < generations; i++) {
        expect(mazes[i]).toEqual(mazes[0]);
      }
    });

    it('should handle different maze sizes deterministically', () => {
      const seed = 555;
      const sizes = [
        { width: 3, height: 3 },
        { width: 5, height: 7 },
        { width: 10, height: 8 },
        { width: 15, height: 15 }
      ];

      for (const size of sizes) {
        // Generate maze twice with same parameters
        const rng1 = new SeededRandom(seed);
        const maze1 = genMaze(size.width, size.height, () => rng1.next());

        const rng2 = new SeededRandom(seed);
        const maze2 = genMaze(size.width, size.height, () => rng2.next());

        expect(maze1).toEqual(maze2);
        expect(maze1).toHaveLength(size.height);
        expect(maze1[0]).toHaveLength(size.width);
      }
    });

    it('should work with edge case sizes', () => {
      const seed = 123;

      // Test 1x1 maze
      const rng1 = new SeededRandom(seed);
      const maze1x1 = genMaze(1, 1, () => rng1.next());
      expect(maze1x1).toHaveLength(1);
      expect(maze1x1[0]).toHaveLength(1);
      expect(maze1x1[0][0]).toBe(0); // Single cell should have no connections

      // Test 1x5 maze (single row)
      const rng2 = new SeededRandom(seed);
      const maze1x5 = genMaze(1, 5, () => rng2.next());
      expect(maze1x5).toHaveLength(5);
      expect(maze1x5[0]).toHaveLength(1);

      // Test 5x1 maze (single column)
      const rng3 = new SeededRandom(seed);
      const maze5x1 = genMaze(5, 1, () => rng3.next());
      expect(maze5x1).toHaveLength(1);
      expect(maze5x1[0]).toHaveLength(5);
    });
  });

  describe('maze validation', () => {
    it('should have symmetric connections between adjacent cells', () => {
      const width = 4;
      const height = 4;
      const rng = new SeededRandom(888);
      const maze = genMaze(width, height, () => rng.next());

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const cell = maze[y][x];

          // Check East connection
          if (x < width - 1 && (cell & 1)) { // Has East wall removed
            const eastCell = maze[y][x + 1];
            expect(eastCell & 4).toBeTruthy(); // East cell should have West wall removed
          }

          // Check South connection
          if (y < height - 1 && (cell & 2)) { // Has South wall removed
            const southCell = maze[y + 1][x];
            expect(southCell & 8).toBeTruthy(); // South cell should have North wall removed
          }

          // Check West connection
          if (x > 0 && (cell & 4)) { // Has West wall removed
            const westCell = maze[y][x - 1];
            expect(westCell & 1).toBeTruthy(); // West cell should have East wall removed
          }

          // Check North connection
          if (y > 0 && (cell & 8)) { // Has North wall removed
            const northCell = maze[y - 1][x];
            expect(northCell & 2).toBeTruthy(); // North cell should have South wall removed
          }
        }
      }
    });
  });

  describe('pure function interface', () => {
    it('should generate maze with options object', () => {
      const options: MazeGenerationOptions = {
        width: 5,
        height: 5,
        algorithm: 'prim'
      };
      const rng = new SeededRandom(12345);
      const result = generateMaze(options, () => rng.next());

      expect(result.maze).toHaveLength(5);
      expect(result.maze[0]).toHaveLength(5);
      expect(result.metadata.width).toBe(5);
      expect(result.metadata.height).toBe(5);
      expect(result.metadata.algorithm).toBe('prim');
      expect(result.metadata.totalCells).toBe(25);
    });

    it('should accept custom start position', () => {
      const options: MazeGenerationOptions = {
        width: 7,
        height: 7,
        startPosition: { x: 3, y: 3 }
      };
      const rng = new SeededRandom(54321);
      const result = generateMaze(options, () => rng.next());

      expect(result.metadata.startPosition).toEqual({ x: 3, y: 3 });
    });

    it('should validate maze options', () => {
      const rng = new SeededRandom(123);

      // Test invalid dimensions
      expect(() => generateMaze({ width: 0, height: 5 }, () => rng.next()))
        .toThrow('Maze dimensions must be positive');
      
      expect(() => generateMaze({ width: 5, height: -1 }, () => rng.next()))
        .toThrow('Maze dimensions must be positive');

      expect(() => generateMaze({ width: 3.5, height: 5 }, () => rng.next()))
        .toThrow('Maze dimensions must be integers');

      // Test invalid start position
      expect(() => generateMaze({ 
        width: 5, 
        height: 5, 
        startPosition: { x: 10, y: 3 } 
      }, () => rng.next()))
        .toThrow('Start position is outside maze bounds');
    });

    it('should be deterministic with same options and RNG', () => {
      const options: MazeGenerationOptions = {
        width: 6,
        height: 6,
        algorithm: 'prim',
        startPosition: { x: 2, y: 2 }
      };

      const rng1 = new SeededRandom(999);
      const result1 = generateMaze(options, () => rng1.next());

      const rng2 = new SeededRandom(999);
      const result2 = generateMaze(options, () => rng2.next());

      expect(result1.maze).toEqual(result2.maze);
      expect(result1.metadata).toEqual(result2.metadata);
    });

    it('should maintain backward compatibility with genMaze', () => {
      const seed = 777;
      const width = 4;
      const height = 4;

      // Generate with old function
      const rng1 = new SeededRandom(seed);
      const oldMaze = genMaze(width, height, () => rng1.next());

      // Generate with new function
      const rng2 = new SeededRandom(seed);
      const newResult = generateMaze({ width, height }, () => rng2.next());

      expect(newResult.maze).toEqual(oldMaze);
    });

    it('should count connected cells correctly', () => {
      const options: MazeGenerationOptions = {
        width: 3,
        height: 3
      };
      const rng = new SeededRandom(456);
      const result = generateMaze(options, () => rng.next());

      // In a connected maze, all cells should have at least one connection
      // except possibly isolated cells (which shouldn't exist in a proper maze)
      expect(result.metadata.connectedCells).toBeGreaterThan(0);
      expect(result.metadata.connectedCells).toBeLessThanOrEqual(result.metadata.totalCells);
    });

    it('should handle edge cases without side effects', () => {
      const rng = new SeededRandom(111);
      
      // Test 1x1 maze
      const result1x1 = generateMaze({ width: 1, height: 1 }, () => rng.next());
      expect(result1x1.maze[0][0]).toBe(0); // Single cell has no connections
      expect(result1x1.metadata.connectedCells).toBe(0);

      // Test that RNG state is not affected by previous calls
      const rng2 = new SeededRandom(111);
      const result1x1Again = generateMaze({ width: 1, height: 1 }, () => rng2.next());
      expect(result1x1Again.maze).toEqual(result1x1.maze);
    });
  });

  describe('maze validation and solvability', () => {
    it('should validate a correct maze structure', () => {
      // Create a simple connected maze: 
      // (0,0)---(1,0)---(2,0)
      //   |               |
      // (0,1)           (2,1)
      const maze: Cell[][] = [
        [3, 5, 6],  // [EW, EW, WS] - top row connected horizontally, (2,0) connects south
        [8, 0, 8]   // [N, isolated, N] - (0,1) connects north, (2,1) connects north
      ];
      
      const result = validateMaze(maze, { x: 0, y: 0 }, { x: 2, y: 1 });
      
      expect(result.isValid).toBe(true);
      expect(result.isSolvable).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.pathLength).toBeGreaterThan(0);
    });

    it('should detect invalid maze structure', () => {
      // Test empty maze
      const emptyMaze: Cell[][] = [];
      const result1 = validateMaze(emptyMaze, { x: 0, y: 0 }, { x: 1, y: 1 });
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Maze is empty');

      // Test inconsistent row width
      const inconsistentMaze: Cell[][] = [
        [1, 2],
        [4, 8, 1] // Different width
      ];
      const result2 = validateMaze(inconsistentMaze, { x: 0, y: 0 }, { x: 1, y: 1 });
      expect(result2.isValid).toBe(false);
      expect(result2.errors.some(e => e.includes('inconsistent width'))).toBe(true);

      // Test invalid cell values
      const invalidMaze: Cell[][] = [
        [1, 16], // 16 is invalid (max is 15)
        [4, 8]
      ];
      const result3 = validateMaze(invalidMaze, { x: 0, y: 0 }, { x: 1, y: 1 });
      expect(result3.isValid).toBe(false);
      expect(result3.errors.some(e => e.includes('Invalid cell value'))).toBe(true);
    });

    it('should detect asymmetric connections', () => {
      const asymmetricMaze: Cell[][] = [
        [1, 0], // East connection without reciprocal West
        [0, 0]
      ];
      
      const result = validateMaze(asymmetricMaze, { x: 0, y: 0 }, { x: 1, y: 0 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Asymmetric'))).toBe(true);
    });

    it('should detect unsolvable mazes', () => {
      const unsolvableMaze: Cell[][] = [
        [0, 0], // No connections
        [0, 0]
      ];
      
      const result = validateMaze(unsolvableMaze, { x: 0, y: 0 }, { x: 1, y: 1 });
      expect(result.isValid).toBe(false);
      expect(result.isSolvable).toBe(false);
      expect(result.errors).toContain('No path exists from start to goal');
    });

    it('should validate positions are within bounds', () => {
      const maze: Cell[][] = [
        [1, 5],
        [4, 8]
      ];
      
      // Test invalid start position
      const result1 = validateMaze(maze, { x: 5, y: 0 }, { x: 1, y: 1 });
      expect(result1.isValid).toBe(false);
      expect(result1.errors.some(e => e.includes('Start position'))).toBe(true);

      // Test invalid goal position
      const result2 = validateMaze(maze, { x: 0, y: 0 }, { x: 1, y: 5 });
      expect(result2.isValid).toBe(false);
      expect(result2.errors.some(e => e.includes('Goal position'))).toBe(true);
    });

    it('should enforce minimum requirements', () => {
      // Create a simple 2x2 maze with short path
      const simpleMaze: Cell[][] = [
        [1, 4],
        [0, 0]
      ];
      
      const options = {
        minPathLength: 5,
        minComplexity: 3,
        minReachableCells: 4
      };
      
      const result = validateMaze(simpleMaze, { x: 0, y: 0 }, { x: 1, y: 0 }, options);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Path length'))).toBe(true);
      expect(result.errors.some(e => e.includes('Complexity'))).toBe(true);
      expect(result.errors.some(e => e.includes('Reachable cells'))).toBe(true);
    });

    it('should find shortest path correctly', () => {
      // Create a simple horizontal path: (0,0)---(1,0)---(2,0)
      const maze: Cell[][] = [
        [1, 5, 4], // [E, EW, W] - horizontal connection across top row
        [0, 0, 0]  // [none, none, none] - bottom row isolated
      ];
      
      const path = findShortestPath(maze, { x: 0, y: 0 }, { x: 2, y: 0 });
      expect(path).toHaveLength(3);
      expect(path[0]).toEqual({ x: 0, y: 0 });
      expect(path[1]).toEqual({ x: 1, y: 0 });
      expect(path[2]).toEqual({ x: 2, y: 0 });
    });

    it('should return empty path for unreachable goal', () => {
      const maze: Cell[][] = [
        [0, 0], // No connections
        [0, 0]
      ];
      
      const path = findShortestPath(maze, { x: 0, y: 0 }, { x: 1, y: 1 });
      expect(path).toHaveLength(0);
    });

    it('should get all reachable positions', () => {
      const maze: Cell[][] = [
        [3, 4, 0], // [EW, W, isolated]
        [8, 0, 0]  // [N, isolated, isolated]
      ];
      
      const reachable = getReachablePositions(maze, { x: 0, y: 0 });
      expect(reachable.size).toBe(3); // (0,0), (1,0), (0,1)
      expect(reachable.has('0,0')).toBe(true);
      expect(reachable.has('1,0')).toBe(true);
      expect(reachable.has('0,1')).toBe(true);
      expect(reachable.has('2,0')).toBe(false); // Isolated
    });

    it('should validate orb placements', () => {
      const maze: Cell[][] = [
        [3, 4, 0], // [EW, W, isolated]
        [8, 0, 0]  // [N, isolated, isolated]
      ];
      
      const orbPositions = [
        { x: 0, y: 0 }, // Accessible
        { x: 1, y: 0 }, // Accessible
        { x: 2, y: 0 }, // Inaccessible
        { x: 1, y: 1 }  // Inaccessible
      ];
      
      const result = validateOrbPlacements(maze, { x: 0, y: 0 }, orbPositions);
      expect(result.allAccessible).toBe(false);
      expect(result.totalOrbs).toBe(4);
      expect(result.accessibleOrbs).toBe(2);
      expect(result.inaccessibleOrbs).toHaveLength(2);
      expect(result.inaccessibleOrbs).toContainEqual({ x: 2, y: 0 });
      expect(result.inaccessibleOrbs).toContainEqual({ x: 1, y: 1 });
    });

    it('should calculate path complexity correctly', () => {
      // Create a maze with a winding path that requires direction changes
      // Path: (0,0) -> (1,0) -> (1,1) -> (2,1)
      const maze: Cell[][] = [
        [1, 6, 0], // [E, WS, none] - (0,0) connects east, (1,0) connects west and south
        [0, 11, 4] // [none, EWN, W] - (1,1) connects east, west, and north; (2,1) connects west
      ];
      
      const result = validateMaze(maze, { x: 0, y: 0 }, { x: 2, y: 1 });
      
      expect(result.isSolvable).toBe(true);
      expect(result.complexity).toBeGreaterThan(0); // Should have direction changes
    });

    it('should work with generated mazes', () => {
      const rng = new SeededRandom(12345);
      const maze = genMaze(5, 5, () => rng.next());
      
      const result = validateMaze(maze, { x: 0, y: 0 }, { x: 4, y: 4 });
      expect(result.isValid).toBe(true);
      expect(result.isSolvable).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.reachableCells).toBeGreaterThan(0);
    });

    it('should handle edge cases gracefully', () => {
      // Single cell maze
      const singleCell: Cell[][] = [[0]];
      const result1 = validateMaze(singleCell, { x: 0, y: 0 }, { x: 0, y: 0 });
      expect(result1.isValid).toBe(true);
      expect(result1.isSolvable).toBe(true);
      expect(result1.pathLength).toBe(0);

      // 1x2 maze with connection
      const linearMaze: Cell[][] = [[1, 4]];
      const result2 = validateMaze(linearMaze, { x: 0, y: 0 }, { x: 1, y: 0 });
      expect(result2.isValid).toBe(true);
      expect(result2.isSolvable).toBe(true);
      expect(result2.pathLength).toBe(1);
    });
  });
});

// Helper function to count set bits in a number
function countSetBits(n: number): number {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}