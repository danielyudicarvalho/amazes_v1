import { describe, it, expect } from 'vitest';
import { GameService } from './GameService';
import { IGameCore, Direction } from '../core/GameCore';
import { LevelDefinition } from '../core/types/Level';
import { GameState, Player, PlayerStats } from '../core/types/GameState';

class MockGameCore implements IGameCore {
  public gameState: GameState;
  public startCalls = 0;
  public resumeCalls = 0;
  public pauseCalls = 0;

  constructor() {
    const playerStats: PlayerStats = {
      totalMoves: 0,
      orbsCollected: 0,
      timeElapsed: 0,
      powerupsUsed: 0,
      hintsUsed: 0,
    };

    const player: Player = {
      position: { x: 0, y: 0 },
      inventory: [],
      stats: playerStats,
      activePowerups: [],
    };

    this.gameState = {
      levelId: 'test',
      levelConfig: {} as LevelDefinition,
      status: 'initializing',
      startTime: 0,
      currentTime: 0,
      pausedTime: 0,
      player,
      maze: [],
      orbs: [],
      powerups: [],
      objectives: [],
      score: 0,
      moves: 0,
      hintsUsed: 0,
      version: 1,
    };
  }

  initializeLevel(levelDefinition: LevelDefinition): void {
    this.gameState.levelConfig = levelDefinition;
    this.gameState.levelId = levelDefinition.id;
  }

  startGame(): void {
    this.startCalls++;
    this.gameState.status = 'playing';
  }

  pauseGame(): void {
    this.pauseCalls++;
    this.gameState.status = 'paused';
  }

  resumeGame(): void {
    this.resumeCalls++;
    this.gameState.status = 'playing';
  }

  resetGame(): void {
    this.gameState.status = 'initializing';
  }

  movePlayer(direction: Direction) {
    return { success: true } as any;
  }

  collectOrb(orbId: string) {
    return { success: true } as any;
  }

  getGameState(): Readonly<GameState> {
    return this.gameState;
  }

  isGameComplete(): boolean {
    return false;
  }

  getScore(): number {
    return 0;
  }

  getCurrentTime(): number {
    return 0;
  }

  on(): void {}
  off(): void {}
  once(): void {}
}

describe('GameService', () => {
  it('maintains state when paused and resumed', () => {
    const core = new MockGameCore();
    const service = new GameService(core, {} as any);

    service.startGame();
    core.gameState.moves = 5;

    service.pauseGame();
    expect(core.gameState.status).toBe('paused');

    service.resumeGame();
    expect(core.gameState.status).toBe('playing');
    expect(core.gameState.moves).toBe(5);
    expect(core.startCalls).toBe(1);
    expect(core.resumeCalls).toBe(1);
  });
});
