// Example usage of the SpriteRenderer system
import { SpriteRenderer } from './SpriteRenderer';
import { SpriteFactory } from './SpriteFactory';
import { LayerManager } from './LayerManager';
import { SpriteUtils } from './SpriteUtils';

/**
 * Example integration of the sprite rendering system
 * This demonstrates how to use the new sprite system to replace geometric shapes
 */
export class SpriteRenderingExample {
  private scene: Phaser.Scene;
  private spriteRenderer: SpriteRenderer;
  private spriteFactory: SpriteFactory;
  private layerManager: LayerManager;
  private spriteUtils: SpriteUtils;

  constructor(scene: Phaser.Scene, assetManager?: any) {
    this.scene = scene;
    
    // Initialize the sprite rendering system
    this.layerManager = new LayerManager(scene);
    this.spriteRenderer = new SpriteRenderer(scene, assetManager);
    this.spriteFactory = new SpriteFactory({
      scene,
      assetManager,
      defaultTheme: 'default',
      cellSize: 24
    });
    this.spriteUtils = new SpriteUtils(scene);
  }

  /**
   * Example: Replace geometric player with sprite
   */
  createPlayerSprite(position: { x: number; y: number }): Phaser.GameObjects.Sprite {
    // Create player sprite using the factory
    const playerSprite = this.spriteFactory.createPlayer(position, {
      theme: 'default',
      interactive: true,
      animations: ['idle', 'walk']
    });

    // Add to appropriate layer
    this.layerManager.addSpriteToLayer(playerSprite, 'player');

    // Apply responsive scaling
    this.spriteUtils.scaleSprite(playerSprite, {
      baseScale: 1,
      responsive: true,
      minScale: 0.5,
      maxScale: 2
    });

    console.log('Created player sprite with enhanced rendering system');
    return playerSprite;
  }

  /**
   * Example: Replace geometric orbs with animated sprites
   */
  createOrbSprites(orbPositions: Array<{ x: number; y: number; id: string }>): Phaser.GameObjects.Sprite[] {
    const orbSprites: Phaser.GameObjects.Sprite[] = [];

    orbPositions.forEach((orbData, index) => {
      // Create orb sprite with variation
      const orbSprite = this.spriteFactory.createOrb(orbData, orbData.id, {
        theme: 'default',
        variant: `type_${index % 5}`, // Cycle through 5 orb types
        animations: ['float', 'collect']
      });

      // Add to game objects layer
      this.layerManager.addSpriteToLayer(orbSprite, 'game-objects');

      // Add floating animation
      this.spriteUtils.floatSprite(orbSprite, 3, 2000);

      orbSprites.push(orbSprite);
    });

    console.log(`Created ${orbSprites.length} orb sprites with floating animations`);
    return orbSprites;
  }

  /**
   * Example: Replace geometric maze with textured tiles
   */
  createMazeSprites(mazeData: any[][]): Phaser.GameObjects.Group {
    // Create maze using the sprite renderer
    const mazeGroup = this.spriteRenderer.createMazeTiles(mazeData, 'default');

    console.log('Created maze with textured tiles');
    return mazeGroup;
  }

  /**
   * Example: Create enhanced UI elements
   */
  createUIElements(): void {
    // Create button sprites instead of basic rectangles
    const backButton = this.spriteFactory.createUIElement('button', { x: 50, y: 50 }, {
      theme: 'default',
      interactive: true
    });

    const pauseButton = this.spriteFactory.createUIElement('button', { x: 750, y: 50 }, {
      theme: 'default',
      interactive: true
    });

    // Add to UI layer
    this.layerManager.addSpriteToLayer(backButton, 'ui-elements');
    this.layerManager.addSpriteToLayer(pauseButton, 'ui-elements');

    // Add hover effects
    backButton.on('pointerover', () => {
      this.spriteUtils.bounceSprite(backButton, 0.1, 200);
    });

    pauseButton.on('pointerover', () => {
      this.spriteUtils.bounceSprite(pauseButton, 0.1, 200);
    });

    console.log('Created enhanced UI elements with hover effects');
  }

