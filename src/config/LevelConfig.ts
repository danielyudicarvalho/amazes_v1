export interface LevelConfig {
  id: number
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  mazeSize: { width: number, height: number }
  orbCount: number
  timeLimit?: number // seconds, optional
  specialRules?: {
    requiresSequence?: boolean // collect orbs in specific order
    hasMovingWalls?: boolean
    hasPortals?: boolean
    hasBombs?: boolean
  }
  rewards: {
    stars: number
    coins: number
  }
}

export class LevelGenerator {
  private static readonly BASE_CONFIGS = {
    easy: { mazeSize: { width: 5, height: 5 }, orbCount: 2 },
    medium: { mazeSize: { width: 7, height: 7 }, orbCount: 4 },
    hard: { mazeSize: { width: 9, height: 9 }, orbCount: 6 },
    expert: { mazeSize: { width: 11, height: 11 }, orbCount: 8 }
  }

  static generateLevel(levelNumber: number): LevelConfig {
    // Determine difficulty based on level number
    const difficulty = this.getDifficulty(levelNumber)
    const baseConfig = this.BASE_CONFIGS[difficulty]
    
    // Progressive scaling
    const scaleFactor = Math.floor((levelNumber - 1) / 20) // Every 20 levels increase complexity
    
    return {
      id: levelNumber,
      difficulty,
      mazeSize: {
        width: Math.min(baseConfig.mazeSize.width + scaleFactor, 15),
        height: Math.min(baseConfig.mazeSize.height + scaleFactor, 15)
      },
      orbCount: Math.min(baseConfig.orbCount + Math.floor(scaleFactor / 2), 12),
      timeLimit: this.getTimeLimit(levelNumber, difficulty),
      specialRules: this.getSpecialRules(levelNumber),
      rewards: {
        stars: 3,
        coins: 10 + levelNumber * 2
      }
    }
  }

  private static getDifficulty(level: number): 'easy' | 'medium' | 'hard' | 'expert' {
    if (level <= 10) return 'easy'
    if (level <= 30) return 'medium'
    if (level <= 60) return 'hard'
    return 'expert'
  }

  private static getTimeLimit(level: number, difficulty: string): number {
    const baseTimes = { easy: 120, medium: 180, hard: 240, expert: 300 }
    return baseTimes[difficulty as keyof typeof baseTimes] + Math.floor(level / 10) * 30
  }

  private static getSpecialRules(level: number) {
    const rules: any = {}
    
    if (level >= 15) rules.requiresSequence = level % 5 === 0
    if (level >= 25) rules.hasMovingWalls = level % 8 === 0
    if (level >= 40) rules.hasPortals = level % 12 === 0
    if (level >= 60) rules.hasBombs = level % 15 === 0
    
    return Object.keys(rules).length > 0 ? rules : undefined
  }
}