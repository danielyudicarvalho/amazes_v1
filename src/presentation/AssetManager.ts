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
  
  private async loadAssetBatch(assets: { type: string; key: string; url: string; config?: any }[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = this.scene.load;

      const handleFileComplete = (_key: string, _type: string, data: any) => {
        this.loadedAssets.set(_key, data);
      };

      const handleLoadError = (file: any) => {
        cleanup();
        reject(new Error(`Failed to load asset: ${file.key}`));
      };

      const handleComplete = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        loader.off('filecomplete', handleFileComplete);
        loader.off('loaderror', handleLoadError);
        loader.off('complete', handleComplete);
      };

      loader.on('filecomplete', handleFileComplete);
      loader.on('loaderror', handleLoadError);
      loader.on('complete', handleComplete);

      for (const asset of assets) {
        switch (asset.type) {
          case 'image':
            loader.image(asset.key, asset.url);
            break;
          case 'audio':
            loader.audio(asset.key, asset.url);
            break;
          default:
            console.warn(`Unknown asset type: ${asset.type}`);
        }
      }

      loader.start();
    });
  }

  constructor(scene: any) {
    this.scene = scene;
  }

  async loadAssets(): Promise<void> {
    const assets = [
      {
        type: 'image',
        key: 'placeholder-image',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6XerfcAAAAASUVORK5CYII=',
      },
      {
        type: 'audio',
        key: 'placeholder-audio',
        url: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=',
      },
    ];

    await this.loadAssetBatch(assets);
  }

  getAsset(key: string): any {
    return this.loadedAssets.get(key);
  }

  isAssetLoaded(key: string): boolean {
    return this.loadedAssets.has(key);
  }

  async preloadLevelAssets(levelId: string): Promise<void> {
    const levelAssets: { type: string; key: string; url: string; config?: any }[] = [];

    await this.loadAssetBatch(levelAssets);
  }
}