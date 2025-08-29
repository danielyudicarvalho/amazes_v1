// Elf Character Asset Loader - Loads and manages the cute elf character assets
import { Position } from '../core/types/GameState';
import { Direction } from '../core/GameCore';

export interface ElfCharacterConfig {
  character: {
    id: string;
    name: string;
    description: string;
    size: { width: number; height: number };
    scale: number;
    anchor: { x: number; y: number };
  };
  assets: {
    idle_frames: Record<string, string>;
    walking_frames: Record<string, string[]>;
  };
  animations: {
    idle: { frameRate: number; repeat: number; yoyo: boolean };
    walking: { frameRate: number; repeat: number; yoyo: boolean; duration: number };
  };
  direction_mapping: Record<Direction, string>;
}

export interface ElfAssetLoadResult {
  success: boolean;
  loadedTextures: string[];
  createdAnimations: string[];
  errors: string[];
}

export class ElfCharacterLoader {
  private scene: Phaser.Scene;
  private config: ElfCharacterConfig | null = null;
  private basePath: string;
  private loadedTextures: Map<string, Phaser.Textures.Texture> = new Map();
  private createdAnimations: Set<string> = new Set();

  constructor(scene: Phaser.Scene, basePath: string = 'src/assets/character/a_cute_elf/') {
    this.scene = scene;
    this.basePath = basePath;
  }

