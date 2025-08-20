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
  private scene: any; // Phaser.Scene

  // Cached UI elements so they can be updated or destroyed safely
  private scoreText?: any;
  private timerText?: any;
  private orbText?: any;
  private objectiveTexts: any[] = [];

  // Overlay elements
  private pauseOverlay?: any;
  private pauseText?: any;
  private gameCompleteOverlay?: any;
  private gameCompleteText?: any;

  constructor(scene: any) {
    this.scene = scene;
  }

  /**
   * Update all on-screen UI elements to reflect the current game state.
   * Creates elements on first use and reuses them on subsequent calls.
   */
  updateUI(gameState: GameState): void {
    // Score and timer
    this.updateScore(gameState.score);

    const elapsed = Math.floor(
      (gameState.currentTime - gameState.startTime - gameState.pausedTime) / 1000
    );
    this.updateTimer(elapsed);

    // Orb status
    const collected = gameState.orbs.filter((o) => o.collected).length;
    const total = gameState.orbs.length;
    const orbStatus = `Orbs: ${collected}/${total}`;
    if (!this.orbText) {
      this.orbText = this.scene.add?.text(10, 50, orbStatus);
    } else {
      this.orbText.setText?.(orbStatus);
    }

    // Objective indicators
    const baseX = 10;
    const baseY = 70;
    const spacing = 20;

    // Remove extra objective texts
    while (this.objectiveTexts.length > gameState.objectives.length) {
      const textObj = this.objectiveTexts.pop();
      textObj?.destroy?.();
    }

    gameState.objectives.forEach((obj, index) => {
      const description = `${obj.description}: ${obj.current}/${obj.target}`;
      let textObj = this.objectiveTexts[index];
      if (!textObj) {
        textObj = this.scene.add?.text(baseX, baseY + index * spacing, description);
        this.objectiveTexts[index] = textObj;
      } else {
        textObj.setText?.(description);
      }
    });
  }

  /**
   * Display a simple game completion overlay.
   */
  showGameComplete(score: number, time: number, stars: number): void {
    // Clean up any existing overlay first
    this.gameCompleteOverlay?.destroy?.();
    this.gameCompleteText?.destroy?.();

    const width = this.scene.cameras?.main?.width ?? 800;
    const height = this.scene.cameras?.main?.height ?? 600;

    if (this.scene.add?.rectangle) {
      this.gameCompleteOverlay = this.scene.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0x000000,
        0.5
      );
    } else {
      const g = this.scene.add?.graphics();
      g?.fillStyle?.(0x000000, 0.5);
      g?.fillRect?.(0, 0, width, height);
      this.gameCompleteOverlay = g;
    }

    const text = `Level Complete!\nScore: ${score}\nTime: ${time}\nStars: ${stars}`;
    this.gameCompleteText = this.scene.add?.text(width / 2, height / 2, text, {
      align: 'center',
    });
    this.gameCompleteText?.setOrigin?.(0.5);
  }

  /** Show pause overlay. Subsequent calls have no effect. */
  showPauseMenu(): void {
    if (this.pauseOverlay || this.pauseText) return;

    const width = this.scene.cameras?.main?.width ?? 800;
    const height = this.scene.cameras?.main?.height ?? 600;

    if (this.scene.add?.rectangle) {
      this.pauseOverlay = this.scene.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0x000000,
        0.5
      );
    } else {
      const g = this.scene.add?.graphics();
      g?.fillStyle?.(0x000000, 0.5);
      g?.fillRect?.(0, 0, width, height);
      this.pauseOverlay = g;
    }

    this.pauseText = this.scene.add?.text(width / 2, height / 2, 'Paused', {
      align: 'center',
    });
    this.pauseText?.setOrigin?.(0.5);
  }

  /** Hide pause overlay if it is currently displayed. */
  hidePauseMenu(): void {
    this.pauseOverlay?.destroy?.();
    this.pauseText?.destroy?.();
    this.pauseOverlay = undefined;
    this.pauseText = undefined;
  }

  /** Update only the score text element. */
  updateScore(score: number): void {
    const text = `Score: ${score}`;
    if (!this.scoreText) {
      this.scoreText = this.scene.add?.text(10, 10, text);
    } else {
      this.scoreText.setText?.(text);
    }
  }

  /** Update only the timer text element. */
  updateTimer(time: number): void {
    const text = `Time: ${time}`;
    if (!this.timerText) {
      this.timerText = this.scene.add?.text(10, 30, text);
    } else {
      this.timerText.setText?.(text);
    }
  }
}
