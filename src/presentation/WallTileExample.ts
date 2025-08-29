// Example implementation showing how to use wall tiles in a game scene
import { WallTileIntegration } from './WallTileIntegration';
import { MazeCell } from '../core/types/Level';

export class WallTileExampleScene extends Phaser.Scene {
  private wallTileIntegration!: WallTileIntegration;
  private mazeGroup?: Phaser.GameObjects.Group;

  constructor() {
    super({ key: 'WallTileExample' });
  }

  preload(): void {
    console.log('🔄 Preloading wall tiles...');
    
    // Initialize wall tile system
    this.wallTileIntegration = new WallTileIntegration(this);
    this.wallTileIntegration.preloadWallTiles();
    
    // Show loading progress
    this.load.on('progress', (progress: number) => {
      console.log(`Loading progress: ${Math.round(progress * 100)}%`);
    });
  }

  async create(): Promise<void> {
    console.log('🎮 Creating wall tile example scene...');
    
    try {
      // Initialize wall tiles
      await this.wallTileIntegration.initializeWallTiles();
      
      // Get wall tile info
      const tileInfo = this.wallTileIntegration.getWallTileInfo();
      console.log(`✅ ${tileInfo.count} wall tiles available:`, tileInfo.tiles);
      
      // Create example maze data
      const exampleMaze = this.createExampleMazeData();
      
      // Render maze with wall tiles
      this.mazeGroup = this.wallTileIntegration.renderMazeWithWallTiles(exampleMaze);
      
      // Add UI text
      this.createUI();
      
      console.log('✅ Wall tile example scene created successfully');
      
    } catch (error) {
      console.error('❌ Failed to create wall tile example:', error);
      this.createErrorUI();
    }
  }

  /**
   * Creates example maze data for demonstration
   */
  private createExampleMazeData(): MazeCell[][] {
    // Create a simple 5x5 maze for demonstration
    const maze: MazeCell[][] = [];
    
    for (let y = 0; y < 5; y++) {
      const row: MazeCell[] = [];
      for (let x = 0; x < 5; x++) {
        let walls = 0;
        let type: 'floor' | 'start' | 'goal' = 'floor';
        
        // Create a simple maze pattern
        if (x === 0 && y === 0) {
          type = 'start';
          walls = 12; // North and West walls (8 + 4)
        } else if (x === 4 && y === 4) {
          type = 'goal';
          walls = 3; // East and South walls (1 + 2)
        } else {
          // Create some walls for visual variety
          if (x === 0) walls |= 4; // West wall
          if (y === 0) walls |= 8; // North wall
          if (x === 4) walls |= 1; // East wall
          if (y === 4) walls |= 2; // South wall
          
          // Add some internal walls for maze structure
          if ((x + y) % 3 === 0) {
            walls |= Math.floor(Math.random() * 4) + 1; // Random wall
          }
        }
        
        row.push({
          walls,
          type,
          items: [],
          powerups: []
        });
      }
      maze.push(row);
    }
    
    return maze;
  }

  /**
   * Creates UI elements for the example
   */
  private createUI(): void {
    // Title
    const title = this.add.text(this.scale.width / 2, 50, 'Wall Tiles Example', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(this.scale.width / 2, 100, 
      'Wall tiles loaded from assets/tileset/\nEach wall uses a different tile for variety', {
      fontSize: '16px',
      color: '#cccccc',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // Tile info
    const tileInfo = this.wallTileIntegration.getWallTileInfo();
    const infoText = this.add.text(this.scale.width / 2, this.scale.height - 100,
      `${tileInfo.count} wall tiles loaded: ${tileInfo.tiles.join(', ')}`, {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // Back button
    const backButton = this.add.rectangle(100, this.scale.height - 50, 150, 40, 0x4a7c59)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('MainMenu'); // Or whatever your main scene is
      });

    this.add.text(100, this.scale.height - 50, 'Back to Menu', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  /**
   * Creates error UI when wall tiles fail to load
   */
  private createErrorUI(): void {
    const errorText = this.add.text(this.scale.width / 2, this.scale.height / 2,
      'Failed to load wall tiles\nUsing fallback rendering', {
      fontSize: '18px',
      color: '#ff6666',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // Still try to render something
    const fallbackMaze = this.createExampleMazeData();
    this.mazeGroup = this.wallTileIntegration.renderMazeWithWallTiles(fallbackMaze);
  }

  /**
   * Update method for any animations or dynamic updates
   */
  update(): void {
    // Add any update logic here if needed
  }

  /**
   * Cleanup when scene is destroyed
   */
  destroy(): void {
    if (this.wallTileIntegration) {
      this.wallTileIntegration.destroy();
    }
    super.destroy();
  }
}

// Export for use in other parts of the application
export { WallTileExampleScene };

// Example of how to add this scene to your game configuration
export const wallTileExampleConfig = {
  scene: WallTileExampleScene,
  key: 'WallTileExample'
};