  /**
   * Loads the elf character configuration
   */
  async loadConfig(): Promise<void> {
    try {
      const configPath = `${this.basePath}elf-character-config.json`;
      const response = await fetch(configPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load elf config: ${response.statusText}`);
      }
      
      this.config = await response.json();
      console.log('Elf character config loaded successfully');
    } catch (error) {
      console.error('Failed to load elf character config:', error);
      throw error;
    }
  }

  /**
   * Loads all elf character assets (textures and animations)
   */
  async loadAssets(): Promise<ElfAssetLoadResult> {
    if (!this.config) {
      throw new Error('Config not loaded. Call loadConfig() first.');
    }

    const result: ElfAssetLoadResult = {
      success: true,
      loadedTextures: [],
      createdAnimations: [],
      errors: []
    };

    try {
      // Load idle frame textures
      await this.loadIdleFrames(result);
      
      // Load walking animation frames
      await this.loadWalkingFrames(result);
      
      // Create Phaser animations
      this.createAnimations(result);
      
      console.log(`Elf character assets loaded: ${result.loadedTextures.length} textures, ${result.createdAnimations.length} animations`);
      
    } catch (error) {
      result.success = false;
      result.errors.push(error.message);
      console.error('Failed to load elf character assets:', error);
    }

    return result;
  }

  /**
   * Gets the texture key for a specific direction and state
   */
  getTextureKey(direction: Direction, state: 'idle' | 'walking', frameIndex?: number): string {
    const mappedDirection = this.config?.direction_mapping[direction] || direction;
    
    if (state === 'idle') {
      return `elf_idle_${mappedDirection}`;
    } else {
      const frame = frameIndex !== undefined ? `_${frameIndex.toString().padStart(3, '0')}` : '';
      return `elf_walk_${mappedDirection}${frame}`;
    }
  }

  /**
   * Gets the animation key for a specific direction and state
   */
  getAnimationKey(direction: Direction, state: 'idle' | 'walking'): string {
    const mappedDirection = this.config?.direction_mapping[direction] || direction;
    return `elf_${state}_${mappedDirection}`;
  }

  /**
   * Checks if all assets are loaded
   */
  areAssetsLoaded(): boolean {
    if (!this.config) return false;
    
    // Check if all expected textures are loaded
    const expectedTextures = this.getExpectedTextureKeys();
    return expectedTextures.every(key => this.scene.textures.exists(key));
  }

  /**
   * Gets all expected texture keys based on config
   */
  private getExpectedTextureKeys(): string[] {
    if (!this.config) return [];
    
    const keys: string[] = [];
    
    // Idle frame keys
    Object.keys(this.config.assets.idle_frames).forEach(direction => {
      keys.push(`elf_idle_${direction.replace('_', '-')}`);
    });
    
    // Walking frame keys
    Object.entries(this.config.assets.walking_frames).forEach(([direction, frames]) => {
      frames.forEach((_, index) => {
        keys.push(`elf_walk_${direction}_${index.toString().padStart(3, '0')}`);
      });
    });
    
    return keys;
  }

  /**
   * Loads idle frame textures
   */
  private async loadIdleFrames(result: ElfAssetLoadResult): Promise<void> {
    if (!this.config) return;
    
    const loadPromises: Promise<void>[] = [];
    
    Object.entries(this.config.assets.idle_frames).forEach(([direction, framePath]) => {
      const textureKey = `elf_idle_${direction.replace('_', '-')}`;
      const fullPath = `${this.basePath}${framePath}`;
      
      const loadPromise = this.loadSingleTexture(textureKey, fullPath)
        .then(() => {
          result.loadedTextures.push(textureKey);
        })
        .catch(error => {
          result.errors.push(`Failed to load idle frame ${direction}: ${error.message}`);
        });
      
      loadPromises.push(loadPromise);
    });
    
    await Promise.all(loadPromises);
  }

  /**
   * Loads walking animation frame textures
   */
  private async loadWalkingFrames(result: ElfAssetLoadResult): Promise<void> {
    if (!this.config) return;
    
    const loadPromises: Promise<void>[] = [];
    
    Object.entries(this.config.assets.walking_frames).forEach(([direction, frames]) => {
      frames.forEach((framePath, index) => {
        const textureKey = `elf_walk_${direction}_${index.toString().padStart(3, '0')}`;
        const fullPath = `${this.basePath}${framePath}`;
        
        const loadPromise = this.loadSingleTexture(textureKey, fullPath)
          .then(() => {
            result.loadedTextures.push(textureKey);
          })
          .catch(error => {
            result.errors.push(`Failed to load walking frame ${direction}[${index}]: ${error.message}`);
          });
        
        loadPromises.push(loadPromise);
      });
    });
    
    await Promise.all(loadPromises);
  }

  /**
   * Loads a single texture with error handling
   */
  private loadSingleTexture(key: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if texture already exists
      if (this.scene.textures.exists(key)) {
        resolve();
        return;
      }
      
      // Load the texture
      this.scene.load.image(key, path);
      
      // Set up completion handlers
      const onComplete = () => {
        if (this.scene.textures.exists(key)) {
          this.loadedTextures.set(key, this.scene.textures.get(key));
          resolve();
        } else {
          reject(new Error(`Texture ${key} failed to load from ${path}`));
        }
        cleanup();
      };
      
      const onError = (error: any) => {
        reject(new Error(`Failed to load texture ${key}: ${error}`));
        cleanup();
      };
      
      const cleanup = () => {
        this.scene.load.off('complete', onComplete);
        this.scene.load.off('loaderror', onError);
      };
      
      this.scene.load.once('complete', onComplete);
      this.scene.load.once('loaderror', onError);
      
      // Start loading if not already started
      if (!this.scene.load.isLoading()) {
        this.scene.load.start();
      }
    });
  }

  /**
   * Creates Phaser animations from loaded textures
   */
  private createAnimations(result: ElfAssetLoadResult): void {
    if (!this.config) return;
    
    // Create idle animations for each direction
    Object.keys(this.config.assets.idle_frames).forEach(direction => {
      const animKey = `elf_idle_${direction.replace('_', '-')}`;
      const textureKey = `elf_idle_${direction.replace('_', '-')}`;
      
      if (this.scene.textures.exists(textureKey) && !this.scene.anims.exists(animKey)) {
        try {
          this.scene.anims.create({
            key: animKey,
            frames: [{ key: textureKey }],
            frameRate: this.config.animations.idle.frameRate,
            repeat: this.config.animations.idle.repeat,
            yoyo: this.config.animations.idle.yoyo
          });
          
          this.createdAnimations.add(animKey);
          result.createdAnimations.push(animKey);
        } catch (error) {
          result.errors.push(`Failed to create idle animation ${direction}: ${error.message}`);
        }
      }
    });
    
    // Create walking animations for each direction
    Object.entries(this.config.assets.walking_frames).forEach(([direction, frames]) => {
      const animKey = `elf_walk_${direction}`;
      
      if (!this.scene.anims.exists(animKey)) {
        try {
          const animFrames = frames.map((_, index) => ({
            key: `elf_walk_${direction}_${index.toString().padStart(3, '0')}`
          })).filter(frame => this.scene.textures.exists(frame.key));
          
          if (animFrames.length > 0) {
            this.scene.anims.create({
              key: animKey,
              frames: animFrames,
              frameRate: this.config.animations.walking.frameRate,
              repeat: this.config.animations.walking.repeat,
              yoyo: this.config.animations.walking.yoyo
            });
            
            this.createdAnimations.add(animKey);
            result.createdAnimations.push(animKey);
          }
        } catch (error) {
          result.errors.push(`Failed to create walking animation ${direction}: ${error.message}`);
        }
      }
    });
  }

  /**
   * Creates a sprite with the elf character
   */
  createElfSprite(position: Position, direction: Direction = 'down'): Phaser.GameObjects.Sprite | null {
    if (!this.areAssetsLoaded()) {
      console.warn('Elf character assets not fully loaded');
      return null;
    }
    
    const textureKey = this.getTextureKey(direction, 'idle');
    
    if (!this.scene.textures.exists(textureKey)) {
      console.warn(`Elf texture ${textureKey} not found`);
      return null;
    }
    
    const sprite = this.scene.add.sprite(position.x, position.y, textureKey);
    
    if (this.config) {
      sprite.setScale(this.config.character.scale);
      sprite.setOrigin(this.config.character.anchor.x, this.config.character.anchor.y);
    }
    
    return sprite;
  }

  /**
   * Gets the character configuration
   */
  getConfig(): ElfCharacterConfig | null {
    return this.config;
  }

  /**
   * Gets all loaded texture keys
   */
  getLoadedTextures(): string[] {
    return Array.from(this.loadedTextures.keys());
  }

  /**
   * Gets all created animation keys
   */
  getCreatedAnimations(): string[] {
    return Array.from(this.createdAnimations);
  }

  /**
   * Validates that all expected assets are available
   */
  validateAssets(): { isValid: boolean; missing: string[]; errors: string[] } {
    const result = {
      isValid: true,
      missing: [] as string[],
      errors: [] as string[]
    };
    
    if (!this.config) {
      result.isValid = false;
      result.errors.push('No configuration loaded');
      return result;
    }
    
    const expectedTextures = this.getExpectedTextureKeys();
    const missingTextures = expectedTextures.filter(key => !this.scene.textures.exists(key));
    
    if (missingTextures.length > 0) {
      result.isValid = false;
      result.missing = missingTextures;
    }
    
    return result;
  }

  /**
   * Cleans up loaded assets
   */
  cleanup(): void {
    // Remove loaded textures from Phaser
    for (const textureKey of this.loadedTextures.keys()) {
      if (this.scene.textures.exists(textureKey)) {
        this.scene.textures.remove(textureKey);
      }
    }
    
    // Remove created animations
    for (const animKey of this.createdAnimations) {
      if (this.scene.anims.exists(animKey)) {
        this.scene.anims.remove(animKey);
      }
    }
    
    this.loadedTextures.clear();
    this.createdAnimations.clear();
    this.config = null;
    
    console.log('Elf character assets cleaned up');
  }
}