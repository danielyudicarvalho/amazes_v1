// Phaser scene that renders game state. This is the JavaScript equivalent of
// the TypeScript implementation and is kept to ensure environments running the
// compiled JavaScript directly have the same behaviour.

export class GameRenderer {
    constructor(scene) {
        this.scene = scene;
        this.mazeGraphics = undefined;
        this.playerSprite = undefined;
        this.orbSprites = new Map();
        this.scoreText = undefined;
        this.movesText = undefined;
        this.eventEmitter = undefined;
        this.subscriptions = [];
    }

    // Renders the entire game state using Phaser primitives
    render(gameState) {
        const cellSize = 32;

        // ----- Maze -----
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

                g.fillStyle(0x222222, 1);
                g.fillRect(px, py, cellSize, cellSize);

                g.lineStyle(2, 0xffffff, 1);
                if (cell.walls & 8)
                    g.lineBetween(px, py, px + cellSize, py);
                if (cell.walls & 1)
                    g.lineBetween(px + cellSize, py, px + cellSize, py + cellSize);
                if (cell.walls & 2)
                    g.lineBetween(px, py + cellSize, px + cellSize, py + cellSize);
                if (cell.walls & 4)
                    g.lineBetween(px, py, px, py + cellSize);
            }
        }

        // ----- Player -----
        const playerPos = gameState.player.position;
        const playerX = playerPos.x * cellSize + cellSize / 2;
        const playerY = playerPos.y * cellSize + cellSize / 2;
        if (!this.playerSprite) {
            this.playerSprite = this.scene.add.rectangle(playerX, playerY, cellSize * 0.6, cellSize * 0.6, 0x00ff00);
            this.playerSprite.setOrigin?.(0.5, 0.5);
        }
        else {
            this.playerSprite.setPosition
                ? this.playerSprite.setPosition(playerX, playerY)
                : ((this.playerSprite.x = playerX), (this.playerSprite.y = playerY));
        }

        // ----- Orbs -----
        const orbsPresent = new Set();
        for (const orb of gameState.orbs) {
            if (orb.collected)
                continue;
            orbsPresent.add(orb.id);
            const ox = orb.position.x * cellSize + cellSize / 2;
            const oy = orb.position.y * cellSize + cellSize / 2;
            let sprite = this.orbSprites.get(orb.id);
            if (!sprite) {
                sprite = this.scene.add.circle
                    ? this.scene.add.circle(ox, oy, cellSize * 0.25, 0xffff00)
                    : this.scene.add.rectangle(ox, oy, cellSize * 0.5, cellSize * 0.5, 0xffff00);
                this.orbSprites.set(orb.id, sprite);
            }
            else {
                sprite.setPosition ? sprite.setPosition(ox, oy) : ((sprite.x = ox), (sprite.y = oy));
            }
        }
        for (const [id, sprite] of Array.from(this.orbSprites.entries())) {
            if (!orbsPresent.has(id)) {
                sprite.destroy?.();
                this.orbSprites.delete(id);
            }
        }

        // ----- UI -----
        if (!this.scoreText) {
            this.scoreText = this.scene.add.text(10, 10, `Score: ${gameState.score}`);
        }
        else {
            this.scoreText.setText(`Score: ${gameState.score}`);
        }
        if (!this.movesText) {
            this.movesText = this.scene.add.text(10, 30, `Moves: ${gameState.moves}`);
        }
        else {
            this.movesText.setText(`Moves: ${gameState.moves}`);
        }
    }

    // Subscribe to GameCore events and update visual elements accordingly
    subscribeToEvents(eventEmitter) {
        this.eventEmitter = eventEmitter;
        const handlePlayerMoved = ({ to, moveCount }) => {
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
        const handleOrbCollected = ({ orbId, totalScore }) => {
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
        this.subscriptions.push({ event: 'player.moved', callback: handlePlayerMoved });
        this.subscriptions.push({ event: 'orb.collected', callback: handleOrbCollected });
    }

    // Clean up Phaser objects and unsubscribe from events
    destroy() {
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

