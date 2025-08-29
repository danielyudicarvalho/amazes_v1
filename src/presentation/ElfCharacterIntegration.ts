// Integration helper for the elf character system
import { ElfCharacterLoader } from './ElfCharacterLoader';
import { PlayerAnimationRegistry } from './PlayerAnimationRegistry';
import { PlayerSpriteSystem } from './PlayerSpriteSystem';
import { IGameCore } from '../core/GameCore';

export interface ElfIntegrationConfig {
  scene: Phaser.Scene;
  gameCore: IGameCore;
  enableFallback?: boolean;
}

export interface ElfIntegrationResult {
  success: boolean;
  elfLoader: ElfCharacterLoader | null;
  playerSpriteSystem: PlayerSpriteSystem | null;
  errors: string[];
  warnings: string[];
}

export class ElfCharacterIntegration {
  private scene: Phaser.Scene;
  private gameCore: IGameCore;
  private enableFallback: boolean;
  private elfLoader: ElfCharacterLoader | null = null;
  private playerSpriteSystem: PlayerSpriteSystem | null = null;

  constructor(config: ElfIntegrationConfig) {
    this.scene = config.scene;
    this.gameCore = config.gameCore;
    this.enableFallback = config.enableFallback ?? true;
  }

  /**
   * Integrates the elf character into the game
   */
  async integrate(): Promise<ElfIntegrationResult> {
    const result: ElfIntegrationResult = {
      success: false,
      elfLoader: null,
      playerSpriteSystem: null,
      errors: [],
      warnings: []
    };

    try {
      console.log('Starting elf character integration...');

      // Step 1: Initialize elf character loader
      result.elfLoader = await this.initializeElfLoader(result);
      
      // Step 2: Create player sprite system with elf character support
      result.playerSpriteSystem = this.createPlayerSpriteSystem(result);
      
      // Step 3: Validate integration
      const validation = await this.validateIntegration(result);
      
      if (validation.isValid) {
        result.success = true;
        console.log('Elf character integration completed successfully');
      } else {
        result.errors.push(...validation.errors);
        result.warnings.push(...validation.warnings);
        
        if (this.enableFallback) {
          console.warn('Elf character integration failed, using fallback system');
          result.success = true; // Still successful with fallback
        }
      }

    } catch (error) {
      result.errors.push(`Integration failed: ${error.message}`);
      console.error('Elf character integration error:', error);
      
      if (this.enableFallback) {
        result.success = true; // Fallback should still work
        result.warnings.push('Using fallback character system due to integration error');
      }
    }

    return result;
  }

  /**
   * Initializes the elf character loader
   */
  private async initializeElfLoader(result: ElfIntegrationResult): Promise<ElfCharacterLoader | null> {
    try {
      const elfLoader = new ElfCharacterLoader(this.scene);
      
      // Load configuration
      await elfLoader.loadConfig();
      
      // Load assets
      const loadResult = await elfLoader.loadAssets();
      
      if (!loadResult.success) {
        result.errors.push(...loadResult.errors);
        return null;
      }
      
      // Validate assets
      const validation = elfLoader.validateAssets();
      if (!validation.isValid) {
        result.errors.push(...validation.errors);
        result.warnings.push(...validation.missing.map(asset => `Missing asset: ${asset}`));
        return null;
      }
      
      this.elfLoader = elfLoader;
      console.log('Elf character loader initialized successfully');
      return elfLoader;
      
    } catch (error) {
      result.errors.push(`Failed to initialize elf loader: ${error.message}`);
      return null;
    }
  }

  /**
   * Creates the player sprite system
   */
  private createPlayerSpriteSystem(result: ElfIntegrationResult): PlayerSpriteSystem | null {
    try {
      const playerSpriteSystem = new PlayerSpriteSystem({
        scene: this.scene,
        gameCore: this.gameCore
      });
      
      this.playerSpriteSystem = playerSpriteSystem;
      console.log('Player sprite system created successfully');
      return playerSpriteSystem;
      
    } catch (error) {
      result.errors.push(`Failed to create player sprite system: ${error.message}`);
      return null;
    }
  }

