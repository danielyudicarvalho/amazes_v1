import Phaser from 'phaser'
import { GameCore, IGameCore, Direction } from '../core/GameCore'
import { GameState } from '../core/types/GameState'
import { LevelDefinition } from '../core/types/Level'
import { GameEventType } from '../core/types/Events'
import { LevelService } from '../services/LevelService'
import { submitDailyTime } from '../services/leaderboard'
import { shareChallenge } from '../services/share'
import { ProgressManager } from '../managers/ProgressManager'
import { debugLogger } from '../utils/DebugLogger'
import { PlayerSpriteSystem } from '../presentation/PlayerSpriteSystem'
import { SpriteRenderer } from '../presentation/SpriteRenderer'
import { LayerManager } from '../presentation/LayerManager'
import { OrbSpriteSystem } from '../presentation/OrbSpriteSystem'
import { OrbAnimationController } from '../presentation/OrbAnimationController'
import { ParticleEffectManager } from '../presentation/ParticleEffectManager'
import { SpriteFactory } from '../presentation/SpriteFactory'

const CELL = 24

export class GameScene extends Phaser.Scene {
  // Core game engine
  private gameCore!: IGameCore
  private levelService!: LevelService
  private progressManager!: ProgressManager
  
  // Current game state (read-only reference)
  private gameState: Readonly<GameState> | null = null
  
  // Presentation elements
  private player!: Phaser.GameObjects.Circle
  private timerText!: Phaser.GameObjects.Text
  private arrowButtons: { [key: string]: Phaser.GameObjects.Graphics } = {}
  private currentLevel = 1
  private levelText!: Phaser.GameObjects.Text
  private titleText!: Phaser.GameObjects.Text
  private subtitleText!: Phaser.GameObjects.Text
  private orbs: Phaser.GameObjects.Circle[] = []
  private hintText!: Phaser.GameObjects.Text
  private spaceHintText!: Phaser.GameObjects.Text
  
  // Enhanced sprite systems
  private playerSpriteSystem!: PlayerSpriteSystem
  private spriteRenderer!: SpriteRenderer
  private layerManager!: LayerManager
  private orbSpriteSystem!: OrbSpriteSystem
  private orbAnimationController!: OrbAnimationController
  private particleEffectManager!: ParticleEffectManager
  private spriteFactory!: SpriteFactory
  
  // UI state
  private mazeGraphics!: Phaser.GameObjects.Graphics

  constructor() { super('Game') }

  create() {
    debugLogger.scene('Game', 'Game scene created', {
      sceneKey: this.scene.key,
      scaleWidth: this.scale.width,
      scaleHeight: this.scale.height
    });

    // Set beige background
    this.cameras.main.setBackgroundColor('#F5E6D3')

    // Initialize services and managers
    this.gameCore = new GameCore()
    this.levelService = new LevelService()
    this.progressManager = ProgressManager.getInstance()

    // Initialize enhanced sprite systems
    this.initializeSpriteSystem()

    debugLogger.game('Game', 'Core services initialized');

    // Subscribe to core events
    this.subscribeToGameEvents()

    // Get level from registry or use current level
    const selectedLevelId = this.registry.get('selectedLevelId')
    const selectedLevelDefinition = this.registry.get('selectedLevelDefinition')
    
    if (selectedLevelId) {
      debugLogger.game('Game', `Using selected level: ${selectedLevelId}`);
      this.currentLevel = selectedLevelId;
    } else {
      debugLogger.game('Game', 'No selected level, using current level from progress manager');
      this.currentLevel = this.progressManager.getCurrentLevel();
    }

    this.initLevel(selectedLevelDefinition)
  }

  private async initLevel(levelDefinition?: LevelDefinition) {
    try {
      debugLogger.game('Game', `Initializing level: ${this.currentLevel}`, {
        hasPreloadedDefinition: !!levelDefinition
      });

      // Clear previous elements
      this.children.removeAll()
      this.orbs = []

      // Clear input listeners to prevent duplicates
      this.input.off('pointerdown')
      this.input.off('pointermove')

      // Use preloaded level definition or load it
      let finalLevelDefinition: LevelDefinition;
      if (levelDefinition) {
        debugLogger.game('Game', 'Using preloaded level definition');
        finalLevelDefinition = levelDefinition;
      } else {
        debugLogger.game('Game', `Loading level definition for: ${this.currentLevel}`);
        finalLevelDefinition = await this.levelService.loadLevel(this.currentLevel.toString());
      }
      
      // Initialize game core with level
      debugLogger.game('Game', 'Initializing GameCore with level definition', {
        levelId: finalLevelDefinition.id,
        levelName: finalLevelDefinition.metadata.name,
        generationType: finalLevelDefinition.generation.type
      });
      this.gameCore.initializeLevel(finalLevelDefinition)
      
      // Get initial game state
      this.gameState = this.gameCore.getGameState()

      // Create UI based on game state
      this.createUI()
      this.renderGameState()
      this.createArrowButtons()
      this.updateArrowButtons()

      // Set up input handlers
      this.setupInputHandlers()
      
      // Start the game
      this.gameCore.startGame()

    } catch (error) {
      console.error('Failed to initialize level:', error)
      // Could show error UI here
    }
  }

