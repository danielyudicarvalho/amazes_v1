// Sprite rendering system to replace geometric shapes with 2D art
import { Position } from '../core/types/GameState';
import { MazeCell } from '../core/types/Level';
import { MazeTileRenderer, IMazeTileRenderer } from './MazeTileRenderer';

export interface SpriteConfig {
  key: string;
  atlas?: string;
  frame?: string;
  scale?: number;
  anchor?: { x: number; y: number };
  tint?: number;
  alpha?: number;
}

export interface LayerConfig {
  name: string;
  depth: number;
  visible: boolean;
}

export interface SpriteFactoryOptions {
  position: Position;
  config: SpriteConfig;
  layer?: string;
  animations?: string[];
}

export interface ISpriteRenderer {
  /**
   * Creates a player sprite with proper positioning and animations
   */
  createPlayerSprite(position: Position, theme?: string): Phaser.GameObjects.Sprite;

  /**
   * Creates an orb sprite with collection animations
   */
  createOrbSprite(position: Position, orbType: string, theme?: string): Phaser.GameObjects.Sprite;

  /**
   * Creates maze tile sprites for walls and floors
   */
  createMazeTiles(mazeData: MazeCell[][], theme?: string): Phaser.GameObjects.Group;

  /**
   * Creates UI element sprites (buttons, panels, etc.)
   */
  createUISprite(elementType: string, position: Position, theme?: string): Phaser.GameObjects.Sprite;

  /**
   * Updates sprite theme without recreating the sprite
   */
  updateSpriteTheme(sprite: Phaser.GameObjects.Sprite, newTheme: string): void;

  /**
   * Sets up rendering layers for proper depth sorting
   */
  setupLayers(): void;

  /**
   * Gets a specific rendering layer
   */
  getLayer(layerName: string): Phaser.GameObjects.Layer | null;

  /**
   * Positions a sprite using grid coordinates
   */
  positionSprite(sprite: Phaser.GameObjects.Sprite, gridPosition: Position, cellSize?: number): void;

  /**
   * Scales a sprite based on screen size and settings
   */
  scaleSprite(sprite: Phaser.GameObjects.Sprite, baseScale?: number): void;

  /**
   * Destroys all sprites and cleans up resources
   */
  destroy(): void;
}

export class SpriteRenderer implements ISpriteRenderer {
  private scene: Phaser.Scene;
  private assetManager: any; // Will be properly typed when enhanced asset manager is available
  private layers: Map<string, Phaser.GameObjects.Layer> = new Map();
  private sprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private currentTheme: string = 'default';
  private cellSize: number = 24; // Default cell size matching existing game
  private spritePool: Map<string, Phaser.GameObjects.Sprite[]> = new Map();
  private maxPoolSize: number = 50;
  private mazeTileRenderer: IMazeTileRenderer;

  // Layer configuration for proper rendering order
  private readonly layerConfigs: LayerConfig[] = [
    { name: 'background', depth: 0, visible: true },
    { name: 'maze', depth: 100, visible: true },
    { name: 'gameObjects', depth: 200, visible: true },
    { name: 'effects', depth: 300, visible: true },
    { name: 'ui', depth: 400, visible: true }
  ];

  constructor(scene: Phaser.Scene, assetManager?: any) {
    this.scene = scene;
    this.assetManager = assetManager;
    this.setupLayers();
    
    // Initialize maze tile renderer with layer manager reference
    this.mazeTileRenderer = new MazeTileRenderer(scene, this, assetManager);
  }

  setupLayers(): void {
    // Clear existing layers
    this.layers.clear();

    // Create layers based on configuration
    for (const layerConfig of this.layerConfigs) {
      const layer = this.scene.add.layer();
      layer.setName(layerConfig.name);
      layer.setDepth(layerConfig.depth);
      layer.setVisible(layerConfig.visible);
      
      this.layers.set(layerConfig.name, layer);
    }

    console.log(`SpriteRenderer: Created ${this.layers.size} rendering layers`);
  }

  getLayer(layerName: string): Phaser.GameObjects.Layer | null {
    return this.layers.get(layerName) || null;
  }

