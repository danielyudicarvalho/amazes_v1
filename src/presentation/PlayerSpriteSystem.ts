// Enhanced player sprite system with directional animations and game state integration
import { Position } from '../core/types/GameState';
import { Direction, IGameCore } from '../core/GameCore';
import { PlayerAnimationController, PlayerAnimationConfig } from './PlayerAnimationController';
import { SpriteRenderer } from './SpriteRenderer';
import { SpriteFactory } from './SpriteFactory';
import { LayerManager } from './LayerManager';

export interface PlayerSpriteConfig {
  theme?: string;
  scale?: number;
  animations?: PlayerAnimationConfig;
  enablePhysics?: boolean;
  enableInteraction?: boolean;
}

export interface PlayerSpriteSystemConfig {
  scene: Phaser.Scene;
  gameCore: IGameCore;
  spriteRenderer?: SpriteRenderer;
  spriteFactory?: SpriteFactory;
  layerManager?: LayerManager;
  assetManager?: any;
}

export class PlayerSpriteSystem {
  private scene: Phaser.Scene;
  private gameCore: IGameCore;
  private spriteRenderer: SpriteRenderer | null = null;
  private spriteFactory: SpriteFactory | null = null;
  private layerManager: LayerManager | null = null;
  private assetManager: any = null;

  private playerSprite: Phaser.GameObjects.Sprite | null = null;
  private animationController: PlayerAnimationController | null = null;
  private currentConfig: PlayerSpriteConfig = {};
  private isInitialized: boolean = false;
  private gameStateSubscribed: boolean = false;

  // Default configuration
  private readonly defaultConfig: PlayerSpriteConfig = {
    theme: 'default',
    scale: 1,
    enablePhysics: false,
    enableInteraction: true,
    animations: {
      idleAnimation: 'player_idle',
      walkAnimations: {
        up: 'player_walk_up',
        down: 'player_walk_down',
        left: 'player_walk_left',
        right: 'player_walk_right'
      },
      transitionDuration: 100,
      movementDuration: 200,
      idleDelay: 1500
    }
  };

  constructor(config: PlayerSpriteSystemConfig) {
    this.scene = config.scene;
    this.gameCore = config.gameCore;
    this.spriteRenderer = config.spriteRenderer || null;
    this.spriteFactory = config.spriteFactory || null;
    this.layerManager = config.layerManager || null;
    this.assetManager = config.assetManager || null;

    this.initialize();
  }

  /**
   * Initializes the player sprite system
   */
  private initialize(): void {
    // Create fallback systems if not provided
    this.createFallbackSystems();

    // Subscribe to game events
    this.subscribeToGameEvents();

    this.isInitialized = true;
    console.log('PlayerSpriteSystem initialized');
  }

  /**
   * Creates the player sprite with the specified configuration
   */
  createPlayerSprite(position: Position, config?: PlayerSpriteConfig): Phaser.GameObjects.Sprite {
    this.currentConfig = { ...this.defaultConfig, ...config };

    // Destroy existing sprite if any
    this.destroyPlayerSprite();

    // Create sprite using factory or fallback
    if (this.spriteFactory) {
      this.playerSprite = this.spriteFactory.createPlayer(position, {
        theme: this.currentConfig.theme,
        animations: Object.keys(this.currentConfig.animations?.walkAnimations || {}),
        interactive: this.currentConfig.enableInteraction
      });
    } else {
      this.playerSprite = this.createFallbackPlayerSprite(position);
    }

    // Apply configuration
    this.applyPlayerSpriteConfig();

    // Add to appropriate layer
    if (this.layerManager) {
      this.layerManager.addSpriteToLayer(this.playerSprite, 'player');
    }

    // Create animation controller
    this.animationController = new PlayerAnimationController(
      this.scene,
      this.playerSprite,
      this.currentConfig.animations
    );

    // Set up interaction if enabled
    if (this.currentConfig.enableInteraction) {
      this.setupPlayerInteraction();
    }

    console.log(`Created player sprite at (${position.x}, ${position.y})`);
    return this.playerSprite;
  }

  /**
   * Updates the player sprite position and plays movement animation
   */
  async movePlayer(direction: Direction, fromPosition: Position, toPosition: Position): Promise<void> {
    if (!this.playerSprite || !this.animationController) {
      console.warn('Player sprite not initialized');
      return;
    }

    try {
      // Play movement animation
      await this.animationController.playMovementAnimation(direction, fromPosition, toPosition);
      
      console.log(`Player moved ${direction} from (${fromPosition.x}, ${fromPosition.y}) to (${toPosition.x}, ${toPosition.y})`);
    } catch (error) {
      console.error('Error during player movement animation:', error);
      
      // Fallback: update position without animation
      this.animationController.updatePosition(toPosition);
    }
  }

  /**
   * Updates the player sprite theme
   */
  updateTheme(newTheme: string): void {
    if (!this.playerSprite) {
      console.warn('Player sprite not initialized');
      return;
    }

    this.currentConfig.theme = newTheme;

    // Update sprite appearance using renderer
    if (this.spriteRenderer) {
      this.spriteRenderer.updateSpriteTheme(this.playerSprite, newTheme);
    }

    console.log(`Updated player sprite theme to: ${newTheme}`);
  }

