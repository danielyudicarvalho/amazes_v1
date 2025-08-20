export type Cell = number // bitmask: 1=E,2=S,4=W,8=N

export interface MazeGenerationOptions {
  width: number
  height: number
  algorithm?: 'prim' | 'recursive-backtrack'
  startPosition?: { x: number, y: number }
}

export interface MazeGenerationResult {
  maze: Cell[][]
  metadata: {
    width: number
    height: number
    algorithm: string
    startPosition: { x: number, y: number }
    totalCells: number
    connectedCells: number
  }
}

/**
 * Generate a maze using the specified algorithm and random number generator.
 * This is a pure function that produces deterministic results for the same inputs.
 */
export function generateMaze(
  options: MazeGenerationOptions,
  rng: () => number
): MazeGenerationResult {
  const { width, height, algorithm = 'prim', startPosition } = options
  
  validateMazeOptions(options)
  
  const maze = algorithm === 'prim' 
    ? generateMazePrim(width, height, startPosition, rng)
    : generateMazePrim(width, height, startPosition, rng) // Default to Prim's for now
  
  const actualStartPosition = startPosition || {
    x: Math.floor(rng() * width),
    y: Math.floor(rng() * height)
  }
  
  return {
    maze,
    metadata: {
      width,
      height,
      algorithm,
      startPosition: actualStartPosition,
      totalCells: width * height,
      connectedCells: countConnectedCells(maze)
    }
  }
}

/**
 * Legacy function for backward compatibility
 */
export function genMaze(w: number, h: number, rnd: () => number): Cell[][] {
  return generateMaze({ width: w, height: h }, rnd).maze
}

/**
 * Generate a maze using Prim's algorithm.
 * Pure function that creates a maze without side effects.
 */
function generateMazePrim(
  width: number,
  height: number,
  startPosition: { x: number, y: number } | undefined,
  rng: () => number
): Cell[][] {
  // Initialize empty grid
  const grid: Cell[][] = createEmptyGrid(width, height)
  const inMaze = new Set<string>()
  const walls: Wall[] = []
  
  // Determine start position
  const startX = startPosition?.x ?? Math.floor(rng() * width)
  const startY = startPosition?.y ?? Math.floor(rng() * height)
  
  // Add starting cell to maze
  inMaze.add(getCellKey(startX, startY))
  
  // Add walls of the starting cell
  addCellWalls(startX, startY, width, height, walls, inMaze)
  
  // Process walls until maze is complete
  while (walls.length > 0) {
    // Pick a random wall
    const wallIndex = Math.floor(rng() * walls.length)
    const wall = walls[wallIndex]
    walls.splice(wallIndex, 1)
    
    const { x, y, nx, ny, dir, backDir } = wall
    const neighborKey = getCellKey(nx, ny)
    
    // If the neighbor is not in the maze, connect it
    if (!inMaze.has(neighborKey)) {
      // Connect the cells by removing the wall
      grid[y][x] |= dir
      grid[ny][nx] |= backDir
      
      // Add the neighbor to the maze
      inMaze.add(neighborKey)
      
      // Add the neighbor's walls
      addCellWalls(nx, ny, width, height, walls, inMaze)
    }
  }
  
  return grid
}

/**
 * Create an empty grid filled with zeros (all walls present)
 */
function createEmptyGrid(width: number, height: number): Cell[][] {
  return Array.from({ length: height }, () => Array(width).fill(0))
}

/**
 * Generate a unique key for a cell position
 */
function getCellKey(x: number, y: number): string {
  return `${x},${y}`
}

/**
 * Add walls around a cell to the walls list
 */
function addCellWalls(
  x: number,
  y: number,
  width: number,
  height: number,
  walls: Wall[],
  inMaze: Set<string>
): void {
  const directions = getDirections()
  
  for (const { dx, dy, dir, backDir } of directions) {
    const nx = x + dx
    const ny = y + dy
    
    if (isValidPosition(nx, ny, width, height) && !inMaze.has(getCellKey(nx, ny))) {
      walls.push({ x, y, nx, ny, dir, backDir })
    }
  }
}

/**
 * Get the four cardinal directions with their bit masks
 */
function getDirections(): Direction[] {
  return [
    { dx: 1, dy: 0, dir: 1, backDir: 4 },  // East
    { dx: 0, dy: 1, dir: 2, backDir: 8 },  // South
    { dx: -1, dy: 0, dir: 4, backDir: 1 }, // West
    { dx: 0, dy: -1, dir: 8, backDir: 2 }  // North
  ]
}

/**
 * Check if a position is within the grid bounds
 */
function isValidPosition(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && y >= 0 && x < width && y < height
}

/**
 * Validate maze generation options
 */
function validateMazeOptions(options: MazeGenerationOptions): void {
  const { width, height, startPosition } = options
  
  if (width <= 0 || height <= 0) {
    throw new Error('Maze dimensions must be positive')
  }
  
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new Error('Maze dimensions must be integers')
  }
  
  if (startPosition) {
    if (!isValidPosition(startPosition.x, startPosition.y, width, height)) {
      throw new Error('Start position is outside maze bounds')
    }
  }
}

