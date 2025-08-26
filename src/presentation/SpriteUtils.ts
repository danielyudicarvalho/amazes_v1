// Utility functions for sprite positioning, scaling, and manipulation
import { Position } from '../core/types/GameState';

export interface ScaleConfig {
  baseScale?: number;
  minScale?: number;
  maxScale?: number;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
}

export interface PositionConfig {
  gridSize?: number;
  offsetX?: number;
  offsetY?: number;
  anchor?: { x: number; y: number };
  worldSpace?: boolean;
}

export interface AlignmentConfig {
  horizontal?: 'left' | 'center' | 'right';
  vertical?: 'top' | 'center' | 'bottom';
  margin?: { x: number; y: number };
}

export class SpriteUtils {
  private scene: Phaser.Scene;
  private defaultCellSize: number = 24;
  private baseScreenWidth: number = 800;
  private baseScreenHeight: number = 600;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Positions a sprite using grid coordinates
   */
  positionSpriteGrid(sprite: Phaser.GameObjects.Sprite, gridPos: Position, config?: PositionConfig): void {
    const cellSize = config?.gridSize || this.defaultCellSize;
    const offsetX = config?.offsetX || 0;
    const offsetY = config?.offsetY || 0;
    
    let worldX: number, worldY: number;
    
    if (config?.worldSpace) {
      // Direct world positioning
      worldX = gridPos.x + offsetX;
      worldY = gridPos.y + offsetY;
    } else {
      // Grid-based positioning (matching existing game coordinate system)
      worldX = this.gridToWorldX(gridPos.x, cellSize) + offsetX;
      worldY = this.gridToWorldY(gridPos.y, cellSize) + offsetY;
    }
    
    sprite.setPosition(worldX, worldY);
    
    // Apply anchor if specified
    if (config?.anchor) {
      sprite.setOrigin(config.anchor.x, config.anchor.y);
    }
  }

  /**
   * Positions a sprite using world coordinates
   */
  positionSpriteWorld(sprite: Phaser.GameObjects.Sprite, worldPos: Position, config?: PositionConfig): void {
    const offsetX = config?.offsetX || 0;
    const offsetY = config?.offsetY || 0;
    
    sprite.setPosition(worldPos.x + offsetX, worldPos.y + offsetY);
    
    if (config?.anchor) {
      sprite.setOrigin(config.anchor.x, config.anchor.y);
    }
  }

  /**
   * Scales a sprite with responsive scaling options
   */
  scaleSprite(sprite: Phaser.GameObjects.Sprite, config?: ScaleConfig): void {
    let finalScale = config?.baseScale || 1;
    
    if (config?.responsive) {
      const screenScale = this.calculateResponsiveScale();
      finalScale *= screenScale;
    }
    
    // Apply scale constraints
    if (config?.minScale !== undefined) {
      finalScale = Math.max(finalScale, config.minScale);
    }
    
    if (config?.maxScale !== undefined) {
      finalScale = Math.min(finalScale, config.maxScale);
    }
    
    if (config?.maintainAspectRatio !== false) {
      sprite.setScale(finalScale);
    } else {
      // Allow different X and Y scaling if aspect ratio is not maintained
      sprite.setScale(finalScale, finalScale);
    }
  }

  /**
   * Aligns a sprite relative to screen or parent bounds
   */
  alignSprite(sprite: Phaser.GameObjects.Sprite, config: AlignmentConfig, bounds?: Phaser.Geom.Rectangle): void {
    const targetBounds = bounds || new Phaser.Geom.Rectangle(0, 0, this.scene.scale.width, this.scene.scale.height);
    const margin = config.margin || { x: 0, y: 0 };
    
    let x = sprite.x;
    let y = sprite.y;
    
    // Horizontal alignment
    switch (config.horizontal) {
      case 'left':
        x = targetBounds.left + margin.x + sprite.displayWidth * sprite.originX;
        break;
      case 'center':
        x = targetBounds.centerX;
        break;
      case 'right':
        x = targetBounds.right - margin.x - sprite.displayWidth * (1 - sprite.originX);
        break;
    }
    
    // Vertical alignment
    switch (config.vertical) {
      case 'top':
        y = targetBounds.top + margin.y + sprite.displayHeight * sprite.originY;
        break;
      case 'center':
        y = targetBounds.centerY;
        break;
      case 'bottom':
        y = targetBounds.bottom - margin.y - sprite.displayHeight * (1 - sprite.originY);
        break;
    }
    
    sprite.setPosition(x, y);
  }

