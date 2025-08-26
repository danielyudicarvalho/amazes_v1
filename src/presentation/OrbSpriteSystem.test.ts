// Tests for OrbSpriteSystem
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { OrbSpriteSystem, OrbSpriteConfig } from './OrbSpriteSystem';
import { OrbAnimationController } from './OrbAnimationController';
import { ParticleEffectManager } from './ParticleEffectManager';
import { SpriteFactory } from './SpriteFactory';
import { OrbState } from '../core/types/GameState';

// Mock Phaser scene and objects
const mockScene = {
  add: {
    sprite: vi.fn().mockReturnValue({
      setData: vi.fn().mockReturnThis(),
      getData: vi.fn(),
      setPosition: vi.fn().mockReturnThis(),
      setScale: vi.fn().mockReturnThis(),
      setTint: vi.fn().mockReturnThis(),
      setOrigin: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      x: 100,
      y: 100,
      scaleX: 1,
      scaleY: 1,
      name: 'test_orb'
    })
  },
  tweens: {
    add: vi.fn().mockReturnValue({
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      isPlaying: vi.fn().mockReturnValue(true),
      isPaused: vi.fn().mockReturnValue(false),
      duration: 1000
    })
  },
  time: {
    delayedCall: vi.fn()
  }
} as any;

// Mock dependencies
const mockSpriteFactory = {
  createOrb: vi.fn().mockReturnValue(mockScene.add.sprite())
} as any;

const mockAnimationController = {
  startFloatingAnimation: vi.fn(),
  stopFloatingAnimation: vi.fn(),
  addGlowEffect: vi.fn(),
  addPulseEffect: vi.fn(),
  animateCollection: vi.fn().mockResolvedValue(undefined),
  stopAllAnimations: vi.fn(),
  pauseAnimations: vi.fn(),
  resumeAnimations: vi.fn()
} as any;

const mockParticleManager = {
  createCollectionEffect: vi.fn()
} as any;

