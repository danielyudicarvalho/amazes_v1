// Tests for OrbAnimationController
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { OrbAnimationController, FloatingAnimationConfig, CollectionAnimationConfig } from './OrbAnimationController';

// Mock Phaser scene and objects
const mockTween = {
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  isPlaying: vi.fn().mockReturnValue(true),
  isPaused: vi.fn().mockReturnValue(false),
  duration: 1000
};

const mockScene = {
  tweens: {
    add: vi.fn().mockReturnValue(mockTween)
  },
  time: {
    delayedCall: vi.fn().mockImplementation((delay, callback) => {
      // Immediately call the callback for testing
      setTimeout(callback, 0);
    })
  },
  add: {
    graphics: vi.fn().mockReturnValue({
      fillStyle: vi.fn().mockReturnThis(),
      fillCircle: vi.fn().mockReturnThis(),
      fillStar: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      x: 0,
      y: 0
    })
  }
} as any;

const mockSprite = {
  getData: vi.fn().mockImplementation((key: string) => {
    if (key === 'orbId') return 'orb_001';
    if (key === 'originalY') return 100;
    return null;
  }),
  setData: vi.fn().mockReturnThis(),
  x: 100,
  y: 100,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  tintTopLeft: 0xFF0000,
  name: 'test_orb'
} as any;

