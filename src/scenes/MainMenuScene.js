import Phaser from 'phaser';
import { hasSave } from '../systems/SaveSystem.js';

export default class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#0a0a0f');
    this.add.image(W / 2, H / 2, 'menu_background').setDisplaySize(W, H);

    // ambient flicker torches either side of title
    this.add.image(W / 2 - 220, 140, 'torch').setScale(2);
    this.add.image(W / 2 + 220, 140, 'torch').setScale(2);
    this.add.image(W / 2, 250, 'skull').setScale(2).setAlpha(0.5);

    this.add.text(W / 2, 130, 'DUNGEON', {
      font: 'bold 48px monospace', fill: '#e8c97a'
    }).setOrigin(0.5);
    this.add.text(W / 2, 178, 'R O G U E L I K E', {
      font: '16px monospace', fill: '#8e44ad', letterSpacing: 4
    }).setOrigin(0.5);

    const continueEnabled = hasSave();
    const items = [
      { label: 'Continue', enabled: continueEnabled, action: () => this.onContinue() },
      { label: 'New Game', enabled: true, action: () => this.scene.start('DifficultyScene') },
      { label: 'Options', enabled: true, action: () => this.scene.start('OptionsScene') },
      { label: 'Exit', enabled: true, action: () => this.onExit() },
    ];

    const startY = 320;
    items.forEach((item, i) => {
      const y = startY + i * 46;
      const txt = this.add.text(W / 2, y, item.label, {
        font: '22px monospace',
        fill: item.enabled ? '#cccccc' : '#555555'
      }).setOrigin(0.5);

      if (item.enabled) {
        txt.setInteractive({ useHandCursor: true });
        txt.on('pointerover', () => txt.setColor('#e8c97a').setScale(1.08));
        txt.on('pointerout', () => txt.setColor('#cccccc').setScale(1));
        txt.on('pointerdown', item.action);
      }
    });

    this.add.text(W / 2, H - 24, 'Arrow keys / WASD — move   Space — attack   Q — weapon   Shift — dash', {
      font: '11px monospace', fill: '#444'
    }).setOrigin(0.5);
  }

  onContinue() {
    this.scene.start('GameScene', { mode: 'continue' });
  }

  onExit() {
    // Browser context: can't truly close the tab from JS in most cases.
    // Show a friendly message instead.
    const W = this.cameras.main.width, H = this.cameras.main.height;
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85);
    const txt = this.add.text(W / 2, H / 2, 'Thanks for playing!\nYou can close this tab now.', {
      font: '18px monospace', fill: '#e8c97a', align: 'center'
    }).setOrigin(0.5);
    try { window.close(); } catch (e) { /* most browsers block this */ }
  }
}
