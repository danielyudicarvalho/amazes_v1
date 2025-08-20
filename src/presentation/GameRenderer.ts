// Phaser scene that renders game state
import { GameState } from '../core/types/GameState';
import { GameEventType, EventCallback } from '../core/types/Events';

export interface IGameRenderer {
  /**
   * Renders the current game state
   */
  render(gameState: GameState): void;

  /**
   * Subscribes to game events for rendering updates
   */
  subscribeToEvents(eventEmitter: any): void;

  /**
   * Handles cleanup when renderer is destroyed
   */
  destroy(): void;
}

export class GameRenderer implements IGameRenderer {
  private scene: any; // Will be properly typed with Phaser types
  private mazeGraphics?: any;
  private playerSprite?: any;
  private orbSprites: Map<string, any> = new Map();
  private scoreText?: any;
  private movesText?: any;
  private eventEmitter?: any;
  private subscriptions: { event: GameEventType; callback: EventCallback }[] = [];

  constructor(scene: any) {
    this.scene = scene;
  }

  /**
   * Render the entire game state. This method is typically called once when a
   * level is first loaded or when a full re-render is required. It draws the
   * maze grid, player, collectible orbs and some simple UI information such as
   * score and move count.
   */
  render(gameState: GameState): void {
    const cellSize = 32; // Basic tile size for the grid

    // ----- Draw Maze -----
    if (!this.mazeGraphics) {
      this.mazeGraphics = this.scene.add.graphics();
    }
    const g = this.mazeGraphics;
    g.clear();

    for (let y = 0; y < gameState.maze.length; y++) {
      const row = gameState.maze[y];
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        const px = x * cellSize;
        const py = y * cellSize;

        // floor
        g.fillStyle(0x222222, 1);
        g.fillRect(px, py, cellSize, cellSize);

        // walls - bitfield 1=East,2=South,4=West,8=North
        g.lineStyle(2, 0xffffff, 1);
        if (cell.walls & 8) g.lineBetween(px, py, px + cellSize, py); // north
        if (cell.walls & 1) g.lineBetween(px + cellSize, py, px + cellSize, py + cellSize); // east
        if (cell.walls & 2) g.lineBetween(px, py + cellSize, px + cellSize, py + cellSize); // south
        if (cell.walls & 4) g.lineBetween(px, py, px, py + cellSize); // west
      }
    }

    // ----- Player -----
    const playerPos = gameState.player.position;
    const playerX = playerPos.x * cellSize + cellSize / 2;
    const playerY = playerPos.y * cellSize + cellSize / 2;
    if (!this.playerSprite) {
      // simple rectangle to represent player
      this.playerSprite = this.scene.add.rectangle(
        playerX,
        playerY,
        cellSize * 0.6,
        cellSize * 0.6,
        0x00ff00
      );
      this.playerSprite.setOrigin?.(0.5, 0.5);
    } else {
      this.playerSprite.setPosition
        ? this.playerSprite.setPosition(playerX, playerY)
        : ((this.playerSprite.x = playerX), (this.playerSprite.y = playerY));
    }

    // ----- Orbs -----
    const orbsPresent = new Set<string>();
    for (const orb of gameState.orbs) {
      if (orb.collected) continue;
      orbsPresent.add(orb.id);
      const ox = orb.position.x * cellSize + cellSize / 2;
      const oy = orb.position.y * cellSize + cellSize / 2;
      let sprite = this.orbSprites.get(orb.id);
      if (!sprite) {
        // Use circle if available, otherwise rectangle fallback
        sprite = this.scene.add.circle
          ? this.scene.add.circle(ox, oy, cellSize * 0.25, 0xffff00)
          : this.scene.add.rectangle(ox, oy, cellSize * 0.5, cellSize * 0.5, 0xffff00);
        this.orbSprites.set(orb.id, sprite);
      } else {
        sprite.setPosition
          ? sprite.setPosition(ox, oy)
          : ((sprite.x = ox), (sprite.y = oy));
      }
    }
    // remove orbs that no longer exist (collected)
    for (const [id, sprite] of Array.from(this.orbSprites.entries())) {
      if (!orbsPresent.has(id)) {
        sprite.destroy?.();
        this.orbSprites.delete(id);
      }
    }

    // ----- UI -----
    if (!this.scoreText) {
      this.scoreText = this.scene.add.text(10, 10, `Score: ${gameState.score}`);
    } else {
      this.scoreText.setText(`Score: ${gameState.score}`);
    }

    if (!this.movesText) {
      this.movesText = this.scene.add.text(10, 30, `Moves: ${gameState.moves}`);
    } else {
      this.movesText.setText(`Moves: ${gameState.moves}`);
    }
  }

  /**
   * Subscribe to GameCore events to keep the renderer in sync with state
   * changes. Listeners are stored so they can be removed during destruction to
   * avoid memory leaks.
   */
  subscribeToEvents(eventEmitter: any): void {
    this.eventEmitter = eventEmitter;

    const handlePlayerMoved: EventCallback<'player.moved'> = ({ to, moveCount }) => {
      const cellSize = 32;
      const x = to.x * cellSize + cellSize / 2;
      const y = to.y * cellSize + cellSize / 2;
      if (this.playerSprite) {
        this.playerSprite.setPosition
          ? this.playerSprite.setPosition(x, y)
          : ((this.playerSprite.x = x), (this.playerSprite.y = y));
      }
      if (this.movesText) {
        this.movesText.setText(`Moves: ${moveCount}`);
      }
    };

    const handleOrbCollected: EventCallback<'orb.collected'> = ({ orbId, totalScore }) => {
      const sprite = this.orbSprites.get(orbId);
      if (sprite) {
        sprite.destroy?.();
        this.orbSprites.delete(orbId);
      }
      if (this.scoreText) {
        this.scoreText.setText(`Score: ${totalScore}`);
      }
    };

    eventEmitter.on('player.moved', handlePlayerMoved);
    eventEmitter.on('orb.collected', handleOrbCollected);

    this.subscriptions.push({ event: 'player.moved', callback: handlePlayerMoved as EventCallback });
    this.subscriptions.push({ event: 'orb.collected', callback: handleOrbCollected as EventCallback });
  }

  /**
   * Destroy all Phaser objects and unsubscribe from events to prevent memory
   * leaks. After calling this method the renderer should not be used again.
   */
  destroy(): void {
    this.mazeGraphics?.destroy?.();
    this.mazeGraphics = undefined;

    this.playerSprite?.destroy?.();
    this.playerSprite = undefined;

    for (const sprite of this.orbSprites.values()) {
      sprite.destroy?.();
    }
    this.orbSprites.clear();

    this.scoreText?.destroy?.();
    this.scoreText = undefined;
    this.movesText?.destroy?.();
    this.movesText = undefined;

    if (this.eventEmitter) {
      for (const { event, callback } of this.subscriptions) {
        this.eventEmitter.off(event, callback);
      }
    }
    this.subscriptions = [];
    this.eventEmitter = undefined;
  }
}