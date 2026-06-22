import Phaser from 'phaser';
import { LEVELS, TOTAL_LEVELS } from '../systems/LevelData.js';

export default class LevelMapScene extends Phaser.Scene {
  constructor() { super('LevelMapScene'); }

  init(data) {
    this.difficultyKey = data.difficultyKey || 'medium';
    this.unlockedLevel = data.unlockedLevel || 1; // highest level player can play
  }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.cameras.main.setBackgroundColor('#0a0a0f');

    this.add.image(W / 2, H / 2, 'menu_background').setDisplaySize(W, H).setAlpha(0.5);

    this.add.text(W / 2, 36, 'CHOOSE YOUR DESCENT', {
      font: 'bold 24px monospace', fill: '#e8c97a'
    }).setOrigin(0.5);
    this.add.text(W / 2, 62, `Difficulty: ${this.difficultyKey.toUpperCase()}`, {
      font: '12px monospace', fill: '#999'
    }).setOrigin(0.5);

    // Winding path node positions (zig-zag like Diamond Rush)
    const positions = [
      [120, 460], [260, 410], [180, 340], [330, 290], [480, 330],
      [620, 280], [560, 200], [720, 160], [800, 240], [860, 130],
    ];

    // Draw connecting path lines first
    const g = this.add.graphics();
    g.lineStyle(4, 0x553a6b, 0.7);
    for (let i = 0; i < positions.length - 1; i++) {
      const [x1, y1] = positions[i];
      const [x2, y2] = positions[i + 1];
      g.lineBetween(x1, y1, x2, y2);
    }

    positions.forEach(([x, y], idx) => {
      const levelNum = idx + 1;
      const levelData = LEVELS[idx];
      const unlocked = levelNum <= this.unlockedLevel;
      const isBoss = levelData.isBoss;

      const radius = isBoss ? 28 : 22;
      const nodeColor = !unlocked ? 0x333333 : (isBoss ? 0x8b1a1a : 0x4a3060);
      const node = this.add.circle(x, y, radius, nodeColor)
        .setStrokeStyle(2, unlocked ? 0xe8c97a : 0x555555);

      const label = this.add.text(x, y, isBoss ? '☠' : String(levelNum), {
        font: isBoss ? '20px monospace' : 'bold 16px monospace',
        fill: unlocked ? '#ffffff' : '#666666'
      }).setOrigin(0.5);

      const nameText = this.add.text(x, y + radius + 12, levelData.name, {
        font: '9px monospace',
        fill: unlocked ? '#cccccc' : '#555555',
        align: 'center',
        wordWrap: { width: 100 }
      }).setOrigin(0.5, 0);

      if (unlocked) {
        node.setInteractive({ useHandCursor: true });
        node.on('pointerover', () => {
          node.setStrokeStyle(3, 0xffffff);
          this.tweens.add({ targets: node, scale: 1.1, duration: 100 });
        });
        node.on('pointerout', () => {
          node.setStrokeStyle(2, 0xe8c97a);
          this.tweens.add({ targets: node, scale: 1, duration: 100 });
        });
        node.on('pointerdown', () => {
          this.scene.start('GameScene', {
            mode: 'new',
            difficulty: this.difficultyKey,
            startLevel: levelNum,
          });
        });
      } else {
        node.setAlpha(0.5);
        label.setAlpha(0.5);
        nameText.setAlpha(0.5);
      }
    });

    const back = this.add.text(40, H - 30, '← Back', {
      font: '14px monospace', fill: '#777'
    }).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setColor('#e8c97a'));
    back.on('pointerout', () => back.setColor('#777'));
    back.on('pointerdown', () => this.scene.start('DifficultyScene'));
  }
}
