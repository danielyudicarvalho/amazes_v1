// Asset loading utilities with retry logic and error recovery

export interface LoadingOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  priority?: number;
}

export interface LoadingTask {
  id: string;
  type: 'atlas' | 'image' | 'audio' | 'json';
  url: string;
  options: LoadingOptions;
  status: 'pending' | 'loading' | 'completed' | 'failed';
  attempts: number;
  error?: Error;
  startTime?: number;
  endTime?: number;
}

export interface LoadingStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageLoadTime: number;
  totalLoadTime: number;
}

export class AssetLoader {
  private tasks: Map<string, LoadingTask> = new Map();
  private loadingQueue: LoadingTask[] = [];
  private activeLoads: Set<string> = new Set();
  private maxConcurrentLoads = 4;
  private defaultOptions: LoadingOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    priority: 5
  };

  constructor(private scene: any) {}

  /**
   * Queues an atlas for loading
   */
  queueAtlas(id: string, imagePath: string, dataPath: string, options?: LoadingOptions): void {
    const task: LoadingTask = {
      id,
      type: 'atlas',
      url: imagePath, // Primary URL for tracking
      options: { ...this.defaultOptions, ...options },
      status: 'pending',
      attempts: 0
    };

    this.tasks.set(id, task);
    this.insertTaskByPriority(task);
  }

  /**
   * Queues an image for loading
   */
  queueImage(id: string, url: string, options?: LoadingOptions): void {
    const task: LoadingTask = {
      id,
      type: 'image',
      url,
      options: { ...this.defaultOptions, ...options },
      status: 'pending',
      attempts: 0
    };

    this.tasks.set(id, task);
    this.insertTaskByPriority(task);
  }

  /**
   * Queues a JSON file for loading
   */
  queueJson(id: string, url: string, options?: LoadingOptions): void {
    const task: LoadingTask = {
      id,
      type: 'json',
      url,
      options: { ...this.defaultOptions, ...options },
      status: 'pending',
      attempts: 0
    };

    this.tasks.set(id, task);
    this.insertTaskByPriority(task);
  }

  /**
   * Starts processing the loading queue
   */
  async processQueue(): Promise<LoadingStats> {
    const startTime = Date.now();
    
    while (this.loadingQueue.length > 0 || this.activeLoads.size > 0) {
      // Start new loads if we have capacity
      while (this.activeLoads.size < this.maxConcurrentLoads && this.loadingQueue.length > 0) {
        const task = this.loadingQueue.shift()!;
        this.startLoadingTask(task);
      }

      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const endTime = Date.now();
    return this.generateStats(endTime - startTime);
  }

  /**
   * Gets the current loading progress
   */
  getProgress(): { loaded: number; total: number; percentage: number } {
    const total = this.tasks.size;
    const loaded = Array.from(this.tasks.values()).filter(t => t.status === 'completed').length;
    
    return {
      loaded,
      total,
      percentage: total > 0 ? (loaded / total) * 100 : 0
    };
  }

  /**
   * Gets loading statistics
   */
  getStats(): LoadingStats {
    return this.generateStats(0);
  }

  /**
   * Clears all tasks and resets the loader
   */
  clear(): void {
    this.tasks.clear();
    this.loadingQueue.length = 0;
    this.activeLoads.clear();
  }

  /**
   * Gets failed tasks for debugging
   */
  getFailedTasks(): LoadingTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'failed');
  }

  /**
   * Retries all failed tasks
   */
  async retryFailedTasks(): Promise<void> {
    const failedTasks = this.getFailedTasks();
    
    for (const task of failedTasks) {
      task.status = 'pending';
      task.attempts = 0;
      task.error = undefined;
      this.insertTaskByPriority(task);
    }

    if (failedTasks.length > 0) {
      await this.processQueue();
    }
  }

  private async startLoadingTask(task: LoadingTask): Promise<void> {
    this.activeLoads.add(task.id);
    task.status = 'loading';
    task.startTime = Date.now();
    task.attempts++;

    try {
      await this.loadTaskWithTimeout(task);
      task.status = 'completed';
      task.endTime = Date.now();
    } catch (error) {
      task.error = error as Error;
      
      if (task.attempts < (task.options.maxRetries || this.defaultOptions.maxRetries!)) {
        // Retry with exponential backoff
        const delay = (task.options.retryDelay || this.defaultOptions.retryDelay!) * Math.pow(2, task.attempts - 1);
        
        setTimeout(() => {
          task.status = 'pending';
          this.insertTaskByPriority(task);
        }, delay);
      } else {
        task.status = 'failed';
        task.endTime = Date.now();
        console.error(`Failed to load asset ${task.id} after ${task.attempts} attempts:`, error);
      }
    } finally {
      this.activeLoads.delete(task.id);
    }
  }

  private async loadTaskWithTimeout(task: LoadingTask): Promise<void> {
    const timeout = task.options.timeout || this.defaultOptions.timeout!;
    
    return Promise.race([
      this.loadTask(task),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Loading timeout for ${task.id}`)), timeout);
      })
    ]);
  }

  private async loadTask(task: LoadingTask): Promise<void> {
    switch (task.type) {
      case 'atlas':
        return this.loadAtlasTask(task);
      case 'image':
        return this.loadImageTask(task);
      case 'json':
        return this.loadJsonTask(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async loadAtlasTask(task: LoadingTask): Promise<void> {
    // For atlas, we need both image and data paths
    // The task.url contains the image path, we need to derive the data path
    const imagePath = task.url;
    const dataPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.json');

    return new Promise((resolve, reject) => {
      // Validate file paths before loading
      if (!this.isValidImagePath(imagePath)) {
        reject(new Error(`Invalid image path: ${imagePath}`));
        return;
      }

      this.scene.load.atlas(task.id, imagePath, dataPath);
      
      const completeHandler = () => {
        if (this.scene.textures.exists(task.id)) {
          cleanup();
          resolve();
        } else {
          cleanup();
          reject(new Error(`Atlas ${task.id} failed to load properly`));
        }
      };

      const errorHandler = (file: any) => {
        if (file.key === task.id) {
          cleanup();
          reject(new Error(`Failed to load atlas ${task.id}: ${file.src}`));
        }
      };

      const progressHandler = (progress: number) => {
        // Update task progress if needed
        if (task.id === file.key) {
          // Could emit progress events here
        }
      };

      const cleanup = () => {
        this.scene.load.off('complete', completeHandler);
        this.scene.load.off('loaderror', errorHandler);
        this.scene.load.off('progress', progressHandler);
      };

      this.scene.load.once('complete', completeHandler);
      this.scene.load.once('loaderror', errorHandler);
      this.scene.load.on('progress', progressHandler);
      
      this.scene.load.start();
    });
  }

  private isValidImagePath(path: string): boolean {
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    return validExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  private async loadImageTask(task: LoadingTask): Promise<void> {
    return new Promise((resolve, reject) => {
      this.scene.load.image(task.id, task.url);
      
      const completeHandler = () => {
        if (this.scene.textures.exists(task.id)) {
          cleanup();
          resolve();
        } else {
          cleanup();
          reject(new Error(`Image ${task.id} failed to load properly`));
        }
      };

      const errorHandler = (file: any) => {
        if (file.key === task.id) {
          cleanup();
          reject(new Error(`Failed to load image ${task.id}: ${file.src}`));
        }
      };

      const cleanup = () => {
        this.scene.load.off('complete', completeHandler);
        this.scene.load.off('loaderror', errorHandler);
      };

      this.scene.load.once('complete', completeHandler);
      this.scene.load.once('loaderror', errorHandler);
      
      this.scene.load.start();
    });
  }

  private async loadJsonTask(task: LoadingTask): Promise<void> {
    const response = await fetch(task.url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Store the JSON data in the scene's cache
    this.scene.cache.json.add(task.id, data);
  }

  private insertTaskByPriority(task: LoadingTask): void {
    const priority = task.options.priority || this.defaultOptions.priority!;
    
    // Find insertion point based on priority (higher priority = lower number = earlier in queue)
    let insertIndex = 0;
    while (insertIndex < this.loadingQueue.length) {
      const existingPriority = this.loadingQueue[insertIndex].options.priority || this.defaultOptions.priority!;
      if (priority < existingPriority) {
        break;
      }
      insertIndex++;
    }
    
    this.loadingQueue.splice(insertIndex, 0, task);
  }

  private generateStats(totalTime: number): LoadingStats {
    const tasks = Array.from(this.tasks.values());
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const failedTasks = tasks.filter(t => t.status === 'failed');
    
    const loadTimes = completedTasks
      .filter(t => t.startTime && t.endTime)
      .map(t => t.endTime! - t.startTime!);
    
    const averageLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
      : 0;

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      failedTasks: failedTasks.length,
      averageLoadTime,
      totalLoadTime: totalTime
    };
  }

  /**
   * Sets the maximum number of concurrent loads
   */
  setMaxConcurrentLoads(max: number): void {
    this.maxConcurrentLoads = Math.max(1, Math.min(max, 10)); // Clamp between 1-10
  }

  /**
   * Gets detailed information about a specific task
   */
  getTaskInfo(taskId: string): LoadingTask | null {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Cancels a pending task
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'pending') {
      task.status = 'failed';
      task.error = new Error('Task cancelled');
      
      // Remove from queue
      const queueIndex = this.loadingQueue.findIndex(t => t.id === taskId);
      if (queueIndex >= 0) {
        this.loadingQueue.splice(queueIndex, 1);
      }
      
      return true;
    }
    return false;
  }

  /**
   * Pauses the loading queue
   */
  pause(): void {
    // Implementation would pause new task starts
    // Current active loads continue
    console.log('AssetLoader paused');
  }

  /**
   * Resumes the loading queue
   */
  resume(): void {
    // Implementation would resume processing
    console.log('AssetLoader resumed');
    this.processQueue();
  }

  /**
   * Gets loading performance metrics
   */
  getPerformanceMetrics(): {
    averageLoadTime: number;
    successRate: number;
    totalDataLoaded: number;
    loadingEfficiency: number;
  } {
    const stats = this.getStats();
    const successRate = stats.totalTasks > 0 ? 
      (stats.completedTasks / stats.totalTasks) * 100 : 0;
    
    // Estimate efficiency based on retry attempts
    const tasks = Array.from(this.tasks.values());
    const totalAttempts = tasks.reduce((sum, task) => sum + task.attempts, 0);
    const efficiency = stats.totalTasks > 0 ? 
      (stats.totalTasks / totalAttempts) * 100 : 100;
    
    return {
      averageLoadTime: stats.averageLoadTime,
      successRate,
      totalDataLoaded: stats.completedTasks, // Simplified metric
      loadingEfficiency: efficiency
    };
  }
}