import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot') }
  preload() {
    // Minimal placeholder assets made with graphics in runtime
  }
  create() {
    this.scene.start('LevelSelect')
  }
}