// Layer management system for proper sprite rendering order
export interface LayerDefinition {
  name: string;
  depth: number;
  visible: boolean;
  alpha?: number;
  blendMode?: string;
  scrollFactor?: { x: number; y: number };
}

export interface LayerGroup {
  layer: Phaser.GameObjects.Layer;
  definition: LayerDefinition;
  sprites: Set<Phaser.GameObjects.Sprite>;
}

export class LayerManager {
  private scene: Phaser.Scene;
  private layers: Map<string, LayerGroup> = new Map();
  private layerOrder: string[] = [];
  
  // Default layer definitions for the maze game
  private readonly defaultLayers: LayerDefinition[] = [
    {
      name: 'background',
      depth: 0,
      visible: true,
      alpha: 1,
      scrollFactor: { x: 0.5, y: 0.5 } // Parallax background
    },
    {
      name: 'maze-background',
      depth: 50,
      visible: true,
      alpha: 1
    },
    {
      name: 'maze-floor',
      depth: 100,
      visible: true,
      alpha: 1
    },
    {
      name: 'maze-walls',
      depth: 150,
      visible: true,
      alpha: 1
    },
    {
      name: 'game-objects',
      depth: 200,
      visible: true,
      alpha: 1
    },
    {
      name: 'player',
      depth: 250,
      visible: true,
      alpha: 1
    },
    {
      name: 'effects-low',
      depth: 300,
      visible: true,
      alpha: 1
    },
    {
      name: 'effects-high',
      depth: 350,
      visible: true,
      alpha: 1
    },
    {
      name: 'ui-background',
      depth: 400,
      visible: true,
      alpha: 1
    },
    {
      name: 'ui-elements',
      depth: 450,
      visible: true,
      alpha: 1
    },
    {
      name: 'ui-overlay',
      depth: 500,
      visible: true,
      alpha: 1
    },
    {
      name: 'debug',
      depth: 1000,
      visible: false,
      alpha: 0.8
    }
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeDefaultLayers();
  }

  /**
   * Initializes all default layers
   */
  initializeDefaultLayers(): void {
    this.defaultLayers.forEach(layerDef => {
      this.createLayer(layerDef);
    });
    
    console.log(`LayerManager: Initialized ${this.layers.size} layers`);
  }

  /**
   * Creates a new layer with the given definition
   */
  createLayer(definition: LayerDefinition): Phaser.GameObjects.Layer {
    if (this.layers.has(definition.name)) {
      console.warn(`Layer ${definition.name} already exists`);
      return this.layers.get(definition.name)!.layer;
    }

    const layer = this.scene.add.layer();
    layer.setName(definition.name);
    layer.setDepth(definition.depth);
    layer.setVisible(definition.visible);
    
    if (definition.alpha !== undefined) {
      layer.setAlpha(definition.alpha);
    }
    
    if (definition.blendMode) {
      layer.setBlendMode(definition.blendMode as any);
    }
    
    if (definition.scrollFactor) {
      layer.setScrollFactor(definition.scrollFactor.x, definition.scrollFactor.y);
    }

    const layerGroup: LayerGroup = {
      layer,
      definition,
      sprites: new Set()
    };

    this.layers.set(definition.name, layerGroup);
    this.updateLayerOrder();
    
    console.log(`Created layer: ${definition.name} (depth: ${definition.depth})`);
    
    return layer;
  }

  /**
   * Gets a layer by name
   */
  getLayer(name: string): Phaser.GameObjects.Layer | null {
    const layerGroup = this.layers.get(name);
    return layerGroup ? layerGroup.layer : null;
  }

  /**
   * Gets layer group information
   */
  getLayerGroup(name: string): LayerGroup | null {
    return this.layers.get(name) || null;
  }

  /**
   * Adds a sprite to a specific layer
   */
  addSpriteToLayer(sprite: Phaser.GameObjects.Sprite, layerName: string): boolean {
    const layerGroup = this.layers.get(layerName);
    if (!layerGroup) {
      console.warn(`Layer ${layerName} not found`);
      return false;
    }

    layerGroup.layer.add(sprite);
    layerGroup.sprites.add(sprite);
    
    // Store layer reference on sprite for easy access
    sprite.setData('layer', layerName);
    
    return true;
  }

  /**
   * Removes a sprite from its current layer
   */
  removeSpriteFromLayer(sprite: Phaser.GameObjects.Sprite): boolean {
    const currentLayer = sprite.getData('layer');
    if (!currentLayer) {
      return false;
    }

    const layerGroup = this.layers.get(currentLayer);
    if (!layerGroup) {
      return false;
    }

    layerGroup.layer.remove(sprite);
    layerGroup.sprites.delete(sprite);
    sprite.removeData('layer');
    
    return true;
  }

