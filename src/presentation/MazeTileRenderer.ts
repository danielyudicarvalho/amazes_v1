// Maze tile rendering system for enhanced 2D art
import { Position } from '../core/types/GameState';
import { MazeCell } from '../core/types/Level';

export interface TileConfig {
  key: string;
  atlas?: string;
  frame?: string;
  scale?: number;
  anchor?: { x: number; y: number };
  tint?: number;
  rotation?: number;
}

export interface TileConnectionInfo {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
  corners: {
    northEast: boolean;
    northWest: boolean;
    southEast: boolean;
    southWest: boolean;
  };
}

export interface MazeTileTheme {
  floors: {
    default: TileConfig;
    variants?: TileConfig[];
  };
  walls: {
    straight: TileConfig;
    corner: TileConfig;
    junction: TileConfig;
    end: TileConfig;
  };
  borders: {
    outer: TileConfig;
    inner?: TileConfig;
  };
  background: {
    fill: TileConfig;
    pattern?: TileConfig;
  };
  special: {
    start: TileConfig;
    goal: TileConfig;
  };
}

export interface IMazeTileRenderer {
  /**
   * Renders the complete maze with tiles, walls, and background
   */
  renderMaze(mazeData: MazeCell[][], theme?: string): Phaser.GameObjects.Group;

  /**
   * Creates floor tiles for the maze
   */
  createFloorTiles(mazeData: MazeCell[][], theme?: string): Phaser.GameObjects.Sprite[];

  /**
   * Creates wall tiles with proper connections
   */
  createWallTiles(mazeData: MazeCell[][], theme?: string): Phaser.GameObjects.Sprite[];

  /**
   * Creates background elements and borders
   */
  createMazeBackground(mazeSize: { width: number; height: number }, theme?: string): Phaser.GameObjects.Group;

  /**
   * Updates maze theme without recreating all tiles
   */
  updateMazeTheme(mazeGroup: Phaser.GameObjects.Group, newTheme: string): void;

  /**
   * Analyzes tile connections for seamless rendering
   */
  analyzeTileConnections(mazeData: MazeCell[][], x: number, y: number): TileConnectionInfo;

  /**
   * Gets the appropriate wall tile based on connections
   */
  getWallTileForConnections(connections: TileConnectionInfo, theme: string): TileConfig;

  /**
   * Positions tiles using grid coordinates
   */
  positionTile(sprite: Phaser.GameObjects.Sprite, gridPosition: Position): void;
}

export class MazeTileRenderer implements IMazeTileRenderer {
  private scene: Phaser.Scene;
  private assetManager: any; // Will be properly typed when enhanced asset manager is available
  private layerManager: any; // LayerManager reference
  private cellSize: number = 24;
  private currentTheme: string = 'default';
  private tileCache: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private connectionCache: Map<string, TileConnectionInfo> = new Map();

  // Default theme configuration (fallback when no assets available)
  private readonly defaultTheme: MazeTileTheme = {
    floors: {
      default: {
        key: 'maze_floor_default',
        scale: 1,
        anchor: { x: 0.5, y: 0.5 },
        tint: 0xF5E6D3 // Beige
      }
    },
    walls: {
      straight: {
        key: 'maze_wall_straight',
        scale: 1,
        anchor: { x: 0.5, y: 0.5 },
        tint: 0x7FB069 // Green
      },
      corner: {
        key: 'maze_wall_corner',
        scale: 1,
        anchor: { x: 0.5, y: 0.5 },
        tint: 0x7FB069
      },
      junction: {
        key: 'maze_wall_junction',
        scale: 1,
        anchor: { x: 0.5, y: 0.5 },
        tint: 0x7FB069
      },
      end: {
        key: 'maze_wall_end',
        scale: 1,
        anchor: { x: 0.5, y: 0.5 },
        tint: 0x7FB069
      }
    },
    borders: {
      outer: {
        key: 'maze_border_outer',
        scale: 1,
        anchor: { x: 0.5, y: 0.5 },
        tint: 0x6B8E5A // Darker green
      }
    },
    background: {
      fill: {
        key: 'maze_background',
        scale: 1,
        anchor: { x: 0.5, y: 0.5 },
        tint: 0x8FBC8F // Light green
      }
    },
    special: {
      start: {
        key: 'maze_start_tile',
        scale: 1,
        anchor: { x: 0.5, y: 0.5 },
        tint: 0x90EE90 // Light green
      },
      goal: {
        key: 'maze_goal_tile',
        scale: 1,
        anchor: { x: 0.5, y: 0.5 },
        tint: 0xFFD700 // Gold
      }
    }
  };

