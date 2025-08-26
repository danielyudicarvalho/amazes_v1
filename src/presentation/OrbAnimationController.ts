// Animation controller specifically for orb sprites with floating, collection, and effect animations
import { Position } from '../core/types/GameState';

export interface FloatingAnimationConfig {
  speed?: number;
  range?: number;
  randomOffset?: boolean;
  easing?: string;
}

export interface CollectionAnimationConfig {
  duration?: number;
  scaleEffect?: boolean;
  fadeEffect?: boolean;
  rotation?: boolean;
  bounce?: boolean;
  targetPosition?: Position;
}

export interface GlowEffectConfig {
  intensity?: number;
  speed?: number;
  color?: number;
}

export interface PulseEffectConfig {
  scale?: number;
  speed?: number;
  intensity?: number;
}

export class OrbAnimationController {
  private scene: Phaser.Scene;
  private activeAnimations: Map<string, Phaser.Tweens.Tween[]> = new Map();
  private floatingAnimations: Map<string, Phaser.Tweens.Tween> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Starts floating animation for an orb sprite
   */
  startFloatingAnimation(sprite: Phaser.GameObjects.Sprite, config?: FloatingAnimationConfig): void {
    const orbId = sprite.getData('orbId') || sprite.name;
    
    // Stop existing floating animation
    this.stopFloatingAnimation(sprite);
    
    const animConfig = {
      speed: config?.speed || 1000,
      range: config?.range || 3,
      randomOffset: config?.randomOffset || false,
      easing: config?.easing || 'Sine.easeInOut'
    };
    
    // Store original position
    const originalY = sprite.y;
    sprite.setData('originalY', originalY);
    
    // Add random offset if enabled
    const offset = animConfig.randomOffset ? (Math.random() - 0.5) * animConfig.range : 0;
    
    // Create floating tween
    const floatingTween = this.scene.tweens.add({
      targets: sprite,
      y: originalY - animConfig.range + offset,
      duration: animConfig.speed + (Math.random() * 200 - 100), // Slight variation
      yoyo: true,
      repeat: -1,
      ease: animConfig.easing,
      onUpdate: () => {
        // Add subtle rotation during floating
        sprite.rotation += 0.001;
      }
    });
    
    this.floatingAnimations.set(orbId, floatingTween);
    this.addToActiveAnimations(orbId, [floatingTween]);
  }

  /**
   * Stops floating animation for an orb sprite
   */
  stopFloatingAnimation(sprite: Phaser.GameObjects.Sprite): void {
    const orbId = sprite.getData('orbId') || sprite.name;
    const floatingTween = this.floatingAnimations.get(orbId);
    
    if (floatingTween) {
      floatingTween.stop();
      this.floatingAnimations.delete(orbId);
      this.removeFromActiveAnimations(orbId, [floatingTween]);
    }
  }

