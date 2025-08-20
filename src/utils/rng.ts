/**
 * Deterministic random number generator using the mulberry32 algorithm
 * Provides consistent, reproducible random sequences for a given seed
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /**
   * Generate next random number between 0 and 1 (exclusive)
   * @returns Random float in range [0, 1)
   */
  next(): number {
    let t = (this.state += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer in range [min, max) (max exclusive)
   * @param min Minimum value (inclusive)
   * @param max Maximum value (exclusive)
   * @returns Random integer in specified range
   */
  nextInt(min: number, max: number): number {
    if (min >= max) {
      throw new Error('min must be less than max');
    }
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Generate random float in range [min, max) (max exclusive)
   * @param min Minimum value (inclusive)
   * @param max Maximum value (exclusive)
   * @returns Random float in specified range
   */
  nextFloat(min: number, max: number): number {
    if (min >= max) {
      throw new Error('min must be less than max');
    }
    return this.next() * (max - min) + min;
  }

  /**
   * Shuffle array in-place using Fisher-Yates algorithm
   * @param array Array to shuffle
   * @returns The same array reference (shuffled in-place)
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Get current internal state (for debugging/testing)
   * @returns Current state value
   */
  getState(): number {
    return this.state;
  }

  /**
   * Reset to initial seed state
   * @param seed New seed value
   */
  reset(seed: number): void {
    this.state = seed;
  }
}

export function dailySeed(date = new Date()) {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return Number(`${y}${m}${d}`)
}