  constructor(scene: Phaser.Scene, layerManager?: any, assetManager?: any) {
    this.scene = scene;
    this.layerManager = layerManager;
    this.assetManager = assetManager;
  }

  renderMaze(mazeData: MazeCell[][], theme?: string): Phaser.GameObjects.Group {
    const themeId = theme || this.currentTheme;
    const mazeGroup = this.scene.add.group();
    
    // Add to maze layer if layer manager is available
    if (this.layerManager && this.layerManager.getLayer) {
      const mazeLayer = this.layerManager.getLayer('maze');
      if (mazeLayer) {
        mazeLayer.add(mazeGroup);
      }
    }

    const rows = mazeData.length;
    const cols = mazeData[0]?.length || 0;

    // Clear caches for new maze
    this.connectionCache.clear();

    // Create background first
    const backgroundGroup = this.createMazeBackground({ width: cols, height: rows }, themeId);
    mazeGroup.add(backgroundGroup);

    // Create floor tiles
    const floorTiles = this.createFloorTiles(mazeData, themeId);
    floorTiles.forEach(tile => {
      if (tile) {
        mazeGroup.add(tile);
      }
    });

    // Create wall tiles with proper connections
    const wallTiles = this.createWallTiles(mazeData, themeId);
    wallTiles.forEach(tile => {
      if (tile) {
        mazeGroup.add(tile);
      }
    });

    console.log(`MazeTileRenderer: Created maze with ${rows}x${cols} tiles using theme: ${themeId}`);
    
    return mazeGroup;
  }

