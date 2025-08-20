// Input processing and core command dispatch
import { Direction } from '../core/GameCore';

export interface IInputHandler {
  /**
   * Handles keyboard input and dispatches to game core
   */
  handleKeyboard(key: string): void;

  /**
   * Handles touch/mouse input and dispatches to game core
   */
  handlePointer(x: number, y: number): void;

  /**
   * Enables input handling
   */
  enable(): void;

  /**
   * Disables input handling
   */
  disable(): void;
}

export class InputHandler implements IInputHandler {
  private scene: any; // Will be properly typed with Phaser types
  private gameCore: any; // Will be properly typed with IGameCore
  private enabled: boolean = true;
  private readonly cellSize = 24; // Grid cell size used for pointer translation

  constructor(scene: any, gameCore: any) {
    this.scene = scene;
    this.gameCore = gameCore;

    // Register keyboard input listener
    this.scene.input?.keyboard?.on('keydown', (e: any) => {
      this.handleKeyboard(e.key);
    });

    // Register pointer input listeners
    this.scene.input?.on('pointerdown', (p: any) => this.handlePointer(p.worldX, p.worldY));
    this.scene.input?.on('pointermove', (p: any) => {
      if (p.isDown) this.handlePointer(p.worldX, p.worldY);
    });
  }

  handleKeyboard(key: string): void {
    if (!this.enabled) return;

    const direction = this.keyToDirection(key);
    if (direction) {
      this.gameCore.movePlayer(direction);
    }
  }

  handlePointer(x: number, y: number): void {
    if (!this.enabled) return;

    const state = this.gameCore.getGameState?.();
    if (!state) return;

    const maze = state.maze;
    if (!maze?.length || !maze[0]?.length) return;

    const cols = maze[0].length;
    const mazeWidth = cols * this.cellSize;
    const offsetX = (this.scene.scale.width - mazeWidth) / 2;
    const offsetY = 200; // Vertical offset from top of screen

    const col = Math.floor((x - offsetX) / this.cellSize);
    const row = Math.floor((y - offsetY) / this.cellSize);

    if (col < 0 || row < 0 || row >= maze.length || col >= cols) return;

    const playerPos = state.player.position;
    const dx = col - playerPos.x;
    const dy = row - playerPos.y;

    // Only accept moves to adjacent cells
    if (Math.abs(dx) + Math.abs(dy) !== 1) return;

    let direction: Direction;
    if (dx === 1) direction = 'right';
    else if (dx === -1) direction = 'left';
    else if (dy === 1) direction = 'down';
    else direction = 'up';

    this.gameCore.movePlayer(direction);
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  private keyToDirection(key: string): Direction | null {
    switch (key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        return 'up';
      case 'arrowdown':
      case 's':
        return 'down';
      case 'arrowleft':
      case 'a':
        return 'left';
      case 'arrowright':
      case 'd':
        return 'right';
      default:
        return null;
    }
  }
}