  /**
   * Converts grid coordinates to world coordinates
   */
  gridToWorld(gridPos: Position, cellSize?: number): Position {
    const size = cellSize || this.defaultCellSize;
    return {
      x: this.gridToWorldX(gridPos.x, size),
      y: this.gridToWorldY(gridPos.y, size)
    };
  }

  /**
   * Converts world coordinates to grid coordinates
   */
  worldToGrid(worldPos: Position, cellSize?: number): Position {
    const size = cellSize || this.defaultCellSize;
    return {
      x: this.worldToGridX(worldPos.x, size),
      y: this.worldToGridY(worldPos.y, size)
    };
  }

  /**
   * Calculates the distance between two sprites
   */
  getDistance(sprite1: Phaser.GameObjects.Sprite, sprite2: Phaser.GameObjects.Sprite): number {
    return Phaser.Math.Distance.Between(sprite1.x, sprite1.y, sprite2.x, sprite2.y);
  }

  /**
   * Calculates the angle between two sprites
   */
  getAngle(sprite1: Phaser.GameObjects.Sprite, sprite2: Phaser.GameObjects.Sprite): number {
    return Phaser.Math.Angle.Between(sprite1.x, sprite1.y, sprite2.x, sprite2.y);
  }

  /**
   * Checks if two sprites are overlapping
   */
  areSpritesOverlapping(sprite1: Phaser.GameObjects.Sprite, sprite2: Phaser.GameObjects.Sprite): boolean {
    return Phaser.Geom.Rectangle.Overlaps(sprite1.getBounds(), sprite2.getBounds());
  }

  /**
   * Gets the bounds of a sprite in world coordinates
   */
  getSpriteBounds(sprite: Phaser.GameObjects.Sprite): Phaser.Geom.Rectangle {
    return sprite.getBounds();
  }

  /**
   * Centers a sprite within given bounds
   */
  centerSpriteInBounds(sprite: Phaser.GameObjects.Sprite, bounds: Phaser.Geom.Rectangle): void {
    sprite.setPosition(bounds.centerX, bounds.centerY);
  }

  /**
   * Fits a sprite within given bounds while maintaining aspect ratio
   */
  fitSpriteInBounds(sprite: Phaser.GameObjects.Sprite, bounds: Phaser.Geom.Rectangle, padding: number = 0): void {
    const spriteWidth = sprite.displayWidth;
    const spriteHeight = sprite.displayHeight;
    const availableWidth = bounds.width - padding * 2;
    const availableHeight = bounds.height - padding * 2;
    
    const scaleX = availableWidth / spriteWidth;
    const scaleY = availableHeight / spriteHeight;
    const scale = Math.min(scaleX, scaleY);
    
    sprite.setScale(scale);
    this.centerSpriteInBounds(sprite, bounds);
  }

  /**
   * Animates a sprite to a new position
   */
  animateToPosition(sprite: Phaser.GameObjects.Sprite, targetPos: Position, duration: number = 300, ease: string = 'Power2'): Phaser.Tweens.Tween {
    return this.scene.tweens.add({
      targets: sprite,
      x: targetPos.x,
      y: targetPos.y,
      duration,
      ease
    });
  }

  /**
   * Animates a sprite to a new scale
   */
  animateToScale(sprite: Phaser.GameObjects.Sprite, targetScale: number, duration: number = 300, ease: string = 'Power2'): Phaser.Tweens.Tween {
    return this.scene.tweens.add({
      targets: sprite,
      scaleX: targetScale,
      scaleY: targetScale,
      duration,
      ease
    });
  }

  /**
   * Creates a bounce animation for feedback
   */
  bounceSprite(sprite: Phaser.GameObjects.Sprite, intensity: number = 0.2, duration: number = 200): Phaser.Tweens.Tween {
    const originalScale = sprite.scaleX;
    return this.scene.tweens.add({
      targets: sprite,
      scaleX: originalScale + intensity,
      scaleY: originalScale + intensity,
      duration: duration / 2,
      yoyo: true,
      ease: 'Power2'
    });
  }

  /**
   * Creates a shake animation for feedback
   */
  shakeSprite(sprite: Phaser.GameObjects.Sprite, intensity: number = 5, duration: number = 300): Phaser.Tweens.Tween {
    const originalX = sprite.x;
    const originalY = sprite.y;
    
    return this.scene.tweens.add({
      targets: sprite,
      x: originalX + Phaser.Math.Between(-intensity, intensity),
      y: originalY + Phaser.Math.Between(-intensity, intensity),
      duration: 50,
      repeat: Math.floor(duration / 50),
      yoyo: true,
      onComplete: () => {
        sprite.setPosition(originalX, originalY);
      }
    });
  }