  createFloorTiles(mazeData: MazeCell[][], theme?: string): Phaser.GameObjects.Sprite[] {
    const themeId = theme || this.currentTheme;
    const floorTiles: Phaser.GameObjects.Sprite[] = [];
    const themeConfig = this.getThemeConfig(themeId);

    const rows = mazeData.length;
    const cols = mazeData[0]?.length || 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = mazeData[y][x];
        
        // Determine floor tile type
        let floorConfig: TileConfig;
        
        if (cell.type === 'start') {
          floorConfig = themeConfig.special.start;
        } else if (cell.type === 'goal') {
          floorConfig = themeConfig.special.goal;
        } else {
          // Use default floor or variant
          if (themeConfig.floors.variants && themeConfig.floors.variants.length > 0) {
            // Use position-based variation for consistent patterns
            const variantIndex = (x + y * 3) % themeConfig.floors.variants.length;
            floorConfig = themeConfig.floors.variants[variantIndex];
          } else {
            floorConfig = themeConfig.floors.default;
          }
        }

        const floorTile = this.createTileSprite(floorConfig, { x, y });
        if (floorTile) {
          floorTile.setData('type', 'floor');
          floorTile.setData('cellType', cell.type);
          floorTile.setData('gridPosition', { x, y });
          floorTiles.push(floorTile);
        }
      }
    }

    return floorTiles;
  }

  createWallTiles(mazeData: MazeCell[][], theme?: string): Phaser.GameObjects.Sprite[] {
    const themeId = theme || this.currentTheme;
    const wallTiles: Phaser.GameObjects.Sprite[] = [];
    const rows = mazeData.length;
    const cols = mazeData[0]?.length || 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = mazeData[y][x];
        
        // Create wall segments based on cell walls
        const wallSprites = this.createWallSegments({ x, y }, cell.walls, mazeData, themeId);
        wallTiles.push(...wallSprites);
      }
    }

    return wallTiles;
  }

  createMazeBackground(mazeSize: { width: number; height: number }, theme?: string): Phaser.GameObjects.Group {
    const themeId = theme || this.currentTheme;
    const backgroundGroup = this.scene.add.group();
    const themeConfig = this.getThemeConfig(themeId);

    // Calculate maze bounds
    const mazeWidth = mazeSize.width * this.cellSize;
    const mazeHeight = mazeSize.height * this.cellSize;
    const centerX = this.scene.scale.width / 2;
    const centerY = 200 + mazeHeight / 2; // Match existing positioning

    // Create main background fill
    const backgroundFill = this.scene.add.rectangle(
      centerX, 
      centerY, 
      mazeWidth + 40, // Extra padding
      mazeHeight + 40,
      this.getTintFromConfig(themeConfig.background.fill)
    );
    backgroundFill.setStrokeStyle(4, this.getTintFromConfig(themeConfig.borders.outer));
    backgroundGroup.add(backgroundFill);

    // Create border tiles around the maze
    const borderTiles = this.createBorderTiles(mazeSize, themeId);
    borderTiles.forEach(tile => {
      if (tile) {
        backgroundGroup.add(tile);
      }
    });

    // Add pattern tiles if available
    if (themeConfig.background.pattern) {
      const patternTiles = this.createPatternTiles(mazeSize, themeConfig.background.pattern);
      patternTiles.forEach(tile => {
        if (tile) {
          backgroundGroup.add(tile);
        }
      });
    }

    return backgroundGroup;
  }

  updateMazeTheme(mazeGroup: Phaser.GameObjects.Group, newTheme: string): void {
    const newThemeConfig = this.getThemeConfig(newTheme);
    
    // Update all child sprites in the maze group
    mazeGroup.children.entries.forEach((child: any) => {
      if (child instanceof Phaser.GameObjects.Sprite) {
        const tileType = child.getData('type');
        const cellType = child.getData('cellType');
        
        let newConfig: TileConfig | null = null;
        
        if (tileType === 'floor') {
          if (cellType === 'start') {
            newConfig = newThemeConfig.special.start;
          } else if (cellType === 'goal') {
            newConfig = newThemeConfig.special.goal;
          } else {
            newConfig = newThemeConfig.floors.default;
          }
        } else if (tileType === 'wall') {
          const wallType = child.getData('wallType') || 'straight';
          newConfig = newThemeConfig.walls[wallType as keyof typeof newThemeConfig.walls];
        }
        
        if (newConfig) {
          this.updateSpriteWithConfig(child, newConfig);
        }
      } else if (child instanceof Phaser.GameObjects.Group) {
        // Recursively update nested groups
        this.updateMazeTheme(child, newTheme);
      }
    });
    
    this.currentTheme = newTheme;
    console.log(`Updated maze theme to: ${newTheme}`);
  }

  analyzeTileConnections(mazeData: MazeCell[][], x: number, y: number): TileConnectionInfo {
    const cacheKey = `${x},${y}`;
    
    // Check cache first
    if (this.connectionCache.has(cacheKey)) {
      return this.connectionCache.get(cacheKey)!;
    }

    const rows = mazeData.length;
    const cols = mazeData[0]?.length || 0;
    
    // Check bounds
    if (x < 0 || y < 0 || x >= cols || y >= rows) {
      const emptyConnection: TileConnectionInfo = {
        north: false, south: false, east: false, west: false,
        corners: { northEast: false, northWest: false, southEast: false, southWest: false }
      };
      return emptyConnection;
    }

    const currentCell = mazeData[y][x];
    
    // Analyze connections based on wall flags
    // Bit flags: 1=East, 2=South, 4=West, 8=North
    const connections: TileConnectionInfo = {
      north: !(currentCell.walls & 8), // No north wall means connection
      south: !(currentCell.walls & 2), // No south wall means connection
      east: !(currentCell.walls & 1),  // No east wall means connection
      west: !(currentCell.walls & 4),  // No west wall means connection
      corners: {
        northEast: false,
        northWest: false,
        southEast: false,
        southWest: false
      }
    };

    // Analyze corner connections for more complex tile selection
    if (connections.north && connections.east) {
      connections.corners.northEast = true;
    }
    if (connections.north && connections.west) {
      connections.corners.northWest = true;
    }
    if (connections.south && connections.east) {
      connections.corners.southEast = true;
    }
    if (connections.south && connections.west) {
      connections.corners.southWest = true;
    }

    // Cache the result
    this.connectionCache.set(cacheKey, connections);
    
    return connections;
  }

  getWallTileForConnections(connections: TileConnectionInfo, theme: string): TileConfig {
    const themeConfig = this.getThemeConfig(theme);
    
    // Count total connections
    const connectionCount = [
      connections.north,
      connections.south,
      connections.east,
      connections.west
    ].filter(Boolean).length;

    // Determine wall type based on connections
    if (connectionCount === 0) {
      // Isolated wall (shouldn't happen in normal maze)
      return themeConfig.walls.straight;
    } else if (connectionCount === 1) {
      // End piece
      return themeConfig.walls.end;
    } else if (connectionCount === 2) {
      // Check if it's a straight line or corner
      const isStraight = (connections.north && connections.south) || 
                        (connections.east && connections.west);
      return isStraight ? themeConfig.walls.straight : themeConfig.walls.corner;
    } else {
      // Junction (3 or 4 connections)
      return themeConfig.walls.junction;
    }
  }

  positionTile(sprite: Phaser.GameObjects.Sprite, gridPosition: Position): void {
    const worldX = this.gridToWorldX(gridPosition.x);
    const worldY = this.gridToWorldY(gridPosition.y);
    sprite.setPosition(worldX, worldY);
  }

  // Private helper methods

  private createWallSegments(
    gridPosition: Position, 
    walls: number, 
    mazeData: MazeCell[][], 
    theme: string
  ): Phaser.GameObjects.Sprite[] {
    const wallSprites: Phaser.GameObjects.Sprite[] = [];
    const themeConfig = this.getThemeConfig(theme);
    
    // Analyze connections for this position
    const connections = this.analyzeTileConnections(mazeData, gridPosition.x, gridPosition.y);
    
    // Create wall sprites based on wall flags
    // Bit flags: 1=East, 2=South, 4=West, 8=North
    
    if (walls & 8) { // North wall
      const wallConfig = this.getWallConfigForDirection('north', connections, themeConfig);
      const northWall = this.createTileSprite(wallConfig, {
        x: gridPosition.x,
        y: gridPosition.y - 0.5
      });
      if (northWall) {
        northWall.setData('type', 'wall');
        northWall.setData('direction', 'north');
        northWall.setData('wallType', this.getWallTypeFromConfig(wallConfig, themeConfig));
        wallSprites.push(northWall);
      }
    }
    
    if (walls & 2) { // South wall
      const wallConfig = this.getWallConfigForDirection('south', connections, themeConfig);
      const southWall = this.createTileSprite(wallConfig, {
        x: gridPosition.x,
        y: gridPosition.y + 0.5
      });
      if (southWall) {
        southWall.setData('type', 'wall');
        southWall.setData('direction', 'south');
        southWall.setData('wallType', this.getWallTypeFromConfig(wallConfig, themeConfig));
        wallSprites.push(southWall);
      }
    }
    
    if (walls & 4) { // West wall
      const wallConfig = this.getWallConfigForDirection('west', connections, themeConfig);
      const westWall = this.createTileSprite(wallConfig, {
        x: gridPosition.x - 0.5,
        y: gridPosition.y
      });
      if (westWall) {
        westWall.setData('type', 'wall');
        westWall.setData('direction', 'west');
        westWall.setData('wallType', this.getWallTypeFromConfig(wallConfig, themeConfig));
        wallSprites.push(westWall);
      }
    }
    
    if (walls & 1) { // East wall
      const wallConfig = this.getWallConfigForDirection('east', connections, themeConfig);
      const eastWall = this.createTileSprite(wallConfig, {
        x: gridPosition.x + 0.5,
        y: gridPosition.y
      });
      if (eastWall) {
        eastWall.setData('type', 'wall');
        eastWall.setData('direction', 'east');
        eastWall.setData('wallType', this.getWallTypeFromConfig(wallConfig, themeConfig));
        wallSprites.push(eastWall);
      }
    }
    
    return wallSprites;
  }

  private createBorderTiles(mazeSize: { width: number; height: number }, theme: string): Phaser.GameObjects.Sprite[] {
    const borderTiles: Phaser.GameObjects.Sprite[] = [];
    const themeConfig = this.getThemeConfig(theme);
    const borderConfig = themeConfig.borders.outer;

    // Create border around the maze
    const { width, height } = mazeSize;
    
    // Top and bottom borders
    for (let x = -1; x <= width; x++) {
      // Top border
      const topBorder = this.createTileSprite(borderConfig, { x, y: -1 });
      if (topBorder) {
        topBorder.setData('type', 'border');
        topBorder.setData('position', 'top');
        borderTiles.push(topBorder);
      }
      
      // Bottom border
      const bottomBorder = this.createTileSprite(borderConfig, { x, y: height });
      if (bottomBorder) {
        bottomBorder.setData('type', 'border');
        bottomBorder.setData('position', 'bottom');
        borderTiles.push(bottomBorder);
      }
    }
    
    // Left and right borders (excluding corners already created)
    for (let y = 0; y < height; y++) {
      // Left border
      const leftBorder = this.createTileSprite(borderConfig, { x: -1, y });
      if (leftBorder) {
        leftBorder.setData('type', 'border');
        leftBorder.setData('position', 'left');
        borderTiles.push(leftBorder);
      }
      
      // Right border
      const rightBorder = this.createTileSprite(borderConfig, { x: width, y });
      if (rightBorder) {
        rightBorder.setData('type', 'border');
        rightBorder.setData('position', 'right');
        borderTiles.push(rightBorder);
      }
    }

    return borderTiles;
  }

  private createPatternTiles(mazeSize: { width: number; height: number }, patternConfig: TileConfig): Phaser.GameObjects.Sprite[] {
    const patternTiles: Phaser.GameObjects.Sprite[] = [];
    
    // Create a subtle pattern in the background
    const { width, height } = mazeSize;
    const patternSpacing = 3; // Every 3rd tile
    
    for (let y = 0; y < height; y += patternSpacing) {
      for (let x = 0; x < width; x += patternSpacing) {
        const patternTile = this.createTileSprite(patternConfig, { x: x + 0.5, y: y + 0.5 });
        if (patternTile) {
          patternTile.setAlpha(0.3); // Make it subtle
          patternTile.setData('type', 'pattern');
          patternTiles.push(patternTile);
        }
      }
    }

    return patternTiles;
  }

  private createTileSprite(config: TileConfig, gridPosition: Position): Phaser.GameObjects.Sprite | null {
    try {
      let sprite: Phaser.GameObjects.Sprite;
      
      // Create sprite based on configuration
      if (config.atlas && config.frame) {
        sprite = this.scene.add.sprite(0, 0, config.atlas, config.frame);
      } else {
        // Fallback to colored rectangle if texture not available
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(config.tint || 0xFFFFFF);
        graphics.fillRect(-this.cellSize/2, -this.cellSize/2, this.cellSize, this.cellSize);
        
        // Convert graphics to texture and create sprite
        const texture = graphics.generateTexture(config.key, this.cellSize, this.cellSize);
        sprite = this.scene.add.sprite(0, 0, texture);
        graphics.destroy();
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
      
      if (config.rotation !== undefined) {
        sprite.setRotation(config.rotation);
      }
      
      // Position the sprite
      this.positionTile(sprite, gridPosition);
      
      return sprite;
    } catch (error) {
      console.warn(`Failed to create tile sprite: ${error}`);
      return null;
    }
  }

  private getWallConfigForDirection(
    direction: 'north' | 'south' | 'east' | 'west',
    connections: TileConnectionInfo,
    themeConfig: MazeTileTheme
  ): TileConfig {
    // For now, use the connection-based wall selection
    const wallConfig = this.getWallTileForConnections(connections, this.currentTheme);
    
    // Apply direction-specific rotation
    const rotatedConfig = { ...wallConfig };
    
    switch (direction) {
      case 'north':
        rotatedConfig.rotation = 0;
        break;
      case 'east':
        rotatedConfig.rotation = Math.PI / 2;
        break;
      case 'south':
        rotatedConfig.rotation = Math.PI;
        break;
      case 'west':
        rotatedConfig.rotation = -Math.PI / 2;
        break;
    }
    
    return rotatedConfig;
  }

  private getWallTypeFromConfig(wallConfig: TileConfig, themeConfig: MazeTileTheme): string {
    // Determine wall type by comparing config
    if (wallConfig === themeConfig.walls.straight) return 'straight';
    if (wallConfig === themeConfig.walls.corner) return 'corner';
    if (wallConfig === themeConfig.walls.junction) return 'junction';
    if (wallConfig === themeConfig.walls.end) return 'end';
    return 'straight';
  }

  private getThemeConfig(theme: string): MazeTileTheme {
    // Try to get theme from asset manager
    if (this.assetManager && this.assetManager.getThemeAsset) {
      const themeAssets = this.assetManager.getThemeAsset(theme, 'maze', 'complete');
      if (themeAssets) {
        return themeAssets as MazeTileTheme;
      }
    }
    
    // Fallback to default theme
    return this.defaultTheme;
  }

  private updateSpriteWithConfig(sprite: Phaser.GameObjects.Sprite, config: TileConfig): void {
    if (config.atlas && config.frame) {
      sprite.setTexture(config.atlas, config.frame);
    } else if (config.key) {
      sprite.setTexture(config.key);
    }
    
    if (config.scale) {
      sprite.setScale(config.scale);
    }
    
    if (config.anchor) {
      sprite.setOrigin(config.anchor.x, config.anchor.y);
    }
    
    if (config.tint !== undefined) {
      sprite.setTint(config.tint);
    }
    
    if (config.rotation !== undefined) {
      sprite.setRotation(config.rotation);
    }
  }

  private getTintFromConfig(config: TileConfig): number {
    return config.tint || 0xFFFFFF;
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

  // Public utility methods

  /**
   * Sets the cell size for tile positioning
   */
  setCellSize(size: number): void {
    this.cellSize = size;
  }

  /**
   * Gets the current cell size
   */
  getCellSize(): number {
    return this.cellSize;
  }

  /**
   * Sets the current theme
   */
  setCurrentTheme(theme: string): void {
    this.currentTheme = theme;
  }

  /**
   * Gets the current theme
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * Clears all caches
   */
  clearCaches(): void {
    this.tileCache.clear();
    this.connectionCache.clear();
  }

  /**
   * Destroys the renderer and cleans up resources
   */
  destroy(): void {
    this.clearCaches();
    console.log('MazeTileRenderer destroyed and cleaned up');
  }
}