  /**
   * Gets the current player sprite
   */
  getPlayerSprite(): Phaser.GameObjects.Sprite | null {
    return this.playerSprite;
  }

  /**
   * Gets the animation controller
   */
  getAnimationController(): PlayerAnimationController | null {
    return this.animationController;
  }

  /**
   * Checks if the player is currently animating
   */
  isPlayerAnimating(): boolean {
    return this.animationController ? this.animationController.isAnimating() : false;
  }

  /**
   * Forces the player to idle state
   */
  forcePlayerIdle(): void {
    if (this.animationController) {
      this.animationController.forceIdle();
    }
  }

  /**
   * Updates the player sprite configuration
   */
  updateConfig(config: Partial<PlayerSpriteConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config };

    if (this.playerSprite) {
      this.applyPlayerSpriteConfig();
    }

    if (this.animationController && config.animations) {
      this.animationController.setConfig(config.animations);
    }
  }

  /**
   * Synchronizes sprite position with game state
   */
  syncWithGameState(): void {
    if (!this.playerSprite || !this.animationController) return;

    try {
      const gameState = this.gameCore.getGameState();
      const playerPosition = gameState.player.position;

      // Update position if not currently animating
      if (!this.animationController.isAnimating()) {
        this.animationController.updatePosition(playerPosition);
      }
    } catch (error) {
      console.error('Error syncing player sprite with game state:', error);
    }
  }

  /**
   * Destroys the player sprite system and cleans up resources
   */
  destroy(): void {
    this.unsubscribeFromGameEvents();
    this.destroyPlayerSprite();
    this.isInitialized = false;
    
    console.log('PlayerSpriteSystem destroyed');
  }

  // Private helper methods

  private createFallbackSystems(): void {
    // Create sprite renderer if not provided
    if (!this.spriteRenderer) {
      this.spriteRenderer = new SpriteRenderer(this.scene, this.assetManager);
    }

    // Create sprite factory if not provided
    if (!this.spriteFactory) {
      this.spriteFactory = new SpriteFactory({
        scene: this.scene,
        assetManager: this.assetManager,
        defaultTheme: this.currentConfig.theme || 'default'
      });
    }

    // Create layer manager if not provided
    if (!this.layerManager) {
      this.layerManager = new LayerManager(this.scene);
    }
  }

  private createFallbackPlayerSprite(position: Position): Phaser.GameObjects.Sprite {
    // Try to use elf character first
    if (this.animationController && this.animationController.getAnimationRegistry().isUsingElfCharacter()) {
      const elfLoader = this.animationController.getAnimationRegistry().getElfCharacterLoader();
      if (elfLoader) {
        const elfSprite = elfLoader.createElfSprite(this.gridToWorldPosition(position), 'down');
        if (elfSprite) {
          return elfSprite;
        }
      }
    }

    // Create a basic circle sprite as fallback
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x4169E1); // Blue color
    graphics.fillCircle(0, 0, 8);
    graphics.generateTexture('player_fallback', 16, 16);
    graphics.destroy();

    const sprite = this.scene.add.sprite(0, 0, 'player_fallback');
    
    // Position the sprite
    const worldPos = this.gridToWorldPosition(position);
    sprite.setPosition(worldPos.x, worldPos.y);
    
    return sprite;
  }

  private applyPlayerSpriteConfig(): void {
    if (!this.playerSprite) return;

    // Apply scale
    if (this.currentConfig.scale) {
      this.playerSprite.setScale(this.currentConfig.scale);
    }

    // Apply physics if enabled
    if (this.currentConfig.enablePhysics && this.scene.physics) {
      this.scene.physics.add.existing(this.playerSprite);
    }
  }

  private setupPlayerInteraction(): void {
    if (!this.playerSprite) return;

    this.playerSprite.setInteractive({ useHandCursor: true });

    // Add hover effects
    this.playerSprite.on('pointerover', () => {
      this.playerSprite!.setTint(0xFFFFFF);
    });

    this.playerSprite.on('pointerout', () => {
      this.playerSprite!.clearTint();
    });

    // Add click feedback
    this.playerSprite.on('pointerdown', () => {
      // Small scale animation on click
      this.scene.tweens.add({
        targets: this.playerSprite,
        scaleX: this.playerSprite!.scaleX * 0.9,
        scaleY: this.playerSprite!.scaleY * 0.9,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    });
  }

  private subscribeToGameEvents(): void {
    if (this.gameStateSubscribed) return;

    // Subscribe to player movement events
    this.gameCore.on('player.moved', (payload) => {
      this.handlePlayerMoved(payload);
    });

    // Subscribe to game state changes
    this.gameCore.on('state.changed', (payload) => {
      this.handleGameStateChanged(payload);
    });

    // Subscribe to game initialization
    this.gameCore.on('game.initialized', (payload) => {
      this.handleGameInitialized(payload);
    });

    // Subscribe to game reset
    this.gameCore.on('game.reset', (payload) => {
      this.handleGameReset(payload);
    });

    this.gameStateSubscribed = true;
  }

  private unsubscribeFromGameEvents(): void {
    if (!this.gameStateSubscribed) return;

    // Note: In a real implementation, we would need specific off methods
    // For now, we'll just mark as unsubscribed
    this.gameStateSubscribed = false;
  }

  private handlePlayerMoved(payload: any): void {
    if (!this.playerSprite || !this.animationController) return;

    // The movement animation is handled by the GameScene calling movePlayer directly
    // This event handler can be used for additional effects like particles or sounds
    console.log(`Player moved event received: ${payload.from.x},${payload.from.y} -> ${payload.to.x},${payload.to.y}`);
  }

  private handleGameStateChanged(payload: any): void {
    // Sync sprite with game state if needed
    this.syncWithGameState();
  }

  private handleGameInitialized(payload: any): void {
    // Create player sprite when game is initialized
    const gameState = payload.state;
    if (gameState && gameState.player) {
      this.createPlayerSprite(gameState.player.position, this.currentConfig);
    }
  }

  private handleGameReset(payload: any): void {
    // Reset player sprite to initial position
    if (this.animationController) {
      this.animationController.forceIdle();
    }
    this.syncWithGameState();
  }

  private destroyPlayerSprite(): void {
    if (this.animationController) {
      this.animationController.destroy();
      this.animationController = null;
    }

    if (this.playerSprite) {
      // Remove from layer if managed by layer manager
      if (this.layerManager) {
        this.layerManager.removeSpriteFromLayer(this.playerSprite);
      }
      
      this.playerSprite.destroy();
      this.playerSprite = null;
    }
  }

  private gridToWorldPosition(gridPos: Position): Position {
    // Convert grid coordinates to world coordinates
    // This should match the coordinate system used in GameScene
    const cellSize = 24; // Default cell size
    const mazeWidth = 10 * cellSize; // Assuming typical maze width
    const offsetX = (this.scene.scale.width - mazeWidth) / 2;
    const offsetY = 200; // Match GameScene offset

    return {
      x: offsetX + gridPos.x * cellSize + cellSize / 2,
      y: offsetY + gridPos.y * cellSize + cellSize / 2
    };
  }

  // Public utility methods

  /**
   * Gets the current player position in grid coordinates
   */
  getPlayerPosition(): Position {
    if (this.animationController) {
      return this.animationController.getAnimationState().position;
    }
    
    try {
      const gameState = this.gameCore.getGameState();
      return gameState.player.position;
    } catch (error) {
      console.error('Error getting player position:', error);
      return { x: 0, y: 0 };
    }
  }

  /**
   * Gets the current player direction
   */
  getPlayerDirection(): Direction | null {
    return this.animationController ? this.animationController.getCurrentDirection() : null;
  }

  /**
   * Checks if the player is currently moving
   */
  isPlayerMoving(): boolean {
    return this.animationController ? this.animationController.isMoving() : false;
  }

  /**
   * Checks if the player is in idle state
   */
  isPlayerIdle(): boolean {
    return this.animationController ? this.animationController.isIdle() : true;
  }

  /**
   * Plays a custom animation on the player sprite
   */
  async playCustomAnimation(animationKey: string, loop: boolean = false): Promise<void> {
    if (this.animationController) {
      return this.animationController.playCustomAnimation(animationKey, loop);
    }
  }

  /**
   * Updates the cell size for coordinate conversion
   */
  setCellSize(cellSize: number): void {
    if (this.animationController) {
      this.animationController.setCellSize(cellSize);
    }
  }

  /**
   * Gets system status information
   */
  getSystemStatus(): {
    initialized: boolean;
    hasSprite: boolean;
    hasAnimationController: boolean;
    isAnimating: boolean;
    currentTheme: string;
  } {
    return {
      initialized: this.isInitialized,
      hasSprite: this.playerSprite !== null,
      hasAnimationController: this.animationController !== null,
      isAnimating: this.isPlayerAnimating(),
      currentTheme: this.currentConfig.theme || 'default'
    };
  }

  /**
   * Validates the system state
   */
  validateSystem(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const result = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    if (!this.isInitialized) {
      result.errors.push('System not initialized');
      result.isValid = false;
    }

    if (!this.playerSprite) {
      result.warnings.push('No player sprite created');
    }

    if (!this.animationController) {
      result.warnings.push('No animation controller available');
    }

    if (this.playerSprite && !this.playerSprite.active) {
      result.errors.push('Player sprite is not active');
      result.isValid = false;
    }

    return result;
  }

  /**
   * Resets the player sprite system to initial state
   */
  reset(): void {
    this.destroyPlayerSprite();
    
    try {
      const gameState = this.gameCore.getGameState();
      if (gameState && gameState.player) {
        this.createPlayerSprite(gameState.player.position, this.currentConfig);
      }
    } catch (error) {
      console.error('Error resetting player sprite system:', error);
    }
  }
}