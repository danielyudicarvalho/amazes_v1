import Phaser from 'phaser'
import { GameScene } from './scenes/GameScene'
import { BootScene } from './scenes/BootScene'
import { LevelSelectScene } from './scenes/LevelSelectScene'
import { initFirebase } from './services/firebase'

initFirebase()

const width = 360
const height = 640

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#0f0f12',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width, height },
  physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
  scene: [BootScene, LevelSelectScene, GameScene],
}

new Phaser.Game(config)