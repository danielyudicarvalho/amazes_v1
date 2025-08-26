// Orb sprite system for managing animated orb sprites with floating effects and collection animations
import { Position, OrbState } from '../core/types/GameState';
import { SpriteFactory, GameObjectSpriteConfig } from './SpriteFactory';
import { OrbAnimationController } from './OrbAnimationController';
import { ParticleEffectManager } from './ParticleEffectManager';

export interface OrbSpriteConfig {
  type: 'energy' | 'crystal' | 'power' | 'bonus' | 'special';
  variant?: string;
  theme?: string;
  floatingSpeed?: number;
  floatingRange?: number;
  glowEffect?: boolean;
  pulseEffect?: boolean;
}

export interface OrbCollectionConfig {
  animationDuration?: number;
  particleCount?: number;
  scaleEffect?: boolean;
  fadeEffect?: boolean;
  soundSync?: boolean;
}

export class OrbSpriteSystem {
  private scene: Phaser.Scene;
  private spriteFactory: SpriteFactory;
  private animationController: OrbAnimationController;
  private particleManager: ParticleEffectManager;
  private orbSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private orbConfigs: Map<string, OrbSpriteConfig> = new Map();
  private defaultTheme: string = 'default';

  constructor(
    scene: Phaser.Scene,
    spriteFactory: SpriteFactory,
    animationController: OrbAnimationController,
    particleManager: ParticleEffectManager
  ) {
    this.scene = scene;
    this.spriteFactory = spriteFactory;
    this.animationController = animationController;
    this.particleManager = particleManager;
    
    this.initializeOrbTypes();
  }

  /**
   * Creates an animated orb sprite with floating effects
   */
  createOrbSprite(orbState: OrbState, config?: OrbSpriteConfig): Phaser.GameObjects.Sprite {
    const orbConfig = config || this.getDefaultOrbConfig(orbState.id, orbState);
    
    // Create the base sprite using SpriteFactory
    const gameObjectConfig: Partial<GameObjectSpriteConfig> = {
      type: 'orb',
      variant: orbConfig.type,
      theme: orbConfig.theme || this.defaultTheme,
      animations: this.getOrbAnimations(orbConfig.type)
    };
    
    const sprite = this.spriteFactory.createOrb(orbState.position, orbState.id, gameObjectConfig);
    
    // Store orb-specific data
    sprite.setData('orbState', orbState);
    sprite.setData('orbConfig', orbConfig);
    sprite.setData('orbType', orbConfig.type);
    sprite.setData('originalPosition', { ...orbState.position });
    
    // Apply visual effects based on configuration
    this.applyVisualEffects(sprite, orbConfig);
    
    // Start floating animation
    this.animationController.startFloatingAnimation(sprite, {
      speed: orbConfig.floatingSpeed || 1000,
      range: orbConfig.floatingRange || 3,
      randomOffset: true
    });
    
    // Add glow effect if enabled
    if (orbConfig.glowEffect) {
      this.animationController.addGlowEffect(sprite);
    }
    
    // Add pulse effect if enabled
    if (orbConfig.pulseEffect) {
      this.animationController.addPulseEffect(sprite);
    }
    
    // Store sprite reference
    this.orbSprites.set(orbState.id, sprite);
    this.orbConfigs.set(orbState.id, orbConfig);
    
    return sprite;
  }

  /**
   * Creates multiple orb sprites from game state
   */
  createOrbSprites(orbStates: OrbState[], theme?: string): Phaser.GameObjects.Sprite[] {
    const sprites: Phaser.GameObjects.Sprite[] = [];
    
    orbStates.forEach((orbState, index) => {
      if (!orbState.collected) {
        const orbType = this.determineOrbType(orbState, index);
        const config: OrbSpriteConfig = {
          type: orbType,
          theme: theme || this.defaultTheme,
          floatingSpeed: 800 + Math.random() * 400, // Vary floating speed
          floatingRange: 2 + Math.random() * 2, // Vary floating range
          glowEffect: orbType === 'special' || orbType === 'power',
          pulseEffect: orbType === 'bonus' || orbType === 'special'
        };
        
        const sprite = this.createOrbSprite(orbState, config);
        sprites.push(sprite);
      }
    });
    
    return sprites;
  }

  /**
   * Animates orb collection with particles and effects
   */
  async animateOrbCollection(orbId: string, config?: OrbCollectionConfig): Promise<void> {
    const sprite = this.orbSprites.get(orbId);
    if (!sprite) {
      console.warn(`Orb sprite not found for ID: ${orbId}`);
      return;
    }
    
    const orbConfig = this.orbConfigs.get(orbId);
    const collectionConfig = config || this.getDefaultCollectionConfig(orbConfig?.type);
    
    // Stop existing animations
    this.animationController.stopFloatingAnimation(sprite);
    
    // Create collection particle effect
    const position = { x: sprite.x, y: sprite.y };
    this.particleManager.createCollectionEffect(position, {
      type: orbConfig?.type || 'energy',
      particleCount: collectionConfig.particleCount || 15,
      duration: collectionConfig.animationDuration || 500
    });
    
    // Animate the orb collection
    await this.animationController.animateCollection(sprite, {
      duration: collectionConfig.animationDuration || 500,
      scaleEffect: collectionConfig.scaleEffect !== false,
      fadeEffect: collectionConfig.fadeEffect !== false,
      rotation: true,
      bounce: true
    });
    
    // Clean up
    this.removeOrbSprite(orbId);
  }

