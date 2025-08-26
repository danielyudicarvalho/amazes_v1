// Factory for creating game object sprites with proper configuration
import { Position } from '../core/types/GameState';
import { SpriteConfig, SpriteFactoryOptions } from './SpriteRenderer';

export interface GameObjectSpriteConfig {
  type: 'player' | 'orb' | 'wall' | 'floor' | 'ui' | 'effect';
  variant?: string;
  theme?: string;
  animations?: string[];
  interactive?: boolean;
  physics?: boolean;
}

export interface SpriteFactoryConfig {
  scene: Phaser.Scene;
  assetManager?: any;
  defaultTheme?: string;
  cellSize?: number;
}

export class SpriteFactory {
  private scene: Phaser.Scene;
  private assetManager: any;
  private defaultTheme: string;
  private cellSize: number;
  private spriteConfigs: Map<string, SpriteConfig> = new Map();

  constructor(config: SpriteFactoryConfig) {
    this.scene = config.scene;
    this.assetManager = config.assetManager;
    this.defaultTheme = config.defaultTheme || 'default';
    this.cellSize = config.cellSize || 24;
    
    this.initializeDefaultConfigs();
  }

  /**
   * Creates a player sprite with movement animations
   */
  createPlayer(position: Position, config?: Partial<GameObjectSpriteConfig>): Phaser.GameObjects.Sprite {
    const spriteConfig = this.getPlayerConfig(config?.theme || this.defaultTheme, config?.variant);
    const sprite = this.createSprite(spriteConfig, position);
    
    // Set up player-specific properties
    sprite.setData('type', 'player');
    sprite.setData('gameObjectType', 'player');
    sprite.setName('player');
    
    // Add animations if available
    if (config?.animations) {
      this.setupAnimations(sprite, config.animations);
    }
    
    // Make interactive if specified
    if (config?.interactive) {
      this.makeInteractive(sprite);
    }
    
    return sprite;
  }

  /**
   * Creates an orb sprite with collection effects
   */
  createOrb(position: Position, orbId: string, config?: Partial<GameObjectSpriteConfig>): Phaser.GameObjects.Sprite {
    const spriteConfig = this.getOrbConfig(config?.theme || this.defaultTheme, config?.variant || 'default');
    const sprite = this.createSprite(spriteConfig, position);
    
    // Set up orb-specific properties
    sprite.setData('type', 'orb');
    sprite.setData('gameObjectType', 'orb');
    sprite.setData('orbId', orbId);
    sprite.setName(`orb_${orbId}`);
    
    // Add floating animation
    this.addFloatingAnimation(sprite);
    
    // Add animations if available
    if (config?.animations) {
      this.setupAnimations(sprite, config.animations);
    }
    
    return sprite;
  }

  /**
   * Creates a wall sprite for maze rendering
   */
  createWall(position: Position, direction: 'north' | 'south' | 'east' | 'west', config?: Partial<GameObjectSpriteConfig>): Phaser.GameObjects.Sprite {
    const spriteConfig = this.getWallConfig(config?.theme || this.defaultTheme, direction, config?.variant);
    const sprite = this.createSprite(spriteConfig, position);
    
    // Set up wall-specific properties
    sprite.setData('type', 'wall');
    sprite.setData('gameObjectType', 'wall');
    sprite.setData('direction', direction);
    sprite.setName(`wall_${direction}_${position.x}_${position.y}`);
    
    return sprite;
  }

  /**
   * Creates a floor sprite for maze rendering
   */
  createFloor(position: Position, config?: Partial<GameObjectSpriteConfig>): Phaser.GameObjects.Sprite {
    const spriteConfig = this.getFloorConfig(config?.theme || this.defaultTheme, config?.variant);
    const sprite = this.createSprite(spriteConfig, position);
    
    // Set up floor-specific properties
    sprite.setData('type', 'floor');
    sprite.setData('gameObjectType', 'floor');
    sprite.setName(`floor_${position.x}_${position.y}`);
    
    return sprite;
  }

  /**
   * Creates a UI element sprite
   */
  createUIElement(elementType: string, position: Position, config?: Partial<GameObjectSpriteConfig>): Phaser.GameObjects.Sprite {
    const spriteConfig = this.getUIConfig(config?.theme || this.defaultTheme, elementType, config?.variant);
    const sprite = this.createSprite(spriteConfig, position);
    
    // Set up UI-specific properties
    sprite.setData('type', 'ui');
    sprite.setData('gameObjectType', 'ui');
    sprite.setData('elementType', elementType);
    sprite.setName(`ui_${elementType}`);
    
    // Make interactive by default for UI elements
    if (config?.interactive !== false) {
      this.makeInteractive(sprite);
    }
    
    return sprite;
  }

