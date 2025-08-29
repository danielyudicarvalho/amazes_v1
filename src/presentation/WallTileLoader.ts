// Wall tile loader for individual wall tiles from assets/tileset
import { SpriteAsset } from './AssetManager';

export interface WallTileConfig {
  key: string;
  imagePath: string;
  scale?: number;
  anchor?: { x: number; y: number };
  tint?: number;
}

export interface WallTileSet {
  walls: WallTileConfig[];
  defaultWall: string;
  cornerWalls?: string[];
  straightWalls?: string[];
  junctionWalls?: string[];
}

export class WallTileLoader {
  private scene: Phaser.Scene;
  private loadedWallTiles: Map<string, boolean> = new Map();
  private wallTileConfigs: Map<string, WallTileConfig> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Loads all wall tiles from the tileset directory
   */
  async loadWallTiles(): Promise<void> {
    const wallTiles = this.getWallTileConfigs();

    console.log(`Loading ${wallTiles.length} wall tiles...`);

    for (const wallConfig of wallTiles) {
      await this.loadWallTile(wallConfig);
    }

    console.log('All wall tiles loaded successfully');
  }

  /**
   * Loads a single wall tile
   */
  async loadWallTile(config: WallTileConfig): Promise<void> {
    if (this.loadedWallTiles.has(config.key)) {
      return; // Already loaded
    }

    try {
      // Load the image as a texture
      this.scene.load.image(config.key, config.imagePath);

      // Start the load if not already loading
      if (!this.scene.load.isLoading()) {
        this.scene.load.start();
      }

      // Wait for the load to complete
      await new Promise<void>((resolve, reject) => {
        const onComplete = () => {
          this.scene.load.off('complete', onComplete);
          this.scene.load.off('loaderror', onError);
          resolve();
        };

        const onError = (event: any) => {
          this.scene.load.off('complete', onComplete);
          this.scene.load.off('loaderror', onError);
          reject(new Error(`Failed to load wall tile: ${config.key}`));
        };

        this.scene.load.on('complete', onComplete);
        this.scene.load.on('loaderror', onError);
      });

      this.loadedWallTiles.set(config.key, true);
      this.wallTileConfigs.set(config.key, config);

      console.log(`Loaded wall tile: ${config.key}`);
    } catch (error) {
      console.error(`Failed to load wall tile ${config.key}:`, error);
      throw error;
    }
  }

  /**
   * Gets a wall tile configuration by key
   */
  getWallTileConfig(key: string): WallTileConfig | null {
    return this.wallTileConfigs.get(key) || null;
  }

  /**
   * Checks if a wall tile is loaded
   */
  isWallTileLoaded(key: string): boolean {
    return this.loadedWallTiles.has(key) && this.scene.textures.exists(key);
  }

  /**
   * Gets all available wall tile keys
   */
  getAvailableWallTiles(): string[] {
    return Array.from(this.wallTileConfigs.keys());
  }

  /**
   * Creates a sprite from a wall tile
   */
  createWallSprite(key: string, x: number = 0, y: number = 0): Phaser.GameObjects.Sprite | null {
    if (!this.isWallTileLoaded(key)) {
      console.warn(`Wall tile ${key} not loaded`);
      return null;
    }

    const config = this.wallTileConfigs.get(key);
    if (!config) {
      console.warn(`Wall tile config ${key} not found`);
      return null;
    }

    const sprite = this.scene.add.sprite(x, y, key);

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

    return sprite;
  }

  /**
   * Gets a random wall tile key for variety
   */
  getRandomWallTile(): string {
    const availableTiles = this.getAvailableWallTiles();
    if (availableTiles.length === 0) {
      return 'wall1'; // Fallback
    }

    const randomIndex = Math.floor(Math.random() * availableTiles.length);
    return availableTiles[randomIndex];
  }

  /**
   * Gets a wall tile based on position for consistent patterns
   */
  getWallTileForPosition(x: number, y: number): string {
    const availableTiles = this.getAvailableWallTiles();
    if (availableTiles.length === 0) {
      return 'wall1'; // Fallback
    }

    // Use position-based selection for consistent patterns
    const index = (x + y * 3) % availableTiles.length;
    return availableTiles[index];
  }

  /**
   * Gets wall tile configurations from manifest or default set
   */
  private getWallTileConfigs(): WallTileConfig[] {
    // Default wall tile configurations
    const defaultWallTiles: WallTileConfig[] = [
      {
        key: 'wall1',
        imagePath: 'assets/tileset/block.png',
        scale: 1.0,
        anchor: { x: 0.5, y: 0.5 }
      },
      {
        key: 'wall2',
        imagePath: 'assets/tileset/blocke.png',
        scale: 1.0,
        anchor: { x: 0.5, y: 0.5 }
      },
      {
        key: 'wall3',
        imagePath: 'assets/tileset/blockr.png',
        scale: 1.0,
        anchor: { x: 0.5, y: 0.5 }
      },
      {
        key: 'wall4',
        imagePath: 'assets/tileset/rocky_down.png',
        scale: 1.0,
        anchor: { x: 0.5, y: 0.5 }
      },
      {
        key: 'wall5',
        imagePath: 'assets/tileset/rocky_left.png',
        scale: 1.0,
        anchor: { x: 0.5, y: 0.5 }
      },
      {
        key: 'wall6',
        imagePath: 'assets/tileset/rocky_right.png',
        scale: 1.0,
        anchor: { x: 0.5, y: 0.5 }
      },
      {
        key: 'wall7',
        imagePath: 'assets/tileset/rocky_up.png',
        scale: 1.0,
        anchor: { x: 0.5, y: 0.5 }
      },
      {
        key: 'wall8',
        imagePath: 'assets/tileset/spike_1.png',
        scale: 1.0,
        anchor: { x: 0.5, y: 0.5 }
      },
      {
        key: 'wall9',
        imagePath: 'assets/tileset/spike_2.png',
        scale: 1.0,
        anchor: { x: 0.5, y: 0.5 }
      }
    ];

    return defaultWallTiles;
  }

  /**
   * Preloads all wall tiles at once
   */
  preloadAllWallTiles(): void {
    const wallTiles = this.getWallTileConfigs();

    wallTiles.forEach(config => {
      if (!this.loadedWallTiles.has(config.key)) {
        this.scene.load.image(config.key, config.imagePath);
        this.wallTileConfigs.set(config.key, config);
      }
    });

    // Mark as loaded (will be verified when textures are actually loaded)
    wallTiles.forEach(config => {
      this.loadedWallTiles.set(config.key, true);
    });

    console.log(`Queued ${wallTiles.length} wall tiles for loading`);
  }

  /**
   * Validates that all wall tiles are properly loaded
   */
  validateWallTiles(): { isValid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const [key] of this.wallTileConfigs.entries()) {
      if (!this.scene.textures.exists(key)) {
        missing.push(key);
      }
    }

    return {
      isValid: missing.length === 0,
      missing
    };
  }

  /**
   * Cleans up loaded wall tiles
   */
  cleanup(): void {
    for (const [key] of this.loadedWallTiles.entries()) {
      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
      }
    }

    this.loadedWallTiles.clear();
    this.wallTileConfigs.clear();

    console.log('Wall tile loader cleaned up');
  }
}