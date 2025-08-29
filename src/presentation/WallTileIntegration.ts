// Integration example for using wall tiles from assets/tileset in maze rendering
import { MazeTileRenderer } from './MazeTileRenderer';
import { WallTileLoader } from './WallTileLoader';

export class WallTileIntegration {
  private scene: Phaser.Scene;
  private mazeTileRenderer: MazeTileRenderer;
  private wallTileLoader: WallTileLoader;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.wallTileLoader = new WallTileLoader(scene);
    this.mazeTileRenderer = new MazeTileRenderer(scene);
  }

  /**
   * Initializes the wall tile system
   * Call this in your scene's preload() method
   */
  preloadWallTiles(): void {
    console.log('Preloading wall tiles from assets/tileset...');
    this.wallTileLoader.preloadAllWallTiles();
    this.mazeTileRenderer.preloadWallTiles();
  }

  /**
   * Initializes wall tiles after preload is complete
   * Call this in your scene's create() method
   */
  async initializeWallTiles(): Promise<void> {
    try {
      await this.mazeTileRenderer.initializeWallTiles();
      
      // Validate that all tiles loaded correctly
      const validation = this.wallTileLoader.validateWallTiles();
      if (!validation.isValid) {
        console.warn('Some wall tiles failed to load:', validation.missing);
      } else {
        console.log('All wall tiles loaded successfully');
      }
    } catch (error) {
      console.error('Failed to initialize wall tiles:', error);
    }
  }

  /**
   * Renders a maze using the wall tiles
   */
  renderMazeWithWallTiles(mazeData: any[][]): Phaser.GameObjects.Group {
    // Ensure wall tiles are loaded
    if (!this.mazeTileRenderer.validateWallTiles()) {
      console.warn('Wall tiles not fully loaded, using fallback rendering');
    }

    return this.mazeTileRenderer.renderMaze(mazeData);
  }

  /**
   * Example usage in a Phaser scene
   */
  static createExampleUsage(): string {
    return `
// In your Phaser scene:

class GameScene extends Phaser.Scene {
  private wallTileIntegration: WallTileIntegration;

  preload() {
    this.wallTileIntegration = new WallTileIntegration(this);
    this.wallTileIntegration.preloadWallTiles();
  }

  async create() {
    await this.wallTileIntegration.initializeWallTiles();
    
    // When you need to render a maze:
    const mazeGroup = this.wallTileIntegration.renderMazeWithWallTiles(mazeData);
  }
}
    `;
  }

  /**
   * Gets available wall tile information
   */
  getWallTileInfo(): { count: number; tiles: string[] } {
    const tiles = this.wallTileLoader.getAvailableWallTiles();
    return {
      count: tiles.length,
      tiles
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.mazeTileRenderer.destroy();
    this.wallTileLoader.cleanup();
  }
}