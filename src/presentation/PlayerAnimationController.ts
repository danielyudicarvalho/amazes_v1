// Player character animation controller for directional movement and idle states
import { Position } from '../core/types/GameState';
import { Direction } from '../core/GameCore';
import { PlayerAnimationRegistry } from './PlayerAnimationRegistry';

export interface PlayerAnimationConfig {
  idleAnimation: string;
  walkAnimations: {
    up: string;
    down: string;
    left: string;
    right: string;
  };
  transitionDuration: number;
  movementDuration: number;
  idleDelay: number;
}

export interface PlayerSpriteState {
  currentAnimation: string;
  direction: Direction | null;
  isMoving: boolean;
  isIdle: boolean;
  position: Position;
  lastMoveTime: number;
}

export class PlayerAnimationController {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private config: PlayerAnimationConfig;
  private state: PlayerSpriteState;
  private idleTimer: Phaser.Time.TimerEvent | null = null;
  private movementTween: Phaser.Tweens.Tween | null = null;
  private animationQueue: string[] = [];
  private isInitialized: boolean = false;
  private animationRegistry: PlayerAnimationRegistry;

  // Default animation configuration
  private readonly defaultConfig: PlayerAnimationConfig = {
    idleAnimation: 'player_idle',
    walkAnimations: {
      up: 'player_walk_up',
      down: 'player_walk_down',
      left: 'player_walk_left',
      right: 'player_walk_right'
    },
    transitionDuration: 100,
    movementDuration: 200,
    idleDelay: 1000
  };

  constructor(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite, config?: Partial<PlayerAnimationConfig>) {
    this.scene = scene;
    this.sprite = sprite;
    this.config = { ...this.defaultConfig, ...config };

    this.state = {
      currentAnimation: '',
      direction: null,
      isMoving: false,
      isIdle: true,
      position: { x: 0, y: 0 },
      lastMoveTime: 0
    };

    // Initialize animation registry
    this.animationRegistry = new PlayerAnimationRegistry(scene);

    this.initialize();
  }

  /**
   * Initializes the animation controller and sets up default animations
   */
  private async initialize(): Promise<void> {
    // Wait for animations to be ready (elf character loading is async)
    await this.waitForAnimationsReady();
    
    // Create all animations through the registry
    this.animationRegistry.createAllAnimations();

    // Set initial idle state
    this.playIdleAnimation();

    // Set up idle timer
    this.setupIdleTimer();

    this.isInitialized = true;
    console.log('PlayerAnimationController initialized');
  }

  /**
   * Waits for animations to be ready (handles async elf character loading)
   */
  private waitForAnimationsReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkReady = () => {
        // Check if elf character is loaded or fallback is ready
        if (this.animationRegistry.isUsingElfCharacter()) {
          const elfLoader = this.animationRegistry.getElfCharacterLoader();
          if (elfLoader && elfLoader.areAssetsLoaded()) {
            resolve();
            return;
          }
        } else {
          // Fallback animations should be ready immediately
          resolve();
          return;
        }
        
        // Check again in 100ms
        setTimeout(checkReady, 100);
      };
      