  private subscribeToGameEvents() {
    // Game lifecycle events
    this.gameCore.on('game.initialized', (payload) => {
      this.gameState = payload.state
      console.log('Game initialized for level:', payload.levelDefinition.id)
    })

    this.gameCore.on('game.started', (payload) => {
      console.log('Game started at:', new Date(payload.timestamp))
      // Could add start animation or sound effect here
    })

    this.gameCore.on('game.paused', (payload) => {
      console.log('Game paused after:', payload.duration, 'ms')
      // Could show pause overlay
    })

    this.gameCore.on('game.resumed', (payload) => {
      console.log('Game resumed after pause of:', payload.pausedDuration, 'ms')
      // Could hide pause overlay
    })

    this.gameCore.on('game.completed', (payload) => {
      this.showCompletionUI(payload.result)
    })

    this.gameCore.on('game.failed', (payload) => {
      console.log('Game failed:', payload.reason)
      // Could show failure UI
    })

    // Player action events
    this.gameCore.on('player.moved', (payload) => {
      this.animatePlayerMovement(payload.from, payload.to)
      this.updateArrowButtons()
    })

    this.gameCore.on('player.move.attempted', (payload) => {
      if (payload.blocked) {
        this.showMoveBlockedFeedback(payload.direction, payload.reason)
      }
    })

    // Game object events
    this.gameCore.on('orb.collected', (payload) => {
      this.animateOrbCollection(payload.orbId, payload.position)
      this.updateHintText()
      this.showScorePopup(payload.position, payload.score)
    })

    this.gameCore.on('orb.collection.attempted', (payload) => {
      if (!payload.success) {
        console.log('Orb collection failed:', payload.reason)
      }
    })

    // Objective and progression events
    this.gameCore.on('objective.progress', (payload) => {
      console.log(`Objective ${payload.objectiveId} progress: ${payload.newProgress}/${payload.target}`)
      if (payload.completed) {
        this.showObjectiveCompletedFeedback(payload.objectiveId)
      }
    })

    this.gameCore.on('objective.completed', (payload) => {
      console.log('Objective completed:', payload.objectiveId)
      // Could show objective completion animation
    })

    this.gameCore.on('score.changed', (payload) => {
      console.log(`Score changed: ${payload.previousScore} -> ${payload.newScore} (${payload.change > 0 ? '+' : ''}${payload.change})`)
      // Could animate score counter
    })

    // Level events
    this.gameCore.on('level.loaded', (payload) => {
      console.log('Level loaded:', payload.levelId, payload.result.success ? 'successfully' : 'with errors')
    })

    this.gameCore.on('level.generated', (payload) => {
      console.log(`Level generated in ${payload.generationTime}ms:`, {
        levelId: payload.levelId,
        seed: payload.seed,
        mazeSize: payload.mazeSize,
        orbCount: payload.orbCount
      })
    })

    // State management events
    this.gameCore.on('state.changed', (payload) => {
      this.gameState = payload.state
      this.updateUI()
      
      // Log significant state changes
      const significantChanges = payload.changes.filter(change => 
        ['status', 'score', 'player.position'].includes(change.property)
      )
      if (significantChanges.length > 0) {
        console.log('Significant state changes:', significantChanges)
      }
    })

    this.gameCore.on('state.validated', (payload) => {
      if (!payload.valid) {
        console.warn('State validation failed:', payload.errors)
      }
      if (payload.warnings.length > 0) {
        console.warn('State validation warnings:', payload.warnings)
      }
    })

    // Error and debug events
    this.gameCore.on('error', (payload) => {
      console.error('Game error:', payload.error.message, payload.context)
      this.showErrorFeedback(payload.error.message, payload.recoverable)
    })

    this.gameCore.on('debug', (payload) => {
      if (payload.level === 'error') {
        console.error('[Game Debug]', payload.message, payload.data)
      } else if (payload.level === 'warn') {
        console.warn('[Game Debug]', payload.message, payload.data)
      } else if (payload.level === 'info') {
        console.info('[Game Debug]', payload.message, payload.data)
      } else {
        console.log('[Game Debug]', payload.message, payload.data)
      }
    })
  }

  private createUI() {
    if (!this.gameState) return

    // Back button (top-left corner)
    const backButton = this.add.text(20, 20, '← Back', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#8B7355',
      padding: { x: 12, y: 6 }
    }).setOrigin(0, 0).setInteractive({ useHandCursor: true })

    backButton.on('pointerdown', () => {
      debugLogger.click('Game', 'Back button clicked - returning to level select')
      this.scene.start('LevelSelect')
    })

    // Add hover effect for back button
    backButton.on('pointerover', () => {
      backButton.setStyle({ backgroundColor: '#A0522D' })
    })
    backButton.on('pointerout', () => {
      backButton.setStyle({ backgroundColor: '#8B7355' })
    })

