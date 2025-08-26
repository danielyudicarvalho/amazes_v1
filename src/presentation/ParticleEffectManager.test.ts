// Tests for ParticleEffectManager
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ParticleEffectManager, CollectionEffectConfig, AmbientEffectConfig } from './ParticleEffectManager';

// Mock Phaser geometry objects
global.Phaser = {
  Geom: {
    Circle: vi.fn().mockImplementation((x, y, radius) => ({ x, y, radius })),
    Rectangle: vi.fn().mockImplementation((x, y, width, height) => ({ x, y, width, height }))
  }
} as any;

// Mock Phaser scene and objects
const mockParticleEmitter = {
  explode: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  destroy: vi.fn(),
  setPosition: vi.fn()
};

const mockGraphics = {
  fillStyle: vi.fn().mockReturnThis(),
  fillCircle: vi.fn().mockReturnThis(),
  fillStar: vi.fn().mockReturnThis(),
  generateTexture: vi.fn(),
  destroy: vi.fn(),
  x: 0,
  y: 0
};

const mockText = {
  setOrigin: vi.fn().mockReturnThis(),
  destroy: vi.fn()
};

const mockScene = {
  add: {
    particles: vi.fn().mockReturnValue(mockParticleEmitter),
    graphics: vi.fn().mockReturnValue(mockGraphics),
    text: vi.fn().mockReturnValue(mockText)
  },
  tweens: {
    add: vi.fn().mockReturnValue({
      stop: vi.fn(),
      duration: 1000
    })
  },
  time: {
    delayedCall: vi.fn()
  },
  textures: {
    exists: vi.fn().mockReturnValue(false)
  }
} as any;