describe('OrbAnimationController', () => {
  let animationController: OrbAnimationController;

  beforeEach(() => {
    vi.clearAllMocks();
    animationController = new OrbAnimationController(mockScene);
  });

  describe('floating animations', () => {
    test('should start floating animation with default configuration', () => {
      animationController.startFloatingAnimation(mockSprite);

      expect(mockSprite.setData).toHaveBeenCalledWith('originalY', 100);
      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: mockSprite,
          y: expect.any(Number),
          duration: expect.any(Number),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      );
    });

    test('should start floating animation with custom configuration', () => {
      const config: FloatingAnimationConfig = {
        speed: 800,
        range: 5,
        randomOffset: true,
        easing: 'Cubic.easeInOut'
      };

      animationController.startFloatingAnimation(mockSprite, config);

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: expect.any(Number), // Should be around 800 with variation
          ease: 'Cubic.easeInOut'
        })
      );
    });

    test('should stop existing floating animation before starting new one', () => {
      // Start first animation
      animationController.startFloatingAnimation(mockSprite);
      const firstTween = mockTween;

      // Start second animation
      animationController.startFloatingAnimation(mockSprite);

      expect(firstTween.stop).toHaveBeenCalled();
    });

    test('should stop floating animation', () => {
      animationController.startFloatingAnimation(mockSprite);
      animationController.stopFloatingAnimation(mockSprite);

      expect(mockTween.stop).toHaveBeenCalled();
    });
  });

  describe('collection animations', () => {
    test('should animate collection with default configuration', async () => {
      const promise = animationController.animateCollection(mockSprite);

      expect(mockScene.tweens.add).toHaveBeenCalledTimes(4); // Scale, fade, rotation, bounce
      expect(mockScene.time.delayedCall).toHaveBeenCalled();

      await promise;
    });

    test('should animate collection with custom configuration', async () => {
      const config: CollectionAnimationConfig = {
        duration: 800,
        scaleEffect: true,
        fadeEffect: false,
        rotation: true,
        bounce: false
      };

      await animationController.animateCollection(mockSprite, config);

      // Should create scale and rotation tweens, but not fade or bounce
      expect(mockScene.tweens.add).toHaveBeenCalledTimes(2);
    });

    test('should animate collection with target position', async () => {
      const config: CollectionAnimationConfig = {
        targetPosition: { x: 200, y: 150 }
      };

      await animationController.animateCollection(mockSprite, config);

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: mockSprite,
          x: 200,
          y: 150
        })
      );
    });

    test('should resolve promise after animation duration', async () => {
      const startTime = Date.now();
      await animationController.animateCollection(mockSprite, { duration: 100 });
      
      expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Function)
      );
    });
  });

  describe('visual effects', () => {
    test('should add glow effect with default configuration', () => {
      animationController.addGlowEffect(mockSprite);

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: mockSprite,
          alpha: expect.any(Number),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      );
    });

    test('should add glow effect with custom configuration', () => {
      const config = {
        intensity: 0.5,
        speed: 2000,
        color: 0xFF0000
      };

      animationController.addGlowEffect(mockSprite, config);

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          alpha: 0.5, // 1 - intensity
          duration: 2000
        })
      );
    });

    test('should add pulse effect with default configuration', () => {
      animationController.addPulseEffect(mockSprite);

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: mockSprite,
          scaleX: expect.any(Number),
          scaleY: expect.any(Number),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      );
    });

    test('should add pulse effect with custom configuration', () => {
      const config = {
        scale: 0.2,
        speed: 600
      };

      animationController.addPulseEffect(mockSprite, config);

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          scaleX: 1.2, // originalScale + config.scale
          scaleY: 1.2,
          duration: 600
        })
      );
    });
  });

  describe('special effects', () => {
    test('should create sparkle effect', () => {
      animationController.createSparkleEffect(mockSprite, 1500);

      // Should create 8 sparkle graphics
      expect(mockScene.add.graphics).toHaveBeenCalledTimes(8);
      expect(mockScene.tweens.add).toHaveBeenCalledTimes(8);
    });

    test('should create sparkle effect with default duration', () => {
      animationController.createSparkleEffect(mockSprite);

      expect(mockScene.add.graphics).toHaveBeenCalledTimes(8);
    });

    test('should create trail effect', () => {
      animationController.createTrailEffect(mockSprite, 800);

      // Should create 5 trail segments
      expect(mockScene.add.graphics).toHaveBeenCalledTimes(5);
      expect(mockScene.tweens.add).toHaveBeenCalledTimes(5);
    });
  });

  describe('animation control', () => {
    test('should pause animations', () => {
      animationController.startFloatingAnimation(mockSprite);
      animationController.addGlowEffect(mockSprite);
      
      animationController.pauseAnimations(mockSprite);

      expect(mockTween.pause).toHaveBeenCalledTimes(2);
    });

    test('should resume animations', () => {
      mockTween.isPaused.mockReturnValue(true);
      
      animationController.startFloatingAnimation(mockSprite);
      animationController.addGlowEffect(mockSprite);
      
      animationController.resumeAnimations(mockSprite);

      expect(mockTween.resume).toHaveBeenCalledTimes(2);
    });

    test('should stop all animations', () => {
      animationController.startFloatingAnimation(mockSprite);
      animationController.addGlowEffect(mockSprite);
      animationController.addPulseEffect(mockSprite);
      
      animationController.stopAllAnimations(mockSprite);

      expect(mockTween.stop).toHaveBeenCalledTimes(4); // floating + glow + pulse + stopFloatingAnimation
    });

    test('should not pause non-playing animations', () => {
      mockTween.isPlaying.mockReturnValue(false);
      
      animationController.startFloatingAnimation(mockSprite);
      animationController.pauseAnimations(mockSprite);

      expect(mockTween.pause).not.toHaveBeenCalled();
    });

    test('should not resume non-paused animations', () => {
      mockTween.isPaused.mockReturnValue(false);
      
      animationController.startFloatingAnimation(mockSprite);
      animationController.resumeAnimations(mockSprite);

      expect(mockTween.resume).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    test('should destroy and clean up all resources', () => {
      animationController.startFloatingAnimation(mockSprite);
      animationController.addGlowEffect(mockSprite);
      
      animationController.destroy();

      expect(mockTween.stop).toHaveBeenCalledTimes(2);
    });
  });

  describe('animation tracking', () => {
    test('should track active animations per sprite', () => {
      const sprite1 = { ...mockSprite, getData: vi.fn().mockReturnValue('orb_001') };
      const sprite2 = { ...mockSprite, getData: vi.fn().mockReturnValue('orb_002') };

      animationController.startFloatingAnimation(sprite1);
      animationController.startFloatingAnimation(sprite2);
      animationController.addGlowEffect(sprite1);

      // Stop animations for sprite1 only
      animationController.stopAllAnimations(sprite1);

      // sprite1 should have no active animations, sprite2 should still have floating
      expect(mockTween.stop).toHaveBeenCalledTimes(3); // floating + glow + stopFloatingAnimation for sprite1
    });
  });
});