  createPlayerSprite(position: Position, theme?: string): Phaser.GameObjects.Sprite {
    const themeId = theme || this.currentTheme;
    
    // Try to get themed sprite configuration
    let spriteConfig: SpriteConfig;
    
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const themeAsset = this.assetManager.getThemeAsset(themeId, 'player', 'default');
      if (themeAsset) {
        spriteConfig = {
          key: themeAsset.key,
          atlas: themeAsset.atlas,
          frame: themeAsset.frame,
          scale: themeAsset.scale || 1,
          anchor: themeAsset.anchor || { x: 0.5, y: 0.5 }
        };
      } else {
        // Fallback to basic configuration
        spriteConfig = this.getDefaultPlayerConfig();
      }
    } else {
      // Fallback when asset manager is not available
      spriteConfig = this.getDefaultPlayerConfig();
    }

    const sprite = this.createSpriteFromConfig(spriteConfig, position, 'gameObjects');
    
    // Store sprite reference
    this.sprites.set('player', sprite);
    
    // Set up player-specific properties
    sprite.setData('type', 'player');
    sprite.setData('theme', themeId);
    
    console.log(`Created player sprite at (${position.x}, ${position.y}) with theme: ${themeId}`);
    
    return sprite;
  }

  createOrbSprite(position: Position, orbType: string, theme?: string): Phaser.GameObjects.Sprite {
    const themeId = theme || this.currentTheme;
    
    // Try to get themed orb configuration
    let spriteConfig: SpriteConfig;
    
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const themeAssets = this.assetManager.getThemeAsset(themeId, 'orbs', orbType);
      if (themeAssets && Array.isArray(themeAssets) && themeAssets.length > 0) {
        const orbAsset = themeAssets[0]; // Use first orb variant
        spriteConfig = {
          key: orbAsset.key,
          atlas: orbAsset.atlas,
          frame: orbAsset.frame,
          scale: orbAsset.scale || 0.8,
          anchor: orbAsset.anchor || { x: 0.5, y: 0.5 }
        };
      } else {
        spriteConfig = this.getDefaultOrbConfig(orbType);
      }
    } else {
      spriteConfig = this.getDefaultOrbConfig(orbType);
    }

    const sprite = this.createSpriteFromConfig(spriteConfig, position, 'gameObjects');
    
    // Set up orb-specific properties
    sprite.setData('type', 'orb');
    sprite.setData('orbType', orbType);
    sprite.setData('theme', themeId);
    
    // Add subtle floating animation
    this.addFloatingAnimation(sprite);
    
    return sprite;
  }

  createMazeTiles(mazeData: MazeCell[][], theme?: string): Phaser.GameObjects.Group {
    const themeId = theme || this.currentTheme;
    
    // Use the enhanced maze tile renderer for comprehensive tile-based rendering
    try {
      this.mazeTileRenderer.setCurrentTheme(themeId);
      this.mazeTileRenderer.setCellSize(this.cellSize);
      
      const mazeGroup = this.mazeTileRenderer.renderMaze(mazeData, themeId);
      
      console.log(`Created enhanced maze tiles: ${mazeData.length}x${mazeData[0]?.length || 0} grid with theme: ${themeId}`);
      
      return mazeGroup;
    } catch (error) {
      console.warn('Enhanced maze rendering failed, falling back to basic implementation:', error);
      
      // Fallback to basic maze rendering
      return this.createBasicMazeTiles(mazeData, themeId);
    }
  }

  createUISprite(elementType: string, position: Position, theme?: string): Phaser.GameObjects.Sprite {
    const themeId = theme || this.currentTheme;
    
    // Try to get themed UI configuration
    let spriteConfig: SpriteConfig;
    
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const uiAssets = this.assetManager.getThemeAsset(themeId, 'ui', elementType);
      if (uiAssets) {
        spriteConfig = {
          key: uiAssets.key,
          atlas: uiAssets.atlas,
          frame: uiAssets.frame,
          scale: uiAssets.scale || 1,
          anchor: uiAssets.anchor || { x: 0.5, y: 0.5 }
        };
      } else {
        spriteConfig = this.getDefaultUIConfig(elementType);
      }
    } else {
      spriteConfig = this.getDefaultUIConfig(elementType);
    }

    const sprite = this.createSpriteFromConfig(spriteConfig, position, 'ui');
    
    // Set up UI-specific properties
    sprite.setData('type', 'ui');
    sprite.setData('elementType', elementType);
    sprite.setData('theme', themeId);
    
    return sprite;
  }

  updateSpriteTheme(sprite: Phaser.GameObjects.Sprite, newTheme: string): void {
    const spriteType = sprite.getData('type');
    const elementType = sprite.getData('elementType') || sprite.getData('orbType') || 'default';
    
    if (!spriteType) {
      console.warn('Cannot update theme: sprite missing type data');
      return;
    }

    // Get new theme configuration
    let newConfig: SpriteConfig | null = null;
    
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const assetCategory = spriteType === 'ui' ? 'ui' : 
                           spriteType === 'orb' ? 'orbs' : 
                           spriteType;
      
      const themeAsset = this.assetManager.getThemeAsset(newTheme, assetCategory, elementType);
      if (themeAsset) {
        newConfig = {
          key: themeAsset.key,
          atlas: themeAsset.atlas,
          frame: themeAsset.frame,
          scale: themeAsset.scale || sprite.scale,
          anchor: themeAsset.anchor
        };
      }
    }

    if (newConfig) {
      // Update sprite texture and properties
      if (newConfig.atlas && newConfig.frame) {
        sprite.setTexture(newConfig.atlas, newConfig.frame);
      } else if (newConfig.key) {
        sprite.setTexture(newConfig.key);
      }
      
      if (newConfig.scale) {
        sprite.setScale(newConfig.scale);
      }
      
      if (newConfig.anchor) {
        sprite.setOrigin(newConfig.anchor.x, newConfig.anchor.y);
      }
      
      if (newConfig.tint !== undefined) {
        sprite.setTint(newConfig.tint);
      }
      
      if (newConfig.alpha !== undefined) {
        sprite.setAlpha(newConfig.alpha);
      }
      
      sprite.setData('theme', newTheme);
      
      console.log(`Updated sprite theme from ${sprite.getData('theme')} to ${newTheme}`);
    } else {
      console.warn(`No theme configuration found for ${spriteType} in theme ${newTheme}`);
    }
  }

  positionSprite(sprite: Phaser.GameObjects.Sprite, gridPosition: Position, cellSize?: number): void {
    const size = cellSize || this.cellSize;
    
    // Calculate world position from grid position
    // This matches the existing game's coordinate system
    const worldX = this.gridToWorldX(gridPosition.x, size);
    const worldY = this.gridToWorldY(gridPosition.y, size);
    
    sprite.setPosition(worldX, worldY);
  }

  scaleSprite(sprite: Phaser.GameObjects.Sprite, baseScale?: number): void {
    const scale = baseScale || 1;
    
    // Apply responsive scaling based on screen size
    const screenScale = Math.min(
      this.scene.scale.width / 800,  // Base width
      this.scene.scale.height / 600  // Base height
    );
    
    const finalScale = scale * Math.max(0.5, Math.min(2, screenScale));
    sprite.setScale(finalScale);
  }

  destroy(): void {
    // Destroy maze tile renderer
    if (this.mazeTileRenderer) {
      this.mazeTileRenderer.destroy();
    }
    
    // Clear sprite references
    this.sprites.clear();
    
    // Clear sprite pools
    for (const [poolKey, pool] of this.spritePool.entries()) {
      pool.forEach(sprite => {
        if (sprite && sprite.active) {
          sprite.destroy();
        }
      });
    }
    this.spritePool.clear();
    
    // Clear layers
    for (const [layerName, layer] of this.layers.entries()) {
      if (layer && layer.active) {
        layer.destroy();
      }
    }
    this.layers.clear();
    
    console.log('SpriteRenderer destroyed and cleaned up');
  }

  // Private helper methods

  private createBasicMazeTiles(mazeData: MazeCell[][], theme: string): Phaser.GameObjects.Group {
    const mazeGroup = this.scene.add.group();
    
    // Add maze group to maze layer
    const mazeLayer = this.getLayer('maze');
    if (mazeLayer) {
      mazeLayer.add(mazeGroup);
    }

    const rows = mazeData.length;
    const cols = mazeData[0]?.length || 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = mazeData[y][x];
        
        // Create floor tile
        const floorSprite = this.createFloorTile({ x, y }, theme);
        if (floorSprite) {
          mazeGroup.add(floorSprite);
        }

        // Create wall tiles based on cell walls
        const wallSprites = this.createWallTiles({ x, y }, cell.walls, theme);
        wallSprites.forEach(wallSprite => {
          if (wallSprite) {
            mazeGroup.add(wallSprite);
          }
        });
      }
    }

    console.log(`Created basic maze tiles: ${rows}x${cols} grid with theme: ${theme}`);
    
    return mazeGroup;
  }

  private createSpriteFromConfig(config: SpriteConfig, position: Position, layerName: string): Phaser.GameObjects.Sprite {
    let sprite: Phaser.GameObjects.Sprite;
    
    // Try to get sprite from pool first
    const poolKey = `${config.key}_${config.atlas || 'default'}_${config.frame || 'default'}`;
    sprite = this.getFromPool(poolKey);
    
    if (!sprite) {
      // Create new sprite
      if (config.atlas && config.frame) {
        sprite = this.scene.add.sprite(0, 0, config.atlas, config.frame);
      } else {
        sprite = this.scene.add.sprite(0, 0, config.key);
      }
    }
    
    // Apply configuration
    if (config.scale) {
      sprite.setScale(config.scale);
    }
    
    if (config.anchor) {
      sprite.setOrigin(config.anchor.x, config.anchor.y);
    }
    
    if (config.tint !== undefined) {
      sprite.setTint(config.tint);
    }
    
    if (config.alpha !== undefined) {
      sprite.setAlpha(config.alpha);
    }
    
    // Position the sprite
    this.positionSprite(sprite, position);
    
    // Add to appropriate layer
    const layer = this.getLayer(layerName);
    if (layer) {
      layer.add(sprite);
    }
    
    return sprite;
  }

  private createFloorTile(gridPosition: Position, theme: string): Phaser.GameObjects.Sprite | null {
    let floorConfig: SpriteConfig;
    
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const mazeAssets = this.assetManager.getThemeAsset(theme, 'maze', 'floors');
      if (mazeAssets && Array.isArray(mazeAssets) && mazeAssets.length > 0) {
        const floorAsset = mazeAssets[0]; // Use first floor variant
        floorConfig = {
          key: floorAsset.key,
          atlas: floorAsset.atlas,
          frame: floorAsset.frame,
          scale: floorAsset.scale || 1,
          anchor: { x: 0.5, y: 0.5 }
        };
      } else {
        return null; // No floor tiles in theme, use background color
      }
    } else {
      return null; // No asset manager, use background color
    }
    
    const sprite = this.createSpriteFromConfig(floorConfig, gridPosition, 'maze');
    sprite.setData('type', 'floor');
    
    return sprite;
  }

  private createWallTiles(gridPosition: Position, walls: number, theme: string): Phaser.GameObjects.Sprite[] {
    const wallSprites: Phaser.GameObjects.Sprite[] = [];
    
    if (!this.assetManager || !this.assetManager.getThemeAsset) {
      return wallSprites; // No walls without asset manager
    }
    
    const mazeAssets = this.assetManager.getThemeAsset(theme, 'maze', 'walls');
    if (!mazeAssets || !Array.isArray(mazeAssets) || mazeAssets.length === 0) {
      return wallSprites; // No wall assets in theme
    }
    
    const wallAsset = mazeAssets[0]; // Use first wall variant
    const wallConfig: SpriteConfig = {
      key: wallAsset.key,
      atlas: wallAsset.atlas,
      frame: wallAsset.frame,
      scale: wallAsset.scale || 1,
      anchor: { x: 0.5, y: 0.5 }
    };
    
    // Create wall sprites based on wall flags
    // Bit flags: 1=East, 2=South, 4=West, 8=North
    
    if (walls & 1) { // East wall
      const eastWall = this.createSpriteFromConfig(wallConfig, 
        { x: gridPosition.x + 0.5, y: gridPosition.y }, 'maze');
      eastWall.setData('type', 'wall');
      eastWall.setData('direction', 'east');
      wallSprites.push(eastWall);
    }
    
    if (walls & 2) { // South wall
      const southWall = this.createSpriteFromConfig(wallConfig, 
        { x: gridPosition.x, y: gridPosition.y + 0.5 }, 'maze');
      southWall.setData('type', 'wall');
      southWall.setData('direction', 'south');
      wallSprites.push(southWall);
    }
    
    if (walls & 4) { // West wall
      const westWall = this.createSpriteFromConfig(wallConfig, 
        { x: gridPosition.x - 0.5, y: gridPosition.y }, 'maze');
      westWall.setData('type', 'wall');
      westWall.setData('direction', 'west');
      wallSprites.push(westWall);
    }
    
    if (walls & 8) { // North wall
      const northWall = this.createSpriteFromConfig(wallConfig, 
        { x: gridPosition.x, y: gridPosition.y - 0.5 }, 'maze');
      northWall.setData('type', 'wall');
      northWall.setData('direction', 'north');
      wallSprites.push(northWall);
    }
    
    return wallSprites;
  }

  private getDefaultPlayerConfig(): SpriteConfig {
    return {
      key: 'player_default',
      scale: 1,
      anchor: { x: 0.5, y: 0.5 },
      tint: 0x4169E1 // Blue color matching existing player
    };
  }

  private getDefaultOrbConfig(orbType: string): SpriteConfig {
    // Color variations for different orb types
    const orbColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38BA8];
    const colorIndex = orbType.charCodeAt(0) % orbColors.length;
    
    return {
      key: 'orb_default',
      scale: 0.8,
      anchor: { x: 0.5, y: 0.5 },
      tint: orbColors[colorIndex]
    };
  }

  private getDefaultUIConfig(elementType: string): SpriteConfig {
    return {
      key: `ui_${elementType}_default`,
      scale: 1,
      anchor: { x: 0.5, y: 0.5 },
      tint: 0xF5E6D3 // Beige color matching existing UI
    };
  }

  private addFloatingAnimation(sprite: Phaser.GameObjects.Sprite): void {
    // Add subtle floating animation to orbs
    this.scene.tweens.add({
      targets: sprite,
      y: sprite.y - 2,
      duration: 1000 + Math.random() * 500, // Randomize timing
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private gridToWorldX(gridX: number, cellSize: number): number {
    // Match existing coordinate system from GameScene
    const mazeWidth = 10 * cellSize; // Assuming typical maze width
    const offsetX = (this.scene.scale.width - mazeWidth) / 2;
    return offsetX + gridX * cellSize + cellSize / 2;
  }

  private gridToWorldY(gridY: number, cellSize: number): number {
    // Match existing coordinate system from GameScene
    return 200 + gridY * cellSize + cellSize / 2;
  }

  private getFromPool(poolKey: string): Phaser.GameObjects.Sprite | null {
    const pool = this.spritePool.get(poolKey);
    if (pool && pool.length > 0) {
      const sprite = pool.pop();
      if (sprite && sprite.active) {
        sprite.setActive(true).setVisible(true);
        return sprite;
      }
    }
    return null;
  }

  private returnToPool(sprite: Phaser.GameObjects.Sprite, poolKey: string): void {
    const pool = this.spritePool.get(poolKey) || [];
    
    if (pool.length < this.maxPoolSize) {
      sprite.setActive(false).setVisible(false);
      sprite.removeAllListeners();
      pool.push(sprite);
      this.spritePool.set(poolKey, pool);
    } else {
      sprite.destroy();
    }
  }

  // Public utility methods

  /**
   * Sets the current theme for new sprites
   */
  setCurrentTheme(theme: string): void {
    this.currentTheme = theme;
    console.log(`SpriteRenderer theme set to: ${theme}`);
  }

  /**
   * Gets the current theme
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * Sets the cell size for grid positioning
   */
  setCellSize(size: number): void {
    this.cellSize = size;
  }

  /**
   * Gets the current cell size
   */
  getCellSize(): number {
    return this.cellSize;
  }

  /**
   * Gets sprite by ID
   */
  getSprite(spriteId: string): Phaser.GameObjects.Sprite | null {
    return this.sprites.get(spriteId) || null;
  }

  /**
   * Removes and destroys a sprite
   */
  removeSprite(spriteId: string): void {
    const sprite = this.sprites.get(spriteId);
    if (sprite) {
      sprite.destroy();
      this.sprites.delete(spriteId);
    }
  }

  /**
   * Gets all sprites of a specific type
   */
  getSpritesByType(type: string): Phaser.GameObjects.Sprite[] {
    const sprites: Phaser.GameObjects.Sprite[] = [];
    
    for (const layer of this.layers.values()) {
      layer.list.forEach((child: any) => {
        if (child instanceof Phaser.GameObjects.Sprite && child.getData('type') === type) {
          sprites.push(child);
        }
      });
    }
    
    return sprites;
  }

  /**
   * Updates all sprites with new theme
   */
  updateAllSpritesTheme(newTheme: string): void {
    for (const layer of this.layers.values()) {
      layer.list.forEach((child: any) => {
        if (child instanceof Phaser.GameObjects.Sprite) {
          this.updateSpriteTheme(child, newTheme);
        }
      });
    }
    
    this.currentTheme = newTheme;
    console.log(`Updated all sprites to theme: ${newTheme}`);
  }

  /**
   * Gets the maze tile renderer for advanced maze operations
   */
  getMazeTileRenderer(): IMazeTileRenderer {
    return this.mazeTileRenderer;
  }

  /**
   * Updates maze theme using the enhanced tile renderer
   */
  updateMazeTheme(mazeGroup: Phaser.GameObjects.Group, newTheme: string): void {
    if (this.mazeTileRenderer) {
      this.mazeTileRenderer.updateMazeTheme(mazeGroup, newTheme);
    }
  }
}