describe('ParticleEffectManager', () => {
  let particleManager: ParticleEffectManager;

  beforeEach(() => {
    vi.clearAllMocks();
    particleManager = new ParticleEffectManager(mockScene);
  });

  describe('initialization', () => {
    test('should create particle textures if they do not exist', () => {
      expect(mockScene.add.graphics).toHaveBeenCalledTimes(2); // circle and star textures
      expect(mockGraphics.generateTexture).toHaveBeenCalledWith('particle_circle', 8, 8);
      expect(mockGraphics.generateTexture).toHaveBeenCalledWith('particle_star', 8, 8);
    });

    test('should not create textures if they already exist', () => {
      mockScene.textures.exists.mockReturnValue(true);
      
      // Create new instance
      new ParticleEffectManager(mockScene);
      
      // Should not create additional graphics
      expect(mockScene.add.graphics).toHaveBeenCalledTimes(2); // Only from first instance
    });
  });

  describe('collection effects', () => {
    test('should create collection effect with default configuration', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = {
        type: 'energy'
      };

      const effectId = particleManager.createCollectionEffect(position, config);

      expect(effectId).toMatch(/^collection_/);
      expect(mockScene.add.particles).toHaveBeenCalledWith(
        position.x,
        position.y,
        'particle_circle',
        expect.objectContaining({
          speed: expect.any(Object),
          scale: expect.any(Object),
          lifespan: expect.any(Number),
          quantity: expect.any(Number)
        })
      );
      expect(mockParticleEmitter.explode).toHaveBeenCalled();
    });

    test('should create collection effect with custom configuration', () => {
      const position = { x: 200, y: 250 };
      const config: CollectionEffectConfig = {
        type: 'special',
        particleCount: 30,
        duration: 800,
        speed: 150,
        burstEffect: true,
        sparkleTrail: true,
        scorePopup: true
      };

      particleManager.createCollectionEffect(position, config);

      expect(mockParticleEmitter.explode).toHaveBeenCalledWith(30, position.x, position.y);
      expect(mockScene.add.graphics).toHaveBeenCalled(); // For sparkle trail
      expect(mockScene.add.text).toHaveBeenCalled(); // For score popup
    });

    test('should create sparkle trail when enabled', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = {
        type: 'crystal',
        sparkleTrail: true,
        particleCount: 20
      };

      particleManager.createCollectionEffect(position, config);

      // Should create sparkle graphics (half of particle count)
      expect(mockScene.add.graphics).toHaveBeenCalledTimes(10);
      expect(mockScene.tweens.add).toHaveBeenCalledTimes(10);
    });

    test('should create score popup when enabled', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = {
        type: 'bonus',
        scorePopup: true
      };

      particleManager.createCollectionEffect(position, config);

      expect(mockScene.add.text).toHaveBeenCalledWith(
        position.x,
        position.y,
        '+10',
        expect.objectContaining({
          fontSize: '16px',
          color: '#FFD700'
        })
      );
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('burst effects', () => {
    test('should create burst effect with default configuration', () => {
      const position = { x: 100, y: 150 };
      const config = {
        type: 'energy' as const,
        particleCount: 15,
        duration: 500,
        speed: 100,
        colors: [0x00FFFF],
        size: { min: 2, max: 6 }
      };

      const effectId = particleManager.createBurstEffect(position, config);

      expect(effectId).toMatch(/^burst_/);
      expect(mockParticleEmitter.explode).toHaveBeenCalledWith(15, position.x, position.y);
      expect(mockScene.time.delayedCall).toHaveBeenCalled(); // Auto-cleanup
    });
  });

  describe('ambient effects', () => {
    test('should create ambient effect with default configuration', () => {
      const position = { x: 100, y: 150 };
      const config: AmbientEffectConfig = {};

      const effectId = particleManager.createAmbientEffect(position, config);

      expect(effectId).toMatch(/^ambient_/);
      expect(mockScene.add.particles).toHaveBeenCalledWith(
        position.x,
        position.y,
        'particle_circle',
        expect.objectContaining({
          frequency: 500,
          quantity: 1
        })
      );
    });

    test('should create ambient effect with custom configuration', () => {
      const position = { x: 200, y: 250 };
      const config: AmbientEffectConfig = {
        particleCount: 10,
        area: { width: 200, height: 150 },
        speed: { min: 20, max: 50 },
        continuous: false
      };

      particleManager.createAmbientEffect(position, config);

      expect(mockParticleEmitter.stop).toHaveBeenCalled(); // Should stop for non-continuous
    });
  });

  describe('floating effects', () => {
    test('should create floating effect for different orb types', () => {
      const position = { x: 100, y: 150 };
      
      const effectId = particleManager.createFloatingEffect(position, 'energy');

      expect(effectId).toMatch(/^floating_energy_/);
      expect(mockScene.add.particles).toHaveBeenCalledWith(
        position.x,
        position.y,
        'particle_circle',
        expect.objectContaining({
          frequency: 300,
          quantity: 1
        })
      );
    });
  });

  describe('effect management', () => {
    test('should update effect position', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = { type: 'energy' };
      
      const effectId = particleManager.createCollectionEffect(position, config);
      const newPosition = { x: 200, y: 250 };
      
      particleManager.updateEffectPosition(effectId, newPosition);

      expect(mockParticleEmitter.setPosition).toHaveBeenCalledWith(newPosition.x, newPosition.y);
    });

    test('should stop effect', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = { type: 'energy' };
      
      const effectId = particleManager.createCollectionEffect(position, config);
      
      particleManager.stopEffect(effectId);

      expect(mockParticleEmitter.stop).toHaveBeenCalled();
      expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
        2000,
        expect.any(Function)
      );
    });

    test('should handle stopping non-existent effect gracefully', () => {
      particleManager.stopEffect('nonexistent_effect');
      
      // Should not throw error
      expect(mockParticleEmitter.stop).not.toHaveBeenCalled();
    });

    test('should pause all effects', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = { type: 'energy' };
      
      particleManager.createCollectionEffect(position, config);
      particleManager.createAmbientEffect(position, {});
      
      particleManager.pauseAllEffects();

      expect(mockParticleEmitter.pause).toHaveBeenCalledTimes(2);
    });

    test('should resume all effects', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = { type: 'energy' };
      
      particleManager.createCollectionEffect(position, config);
      particleManager.createAmbientEffect(position, {});
      
      particleManager.resumeAllEffects();

      expect(mockParticleEmitter.resume).toHaveBeenCalledTimes(2);
    });

    test('should stop all effects', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = { type: 'energy' };
      
      particleManager.createCollectionEffect(position, config);
      particleManager.createAmbientEffect(position, {});
      
      particleManager.stopAllEffects();

      expect(mockParticleEmitter.stop).toHaveBeenCalledTimes(2);
    });
  });

  describe('orb type configurations', () => {
    test('should use correct colors for energy orbs', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = { type: 'energy' };
      
      particleManager.createCollectionEffect(position, config);

      expect(mockScene.add.particles).toHaveBeenCalledWith(
        position.x,
        position.y,
        'particle_circle',
        expect.objectContaining({
          tint: [0x00FFFF, 0x0080FF, 0x40E0D0]
        })
      );
    });

    test('should use correct colors for crystal orbs', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = { type: 'crystal' };
      
      particleManager.createCollectionEffect(position, config);

      expect(mockScene.add.particles).toHaveBeenCalledWith(
        position.x,
        position.y,
        'particle_circle',
        expect.objectContaining({
          tint: [0xFF00FF, 0xFF80FF, 0xFFB6C1]
        })
      );
    });

    test('should use correct colors for special orbs', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = { type: 'special' };
      
      particleManager.createCollectionEffect(position, config);

      expect(mockScene.add.particles).toHaveBeenCalledWith(
        position.x,
        position.y,
        'particle_circle',
        expect.objectContaining({
          tint: [0xFF0080, 0xFF69B4, 0xFFB6C1, 0xDDA0DD]
        })
      );
    });
  });

  describe('cleanup', () => {
    test('should destroy and clean up all resources', () => {
      const position = { x: 100, y: 150 };
      const config: CollectionEffectConfig = { type: 'energy' };
      
      particleManager.createCollectionEffect(position, config);
      particleManager.createAmbientEffect(position, {});
      
      particleManager.destroy();

      expect(mockParticleEmitter.stop).toHaveBeenCalledTimes(2);
    });
  });
});