  /**
   * Updates orb sprite theme
   */
  updateOrbTheme(orbId: string, newTheme: string): void {
    const sprite = this.orbSprites.get(orbId);
    if (!sprite) return;
    
    const orbConfig = this.orbConfigs.get(orbId);
    if (orbConfig) {
      orbConfig.theme = newTheme;
      this.orbConfigs.set(orbId, orbConfig);
      
      // Update sprite appearance
      this.applyVisualEffects(sprite, orbConfig);
    }
  }

  /**
   * Gets orb sprite by ID
   */
  getOrbSprite(orbId: string): Phaser.GameObjects.Sprite | null {
    return this.orbSprites.get(orbId) || null;
  }

  /**
   * Gets all orb sprites
   */
  getAllOrbSprites(): Phaser.GameObjects.Sprite[] {
    return Array.from(this.orbSprites.values());
  }

  /**
   * Removes orb sprite and cleans up resources
   */
  removeOrbSprite(orbId: string): void {
    const sprite = this.orbSprites.get(orbId);
    if (sprite) {
      this.animationController.stopAllAnimations(sprite);
      sprite.destroy();
      this.orbSprites.delete(orbId);
      this.orbConfigs.delete(orbId);
    }
  }

  /**
   * Clears all orb sprites
   */
  clearAllOrbs(): void {
    this.orbSprites.forEach((sprite, orbId) => {
      this.removeOrbSprite(orbId);
    });
  }

  /**
   * Sets the default theme for new orbs
   */
  setDefaultTheme(theme: string): void {
    this.defaultTheme = theme;
  }

  /**
   * Pauses all orb animations
   */
  pauseAnimations(): void {
    this.orbSprites.forEach(sprite => {
      this.animationController.pauseAnimations(sprite);
    });
  }

  /**
   * Resumes all orb animations
   */
  resumeAnimations(): void {
    this.orbSprites.forEach(sprite => {
      this.animationController.resumeAnimations(sprite);
    });
  }

  // Private helper methods

  private initializeOrbTypes(): void {
    // Initialize default configurations for different orb types
    // This will be expanded when asset management is implemented
  }

  private getDefaultOrbConfig(orbId: string, orbState?: OrbState): OrbSpriteConfig {
    // Determine orb type based on orb state if available
    let type: OrbSpriteConfig['type'] = 'energy';
    
    if (orbState) {
      type = this.determineOrbType(orbState, 0);
    } else {
      // Fallback to ID-based determination
      const orbIndex = parseInt(orbId.split('_')[1]) || 0;
      const types: OrbSpriteConfig['type'][] = ['energy', 'crystal', 'power', 'bonus', 'special'];
      type = types[orbIndex % types.length];
    }
    
    return {
      type,
      theme: this.defaultTheme,
      floatingSpeed: 1000,
      floatingRange: 3,
      glowEffect: type === 'special' || type === 'power',
      pulseEffect: type === 'bonus' || type === 'special'
    };
  }

  private getDefaultCollectionConfig(orbType?: string): OrbCollectionConfig {
    const baseConfig: OrbCollectionConfig = {
      animationDuration: 500,
      particleCount: 15,
      scaleEffect: true,
      fadeEffect: true,
      soundSync: true
    };
    
    // Customize based on orb type
    switch (orbType) {
      case 'special':
        return {
          ...baseConfig,
          animationDuration: 800,
          particleCount: 25
        };
      case 'power':
        return {
          ...baseConfig,
          animationDuration: 600,
          particleCount: 20
        };
      default:
        return baseConfig;
    }
  }

  private determineOrbType(orbState: OrbState, index: number): OrbSpriteConfig['type'] {
    // Determine orb type based on value, position, or index
    if (orbState.value && orbState.value >= 50) {
      return 'special';
    } else if (orbState.value && orbState.value >= 30) {
      return 'power';
    } else if (orbState.value && orbState.value >= 20) {
      return 'bonus';
    } else if (index % 3 === 0) {
      return 'crystal';
    } else {
      return 'energy';
    }
  }

  private getOrbAnimations(orbType: string): string[] {
    // Return animation keys based on orb type
    switch (orbType) {
      case 'energy':
        return ['orb_energy_idle', 'orb_energy_pulse'];
      case 'crystal':
        return ['orb_crystal_idle', 'orb_crystal_sparkle'];
      case 'power':
        return ['orb_power_idle', 'orb_power_glow'];
      case 'bonus':
        return ['orb_bonus_idle', 'orb_bonus_bounce'];
      case 'special':
        return ['orb_special_idle', 'orb_special_rainbow'];
      default:
        return ['orb_default_idle'];
    }
  }

  private applyVisualEffects(sprite: Phaser.GameObjects.Sprite, config: OrbSpriteConfig): void {
    // Apply visual effects based on orb type and configuration
    const orbType = config.type;
    
    // Set tint based on orb type
    const tints = {
      energy: 0x00FFFF,    // Cyan
      crystal: 0xFF00FF,   // Magenta
      power: 0xFFFF00,     // Yellow
      bonus: 0x00FF00,     // Green
      special: 0xFF0080    // Pink
    };
    
    sprite.setTint(tints[orbType] || 0xFFFFFF);
    
    // Apply scale based on orb type
    const scales = {
      energy: 0.8,
      crystal: 0.9,
      power: 1.0,
      bonus: 0.85,
      special: 1.1
    };
    
    sprite.setScale(scales[orbType] || 0.8);
  }
}