// Theme management system for organizing and switching visual themes

import { ThemeDefinition, AssetManifest } from './AssetManager';
import { assetValidator } from './AssetValidator';

export interface ThemeLoadingProgress {
  themeId: string;
  loaded: number;
  total: number;
  percentage: number;
  currentAsset: string;
}

export interface ThemeCache {
  theme: ThemeDefinition;
  loadedAt: number;
  lastAccessed: number;
  assets: Map<string, any>;
}

export class ThemeManager {
  private availableThemes: Map<string, ThemeDefinition> = new Map();
  private loadedThemes: Map<string, ThemeCache> = new Map();
  private currentThemeId: string | null = null;
  private manifest: AssetManifest | null = null;
  private loadingProgress: ThemeLoadingProgress | null = null;
  private maxCachedThemes = 3;

  constructor(private assetManager: any) {}

  /**
   * Initializes the theme manager with a manifest
   */
  initialize(manifest: AssetManifest): void {
    this.manifest = manifest;
    this.availableThemes.clear();
    
    // Register all themes from manifest
    for (const theme of manifest.themes) {
      this.availableThemes.set(theme.id, theme);
    }
    
    console.log(`ThemeManager initialized with ${this.availableThemes.size} themes`);
  }

  /**
   * Loads a theme and its assets
   */
  async loadTheme(themeId: string): Promise<void> {
    if (!this.availableThemes.has(themeId)) {
      throw new Error(`Theme ${themeId} not found`);
    }

    // Check if already loaded
    if (this.loadedThemes.has(themeId)) {
      const cache = this.loadedThemes.get(themeId)!;
      cache.lastAccessed = Date.now();
      console.log(`Theme ${themeId} already loaded`);
      return;
    }

    const theme = this.availableThemes.get(themeId)!;
    
    // Validate theme before loading
    const validationResult = assetValidator.validateTheme(theme, this.manifest?.atlases || []);
    if (!validationResult.isValid) {
      console.warn(`Theme validation warnings for ${themeId}:`, validationResult.warnings);
      if (validationResult.errors.length > 0) {
        throw new Error(`Theme validation failed: ${validationResult.errors.join(', ')}`);
      }
    }

    try {
      // Calculate total assets to load for progress tracking
      const requiredAtlases = this.manifest?.atlases.filter(atlas => 
        this.isAtlasRequiredForTheme(atlas, theme)
      ) || [];

      this.loadingProgress = {
        themeId,
        loaded: 0,
        total: requiredAtlases.length,
        percentage: 0,
        currentAsset: 'Initializing theme loading...'
      };

      // Load theme assets with progress tracking
      for (let i = 0; i < requiredAtlases.length; i++) {
        const atlas = requiredAtlases[i];
        this.loadingProgress.currentAsset = `Loading ${atlas.key}...`;
        this.loadingProgress.loaded = i;
        this.loadingProgress.percentage = (i / requiredAtlases.length) * 100;
        
        // Load atlas if not already loaded
        if (!this.assetManager.loadedAtlases.has(atlas.key)) {
          await this.assetManager.loadTextureAtlas(atlas.key, atlas.imagePath, atlas.dataPath);
        }
      }

      // Create theme cache
      const cache: ThemeCache = {
        theme,
        loadedAt: Date.now(),
        lastAccessed: Date.now(),
        assets: new Map()
      };

      // Cache theme assets for quick access
      this.cacheThemeAssets(theme, cache);

      this.loadedThemes.set(themeId, cache);
      
      // Final progress update
      this.loadingProgress = {
        themeId,
        loaded: requiredAtlases.length,
        total: requiredAtlases.length,
        percentage: 100,
        currentAsset: 'Theme loading complete'
      };

      // Clear progress after a short delay
      setTimeout(() => {
        this.loadingProgress = null;
      }, 500);

      // Cleanup old themes if we exceed cache limit
      this.cleanupOldThemes();

      console.log(`Successfully loaded theme: ${theme.name} with ${requiredAtlases.length} atlases`);
    } catch (error) {
      this.loadingProgress = null;
      console.error(`Failed to load theme ${themeId}:`, error);
      throw error;
    }
  }

  private isAtlasRequiredForTheme(atlas: any, theme: ThemeDefinition): boolean {
    // Check if any theme assets reference this atlas
    const checkAssets = (assets: any): boolean => {
      if (Array.isArray(assets)) {
        return assets.some((asset: any) => asset.atlas === atlas.key);
      } else if (typeof assets === 'object' && assets !== null) {
        return Object.values(assets).some(value => checkAssets(value));
      }
      return false;
    };
    
    return checkAssets(theme.assets);
  }

  /**
   * Switches to a different theme
   */
  async switchTheme(newThemeId: string): Promise<void> {
    if (this.currentThemeId === newThemeId) {
      console.log(`Already using theme ${newThemeId}`);
      return;
    }

    // Load the new theme if not already loaded
    if (!this.loadedThemes.has(newThemeId)) {
      await this.loadTheme(newThemeId);
    }

    const oldThemeId = this.currentThemeId;
    this.currentThemeId = newThemeId;

    // Update last accessed time
    const cache = this.loadedThemes.get(newThemeId)!;
    cache.lastAccessed = Date.now();

    console.log(`Switched theme from ${oldThemeId} to ${newThemeId}`);
  }

