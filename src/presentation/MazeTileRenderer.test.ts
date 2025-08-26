// Tests for MazeTileRenderer
import { MazeTileRenderer, TileConnectionInfo, MazeTileTheme } from './MazeTileRenderer';
import { MazeCell } from '../core/types/Level';

// Mock Phaser objects
const mockSprite = {
  setScale: jest.fn().mockReturnThis(),
  setOrigin: jest.fn().mockReturnThis(),
  setTint: jest.fn().mockReturnThis(),
  setRotation: jest.fn().mockReturnThis(),
  setPosition: jest.fn().mockReturnThis(),
  setAlpha: jest.fn().mockReturnThis(),
  setTexture: jest.fn().mockReturnThis(),
  setData: jest.fn().mockReturnThis(),
  getData: jest.fn(),
  destroy: jest.fn()
};

const mockGraphics = {
  fillStyle: jest.fn().mockReturnThis(),
  fillRect: jest.fn().mockReturnThis(),
  generateTexture: jest.fn().mockReturnValue('generated_texture'),
  destroy: jest.fn()
};

const mockRectangle = {
  setStrokeStyle: jest.fn().mockReturnThis()
};

const mockGroup = {
  add: jest.fn(),
  children: {
    entries: []
  }
};

const mockLayer = {
  add: jest.fn()
};

const mockScene = {
  add: {
    sprite: jest.fn().mockReturnValue(mockSprite),
    graphics: jest.fn().mockReturnValue(mockGraphics),
    rectangle: jest.fn().mockReturnValue(mockRectangle),
    group: jest.fn().mockReturnValue(mockGroup)
  },
  scale: {
    width: 800,
    height: 600
  }
};

const mockLayerManager = {
  getLayer: jest.fn().mockReturnValue(mockLayer)
};

const mockAssetManager = {
  getThemeAsset: jest.fn()
};

