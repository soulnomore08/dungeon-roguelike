import Phaser from 'phaser';
import { LEVELS } from '../systems/LevelData.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  preload() {
    // Real pixel-art sprite sheets (32x32 frames, except boss 64x64)
    this.load.spritesheet('player_sheet', '/assets/sprites/player_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('grunt_sheet', '/assets/sprites/grunt_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('mage_sheet', '/assets/sprites/mage_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('archer_sheet', '/assets/sprites/archer_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('boss_sheet', '/assets/sprites/boss_sheet.png', { frameWidth: 64, frameHeight: 64 });

    // Backgrounds
    LEVELS.forEach(lvl => {
      this.load.image(lvl.bg, `/assets/backgrounds/${lvl.bg}.png`);
    });
    this.load.image('menu_background', '/assets/backgrounds/menu_background.png');

    // loading bar
    const W = this.cameras.main.width, H = this.cameras.main.height;
    const barBg = this.add.rectangle(W/2, H/2, 320, 18, 0x222222);
    const barFill = this.add.rectangle(W/2 - 158, H/2, 4, 14, 0xe8c97a).setOrigin(0, 0.5);
    this.load.on('progress', (val) => { barFill.width = 316 * val; });
  }

  create() {
    this.createGraphicTextures();
    this.createAnimations();
    this.scene.start('MainMenuScene');
  }

  createGraphicTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Projectiles
    g.fillStyle(0x9b59b6); g.fillCircle(6, 6, 6);
    g.fillStyle(0xd9b3ff); g.fillCircle(6, 6, 2);
    g.generateTexture('projectile', 12, 12); g.clear();

    g.fillStyle(0xff3030); g.fillCircle(8, 8, 8);
    g.fillStyle(0xffb0b0); g.fillCircle(8, 8, 3);
    g.generateTexture('boss_projectile', 16, 16); g.clear();

    g.fillStyle(0xc8a96e); g.fillRect(0, 2, 20, 3);
    g.fillStyle(0x888888); g.fillRect(16, 0, 4, 7);
    g.generateTexture('arrow', 20, 7); g.clear();

    g.fillStyle(0x90c890); g.fillRect(0, 2, 18, 2);
    g.fillStyle(0x666666); g.fillRect(14, 0, 4, 6);
    g.generateTexture('enemy_arrow', 18, 6); g.clear();

    // Tile (neutral light grey base so per-level tint colors render correctly via multiply)
    g.fillStyle(0xb8b8c0); g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xd8d8e0); g.fillRect(0, 0, 32, 4);
    g.fillStyle(0x90909a); g.fillRect(0, 28, 32, 4);
    g.generateTexture('tile', 32, 32); g.clear();

    // Portal
    g.fillStyle(0x2ecc71); g.fillCircle(16, 24, 16);
    g.fillStyle(0x58e090); g.fillCircle(16, 24, 9);
    g.generateTexture('portal', 32, 48); g.clear();

    // Sword swing arc fx
    g.fillStyle(0xf0c040); g.fillRect(0, 0, 36, 8);
    g.generateTexture('sword_fx', 36, 8); g.clear();

    // Dash trail
    g.fillStyle(0xa0d8ff); g.fillRect(0, 0, 20, 32);
    g.generateTexture('dash_trail', 20, 32); g.clear();

    // Particle dot
    g.fillStyle(0xffffff); g.fillCircle(3, 3, 3);
    g.generateTexture('particle', 6, 6); g.clear();

    // Decorations
    g.fillStyle(0x3a2818); g.fillRect(4, 10, 4, 16);
    g.fillStyle(0xff8800); g.fillCircle(6, 6, 6);
    g.fillStyle(0xffdd44); g.fillCircle(6, 6, 3);
    g.generateTexture('torch', 12, 26); g.clear();

    g.fillStyle(0xc8c0a8); g.fillRect(2, 0, 12, 10);
    g.fillStyle(0x1a1a1a); g.fillRect(4, 3, 3, 3);
    g.fillStyle(0x1a1a1a); g.fillRect(9, 3, 3, 3);
    g.fillStyle(0x8a8270); g.fillRect(5, 8, 6, 4);
    g.generateTexture('skull', 16, 12); g.clear();

    g.lineStyle(2, 0x555555);
    g.strokeCircle(4, 4, 3);
    g.strokeCircle(4, 12, 3);
    g.generateTexture('chain', 8, 18); g.clear();

    g.fillStyle(0x6b0f0f);
    g.fillCircle(8, 8, 7);
    g.fillCircle(3, 4, 3);
    g.fillCircle(14, 5, 3);
    g.fillCircle(5, 14, 3);
    g.generateTexture('blood_splat', 18, 18); g.clear();

    g.fillStyle(0x4a3825); g.fillRect(0, 0, 24, 24);
    g.fillStyle(0x6e573a); g.fillRect(2, 2, 20, 20);
    g.lineStyle(2, 0x342817);
    g.strokeRect(2, 2, 20, 20);
    g.generateTexture('crate', 24, 24); g.clear();

    g.fillStyle(0x2a2a2a); g.fillCircle(6, 10, 6);
    g.fillStyle(0x3a3a3a); g.fillCircle(14, 8, 5);
    g.fillStyle(0x222222); g.fillCircle(20, 11, 4);
    g.generateTexture('rubble', 26, 16); g.clear();

    g.destroy();
  }

  createAnimations() {
    const A = this.anims;

    // Player: idle(0,1) walk(1,4) attack(5,4) jump(9,1) jump_attack(10,1) death(11,4)
    A.create({ key: 'player_idle', frames: A.generateFrameNumbers('player_sheet', { start: 0, end: 0 }), frameRate: 1, repeat: -1 });
    A.create({ key: 'player_walk', frames: A.generateFrameNumbers('player_sheet', { start: 1, end: 4 }), frameRate: 8, repeat: -1 });
    A.create({ key: 'player_attack', frames: A.generateFrameNumbers('player_sheet', { start: 5, end: 8 }), frameRate: 16, repeat: 0 });
    A.create({ key: 'player_jump', frames: A.generateFrameNumbers('player_sheet', { start: 9, end: 9 }), frameRate: 1, repeat: 0 });
    A.create({ key: 'player_jump_attack', frames: A.generateFrameNumbers('player_sheet', { start: 10, end: 10 }), frameRate: 1, repeat: 0 });
    A.create({ key: 'player_death', frames: A.generateFrameNumbers('player_sheet', { start: 11, end: 14 }), frameRate: 6, repeat: 0 });

    // Grunt: idle(0,1) walk(1,4) attack(5,4) telegraph(9,1) death(10,4)
    A.create({ key: 'grunt_idle', frames: A.generateFrameNumbers('grunt_sheet', { start: 0, end: 0 }), frameRate: 1, repeat: -1 });
    A.create({ key: 'grunt_walk', frames: A.generateFrameNumbers('grunt_sheet', { start: 1, end: 4 }), frameRate: 7, repeat: -1 });
    A.create({ key: 'grunt_attack', frames: A.generateFrameNumbers('grunt_sheet', { start: 5, end: 8 }), frameRate: 12, repeat: 0 });
    A.create({ key: 'grunt_telegraph', frames: A.generateFrameNumbers('grunt_sheet', { start: 9, end: 9 }), frameRate: 1, repeat: 0 });
    A.create({ key: 'grunt_death', frames: A.generateFrameNumbers('grunt_sheet', { start: 10, end: 13 }), frameRate: 6, repeat: 0 });

    // Mage: idle(0,1) float(1,4) cast(5,4) telegraph(9,1) death(10,4)
    A.create({ key: 'mage_idle', frames: A.generateFrameNumbers('mage_sheet', { start: 0, end: 0 }), frameRate: 1, repeat: -1 });
    A.create({ key: 'mage_float', frames: A.generateFrameNumbers('mage_sheet', { start: 1, end: 4 }), frameRate: 5, repeat: -1 });
    A.create({ key: 'mage_cast', frames: A.generateFrameNumbers('mage_sheet', { start: 5, end: 8 }), frameRate: 10, repeat: 0 });
    A.create({ key: 'mage_telegraph', frames: A.generateFrameNumbers('mage_sheet', { start: 9, end: 9 }), frameRate: 1, repeat: 0 });
    A.create({ key: 'mage_death', frames: A.generateFrameNumbers('mage_sheet', { start: 10, end: 13 }), frameRate: 6, repeat: 0 });

    // Archer: idle(0,1) walk(1,4) shoot(5,4) telegraph(9,1) death(10,4)
    A.create({ key: 'archer_idle', frames: A.generateFrameNumbers('archer_sheet', { start: 0, end: 0 }), frameRate: 1, repeat: -1 });
    A.create({ key: 'archer_walk', frames: A.generateFrameNumbers('archer_sheet', { start: 1, end: 4 }), frameRate: 7, repeat: -1 });
    A.create({ key: 'archer_shoot', frames: A.generateFrameNumbers('archer_sheet', { start: 5, end: 8 }), frameRate: 12, repeat: 0 });
    A.create({ key: 'archer_telegraph', frames: A.generateFrameNumbers('archer_sheet', { start: 9, end: 9 }), frameRate: 1, repeat: 0 });
    A.create({ key: 'archer_death', frames: A.generateFrameNumbers('archer_sheet', { start: 10, end: 13 }), frameRate: 6, repeat: 0 });

    // Boss: idle(0,1) walk(1,4) telegraph(5,1) slam(6,1) idle_enraged(7,1) walk_enraged(8,4) telegraph_enraged(12,1) slam_enraged(13,1) death(14,4)
    A.create({ key: 'boss_idle', frames: A.generateFrameNumbers('boss_sheet', { start: 0, end: 0 }), frameRate: 1, repeat: -1 });
    A.create({ key: 'boss_walk', frames: A.generateFrameNumbers('boss_sheet', { start: 1, end: 4 }), frameRate: 6, repeat: -1 });
    A.create({ key: 'boss_telegraph', frames: A.generateFrameNumbers('boss_sheet', { start: 5, end: 5 }), frameRate: 1, repeat: 0 });
    A.create({ key: 'boss_slam', frames: A.generateFrameNumbers('boss_sheet', { start: 6, end: 6 }), frameRate: 1, repeat: 0 });
    A.create({ key: 'boss_idle_enraged', frames: A.generateFrameNumbers('boss_sheet', { start: 7, end: 7 }), frameRate: 1, repeat: -1 });
    A.create({ key: 'boss_walk_enraged', frames: A.generateFrameNumbers('boss_sheet', { start: 8, end: 11 }), frameRate: 8, repeat: -1 });
    A.create({ key: 'boss_telegraph_enraged', frames: A.generateFrameNumbers('boss_sheet', { start: 12, end: 12 }), frameRate: 1, repeat: 0 });
    A.create({ key: 'boss_slam_enraged', frames: A.generateFrameNumbers('boss_sheet', { start: 13, end: 13 }), frameRate: 1, repeat: 0 });
    A.create({ key: 'boss_death', frames: A.generateFrameNumbers('boss_sheet', { start: 14, end: 17 }), frameRate: 5, repeat: 0 });
  }
}