  /**
   * Creates an effect sprite for particles and animations
   */
  createEffect(effectType: string, position: Position, config?: Partial<GameObjectSpriteConfig>): Phaser.GameObjects.Sprite {
    const spriteConfig = this.getEffectConfig(config?.theme || this.defaultTheme, effectType, config?.variant);
    const sprite = this.createSprite(spriteConfig, position);
    
    // Set up effect-specific properties
    sprite.setData('type', 'effect');
    sprite.setData('gameObjectType', 'effect');
    sprite.setData('effectType', effectType);
    sprite.setName(`effect_${effectType}_${Date.now()}`);
    
    // Add animations if available
    if (config?.animations) {
      this.setupAnimations(sprite, config.animations);
    }
    
    return sprite;
  }

  /**
   * Creates a sprite from factory options
   */
  createFromOptions(options: SpriteFactoryOptions): Phaser.GameObjects.Sprite {
    const sprite = this.createSprite(options.config, options.position);
    
    if (options.animations) {
      this.setupAnimations(sprite, options.animations);
    }
    
    return sprite;
  }

  /**
   * Updates the default theme for new sprites
   */
  setDefaultTheme(theme: string): void {
    this.defaultTheme = theme;
  }

  /**
   * Gets the current default theme
   */
  getDefaultTheme(): string {
    return this.defaultTheme;
  }

  /**
   * Registers a custom sprite configuration
   */
  registerSpriteConfig(key: string, config: SpriteConfig): void {
    this.spriteConfigs.set(key, config);
  }

  /**
   * Gets a registered sprite configuration
   */
  getSpriteConfig(key: string): SpriteConfig | null {
    return this.spriteConfigs.get(key) || null;
  }

  // Private helper methods

  private createSprite(config: SpriteConfig, position: Position): Phaser.GameObjects.Sprite {
    let sprite: Phaser.GameObjects.Sprite;
    
    // Create sprite based on configuration
    if (config.atlas && config.frame) {
      sprite = this.scene.add.sprite(0, 0, config.atlas, config.frame);
    } else {
      sprite = this.scene.add.sprite(0, 0, config.key);
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
    
    return sprite;
  }

  private getPlayerConfig(theme: string, variant?: string): SpriteConfig {
    // Try to get themed configuration
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const themeAsset = this.assetManager.getThemeAsset(theme, 'player', variant || 'default');
      if (themeAsset) {
        return {
          key: themeAsset.key,
          atlas: themeAsset.atlas,
          frame: themeAsset.frame,
          scale: themeAsset.scale || 1,
          anchor: themeAsset.anchor || { x: 0.5, y: 0.5 }
        };
      }
    }
    
    // Fallback configuration
    return this.spriteConfigs.get('player_default') || {
      key: 'player_circle',
      scale: 1,
      anchor: { x: 0.5, y: 0.5 },
      tint: 0x4169E1
    };
  }

  private getOrbConfig(theme: string, variant: string): SpriteConfig {
    // Try to get themed configuration
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const orbAssets = this.assetManager.getThemeAsset(theme, 'orbs', variant);
      if (orbAssets && Array.isArray(orbAssets) && orbAssets.length > 0) {
        const orbAsset = orbAssets[0];
        return {
          key: orbAsset.key,
          atlas: orbAsset.atlas,
          frame: orbAsset.frame,
          scale: orbAsset.scale || 0.8,
          anchor: orbAsset.anchor || { x: 0.5, y: 0.5 }
        };
      }
    }
    