describe('MazeTileRenderer', () => {
  let renderer: MazeTileRenderer;

  beforeEach(() => {
    jest.clearAllMocks();
    renderer = new MazeTileRenderer(mockScene as any, mockLayerManager, mockAssetManager);
  });

  afterEach(() => {
    renderer.destroy();
  });

  describe('Constructor', () => {
    test('should initialize with default values', () => {
      expect(renderer.getCellSize()).toBe(24);
      expect(renderer.getCurrentTheme()).toBe('default');
    });

    test('should accept custom parameters', () => {
      const customRenderer = new MazeTileRenderer(mockScene as any, mockLayerManager, mockAssetManager);
      customRenderer.setCellSize(32);
      customRenderer.setCurrentTheme('forest');
      
      expect(customRenderer.getCellSize()).toBe(32);
      expect(customRenderer.getCurrentTheme()).toBe('forest');
    });
  });

  describe('renderMaze', () => {
    test('should create maze group with all components', () => {
      const mazeData: MazeCell[][] = [
        [
          { walls: 12, type: 'start', properties: { isStart: true, isGoal: false, isVisited: false } },
          { walls: 9, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }
        ],
        [
          { walls: 6, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } },
          { walls: 3, type: 'goal', properties: { isStart: false, isGoal: true, isVisited: false } }
        ]
      ];

      const mazeGroup = renderer.renderMaze(mazeData, 'default');

      expect(mockScene.add.group).toHaveBeenCalled();
      expect(mockLayerManager.getLayer).toHaveBeenCalledWith('maze');
      expect(mockLayer.add).toHaveBeenCalledWith(mazeGroup);
      expect(mazeGroup).toBeTruthy();
    });

    test('should handle empty maze data', () => {
      const emptyMazeData: MazeCell[][] = [];
      const mazeGroup = renderer.renderMaze(emptyMazeData);

      expect(mazeGroup).toBeTruthy();
      expect(mockScene.add.group).toHaveBeenCalled();
    });

    test('should use specified theme', () => {
      const mazeData: MazeCell[][] = [
        [{ walls: 15, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }]
      ];

      renderer.renderMaze(mazeData, 'forest');

      // Should attempt to get theme assets
      expect(mockAssetManager.getThemeAsset).toHaveBeenCalledWith('forest', 'maze', 'complete');
    });
  });

  describe('createFloorTiles', () => {
    test('should create floor tiles for each cell', () => {
      const mazeData: MazeCell[][] = [
        [
          { walls: 0, type: 'start', properties: { isStart: true, isGoal: false, isVisited: false } },
          { walls: 0, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }
        ],
        [
          { walls: 0, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } },
          { walls: 0, type: 'goal', properties: { isStart: false, isGoal: true, isVisited: false } }
        ]
      ];

      const floorTiles = renderer.createFloorTiles(mazeData);

      expect(floorTiles).toHaveLength(4);
      expect(mockScene.add.sprite).toHaveBeenCalledTimes(4);
    });

    test('should set appropriate data on floor tiles', () => {
      const mazeData: MazeCell[][] = [
        [{ walls: 0, type: 'start', properties: { isStart: true, isGoal: false, isVisited: false } }]
      ];

      renderer.createFloorTiles(mazeData);

      expect(mockSprite.setData).toHaveBeenCalledWith('type', 'floor');
      expect(mockSprite.setData).toHaveBeenCalledWith('cellType', 'start');
      expect(mockSprite.setData).toHaveBeenCalledWith('gridPosition', { x: 0, y: 0 });
    });
  });

  describe('createWallTiles', () => {
    test('should create wall tiles based on wall flags', () => {
      const mazeData: MazeCell[][] = [
        [{ walls: 15, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }] // All walls
      ];

      const wallTiles = renderer.createWallTiles(mazeData);

      expect(wallTiles.length).toBeGreaterThan(0);
      expect(mockScene.add.sprite).toHaveBeenCalled();
    });

    test('should not create walls when walls flag is 0', () => {
      const mazeData: MazeCell[][] = [
        [{ walls: 0, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }] // No walls
      ];

      const wallTiles = renderer.createWallTiles(mazeData);

      expect(wallTiles).toHaveLength(0);
    });

    test('should create correct number of walls for partial walls', () => {
      const mazeData: MazeCell[][] = [
        [{ walls: 5, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }] // East (1) + West (4) = 5
      ];

      const wallTiles = renderer.createWallTiles(mazeData);

      expect(wallTiles).toHaveLength(2); // East and West walls
    });
  });

  describe('createMazeBackground', () => {
    test('should create background with proper dimensions', () => {
      const mazeSize = { width: 5, height: 5 };
      const backgroundGroup = renderer.createMazeBackground(mazeSize);

      expect(mockScene.add.rectangle).toHaveBeenCalled();
      expect(mockScene.add.group).toHaveBeenCalled();
      expect(backgroundGroup).toBeTruthy();
    });

    test('should create border tiles around maze', () => {
      const mazeSize = { width: 3, height: 3 };
      renderer.createMazeBackground(mazeSize);

      // Should create sprites for borders
      expect(mockScene.add.sprite).toHaveBeenCalled();
    });
  });

  describe('analyzeTileConnections', () => {
    test('should analyze connections correctly for center cell', () => {
      const mazeData: MazeCell[][] = [
        [
          { walls: 15, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } },
          { walls: 15, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } },
          { walls: 15, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }
        ],
        [
          { walls: 15, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } },
          { walls: 0, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }, // No walls = all connections
          { walls: 15, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }
        ],
        [
          { walls: 15, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } },
          { walls: 15, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } },
          { walls: 15, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }
        ]
      ];

      const connections = renderer.analyzeTileConnections(mazeData, 1, 1);

      expect(connections.north).toBe(true);
      expect(connections.south).toBe(true);
      expect(connections.east).toBe(true);
      expect(connections.west).toBe(true);
    });

    test('should handle edge cases for out-of-bounds positions', () => {
      const mazeData: MazeCell[][] = [
        [{ walls: 0, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }]
      ];

      const connections = renderer.analyzeTileConnections(mazeData, -1, -1);

      expect(connections.north).toBe(false);
      expect(connections.south).toBe(false);
      expect(connections.east).toBe(false);
      expect(connections.west).toBe(false);
    });

    test('should cache connection results', () => {
      const mazeData: MazeCell[][] = [
        [{ walls: 0, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }]
      ];

      // Call twice with same parameters
      const connections1 = renderer.analyzeTileConnections(mazeData, 0, 0);
      const connections2 = renderer.analyzeTileConnections(mazeData, 0, 0);

      expect(connections1).toEqual(connections2);
      expect(connections1).toBe(connections2); // Should be same object from cache
    });
  });

  describe('getWallTileForConnections', () => {
    test('should return end tile for single connection', () => {
      const connections: TileConnectionInfo = {
        north: true,
        south: false,
        east: false,
        west: false,
        corners: { northEast: false, northWest: false, southEast: false, southWest: false }
      };

      const wallConfig = renderer.getWallTileForConnections(connections, 'default');

      expect(wallConfig.key).toBe('maze_wall_end');
    });

    test('should return straight tile for opposite connections', () => {
      const connections: TileConnectionInfo = {
        north: true,
        south: true,
        east: false,
        west: false,
        corners: { northEast: false, northWest: false, southEast: false, southWest: false }
      };

      const wallConfig = renderer.getWallTileForConnections(connections, 'default');

      expect(wallConfig.key).toBe('maze_wall_straight');
    });

    test('should return corner tile for adjacent connections', () => {
      const connections: TileConnectionInfo = {
        north: true,
        south: false,
        east: true,
        west: false,
        corners: { northEast: true, northWest: false, southEast: false, southWest: false }
      };

      const wallConfig = renderer.getWallTileForConnections(connections, 'default');

      expect(wallConfig.key).toBe('maze_wall_corner');
    });

    test('should return junction tile for multiple connections', () => {
      const connections: TileConnectionInfo = {
        north: true,
        south: true,
        east: true,
        west: false,
        corners: { northEast: true, northWest: false, southEast: true, southWest: false }
      };

      const wallConfig = renderer.getWallTileForConnections(connections, 'default');

      expect(wallConfig.key).toBe('maze_wall_junction');
    });
  });

  describe('updateMazeTheme', () => {
    test('should update all sprites in maze group', () => {
      const mazeGroup = mockGroup;
      mazeGroup.children.entries = [mockSprite];
      mockSprite.getData.mockImplementation((key: string) => {
        if (key === 'type') return 'floor';
        if (key === 'cellType') return 'start';
        return null;
      });

      renderer.updateMazeTheme(mazeGroup as any, 'forest');

      expect(mockSprite.setTint).toHaveBeenCalled();
    });

    test('should handle nested groups recursively', () => {
      const nestedGroup = { ...mockGroup };
      const mainGroup = mockGroup;
      mainGroup.children.entries = [nestedGroup];
      nestedGroup.children.entries = [mockSprite];

      mockSprite.getData.mockImplementation((key: string) => {
        if (key === 'type') return 'wall';
        if (key === 'wallType') return 'straight';
        return null;
      });

      renderer.updateMazeTheme(mainGroup as any, 'forest');

      expect(mockSprite.setTint).toHaveBeenCalled();
    });
  });

  describe('positionTile', () => {
    test('should position sprite at correct world coordinates', () => {
      const sprite = mockSprite as any;
      const gridPosition = { x: 2, y: 3 };

      renderer.positionTile(sprite, gridPosition);

      expect(sprite.setPosition).toHaveBeenCalled();
      const [x, y] = (sprite.setPosition as jest.Mock).mock.calls[0];
      expect(typeof x).toBe('number');
      expect(typeof y).toBe('number');
    });
  });

  describe('Utility Methods', () => {
    test('should set and get cell size', () => {
      renderer.setCellSize(32);
      expect(renderer.getCellSize()).toBe(32);
    });

    test('should set and get current theme', () => {
      renderer.setCurrentTheme('forest');
      expect(renderer.getCurrentTheme()).toBe('forest');
    });

    test('should clear caches', () => {
      // First populate cache
      const mazeData: MazeCell[][] = [
        [{ walls: 0, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }]
      ];
      renderer.analyzeTileConnections(mazeData, 0, 0);

      // Clear caches
      renderer.clearCaches();

      // This should work without errors
      expect(() => renderer.clearCaches()).not.toThrow();
    });

    test('should destroy cleanly', () => {
      expect(() => renderer.destroy()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing asset manager gracefully', () => {
      const rendererWithoutAssets = new MazeTileRenderer(mockScene as any);
      const mazeData: MazeCell[][] = [
        [{ walls: 0, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }]
      ];

      expect(() => rendererWithoutAssets.renderMaze(mazeData)).not.toThrow();
    });

    test('should handle sprite creation failures gracefully', () => {
      mockScene.add.sprite.mockImplementationOnce(() => {
        throw new Error('Sprite creation failed');
      });

      const mazeData: MazeCell[][] = [
        [{ walls: 0, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }]
      ];

      expect(() => renderer.createFloorTiles(mazeData)).not.toThrow();
    });

    test('should handle invalid maze data', () => {
      const invalidMazeData: any = null;

      expect(() => renderer.renderMaze(invalidMazeData)).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should handle large mazes efficiently', () => {
      const largeMazeData: MazeCell[][] = [];
      for (let y = 0; y < 20; y++) {
        const row: MazeCell[] = [];
        for (let x = 0; x < 20; x++) {
          row.push({
            walls: Math.floor(Math.random() * 16),
            type: 'floor',
            properties: { isStart: false, isGoal: false, isVisited: false }
          });
        }
        largeMazeData.push(row);
      }

      const startTime = Date.now();
      renderer.renderMaze(largeMazeData);
      const endTime = Date.now();

      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('should cache connection analysis results', () => {
      const mazeData: MazeCell[][] = [
        [{ walls: 5, type: 'floor', properties: { isStart: false, isGoal: false, isVisited: false } }]
      ];

      // First call should analyze
      const startTime1 = Date.now();
      renderer.analyzeTileConnections(mazeData, 0, 0);
      const endTime1 = Date.now();

      // Second call should use cache (should be faster)
      const startTime2 = Date.now();
      renderer.analyzeTileConnections(mazeData, 0, 0);
      const endTime2 = Date.now();

      const firstCallTime = endTime1 - startTime1;
      const secondCallTime = endTime2 - startTime2;

      // Second call should be faster or equal (cached)
      expect(secondCallTime).toBeLessThanOrEqual(firstCallTime);
    });
  });
});