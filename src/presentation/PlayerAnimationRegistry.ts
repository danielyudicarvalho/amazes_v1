// Registry for player animations with fallback support and elf character integration
import { ElfCharacterLoader } from './ElfCharacterLoader';
import { Direction } from '../core/GameCore';

export interface AnimationFrameData {
  key: string;
  frame?: string;
  duration?: number;
}

export interface PlayerAnimationData {
  key: string;
  frames: AnimationFrameData[];
  frameRate: number;
  repeat: number;
  yoyo?: boolean;
}

export class PlayerAnimationRegistry {
  private scene: Phaser.Scene;
  private registeredAnimations: Map<string, PlayerAnimationData> = new Map();
  private fallbackTextures: Map<string, string> = new Map();
  private elfCharacterLoader: ElfCharacterLoader | null = null;
  private useElfCharacter: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeElfCharacter();
  }

  /**
   * Registers a player animation
   */
  registerAnimation(animData: PlayerAnimationData): void {
    this.registeredAnimations.set(animData.key, animData);
    
    // Create the Phaser animation if it doesn't exist
    if (!this.scene.anims.exists(animData.key)) {
      this.createPhaserAnimation(animData);
    }
  }

  /**
   * Gets an animation by key
   */
  getAnimation(key: string): PlayerAnimationData | null {
    return this.registeredAnimations.get(key) || null;
  }

  /**
   * Checks if an animation exists
   */
  hasAnimation(key: string): boolean {
    return this.registeredAnimations.has(key) || this.scene.anims.exists(key);
  }

  /**
   * Creates all registered animations in Phaser
   */
  createAllAnimations(): void {
    for (const animData of this.registeredAnimations.values()) {
      if (!this.scene.anims.exists(animData.key)) {
        this.createPhaserAnimation(animData);
      }
    }
  }

  /**
   * Initializes the elf character system
   */
  private async initializeElfCharacter(): Promise<void> {
    try {
      this.elfCharacterLoader = new ElfCharacterLoader(this.scene);
      await this.elfCharacterLoader.loadConfig();
      const loadResult = await this.elfCharacterLoader.loadAssets();
      
      if (loadResult.success) {
        this.useElfCharacter = true;
        this.registerElfAnimations();
        console.log('Elf character successfully loaded and registered');
      } else {
        console.warn('Elf character failed to load, falling back to basic animations:', loadResult.errors);
        this.initializeFallbackAnimations();
      }
    } catch (error) {
      console.warn('Failed to initialize elf character, using fallback:', error);
      this.initializeFallbackAnimations();
    }
  }

  /**
   * Creates fallback textures for basic player animations
   */
  private initializeFallbackAnimations(): void {
    this.createFallbackTextures();
    this.registerFallbackAnimations();
  }

  private createFallbackTextures(): void {
    // Create basic player textures if they don't exist
    const textureKeys = ['player_idle', 'player_walk_up', 'player_walk_down', 'player_walk_left', 'player_walk_right'];
    
    textureKeys.forEach(key => {
      if (!this.scene.textures.exists(key)) {
        this.createPlayerTexture(key);
      }
    });
  }

  private createPlayerTexture(key: string): void {
    const graphics = this.scene.add.graphics();
    
    // Base player appearance (blue circle)
    graphics.fillStyle(0x4169E1);
    graphics.fillCircle(8, 8, 6);
    graphics.setStroke(2, 0x1E3A8A);
    graphics.strokeCircle(8, 8, 6);
    
    // Add directional indicators based on animation type
    if (key.includes('up')) {
      graphics.fillStyle(0xFFFFFF);
      graphics.fillTriangle(8, 4, 6, 8, 10, 8); // Up arrow
    } else if (key.includes('down')) {
      graphics.fillStyle(0xFFFFFF);
      graphics.fillTriangle(8, 12, 6, 8, 10, 8); // Down arrow
    } else if (key.includes('left')) {
      graphics.fillStyle(0xFFFFFF);
      graphics.fillTriangle(4, 8, 8, 6, 8, 10); // Left arrow
    } else if (key.includes('right')) {
      graphics.fillStyle(0xFFFFFF);
      graphics.fillTriangle(12, 8, 8, 6, 8, 10); // Right arrow
    } else if (key.includes('idle')) {
      graphics.fillStyle(0xFFFFFF);
      graphics.fillCircle(8, 6, 1); // Small dot for idle
    }
    
    // Generate texture
    graphics.generateTexture(key, 16, 16);
    graphics.destroy();
    
    this.fallbackTextures.set(key, key);
  }

  private registerFallbackAnimations(): void {
    // Idle animation
    this.registerAnimation({
      key: 'player_idle',
      frames: [
        { key: 'player_idle', duration: 1000 },
        { key: 'player_idle', duration: 1000 }
      ],
      frameRate: 2,
      repeat: -1,
      yoyo: false
    });

    // Walking animations
    const directions = ['up', 'down', 'left', 'right'];
    directions.forEach(direction => {
      this.registerAnimation({
        key: `player_walk_${direction}`,
        frames: [
          { key: `player_walk_${direction}`, duration: 125 },
          { key: 'player_idle', duration: 125 },
          { key: `player_walk_${direction}`, duration: 125 },
          { key: 'player_idle', duration: 125 }
        ],
        frameRate: 8,
        repeat: -1,
        yoyo: false
      });
    });
  }

  private createPhaserAnimation(animData: PlayerAnimationData): void {
    try {
      // Convert our animation data to Phaser format
      const frames: any[] = [];
      
      animData.frames.forEach(frameData => {
        if (frameData.frame) {
          // Atlas frame
          frames.push({ key: frameData.key, frame: frameData.frame });
        } else {
          // Single texture
          frames.push({ key: frameData.key });
        }
      });

      const config = {
        key: animData.key,
        frames: frames,
        frameRate: animData.frameRate,
        repeat: animData.repeat,
        yoyo: animData.yoyo || false
      };

      this.scene.anims.create(config);
      console.log(`Created animation: ${animData.key}`);
    } catch (error) {
      console.error(`Failed to create animation ${animData.key}:`, error);
    }
  }

  /**
   * Creates enhanced animations from atlas data
   */
  registerAtlasAnimations(atlasKey: string, animationConfigs: any[]): void {
    animationConfigs.forEach(config => {
      const animData: PlayerAnimationData = {
        key: config.key,
        frames: config.frames.map((frame: any) => ({
          key: atlasKey,
          frame: frame.frame || frame,
          duration: frame.duration
        })),
        frameRate: config.frameRate || 8,
        repeat: config.repeat !== undefined ? config.repeat : -1,
        yoyo: config.yoyo || false
      };
      
      this.registerAnimation(animData);
    });
  }

  /**
   * Gets all available animation keys
   */
  getAvailableAnimations(): string[] {
    return Array.from(this.registeredAnimations.keys());
  }

  /**
   * Validates that all animations can be created
   */
  validateAnimations(): { valid: string[]; invalid: string[] } {
    const result = { valid: [] as string[], invalid: [] as string[] };
    
    for (const [key, animData] of this.registeredAnimations.entries()) {
      try {
        // Check if all required textures exist
        const allTexturesExist = animData.frames.every(frame => 
          this.scene.textures.exists(frame.key)
        );
        
        if (allTexturesExist) {
          result.valid.push(key);
        } else {
          result.invalid.push(key);
        }
      } catch (error) {
        result.invalid.push(key);
      }
    }
    
    return result;
  }

  /**
   * Registers elf character animations
   */
  private registerElfAnimations(): void {
    if (!this.elfCharacterLoader) return;
    
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    
    // Register idle animations
    directions.forEach(direction => {
      const animKey = this.elfCharacterLoader!.getAnimationKey(direction, 'idle');
      if (this.scene.anims.exists(animKey)) {
        this.registeredAnimations.set(`player_idle_${direction}`, {
          key: animKey,
          frames: [{ key: this.elfCharacterLoader!.getTextureKey(direction, 'idle') }],
          frameRate: 1,
          repeat: -1,
          yoyo: false
        });
      }
    });
    
    // Register walking animations
    directions.forEach(direction => {
      const animKey = this.elfCharacterLoader!.getAnimationKey(direction, 'walking');
      if (this.scene.anims.exists(animKey)) {
        this.registeredAnimations.set(`player_walk_${direction}`, {
          key: animKey,
          frames: [], // Frames are already set in the Phaser animation
          frameRate: 8,
          repeat: -1,
          yoyo: false
        });
      }
    });
    
    console.log(`Registered ${this.registeredAnimations.size} elf character animations`);
  }

  /**
   * Gets the appropriate texture key for creating sprites
   */
  getPlayerTextureKey(direction: Direction = 'down'): string {
    if (this.useElfCharacter && this.elfCharacterLoader) {
      return this.elfCharacterLoader.getTextureKey(direction, 'idle');
    }
    return 'player_idle';
  }

  /**
   * Gets the appropriate animation key for player states
   */
  getPlayerAnimationKey(direction: Direction, state: 'idle' | 'walking'): string {
    if (this.useElfCharacter && this.elfCharacterLoader) {
      return this.elfCharacterLoader.getAnimationKey(direction, state);
    }
    return `player_${state}_${direction}`;
  }

  /**
   * Checks if elf character is being used
   */
  isUsingElfCharacter(): boolean {
    return this.useElfCharacter;
  }

  /**
   * Gets the elf character loader instance
   */
  getElfCharacterLoader(): ElfCharacterLoader | null {
    return this.elfCharacterLoader;
  }

  /**
   * Forces fallback to basic animations
   */
  useFallbackAnimations(): void {
    this.useElfCharacter = false;
    this.registeredAnimations.clear();
    this.initializeFallbackAnimations();
    console.log('Switched to fallback animations');
  }

  /**
   * Cleans up and destroys the registry
   */
  destroy(): void {
    if (this.elfCharacterLoader) {
      this.elfCharacterLoader.cleanup();
      this.elfCharacterLoader = null;
    }
    this.registeredAnimations.clear();
    this.fallbackTextures.clear();
  }
}