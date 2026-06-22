import Phaser from 'phaser';
import { pickRandomUpgrades } from '../systems/XPSystem.js';
import { TOTAL_LEVELS } from '../systems/LevelData.js';

export default class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  setGame(gameScene) { this.gameScene = gameScene; }

  create() {
    this.hpText     = this.add.text(16, 16, '', { font: '14px monospace', fill: '#e74c3c' });
    this.xpText     = this.add.text(16, 34, '', { font: '14px monospace', fill: '#9b59b6' });
    this.weaponText = this.add.text(16, 52, '', { font: '12px monospace', fill: '#aaccee' });
    this.dashText   = this.add.text(16, 68, '', { font: '11px monospace', fill: '#777' });

    this.floorText = this.add.text(800, 16, '', { font: '14px monospace', fill: '#e8c97a' });
    this.killText  = this.add.text(800, 34, '', { font: '14px monospace', fill: '#aaaaaa' });

    this.escText = this.add.text(800, 52, 'ESC — Menu', { font: '11px monospace', fill: '#555' });

    this.bossBarBg = this.add.rectangle(480, 60, 500, 14, 0x222222).setVisible(false);
    this.bossBarFill = this.add.rectangle(480, 60, 500, 14, 0xff3030).setVisible(false);
    this.bossLabel = this.add.text(480, 40, '', { font: '13px monospace', fill: '#ff6060' })
      .setOrigin(0.5).setVisible(false);

    this.levelBanner = this.add.text(480, 220, '', {
      font: 'bold 26px monospace', fill: '#e8c97a', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    this.gameScene.events.on('levelup', () => this.showUpgradePanel());
    this.gameScene.events.on('gameover', (stats) => this.showGameOver(stats));
    this.gameScene.events.on('victory', (stats) => this.showVictory(stats));
    this.gameScene.events.on('levelstart', (name, num) => this.flashLevelBanner(name, num));
    this.gameScene.events.on('bossspawn', (boss) => this.showBossBar(boss.name));
    this.gameScene.events.on('bosshp', (hp, maxHp) => this.updateBossBar(hp, maxHp));
    this.gameScene.events.on('bossdefeat', () => this.hideBossBar());

    this.panelOverlay = document.getElementById('panel-overlay');
    this.panelTitle = document.getElementById('panel-title');
    this.panelSubtitle = document.getElementById('panel-subtitle');
    this.panelButtons = document.getElementById('panel-buttons');

    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  update() {
    if (!this.gameScene || !this.gameScene.player) return;
    const p = this.gameScene.player;
    this.hpText.setText(`HP: ${Math.max(0, Math.round(p.hp))} / ${p.maxHp}`);
    this.xpText.setText(`XP: ${p.xp} / ${p.xpNext}  LVL ${p.level}`);
    this.weaponText.setText(`Weapon: ${p.weapon.toUpperCase()} (Q to switch)`);
    const dashReady = p.dashCooldown <= 0;
    this.dashText.setText(dashReady ? 'Dash: READY (Shift)' : `Dash: ${p.dashCooldown.toFixed(1)}s`);
    this.dashText.setColor(dashReady ? '#7fffaa' : '#777');

    this.floorText.setText(`Level ${this.gameScene.levelNumber} / ${TOTAL_LEVELS}`);
    this.killText.setText(`Kills: ${p.kills}`);

    if (Phaser.Input.Keyboard.JustDown(this.escKey) && !this.gameScene.gameOverFlag) {
      this.showPauseMenu();
    }
  }

  flashLevelBanner(name, num) {
    this.levelBanner.setText(`LEVEL ${num}\n${name}`);
    this.levelBanner.setAlpha(1);
    this.tweens.add({
      targets: this.levelBanner,
      alpha: 0,
      delay: 1400,
      duration: 600,
    });
  }

  showBossBar(name) {
    this.bossBarBg.setVisible(true);
    this.bossBarFill.setVisible(true);
    this.bossLabel.setText(name || 'BOSS').setVisible(true);
  }

  updateBossBar(hp, maxHp) {
    const pct = Math.max(0, hp / maxHp);
    this.bossBarFill.setScale(pct, 1);
    this.bossBarFill.x = 480 - (500 * (1 - pct)) / 2;
  }

  hideBossBar() {
    this.bossBarBg.setVisible(false);
    this.bossBarFill.setVisible(false);
    this.bossLabel.setVisible(false);
  }

  showUpgradePanel() {
    this.scene.pause('GameScene');
    const options = pickRandomUpgrades(3);

    this.panelTitle.textContent = 'LEVEL UP';
    this.panelTitle.style.color = '#e8c97a';
    this.panelSubtitle.textContent = 'Choose a boon to grow stronger';
    this.panelButtons.innerHTML = '';

    options.forEach(upg => {
      const btn = document.createElement('button');
      btn.className = 'panel-btn';
      btn.textContent = upg.label;
      btn.onclick = () => {
        upg.apply(this.gameScene.player);
        this.panelOverlay.style.display = 'none';
        this.scene.resume('GameScene');
      };
      this.panelButtons.appendChild(btn);
    });

    this.panelOverlay.style.display = 'flex';
  }

  showPauseMenu() {
    this.scene.pause('GameScene');
    this.panelTitle.textContent = 'PAUSED';
    this.panelTitle.style.color = '#e8c97a';
    this.panelSubtitle.textContent = '';
    this.panelButtons.innerHTML = '';

    const resumeBtn = document.createElement('button');
    resumeBtn.className = 'panel-btn panel-btn-wide';
    resumeBtn.textContent = 'Resume';
    resumeBtn.onclick = () => {
      this.panelOverlay.style.display = 'none';
      this.scene.resume('GameScene');
    };

    const menuBtn = document.createElement('button');
    menuBtn.className = 'panel-btn panel-btn-wide';
    menuBtn.textContent = 'Save & Exit to Menu';
    menuBtn.onclick = () => {
      this.gameScene.persistProgress();
      this.panelOverlay.style.display = 'none';
      this.hideBossBar();
      this.scene.stop('GameScene');
      this.scene.stop('UIScene');
      this.scene.start('LevelMapScene', {
        difficultyKey: this.gameScene.difficultyKey,
        unlockedLevel: this.gameScene.levelNumber
      });
    };

    this.panelButtons.appendChild(resumeBtn);
    this.panelButtons.appendChild(menuBtn);
    this.panelOverlay.style.display = 'flex';
  }

  showGameOver(stats) {
    this.panelTitle.textContent = 'YOU DIED';
    this.panelTitle.style.color = '#ff5050';
    this.panelSubtitle.textContent = `Level ${stats.level}  •  ${stats.kills} kills  •  Char Level ${stats.playerLevel}`;
    this.panelButtons.innerHTML = '';

    const btn = document.createElement('button');
    btn.className = 'panel-btn panel-btn-wide';
    btn.textContent = 'Return to Menu';
    btn.onclick = () => {
      this.panelOverlay.style.display = 'none';
      this.panelTitle.style.color = '#e8c97a';
      this.hideBossBar();
      this.gameScene.restartGame();
    };
    this.panelButtons.appendChild(btn);

    this.panelOverlay.style.display = 'flex';
  }

  showVictory(stats) {
    this.panelTitle.textContent = 'VICTORY!';
    this.panelTitle.style.color = '#7fffaa';
    this.panelSubtitle.textContent = `You conquered all ${TOTAL_LEVELS} levels — ${stats.kills} kills, Character Level ${stats.playerLevel}`;
    this.panelButtons.innerHTML = '';

    const btn = document.createElement('button');
    btn.className = 'panel-btn panel-btn-wide';
    btn.textContent = 'Return to Menu';
    btn.onclick = () => {
      this.panelOverlay.style.display = 'none';
      this.panelTitle.style.color = '#e8c97a';
      this.hideBossBar();
      this.gameScene.restartGame();
    };
    this.panelButtons.appendChild(btn);

    this.panelOverlay.style.display = 'flex';
  }
}
