// Tests for the SpriteRenderer system
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { SpriteRenderer } from './SpriteRenderer';
import { SpriteFactory } from './SpriteFactory';
import { LayerManager } from './LayerManager';
import { SpriteUtils } from './SpriteUtils';

// Mock Phaser objects for testing
const mockScene = {
  add: {
    sprite: vi.fn().mockReturnValue({
      setScale: vi.fn().mockReturnThis(),
      setOrigin: vi.fn().mockReturnThis(),
      setTint: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
      setData: vi.fn().mockReturnThis(),
      getData: vi.fn(),
      destroy: vi.fn(),
      active: true,
      x: 0,
      y: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1
    }),
    layer: vi.fn().mockReturnValue({
      setName: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      add: vi.fn(),
      remove: vi.fn(),
      destroy: vi.fn(),
      active: true,
      list: []
    }),
    group: vi.fn().mockReturnValue({
      add: vi.fn(),
      destroy: vi.fn()
    })
  },
  scale: {
    width: 800,
    height: 600
  },
  tweens: {
    add: vi.fn().mockReturnValue({
      play: vi.fn()
    })
  }
} as any;

describe('SpriteRenderer', () => {
  let spriteRenderer: SpriteRenderer;

  beforeEach(() => {
    vi.clearAllMocks();
    spriteRenderer = new SpriteRenderer(mockScene);
  });

  afterEach(() => {
    spriteRenderer.destroy();
  });

  describe('Layer Management', () => {
    test('should create default layers on initialization', () => {
      expect(mockScene.add.layer).toHaveBeenCalledTimes(5); // background, maze, gameObjects, effects, ui
      
      const backgroundLayer = spriteRenderer.getLayer('background');
      const mazeLayer = spriteRenderer.getLayer('maze');
      const gameObjectsLayer = spriteRenderer.getLayer('gameObjects');
      const effectsLayer = spriteRenderer.getLayer('effects');
      const uiLayer = spriteRenderer.getLayer('ui');
      
      expect(backgroundLayer).toBeTruthy();
      expect(mazeLayer).toBeTruthy();
      expect(gameObjectsLayer).toBeTruthy();
      expect(effectsLayer).toBeTruthy();
      expect(uiLayer).toBeTruthy();
    });

    test('should return null for non-existent layer', () => {
      const nonExistentLayer = spriteRenderer.getLayer('nonexistent');
      expect(nonExistentLayer).toBeNull();
    });
  });

  describe('Player Sprite Creation', () => {
    test('should create player sprite with default configuration', () => {
      const position = { x: 5, y: 5 };
      const playerSprite = spriteRenderer.createPlayerSprite(position);
      
      expect(mockScene.add.sprite).toHaveBeenCalled();
      expect(playerSprite.setData).toHaveBeenCalledWith('type', 'player');
      expect(playerSprite.setData).toHaveBeenCalledWith('theme', 'default');
    });

    test('should create player sprite with custom theme', () => {
      const position = { x: 3, y: 7 };
      const theme = 'forest';
      const playerSprite = spriteRenderer.createPlayerSprite(position, theme);
      
      expect(playerSprite.setData).toHaveBeenCalledWith('theme', theme);
    });
  });

  describe('Orb Sprite Creation', () => {
    test('should create orb sprite with floating animation', () => {
      const position = { x: 2, y: 4 };
      const orbType = 'energy';
      const orbSprite = spriteRenderer.createOrbSprite(position, orbType);
      
      expect(mockScene.add.sprite).toHaveBeenCalled();
      expect(orbSprite.setData).toHaveBeenCalledWith('type', 'orb');
      expect(orbSprite.setData).toHaveBeenCalledWith('orbType', orbType);
      expect(mockScene.tweens.add).toHaveBeenCalled(); // Floating animation
    });
  });

  describe('Maze Tile Creation', () => {
    test('should create maze tiles from maze data', () => {
      const mazeData = [
        [{ walls: 15 }, { walls: 7 }], // 2x2 maze
        [{ walls: 11 }, { walls: 3 }]
      ];
      
      const mazeGroup = spriteRenderer.createMazeTiles(mazeData);
      
      expect(mockScene.add.group).toHaveBeenCalled();
      expect(mazeGroup).toBeTruthy();
    });

    test('should handle empty maze data', () => {
      const emptyMazeData: any[][] = [];
      const mazeGroup = spriteRenderer.createMazeTiles(emptyMazeData);
      
      expect(mazeGroup).toBeTruthy();
    });
  });

  describe('UI Sprite Creation', () => {
    test('should create UI sprite with proper configuration', () => {
      const position = { x: 100, y: 50 };
      const elementType = 'button';
      const uiSprite = spriteRenderer.createUISprite(elementType, position);
      
      expect(mockScene.add.sprite).toHaveBeenCalled();
      expect(uiSprite.setData).toHaveBeenCalledWith('type', 'ui');
      expect(uiSprite.setData).toHaveBeenCalledWith('elementType', elementType);
    });
  });

  describe('Sprite Positioning', () => {
    test('should position sprite correctly using grid coordinates', () => {
      const sprite = mockScene.add.sprite();
      const gridPosition = { x: 5, y: 3 };
      
      spriteRenderer.positionSprite(sprite, gridPosition);
      
      expect(sprite.setPosition).toHaveBeenCalled();
    });

    test('should position sprite with custom cell size', () => {
      const sprite = mockScene.add.sprite();
      const gridPosition = { x: 2, y: 4 };
      const customCellSize = 32;
      
      spriteRenderer.positionSprite(sprite, gridPosition, customCellSize);
      
      expect(sprite.setPosition).toHaveBeenCalled();
    });
  });

  describe('Sprite Scaling', () => {
    test('should scale sprite with responsive scaling', () => {
      const sprite = mockScene.add.sprite();
      const baseScale = 1.5;
      
      spriteRenderer.scaleSprite(sprite, baseScale);
      
      expect(sprite.setScale).toHaveBeenCalled();
    });
  });

  describe('Theme Updates', () => {
    test('should update sprite theme when asset manager is available', () => {
      const mockAssetManager = {
        getThemeAsset: vi.fn().mockReturnValue({
          key: 'new_texture',
          atlas: 'new_atlas',
          frame: 'new_frame',
          scale: 1.2
        })
      };
      
      const rendererWithAssets = new SpriteRenderer(mockScene, mockAssetManager);
      const sprite = mockScene.add.sprite();
      sprite.getData = vi.fn().mockReturnValue('player');
      sprite.setTexture = vi.fn();
      
      rendererWithAssets.updateSpriteTheme(sprite, 'newTheme');
      
      expect(mockAssetManager.getThemeAsset).toHaveBeenCalled();
      expect(sprite.setTexture).toHaveBeenCalledWith('new_atlas', 'new_frame');
      
      rendererWithAssets.destroy();
    });

    test('should handle theme update without asset manager', () => {
      const sprite = mockScene.add.sprite();
      sprite.getData = vi.fn().mockReturnValue('player');
      
      // Should not throw error
      expect(() => {
        spriteRenderer.updateSpriteTheme(sprite, 'newTheme');
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    test('should clean up resources on destroy', () => {
      const sprite = spriteRenderer.createPlayerSprite({ x: 0, y: 0 });
      
      spriteRenderer.destroy();
      
      // Verify cleanup was called
      expect(sprite.destroy).toHaveBeenCalled();
    });
  });
});

describe('SpriteFactory', () => {
  let spriteFactory: SpriteFactory;

  beforeEach(() => {
    vi.clearAllMocks();
    spriteFactory = new SpriteFactory({
      scene: mockScene,
      defaultTheme: 'test',
      cellSize: 24
    });
  });

  describe('Player Creation', () => {
    test('should create player sprite with correct properties', () => {
      const position = { x: 5, y: 5 };
      const player = spriteFactory.createPlayer(position);
      
      expect(mockScene.add.sprite).toHaveBeenCalled();
      expect(player.setData).toHaveBeenCalledWith('type', 'player');
      expect(player.setData).toHaveBeenCalledWith('gameObjectType', 'player');
      expect(player.setName).toHaveBeenCalledWith('player');
    });
  });

  describe('Orb Creation', () => {
    test('should create orb sprite with floating animation', () => {
      const position = { x: 3, y: 7 };
      const orbId = 'orb_001';
      const orb = spriteFactory.createOrb(position, orbId);
      
      expect(mockScene.add.sprite).toHaveBeenCalled();
      expect(orb.setData).toHaveBeenCalledWith('type', 'orb');
      expect(orb.setData).toHaveBeenCalledWith('orbId', orbId);
      expect(orb.setName).toHaveBeenCalledWith(`orb_${orbId}`);
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('Theme Management', () => {
    test('should set and get default theme', () => {
      const newTheme = 'forest';
      spriteFactory.setDefaultTheme(newTheme);
      
      expect(spriteFactory.getDefaultTheme()).toBe(newTheme);
    });
  });
});

describe('LayerManager', () => {
  let layerManager: LayerManager;

  beforeEach(() => {
    vi.clearAllMocks();
    layerManager = new LayerManager(mockScene);
  });

  afterEach(() => {
    layerManager.destroy();
  });

  describe('Layer Creation', () => {
    test('should create default layers on initialization', () => {
      expect(mockScene.add.layer).toHaveBeenCalledTimes(12); // All default layers
      
      const backgroundLayer = layerManager.getLayer('background');
      const mazeFloorLayer = layerManager.getLayer('maze-floor');
      const playerLayer = layerManager.getLayer('player');
      
      expect(backgroundLayer).toBeTruthy();
      expect(mazeFloorLayer).toBeTruthy();
      expect(playerLayer).toBeTruthy();
    });

    test('should create custom layer', () => {
      const customLayerDef = {
        name: 'custom',
        depth: 999,
        visible: true
      };
      
      const customLayer = layerManager.createLayer(customLayerDef);
      
      expect(customLayer).toBeTruthy();
      expect(layerManager.getLayer('custom')).toBe(customLayer);
    });
  });

  describe('Sprite Management', () => {
    test('should add sprite to layer', () => {
      const sprite = mockScene.add.sprite();
      const success = layerManager.addSpriteToLayer(sprite, 'game-objects');
      
      expect(success).toBe(true);
      expect(sprite.setData).toHaveBeenCalledWith('layer', 'game-objects');
    });

    test('should remove sprite from layer', () => {
      const sprite = mockScene.add.sprite();
      sprite.getData = vi.fn().mockReturnValue('game-objects');
      sprite.removeData = vi.fn();
      
      layerManager.addSpriteToLayer(sprite, 'game-objects');
      const success = layerManager.removeSpriteFromLayer(sprite);
      
      expect(success).toBe(true);
      expect(sprite.removeData).toHaveBeenCalledWith('layer');
    });

    test('should move sprite between layers', () => {
      const sprite = mockScene.add.sprite();
      sprite.getData = vi.fn().mockReturnValue('game-objects');
      sprite.removeData = vi.fn();
      
      layerManager.addSpriteToLayer(sprite, 'game-objects');
      const success = layerManager.moveSpriteToLayer(sprite, 'effects-low');
      
      expect(success).toBe(true);
      expect(sprite.setData).toHaveBeenCalledWith('layer', 'effects-low');
    });
  });

  describe('Layer Properties', () => {
    test('should set layer visibility', () => {
      const layer = layerManager.getLayer('background');
      layerManager.setLayerVisible('background', false);
      
      expect(layer?.setVisible).toHaveBeenCalledWith(false);
    });

    test('should set layer alpha', () => {
      const layer = layerManager.getLayer('effects-low');
      layerManager.setLayerAlpha('effects-low', 0.5);
      
      expect(layer?.setAlpha).toHaveBeenCalledWith(0.5);
    });
  });
});

describe('SpriteUtils', () => {
  let spriteUtils: SpriteUtils;

  beforeEach(() => {
    vi.clearAllMocks();
    spriteUtils = new SpriteUtils(mockScene);
  });

  describe('Positioning', () => {
    test('should position sprite using grid coordinates', () => {
      const sprite = mockScene.add.sprite();
      const gridPos = { x: 5, y: 3 };
      
      spriteUtils.positionSpriteGrid(sprite, gridPos);
      
      expect(sprite.setPosition).toHaveBeenCalled();
    });

    test('should position sprite using world coordinates', () => {
      const sprite = mockScene.add.sprite();
      const worldPos = { x: 100, y: 200 };
      
      spriteUtils.positionSpriteWorld(sprite, worldPos);
      
      expect(sprite.setPosition).toHaveBeenCalledWith(100, 200);
    });
  });

  describe('Scaling', () => {
    test('should scale sprite with responsive scaling', () => {
      const sprite = mockScene.add.sprite();
      const config = { baseScale: 1.5, responsive: true };
      
      spriteUtils.scaleSprite(sprite, config);
      
      expect(sprite.setScale).toHaveBeenCalled();
    });

    test('should apply scale constraints', () => {
      const sprite = mockScene.add.sprite();
      const config = { baseScale: 0.1, minScale: 0.5, maxScale: 2.0 };
      
      spriteUtils.scaleSprite(sprite, config);
      
      expect(sprite.setScale).toHaveBeenCalledWith(0.5); // Should be clamped to minScale
    });
  });

  describe('Alignment', () => {
    test('should align sprite to center', () => {
      const sprite = mockScene.add.sprite();
      sprite.displayWidth = 50;
      sprite.displayHeight = 30;
      sprite.originX = 0.5;
      sprite.originY = 0.5;
      
      const config = { horizontal: 'center' as const, vertical: 'center' as const };
      
      spriteUtils.alignSprite(sprite, config);
      
      expect(sprite.setPosition).toHaveBeenCalledWith(400, 300); // Center of 800x600 screen
    });
  });

  describe('Coordinate Conversion', () => {
    test('should convert grid to world coordinates', () => {
      const gridPos = { x: 5, y: 3 };
      const worldPos = spriteUtils.gridToWorld(gridPos);
      
      expect(worldPos).toHaveProperty('x');
      expect(worldPos).toHaveProperty('y');
      expect(typeof worldPos.x).toBe('number');
      expect(typeof worldPos.y).toBe('number');
    });

    test('should convert world to grid coordinates', () => {
      const worldPos = { x: 300, y: 400 };
      const gridPos = spriteUtils.worldToGrid(worldPos);
      
      expect(gridPos).toHaveProperty('x');
      expect(gridPos).toHaveProperty('y');
      expect(typeof gridPos.x).toBe('number');
      expect(typeof gridPos.y).toBe('number');
    });
  });

  describe('Animations', () => {
    test('should create bounce animation', () => {
      const sprite = mockScene.add.sprite();
      sprite.scaleX = 1;
      
      spriteUtils.bounceSprite(sprite);
      
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    test('should create floating animation', () => {
      const sprite = mockScene.add.sprite();
      sprite.y = 100;
      
      spriteUtils.floatSprite(sprite);
      
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    test('should create fade animation', () => {
      const sprite = mockScene.add.sprite();
      
      spriteUtils.fadeSprite(sprite, 0.5);
      
      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: sprite,
          alpha: 0.5
        })
      );
    });
  });

  describe('Static Utilities', () => {
    test('should calculate midpoint between positions', () => {
      const pos1 = { x: 0, y: 0 };
      const pos2 = { x: 10, y: 20 };
      const midpoint = SpriteUtils.getMidpoint(pos1, pos2);
      
      expect(midpoint).toEqual({ x: 5, y: 10 });
    });

    test('should calculate distance between positions', () => {
      const pos1 = { x: 0, y: 0 };
      const pos2 = { x: 3, y: 4 };
      const distance = SpriteUtils.getDistanceBetweenPositions(pos1, pos2);
      
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    test('should clamp values correctly', () => {
      expect(SpriteUtils.clamp(5, 0, 10)).toBe(5);
      expect(SpriteUtils.clamp(-5, 0, 10)).toBe(0);
      expect(SpriteUtils.clamp(15, 0, 10)).toBe(10);
    });

    test('should perform linear interpolation', () => {
      expect(SpriteUtils.lerp(0, 10, 0.5)).toBe(5);
      expect(SpriteUtils.lerp(0, 10, 0)).toBe(0);
      expect(SpriteUtils.lerp(0, 10, 1)).toBe(10);
    });
  });
});