  /**
   * Moves a sprite from one layer to another
   */
  moveSpriteToLayer(sprite: Phaser.GameObjects.Sprite, newLayerName: string): boolean {
    this.removeSpriteFromLayer(sprite);
    return this.addSpriteToLayer(sprite, newLayerName);
  }

  /**
   * Sets layer visibility
   */
  setLayerVisible(layerName: string, visible: boolean): void {
    const layerGroup = this.layers.get(layerName);
    if (layerGroup) {
      layerGroup.layer.setVisible(visible);
      layerGroup.definition.visible = visible;
    }
  }

  /**
   * Sets layer alpha
   */
  setLayerAlpha(layerName: string, alpha: number): void {
    const layerGroup = this.layers.get(layerName);
    if (layerGroup) {
      layerGroup.layer.setAlpha(alpha);
      layerGroup.definition.alpha = alpha;
    }
  }

  /**
   * Sets layer depth (z-order)
   */
  setLayerDepth(layerName: string, depth: number): void {
    const layerGroup = this.layers.get(layerName);
    if (layerGroup) {
      layerGroup.layer.setDepth(depth);
      layerGroup.definition.depth = depth;
      this.updateLayerOrder();
    }
  }

  /**
   * Gets all sprites in a layer
   */
  getSpritesInLayer(layerName: string): Phaser.GameObjects.Sprite[] {
    const layerGroup = this.layers.get(layerName);
    return layerGroup ? Array.from(layerGroup.sprites) : [];
  }

  /**
   * Gets the number of sprites in a layer
   */
  getLayerSpriteCount(layerName: string): number {
    const layerGroup = this.layers.get(layerName);
    return layerGroup ? layerGroup.sprites.size : 0;
  }

  /**
   * Clears all sprites from a layer
   */
  clearLayer(layerName: string): void {
    const layerGroup = this.layers.get(layerName);
    if (layerGroup) {
      // Remove sprites from layer but don't destroy them
      layerGroup.sprites.forEach(sprite => {
        layerGroup.layer.remove(sprite);
        sprite.removeData('layer');
      });
      layerGroup.sprites.clear();
    }
  }

  /**
   * Destroys all sprites in a layer
   */
  destroyLayerSprites(layerName: string): void {
    const layerGroup = this.layers.get(layerName);
    if (layerGroup) {
      layerGroup.sprites.forEach(sprite => {
        sprite.destroy();
      });
      layerGroup.sprites.clear();
    }
  }

  /**
   * Removes and destroys a layer
   */
  destroyLayer(layerName: string): void {
    const layerGroup = this.layers.get(layerName);
    if (layerGroup) {
      this.destroyLayerSprites(layerName);
      layerGroup.layer.destroy();
      this.layers.delete(layerName);
      this.updateLayerOrder();
    }
  }

  /**
   * Gets all layer names in depth order
   */
  getLayerOrder(): string[] {
    return [...this.layerOrder];
  }

  /**
   * Gets layer information for debugging
   */
  getLayerInfo(): Array<{ name: string; depth: number; visible: boolean; spriteCount: number }> {
    return Array.from(this.layers.entries()).map(([name, group]) => ({
      name,
      depth: group.definition.depth,
      visible: group.definition.visible,
      spriteCount: group.sprites.size
    })).sort((a, b) => a.depth - b.depth);
  }

  /**
   * Toggles debug layer visibility
   */
  toggleDebugLayer(): void {
    const debugLayer = this.layers.get('debug');
    if (debugLayer) {
      const newVisibility = !debugLayer.definition.visible;
      this.setLayerVisible('debug', newVisibility);
      console.log(`Debug layer ${newVisibility ? 'shown' : 'hidden'}`);
    }
  }

  /**
   * Shows layer statistics
   */
  showLayerStats(): void {
    console.log('Layer Statistics:');
    console.table(this.getLayerInfo());
  }

  /**
   * Validates layer integrity
   */
  validateLayers(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const result = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Check for duplicate depths
    const depths = new Map<number, string[]>();
    for (const [name, group] of this.layers.entries()) {
      const depth = group.definition.depth;
      if (!depths.has(depth)) {
        depths.set(depth, []);
      }
      depths.get(depth)!.push(name);
    }

    for (const [depth, layerNames] of depths.entries()) {
      if (layerNames.length > 1) {
        result.warnings.push(`Multiple layers at depth ${depth}: ${layerNames.join(', ')}`);
      }
    }

    // Check for orphaned sprites
    for (const [layerName, group] of this.layers.entries()) {
      for (const sprite of group.sprites) {
        if (!sprite.active) {
          result.warnings.push(`Inactive sprite found in layer ${layerName}`);
        }
        
        const spriteLayer = sprite.getData('layer');
        if (spriteLayer !== layerName) {
          result.errors.push(`Sprite layer data mismatch in ${layerName}: expected ${layerName}, got ${spriteLayer}`);
          result.isValid = false;
        }
      }
    }

    return result;
  }

