// Asset loading and management with enhanced 2D art support

// Type definitions for asset management
export interface Position {
  x: number;
  y: number;
}

export interface AssetManifest {
  version: string;
  themes: ThemeDefinition[];
  atlases: AtlasDefinition[];
  animations: AnimationDefinition[];
  particles: ParticleDefinition[];
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  assets: {
    player: SpriteAsset;
    orbs: SpriteAsset[];
    maze: MazeAssets;
    ui: UIAssets;
    effects: EffectAssets;
  };
  colors: ColorPalette;
  sounds?: SoundAssets;
}

export interface SpriteAsset {
  key: string;
  atlas: string;
  frame: string;
  animations?: string[];
  scale?: number;
  anchor?: { x: number; y: number };
}

export interface MazeAssets {
  walls: SpriteAsset[];
  floors: SpriteAsset[];
  backgrounds: SpriteAsset[];
}

export interface UIAssets {
  buttons: SpriteAsset[];
  backgrounds: SpriteAsset[];
  panels: SpriteAsset[];
}

export interface EffectAssets {
  particles: SpriteAsset[];
  animations: SpriteAsset[];
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface SoundAssets {
  music: string[];
  effects: string[];
}

export interface AtlasDefinition {
  key: string;
  imagePath: string;
  dataPath: string;
  priority: number;
}

export interface AnimationDefinition {
  key: string;
  atlas: string;
  frames: AnimationFrame[];
  frameRate: number;
  repeat: number;
  yoyo?: boolean;
}

export interface AnimationFrame {
  frame: string;
  duration?: number;
}

export interface ParticleDefinition {
  key: string;
  texture: string;
  config: {
    scale: { start: number; end: number };
    speed: { min: number; max: number };
    lifespan: { min: number; max: number };
    alpha: { start: number; end: number };
    tint: number[];
    blendMode: string;
  };
}

export interface AssetValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface LoadingProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset: string;
}

// Enhanced Asset Manager Interface
export interface IEnhancedAssetManager {
  /**
   * Loads the asset manifest and initializes the system
   */
  loadManifest(manifestPath: string): Promise<void>;

  /**
   * Loads a texture atlas with validation
   */
  loadTextureAtlas(atlasKey: string, imagePath: string, dataPath: string): Promise<void>;

  /**
   * Gets a sprite by key with theme support
   */
  getSprite(spriteKey: string, themeId?: string): any;

  /**
   * Gets an animation by key
   */
  getAnimation(animKey: string): any;

  /**
   * Preloads assets for a specific theme
   */
  preloadThemeAssets(themeId: string): Promise<void>;

  /**
   * Gets a theme-specific asset
   */
  getThemeAsset(themeId: string, assetType: string, assetKey: string): any;

  /**
   * Validates asset integrity
   */
  validateAssets(): Promise<AssetValidationResult>;

  /**
   * Gets current loading progress
   */
  getLoadingProgress(): LoadingProgress;

  /**
   * Cleans up unused assets to free memory
   */
  cleanupUnusedAssets(): void;

  /**
   * Gets available themes
   */
  getAvailableThemes(): ThemeDefinition[];

  /**
   * Checks if a theme is loaded
   */
  isThemeLoaded(themeId: string): boolean;
}

// Legacy interface for backward compatibility
export interface IAssetManager {
  loadAssets(): Promise<void>;
  getAsset(key: string): any;
  isAssetLoaded(key: string): boolean;
  preloadLevelAssets(levelId: string): Promise<void>;
}

export class EnhancedAssetManager implements IEnhancedAssetManager, IAssetManager {
  private scene: any; // Phaser scene
  private manifest: AssetManifest | null = null;
  private loadedAssets: Map<string, any> = new Map();
  private loadedAtlases: Map<string, any> = new Map();
  private loadedThemes: Map<string, ThemeDefinition> = new Map();
  private loadingProgress: LoadingProgress = { loaded: 0, total: 0, percentage: 0, currentAsset: '' };
  private assetCache: Map<string, any> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;
  private retryDelay = 1000; // ms
  private assetLoader: any; // AssetLoader instance
  private validator: any; // AssetValidator instance
  private themeManager: any; // ThemeManager instance
  private memoryUsage: Map<string, number> = new Map();
  private maxMemoryUsage = 100 * 1024 * 1024; // 100MB limit
  private currentMemoryUsage = 0;