  /**
   * Validates the integration
   */
  private async validateIntegration(result: ElfIntegrationResult): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Validate elf loader
    if (result.elfLoader) {
      const elfValidation = result.elfLoader.validateAssets();
      if (!elfValidation.isValid) {
        validation.isValid = false;
        validation.errors.push(...elfValidation.errors);
        validation.warnings.push(...elfValidation.missing.map(asset => `Missing elf asset: ${asset}`));
      }
    } else if (!this.enableFallback) {
      validation.isValid = false;
      validation.errors.push('Elf character loader not initialized and fallback disabled');
    }

    // Validate player sprite system
    if (result.playerSpriteSystem) {
      const systemValidation = result.playerSpriteSystem.validateSystem();
      if (!systemValidation.isValid) {
        validation.errors.push(...systemValidation.errors);
      }
      validation.warnings.push(...systemValidation.warnings);
    } else {
      validation.isValid = false;
      validation.errors.push('Player sprite system not created');
    }

    // Validate game core connection
    try {
      this.gameCore.getGameState();
    } catch (error) {
      validation.warnings.push('Game core not initialized - player sprite will initialize when game starts');
    }

    return validation;
  }

  /**
   * Gets the current integration status
   */
  getStatus(): {
    isIntegrated: boolean;
    hasElfCharacter: boolean;
    hasPlayerSpriteSystem: boolean;
    elfAssetsLoaded: boolean;
  } {
    return {
      isIntegrated: this.elfLoader !== null && this.playerSpriteSystem !== null,
      hasElfCharacter: this.elfLoader !== null,
      hasPlayerSpriteSystem: this.playerSpriteSystem !== null,
      elfAssetsLoaded: this.elfLoader ? this.elfLoader.areAssetsLoaded() : false
    };
  }

  /**
   * Gets the elf character loader
   */
  getElfLoader(): ElfCharacterLoader | null {
    return this.elfLoader;
  }

  /**
   * Gets the player sprite system
   */
  getPlayerSpriteSystem(): PlayerSpriteSystem | null {
    return this.playerSpriteSystem;
  }

  /**
   * Cleans up the integration
   */
  cleanup(): void {
    if (this.elfLoader) {
      this.elfLoader.cleanup();
      this.elfLoader = null;
    }
    
    if (this.playerSpriteSystem) {
      this.playerSpriteSystem.destroy();
      this.playerSpriteSystem = null;
    }
    
    console.log('Elf character integration cleaned up');
  }

  /**
   * Forces fallback to basic character system
   */
  useFallback(): void {
    if (this.elfLoader) {
      this.elfLoader.cleanup();
      this.elfLoader = null;
    }
    
    console.log('Switched to fallback character system');
  }

  /**
   * Tests the elf character animations
   */
  async testAnimations(): Promise<{ success: boolean; results: string[] }> {
    const results: string[] = [];
    let success = true;

    if (!this.elfLoader) {
      return { success: false, results: ['Elf loader not available'] };
    }

    const directions = ['up', 'down', 'left', 'right'] as const;
    
    // Test idle animations
    for (const direction of directions) {
      const idleKey = this.elfLoader.getAnimationKey(direction, 'idle');
      if (this.scene.anims.exists(idleKey)) {
        results.push(`✓ Idle animation ${direction}: ${idleKey}`);
      } else {
        results.push(`✗ Missing idle animation ${direction}: ${idleKey}`);
        success = false;
      }
    }
    
    // Test walking animations
    for (const direction of directions) {
      const walkKey = this.elfLoader.getAnimationKey(direction, 'walking');
      if (this.scene.anims.exists(walkKey)) {
        results.push(`✓ Walking animation ${direction}: ${walkKey}`);
      } else {
        results.push(`✗ Missing walking animation ${direction}: ${walkKey}`);
        success = false;
      }
    }

    return { success, results };
  }
}

/**
 * Convenience function to integrate elf character into a scene
 */
export async function integrateElfCharacter(
  scene: Phaser.Scene, 
  gameCore: IGameCore,
  enableFallback: boolean = true
): Promise<ElfIntegrationResult> {
  const integration = new ElfCharacterIntegration({
    scene,
    gameCore,
    enableFallback
  });
  
  return await integration.integrate();
}