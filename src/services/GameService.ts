// High-level game operations
import { IGameCore } from '../core/GameCore';
import { ILevelService } from './LevelService';
import { LevelDefinition } from '../core/types/Level';
import { GameState } from '../core/types/GameState';

export interface IGameService {
  /**
   * Initializes a new game with the specified level
   */
  initializeGame(levelId: string): Promise<void>;

  /**
   * Starts the current game
   */
  startGame(): void;

  /**
   * Pauses the current game
   */
  pauseGame(): void;

  /**
   * Resumes the current game
   */
  resumeGame(): void;

  /**
   * Resets the current game
   */
  resetGame(): void;

  /**
   * Gets the current game state
   */
  getGameState(): Readonly<GameState>;

  /**
   * Saves the current game state
   */
  saveGame(): Promise<void>;

  /**
   * Loads a saved game state
   */
  loadGame(saveData: string): Promise<void>;
}

export class GameService implements IGameService {
  private gameCore: IGameCore;
  private levelService: ILevelService;
  private currentLevel: LevelDefinition | null = null;

  constructor(gameCore: IGameCore, levelService: ILevelService) {
    this.gameCore = gameCore;
    this.levelService = levelService;
  }

  async initializeGame(levelId: string): Promise<void> {
    const levelDefinition = await this.levelService.loadLevel(levelId);
    this.currentLevel = levelDefinition;
    this.gameCore.initializeLevel(levelDefinition);
  }

  startGame(): void {
    this.gameCore.startGame();
  }

  pauseGame(): void {
    this.gameCore.pauseGame();
  }

  resumeGame(): void {
    this.gameCore.startGame(); // Resume is same as start for now
  }

  resetGame(): void {
    this.gameCore.resetGame();
  }

  getGameState(): Readonly<GameState> {
    return this.gameCore.getGameState();
  }

  async saveGame(): Promise<void> {
    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
  }

  async loadGame(saveData: string): Promise<void> {
    // Implementation will be added in later tasks
    throw new Error('Not implemented yet');
  }
}