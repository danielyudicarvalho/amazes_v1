// Test suite for Enhanced Asset Management Infrastructure

import { EnhancedAssetManager, AssetManifest, ThemeDefinition } from './AssetManager';
import { AssetLoader } from './AssetLoader';
import { AssetValidator } from './AssetValidator';
import { ThemeManager } from './ThemeManager';

// Mock Phaser scene for testing
class MockPhaserScene {
  public textures = {
    exists: jest.fn().mockReturnValue(true),
    get: jest.fn().mockReturnValue({
      source: [{ width: 512, height: 512 }]
    }),
    remove: jest.fn()
  };
  
  public load = {
    atlas: jest.fn(),
    image: jest.fn(),
    once: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    start: jest.fn()
  };
  
  public anims = {
    exists: jest.fn().mockReturnValue(false),
    create: jest.fn(),
    generateFrameNames: jest.fn().mockReturnValue([]),
    get: jest.fn()
  };
  
  public cache = {
    json: {
      add: jest.fn()
    }
  };
}

// Mock fetch for manifest loading
global.fetch = jest.fn();

describe('Enhanced Asset Management Infrastructure', () => {
  let mockScene: MockPhaserScene;
  let assetManager: EnhancedAssetManager;
  let mockManifest: AssetManifest;

  beforeEach(() => {
    mockScene = new MockPhaserScene();
    assetManager = new EnhancedAssetManager(mockScene as any);
    
    mockManifest = {
      version: '1.0.0',
      themes: [
        {
          id: 'test-theme',
          name: 'Test Theme',
          description: 'A test theme',
          assets: {
            player: {
              key: 'player_test',
              atlas: 'characters',
              frame: 'player_01',
              scale: 1.0,
              anchor: { x: 0.5, y: 0.5 }
            },
            orbs: [
              {
                key: 'orb_test',
                atlas: 'items',
                frame: 'orb_01',
                scale: 0.8,
                anchor: { x: 0.5, y: 0.5 }
              }
            ],
            maze: {
              walls: [
                {
                  key: 'wall_test',
                  atlas: 'environment',
                  frame: 'wall_01',
                  scale: 1.0,
                  anchor: { x: 0.5, y: 0.5 }
                }
              ],
              floors: [],
              backgrounds: []
            },
            ui: {
              buttons: [],
              backgrounds: [],
              panels: []
            },
            effects: {
              particles: [],
              animations: []
            }
          },
          colors: {
            primary: '#4A7C59',
            secondary: '#8FBC8F',
            accent: '#FFD700',
            background: '#2F4F2F'
          }
        }
      ],
      atlases: [
        {
          key: 'characters',
          imagePath: '/assets/characters.png',
          dataPath: '/assets/characters.json',
          priority: 1
        },
        {
          key: 'items',
          imagePath: '/assets/items.png',
          dataPath: '/assets/items.json',
          priority: 2
        },
        {
          key: 'environment',
          imagePath: '/assets/environment.png',
          dataPath: '/assets/environment.json',
          priority: 3
        }
      ],
      animations: [
        {
          key: 'test_animation',
          atlas: 'characters',
          frames: [
            { frame: 'frame_01', duration: 100 },
            { frame: 'frame_02', duration: 100 }
          ],
          frameRate: 10,
          repeat: -1,
          yoyo: false
        }
      ],
      particles: []
    };

    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockManifest)
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Manifest Loading and Parsing', () => {
    test('should load and validate manifest successfully', async () => {
      await assetManager.loadManifest('/test/manifest.json');
      
      expect(global.fetch).toHaveBeenCalledWith('/test/manifest.json');
      expect(assetManager.getAvailableThemes()).toHaveLength(1);
      expect(assetManager.getAvailableThemes()[0].id).toBe('test-theme');
    });

    test('should handle manifest loading errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(assetManager.loadManifest('/invalid/manifest.json'))
        .rejects.toThrow('Failed to load manifest: Not Found');
    });

    test('should validate manifest structure', async () => {
      const invalidManifest = { ...mockManifest };
      delete (invalidManifest as any).version;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(invalidManifest)
      });

      await expect(assetManager.loadManifest('/test/manifest.json'))
        .rejects.toThrow('Invalid manifest');
    });
  });

  describe('Texture Atlas Support', () => {
    beforeEach(async () => {
      await assetManager.loadManifest('/test/manifest.json');
    });

    test('should load texture atlas with validation', async () => {
      // Mock successful atlas loading
      mockScene.load.once.mockImplementation((event, callback) => {
        if (event === 'complete') {
          setTimeout(callback, 0);
        }
      });

      await assetManager.loadTextureAtlas('test-atlas', '/test/atlas.png', '/test/atlas.json');
      
      expect(mockScene.load.atlas).toHaveBeenCalledWith('test-atlas', '/test/atlas.png', '/test/atlas.json');
      expect(mockScene.textures.exists).toHaveBeenCalledWith('test-atlas');
    });

    test('should handle atlas loading failures with retry', async () => {
      let attemptCount = 0;
      mockScene.load.once.mockImplementation((event, callback) => {
        if (event === 'loaderror') {
          attemptCount++;
          setTimeout(() => callback({ key: 'test-atlas', src: '/test/atlas.png' }), 0);
        }
      });

      await expect(assetManager.loadTextureAtlas('test-atlas', '/test/atlas.png', '/test/atlas.json'))
        .rejects.toThrow('Failed to load atlas test-atlas');
    });

    test('should track memory usage for loaded atlases', async () => {
      mockScene.load.once.mockImplementation((event, callback) => {
        if (event === 'complete') {
          setTimeout(callback, 0);
        }
      });

      await assetManager.loadTextureAtlas('test-atlas', '/test/atlas.png', '/test/atlas.json');
      
      const memoryStats = assetManager.getMemoryStats();
      expect(memoryStats.current).toBeGreaterThan(0);
      expect(memoryStats.atlasCount).toBe(1);
    });
  });

  describe('Theme-based Asset Organization', () => {
    beforeEach(async () => {
      await assetManager.loadManifest('/test/manifest.json');
      
      // Mock successful atlas loading for theme assets
      mockScene.load.once.mockImplementation((event, callback) => {
        if (event === 'complete') {
          setTimeout(callback, 0);
        }
      });
    });

    test('should preload theme assets successfully', async () => {
      await assetManager.preloadThemeAssets('test-theme');
      
      expect(assetManager.isThemeLoaded('test-theme')).toBe(true);
      expect(mockScene.load.atlas).toHaveBeenCalledTimes(3); // characters, items, environment
    });

    test('should retrieve theme-specific assets', async () => {
      await assetManager.preloadThemeAssets('test-theme');
      
      const playerAsset = assetManager.getThemeAsset('test-theme', 'player', 'player_test');
      expect(playerAsset).toBeDefined();
      expect(playerAsset.key).toBe('player_test');
      expect(playerAsset.atlas).toBe('characters');
    });

    test('should handle theme loading errors gracefully', async () => {
      await expect(assetManager.preloadThemeAssets('non-existent-theme'))
        .rejects.toThrow('Theme non-existent-theme not found in manifest');
    });
  });

  describe('Asset Validation and Error Handling', () => {
    test('should validate assets and return validation results', async () => {
      await assetManager.loadManifest('/test/manifest.json');
      
      const validationResult = await assetManager.validateAssets();
      expect(validationResult).toHaveProperty('isValid');
      expect(validationResult).toHaveProperty('errors');
      expect(validationResult).toHaveProperty('warnings');
    });

    test('should validate loaded assets consistency', async () => {
      await assetManager.loadManifest('/test/manifest.json');
      
      // Mock atlas loading
      mockScene.load.once.mockImplementation((event, callback) => {
        if (event === 'complete') {
          setTimeout(callback, 0);
        }
      });
      
      await assetManager.preloadThemeAssets('test-theme');
      
      const validationResult = await assetManager.validateLoadedAssets();
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('Memory Management and Cleanup', () => {
    beforeEach(async () => {
      await assetManager.loadManifest('/test/manifest.json');
    });

    test('should track memory usage accurately', async () => {
      const initialStats = assetManager.getMemoryStats();
      expect(initialStats.current).toBe(0);
      
      // Mock atlas loading
      mockScene.load.once.mockImplementation((event, callback) => {
        if (event === 'complete') {
          setTimeout(callback, 0);
        }
      });
      
      await assetManager.loadTextureAtlas('test-atlas', '/test/atlas.png', '/test/atlas.json');
      
      const afterLoadStats = assetManager.getMemoryStats();
      expect(afterLoadStats.current).toBeGreaterThan(initialStats.current);
    });

    test('should cleanup unused assets', async () => {
      // Mock atlas loading
      mockScene.load.once.mockImplementation((event, callback) => {
        if (event === 'complete') {
          setTimeout(callback, 0);
        }
      });
      
      await assetManager.loadTextureAtlas('test-atlas', '/test/atlas.png', '/test/atlas.json');
      
      const beforeCleanup = assetManager.getMemoryStats();
      assetManager.forceCleanup();
      const afterCleanup = assetManager.getMemoryStats();
      
      expect(afterCleanup.current).toBeLessThanOrEqual(beforeCleanup.current);
    });
  });

  describe('Loading Progress Tracking', () => {
    test('should track loading progress accurately', async () => {
      const progress1 = assetManager.getLoadingProgress();
      expect(progress1.percentage).toBe(0);
      
      // Start loading manifest
      const loadPromise = assetManager.loadManifest('/test/manifest.json');
      
      // Progress should be updated during loading
      await loadPromise;
      
      const progress2 = assetManager.getLoadingProgress();
      expect(progress2.percentage).toBe(100);
    });
  });

  describe('Error Recovery and Fallbacks', () => {
    test('should handle network errors with retry logic', async () => {
      let attemptCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockManifest)
        });
      });

      // Should eventually succeed after retries
      await assetManager.loadManifest('/test/manifest.json');
      expect(attemptCount).toBe(3);
    });
  });

  describe('Integration with Subsystems', () => {
    test('should integrate with AssetLoader correctly', async () => {
      await assetManager.loadManifest('/test/manifest.json');
      
      // AssetLoader should be initialized and functional
      expect(assetManager['assetLoader']).toBeDefined();
    });

    test('should integrate with AssetValidator correctly', async () => {
      await assetManager.loadManifest('/test/manifest.json');
      
      // AssetValidator should be initialized and functional
      expect(assetManager['validator']).toBeDefined();
    });

    test('should integrate with ThemeManager correctly', async () => {
      await assetManager.loadManifest('/test/manifest.json');
      
      // ThemeManager should be initialized and functional
      expect(assetManager['themeManager']).toBeDefined();
    });
  });
});