    // Fallback configuration with color variation
    const orbColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38BA8];
    const colorIndex = variant.charCodeAt(0) % orbColors.length;
    
    return this.spriteConfigs.get('orb_default') || {
      key: 'orb_circle',
      scale: 0.8,
      anchor: { x: 0.5, y: 0.5 },
      tint: orbColors[colorIndex]
    };
  }

  private getWallConfig(theme: string, direction: string, variant?: string): SpriteConfig {
    // Try to get themed configuration
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const mazeAssets = this.assetManager.getThemeAsset(theme, 'maze', 'walls');
      if (mazeAssets && Array.isArray(mazeAssets) && mazeAssets.length > 0) {
        const wallAsset = mazeAssets[0];
        return {
          key: wallAsset.key,
          atlas: wallAsset.atlas,
          frame: wallAsset.frame,
          scale: wallAsset.scale || 1,
          anchor: wallAsset.anchor || { x: 0.5, y: 0.5 }
        };
      }
    }
    
    // Fallback configuration
    return this.spriteConfigs.get('wall_default') || {
      key: 'wall_rectangle',
      scale: 1,
      anchor: { x: 0.5, y: 0.5 },
      tint: 0x7FB069
    };
  }

  private getFloorConfig(theme: string, variant?: string): SpriteConfig {
    // Try to get themed configuration
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const mazeAssets = this.assetManager.getThemeAsset(theme, 'maze', 'floors');
      if (mazeAssets && Array.isArray(mazeAssets) && mazeAssets.length > 0) {
        const floorAsset = mazeAssets[0];
        return {
          key: floorAsset.key,
          atlas: floorAsset.atlas,
          frame: floorAsset.frame,
          scale: floorAsset.scale || 1,
          anchor: floorAsset.anchor || { x: 0.5, y: 0.5 }
        };
      }
    }
    
    // Fallback configuration
    return this.spriteConfigs.get('floor_default') || {
      key: 'floor_rectangle',
      scale: 1,
      anchor: { x: 0.5, y: 0.5 },
      tint: 0xF5E6D3
    };
  }

  private getUIConfig(theme: string, elementType: string, variant?: string): SpriteConfig {
    // Try to get themed configuration
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const uiAssets = this.assetManager.getThemeAsset(theme, 'ui', elementType);
      if (uiAssets) {
        return {
          key: uiAssets.key,
          atlas: uiAssets.atlas,
          frame: uiAssets.frame,
          scale: uiAssets.scale || 1,
          anchor: uiAssets.anchor || { x: 0.5, y: 0.5 }
        };
      }
    }
    
    // Fallback configuration
    return this.spriteConfigs.get(`ui_${elementType}_default`) || {
      key: `ui_${elementType}`,
      scale: 1,
      anchor: { x: 0.5, y: 0.5 },
      tint: 0xF5E6D3
    };
  }

  private getEffectConfig(theme: string, effectType: string, variant?: string): SpriteConfig {
    // Try to get themed configuration
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const effectAssets = this.assetManager.getThemeAsset(theme, 'effects', effectType);
      if (effectAssets) {
        return {
          key: effectAssets.key,
          atlas: effectAssets.atlas,
          frame: effectAssets.frame,
          scale: effectAssets.scale || 1,
          anchor: effectAssets.anchor || { x: 0.5, y: 0.5 }
        };
      }
    }
    
    // Fallback configuration
    return this.spriteConfigs.get(`effect_${effectType}_default`) || {
      key: `effect_${effectType}`,
      scale: 1,
      anchor: { x: 0.5, y: 0.5 },
      tint: 0xFFFFFF
    };
  }

  private positionSprite(sprite: Phaser.GameObjects.Sprite, position: Position): void {
    // Convert grid position to world coordinates
    const worldX = this.gridToWorldX(position.x);
    const worldY = this.gridToWorldY(position.y);
    
    sprite.setPosition(worldX, worldY);
  }

  private gridToWorldX(gridX: number): number {
    // Match existing coordinate system from GameScene
    const mazeWidth = 10 * this.cellSize; // Assuming typical maze width
    const offsetX = (this.scene.scale.width - mazeWidth) / 2;
    return offsetX + gridX * this.cellSize + this.cellSize / 2;
  }

  private gridToWorldY(gridY: number): number {
    // Match existing coordinate system from GameScene
    return 200 + gridY * this.cellSize + this.cellSize / 2;
  }

  private setupAnimations(sprite: Phaser.GameObjects.Sprite, animations: string[]): void {
    // Store animation references on the sprite
    sprite.setData('animations', animations);
    
    // Play first animation if available
    if (animations.length > 0 && this.scene.anims.exists(animations[0])) {
      sprite.play(animations[0]);
    }
  }

  private makeInteractive(sprite: Phaser.GameObjects.Sprite): void {
    sprite.setInteractive({ useHandCursor: true });
    
    // Add basic hover effects
    sprite.on('pointerover', () => {
      sprite.setTint(0xFFFFFF);
    });
    
    sprite.on('pointerout', () => {
      const originalTint = sprite.getData('originalTint') || 0xFFFFFF;
      sprite.setTint(originalTint);
    });
  }

  private addFloatingAnimation(sprite: Phaser.GameObjects.Sprite): void {
    // Add subtle floating animation
    this.scene.tweens.add({
      targets: sprite,
      y: sprite.y - 2,
      duration: 1000 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private initializeDefaultConfigs(): void {
    // Initialize default sprite configurations for fallback
    this.spriteConfigs.set('player_default', {
      key: 'player_circle',
      scale: 1,
      anchor: { x: 0.5, y: 0.5 },
      tint: 0x4169E1
    });
    
    this.spriteConfigs.set('orb_default', {
      key: 'orb_circle',
      scale: 0.8,
      anchor: { x: 0.5, y: 0.5 },
      tint: 0xFF6B6B
    });
    
    this.spriteConfigs.set('wall_default', {
      key: 'wall_rectangle',
      scale: 1,
      anchor: { x: 0.5, y: 0.5 },
      tint: 0x7FB069
    });
    
    this.spriteConfigs.set('floor_default', {
      key: 'floor_rectangle',
      scale: 1,
      anchor: { x: 0.5, y: 0.5 },
      tint: 0xF5E6D3
    });
  }
}