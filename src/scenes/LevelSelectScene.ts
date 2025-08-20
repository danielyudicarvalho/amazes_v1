import Phaser from 'phaser'
import { ProgressManager } from '../managers/ProgressManager'
import { LevelService } from '../services/LevelService'
import { LevelDefinition } from '../core/types/Level'

export class LevelSelectScene extends Phaser.Scene {
  private progressManager!: ProgressManager
  private levelService!: LevelService
  private currentPage = 0
  private readonly LEVELS_PER_PAGE = 20
  private availableLevels: string[] = []
  private levelMetadata: Map<string, LevelDefinition> = new Map()
  private loadingText?: Phaser.GameObjects.Text
  private errorText?: Phaser.GameObjects.Text

  constructor() {
    super('LevelSelect')
  }

  async create() {
    this.progressManager = ProgressManager.getInstance()
    this.levelService = new LevelService()

    // Set background
    this.cameras.main.setBackgroundColor('#F5E6D3')

    // Show loading state
    this.showLoading()

    try {
      // Load available levels
      await this.loadAvailableLevels()

      // Create UI after levels are loaded
      this.hideLoading()
      this.createUI()
      this.createLevelGrid()
    } catch (error) {
      this.hideLoading()
      this.showError(`Failed to load levels: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async loadAvailableLevels() {
    try {
      console.log('🔍 Loading available levels...')
      // Get list of available levels
      this.availableLevels = await this.levelService.listAvailableLevels()
      console.log(`✅ Found ${this.availableLevels.length} levels:`, this.availableLevels)

      // Preload level metadata for the current page
      await this.preloadLevelMetadata()
      console.log('✅ Level metadata preloaded')
    } catch (error) {
      console.error('❌ Failed to load available levels:', error)
      throw error
    }
  }

  private async preloadLevelMetadata() {
    const startIndex = this.currentPage * this.LEVELS_PER_PAGE
    const endIndex = Math.min(startIndex + this.LEVELS_PER_PAGE, this.availableLevels.length)
    const levelsToLoad = this.availableLevels.slice(startIndex, endIndex)

    try {
      const levelDefinitions = await this.levelService.loadLevels(levelsToLoad, {
        validateSchema: false, // Skip validation for performance
        includeMetadata: true
      })

      // Store metadata for quick access
      levelDefinitions.forEach(level => {
        this.levelMetadata.set(level.id, level)
      })
    } catch (error) {
      console.warn('Failed to preload some level metadata:', error)
      // Continue with available data
    }
  }

  private showLoading() {
    this.loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Loading levels...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#7FB069',
      fontStyle: 'bold'
    }).setOrigin(0.5)
  }

  private hideLoading() {
    if (this.loadingText) {
      this.loadingText.destroy()
      this.loadingText = undefined
    }
  }

  private showError(message: string) {
    this.errorText = this.add.text(this.scale.width / 2, this.scale.height / 2, message, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FF6B6B',
      fontStyle: 'bold',
      wordWrap: { width: this.scale.width - 100 }
    }).setOrigin(0.5)

    // Add retry button
    this.add.text(this.scale.width / 2, this.scale.height / 2 + 60, 'Tap to retry', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#7FB069',
      fontStyle: 'bold'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.restart())
  }

  private createUI() {
    // Title
    this.add.text(this.scale.width / 2, 50, 'Select Level', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#7FB069',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Player stats
    const stats = this.progressManager.getPlayStats()
    const totalStars = this.progressManager.getTotalStars()
    const totalCoins = this.progressManager.getTotalCoins()
    this.add.text(this.scale.width / 2, 90,
      `Levels: ${this.availableLevels.length} | Stars: ${totalStars} | Coins: ${totalCoins}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#8B7355'
    }).setOrigin(0.5)

    // Navigation buttons
    if (this.currentPage > 0) {
      this.add.text(50, this.scale.height / 2, '◀', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#7FB069'
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerup', () => this.previousPage())
    }

    const maxPage = Math.floor(this.availableLevels.length / this.LEVELS_PER_PAGE)
    if (this.currentPage < maxPage) {
      this.add.text(this.scale.width - 50, this.scale.height / 2, '▶', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#7FB069'
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerup', () => this.nextPage())
    }
  }

  private createLevelGrid() {
    const startIndex = this.currentPage * this.LEVELS_PER_PAGE
    const endIndex = Math.min(startIndex + this.LEVELS_PER_PAGE, this.availableLevels.length)
    const levelsOnPage = this.availableLevels.slice(startIndex, endIndex)

    const cols = 5
    const rows = 4
    const buttonSize = 60
    const spacing = 70
    const startX = (this.scale.width - (cols - 1) * spacing) / 2
    const startY = 150

    levelsOnPage.forEach((levelId, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)

      const x = startX + col * spacing
      const y = startY + row * spacing

      this.createLevelButton(levelId, x, y, buttonSize)
    })
  }

  private createLevelButton(levelId: string, x: number, y: number, size: number) {
    const isUnlocked = this.progressManager.isLevelUnlocked(levelId)
    const stats = this.progressManager.getLevelStats(levelId)
    const levelMetadata = this.levelMetadata.get(levelId)

    // Button background - use difficulty color if available
    let color = isUnlocked ? (stats?.completed ? 0x7FB069 : 0xF5E6D3) : 0xD3D3D3
    if (levelMetadata && isUnlocked) {
      const difficultyColors = {
        easy: 0x7FB069,
        medium: 0xF4A261,
        hard: 0xE76F51,
        expert: 0x9D4EDD
      }
      color = stats?.completed ? difficultyColors[levelMetadata.metadata.difficulty] : 0xF5E6D3
    }

    const button = this.add.circle(x, y, size / 2, color)
      .setStrokeStyle(3, isUnlocked ? 0x6B8E5A : 0xA9A9A9)

    // Level display name or number
    const displayText = this.getLevelDisplayText(levelId, levelMetadata)
    this.add.text(x, y - 8, displayText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: isUnlocked ? '#FFFFFF' : '#808080',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Difficulty indicator (small text below level name)
    if (levelMetadata && isUnlocked) {
      this.add.text(x, y + 8, levelMetadata.metadata.difficulty.charAt(0).toUpperCase(), {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: isUnlocked ? '#FFFFFF' : '#808080'
      }).setOrigin(0.5)
    }

    // Stars (if completed)
    if (stats?.completed && stats.stars > 0) {
      for (let i = 0; i < stats.stars; i++) {
        this.add.text(x - 15 + i * 15, y + 20, '★', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '10px',
          color: '#FFD700'
        }).setOrigin(0.5)
      }
    }

    // Make interactive if unlocked
    if (isUnlocked) {
      button.setInteractive({ useHandCursor: true })
        .on('pointerup', () => this.selectLevel(levelId))
        .on('pointerover', () => this.showLevelTooltip(levelId, x, y))
        .on('pointerout', () => this.hideLevelTooltip())
    }
  }

  private getLevelDisplayText(levelId: string, metadata?: LevelDefinition): string {
    if (metadata?.metadata.name) {
      // Use first few characters of level name
      return metadata.metadata.name.length > 8
        ? metadata.metadata.name.substring(0, 6) + '...'
        : metadata.metadata.name
    }

    // Extract number from level ID if possible
    const match = levelId.match(/(\d+)/)
    if (match) {
      return match[1]
    }

    // Fallback to first few characters of ID
    return levelId.length > 6 ? levelId.substring(0, 6) : levelId
  }

  private showLevelTooltip(levelId: string, x: number, y: number) {
    const metadata = this.levelMetadata.get(levelId)
    if (!metadata) return

    const tooltipText = `${metadata.metadata.name}\n${metadata.metadata.difficulty} • ${metadata.metadata.estimatedTime}s`

    // Create tooltip background
    const tooltip = this.add.rectangle(x, y - 80, 120, 40, 0x000000, 0.8)
      .setStrokeStyle(1, 0xFFFFFF)

    // Create tooltip text
    const text = this.add.text(x, y - 80, tooltipText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5)

    // Store references for cleanup
    tooltip.setData('isTooltip', true)
    text.setData('isTooltip', true)
  }

  private hideLevelTooltip() {
    // Remove all tooltip elements
    this.children.list.forEach(child => {
      if (child.getData('isTooltip')) {
        child.destroy()
      }
    })
  }

  private async selectLevel(levelId: string) {
    try {
      // Load the full level definition
      const levelDefinition = await this.levelService.loadLevel(levelId)

      // Store selected level data and start game
      this.registry.set('selectedLevelId', levelId)
      this.registry.set('selectedLevelDefinition', levelDefinition)
      this.scene.start('Game')
    } catch (error) {
      console.error('Failed to load level:', error)
      this.showError(`Failed to load level: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--
      await this.refreshPage()
    }
  }

  private async nextPage() {
    const maxPage = Math.floor(this.availableLevels.length / this.LEVELS_PER_PAGE)
    if (this.currentPage < maxPage) {
      this.currentPage++
      await this.refreshPage()
    }
  }

  private async refreshPage() {
    // Clear current display
    this.children.removeAll()

    // Show loading
    this.showLoading()

    try {
      // Preload metadata for new page
      await this.preloadLevelMetadata()

      // Recreate UI
      this.hideLoading()
      this.createUI()
      this.createLevelGrid()
    } catch (error) {
      this.hideLoading()
      this.showError(`Failed to load page: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}