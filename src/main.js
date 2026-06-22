import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import DifficultyScene from './scenes/DifficultyScene.js';
import LevelMapScene from './scenes/LevelMapScene.js';
import OptionsScene from './scenes/OptionsScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#0a0a0f',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 700 }, debug: false }
  },
  scene: [BootScene, PreloadScene, MainMenuScene, DifficultyScene, LevelMapScene, OptionsScene, GameScene, UIScene]
};

window.__game = new Phaser.Game(config);
