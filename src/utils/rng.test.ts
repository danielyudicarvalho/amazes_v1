import { describe, it, expect } from 'vitest';
import { SeededRandom, dailySeed } from './rng';

describe('SeededRandom', () => {
  describe('constructor and basic functionality', () => {
    it('should create instance with given seed', () => {
      const rng = new SeededRandom(12345);
      expect(rng.getState()).toBe(12345);
    });

    it('should generate numbers between 0 and 1', () => {
      const rng = new SeededRandom(12345);
      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });
  });

  describe('deterministic behavior', () => {
    it('should produce identical sequences for same seed', () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(42);

      const sequence1 = [];
      const sequence2 = [];

      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.next());
        sequence2.push(rng2.next());
      }

      expect(sequence1).toEqual(sequence2);
    });

    it('should produce different sequences for different seeds', () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(43);

      const sequence1 = [];
      const sequence2 = [];

      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.next());
        sequence2.push(rng2.next());
      }

      expect(sequence1).not.toEqual(sequence2);
    });

    it('should be reproducible after reset', () => {
      const rng = new SeededRandom(12345);
      const originalSequence = [];

      for (let i = 0; i < 5; i++) {
        originalSequence.push(rng.next());
      }

      rng.reset(12345);
      const resetSequence = [];

      for (let i = 0; i < 5; i++) {
        resetSequence.push(rng.next());
      }

      expect(resetSequence).toEqual(originalSequence);
    });
  });

  describe('nextInt method', () => {
    it('should generate integers in specified range', () => {
      const rng = new SeededRandom(12345);
      
      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(5, 15);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThan(15);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should throw error for invalid range', () => {
      const rng = new SeededRandom(12345);
      expect(() => rng.nextInt(10, 5)).toThrow('min must be less than max');
      expect(() => rng.nextInt(5, 5)).toThrow('min must be less than max');
    });

    it('should produce deterministic integer sequences', () => {
      const rng1 = new SeededRandom(999);
      const rng2 = new SeededRandom(999);

      const sequence1 = [];
      const sequence2 = [];

      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.nextInt(1, 100));
        sequence2.push(rng2.nextInt(1, 100));
      }

      expect(sequence1).toEqual(sequence2);
    });
  });

  describe('nextFloat method', () => {
    it('should generate floats in specified range', () => {
      const rng = new SeededRandom(12345);
      
      for (let i = 0; i < 100; i++) {
        const value = rng.nextFloat(2.5, 7.8);
        expect(value).toBeGreaterThanOrEqual(2.5);
        expect(value).toBeLessThan(7.8);
      }
    });

    it('should throw error for invalid range', () => {
      const rng = new SeededRandom(12345);
      expect(() => rng.nextFloat(10.0, 5.0)).toThrow('min must be less than max');
      expect(() => rng.nextFloat(5.0, 5.0)).toThrow('min must be less than max');
    });

    it('should produce deterministic float sequences', () => {
      const rng1 = new SeededRandom(777);
      const rng2 = new SeededRandom(777);

      const sequence1 = [];
      const sequence2 = [];

      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.nextFloat(0.0, 10.0));
        sequence2.push(rng2.nextFloat(0.0, 10.0));
      }

      expect(sequence1).toEqual(sequence2);
    });
  });

  describe('shuffle method', () => {
    it('should shuffle array in-place', () => {
      const rng = new SeededRandom(12345);
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const toShuffle = [...original];
      
      const result = rng.shuffle(toShuffle);
      
      // Should return same reference
      expect(result).toBe(toShuffle);
      
      // Should contain same elements
      expect([...result].sort((a, b) => a - b)).toEqual(original);
      
      // Should be shuffled (very unlikely to be in same order)
      expect(result).not.toEqual(original);
    });

    it('should produce deterministic shuffle results', () => {
      const rng1 = new SeededRandom(555);
      const rng2 = new SeededRandom(555);
      
      const array1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const array2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      rng1.shuffle(array1);
      rng2.shuffle(array2);
      
      expect(array1).toEqual(array2);
    });

    it('should handle empty arrays', () => {
      const rng = new SeededRandom(12345);
      const empty: number[] = [];
      
      const result = rng.shuffle(empty);
      expect(result).toEqual([]);
      expect(result).toBe(empty);
    });

    it('should handle single element arrays', () => {
      const rng = new SeededRandom(12345);
      const single = [42];
      
      const result = rng.shuffle(single);
      expect(result).toEqual([42]);
      expect(result).toBe(single);
    });
  });

  describe('edge cases and robustness', () => {
    it('should handle zero seed', () => {
      const rng = new SeededRandom(0);
      expect(() => rng.next()).not.toThrow();
      expect(rng.next()).toBeGreaterThanOrEqual(0);
      expect(rng.next()).toBeLessThan(1);
    });

    it('should handle negative seed', () => {
      const rng = new SeededRandom(-12345);
      expect(() => rng.next()).not.toThrow();
      expect(rng.next()).toBeGreaterThanOrEqual(0);
      expect(rng.next()).toBeLessThan(1);
    });

    it('should handle large seed values', () => {
      const rng = new SeededRandom(Number.MAX_SAFE_INTEGER);
      expect(() => rng.next()).not.toThrow();
      expect(rng.next()).toBeGreaterThanOrEqual(0);
      expect(rng.next()).toBeLessThan(1);
    });
  });
});

describe('dailySeed', () => {
  it('should generate consistent seed for same date', () => {
    const date = new Date(2024, 0, 15); // Year, month (0-indexed), day
    const seed1 = dailySeed(date);
    const seed2 = dailySeed(date);
    
    expect(seed1).toBe(seed2);
    expect(seed1).toBe(20240115);
  });

  it('should generate different seeds for different dates', () => {
    const date1 = new Date(2024, 0, 15); // Year, month (0-indexed), day
    const date2 = new Date(2024, 0, 16);
    
    const seed1 = dailySeed(date1);
    const seed2 = dailySeed(date2);
    
    expect(seed1).not.toBe(seed2);
  });

  it('should use current date when no date provided', () => {
    const seed = dailySeed();
    expect(typeof seed).toBe('number');
    expect(seed).toBeGreaterThan(20000000); // Should be a reasonable date format
  });
});