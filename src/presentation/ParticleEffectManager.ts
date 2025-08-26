// Particle effect manager for orb collection and visual feedback
import { Position } from '../core/types/GameState';

export interface ParticleEffectConfig {
  type: 'energy' | 'crystal' | 'power' | 'bonus' | 'special';
  particleCount?: number;
  duration?: number;
  spread?: number;
  speed?: number;
  colors?: number[];
  size?: { min: number; max: number };
  gravity?: number;
  fadeOut?: boolean;
}

export interface CollectionEffectConfig extends ParticleEffectConfig {
  burstEffect?: boolean;
  sparkleTrail?: boolean;
  scorePopup?: boolean;
  soundSync?: boolean;
}

export interface AmbientEffectConfig {
  particleCount?: number;
  area?: { width: number; height: number };
  speed?: { min: number; max: number };
  colors?: number[];
  lifetime?: { min: number; max: number };
  continuous?: boolean;
}

export class ParticleEffectManager {
  private scene: Phaser.Scene;
  private particleEmitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();
  private effectConfigs: Map<string, ParticleEffectConfig> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeParticleTextures();
    this.initializeEffectConfigs();
  }

  /**
   * Creates a collection effect when an orb is collected
   */
  createCollectionEffect(position: Position, config: CollectionEffectConfig): string {
    const effectId = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const effectConfig = {
      particleCount: config.particleCount || 15,
      duration: config.duration || 500,
      spread: config.spread || 360,
      speed: config.speed || 100,
      colors: config.colors || this.getOrbColors(config.type),
      size: config.size || { min: 2, max: 6 },
      gravity: config.gravity || 0,
      fadeOut: config.fadeOut !== false,
      ...config
    };

    // Create main burst effect
    if (effectConfig.burstEffect !== false) {
      this.createBurstEffect(position, effectConfig, effectId);
    }

    // Create sparkle trail effect
    if (effectConfig.sparkleTrail) {
      this.createSparkleTrail(position, effectConfig, effectId);
    }

    // Create score popup effect
    if (effectConfig.scorePopup) {
      this.createScorePopup(position, effectConfig);
    }

    return effectId;
  }

  /**
   * Creates a burst particle effect
   */
  createBurstEffect(position: Position, config: ParticleEffectConfig, effectId?: string): string {
    const id = effectId || `burst_${Date.now()}`;
    
    // Create particle emitter for burst effect
    const emitter = this.scene.add.particles(position.x, position.y, 'particle_circle', {
      speed: { min: config.speed! * 0.5, max: config.speed! * 1.5 },
      scale: { start: (config.size!.max / 10), end: (config.size!.min / 10) },
      lifespan: config.duration,
      quantity: config.particleCount,
      tint: config.colors,
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Circle(0, 0, 5),
        quantity: config.particleCount
      }
    });

    // Configure emitter behavior
    emitter.explode(config.particleCount!, position.x, position.y);
    
    // Store emitter reference
    this.particleEmitters.set(id, emitter);
    
    // Auto-cleanup after duration
    this.scene.time.delayedCall(config.duration! + 1000, () => {
      this.stopEffect(id);
    });

    return id;
  }

  /**
   * Creates a sparkle trail effect
   */
  createSparkleTrail(position: Position, config: ParticleEffectConfig, effectId?: string): string {
    const id = effectId ? `${effectId}_sparkle` : `sparkle_${Date.now()}`;
    
    // Create sparkle particles
    const sparkles: Phaser.GameObjects.Graphics[] = [];
    
    for (let i = 0; i < (config.particleCount! / 2); i++) {
      const sparkle = this.scene.add.graphics();
      sparkle.fillStyle(config.colors![i % config.colors!.length], 0.8);
      sparkle.fillStar(0, 0, 4, 2, 4, 0);
      
      // Random position around the collection point
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 20;
      sparkle.x = position.x + Math.cos(angle) * distance;
      sparkle.y = position.y + Math.sin(angle) * distance;
      
      sparkles.push(sparkle);
      
      // Animate sparkle
      this.scene.tweens.add({
        targets: sparkle,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        rotation: Math.PI * 2,
        duration: config.duration! + Math.random() * 200,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          sparkle.destroy();
        }
      });
    }

    return id;
  }

  /**
   * Creates a score popup effect
   */
  createScorePopup(position: Position, config: ParticleEffectConfig): void {
    // Create score text (placeholder - would be customized based on actual score)
    const scoreText = this.scene.add.text(position.x, position.y, '+10', {
      fontSize: '16px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Animate score popup
    this.scene.tweens.add({
      targets: scoreText,
      y: position.y - 30,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        scoreText.destroy();
      }
    });
  }

  /**
   * Creates ambient particle effects for atmosphere
   */
  createAmbientEffect(position: Position, config: AmbientEffectConfig): string {
    const effectId = `ambient_${Date.now()}`;
    
    const ambientConfig = {
      particleCount: config.particleCount || 5,
      area: config.area || { width: 100, height: 100 },
      speed: config.speed || { min: 10, max: 30 },
      colors: config.colors || [0xFFFFFF, 0xF0F8FF, 0xE6E6FA],
      lifetime: config.lifetime || { min: 2000, max: 4000 },
      continuous: config.continuous !== false,
      ...config
    };

    // Create ambient particle emitter
    const emitter = this.scene.add.particles(position.x, position.y, 'particle_circle', {
      speed: ambientConfig.speed,
      scale: { start: 0.1, end: 0.05 },
      lifespan: ambientConfig.lifetime,
      alpha: { start: 0.6, end: 0 },
      tint: ambientConfig.colors,
      blendMode: 'ADD',
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(
          -ambientConfig.area.width / 2,
          -ambientConfig.area.height / 2,
          ambientConfig.area.width,
          ambientConfig.area.height
        )
      },
      frequency: 500,
      quantity: 1
    });

    if (!ambientConfig.continuous) {
      emitter.stop();
    }

    this.particleEmitters.set(effectId, emitter);
    return effectId;
  }

  /**
   * Creates floating particle effect for orb idle state
   */
  createFloatingEffect(position: Position, orbType: string): string {
    const effectId = `floating_${orbType}_${Date.now()}`;
    const colors = this.getOrbColors(orbType as any);
    
    const emitter = this.scene.add.particles(position.x, position.y, 'particle_circle', {
      speed: { min: 5, max: 15 },
      scale: { start: 0.05, end: 0.02 },
      lifespan: { min: 1000, max: 2000 },
      alpha: { start: 0.4, end: 0 },
      tint: colors,
      blendMode: 'ADD',
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Circle(0, 0, 8),
        quantity: 1
      },
      frequency: 300,
      quantity: 1
    });

    this.particleEmitters.set(effectId, emitter);
    return effectId;
  }

  /**
   * Updates particle effect position (for moving orbs)
   */
  updateEffectPosition(effectId: string, newPosition: Position): void {
    const emitter = this.particleEmitters.get(effectId);
    if (emitter) {
      emitter.setPosition(newPosition.x, newPosition.y);
    }
  }

  /**
   * Stops and removes a particle effect
   */
  stopEffect(effectId: string): void {
    const emitter = this.particleEmitters.get(effectId);
    if (emitter) {
      emitter.stop();
      
      // Destroy after particles fade out
      this.scene.time.delayedCall(2000, () => {
        emitter.destroy();
        this.particleEmitters.delete(effectId);
      });
    }
  }

  /**
   * Pauses all particle effects
   */
  pauseAllEffects(): void {
    this.particleEmitters.forEach(emitter => {
      emitter.pause();
    });
  }

  /**
   * Resumes all particle effects
   */
  resumeAllEffects(): void {
    this.particleEmitters.forEach(emitter => {
      emitter.resume();
    });
  }

  /**
   * Stops all particle effects
   */
  stopAllEffects(): void {
    this.particleEmitters.forEach((emitter, effectId) => {
      this.stopEffect(effectId);
    });
  }

  /**
   * Cleans up all resources
   */
  destroy(): void {
    this.stopAllEffects();
    this.particleEmitters.clear();
    this.effectConfigs.clear();
  }

  // Private helper methods

  private initializeParticleTextures(): void {
    // Create basic particle textures if they don't exist
    if (!this.scene.textures.exists('particle_circle')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xFFFFFF);
      graphics.fillCircle(4, 4, 4);
      graphics.generateTexture('particle_circle', 8, 8);
      graphics.destroy();
    }

    if (!this.scene.textures.exists('particle_star')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xFFFFFF);
      graphics.fillStar(4, 4, 4, 2, 4, 0);
      graphics.generateTexture('particle_star', 8, 8);
      graphics.destroy();
    }
  }

  private initializeEffectConfigs(): void {
    // Initialize default configurations for different orb types
    this.effectConfigs.set('energy', {
      type: 'energy',
      particleCount: 12,
      duration: 400,
      spread: 360,
      speed: 80,
      colors: [0x00FFFF, 0x0080FF, 0x40E0D0],
      size: { min: 2, max: 5 }
    });

    this.effectConfigs.set('crystal', {
      type: 'crystal',
      particleCount: 15,
      duration: 600,
      spread: 360,
      speed: 60,
      colors: [0xFF00FF, 0xFF80FF, 0xFFB6C1],
      size: { min: 3, max: 7 }
    });

    this.effectConfigs.set('power', {
      type: 'power',
      particleCount: 20,
      duration: 700,
      spread: 360,
      speed: 120,
      colors: [0xFFFF00, 0xFFD700, 0xFFA500],
      size: { min: 3, max: 8 }
    });

    this.effectConfigs.set('bonus', {
      type: 'bonus',
      particleCount: 18,
      duration: 500,
      spread: 360,
      speed: 90,
      colors: [0x00FF00, 0x32CD32, 0x90EE90],
      size: { min: 2, max: 6 }
    });

    this.effectConfigs.set('special', {
      type: 'special',
      particleCount: 25,
      duration: 800,
      spread: 360,
      speed: 150,
      colors: [0xFF0080, 0xFF69B4, 0xFFB6C1, 0xDDA0DD],
      size: { min: 4, max: 10 }
    });
  }

  private getOrbColors(orbType: string): number[] {
    const config = this.effectConfigs.get(orbType);
    return config?.colors || [0xFFFFFF];
  }
}