  /**
   * Optimizes layer performance by removing empty layers and consolidating
   */
  optimizeLayers(): void {
    const emptyLayers: string[] = [];
    
    for (const [name, group] of this.layers.entries()) {
      if (group.sprites.size === 0 && !this.isEssentialLayer(name)) {
        emptyLayers.push(name);
      }
    }
    
    emptyLayers.forEach(layerName => {
      console.log(`Removing empty layer: ${layerName}`);
      this.destroyLayer(layerName);
    });
    
    console.log(`Layer optimization complete. Removed ${emptyLayers.length} empty layers.`);
  }

  /**
   * Destroys all layers and cleans up
   */
  destroy(): void {
    for (const [name, group] of this.layers.entries()) {
      this.destroyLayerSprites(name);
      group.layer.destroy();
    }
    
    this.layers.clear();
    this.layerOrder = [];
    
    console.log('LayerManager destroyed and cleaned up');
  }

  // Private helper methods

  private updateLayerOrder(): void {
    this.layerOrder = Array.from(this.layers.keys()).sort((a, b) => {
      const depthA = this.layers.get(a)!.definition.depth;
      const depthB = this.layers.get(b)!.definition.depth;
      return depthA - depthB;
    });
  }

  private isEssentialLayer(layerName: string): boolean {
    // Essential layers that should not be removed even if empty
    const essentialLayers = ['background', 'maze-floor', 'maze-walls', 'game-objects', 'player', 'ui-elements'];
    return essentialLayers.includes(layerName);
  }

  // Public utility methods

  /**
   * Creates a temporary layer for effects
   */
  createTemporaryLayer(name: string, depth: number, duration?: number): Phaser.GameObjects.Layer {
    const tempDefinition: LayerDefinition = {
      name,
      depth,
      visible: true,
      alpha: 1
    };
    
    const layer = this.createLayer(tempDefinition);
    
    if (duration) {
      this.scene.time.delayedCall(duration, () => {
        this.destroyLayer(name);
      });
    }
    
    return layer;
  }

  /**
   * Animates layer properties
   */
  animateLayer(layerName: string, properties: any, duration: number = 1000): Phaser.Tweens.Tween | null {
    const layerGroup = this.layers.get(layerName);
    if (!layerGroup) {
      return null;
    }

    return this.scene.tweens.add({
      targets: layerGroup.layer,
      ...properties,
      duration,
      ease: 'Power2'
    });
  }

  /**
   * Fades a layer in or out
   */
  fadeLayer(layerName: string, targetAlpha: number, duration: number = 500): Phaser.Tweens.Tween | null {
    return this.animateLayer(layerName, { alpha: targetAlpha }, duration);
  }

  /**
   * Slides a layer to a new position
   */
  slideLayer(layerName: string, x: number, y: number, duration: number = 1000): Phaser.Tweens.Tween | null {
    return this.animateLayer(layerName, { x, y }, duration);
  }

  /**
   * Gets the appropriate layer for a sprite type
   */
  getLayerForSpriteType(spriteType: string): string {
    const layerMap: { [key: string]: string } = {
      'background': 'background',
      'floor': 'maze-floor',
      'wall': 'maze-walls',
      'orb': 'game-objects',
      'player': 'player',
      'effect': 'effects-low',
      'particle': 'effects-high',
      'ui': 'ui-elements',
      'button': 'ui-elements',
      'panel': 'ui-background',
      'overlay': 'ui-overlay',
      'debug': 'debug'
    };
    
    return layerMap[spriteType] || 'game-objects';
  }

  /**
   * Batch adds multiple sprites to layers
   */
  batchAddSprites(sprites: Array<{ sprite: Phaser.GameObjects.Sprite; layer: string }>): void {
    sprites.forEach(({ sprite, layer }) => {
      this.addSpriteToLayer(sprite, layer);
    });
  }

  /**
   * Sorts sprites within a layer by a custom criteria
   */
  sortLayerSprites(layerName: string, sortFn: (a: Phaser.GameObjects.Sprite, b: Phaser.GameObjects.Sprite) => number): void {
    const layerGroup = this.layers.get(layerName);
    if (!layerGroup) {
      return;
    }

    const sprites = Array.from(layerGroup.sprites).sort(sortFn);
    
    // Remove all sprites from layer
    layerGroup.sprites.forEach(sprite => {
      layerGroup.layer.remove(sprite);
    });
    
    // Re-add in sorted order
    sprites.forEach(sprite => {
      layerGroup.layer.add(sprite);
    });
  }
}