  /**
   * Gets the current theme
   */
  getCurrentTheme(): ThemeDefinition | null {
    if (!this.currentThemeId) {
      return null;
    }

    const cache = this.loadedThemes.get(this.currentThemeId);
    return cache ? cache.theme : null;
  }

  /**
   * Gets a theme asset by type and key
   */
  getThemeAsset(assetType: string, assetKey: string, themeId?: string): any {
    const targetThemeId = themeId || this.currentThemeId;
    
    if (!targetThemeId) {
      console.warn('No theme selected');
      return null;
    }

    const cache = this.loadedThemes.get(targetThemeId);
    if (!cache) {
      console.warn(`Theme ${targetThemeId} not loaded`);
      return null;
    }

    // Update access time
    cache.lastAccessed = Date.now();

    // Check cache first
    const cacheKey = `${assetType}_${assetKey}`;
    if (cache.assets.has(cacheKey)) {
      return cache.assets.get(cacheKey);
    }

    // Search in theme assets
    const asset = this.findAssetInTheme(cache.theme, assetType, assetKey);
    
    if (asset) {
      cache.assets.set(cacheKey, asset);
    }

    return asset;
  }

  /**
   * Gets all available themes
   */
  getAvailableThemes(): ThemeDefinition[] {
    return Array.from(this.availableThemes.values());
  }

  /**
   * Checks if a theme is loaded
   */
  isThemeLoaded(themeId: string): boolean {
    return this.loadedThemes.has(themeId);
  }

  /**
   * Gets the current loading progress
   */
  getLoadingProgress(): ThemeLoadingProgress | null {
    return this.loadingProgress ? { ...this.loadingProgress } : null;
  }

  /**
   * Preloads multiple themes
   */
  async preloadThemes(themeIds: string[]): Promise<void> {
    const loadPromises = themeIds.map(themeId => this.loadTheme(themeId));
    await Promise.all(loadPromises);
  }

  /**
   * Unloads a theme to free memory
   */
  unloadTheme(themeId: string): void {
    if (themeId === this.currentThemeId) {
      console.warn(`Cannot unload current theme ${themeId}`);
      return;
    }

    if (this.loadedThemes.has(themeId)) {
      this.loadedThemes.delete(themeId);
      console.log(`Unloaded theme ${themeId}`);
    }
  }

  /**
   * Gets theme loading statistics
   */
  getThemeStats(): { loaded: number; available: number; current: string | null } {
    return {
      loaded: this.loadedThemes.size,
      available: this.availableThemes.size,
      current: this.currentThemeId
    };
  }

  /**
   * Validates all loaded themes
   */
  validateLoadedThemes(): { valid: string[]; invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const [themeId, cache] of this.loadedThemes.entries()) {
      const validationResult = assetValidator.validateTheme(cache.theme, this.manifest?.atlases || []);
      
      if (validationResult.isValid) {
        valid.push(themeId);
      } else {
        invalid.push(themeId);
        console.warn(`Theme ${themeId} validation failed:`, validationResult.errors);
      }
    }

    return { valid, invalid };
  }

  private cacheThemeAssets(theme: ThemeDefinition, cache: ThemeCache): void {
    // Pre-cache commonly accessed assets
    const commonAssets = [
      { type: 'player', key: theme.assets.player.key },
      ...theme.assets.orbs.map(orb => ({ type: 'orbs', key: orb.key }))
    ];

    for (const asset of commonAssets) {
      const cacheKey = `${asset.type}_${asset.key}`;
      const assetData = this.findAssetInTheme(theme, asset.type, asset.key);
      if (assetData) {
        cache.assets.set(cacheKey, assetData);
      }
    }
  }

  private findAssetInTheme(theme: ThemeDefinition, assetType: string, assetKey: string): any {
    const assets = (theme.assets as any)[assetType];
    
    if (!assets) {
      return null;
    }

    if (Array.isArray(assets)) {
      return assets.find((asset: any) => asset.key === assetKey);
    } else if (typeof assets === 'object') {
      return assets[assetKey] || this.searchNestedAssets(assets, assetKey);
    }

    return null;
  }

  private searchNestedAssets(obj: any, key: string): any {
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        const found = value.find((item: any) => item.key === key);
        if (found) return found;
      } else if (typeof value === 'object' && value !== null) {
        const found = this.searchNestedAssets(value, key);
        if (found) return found;
      }
    }
    return null;
  }

  private cleanupOldThemes(): void {
    if (this.loadedThemes.size <= this.maxCachedThemes) {
      return;
    }

    // Sort themes by last accessed time (oldest first)
    const sortedThemes = Array.from(this.loadedThemes.entries())
      .filter(([themeId]) => themeId !== this.currentThemeId) // Don't remove current theme
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    // Remove oldest themes until we're under the limit
    const themesToRemove = sortedThemes.slice(0, this.loadedThemes.size - this.maxCachedThemes);
    
    for (const [themeId] of themesToRemove) {
      this.unloadTheme(themeId);
    }
  }
}