    // Title
    this.titleText = this.add.text(this.scale.width / 2, 50, 'Labyrinth Leap', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '36px',
      color: '#7FB069',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Subtitle
    this.subtitleText = this.add.text(this.scale.width / 2, 80, 'Collect all the orbs and find your way to the goal!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#8B7355'
    }).setOrigin(0.5)

    // Level indicator with dots
    const levelY = 120
    this.add.circle(this.scale.width / 2 - 60, levelY, 12, 0xD2691E).setStrokeStyle(2, 0x8B4513)
    this.levelText = this.add.text(this.scale.width / 2 - 60, levelY, this.currentLevel.toString(), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Level dots (showing progression)
    for (let i = 0; i < 3; i++) {
      const dotColor = i < this.currentLevel - 1 ? 0x7FB069 : 0xD3D3D3
      this.add.circle(this.scale.width / 2 - 20 + i * 20, levelY, 6, dotColor)
    }

    // Timer
    this.timerText = this.add.text(this.scale.width / 2 + 60, levelY, '00:00', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#D2691E',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Pause/Menu button (top-right corner)
    const pauseButton = this.add.text(this.scale.width - 20, 20, '⏸ Menu', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#D2691E',
      padding: { x: 12, y: 6 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })

    pauseButton.on('pointerdown', () => {
      debugLogger.click('Game', 'Pause/Menu button clicked')
      this.showPauseMenu()
    })

    // Add hover effect for pause button
    pauseButton.on('pointerover', () => {
      pauseButton.setStyle({ backgroundColor: '#CD853F' })
    })
    pauseButton.on('pointerout', () => {
      pauseButton.setStyle({ backgroundColor: '#D2691E' })
    })

    // Hint text
    this.hintText = this.add.text(this.scale.width / 2, 150, 'Collect all the orbs to unlock the goal!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#8B7355',
      backgroundColor: '#F0E68C',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5)

    // Space hint at bottom
    this.spaceHintText = this.add.text(this.scale.width / 2, this.scale.height - 40, 'Use arrow buttons or tap to move.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#8B7355'
    }).setOrigin(0.5)
  }

  update(_time: number, dt: number) {
    if (!this.gameState || this.gameState.status !== 'playing') return
    
    // Update timer display using GameCore's time
    const currentTime = this.gameCore.getCurrentTime()
    const minutes = Math.floor(currentTime / 60000)
    const seconds = Math.floor((currentTime % 60000) / 1000)
    this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
  }

  private renderGameState() {
    if (!this.gameState) return

    this.drawMaze()
    this.createPlayer()
    this.createOrbs()
  }

  private updateUI() {
    if (!this.gameState) return
    
    // Update any UI elements that depend on game state
    this.updateHintText()
  }

  private cx(col: number) {
    if (!this.gameState) return 0
    const mazeWidth = this.gameState.maze[0].length * CELL
    const ox = (this.scale.width - mazeWidth) / 2
    return ox + col * CELL + CELL / 2
  }

  private cy(row: number) {
    return 200 + row * CELL + CELL / 2
  }