  /**
   * Example: Animate player movement with sprites
   */
  animatePlayerMovement(playerSprite: Phaser.GameObjects.Sprite, from: { x: number; y: number }, to: { x: number; y: number }): void {
    // Convert grid positions to world coordinates
    const fromWorld = this.spriteUtils.gridToWorld(from);
    const toWorld = this.spriteUtils.gridToWorld(to);

    // Animate movement with easing
    this.spriteUtils.animateToPosition(playerSprite, toWorld, 300, 'Power2');

    // Add movement effects
    this.createMovementTrail(playerSprite, fromWorld, toWorld);

    console.log(`Animated player movement from (${from.x}, ${from.y}) to (${to.x}, ${to.y})`);
  }

  /**
   * Example: Create collection effects for orbs
   */
  animateOrbCollection(orbSprite: Phaser.GameObjects.Sprite): void {
    // Scale down and fade out
    this.scene.tweens.add({
      targets: orbSprite,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Remove from layer and destroy
        this.layerManager.removeSpriteFromLayer(orbSprite);
        orbSprite.destroy();
      }
    });

    // Create particle effect
    this.createCollectionParticles(orbSprite.x, orbSprite.y);

    console.log('Animated orb collection with particles');
  }

  /**
   * Example: Switch themes dynamically
   */
  switchTheme(newTheme: string): void {
    // Update all sprites to new theme
    this.spriteRenderer.updateAllSpritesTheme(newTheme);
    this.spriteFactory.setDefaultTheme(newTheme);

    console.log(`Switched to theme: ${newTheme}`);
  }

  /**
   * Example: Create visual feedback for invalid moves
   */
  showInvalidMoveFeedback(playerSprite: Phaser.GameObjects.Sprite): void {
    // Shake the player sprite
    this.spriteUtils.shakeSprite(playerSprite, 5, 300);

    // Flash red tint
    this.scene.tweens.add({
      targets: playerSprite,
      tint: 0xFF0000,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        playerSprite.clearTint();
      }
    });

    console.log('Showed invalid move feedback');
  }

  /**
   * Example: Create level completion effects
   */
  showCompletionEffects(): void {
    // Create celebration particles
    this.createCelebrationParticles();

    // Flash all UI elements
    const uiSprites = this.layerManager.getSpritesInLayer('ui-elements');
    uiSprites.forEach(sprite => {
      this.spriteUtils.pulseSprite(sprite, 0.2, 500);
    });

    console.log('Showed level completion effects');
  }

  /**
   * Get layer statistics for debugging
   */
  getLayerStats(): void {
    this.layerManager.showLayerStats();
  }

  /**
   * Clean up all sprite resources
   */
  destroy(): void {
    this.spriteRenderer.destroy();
    this.layerManager.destroy();
    console.log('Sprite rendering system cleaned up');
  }

  // Private helper methods for effects

  private createMovementTrail(sprite: Phaser.GameObjects.Sprite, from: { x: number; y: number }, to: { x: number; y: number }): void {
    // Create simple trail effect (placeholder)
    const trail = this.scene.add.graphics();
    trail.lineStyle(2, 0x4169E1, 0.5);
    trail.lineBetween(from.x, from.y, to.x, to.y);

    // Add to effects layer
    this.layerManager.addSpriteToLayer(trail as any, 'effects-low');

    // Fade out trail
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        trail.destroy();
      }
    });
  }

  private createCollectionParticles(x: number, y: number): void {
    // Create simple particle effect (placeholder)
    for (let i = 0; i < 5; i++) {
      const particle = this.scene.add.circle(x, y, 2, 0xFFD700);
      this.layerManager.addSpriteToLayer(particle as any, 'effects-high');

      this.scene.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-20, 20),
        y: y + Phaser.Math.Between(-20, 20),
        alpha: 0,
        duration: 500,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  private createCelebrationParticles(): void {
    // Create celebration effect (placeholder)
    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    for (let i = 0; i < 20; i++) {
      const particle = this.scene.add.circle(centerX, centerY, 3, 0x7FB069);
      this.layerManager.addSpriteToLayer(particle as any, 'effects-high');

      this.scene.tweens.add({
        targets: particle,
        x: centerX + Phaser.Math.Between(-100, 100),
        y: centerY + Phaser.Math.Between(-100, 100),
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
}

/**
 * Integration helper for existing GameScene
 */
export function integrateWithGameScene(gameScene: any, assetManager?: any): SpriteRenderingExample {
  const spriteSystem = new SpriteRenderingExample(gameScene, assetManager);
  
  // Store reference on scene for easy access
  gameScene.spriteSystem = spriteSystem;
  
  return spriteSystem;
}