      checkReady();
    });
  }

  /**
   * Plays movement animation for the specified direction
   */
  playMovementAnimation(direction: Direction, fromPosition: Position, toPosition: Position): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isInitialized) {
        console.warn('PlayerAnimationController not initialized');
        resolve();
        return;
      }

      // Update state
      this.state.direction = direction;
      this.state.isMoving = true;
      this.state.isIdle = false;
      this.state.lastMoveTime = Date.now();

      // Clear idle timer
      this.clearIdleTimer();

      // Stop current movement tween if any
      if (this.movementTween) {
        this.movementTween.stop();
      }

      // Get appropriate walk animation (elf character or fallback)
      let walkAnimation: string;
      if (this.animationRegistry.isUsingElfCharacter()) {
        walkAnimation = this.animationRegistry.getPlayerAnimationKey(direction, 'walking');
      } else {
        walkAnimation = this.config.walkAnimations[direction];
      }

      // Play walk animation if it exists
      if (this.animationRegistry.hasAnimation(walkAnimation)) {
        this.sprite.play(walkAnimation);
        this.state.currentAnimation = walkAnimation;
      } else {
        // Fallback: use sprite flipping for direction
        this.handleDirectionalFallback(direction);
      }

      // Calculate world positions for movement
      const startWorldPos = this.gridToWorldPosition(fromPosition);
      const endWorldPos = this.gridToWorldPosition(toPosition);

      // Create movement tween
      this.movementTween = this.scene.tweens.add({
        targets: this.sprite,
        x: endWorldPos.x,
        y: endWorldPos.y,
        duration: this.config.movementDuration,
        ease: 'Power2',
        onComplete: () => {
          this.state.position = toPosition;
          this.state.isMoving = false;

          // Transition to idle after movement
          this.transitionToIdle();

          resolve();
        }
      });
    });
  }

  /**
   * Plays idle animation
   */
  playIdleAnimation(): void {
    if (!this.isInitialized) return;

    let idleAnimation: string;
    
    if (this.animationRegistry.isUsingElfCharacter()) {
      // Use elf character idle animation for current direction or default to down
      const direction = this.state.direction || 'down';
      idleAnimation = this.animationRegistry.getPlayerAnimationKey(direction, 'idle');
    } else {
      idleAnimation = this.config.idleAnimation;
    }

    if (this.animationRegistry.hasAnimation(idleAnimation)) {
      this.sprite.play(idleAnimation);
      this.state.currentAnimation = idleAnimation;
    } else {
      // Fallback: stop current animation and show first frame
      this.sprite.stop();
      this.state.currentAnimation = 'idle_fallback';
    }

    this.state.isIdle = true;
    this.state.isMoving = false;
  }

  /**
   * Updates the player sprite position without animation (for teleporting/resetting)
   */
  updatePosition(position: Position): void {
    const worldPos = this.gridToWorldPosition(position);
    this.sprite.setPosition(worldPos.x, worldPos.y);
    this.state.position = position;
  }

  /**
   * Gets the current animation state
   */
  getAnimationState(): Readonly<PlayerSpriteState> {
    return { ...this.state };
  }

  /**
   * Checks if the player is currently animating
   */
  isAnimating(): boolean {
    return this.state.isMoving || (this.movementTween && this.movementTween.isActive());
  }

  /**
   * Forces immediate transition to idle state
   */
  forceIdle(): void {
    if (this.movementTween) {
      this.movementTween.stop();
      this.movementTween = null;
    }

    this.clearIdleTimer();
    this.playIdleAnimation();
    this.setupIdleTimer();
  }

  /**
   * Sets the animation configuration
   */
  setConfig(config: Partial<PlayerAnimationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Updates the sprite reference (useful when switching themes)
   */
  updateSprite(newSprite: Phaser.GameObjects.Sprite): void {
    // Transfer current state to new sprite
    const currentPos = this.gridToWorldPosition(this.state.position);
    newSprite.setPosition(currentPos.x, currentPos.y);

    // Stop current animations
    if (this.movementTween) {
      this.movementTween.stop();
    }

    // Update sprite reference
    this.sprite = newSprite;

    // Restore animation state
    if (this.state.isIdle) {
      this.playIdleAnimation();
    } else if (this.state.isMoving && this.state.direction) {
      const walkAnimation = this.config.walkAnimations[this.state.direction];
      if (this.scene.anims.exists(walkAnimation)) {
        this.sprite.play(walkAnimation);
      }
    }
  }

  /**
   * Destroys the animation controller and cleans up resources
   */
  destroy(): void {
    this.clearIdleTimer();

    if (this.movementTween) {
      this.movementTween.stop();
      this.movementTween = null;
    }

    if (this.animationRegistry) {
      this.animationRegistry.destroy();
    }

    this.animationQueue = [];
    this.isInitialized = false;

    console.log('PlayerAnimationController destroyed');
  }

  // Private helper methods



  private handleDirectionalFallback(direction: Direction): void {
    // Use sprite flipping and tinting as fallback for directional indication
    switch (direction) {
      case 'left':
        this.sprite.setFlipX(true);
        break;
      case 'right':
        this.sprite.setFlipX(false);
        break;
      case 'up':
        this.sprite.setFlipX(false);
        this.sprite.setTint(0xCCCCFF); // Slight blue tint for up movement
        break;
      case 'down':
        this.sprite.setFlipX(false);
        this.sprite.setTint(0xFFCCCC); // Slight red tint for down movement
        break;
    }

    // Reset tint after a short delay
    this.scene.time.delayedCall(this.config.movementDuration, () => {
      this.sprite.clearTint();
    });
  }

  private transitionToIdle(): void {
    // Small delay before transitioning to idle to make movement feel more natural
    this.scene.time.delayedCall(this.config.transitionDuration, () => {
      if (!this.state.isMoving) {
        this.playIdleAnimation();
        this.setupIdleTimer();
      }
    });
  }

  private setupIdleTimer(): void {
    this.clearIdleTimer();

    // Set up timer for idle animation variations or effects
    this.idleTimer = this.scene.time.addEvent({
      delay: this.config.idleDelay,
      callback: () => {
        if (this.state.isIdle && !this.state.isMoving) {
          this.playIdleVariation();
        }
      },
      loop: true
    });
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      this.idleTimer.destroy();
      this.idleTimer = null;
    }
  }

  private playIdleVariation(): void {
    // Add subtle idle variations like blinking or slight movement
    if (this.sprite && this.sprite.active) {
      // Simple scale pulse as idle variation
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: this.sprite.scaleX * 1.05,
        scaleY: this.sprite.scaleY * 1.05,
        duration: 200,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
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
   * Queues an animation to play after current animation completes
   */
  queueAnimation(animationKey: string): void {
    this.animationQueue.push(animationKey);
  }

  /**
   * Clears the animation queue
   */
  clearAnimationQueue(): void {
    this.animationQueue = [];
  }

  /**
   * Gets the current direction the player is facing
   */
  getCurrentDirection(): Direction | null {
    return this.state.direction;
  }

  /**
   * Checks if the player is currently moving
   */
  isMoving(): boolean {
    return this.state.isMoving;
  }

  /**
   * Checks if the player is in idle state
   */
  isIdle(): boolean {
    return this.state.isIdle;
  }

  /**
   * Gets the time since last movement
   */
  getTimeSinceLastMove(): number {
    return Date.now() - this.state.lastMoveTime;
  }

  /**
   * Sets the cell size for coordinate conversion
   */
  setCellSize(cellSize: number): void {
    // Update the coordinate conversion if needed
    // This method allows for dynamic cell size changes
  }

  /**
   * Plays a custom animation
   */
  playCustomAnimation(animationKey: string, loop: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      if (!this.scene.anims.exists(animationKey)) {
        console.warn(`Animation ${animationKey} does not exist`);
        resolve();
        return;
      }

      const previousAnimation = this.state.currentAnimation;
      this.sprite.play(animationKey);
      this.state.currentAnimation = animationKey;

      if (!loop) {
        // Wait for animation to complete
        this.sprite.once('animationcomplete', () => {
          // Return to previous state
          if (this.state.isIdle) {
            this.playIdleAnimation();
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Stops current animation and holds on current frame
   */
  pauseAnimation(): void {
    this.sprite.anims.pause();
  }

  /**
   * Resumes paused animation
   */
  resumeAnimation(): void {
    this.sprite.anims.resume();
  }

  /**
   * Gets animation configuration
   */
  getConfig(): PlayerAnimationConfig {
    return { ...this.config };
  }

  /**
   * Gets the animation registry instance
   */
  getAnimationRegistry(): PlayerAnimationRegistry {
    return this.animationRegistry;
  }
}