  /**
   * Animates orb collection with various effects
   */
  async animateCollection(sprite: Phaser.GameObjects.Sprite, config?: CollectionAnimationConfig): Promise<void> {
    const orbId = sprite.getData('orbId') || sprite.name;
    const animConfig = {
      duration: config?.duration || 500,
      scaleEffect: config?.scaleEffect !== false,
      fadeEffect: config?.fadeEffect !== false,
      rotation: config?.rotation !== false,
      bounce: config?.bounce !== false,
      targetPosition: config?.targetPosition
    };
    
    // Stop all existing animations
    this.stopAllAnimations(sprite);
    
    const collectionTweens: Phaser.Tweens.Tween[] = [];
    
    // Scale effect - grow then shrink
    if (animConfig.scaleEffect) {
      const scaleTween = this.scene.tweens.add({
        targets: sprite,
        scaleX: sprite.scaleX * 1.5,
        scaleY: sprite.scaleY * 1.5,
        duration: animConfig.duration * 0.3,
        ease: 'Back.easeOut',
        yoyo: true,
        onYoyo: () => {
          // Shrink to zero on yoyo
          this.scene.tweens.add({
            targets: sprite,
            scaleX: 0,
            scaleY: 0,
            duration: animConfig.duration * 0.4,
            ease: 'Back.easeIn'
          });
        }
      });
      collectionTweens.push(scaleTween);
    }
    
    // Fade effect
    if (animConfig.fadeEffect) {
      const fadeTween = this.scene.tweens.add({
        targets: sprite,
        alpha: 0,
        duration: animConfig.duration,
        ease: 'Cubic.easeOut'
      });
      collectionTweens.push(fadeTween);
    }
    
    // Rotation effect
    if (animConfig.rotation) {
      const rotationTween = this.scene.tweens.add({
        targets: sprite,
        rotation: sprite.rotation + Math.PI * 2,
        duration: animConfig.duration,
        ease: 'Cubic.easeOut'
      });
      collectionTweens.push(rotationTween);
    }
    
    // Bounce effect
    if (animConfig.bounce) {
      const bounceTween = this.scene.tweens.add({
        targets: sprite,
        y: sprite.y - 20,
        duration: animConfig.duration * 0.4,
        ease: 'Quad.easeOut',
        yoyo: true
      });
      collectionTweens.push(bounceTween);
    }
    
    // Movement to target position
    if (animConfig.targetPosition) {
      const moveTween = this.scene.tweens.add({
        targets: sprite,
        x: animConfig.targetPosition.x,
        y: animConfig.targetPosition.y,
        duration: animConfig.duration * 0.8,
        ease: 'Cubic.easeInOut'
      });
      collectionTweens.push(moveTween);
    }
    
    this.addToActiveAnimations(orbId, collectionTweens);
    
    // Return promise that resolves when animation completes
    return new Promise((resolve) => {
      // Use the longest animation duration
      const longestDuration = Math.max(...collectionTweens.map(t => t.duration));
      
      this.scene.time.delayedCall(longestDuration, () => {
        this.removeFromActiveAnimations(orbId, collectionTweens);
        resolve();
      });
    });
  }