describe('OrbSpriteSystem', () => {
  let orbSpriteSystem: OrbSpriteSystem;
  let mockOrbState: OrbState;

  beforeEach(() => {
    vi.clearAllMocks();
    
    orbSpriteSystem = new OrbSpriteSystem(
      mockScene,
      mockSpriteFactory,
      mockAnimationController,
      mockParticleManager
    );

    mockOrbState = {
      id: 'orb_001',
      position: { x: 5, y: 3 },
      collected: false,
      value: 10
    };
  });

  describe('createOrbSprite', () => {
    test('should create orb sprite with default configuration', () => {
      const sprite = orbSpriteSystem.createOrbSprite(mockOrbState);

      expect(mockSpriteFactory.createOrb).toHaveBeenCalledWith(
        mockOrbState.position,
        mockOrbState.id,
        expect.objectContaining({
          type: 'orb',
          variant: expect.any(String),
          theme: 'default'
        })
      );

      expect(sprite.setData).toHaveBeenCalledWith('orbState', mockOrbState);
      expect(sprite.setData).toHaveBeenCalledWith('orbType', expect.any(String));
      expect(mockAnimationController.startFloatingAnimation).toHaveBeenCalled();
    });

    test('should create orb sprite with custom configuration', () => {
      const config: OrbSpriteConfig = {
        type: 'crystal',
        theme: 'forest',
        floatingSpeed: 800,
        floatingRange: 5,
        glowEffect: true,
        pulseEffect: true
      };

      const sprite = orbSpriteSystem.createOrbSprite(mockOrbState, config);

      expect(mockSpriteFactory.createOrb).toHaveBeenCalledWith(
        mockOrbState.position,
        mockOrbState.id,
        expect.objectContaining({
          variant: 'crystal',
          theme: 'forest'
        })
      );

      expect(mockAnimationController.startFloatingAnimation).toHaveBeenCalledWith(
        sprite,
        expect.objectContaining({
          speed: 800,
          range: 5
        })
      );

      expect(mockAnimationController.addGlowEffect).toHaveBeenCalledWith(sprite);
      expect(mockAnimationController.addPulseEffect).toHaveBeenCalledWith(sprite);
    });

    test('should apply correct visual effects based on orb type', () => {
      const energyConfig: OrbSpriteConfig = { type: 'energy' };
      const sprite = orbSpriteSystem.createOrbSprite(mockOrbState, energyConfig);

      expect(sprite.setTint).toHaveBeenCalledWith(0x00FFFF); // Cyan for energy
      expect(sprite.setScale).toHaveBeenCalledWith(0.8);
    });

    test('should store sprite reference for later access', () => {
      const sprite = orbSpriteSystem.createOrbSprite(mockOrbState);
      
      const retrievedSprite = orbSpriteSystem.getOrbSprite(mockOrbState.id);
      expect(retrievedSprite).toBe(sprite);
    });
  });

  describe('createOrbSprites', () => {
    test('should create multiple orb sprites from game state', () => {
      const orbStates: OrbState[] = [
        { id: 'orb_001', position: { x: 1, y: 1 }, collected: false, value: 10 },
        { id: 'orb_002', position: { x: 3, y: 2 }, collected: false, value: 20 },
        { id: 'orb_003', position: { x: 5, y: 4 }, collected: true, value: 15 } // Collected orb
      ];

      const sprites = orbSpriteSystem.createOrbSprites(orbStates, 'forest');

      // Should only create sprites for non-collected orbs
      expect(sprites).toHaveLength(2);
      expect(mockSpriteFactory.createOrb).toHaveBeenCalledTimes(2);
    });

    test('should assign different orb types based on value and index', () => {
      const orbStates: OrbState[] = [
        { id: 'orb_001', position: { x: 1, y: 1 }, collected: false, value: 60 }, // Special
        { id: 'orb_002', position: { x: 3, y: 2 }, collected: false, value: 35 }, // Power
        { id: 'orb_003', position: { x: 5, y: 4 }, collected: false, value: 10 }  // Energy/Crystal
      ];

      orbSpriteSystem.createOrbSprites(orbStates);

      // Verify different configurations were used
      expect(mockSpriteFactory.createOrb).toHaveBeenCalledTimes(3);
    });
  });

  describe('animateOrbCollection', () => {
    test('should animate orb collection with default configuration', async () => {
      const sprite = orbSpriteSystem.createOrbSprite(mockOrbState);
      
      await orbSpriteSystem.animateOrbCollection(mockOrbState.id);

      expect(mockAnimationController.stopFloatingAnimation).toHaveBeenCalledWith(sprite);
      expect(mockParticleManager.createCollectionEffect).toHaveBeenCalled();
      expect(mockAnimationController.animateCollection).toHaveBeenCalled();
    });

    test('should handle missing orb sprite gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await orbSpriteSystem.animateOrbCollection('nonexistent_orb');

      expect(consoleSpy).toHaveBeenCalledWith('Orb sprite not found for ID: nonexistent_orb');
      consoleSpy.mockRestore();
    });

    test('should clean up sprite after collection animation', async () => {
      const sprite = orbSpriteSystem.createOrbSprite(mockOrbState);
      
      await orbSpriteSystem.animateOrbCollection(mockOrbState.id);

      expect(orbSpriteSystem.getOrbSprite(mockOrbState.id)).toBeNull();
    });
  });

  describe('orb management', () => {
    test('should update orb theme', () => {
      const sprite = orbSpriteSystem.createOrbSprite(mockOrbState);
      
      orbSpriteSystem.updateOrbTheme(mockOrbState.id, 'winter');

      // Should apply new visual effects
      expect(sprite.setTint).toHaveBeenCalled();
    });

    test('should get all orb sprites', () => {
      const orb1 = orbSpriteSystem.createOrbSprite(mockOrbState);
      const orb2 = orbSpriteSystem.createOrbSprite({
        ...mockOrbState,
        id: 'orb_002',
        position: { x: 7, y: 8 }
      });

      const allSprites = orbSpriteSystem.getAllOrbSprites();
      expect(allSprites).toHaveLength(2);
      expect(allSprites).toContain(orb1);
      expect(allSprites).toContain(orb2);
    });

    test('should remove orb sprite and clean up', () => {
      const sprite = orbSpriteSystem.createOrbSprite(mockOrbState);
      
      orbSpriteSystem.removeOrbSprite(mockOrbState.id);

      expect(mockAnimationController.stopAllAnimations).toHaveBeenCalledWith(sprite);
      expect(sprite.destroy).toHaveBeenCalled();
      expect(orbSpriteSystem.getOrbSprite(mockOrbState.id)).toBeNull();
    });

    test('should clear all orbs', () => {
      orbSpriteSystem.createOrbSprite(mockOrbState);
      orbSpriteSystem.createOrbSprite({
        ...mockOrbState,
        id: 'orb_002',
        position: { x: 7, y: 8 }
      });

      orbSpriteSystem.clearAllOrbs();

      expect(orbSpriteSystem.getAllOrbSprites()).toHaveLength(0);
    });
  });

  describe('animation control', () => {
    test('should pause all orb animations', () => {
      const sprite1 = orbSpriteSystem.createOrbSprite(mockOrbState);
      const sprite2 = orbSpriteSystem.createOrbSprite({
        ...mockOrbState,
        id: 'orb_002',
        position: { x: 7, y: 8 }
      });

      orbSpriteSystem.pauseAnimations();

      expect(mockAnimationController.pauseAnimations).toHaveBeenCalledWith(sprite1);
      expect(mockAnimationController.pauseAnimations).toHaveBeenCalledWith(sprite2);
    });

    test('should resume all orb animations', () => {
      const sprite1 = orbSpriteSystem.createOrbSprite(mockOrbState);
      const sprite2 = orbSpriteSystem.createOrbSprite({
        ...mockOrbState,
        id: 'orb_002',
        position: { x: 7, y: 8 }
      });

      orbSpriteSystem.resumeAnimations();

      expect(mockAnimationController.resumeAnimations).toHaveBeenCalledWith(sprite1);
      expect(mockAnimationController.resumeAnimations).toHaveBeenCalledWith(sprite2);
    });
  });

  describe('orb type determination', () => {
    test('should determine special orb for high value', () => {
      const highValueOrb: OrbState = {
        id: 'orb_special',
        position: { x: 1, y: 1 },
        collected: false,
        value: 60
      };

      const sprite = orbSpriteSystem.createOrbSprite(highValueOrb);
      expect(sprite.setData).toHaveBeenCalledWith('orbType', 'special');
    });

    test('should determine power orb for medium-high value', () => {
      const powerOrb: OrbState = {
        id: 'orb_power',
        position: { x: 1, y: 1 },
        collected: false,
        value: 35
      };

      const sprite = orbSpriteSystem.createOrbSprite(powerOrb);
      expect(sprite.setData).toHaveBeenCalledWith('orbType', 'power');
    });

    test('should determine bonus orb for medium value', () => {
      const bonusOrb: OrbState = {
        id: 'orb_bonus',
        position: { x: 1, y: 1 },
        collected: false,
        value: 25
      };

      const sprite = orbSpriteSystem.createOrbSprite(bonusOrb);
      expect(sprite.setData).toHaveBeenCalledWith('orbType', 'bonus');
    });
  });

  describe('theme management', () => {
    test('should set default theme', () => {
      orbSpriteSystem.setDefaultTheme('winter');
      
      const sprite = orbSpriteSystem.createOrbSprite(mockOrbState);
      
      expect(mockSpriteFactory.createOrb).toHaveBeenCalledWith(
        mockOrbState.position,
        mockOrbState.id,
        expect.objectContaining({
          theme: 'winter'
        })
      );
    });
  });
});