/**
 * Count the number of connected cells in the maze
 */
function countConnectedCells(maze: Cell[][]): number {
  let count = 0
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[0].length; x++) {
      if (maze[y][x] > 0) {
        count++
      }
    }
  }
  return count
}

/**
 * Validate that a maze is structurally correct and solvable
 */
export function validateMaze(
  maze: Cell[][],
  startPos: { x: number, y: number },
  goalPos: { x: number, y: number },
  options?: MazeValidationOptions
): MazeValidationResult {
  const height = maze.length
  const width = height > 0 ? maze[0].length : 0
  
  const result: MazeValidationResult = {
    isValid: true,
    isSolvable: false,
    errors: [],
    pathLength: 0,
    complexity: 0,
    reachableCells: 0
  }
  
  // Basic structure validation
  if (!validateMazeStructure(maze, result)) {
    return result
  }
  
  // Position validation
  if (!validatePositions(startPos, goalPos, width, height, result)) {
    return result
  }
  
  // Connection symmetry validation
  if (!validateConnectionSymmetry(maze, result)) {
    return result
  }
  
  // Solvability check
  const pathInfo = findPath(maze, startPos, goalPos)
  if (pathInfo.path.length > 0) {
    result.isSolvable = true
    result.pathLength = pathInfo.path.length - 1 // Subtract 1 for step count
    result.complexity = calculateComplexity(maze, pathInfo.path)
  } else {
    result.isValid = false
    result.errors.push('No path exists from start to goal')
  }
  
  // Count reachable cells
  result.reachableCells = countReachableCells(maze, startPos)
  
  // Apply minimum requirements if specified
  if (options) {
    if (options.minPathLength && result.pathLength < options.minPathLength) {
      result.isValid = false
      result.errors.push(`Path length ${result.pathLength} is below minimum ${options.minPathLength}`)
    }
    
    if (options.minComplexity && result.complexity < options.minComplexity) {
      result.isValid = false
      result.errors.push(`Complexity ${result.complexity} is below minimum ${options.minComplexity}`)
    }
    
    if (options.minReachableCells && result.reachableCells < options.minReachableCells) {
      result.isValid = false
      result.errors.push(`Reachable cells ${result.reachableCells} is below minimum ${options.minReachableCells}`)
    }
  }
  
  return result
}

/**
 * Check if orb placements are accessible from the start position
 */
export function validateOrbPlacements(
  maze: Cell[][],
  startPos: { x: number, y: number },
  orbPositions: { x: number, y: number }[]
): OrbValidationResult {
  const reachablePositions = getReachablePositions(maze, startPos)
  const inaccessibleOrbs: { x: number, y: number }[] = []
  
  for (const orbPos of orbPositions) {
    const key = getCellKey(orbPos.x, orbPos.y)
    if (!reachablePositions.has(key)) {
      inaccessibleOrbs.push(orbPos)
    }
  }
  
  return {
    allAccessible: inaccessibleOrbs.length === 0,
    inaccessibleOrbs,
    totalOrbs: orbPositions.length,
    accessibleOrbs: orbPositions.length - inaccessibleOrbs.length
  }
}

/**
 * Find the shortest path between two points in the maze
 */
export function findShortestPath(
  maze: Cell[][],
  start: { x: number, y: number },
  goal: { x: number, y: number }
): { x: number, y: number }[] {
  return findPath(maze, start, goal).path
}

/**
 * Get all positions reachable from a starting position
 */
export function getReachablePositions(
  maze: Cell[][],
  start: { x: number, y: number }
): Set<string> {
  const height = maze.length
  const width = height > 0 ? maze[0].length : 0
  const visited = new Set<string>()
  const queue: { x: number, y: number }[] = [start]
  
  visited.add(getCellKey(start.x, start.y))
  
  while (queue.length > 0) {
    const current = queue.shift()!
    const cell = maze[current.y][current.x]
    const directions = getDirections()
    
    for (const { dx, dy, dir } of directions) {
      if (cell & dir) { // Connection exists
        const nx = current.x + dx
        const ny = current.y + dy
        const key = getCellKey(nx, ny)
        
        if (isValidPosition(nx, ny, width, height) && !visited.has(key)) {
          visited.add(key)
          queue.push({ x: nx, y: ny })
        }
      }
    }
  }
  
  return visited
}

// Internal validation functions

function validateMazeStructure(maze: Cell[][], result: MazeValidationResult): boolean {
  if (maze.length === 0) {
    result.isValid = false
    result.errors.push('Maze is empty')
    return false
  }
  
  const width = maze[0].length
  if (width === 0) {
    result.isValid = false
    result.errors.push('Maze has zero width')
    return false
  }
  
  // Check all rows have same width
  for (let y = 0; y < maze.length; y++) {
    if (maze[y].length !== width) {
      result.isValid = false
      result.errors.push(`Row ${y} has inconsistent width`)
      return false
    }
    
    // Check cell values are valid
    for (let x = 0; x < width; x++) {
      const cell = maze[y][x]
      if (cell < 0 || cell > 15) {
        result.isValid = false
        result.errors.push(`Invalid cell value ${cell} at (${x}, ${y})`)
        return false
      }
    }
  }
  
  return true
}

