export interface PlayerProgress {
  currentLevel: number // Kept for backward compatibility
  highestLevel: number // Kept for backward compatibility
  totalStars: number
  totalCoins: number
  levelStats: Map<number, LevelStats> // Legacy numeric level stats
  levelStatsV2: Map<string, LevelStatsV2> // New string-based level stats
  unlockedLevels: Set<string> // Track unlocked levels by ID
  version: number // Schema version for migrations
}

export interface LevelStats {
  completed: boolean
  bestTime: number
  stars: number
  attempts: number
  lastPlayed: Date
}

export interface LevelStatsV2 {
  levelId: string
  completed: boolean
  bestTime: number
  stars: number
  attempts: number
  lastPlayed: Date
  firstCompleted?: Date
  objectives: Map<string, ObjectiveProgress>
}

export interface ObjectiveProgress {
  objectiveId: string
  completed: boolean
  progress: number
  target: number
  completedAt?: Date
}

export class ProgressManager {
  private static instance: ProgressManager
  private progress: PlayerProgress
  private readonly STORAGE_KEY = 'labyrinth_leap_progress'
  private readonly CURRENT_VERSION = 2

  private constructor() {
    this.progress = this.loadProgress()
    this.migrateProgressIfNeeded()
  }

  static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager()
    }
    return ProgressManager.instance
  }

  getCurrentLevel(): number {
    return this.progress.currentLevel
  }

  getHighestLevel(): number {
    return this.progress.highestLevel
  }

  getTotalStars(): number {
    return this.progress.totalStars
  }

  getTotalCoins(): number {
    return this.progress.totalCoins
  }

  // Legacy method - supports numeric levels
  isLevelUnlocked(level: number): boolean
  // New method - supports string level IDs
  isLevelUnlocked(levelId: string): boolean
  isLevelUnlocked(levelOrId: number | string): boolean {
    if (typeof levelOrId === 'number') {
      return levelOrId <= this.progress.highestLevel
    }

    // For string IDs, check the unlocked levels set
    if (this.progress.unlockedLevels.has(levelOrId)) {
      return true
    }

    // Fallback: try to extract numeric level from ID for backward compatibility
    const numericLevel = this.extractNumericLevel(levelOrId)
    if (numericLevel !== null) {
      return numericLevel <= this.progress.highestLevel
    }

    return false
  }

  // New method to unlock a level by ID
  unlockLevel(levelId: string): void {
    this.progress.unlockedLevels.add(levelId)
    this.saveProgress()
  }

  // New method to unlock multiple levels
  unlockLevels(levelIds: string[]): void {
    levelIds.forEach(id => this.progress.unlockedLevels.add(id))
    this.saveProgress()
  }

  // Legacy method - supports numeric levels
  completeLevel(level: number, time: number, stars: number, coins: number): void
  // New method - supports string level IDs with objectives
  completeLevel(levelId: string, time: number, stars: number, coins: number, objectives?: Map<string, ObjectiveProgress>, unlockedLevels?: string[]): void
  completeLevel(
    levelOrId: number | string,
    time: number,
    stars: number,
    coins: number,
    objectives?: Map<string, ObjectiveProgress>,
    unlockedLevels?: string[]
  ): void {
    if (typeof levelOrId === 'number') {
      this.completeLevelLegacy(levelOrId, time, stars, coins)
      return
    }

    this.completeLevelV2(levelOrId, time, stars, coins, objectives, unlockedLevels)
  }

  private completeLevelLegacy(level: number, time: number, stars: number, coins: number): void {
    const stats = this.progress.levelStats.get(level) || {
      completed: false,
      bestTime: Infinity,
      stars: 0,
      attempts: 0,
      lastPlayed: new Date()
    }

    stats.completed = true
    stats.attempts++
    stats.lastPlayed = new Date()

    // Update best time and stars if improved
    if (time < stats.bestTime) {
      stats.bestTime = time
    }
    if (stars > stats.stars) {
      const starDiff = stars - stats.stars
      stats.stars = stars
      this.progress.totalStars += starDiff
    }

    this.progress.totalCoins += coins
    this.progress.levelStats.set(level, stats)

    // Unlock next level
    if (level >= this.progress.highestLevel) {
      this.progress.highestLevel = level + 1
    }

    this.saveProgress()
  }

  private completeLevelV2(
    levelId: string,
    time: number,
    stars: number,
    coins: number,
    objectives?: Map<string, ObjectiveProgress>,
    unlockedLevels?: string[]
  ): void {
    const stats = this.progress.levelStatsV2.get(levelId) || {
      levelId,
      completed: false,
      bestTime: Infinity,
      stars: 0,
      attempts: 0,
      lastPlayed: new Date(),
      firstCompleted: undefined,
      objectives: new Map()
    }

    const wasCompleted = stats.completed
    stats.completed = true
    stats.attempts++
    stats.lastPlayed = new Date()

    if (!wasCompleted) {
      stats.firstCompleted = new Date()
    }

    // Update best time and stars if improved
    if (time < stats.bestTime) {
      stats.bestTime = time
    }
    if (stars > stats.stars) {
      const starDiff = stars - stats.stars
      stats.stars = stars
      this.progress.totalStars += starDiff
    }

    // Update objectives
    if (objectives) {
      stats.objectives = new Map(objectives)
    }

    this.progress.totalCoins += coins
    this.progress.levelStatsV2.set(levelId, stats)

    // Unlock new levels if provided
    if (unlockedLevels) {
      unlockedLevels.forEach(id => this.progress.unlockedLevels.add(id))
    }

    // Update legacy system if level has numeric component
    const numericLevel = this.extractNumericLevel(levelId)
    if (numericLevel !== null) {
      if (numericLevel >= this.progress.highestLevel) {
        this.progress.highestLevel = numericLevel + 1
      }
    }

    this.saveProgress()
  }

  // Legacy method - supports numeric levels
  getLevelStats(level: number): LevelStats | undefined
  // New method - supports string level IDs
  getLevelStats(levelId: string): LevelStatsV2 | undefined
  getLevelStats(levelOrId: number | string): LevelStats | LevelStatsV2 | undefined {
    if (typeof levelOrId === 'number') {
      return this.progress.levelStats.get(levelOrId)
    }

    return this.progress.levelStatsV2.get(levelOrId)
  }

  // Get objective progress for a specific level
  getObjectiveProgress(levelId: string, objectiveId: string): ObjectiveProgress | undefined {
    const levelStats = this.progress.levelStatsV2.get(levelId)
    return levelStats?.objectives.get(objectiveId)
  }

  // Get all completed levels (both legacy and new format)
  getCompletedLevels(): { legacy: number[], v2: string[] } {
    const legacy = Array.from(this.progress.levelStats.entries())
      .filter(([_, stats]) => stats.completed)
      .map(([level, _]) => level)

    const v2 = Array.from(this.progress.levelStatsV2.entries())
      .filter(([_, stats]) => stats.completed)
      .map(([levelId, _]) => levelId)

    return { legacy, v2 }
  }

  // Helper method to extract numeric level from string ID
  private extractNumericLevel(levelId: string): number | null {
    const match = levelId.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : null
  }

  private loadProgress(): PlayerProgress {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)

        // Convert dates back from strings
        const levelStats = new Map<number, LevelStats>()
        if (data.levelStats) {
          data.levelStats.forEach(([level, stats]: [number, any]) => {
            const convertedStats: LevelStats = {
              ...stats,
              lastPlayed: stats.lastPlayed ? new Date(stats.lastPlayed) : new Date()
            }
            levelStats.set(level, convertedStats)
          })
        }

        const levelStatsV2 = new Map()
        if (data.levelStatsV2) {
          data.levelStatsV2.forEach(([levelId, stats]: [string, any]) => {
            const convertedStats: LevelStatsV2 = {
              ...stats,
              lastPlayed: new Date(stats.lastPlayed),
              firstCompleted: stats.firstCompleted ? new Date(stats.firstCompleted) : undefined,
              objectives: new Map(stats.objectives || [])
            }

            // Convert objective dates
            convertedStats.objectives.forEach(objective => {
              if (objective.completedAt) {
                objective.completedAt = new Date(objective.completedAt)
              }
            })

            levelStatsV2.set(levelId, convertedStats)
          })
        }

        return {
          currentLevel: data.currentLevel || 1,
          highestLevel: data.highestLevel || 1,
          totalStars: data.totalStars || 0,
          totalCoins: data.totalCoins || 0,
          levelStats,
          levelStatsV2,
          unlockedLevels: new Set(data.unlockedLevels || []),
          version: data.version || 1
        }
      }
    } catch (error) {
      console.warn('Failed to load progress:', error)
    }

    // Default progress
    return {
      currentLevel: 1,
      highestLevel: 1,
      totalStars: 0,
      totalCoins: 0,
      levelStats: new Map(),
      levelStatsV2: new Map(),
      unlockedLevels: new Set(['level-001-tutorial']), // Unlock first level by default
      version: this.CURRENT_VERSION
    }
  }

  private saveProgress() {
    try {
      // Convert Maps and Sets to arrays for JSON serialization
      const levelStatsV2Array = Array.from(this.progress.levelStatsV2.entries()).map(([levelId, stats]) => [
        levelId,
        {
          ...stats,
          objectives: Array.from(stats.objectives.entries())
        }
      ])

      const data = {
        ...this.progress,
        levelStats: Array.from(this.progress.levelStats.entries()),
        levelStatsV2: levelStatsV2Array,
        unlockedLevels: Array.from(this.progress.unlockedLevels),
        version: this.CURRENT_VERSION
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save progress:', error)
    }
  }

  // Migration method to handle version upgrades
  private migrateProgressIfNeeded(): void {
    if (this.progress.version < this.CURRENT_VERSION) {
      console.log(`Migrating progress from version ${this.progress.version} to ${this.CURRENT_VERSION}`)

      if (this.progress.version < 2) {
        this.migrateToV2()
      }

      this.progress.version = this.CURRENT_VERSION
      this.saveProgress()
    }
  }

  private migrateToV2(): void {
    // Initialize new fields if they don't exist
    if (!this.progress.levelStatsV2) {
      this.progress.levelStatsV2 = new Map()
    }

    if (!this.progress.unlockedLevels) {
      this.progress.unlockedLevels = new Set()
    }

    // Migrate legacy numeric levels to string format where possible
    this.progress.levelStats.forEach((stats, level) => {
      const levelId = `level-${level.toString().padStart(3, '0')}-migrated`

      if (!this.progress.levelStatsV2.has(levelId)) {
        const migratedStats: LevelStatsV2 = {
          levelId,
          completed: stats.completed,
          bestTime: stats.bestTime,
          stars: stats.stars,
          attempts: stats.attempts,
          lastPlayed: stats.lastPlayed,
          objectives: new Map()
        }

        this.progress.levelStatsV2.set(levelId, migratedStats)

        if (stats.completed) {
          this.progress.unlockedLevels.add(levelId)
        }
      }
    })

    // Ensure first level is unlocked
    this.progress.unlockedLevels.add('level-001-tutorial')

    console.log(`Migrated ${this.progress.levelStats.size} legacy levels to new format`)
  }

  // Analytics and engagement features
  getPlayStats() {
    const legacyCompleted = Array.from(this.progress.levelStats.values())
      .filter(stats => stats.completed).length
    const v2Completed = Array.from(this.progress.levelStatsV2.values())
      .filter(stats => stats.completed).length

    return {
      totalLevelsCompleted: legacyCompleted + v2Completed,
      legacyLevelsCompleted: legacyCompleted,
      v2LevelsCompleted: v2Completed,
      averageAttempts: this.getAverageAttempts(),
      totalPlayTime: this.getTotalPlayTime(),
      streakDays: this.getStreakDays(),
      unlockedLevelsCount: this.progress.unlockedLevels.size
    }
  }

  private getAverageAttempts(): number {
    const legacyCompleted = Array.from(this.progress.levelStats.values())
      .filter(stats => stats.completed)
    const v2Completed = Array.from(this.progress.levelStatsV2.values())
      .filter(stats => stats.completed)

    const allCompleted = [...legacyCompleted, ...v2Completed]
    if (allCompleted.length === 0) return 0

    const totalAttempts = allCompleted.reduce((sum, stats) => sum + stats.attempts, 0)
    return totalAttempts / allCompleted.length
  }

  private getTotalPlayTime(): number {
    const legacyTime = Array.from(this.progress.levelStats.values())
      .filter(stats => stats.completed)
      .reduce((sum, stats) => sum + stats.bestTime, 0)

    const v2Time = Array.from(this.progress.levelStatsV2.values())
      .filter(stats => stats.completed)
      .reduce((sum, stats) => sum + stats.bestTime, 0)

    return legacyTime + v2Time
  }

  private getStreakDays(): number {
    // Calculate consecutive days played (simplified)
    const today = new Date()
    let streak = 0

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)

      const legacyPlayedToday = Array.from(this.progress.levelStats.values())
        .some(stats => {
          const playDate = new Date(stats.lastPlayed)
          return playDate.toDateString() === checkDate.toDateString()
        })

      const v2PlayedToday = Array.from(this.progress.levelStatsV2.values())
        .some(stats => {
          const playDate = new Date(stats.lastPlayed)
          return playDate.toDateString() === checkDate.toDateString()
        })

      if (legacyPlayedToday || v2PlayedToday) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    return streak
  }

  // New methods for level management
  getUnlockedLevels(): string[] {
    return Array.from(this.progress.unlockedLevels)
  }

  // Reset progress (for testing or user request)
  resetProgress(): void {
    this.progress = {
      currentLevel: 1,
      highestLevel: 1,
      totalStars: 0,
      totalCoins: 0,
      levelStats: new Map(),
      levelStatsV2: new Map(),
      unlockedLevels: new Set(['level-001-tutorial']),
      version: this.CURRENT_VERSION
    }
    this.saveProgress()
  }

  // Export progress for backup
  exportProgress(): string {
    return JSON.stringify({
      ...this.progress,
      levelStats: Array.from(this.progress.levelStats.entries()),
      levelStatsV2: Array.from(this.progress.levelStatsV2.entries()).map(([levelId, stats]) => [
        levelId,
        {
          ...stats,
          objectives: Array.from(stats.objectives.entries())
        }
      ]),
      unlockedLevels: Array.from(this.progress.unlockedLevels)
    }, null, 2)
  }

  // Import progress from backup
  importProgress(progressData: string): boolean {
    try {
      const data = JSON.parse(progressData)

      // Validate basic structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid progress data format')
      }

      // Create new progress object
      const newProgress: PlayerProgress = {
        currentLevel: data.currentLevel || 1,
        highestLevel: data.highestLevel || 1,
        totalStars: data.totalStars || 0,
        totalCoins: data.totalCoins || 0,
        levelStats: new Map(data.levelStats || []),
        levelStatsV2: new Map(),
        unlockedLevels: new Set(data.unlockedLevels || ['level-001-tutorial']),
        version: data.version || this.CURRENT_VERSION
      }

      // Process V2 level stats
      if (data.levelStatsV2) {
        data.levelStatsV2.forEach(([levelId, stats]: [string, any]) => {
          const convertedStats: LevelStatsV2 = {
            ...stats,
            lastPlayed: new Date(stats.lastPlayed),
            firstCompleted: stats.firstCompleted ? new Date(stats.firstCompleted) : undefined,
            objectives: new Map(stats.objectives || [])
          }
          newProgress.levelStatsV2.set(levelId, convertedStats)
        })
      }

      this.progress = newProgress
      this.saveProgress()
      return true
    } catch (error) {
      console.error('Failed to import progress:', error)
      return false
    }
  }
}