  /**
   * Creates a floating animation
   */
  floatSprite(sprite: Phaser.GameObjects.Sprite, amplitude: number = 2, period: number = 2000): Phaser.Tweens.Tween {
    const originalY = sprite.y;
    return this.scene.tweens.add({
      targets: sprite,
      y: originalY - amplitude,
      duration: period / 2,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Creates a pulse animation
   */
  pulseSprite(sprite: Phaser.GameObjects.Sprite, scaleVariation: number = 0.1, period: number = 1000): Phaser.Tweens.Tween {
    const originalScale = sprite.scaleX;
    return this.scene.tweens.add({
      targets: sprite,
      scaleX: originalScale + scaleVariation,
      scaleY: originalScale + scaleVariation,
      duration: period / 2,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Rotates a sprite continuously
   */
  rotateSprite(sprite: Phaser.GameObjects.Sprite, speed: number = 1, clockwise: boolean = true): Phaser.Tweens.Tween {
    const direction = clockwise ? 1 : -1;
    return this.scene.tweens.add({
      targets: sprite,
      rotation: sprite.rotation + (Math.PI * 2 * direction),
      duration: 1000 / speed,
      repeat: -1,
      ease: 'Linear'
    });
  }

  /**
   * Fades a sprite in or out
   */
  fadeSprite(sprite: Phaser.GameObjects.Sprite, targetAlpha: number, duration: number = 500): Phaser.Tweens.Tween {
    return this.scene.tweens.add({
      targets: sprite,
      alpha: targetAlpha,
      duration,
      ease: 'Power2'
    });
  }

  /**
   * Sets the default cell size for grid calculations
   */
  setDefaultCellSize(size: number): void {
    this.defaultCellSize = size;
  }

  /**
   * Gets the current default cell size
   */
  getDefaultCellSize(): number {
    return this.defaultCellSize;
  }

  /**
   * Sets the base screen dimensions for responsive scaling
   */
  setBaseScreenSize(width: number, height: number): void {
    this.baseScreenWidth = width;
    this.baseScreenHeight = height;
  }

  // Private helper methods

  private gridToWorldX(gridX: number, cellSize: number): number {
    // Match existing coordinate system from GameScene
    const mazeWidth = 10 * cellSize; // Assuming typical maze width
    const offsetX = (this.scene.scale.width - mazeWidth) / 2;
    return offsetX + gridX * cellSize + cellSize / 2;
  }

  private gridToWorldY(gridY: number, cellSize: number): number {
    // Match existing coordinate system from GameScene
    return 200 + gridY * cellSize + cellSize / 2;
  }

  private worldToGridX(worldX: number, cellSize: number): number {
    const mazeWidth = 10 * cellSize;
    const offsetX = (this.scene.scale.width - mazeWidth) / 2;
    return Math.floor((worldX - offsetX - cellSize / 2) / cellSize);
  }

  private worldToGridY(worldY: number, cellSize: number): number {
    return Math.floor((worldY - 200 - cellSize / 2) / cellSize);
  }

  private calculateResponsiveScale(): number {
    const scaleX = this.scene.scale.width / this.baseScreenWidth;
    const scaleY = this.scene.scale.height / this.baseScreenHeight;
    
    // Use the smaller scale to ensure everything fits
    const scale = Math.min(scaleX, scaleY);
    
    // Clamp between reasonable bounds
    return Math.max(0.5, Math.min(2.0, scale));
  }

  // Static utility methods

  /**
   * Calculates the center point between two positions
   */
  static getMidpoint(pos1: Position, pos2: Position): Position {
    return {
      x: (pos1.x + pos2.x) / 2,
      y: (pos1.y + pos2.y) / 2
    };
  }

  /**
   * Calculates the distance between two positions
   */
  static getDistanceBetweenPositions(pos1: Position, pos2: Position): number {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }

  /**
   * Normalizes an angle to be between 0 and 2π
   */
  static normalizeAngle(angle: number): number {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
  }

  /**
   * Converts degrees to radians
   */
  static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Converts radians to degrees
   */
  static radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Clamps a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Linear interpolation between two values
   */
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * Linear interpolation between two positions
   */
  static lerpPosition(start: Position, end: Position, t: number): Position {
    return {
      x: SpriteUtils.lerp(start.x, end.x, t),
      y: SpriteUtils.lerp(start.y, end.y, t)
    };
  }
}