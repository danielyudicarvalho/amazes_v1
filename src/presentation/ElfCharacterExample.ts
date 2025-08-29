// Example implementation showing how to use the elf character in a game scene
import { ElfCharacterIntegration } from './ElfCharacterIntegration';
import { IGameCore } from '../core/GameCore';

export class ElfCharacterExample extends Phaser.Scene {
  private gameCore!: IGameCore;
  private elfIntegration!: ElfCharacterIntegration;
  private playerSpriteSystem: any = null;

  constructor() {
    super({ key: 'ElfCharacterExample' });
  }

  /**
   * Initialize the scene with elf character
   */
  async create(data: { gameCore: IGameCore }) {
    this.gameCore = data.gameCore;

    // Set up basic scene
    this.setupScene();

    // Integrate elf character
    await this.integrateElfCharacter();

    // Set up controls
    this.setupControls();

    // Start the game
    this.startGame();
  }

  /**
   * Set up basic scene elements
   */
  private setupScene(): void {
    // Add background
    this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x2F4F2F
    );

    // Add title
    this.add.text(this.scale.width / 2, 50, 'Elf Character Demo', {
      fontSize: '32px',
      color: '#FFD700',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Add instructions
    this.add.text(this.scale.width / 2, this.scale.height - 50, 
      'Use ARROW KEYS or WASD to move the elf character', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  /**
   * Integrate the elf character into the scene
   */
  private async integrateElfCharacter(): Promise<void> {
    try {
      console.log('Integrating elf character...');

      // Create integration instance
      this.elfIntegration = new ElfCharacterIntegration({
        scene: this,
        gameCore: this.gameCore,
        enableFallback: true
      });

      // Perform integration
      const result = await this.elfIntegration.integrate();

      if (result.success) {
        this.playerSpriteSystem = result.playerSpriteSystem;
        console.log('✅ Elf character integrated successfully');

        // Show success message
        this.showStatusMessage('Elf Character Loaded!', 0x00FF00);

        // Test animations
        await this.testElfAnimations();
      } else {
        console.error('❌ Elf character integration failed:', result.errors);
        this.showStatusMessage('Using Fallback Character', 0xFFAA00);
      }

    } catch (error) {
      console.error('Integration error:', error);
      this.showStatusMessage('Character Loading Error', 0xFF0000);
    }
  }

  /**
   * Test elf character animations
   */
  private async testElfAnimations(): Promise<void> {
    if (!this.elfIntegration) return;

    const testResult = await this.elfIntegration.testAnimations();
    
    if (testResult.success) {
      console.log('✅ All elf animations working');
      testResult.results.forEach(result => console.log(result));
    } else {
      console.warn('⚠️ Some elf animations missing');
      testResult.results.forEach(result => console.log(result));
    }
  }

  /**
   * Set up keyboard controls
   */
  private setupControls(): void {
    // Create cursor keys
    const cursors = this.input.keyboard!.createCursorKeys();
    
    // Create WASD keys
    const wasd = this.input.keyboard!.addKeys('W,S,A,D');

    // Handle key presses
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyPress(event.code);
    });

    // Store references for cleanup
    (this as any).cursors = cursors;
    (this as any).wasd = wasd;
  }

  /**
   * Handle keyboard input for character movement
   */
  private handleKeyPress(keyCode: string): void {
    if (!this.gameCore || !this.playerSpriteSystem) return;

    let direction: 'up' | 'down' | 'left' | 'right' | null = null;

    // Map keys to directions
    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        direction = 'up';
        break;
      case 'ArrowDown':
      case 'KeyS':
        direction = 'down';
        break;
      case 'ArrowLeft':
      case 'KeyA':
        direction = 'left';
        break;
      case 'ArrowRight':
      case 'KeyD':
        direction = 'right';
        break;
    }

    if (direction) {
      this.movePlayer(direction);
    }
  }

  /**
   * Move the player character
   */
  private movePlayer(direction: 'up' | 'down' | 'left' | 'right'): void {
    try {
      // Attempt to move through game core
      const result = this.gameCore.movePlayer(direction);
      
      if (result.success) {
        console.log(`Player moved ${direction} to (${result.newPosition.x}, ${result.newPosition.y})`);
      } else {
        console.log(`Move blocked: ${result.reason}`);
        this.showStatusMessage('Move Blocked', 0xFF6600, 1000);
      }
    } catch (error) {
      console.error('Move error:', error);
      
      // Fallback: animate sprite directly for demo purposes
      this.animatePlayerDirect(direction);
    }
  }

  /**
   * Direct sprite animation for demo purposes (when game core isn't fully initialized)
   */
  private animatePlayerDirect(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (!this.playerSpriteSystem) return;

    const animationController = this.playerSpriteSystem.getAnimationController();
    if (!animationController) return;

    // Get current position
    const currentPos = animationController.getAnimationState().position;
    
    // Calculate new position (for demo)
    const newPos = { ...currentPos };
    const moveDistance = 1;

    switch (direction) {
      case 'up':
        newPos.y = Math.max(0, newPos.y - moveDistance);
        break;
      case 'down':
        newPos.y = Math.min(9, newPos.y + moveDistance);
        break;
      case 'left':
        newPos.x = Math.max(0, newPos.x - moveDistance);
        break;
      case 'right':
        newPos.x = Math.min(9, newPos.x + moveDistance);
        break;
    }

    // Animate movement
    this.playerSpriteSystem.movePlayer(direction, currentPos, newPos);
  }

  /**
   * Start the game
   */
  private startGame(): void {
    try {
      // Initialize game if not already done
      if (this.gameCore.getGameState) {
        const gameState = this.gameCore.getGameState();
        console.log('Game already initialized');
      }
    } catch (error) {
      console.log('Game not initialized, starting demo mode');
      this.showStatusMessage('Demo Mode - Use Arrow Keys', 0x00AAFF, 3000);
    }
  }

  /**
   * Show a status message to the user
   */
  private showStatusMessage(message: string, color: number, duration: number = 2000): void {
    const statusText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 50,
      message,
      {
        fontSize: '24px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        fontFamily: 'Arial',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5);

    // Fade out after duration
    this.tweens.add({
      targets: statusText,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        statusText.destroy();
      }
    });
  }

  /**
   * Get integration status for debugging
   */
  public getIntegrationStatus(): any {
    if (!this.elfIntegration) {
      return { error: 'Integration not initialized' };
    }

    return {
      status: this.elfIntegration.getStatus(),
      elfLoader: this.elfIntegration.getElfLoader(),
      playerSpriteSystem: this.elfIntegration.getPlayerSpriteSystem()
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.elfIntegration) {
      this.elfIntegration.cleanup();
    }

    super.destroy();
  }
}

// Export convenience function to create and run the example
export function createElfCharacterDemo(game: Phaser.Game, gameCore: IGameCore): void {
  // Add the scene to the game
  game.scene.add('ElfCharacterExample', ElfCharacterExample);
  
  // Start the scene
  game.scene.start('ElfCharacterExample', { gameCore });
}

// Example usage in a Phaser game configuration
export const ElfCharacterDemoConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2F4F2F',
  scene: ElfCharacterExample,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  }
};