  /**
   * Adds glow effect to orb sprite
   */
  addGlowEffect(sprite: Phaser.GameObjects.Sprite, config?: GlowEffectConfig): void {
    const orbId = sprite.getData('orbId') || sprite.name;
    const glowConfig = {
      intensity: config?.intensity || 0.3,
      speed: config?.speed || 1500,
      color: config?.color || 0xFFFFFF
    };
    
    // Create glow effect using tint animation
    const glowTween = this.scene.tweens.add({
      targets: sprite,
      alpha: 1 - glowConfig.intensity,
      duration: glowConfig.speed,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.addToActiveAnimations(orbId, [glowTween]);
  }

  /**
   * Adds pulse effect to orb sprite
   */
  addPulseEffect(sprite: Phaser.GameObjects.Sprite, config?: PulseEffectConfig): void {
    const orbId = sprite.getData('orbId') || sprite.name;
    const pulseConfig = {
      scale: config?.scale || 0.1,
      speed: config?.speed || 800,
      intensity: config?.intensity || 1
    };
    
    const originalScale = sprite.scaleX;
    
    // Create pulse effect using scale animation
    const pulseTween = this.scene.tweens.add({
      targets: sprite,
      scaleX: originalScale + pulseConfig.scale,
      scaleY: originalScale + pulseConfig.scale,
      duration: pulseConfig.speed,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.addToActiveAnimations(orbId, [pulseTween]);
  }

  /**
   * Creates a sparkle effect around the orb
   */
  createSparkleEffect(sprite: Phaser.GameObjects.Sprite, duration: number = 2000): void {
    const orbId = sprite.getData('orbId') || sprite.name;
    const sparkles: Phaser.GameObjects.Graphics[] = [];
    
    // Create multiple sparkle particles
    for (let i = 0; i < 8; i++) {
      const sparkle = this.scene.add.graphics();
      sparkle.fillStyle(0xFFFFFF, 0.8);
      sparkle.fillCircle(0, 0, 2);
      
      // Position around the orb
      const angle = (i / 8) * Math.PI * 2;
      const radius = 15 + Math.random() * 10;
      sparkle.x = sprite.x + Math.cos(angle) * radius;
      sparkle.y = sprite.y + Math.sin(angle) * radius;
      
      sparkles.push(sparkle);
      
      // Animate sparkle
      const sparkleTween = this.scene.tweens.add({
        targets: sparkle,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: duration,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          sparkle.destroy();
        }
      });
      
      this.addToActiveAnimations(orbId, [sparkleTween]);
    }
  }

  /**
   * Pauses all animations for a sprite
   */
  pauseAnimations(sprite: Phaser.GameObjects.Sprite): void {
    const orbId = sprite.getData('orbId') || sprite.name;
    const animations = this.activeAnimations.get(orbId);
    
    if (animations) {
      animations.forEach(tween => {
        if (tween.isPlaying()) {
          tween.pause();
        }
      });
    }
  }

  /**
   * Resumes all animations for a sprite
   */
  resumeAnimations(sprite: Phaser.GameObjects.Sprite): void {
    const orbId = sprite.getData('orbId') || sprite.name;
    const animations = this.activeAnimations.get(orbId);
    
    if (animations) {
      animations.forEach(tween => {
        if (tween.isPaused()) {
          tween.resume();
        }
      });
    }
  }

  /**
   * Stops all animations for a sprite
   */
  stopAllAnimations(sprite: Phaser.GameObjects.Sprite): void {
    const orbId = sprite.getData('orbId') || sprite.name;
    const animations = this.activeAnimations.get(orbId);
    
    if (animations) {
      animations.forEach(tween => {
        tween.stop();
      });
      this.activeAnimations.delete(orbId);
    }
    
    // Also stop floating animation
    this.stopFloatingAnimation(sprite);
  }

  /**
   * Creates a trail effect behind moving orbs
   */
  createTrailEffect(sprite: Phaser.GameObjects.Sprite, duration: number = 1000): void {
    const orbId = sprite.getData('orbId') || sprite.name;
    const trail: Phaser.GameObjects.Graphics[] = [];
    
    // Create trail segments
    for (let i = 0; i < 5; i++) {
      const segment = this.scene.add.graphics();
      segment.fillStyle(sprite.tintTopLeft, 0.3 - (i * 0.05));
      segment.fillCircle(0, 0, 4 - i);
      segment.x = sprite.x;
      segment.y = sprite.y;
      
      trail.push(segment);
      
      // Animate trail segment
      const trailTween = this.scene.tweens.add({
        targets: segment,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: duration - (i * 100),
        ease: 'Cubic.easeOut',
        onComplete: () => {
          segment.destroy();
        }
      });
      
      this.addToActiveAnimations(orbId, [trailTween]);
    }
  }

  /**
   * Cleans up all animations and resources
   */
  destroy(): void {
    // Stop all active animations
    this.activeAnimations.forEach((animations, orbId) => {
      animations.forEach(tween => {
        tween.stop();
      });
    });
    
    this.activeAnimations.clear();
    this.floatingAnimations.clear();
  }

  // Private helper methods

  private addToActiveAnimations(orbId: string, tweens: Phaser.Tweens.Tween[]): void {
    const existing = this.activeAnimations.get(orbId) || [];
    this.activeAnimations.set(orbId, [...existing, ...tweens]);
  }

  private removeFromActiveAnimations(orbId: string, tweens: Phaser.Tweens.Tween[]): void {
    const existing = this.activeAnimations.get(orbId) || [];
    const filtered = existing.filter(tween => !tweens.includes(tween));
    
    if (filtered.length > 0) {
      this.activeAnimations.set(orbId, filtered);
    } else {
      this.activeAnimations.delete(orbId);
    }
  }
}