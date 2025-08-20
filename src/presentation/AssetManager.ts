// Asset loading and management
export interface IAssetManager {
  /**
   * Loads all required assets for the game
   */
  loadAssets(): Promise<void>;

  /**
   * Gets a loaded asset by key
   */
  getAsset(key: string): any;

  /**
   * Checks if an asset is loaded
   */
  isAssetLoaded(key: string): boolean;

  /**
   * Preloads assets for a specific level
   */
  preloadLevelAssets(levelId: string): Promise<void>;
}

export class AssetManager implements IAssetManager {
  private scene: any; // Will be properly typed with Phaser types
  private loadedAssets: Map<string, any> = new Map();

  constructor(scene: any) {
    this.scene = scene;
  }

  async loadAssets(): Promise<void> {
    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
  }

  getAsset(key: string): any {
    return this.loadedAssets.get(key);
  }

  isAssetLoaded(key: string): boolean {
    return this.loadedAssets.has(key);
  }

  async preloadLevelAssets(levelId: string): Promise<void> {
    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
  }
}