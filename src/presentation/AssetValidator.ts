// Asset validation utilities for enhanced asset management

import { AssetManifest, ThemeDefinition, AtlasDefinition, AssetValidationResult } from './AssetManager';

export interface ValidationRule {
  name: string;
  validate: (manifest: AssetManifest) => string[];
}

export class AssetValidator {
  private rules: ValidationRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Validates an asset manifest against all registered rules
   */
  validateManifest(manifest: AssetManifest): AssetValidationResult {
    const result: AssetValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Run all validation rules
    for (const rule of this.rules) {
      try {
        const ruleErrors = rule.validate(manifest);
        if (ruleErrors.length > 0) {
          result.errors.push(...ruleErrors.map(error => `${rule.name}: ${error}`));
        }
      } catch (error) {
        result.errors.push(`${rule.name}: Validation rule failed - ${error}`);
      }
    }

    // Determine if manifest is valid
    result.isValid = result.errors.length === 0;

    return result;
  }

  /**
   * Validates theme consistency and completeness
   */
  validateTheme(theme: ThemeDefinition, atlases: AtlasDefinition[]): AssetValidationResult {
    const result: AssetValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check required theme properties
    if (!theme.id || theme.id.trim() === '') {
      result.errors.push('Theme ID is required');
    }

    if (!theme.name || theme.name.trim() === '') {
      result.errors.push('Theme name is required');
    }

    if (!theme.assets) {
      result.errors.push('Theme assets are required');
    } else {
      // Validate theme assets structure
      this.validateThemeAssets(theme, atlases, result);
    }

    // Validate color palette
    if (!theme.colors) {
      result.warnings.push('Theme missing color palette');
    } else {
      this.validateColorPalette(theme.colors, result);
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Validates atlas definitions
   */
  validateAtlas(atlas: AtlasDefinition): AssetValidationResult {
    const result: AssetValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!atlas.key || atlas.key.trim() === '') {
      result.errors.push('Atlas key is required');
    }

    if (!atlas.imagePath || atlas.imagePath.trim() === '') {
      result.errors.push('Atlas image path is required');
    }

    if (!atlas.dataPath || atlas.dataPath.trim() === '') {
      result.errors.push('Atlas data path is required');
    }

    // Validate file extensions
    if (atlas.imagePath && !this.isValidImageExtension(atlas.imagePath)) {
      result.warnings.push(`Atlas image should be PNG or JPG: ${atlas.imagePath}`);
    }

    if (atlas.dataPath && !atlas.dataPath.endsWith('.json')) {
      result.warnings.push(`Atlas data should be JSON: ${atlas.dataPath}`);
    }

    // Validate priority
    if (atlas.priority !== undefined && (atlas.priority < 0 || atlas.priority > 100)) {
      result.warnings.push('Atlas priority should be between 0 and 100');
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Adds a custom validation rule
   */
  addValidationRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Removes a validation rule by name
   */
  removeValidationRule(ruleName: string): void {
    this.rules = this.rules.filter(rule => rule.name !== ruleName);
  }

  /**
   * Gets all registered validation rules
   */
  getValidationRules(): ValidationRule[] {
    return [...this.rules];
  }

  private initializeDefaultRules(): void {
    // Basic structure validation
    this.addValidationRule({
      name: 'BasicStructure',
      validate: (manifest: AssetManifest) => {
        const errors: string[] = [];
        
        if (!manifest.version) {
          errors.push('Manifest version is required');
        }
        
        if (!manifest.themes || !Array.isArray(manifest.themes)) {
          errors.push('Themes array is required');
        }
        
        if (!manifest.atlases || !Array.isArray(manifest.atlases)) {
          errors.push('Atlases array is required');
        }
        
        return errors;
      }
    });

    // Theme validation
    this.addValidationRule({
      name: 'ThemeValidation',
      validate: (manifest: AssetManifest) => {
        const errors: string[] = [];
        
        if (manifest.themes.length === 0) {
          errors.push('At least one theme is required');
        }
        
        const themeIds = new Set<string>();
        for (const theme of manifest.themes) {
          if (themeIds.has(theme.id)) {
            errors.push(`Duplicate theme ID: ${theme.id}`);
          }
          themeIds.add(theme.id);
        }
        
        return errors;
      }
    });

    // Atlas validation
    this.addValidationRule({
      name: 'AtlasValidation',
      validate: (manifest: AssetManifest) => {
        const errors: string[] = [];
        
        const atlasKeys = new Set<string>();
        for (const atlas of manifest.atlases) {
          if (atlasKeys.has(atlas.key)) {
            errors.push(`Duplicate atlas key: ${atlas.key}`);
          }
          atlasKeys.add(atlas.key);
        }
        
        return errors;
      }
    });

    // Asset reference validation
    this.addValidationRule({
      name: 'AssetReferences',
      validate: (manifest: AssetManifest) => {
        const errors: string[] = [];
        const atlasKeys = new Set(manifest.atlases.map(a => a.key));
        
        // Check if all referenced atlases exist
        for (const theme of manifest.themes) {
          this.validateAssetReferences(theme.assets, atlasKeys, errors, theme.id);
        }
        
        return errors;
      }
    });
  }

  private validateThemeAssets(theme: ThemeDefinition, atlases: AtlasDefinition[], result: AssetValidationResult): void {
    const atlasKeys = new Set(atlases.map(a => a.key));

    // Check player asset
    if (!theme.assets.player) {
      result.errors.push('Theme missing player asset');
    } else if (!atlasKeys.has(theme.assets.player.atlas)) {
      result.errors.push(`Player asset references unknown atlas: ${theme.assets.player.atlas}`);
    }

    // Check orb assets
    if (!theme.assets.orbs || theme.assets.orbs.length === 0) {
      result.warnings.push('Theme has no orb assets');
    } else {
      for (const orb of theme.assets.orbs) {
        if (!atlasKeys.has(orb.atlas)) {
          result.errors.push(`Orb asset references unknown atlas: ${orb.atlas}`);
        }
      }
    }

    // Check maze assets
    if (!theme.assets.maze) {
      result.errors.push('Theme missing maze assets');
    } else {
      if (!theme.assets.maze.walls || theme.assets.maze.walls.length === 0) {
        result.warnings.push('Theme has no wall assets');
      }
      if (!theme.assets.maze.floors || theme.assets.maze.floors.length === 0) {
        result.warnings.push('Theme has no floor assets');
      }
    }

    // Check UI assets
    if (!theme.assets.ui) {
      result.warnings.push('Theme missing UI assets');
    }
  }

  private validateColorPalette(colors: any, result: AssetValidationResult): void {
    const requiredColors = ['primary', 'secondary', 'accent', 'background'];
    
    for (const colorName of requiredColors) {
      if (!colors[colorName]) {
        result.warnings.push(`Missing color: ${colorName}`);
      } else if (!this.isValidHexColor(colors[colorName])) {
        result.warnings.push(`Invalid hex color for ${colorName}: ${colors[colorName]}`);
      }
    }
  }

  private validateAssetReferences(assets: any, atlasKeys: Set<string>, errors: string[], themeId: string): void {
    const checkAsset = (asset: any, path: string) => {
      if (asset && asset.atlas && !atlasKeys.has(asset.atlas)) {
        errors.push(`Theme ${themeId} asset at ${path} references unknown atlas: ${asset.atlas}`);
      }
    };

    const traverse = (obj: any, path: string = '') => {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          traverse(item, `${path}[${index}]`);
        });
      } else if (obj && typeof obj === 'object') {
        if (obj.atlas) {
          checkAsset(obj, path);
        } else {
          Object.keys(obj).forEach(key => {
            traverse(obj[key], path ? `${path}.${key}` : key);
          });
        }
      }
    };

    traverse(assets);
  }

  private isValidImageExtension(path: string): boolean {
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    return validExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
}

// Singleton instance for global use
export const assetValidator = new AssetValidator();