function validatePositions(
  startPos: { x: number, y: number },
  goalPos: { x: number, y: number },
  width: number,
  height: number,
  result: MazeValidationResult
): boolean {
  if (!isValidPosition(startPos.x, startPos.y, width, height)) {
    result.isValid = false
    result.errors.push(`Start position (${startPos.x}, ${startPos.y}) is outside maze bounds`)
    return false
  }
  
  if (!isValidPosition(goalPos.x, goalPos.y, width, height)) {
    result.isValid = false
    result.errors.push(`Goal position (${goalPos.x}, ${goalPos.y}) is outside maze bounds`)
    return false
  }
  
  return true
}

function validateConnectionSymmetry(maze: Cell[][], result: MazeValidationResult): boolean {
  const height = maze.length
  const width = maze[0].length
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = maze[y][x]
      
      // Check East connection
      if (x < width - 1 && (cell & 1)) {
        const eastCell = maze[y][x + 1]
        if (!(eastCell & 4)) {
          result.isValid = false
          result.errors.push(`Asymmetric East connection at (${x}, ${y})`)
          return false
        }
      }
      
      // Check South connection
      if (y < height - 1 && (cell & 2)) {
        const southCell = maze[y + 1][x]
        if (!(southCell & 8)) {
          result.isValid = false
          result.errors.push(`Asymmetric South connection at (${x}, ${y})`)
          return false
        }
      }
      
      // Check West connection
      if (x > 0 && (cell & 4)) {
        const westCell = maze[y][x - 1]
        if (!(westCell & 1)) {
          result.isValid = false
          result.errors.push(`Asymmetric West connection at (${x}, ${y})`)
          return false
        }
      }
      
      // Check North connection
      if (y > 0 && (cell & 8)) {
        const northCell = maze[y - 1][x]
        if (!(northCell & 2)) {
          result.isValid = false
          result.errors.push(`Asymmetric North connection at (${x}, ${y})`)
          return false
        }
      }
    }
  }
  
  return true
}

function findPath(
  maze: Cell[][],
  start: { x: number, y: number },
  goal: { x: number, y: number }
): { path: { x: number, y: number }[], distance: number } {
  const height = maze.length
  const width = height > 0 ? maze[0].length : 0
  
  if (!isValidPosition(start.x, start.y, width, height) ||
      !isValidPosition(goal.x, goal.y, width, height)) {
    return { path: [], distance: -1 }
  }
  
  const visited = new Set<string>()
  const queue: { pos: { x: number, y: number }, path: { x: number, y: number }[] }[] = [
    { pos: start, path: [start] }
  ]
  
  visited.add(getCellKey(start.x, start.y))
  
  while (queue.length > 0) {
    const { pos, path } = queue.shift()!
    
    if (pos.x === goal.x && pos.y === goal.y) {
      return { path, distance: path.length - 1 }
    }
    
    const cell = maze[pos.y][pos.x]
    const directions = getDirections()
    
    for (const { dx, dy, dir } of directions) {
      if (cell & dir) { // Connection exists
        const nx = pos.x + dx
        const ny = pos.y + dy
        const key = getCellKey(nx, ny)
        
        if (isValidPosition(nx, ny, width, height) && !visited.has(key)) {
          visited.add(key)
          queue.push({
            pos: { x: nx, y: ny },
            path: [...path, { x: nx, y: ny }]
          })
        }
      }
    }
  }
  
  return { path: [], distance: -1 }
}

function calculateComplexity(maze: Cell[][], path: { x: number, y: number }[]): number {
  if (path.length < 2) return 0
  
  let complexity = 0
  let direction = 0 // 0=E, 1=S, 2=W, 3=N
  
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]
    const curr = path[i]
    
    const dx = curr.x - prev.x
    const dy = curr.y - prev.y
    
    let newDirection = 0
    if (dx === 1) newDirection = 0      // East
    else if (dy === 1) newDirection = 1 // South
    else if (dx === -1) newDirection = 2 // West
    else if (dy === -1) newDirection = 3 // North
    
    if (i > 1 && newDirection !== direction) {
      complexity++ // Direction change adds complexity
    }
    
    direction = newDirection
  }
  
  return complexity
}

function countReachableCells(maze: Cell[][], start: { x: number, y: number }): number {
  return getReachablePositions(maze, start).size
}

// Type definitions for validation
export interface MazeValidationOptions {
  minPathLength?: number
  minComplexity?: number
  minReachableCells?: number
}

export interface MazeValidationResult {
  isValid: boolean
  isSolvable: boolean
  errors: string[]
  pathLength: number
  complexity: number
  reachableCells: number
}

export interface OrbValidationResult {
  allAccessible: boolean
  inaccessibleOrbs: { x: number, y: number }[]
  totalOrbs: number
  accessibleOrbs: number
}

// Type definitions for internal use
interface Wall {
  x: number
  y: number
  nx: number
  ny: number
  dir: number
  backDir: number
}

interface Direction {
  dx: number
  dy: number
  dir: number
  backDir: number
}