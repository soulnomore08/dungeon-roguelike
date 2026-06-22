import Phaser from 'phaser';
import { DIFFICULTIES } from '../systems/SaveSystem.js';

export default class DifficultyScene extends Phaser.Scene {
  constructor() { super('DifficultyScene'); }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.cameras.main.setBackgroundColor('#0a0a0f');

    this.add.text(W / 2, 100, 'CHOOSE YOUR FATE', {
      font: 'bold 28px monospace', fill: '#e8c97a'
    }).setOrigin(0.5);

    const options = [
      { key: 'easy',   desc: 'Weaker enemies, more XP. Good for learning the dungeon.' },
      { key: 'medium', desc: 'The intended experience. Balanced challenge.' },
      { key: 'hard',   desc: 'Brutal enemies, less forgiving. For the skilled.' },
    ];

    options.forEach((opt, i) => {
      const y = 200 + i * 100;
      const d = DIFFICULTIES[opt.key];

      const box = this.add.rectangle(W / 2, y, 480, 76, 0x1a1a2e, 0.9)
        .setStrokeStyle(1, 0x8e44ad)
        .setInteractive({ useHandCursor: true });

      const title = this.add.text(W / 2, y - 16, d.label, {
        font: 'bold 18px monospace', fill: '#cccccc'
      }).setOrigin(0.5);

      const desc = this.add.text(W / 2, y + 12, opt.desc, {
        font: '11px monospace', fill: '#999999'
      }).setOrigin(0.5);

      box.on('pointerover', () => {
        box.setStrokeStyle(2, 0xe8c97a);
        title.setColor('#e8c97a');
      });
      box.on('pointerout', () => {
        box.setStrokeStyle(1, 0x8e44ad);
        title.setColor('#cccccc');
      });
      box.on('pointerdown', () => {
        this.scene.start('LevelMapScene', { difficultyKey: opt.key, unlockedLevel: 1 });
      });
    });

    const back = this.add.text(W / 2, H - 40, '← Back', {
      font: '14px monospace', fill: '#777'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setColor('#e8c97a'));
    back.on('pointerout', () => back.setColor('#777'));
    back.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
