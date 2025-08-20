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

  constructor(scene: any, gameCore: any) {
    this.scene = scene;
    this.gameCore = gameCore;
  }

  handleKeyboard(key: string): void {
    if (!this.enabled) return;

    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
  }

  handlePointer(x: number, y: number): void {
    if (!this.enabled) return;

    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
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