  private drawMaze() {
    if (!this.gameState) return

    const maze = this.gameState.maze
    const cols = maze[0].length
    const rows = maze.length
    
    // Create maze background (green square)
    const mazeWidth = cols * CELL
    const mazeHeight = rows * CELL
    const ox = (this.scale.width - mazeWidth) / 2
    const oy = 200

    // Green maze background
    this.add.rectangle(ox + mazeWidth / 2, oy + mazeHeight / 2, mazeWidth + 20, mazeHeight + 20, 0x7FB069)
      .setStrokeStyle(4, 0x6B8E5A)

    // Draw maze paths (beige corridors)
    this.mazeGraphics = this.add.graphics()
    this.mazeGraphics.fillStyle(0xF5E6D3)

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = maze[y][x]
        const px = ox + x * CELL
        const py = oy + y * CELL

        // Draw cell floor
        this.mazeGraphics.fillRect(px + 2, py + 2, CELL - 4, CELL - 4)

        // Draw connections to adjacent cells based on walls
        if (cell.walls & 1) this.mazeGraphics.fillRect(px + CELL - 2, py + 2, 4, CELL - 4) // East
        if (cell.walls & 2) this.mazeGraphics.fillRect(px + 2, py + CELL - 2, CELL - 4, 4) // South
        if (cell.walls & 4) this.mazeGraphics.fillRect(px - 2, py + 2, 4, CELL - 4) // West
        if (cell.walls & 8) this.mazeGraphics.fillRect(px + 2, py - 2, CELL - 4, 4) // North
      }
    }
  }

  private createPlayer() {
    if (!this.gameState) return

    const playerPos = this.gameState.player.position
    
    // Create enhanced player sprite using the sprite system
    try {
      const playerSprite = this.playerSpriteSystem.createPlayerSprite(playerPos, {
        theme: 'default',
        scale: 1,
        enableInteraction: true
      })
      
      // Keep the old circle as fallback for now
      this.player = this.add.circle(this.cx(playerPos.x), this.cy(playerPos.y), 8, 0x4169E1)
        .setStrokeStyle(2, 0x1E3A8A)
        .setVisible(false) // Hide the fallback circle since we have the sprite
      
      debugLogger.game('Game', 'Enhanced player sprite created', { position: playerPos })
    } catch (error) {
      console.error('Failed to create enhanced player sprite, using fallback:', error)
      
      // Fallback to original circle
      this.player = this.add.circle(this.cx(playerPos.x), this.cy(playerPos.y), 8, 0x4169E1)
        .setStrokeStyle(2, 0x1E3A8A)
    }
  }

  private createOrbs() {
    if (!this.gameState) return

    // Clear existing orbs
    this.orbs.forEach(orb => orb.destroy())
    this.orbs = []

    try {
      // Use enhanced orb sprite system if available
      if (this.orbSpriteSystem) {
        this.orbSpriteSystem.clearAllOrbs()
        const orbSprites = this.orbSpriteSystem.createOrbSprites(this.gameState.orbs, 'default')
        
        // Convert to legacy orb array for compatibility
        this.orbs = orbSprites.map(sprite => {
          // Create a compatibility wrapper that mimics Circle behavior
          const wrapper = {
            ...sprite,
            destroy: () => sprite.destroy(),
            getData: (key: string) => sprite.getData(key),
            setData: (key: string, value: any) => sprite.setData(key, value)
          } as any
          return wrapper
        })
        
        debugLogger.game('Game', `Created ${orbSprites.length} enhanced orb sprites`)
        return
      }
    } catch (error) {
      console.warn('Failed to create enhanced orb sprites, falling back to basic shapes:', error)
    }

    // Fallback to basic geometric orbs
    const colors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38BA8]

    this.gameState.orbs.forEach((orbState, index) => {
      if (!orbState.collected) {
        const color = colors[index % colors.length]
        const orb = this.add.circle(this.cx(orbState.position.x), this.cy(orbState.position.y), 6, color)
          .setStrokeStyle(2, 0x8B4513)
        orb.setData('orbId', orbState.id)
        this.orbs.push(orb)
      }
    })
  }

  private createArrowButtons() {
    const centerX = this.scale.width / 2
    const bottomY = this.scale.height - 100
    const buttonSize = 40
    const spacing = 60

    // Create button backgrounds and arrows
    const buttonStyle = { fillStyle: 0xF5E6D3, lineStyle: { width: 2, color: 0xD2B48C } }

    // Up arrow
    this.arrowButtons.up = this.add.graphics(buttonStyle)
    this.arrowButtons.up.fillRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8)
    this.arrowButtons.up.strokeRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8)
    this.arrowButtons.up.fillStyle(0x8B7355)
    this.arrowButtons.up.fillTriangle(0, -8, -6, 6, 6, 6)
    this.arrowButtons.up.setPosition(centerX, bottomY - spacing)
    this.arrowButtons.up.setInteractive(new Phaser.Geom.Rectangle(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains)
    this.arrowButtons.up.on('pointerup', () => this.handleButtonMove('up'))

    // Down arrow
    this.arrowButtons.down = this.add.graphics(buttonStyle)
    this.arrowButtons.down.fillRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8)
    this.arrowButtons.down.strokeRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8)
    this.arrowButtons.down.fillStyle(0x8B7355)
    this.arrowButtons.down.fillTriangle(0, 8, -6, -6, 6, -6)
    this.arrowButtons.down.setPosition(centerX, bottomY + spacing)
    this.arrowButtons.down.setInteractive(new Phaser.Geom.Rectangle(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains)
    this.arrowButtons.down.on('pointerup', () => this.handleButtonMove('down'))

    // Left arrow
    this.arrowButtons.left = this.add.graphics(buttonStyle)
    this.arrowButtons.left.fillRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8)
    this.arrowButtons.left.strokeRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8)
    this.arrowButtons.left.fillStyle(0x8B7355)
    this.arrowButtons.left.fillTriangle(-8, 0, 6, -6, 6, 6)
    this.arrowButtons.left.setPosition(centerX - spacing, bottomY)
    this.arrowButtons.left.setInteractive(new Phaser.Geom.Rectangle(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains)
    this.arrowButtons.left.on('pointerup', () => this.handleButtonMove('left'))

    // Right arrow
    this.arrowButtons.right = this.add.graphics(buttonStyle)
    this.arrowButtons.right.fillRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8)
    this.arrowButtons.right.strokeRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8)
    this.arrowButtons.right.fillStyle(0x8B7355)
    this.arrowButtons.right.fillTriangle(8, 0, -6, -6, -6, 6)
    this.arrowButtons.right.setPosition(centerX + spacing, bottomY)
    this.arrowButtons.right.setInteractive(new Phaser.Geom.Rectangle(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains)
    this.arrowButtons.right.on('pointerup', () => this.handleButtonMove('right'))

    // Center button (for dropping orbs)
    const centerButton = this.add.graphics(buttonStyle)
    centerButton.fillRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8)
    centerButton.strokeRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8)
    centerButton.fillStyle(0xD2691E)
    centerButton.fillCircle(0, 0, 6)
    centerButton.setPosition(centerX, bottomY)
    centerButton.setInteractive(new Phaser.Geom.Rectangle(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains)
    centerButton.on('pointerup', () => this.dropOrb())
  }

  private dropOrb() {
    // Placeholder for orb dropping functionality - could be implemented later
    console.log('Drop orb at current position')
  }

  private setupInputHandlers() {
    // Set up pointer input handlers that delegate to GameCore
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.handlePointerInput(p.worldX, p.worldY))
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { 
      if (p.isDown) this.handlePointerInput(p.worldX, p.worldY) 
    })

    // Set up keyboard input handlers
    this.setupKeyboardInput()
  }

  private setupKeyboardInput() {
    // Create keyboard input handlers
    const cursors = this.input.keyboard?.createCursorKeys()
    const wasdKeys = this.input.keyboard?.addKeys('W,S,A,D')
    
    if (cursors) {
      // Arrow keys
      cursors.up?.on('down', () => this.handlePlayerMove('up'))
      cursors.down?.on('down', () => this.handlePlayerMove('down'))
      cursors.left?.on('down', () => this.handlePlayerMove('left'))
      cursors.right?.on('down', () => this.handlePlayerMove('right'))
    }

    if (wasdKeys) {
      // WASD keys
      wasdKeys.W?.on('down', () => this.handlePlayerMove('up'))
      wasdKeys.S?.on('down', () => this.handlePlayerMove('down'))
      wasdKeys.A?.on('down', () => this.handlePlayerMove('left'))
      wasdKeys.D?.on('down', () => this.handlePlayerMove('right'))
    }

    // Add pause/resume functionality
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    const escapeKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    
    spaceKey?.on('down', () => this.handlePauseToggle())
    escapeKey?.on('down', () => this.handlePauseToggle())

    // Add reset functionality
    const rKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    rKey?.on('down', () => this.handleReset())
  }

  private handlePauseToggle() {
    if (!this.gameCore || !this.gameState) return

    try {
      if (this.gameState.status === 'playing') {
        this.gameCore.pauseGame()
        console.log('Game paused')
      } else if (this.gameState.status === 'paused') {
        this.gameCore.resumeGame()
        console.log('Game resumed')
      }
    } catch (error) {
      console.error('Error toggling pause:', error)
      this.showErrorFeedback('Failed to pause/resume game', true)
    }
  }

  private handleReset() {
    if (!this.gameCore) return

    try {
      this.gameCore.resetGame()
      console.log('Game reset')
    } catch (error) {
      console.error('Error resetting game:', error)
      this.showErrorFeedback('Failed to reset game', true)
    }
  }

  private handleButtonMove(direction: Direction) {
    // Add visual feedback for button press
    const buttonKey = direction === 'up' ? 'up' : 
                     direction === 'down' ? 'down' : 
                     direction === 'left' ? 'left' : 'right'
    
    const button = this.arrowButtons[buttonKey]
    if (button) {
      // Brief scale animation to show button press
      this.tweens.add({
        targets: button,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      })
    }

    // Delegate to the main move handler
    this.handlePlayerMove(direction)
  }

  private handlePlayerMove(direction: Direction) {
    if (!this.gameCore || !this.gameState) {
      console.warn('Cannot move player: game not initialized')
      return
    }

    // Check if game is in a state where moves are allowed
    if (this.gameState.status !== 'playing') {
      console.log('Move ignored: game not in playing state')
      return
    }
    
    try {
      const result = this.gameCore.movePlayer(direction)
      
      if (!result.success) {
        // Show visual feedback for invalid moves
        this.showMoveBlockedFeedback(this.directionToCardinal(direction), result.reason)
        console.log('Move failed:', result.reason)
      } else {
        // Move was successful - the core will emit events that we'll handle
        console.log(`Player moved ${direction} to position (${result.newPosition.x}, ${result.newPosition.y})`)
      }
    } catch (error) {
      console.error('Error during player move:', error)
      this.showErrorFeedback('Failed to move player', true)
    }
  }

  private directionToCardinal(direction: Direction): string {
    switch (direction) {
      case 'up': return 'north'
      case 'down': return 'south'
      case 'left': return 'west'
      case 'right': return 'east'
      default: return 'unknown'
    }
  }

  private handlePointerInput(worldX: number, worldY: number) {
    if (!this.gameState) {
      console.warn('Cannot handle pointer input: game state not available')
      return
    }

    // Validate game state
    if (this.gameState.status !== 'playing') {
      console.log('Pointer input ignored: game not in playing state')
      return
    }

    try {
      const maze = this.gameState.maze
      if (!maze || maze.length === 0 || !maze[0]) {
        console.error('Invalid maze data')
        return
      }

      const cols = maze[0].length
      const rows = maze.length
      const mazeWidth = cols * CELL
      const ox = (this.scale.width - mazeWidth) / 2
      const oy = 200

      // Convert world coordinates to grid coordinates
      const col = Math.floor((worldX - ox) / CELL)
      const row = Math.floor((worldY - oy) / CELL)
      
      // Validate grid coordinates
      if (col < 0 || row < 0 || col >= cols || row >= rows) {
        console.log('Pointer input outside maze bounds')
        return
      }

      const playerPos = this.gameState.player.position
      const dx = col - playerPos.x
      const dy = row - playerPos.y
      
      // Only allow moves to adjacent cells
      if (Math.abs(dx) + Math.abs(dy) !== 1) {
        console.log('Pointer input not adjacent to player')
        return
      }

      // Convert to direction and validate
      let direction: Direction
      if (dx === 1) direction = 'right'
      else if (dx === -1) direction = 'left'
      else if (dy === 1) direction = 'down'
      else if (dy === -1) direction = 'up'
      else {
        console.error('Invalid direction calculation')
        return
      }

      // Delegate to GameCore with proper error handling
      this.handlePlayerMove(direction)
      
    } catch (error) {
      console.error('Error handling pointer input:', error)
      this.showErrorFeedback('Input handling error', true)
    }
  }

  private updateArrowButtons() {
    if (!this.gameState) return

    const playerPos = this.gameState.player.position
    const cell = this.gameState.maze[playerPos.y][playerPos.x]

    // Check each direction and enable/disable arrows based on walls
    this.arrowButtons.up.setAlpha((cell.walls & 8) ? 1 : 0.4)    // North
    this.arrowButtons.down.setAlpha((cell.walls & 2) ? 1 : 0.4)  // South
    this.arrowButtons.left.setAlpha((cell.walls & 4) ? 1 : 0.4)  // West
    this.arrowButtons.right.setAlpha((cell.walls & 1) ? 1 : 0.4) // East
  }

  private async animatePlayerMovement(from: { x: number, y: number }, to: { x: number, y: number }) {
    if (!this.player) return
    
    // Try to use enhanced sprite system for movement animation
    try {
      // Determine direction for animation
      const direction = this.getMovementDirection(from, to)
      
      if (direction && this.playerSpriteSystem) {
        // Use enhanced sprite system with directional animation
        await this.playerSpriteSystem.movePlayer(direction, from, to)
        debugLogger.game('Game', 'Enhanced player movement animation completed', { from, to, direction })
      } else {
        throw new Error('Direction calculation failed or sprite system unavailable')
      }
    } catch (error) {
      console.warn('Enhanced player animation failed, using fallback:', error)
      
      // Fallback to original circle animation
      this.tweens.add({ 
        targets: this.player, 
        x: this.cx(to.x), 
        y: this.cy(to.y), 
        duration: 150 
      })
    }
  }

  private async animateOrbCollection(orbId: string, position: { x: number, y: number }) {
    try {
      // Use enhanced orb sprite system if available
      if (this.orbSpriteSystem) {
        await this.orbSpriteSystem.animateOrbCollection(orbId, {
          animationDuration: 500,
          particleCount: 20,
          scaleEffect: true,
          fadeEffect: true,
          soundSync: true
        })
        
        // Remove from legacy orb array
        const orbIndex = this.orbs.findIndex(orb => orb.getData('orbId') === orbId)
        if (orbIndex >= 0) {
          this.orbs.splice(orbIndex, 1)
        }
        
        debugLogger.game('Game', `Enhanced orb collection animation completed for ${orbId}`)
        return
      }
    } catch (error) {
      console.warn('Failed to animate enhanced orb collection, falling back to basic animation:', error)
    }

    // Fallback to basic orb collection animation
    const orbIndex = this.orbs.findIndex(orb => orb.getData('orbId') === orbId)
    if (orbIndex >= 0) {
      const orb = this.orbs[orbIndex]
      
      // Animate orb collection
      this.tweens.add({
        targets: orb,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          orb.destroy()
        }
      })
      
      this.orbs.splice(orbIndex, 1)
    }
  }

  private updateHintText() {
    if (!this.gameState || !this.hintText) return

    const collectedOrbs = this.gameState.orbs.filter(orb => orb.collected).length
    const totalOrbs = this.gameState.orbs.length

    if (collectedOrbs >= totalOrbs) {
      this.hintText.setText('All orbs collected! Find the goal!')
      this.hintText.setStyle({ backgroundColor: '#90EE90' })
    } else {
      this.hintText.setText(`Collect all orbs to unlock the goal! (${collectedOrbs}/${totalOrbs})`)
      this.hintText.setStyle({ backgroundColor: '#F0E68C' })
    }
  }

  private showCompletionUI(result: any) {
    const timeMs = this.gameCore.getCurrentTime()
    const currentLevelDefinition = this.gameCore.getCurrentLevelDefinition()

    // Show completion message
    this.add.text(this.scale.width / 2, this.scale.height / 2 - 60,
      `Level Complete!`,
      { fontFamily: 'Arial, sans-serif', fontSize: '24px', color: '#7FB069', backgroundColor: '#F5E6D3', padding: { x: 20, y: 10 } }
    ).setOrigin(0.5)

    // Show level name
    if (currentLevelDefinition) {
      this.add.text(this.scale.width / 2, this.scale.height / 2 - 30,
        currentLevelDefinition.metadata.name,
        { fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#8B7355', backgroundColor: '#F5E6D3', padding: { x: 15, y: 5 } }
      ).setOrigin(0.5)
    }

    const minutes = Math.floor(timeMs / 60000)
    const seconds = Math.floor((timeMs % 60000) / 1000)
    this.add.text(this.scale.width / 2, this.scale.height / 2,
      `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      { fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#8B7355', backgroundColor: '#F5E6D3', padding: { x: 15, y: 8 } }
    ).setOrigin(0.5)

    // Show score if available
    if (result && result.score !== undefined) {
      this.add.text(this.scale.width / 2, this.scale.height / 2 + 30,
        `Score: ${result.score}`,
        { fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#8B7355', backgroundColor: '#F5E6D3', padding: { x: 15, y: 8 } }
      ).setOrigin(0.5)
    }

    // Add continue button
    const continueButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 70,
      'Continue',
      { fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#FFFFFF', backgroundColor: '#7FB069', padding: { x: 20, y: 10 } }
    ).setOrigin(0.5).setInteractive({ useHandCursor: true })

    continueButton.on('pointerdown', () => {
      this.handleLevelCompletion(currentLevelDefinition)
    })

    // Submit time in background
    submitDailyTime(timeMs).catch(() => { })

    // Auto-advance after 5 seconds if no interaction
    this.time.delayedCall(5000, () => {
      if (continueButton.active) {
        this.handleLevelCompletion(currentLevelDefinition)
      }
    })
  }

  private async handleLevelCompletion(currentLevelDefinition: LevelDefinition | null) {
    try {
      if (!currentLevelDefinition) {
        debugLogger.error('Game', 'No current level definition for completion handling')
        this.scene.start('LevelSelect')
        return
      }

      // Update progress
      const timeMs = this.gameCore.getCurrentTime()
      this.progressManager.completeLevel(currentLevelDefinition.id, timeMs, 3) // Assuming 3 stars for now

      // Check if there's a next level to unlock
      const unlockedLevels = currentLevelDefinition.progression.unlocks
      if (unlockedLevels && unlockedLevels.length > 0) {
        const nextLevelId = unlockedLevels[0] // Take the first unlocked level
        debugLogger.game('Game', `Advancing to next level: ${nextLevelId}`)
        
        try {
          // Load and start the next level
          const nextLevelDefinition = await this.levelService.loadLevel(nextLevelId)
          this.registry.set('selectedLevelId', nextLevelId)
          this.registry.set('selectedLevelDefinition', nextLevelDefinition)
          this.scene.restart()
        } catch (error) {
          debugLogger.error('Game', `Failed to load next level: ${nextLevelId}`, error)
          this.scene.start('LevelSelect')
        }
      } else {
        // No more levels, return to level select
        debugLogger.game('Game', 'No more levels available, returning to level select')
        this.scene.start('LevelSelect')
      }
    } catch (error) {
      debugLogger.error('Game', 'Error handling level completion', error)
      this.scene.start('LevelSelect')
    }
  }

  private showMoveBlockedFeedback(direction: string, reason?: string) {
    // Visual feedback for blocked moves - could shake the player or show a brief red flash
    if (this.player) {
      this.tweens.add({
        targets: this.player,
        x: this.player.x + (direction === 'east' ? 5 : direction === 'west' ? -5 : 0),
        y: this.player.y + (direction === 'south' ? 5 : direction === 'north' ? -5 : 0),
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      })
    }
  }

  private showPauseMenu() {
    // Pause the game
    if (this.gameCore.getGameState().status === 'playing') {
      this.gameCore.pauseGame()
    }

    // Create semi-transparent overlay
    const overlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.7)
    overlay.setData('isPauseMenu', true)

    // Create pause menu container
    const menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2)
    menuContainer.setData('isPauseMenu', true)

    // Menu background
    const menuBg = this.add.rectangle(0, 0, 280, 320, 0xF5E6D3, 1).setStrokeStyle(3, 0x8B7355)
    menuContainer.add(menuBg)

    // Menu title
    const menuTitle = this.add.text(0, -120, 'Game Paused', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#7FB069',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    menuContainer.add(menuTitle)

    // Resume button
    const resumeButton = this.add.text(0, -60, 'Resume', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
      backgroundColor: '#7FB069',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    resumeButton.on('pointerdown', () => {
      this.hidePauseMenu()
      this.gameCore.resumeGame()
    })
    menuContainer.add(resumeButton)

    // Restart button
    const restartButton = this.add.text(0, -10, 'Restart Level', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
      backgroundColor: '#D2691E',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    restartButton.on('pointerdown', () => {
      this.hidePauseMenu()
      this.gameCore.resetGame()
    })
    menuContainer.add(restartButton)

    // Level Select button
    const levelSelectButton = this.add.text(0, 40, 'Level Select', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
      backgroundColor: '#8B7355',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    levelSelectButton.on('pointerdown', () => {
      this.hidePauseMenu()
      this.scene.start('LevelSelect')
    })
    menuContainer.add(levelSelectButton)

    // Add hover effects
    const buttons = [resumeButton, restartButton, levelSelectButton]
    const hoverColors = ['#8FD17A', '#E6A85C', '#A0522D']
    const originalColors = ['#7FB069', '#D2691E', '#8B7355']

    buttons.forEach((button, index) => {
      button.on('pointerover', () => {
        button.setStyle({ backgroundColor: hoverColors[index] })
      })
      button.on('pointerout', () => {
        button.setStyle({ backgroundColor: originalColors[index] })
      })
    })
  }

  private hidePauseMenu() {
    // Remove all pause menu elements
    this.children.list.forEach(child => {
      if (child.getData('isPauseMenu')) {
        child.destroy()
      }
    })
  }

  private showScorePopup(position: { x: number, y: number }, score: number) {
    // Show floating score text
    const scoreText = this.add.text(this.cx(position.x), this.cy(position.y), `+${score}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Animate score popup
    this.tweens.add({
      targets: scoreText,
      y: scoreText.y - 30,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => scoreText.destroy()
    })
  }

  private showObjectiveCompletedFeedback(objectiveId: string) {
    // Show brief objective completion message
    const message = this.add.text(this.scale.width / 2, 180, 'Objective Complete!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#7FB069',
      backgroundColor: '#F5E6D3',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5)

    // Fade out after 2 seconds
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: message,
        alpha: 0,
        duration: 500,
        onComplete: () => message.destroy()
      })
    })
  }

  private showErrorFeedback(errorMessage: string, recoverable: boolean) {
    // Show error message to user
    const color = recoverable ? '#FFA500' : '#FF0000' // Orange for recoverable, red for fatal
    const message = this.add.text(this.scale.width / 2, this.scale.height - 80, 
      recoverable ? 'Warning: ' + errorMessage : 'Error: ' + errorMessage, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: color,
      backgroundColor: '#F5E6D3',
      padding: { x: 8, y: 4 },
      wordWrap: { width: this.scale.width - 40 }
    }).setOrigin(0.5)

    // Auto-hide after 5 seconds
    this.time.delayedCall(5000, () => {
      if (message && message.active) {
        this.tweens.add({
          targets: message,
          alpha: 0,
          duration: 500,
          onComplete: () => message.destroy()
        })
      }
    })
  }

  private initializeSpriteSystem() {
    try {
      // Initialize layer manager for proper rendering order
      this.layerManager = new LayerManager(this)
      
      // Initialize sprite renderer
      this.spriteRenderer = new SpriteRenderer(this)
      
      // Initialize sprite factory
      this.spriteFactory = new SpriteFactory({
        scene: this,
        defaultTheme: 'default',
        cellSize: CELL
      })
      
      // Initialize orb animation controller
      this.orbAnimationController = new OrbAnimationController(this)
      
      // Initialize particle effect manager
      this.particleEffectManager = new ParticleEffectManager(this)
      
      // Initialize orb sprite system
      this.orbSpriteSystem = new OrbSpriteSystem(
        this,
        this.spriteFactory,
        this.orbAnimationController,
        this.particleEffectManager
      )
      
      // Initialize player sprite system
      this.playerSpriteSystem = new PlayerSpriteSystem({
        scene: this,
        gameCore: this.gameCore,
        spriteRenderer: this.spriteRenderer,
        layerManager: this.layerManager
      })
      
      debugLogger.game('Game', 'Enhanced sprite systems initialized')
    } catch (error) {
      console.error('Failed to initialize sprite systems:', error)
      // Continue without enhanced sprites - fallback to basic shapes
    }
  }

  private getMovementDirection(from: { x: number, y: number }, to: { x: number, y: number }): Direction | null {
    const dx = to.x - from.x
    const dy = to.y - from.y
    
    // Only allow single-cell movements
    if (Math.abs(dx) + Math.abs(dy) !== 1) {
      return null
    }
    
    if (dx === 1) return 'right'
    if (dx === -1) return 'left'
    if (dy === 1) return 'down'
    if (dy === -1) return 'up'
    
    return null
  }

  // Cleanup method to unsubscribe from events when scene is destroyed
  destroy() {
    // Clean up sprite systems
    if (this.playerSpriteSystem) {
      this.playerSpriteSystem.destroy()
    }
    
    if (this.orbSpriteSystem) {
      this.orbSpriteSystem.clearAllOrbs()
    }
    
    if (this.orbAnimationController) {
      this.orbAnimationController.destroy()
    }
    
    if (this.particleEffectManager) {
      this.particleEffectManager.destroy()
    }
    
    if (this.layerManager) {
      this.layerManager.destroy()
    }
    
    if (this.spriteRenderer) {
      this.spriteRenderer.destroy()
    }
    
    if (this.gameCore) {
      // Use removeAllListeners if available, otherwise we'd need to store individual callbacks
      // For now, we'll rely on the scene being destroyed to clean up references
      console.log('GameScene destroyed, cleaning up event listeners')
    }
    
    super.destroy()
  }
}