// Tests for PlayerAnimationController
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlayerAnimationController } from './PlayerAnimationController';

// Mock Phaser objects
const mockScene = {
  anims: {
    exists: vi.fn(() => true),
    create: vi.fn(),
    get: vi.fn()
  },
  tweens: {
    add: vi.fn(() => ({ isActive: () => false }))
  },
  time: {
    addEvent: vi.fn(() => ({ destroy: vi.fn() })),
    delayedCall: vi.fn()
  },
  scale: {
    width: 800,
    height: 600
  },
  add: {
    graphics: vi.fn(() => ({
      fillStyle: vi.fn(),
      fillCircle: vi.fn(),
      setStroke: vi.fn(),
      strokeCircle: vi.fn(),
      fillTriangle: vi.fn(),
      generateTexture: vi.fn(),
      destroy: vi.fn()
    }))
  },
  textures: {
    exists: vi.fn(() => false)
  }
} as any;

const mockSprite = {
  texture: { key: 'test' },
  frame: { name: 'test' },
  play: vi.fn(),
  stop: vi.fn(),
  setPosition: vi.fn(),
  setFlipX: vi.fn(),
  setTint: vi.fn(),
  clearTint: vi.fn(),
  scaleX: 1,
  scaleY: 1,
  x: 0,
  y: 0,
  active: true,
  anims: {
    pause: vi.fn(),
    resume: vi.fn()
  },
  once: vi.fn(),
  setData: vi.fn(),
  getData: vi.fn()
} as any;

describe('PlayerAnimationController', () => {
  let controller: PlayerAnimationController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PlayerAnimationController(mockScene, mockSprite);
  });

  it('should initialize with default configuration', () => {
    expect(controller).toBeDefined();
    expect(controller.isIdle()).toBe(true);
    expect(controller.isMoving()).toBe(false);
  });

  it('should play movement animation', async () => {
    const fromPos = { x: 0, y: 0 };
    const toPos = { x: 1, y: 0 };
    
    // Mock the tween to complete immediately
    mockScene.tweens.add.mockImplementation((config: any) => {
      setTimeout(() => config.onComplete(), 0);
      return { isActive: () => false };
    });

    await controller.playMovementAnimation('right', fromPos, toPos);
    
    expect(mockSprite.play).toHaveBeenCalled();
    expect(mockScene.tweens.add).toHaveBeenCalled();
  });

  it('should handle idle animation', () => {
    controller.playIdleAnimation();
    
    expect(controller.isIdle()).toBe(true);
    expect(controller.isMoving()).toBe(false);
  });

  it('should update position without animation', () => {
    const newPos = { x: 5, y: 5 };
    controller.updatePosition(newPos);
    
    expect(mockSprite.setPosition).toHaveBeenCalled();
  });

  it('should get current animation state', () => {
    const state = controller.getAnimationState();
    
    expect(state).toHaveProperty('isIdle');
    expect(state).toHaveProperty('isMoving');
    expect(state).toHaveProperty('position');
    expect(state).toHaveProperty('direction');
  });

  it('should force idle state', () => {
    controller.forceIdle();
    
    expect(controller.isIdle()).toBe(true);
    expect(controller.isMoving()).toBe(false);
  });

  it('should handle custom animations', async () => {
    mockScene.anims.exists.mockReturnValue(true);
    
    // Mock the sprite's once method to immediately call the callback
    mockSprite.once.mockImplementation((event: string, callback: Function) => {
      setTimeout(callback, 0);
    });
    
    await controller.playCustomAnimation('test_animation');
    
    expect(mockSprite.play).toHaveBeenCalledWith('test_animation');
  });

  it('should clean up resources on destroy', () => {
    controller.destroy();
    
    // Should not throw errors after destruction
    expect(() => controller.playIdleAnimation()).not.toThrow();
  });
});