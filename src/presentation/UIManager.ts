// UI element management and updates
import { GameState } from '../core/types/GameState';

export interface IUIManager {
  /**
   * Updates UI elements based on game state
   */
  updateUI(gameState: GameState): void;

  /**
   * Shows game completion UI
   */
  showGameComplete(score: number, time: number, stars: number): void;

  /**
   * Shows pause menu
   */
  showPauseMenu(): void;

  /**
   * Hides pause menu
   */
  hidePauseMenu(): void;

  /**
   * Updates score display
   */
  updateScore(score: number): void;

  /**
   * Updates timer display
   */
  updateTimer(time: number): void;
}

export class UIManager implements IUIManager {
  private scene: any; // Will be properly typed with Phaser types

  constructor(scene: any) {
    this.scene = scene;
  }

  updateUI(gameState: GameState): void {
    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
  }

  showGameComplete(score: number, time: number, stars: number): void {
    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
  }

  showPauseMenu(): void {
    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
  }

  hidePauseMenu(): void {
    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
  }

  updateScore(score: number): void {
    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
  }

  updateTimer(time: number): void {
    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
  }
}