  constructor(scene: any) {
    this.scene = scene;
    this.initializeSubsystems();
  }

  private initializeSubsystems(): void {
    // Initialize AssetLoader
    const { AssetLoader } = require('./AssetLoader');
    this.assetLoader = new AssetLoader(this.scene);

    // Initialize AssetValidator
    const { assetValidator } = require('./AssetValidator');
    this.validator = assetValidator;

    // Initialize ThemeManager
    const { ThemeManager } = require('./ThemeManager');
    this.themeManager = new ThemeManager(this);
  }

  async loadManifest(manifestPath: string): Promise<void> {
    try {
      this.updateLoadingProgress('Loading manifest...', 0, 1);
      
      const response = await fetch(manifestPath);
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.statusText}`);
      }
      
      const manifestData = await response.json();
      
      // Enhanced validation using AssetValidator
      const validationResult = this.validator.validateManifest(manifestData);
      
      if (!validationResult.isValid) {
        console.warn('Manifest validation warnings:', validationResult.warnings);
        if (validationResult.errors.length > 0) {
          throw new Error(`Invalid manifest: ${validationResult.errors.join(', ')}`);
        }
      }
      
      this.manifest = manifestData;
      
      // Initialize ThemeManager with manifest
      this.themeManager.initialize(this.manifest);
      
      // Register animations from manifest
      this.registerAnimations();
      
      this.updateLoadingProgress('Manifest loaded', 1, 1);
      
      console.log(`Loaded asset manifest v${this.manifest.version} with ${this.manifest.themes.length} themes`);
    } catch (error) {
      console.error('Failed to load asset manifest:', error);
      throw error;
    }
  }

  async loadTextureAtlas(atlasKey: string, imagePath: string, dataPath: string): Promise<void> {
    try {
      this.updateLoadingProgress(`Loading atlas: ${atlasKey}`, 0, 1);
      
      // Validate atlas definition
      const atlasDefinition = { key: atlasKey, imagePath, dataPath, priority: 5 };
      const validationResult = this.validator.validateAtlas(atlasDefinition);
      
      if (!validationResult.isValid) {
        throw new Error(`Atlas validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      // Use AssetLoader for enhanced loading with retry logic
      this.assetLoader.queueAtlas(atlasKey, imagePath, dataPath, {
        maxRetries: this.maxRetries,
        retryDelay: this.retryDelay,
        priority: 1 // High priority for atlases
      });
      
      await this.assetLoader.processQueue();
      
      // Check if atlas loaded successfully
      if (!this.scene.textures.exists(atlasKey)) {
        throw new Error(`Atlas ${atlasKey} failed to load properly`);
      }
      
      // Track memory usage
      const texture = this.scene.textures.get(atlasKey);
      const memorySize = this.estimateTextureMemoryUsage(texture);
      this.memoryUsage.set(atlasKey, memorySize);
      this.currentMemoryUsage += memorySize;
      
      // Store atlas metadata
      this.loadedAtlases.set(atlasKey, {
        key: atlasKey,
        imagePath,
        dataPath,
        loadedAt: Date.now(),
        memorySize
      });
      
      this.updateLoadingProgress(`Atlas loaded: ${atlasKey}`, 1, 1);
      console.log(`Atlas ${atlasKey} loaded successfully (${Math.round(memorySize / 1024)}KB)`);
      
    } catch (error) {
      console.error(`Failed to load atlas ${atlasKey}:`, error);
      throw error;
    }
  }

  getSprite(spriteKey: string, themeId?: string): any {
    const cacheKey = themeId ? `${themeId}_${spriteKey}` : spriteKey;
    
    if (this.assetCache.has(cacheKey)) {
      return this.assetCache.get(cacheKey);
    }
    
    let sprite = null;
    
    if (themeId && this.loadedThemes.has(themeId)) {
      sprite = this.getThemeSprite(themeId, spriteKey);
    }
    
    if (!sprite) {
      sprite = this.loadedAssets.get(spriteKey);
    }
    
    if (sprite) {
      this.assetCache.set(cacheKey, sprite);
    }
    
    return sprite;
  }

  getAnimation(animKey: string): any {
    return this.scene.anims.get(animKey);
  }

  async preloadThemeAssets(themeId: string): Promise<void> {
    if (!this.manifest) {
      throw new Error('Manifest not loaded. Call loadManifest() first.');
    }
    
    const theme = this.manifest.themes.find(t => t.id === themeId);
    if (!theme) {
      throw new Error(`Theme ${themeId} not found in manifest`);
    }
    
    try {
      this.updateLoadingProgress(`Loading theme: ${theme.name}`, 0, 1);
      
      // Validate theme before loading
      const themeValidation = this.validator.validateTheme(theme, this.manifest.atlases);
      if (!themeValidation.isValid) {
        console.warn(`Theme validation warnings for ${themeId}:`, themeValidation.warnings);
        if (themeValidation.errors.length > 0) {
          throw new Error(`Theme validation failed: ${themeValidation.errors.join(', ')}`);
        }
      }
      
      // Check memory constraints before loading
      const estimatedMemory = this.estimateThemeMemoryUsage(theme);
      if (this.currentMemoryUsage + estimatedMemory > this.maxMemoryUsage) {
        console.warn('Memory limit approaching, cleaning up unused assets');
        this.cleanupUnusedAssets();
      }
      
      // Load theme atlases with priority ordering
      const requiredAtlases = this.manifest.atlases
        .filter(atlas => this.isAtlasRequiredForTheme(atlas, theme))
        .sort((a, b) => (a.priority || 5) - (b.priority || 5));
      
      for (const atlas of requiredAtlases) {
        if (!this.loadedAtlases.has(atlas.key)) {
          await this.loadTextureAtlas(atlas.key, atlas.imagePath, atlas.dataPath);
        }
      }
      
      // Register theme with ThemeManager
      await this.themeManager.loadTheme(themeId);
      
      // Register theme locally
      this.loadedThemes.set(themeId, theme);
      
      this.updateLoadingProgress(`Theme loaded: ${theme.name}`, 1, 1);
      console.log(`Successfully loaded theme: ${theme.name}`);
      
    } catch (error) {
      console.error(`Failed to load theme ${themeId}:`, error);
      throw error;
    }
  }

  getThemeAsset(themeId: string, assetType: string, assetKey: string): any {
    const theme = this.loadedThemes.get(themeId);
    if (!theme) {
      console.warn(`Theme ${themeId} not loaded`);
      return null;
    }
    
    const assets = (theme.assets as any)[assetType];
    if (!assets) {
      console.warn(`Asset type ${assetType} not found in theme ${themeId}`);
      return null;
    }
    
    if (Array.isArray(assets)) {
      return assets.find((asset: SpriteAsset) => asset.key === assetKey);
    } else {
      return assets[assetKey];
    }
  }

  async validateAssets(): Promise<AssetValidationResult> {
    const result: AssetValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    if (!this.manifest) {
      result.errors.push('No manifest loaded');
      result.isValid = false;
      return result;
    }
    
    // Validate atlases
    for (const atlas of this.manifest.atlases) {
      if (!this.loadedAtlases.has(atlas.key)) {
        result.warnings.push(`Atlas ${atlas.key} not loaded`);
      }
    }
    
    // Validate themes
    for (const theme of this.manifest.themes) {
      if (!this.loadedThemes.has(theme.id)) {
        result.warnings.push(`Theme ${theme.id} not loaded`);
      }
    }
    
    return result;
  }

  getLoadingProgress(): LoadingProgress {
    return { ...this.loadingProgress };
  }

  cleanupUnusedAssets(): void {
    const currentTime = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    // Clear old cache entries
    for (const [key, value] of this.assetCache.entries()) {
      if (value.lastAccessed && (currentTime - value.lastAccessed) > maxAge) {
        this.assetCache.delete(key);
      }
    }
    
    console.log(`Cleaned up ${this.assetCache.size} cached assets`);
  }

  getAvailableThemes(): ThemeDefinition[] {
    return this.manifest ? [...this.manifest.themes] : [];
  }

  isThemeLoaded(themeId: string): boolean {
    return this.loadedThemes.has(themeId);
  }

  // Legacy interface implementation
  async loadAssets(): Promise<void> {
    if (!this.manifest) {
      throw new Error('Manifest not loaded. Call loadManifest() first.');
    }
    
    // Load default theme if available
    if (this.manifest.themes.length > 0) {
      await this.preloadThemeAssets(this.manifest.themes[0].id);
    }
  }

  getAsset(key: string): any {
    return this.getSprite(key);
  }

  isAssetLoaded(key: string): boolean {
    return this.loadedAssets.has(key) || this.assetCache.has(key);
  }

  async preloadLevelAssets(levelId: string): Promise<void> {
    // Implementation for level-specific asset preloading
    console.log(`Preloading assets for level: ${levelId}`);
  }

  // Private helper methods
  private validateManifest(manifest: any): AssetValidationResult {
    const result: AssetValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    if (!manifest.version) {
      result.errors.push('Manifest missing version');
      result.isValid = false;
    }
    
    if (!manifest.themes || !Array.isArray(manifest.themes)) {
      result.errors.push('Manifest missing themes array');
      result.isValid = false;
    }
    
    if (!manifest.atlases || !Array.isArray(manifest.atlases)) {
      result.errors.push('Manifest missing atlases array');
      result.isValid = false;
    }
    
    return result;
  }

  private getThemeSprite(themeId: string, spriteKey: string): any {
    const theme = this.loadedThemes.get(themeId);
    if (!theme) return null;
    
    // Search through theme assets for the sprite
    const searchInAssets = (assets: any): any => {
      if (Array.isArray(assets)) {
        return assets.find((asset: SpriteAsset) => asset.key === spriteKey);
      } else if (typeof assets === 'object') {
        for (const value of Object.values(assets)) {
          const found = searchInAssets(value);
          if (found) return found;
        }
      }
      return null;
    };
    
    return searchInAssets(theme.assets);
  }

  private isAtlasRequiredForTheme(atlas: AtlasDefinition, theme: ThemeDefinition): boolean {
    // Check if any theme assets reference this atlas
    const checkAssets = (assets: any): boolean => {
      if (Array.isArray(assets)) {
        return assets.some((asset: SpriteAsset) => asset.atlas === atlas.key);
      } else if (typeof assets === 'object') {
        return Object.values(assets).some(value => checkAssets(value));
      }
      return false;
    };
    
    return checkAssets(theme.assets);
  }

  private updateLoadingProgress(currentAsset: string, loaded: number, total: number): void {
    this.loadingProgress = {
      loaded,
      total,
      percentage: total > 0 ? (loaded / total) * 100 : 0,
      currentAsset
    };
  }

  private registerAnimations(): void {
    if (!this.manifest || !this.manifest.animations) return;

    for (const animDef of this.manifest.animations) {
      try {
        // Check if animation already exists
        if (this.scene.anims.exists(animDef.key)) {
          console.warn(`Animation ${animDef.key} already exists, skipping`);
          continue;
        }

        // Create Phaser animation configuration
        const config = {
          key: animDef.key,
          frames: this.scene.anims.generateFrameNames(animDef.atlas, {
            frames: animDef.frames.map(frame => frame.frame)
          }),
          frameRate: animDef.frameRate,
          repeat: animDef.repeat,
          yoyo: animDef.yoyo || false
        };

        this.scene.anims.create(config);
        console.log(`Registered animation: ${animDef.key}`);
      } catch (error) {
        console.error(`Failed to register animation ${animDef.key}:`, error);
      }
    }
  }

  private estimateTextureMemoryUsage(texture: any): number {
    if (!texture || !texture.source) return 0;
    
    // Estimate memory usage based on texture dimensions and format
    // Assuming RGBA format (4 bytes per pixel)
    const source = texture.source[0];
    if (source && source.width && source.height) {
      return source.width * source.height * 4; // 4 bytes per pixel for RGBA
    }
    
    return 1024 * 1024; // Default estimate of 1MB
  }

  private estimateThemeMemoryUsage(theme: ThemeDefinition): number {
    if (!this.manifest) return 0;
    
    let estimatedMemory = 0;
    const requiredAtlases = this.manifest.atlases.filter(atlas => 
      this.isAtlasRequiredForTheme(atlas, theme)
    );
    
    // Rough estimate based on number of atlases
    // Each atlas estimated at 2MB average
    estimatedMemory = requiredAtlases.length * 2 * 1024 * 1024;
    
    return estimatedMemory;
  }

  private cleanupUnusedAssets(): void {
    const currentTime = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    let freedMemory = 0;
    
    // Clear old cache entries
    for (const [key, value] of this.assetCache.entries()) {
      if (value && value.lastAccessed && (currentTime - value.lastAccessed) > maxAge) {
        this.assetCache.delete(key);
      }
    }
    
    // Clean up unused atlases (keep currently used theme atlases)
    const currentTheme = this.themeManager.getCurrentTheme();
    const protectedAtlases = new Set<string>();
    
    if (currentTheme && this.manifest) {
      const requiredAtlases = this.manifest.atlases.filter(atlas => 
        this.isAtlasRequiredForTheme(atlas, currentTheme)
      );
      requiredAtlases.forEach(atlas => protectedAtlases.add(atlas.key));
    }
    
    for (const [atlasKey, atlasData] of this.loadedAtlases.entries()) {
      if (!protectedAtlases.has(atlasKey) && 
          (currentTime - atlasData.loadedAt) > maxAge) {
        
        // Remove from Phaser texture manager
        if (this.scene.textures.exists(atlasKey)) {
          this.scene.textures.remove(atlasKey);
        }
        
        // Update memory tracking
        const memorySize = this.memoryUsage.get(atlasKey) || 0;
        this.currentMemoryUsage -= memorySize;
        freedMemory += memorySize;
        
        this.loadedAtlases.delete(atlasKey);
        this.memoryUsage.delete(atlasKey);
        
        console.log(`Cleaned up unused atlas: ${atlasKey}`);
      }
    }
    
    console.log(`Asset cleanup completed. Freed ${Math.round(freedMemory / 1024)}KB of memory`);
  }

  /**
   * Gets memory usage statistics
   */
  getMemoryStats(): { current: number; max: number; percentage: number; atlasCount: number } {
    return {
      current: this.currentMemoryUsage,
      max: this.maxMemoryUsage,
      percentage: (this.currentMemoryUsage / this.maxMemoryUsage) * 100,
      atlasCount: this.loadedAtlases.size
    };
  }

  /**
   * Forces immediate cleanup of all non-essential assets
   */
  forceCleanup(): void {
    const currentTheme = this.themeManager.getCurrentTheme();
    const protectedAtlases = new Set<string>();
    
    if (currentTheme && this.manifest) {
      const requiredAtlases = this.manifest.atlases.filter(atlas => 
        this.isAtlasRequiredForTheme(atlas, currentTheme)
      );
      requiredAtlases.forEach(atlas => protectedAtlases.add(atlas.key));
    }
    
    let freedMemory = 0;
    
    // Clear all cache
    this.assetCache.clear();
    
    // Remove non-protected atlases
    for (const [atlasKey, atlasData] of this.loadedAtlases.entries()) {
      if (!protectedAtlases.has(atlasKey)) {
        if (this.scene.textures.exists(atlasKey)) {
          this.scene.textures.remove(atlasKey);
        }
        
        const memorySize = this.memoryUsage.get(atlasKey) || 0;
        this.currentMemoryUsage -= memorySize;
        freedMemory += memorySize;
        
        this.loadedAtlases.delete(atlasKey);
        this.memoryUsage.delete(atlasKey);
      }
    }
    
    console.log(`Force cleanup completed. Freed ${Math.round(freedMemory / 1024)}KB of memory`);
  }

  /**
   * Validates all currently loaded assets
   */
  async validateLoadedAssets(): Promise<AssetValidationResult> {
    const result: AssetValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    if (!this.manifest) {
      result.errors.push('No manifest loaded');
      result.isValid = false;
      return result;
    }
    
    // Validate loaded atlases exist in Phaser
    for (const [atlasKey] of this.loadedAtlases.entries()) {
      if (!this.scene.textures.exists(atlasKey)) {
        result.errors.push(`Atlas ${atlasKey} marked as loaded but not found in Phaser textures`);
        result.isValid = false;
      }
    }
    
    // Validate themes
    for (const [themeId] of this.loadedThemes.entries()) {
      if (!this.themeManager.isThemeLoaded(themeId)) {
        result.warnings.push(`Theme ${themeId} marked as loaded but not found in ThemeManager`);
      }
    }
    
    // Check memory consistency
    const memoryStats = this.getMemoryStats();
    if (memoryStats.percentage > 90) {
      result.warnings.push(`Memory usage high: ${Math.round(memoryStats.percentage)}%`);
    }
    
    return result;
  }
}

// Backward compatibility - export the legacy AssetManager as well
export class AssetManager extends EnhancedAssetManager implements IAssetManager {
  // This class provides backward compatibility while extending functionality
}