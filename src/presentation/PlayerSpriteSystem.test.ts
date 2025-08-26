// Tests for PlayerSpriteSystem
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlayerSpriteSystem } from './PlayerSpriteSystem';

// Mock GameCore
const mockGameCore = {
  getGameState: vi.fn(() => ({
    player: { position: { x: 0, y: 0 } },
    status: 'playing'
  })),
  on: vi.fn(),
  off: vi.fn()
} as any;

// Mock Layer
const mockLayer = {
  setName: vi.fn(),
  setDepth: vi.fn(),
  setVisible: vi.fn(),
  setAlpha: vi.fn(),
  setScrollFactor: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  destroy: vi.fn(),
  list: [],
  active: true
};

// Mock Phaser Scene
const mockScene = {
  scale: { width: 800, height: 600 },
  add: {
    sprite: vi.fn(() => mockSprite),
    graphics: vi.fn(() => ({
      fillStyle: vi.fn(),
      fillCircle: vi.fn(),
      generateTexture: vi.fn(),
      destroy: vi.fn()
    })),
    layer: vi.fn(() => mockLayer)
  },
  anims: {
    exists: vi.fn(() => true),
    create: vi.fn()
  },
  tweens: {
    add: vi.fn(() => ({ isActive: () => false }))
  },
  time: {
    addEvent: vi.fn(() => ({ destroy: vi.fn() })),
    delayedCall: vi.fn()
  },
  textures: {
    exists: vi.fn(() => false)
  }
} as any;

const mockSprite = {
  setPosition: vi.fn(),
  setScale: vi.fn(),
  setOrigin: vi.fn(),
  setTint: vi.fn(),
  clearTint: vi.fn(),
  setName: vi.fn(),
  setInteractive: vi.fn(() => mockSprite),
  on: vi.fn(),
  play: vi.fn(),
  stop: vi.fn(),
  destroy: vi.fn(),
  active: true,
  texture: { key: 'test' },
  frame: { name: 'test' },
  scaleX: 1,
  scaleY: 1,
  x: 0,
  y: 0,
  setData: vi.fn(),
  getData: vi.fn(),
  anims: {
    pause: vi.fn(),
    resume: vi.fn()
  },
  once: vi.fn()
} as any;

describe('PlayerSpriteSystem', () => {
  let system: PlayerSpriteSystem;

  beforeEach(() => {
    vi.clearAllMocks();
    system = new PlayerSpriteSystem({
      scene: mockScene,
      gameCore: mockGameCore
    });
  });

  it('should initialize successfully', () => {
    expect(system).toBeDefined();
    const status = system.getSystemStatus();
    expect(status.initialized).toBe(true);
  });

  it('should create player sprite', () => {
    const position = { x: 2, y: 3 };
    const sprite = system.createPlayerSprite(position);
    
    expect(sprite).toBeDefined();
    expect(system.getPlayerSprite()).toBe(sprite);
    
    const status = system.getSystemStatus();
    expect(status.hasSprite).toBe(true);
    expect(status.hasAnimationController).toBe(true);
  });

  it('should move player with animation', async () => {
    const position = { x: 0, y: 0 };
    system.createPlayerSprite(position);
    
    const fromPos = { x: 0, y: 0 };
    const toPos = { x: 1, y: 0 };
    
    await system.movePlayer('right', fromPos, toPos);
    
    // Should not throw errors
    expect(system.isPlayerAnimating()).toBe(false);
  });

  it('should update theme', () => {
    const position = { x: 0, y: 0 };
    system.createPlayerSprite(position);
    
    expect(() => system.updateTheme('new_theme')).not.toThrow();
    
    const status = system.getSystemStatus();
    expect(status.currentTheme).toBe('new_theme');
  });

  it('should sync with game state', () => {
    const position = { x: 0, y: 0 };
    system.createPlayerSprite(position);
    
    expect(() => system.syncWithGameState()).not.toThrow();
  });

  it('should get player position', () => {
    const position = { x: 5, y: 7 };
    system.createPlayerSprite(position);
    
    const playerPos = system.getPlayerPosition();
    expect(playerPos).toEqual(position);
  });

  it('should handle player state queries', () => {
    const position = { x: 0, y: 0 };
    system.createPlayerSprite(position);
    
    expect(system.isPlayerIdle()).toBe(true);
    expect(system.isPlayerMoving()).toBe(false);
    expect(system.getPlayerDirection()).toBeNull();
  });

  it('should force idle state', () => {
    const position = { x: 0, y: 0 };
    system.createPlayerSprite(position);
    
    system.forcePlayerIdle();
    expect(system.isPlayerIdle()).toBe(true);
  });

  it('should validate system state', () => {
    const validation = system.validateSystem();
    expect(validation).toHaveProperty('isValid');
    expect(validation).toHaveProperty('errors');
    expect(validation).toHaveProperty('warnings');
  });

  it('should reset system', () => {
    const position = { x: 0, y: 0 };
    system.createPlayerSprite(position);
    
    expect(() => system.reset()).not.toThrow();
  });

  it('should clean up on destroy', () => {
    const position = { x: 0, y: 0 };
    system.createPlayerSprite(position);
    
    system.destroy();
    
    const status = system.getSystemStatus();
    expect(status.initialized).toBe(false);
  });
});