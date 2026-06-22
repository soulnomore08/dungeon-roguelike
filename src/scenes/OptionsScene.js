import Phaser from 'phaser';

const OPTIONS_KEY = 'dungeon_roguelike_options';

export function loadOptions() {
  try {
    const raw = localStorage.getItem(OPTIONS_KEY);
    return raw ? JSON.parse(raw) : { musicVolume: 0.6, sfxVolume: 0.8, screenShake: true };
  } catch (e) {
    return { musicVolume: 0.6, sfxVolume: 0.8, screenShake: true };
  }
}

function saveOptions(opts) {
  try { localStorage.setItem(OPTIONS_KEY, JSON.stringify(opts)); } catch (e) { /* ignore */ }
}

export default class OptionsScene extends Phaser.Scene {
  constructor() { super('OptionsScene'); }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.cameras.main.setBackgroundColor('#0a0a0f');
    this.opts = loadOptions();

    this.add.text(W / 2, 90, 'OPTIONS', {
      font: 'bold 28px monospace', fill: '#e8c97a'
    }).setOrigin(0.5);

    this.buildSlider('Music Volume', 200, 'musicVolume');
    this.buildSlider('SFX Volume', 270, 'sfxVolume');
    this.buildToggle('Screen Shake', 340, 'screenShake');

    const back = this.add.text(W / 2, H - 40, '← Back to Menu', {
      font: '14px monospace', fill: '#777'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setColor('#e8c97a'));
    back.on('pointerout', () => back.setColor('#777'));
    back.on('pointerdown', () => {
      saveOptions(this.opts);
      this.scene.start('MainMenuScene');
    });
  }

  buildSlider(label, y, key) {
    const W = this.cameras.main.width;
    this.add.text(W / 2 - 200, y, label, { font: '14px monospace', fill: '#ccc' }).setOrigin(0, 0.5);

    const trackX = W / 2 - 20, trackW = 200;
    this.add.rectangle(trackX + trackW / 2, y, trackW, 6, 0x333333);
    const fill = this.add.rectangle(trackX, y, trackW * this.opts[key], 6, 0x8e44ad).setOrigin(0, 0.5);

    const handle = this.add.circle(trackX + trackW * this.opts[key], y, 8, 0xe8c97a)
      .setInteractive({ useHandCursor: true, draggable: true });

    this.input.setDraggable(handle);
    handle.on('drag', (pointer, dragX) => {
      const clamped = Phaser.Math.Clamp(dragX, trackX, trackX + trackW);
      handle.x = clamped;
      const pct = (clamped - trackX) / trackW;
      this.opts[key] = Math.round(pct * 100) / 100;
      fill.width = trackW * pct;
    });
  }

  buildToggle(label, y, key) {
    const W = this.cameras.main.width;
    this.add.text(W / 2 - 200, y, label, { font: '14px monospace', fill: '#ccc' }).setOrigin(0, 0.5);

    const box = this.add.rectangle(W / 2 + 80, y, 28, 28, this.opts[key] ? 0x2ecc71 : 0x333333)
      .setStrokeStyle(1, 0x8e44ad)
      .setInteractive({ useHandCursor: true });

    box.on('pointerdown', () => {
      this.opts[key] = !this.opts[key];
      box.setFillStyle(this.opts[key] ? 0x2ecc71 : 0x333333);
    });
  }
}
