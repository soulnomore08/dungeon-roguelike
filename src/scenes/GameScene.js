import Phaser from 'phaser';
import Player from '../entities/Player.js';
import FloorManager from '../systems/FloorManager.js';
import { DIFFICULTIES, saveGame, loadGame, clearSave } from '../systems/SaveSystem.js';
import { getLevel, TOTAL_LEVELS } from '../systems/LevelData.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.startMode = data.mode || 'new';
    this.startDifficultyKey = data.difficulty || 'medium';
    this.startLevel = data.startLevel || 1;
  }

  create() {
    this.gameOverFlag = false;
    this.transitioning = false;
    this.portal = null;

    if (this.startMode === 'continue') {
      const saved = loadGame();
      if (saved) {
        this.levelNumber = saved.levelNumber;
        this.difficultyKey = saved.difficultyKey;
      } else {
        this.levelNumber = 1;
        this.difficultyKey = 'medium';
      }
    } else {
      this.levelNumber = this.startLevel;
      this.difficultyKey = this.startDifficultyKey;
    }

    this.difficulty = DIFFICULTIES[this.difficultyKey] || DIFFICULTIES.medium;

    this.floorManager = new FloorManager(this);
    this.floorManager.buildFloor();

    this.player = new Player(this, 60, 250);

    if (this.startMode === 'continue') {
      const saved = loadGame();
      if (saved) {
        this.player.maxHp = saved.maxHp;
        this.player.hp = saved.hp;
        this.player.atk = saved.atk;
        this.player.speed = saved.speed;
        this.player.level = saved.level;
        this.player.xp = saved.xp;
        this.player.xpNext = saved.xpNext;
        this.player.kills = saved.kills;
        this.player.critChance = saved.critChance ?? 0.05;
      }
    }

    this.enemies = this.physics.add.group();
    this.floorManager.spawnEnemies(this.enemies, this.player);

    this.scene.launch('UIScene');
    this.scene.get('UIScene').setGame(this);

    // Collisions
    this.physics.add.collider(this.player.sprite, this.floorManager.platforms);
    this.physics.add.collider(this.enemies, this.floorManager.platforms);
    this.physics.add.collider(this.player.sprite, this.enemies);

    // Melee hit (player sword)
    this.physics.add.overlap(
      this.player.attackHitbox,
      this.enemies,
      (hb, enemySprite) => {
        const ref = enemySprite.getData('ref');
        if (!ref) return;
        const { dmg, isCrit } = this.player.rollDamage(this.player.atk);
        ref.onHit(dmg, isCrit);
        this.showDamageNumber(enemySprite.x, enemySprite.y - 10, Math.round(dmg), isCrit ? '#ffe066' : '#ffffff');
      },
      null, this
    );

    // Arrow hit
    this.physics.add.overlap(
      this.player.arrows,
      this.enemies,
      (arrow, enemySprite) => {
        const ref = enemySprite.getData('ref');
        if (!ref) return;
        const { dmg, isCrit } = this.player.rollDamage(arrow.getData('dmg'));
        ref.onHit(dmg, isCrit);
        this.showDamageNumber(enemySprite.x, enemySprite.y - 10, Math.round(dmg), isCrit ? '#ffe066' : '#ffffff');
        arrow.destroy();
      },
      null, this
    );

    this.cameras.main.setBounds(0, 0, 960, 540);
    this.events.emit('levelstart', getLevel(this.levelNumber).name, this.levelNumber);
  }

  spawnDeathParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const p = this.add.image(x, y, 'particle');
      p.setTint(color);
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed - 20,
        alpha: 0,
        duration: 500 + Math.random() * 300,
        onComplete: () => p.destroy()
      });
    }
  }

  showDamageNumber(x, y, amount, color = '#ffffff') {
    const txt = this.add.text(x, y, `-${amount}`, {
      font: 'bold 16px monospace',
      fill: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 30,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  update(time, delta) {
    if (this.gameOverFlag) return;

    this.player.update(time, delta);

    this.enemies.getChildren().forEach(e => {
      const ref = e.getData('ref');
      if (ref) ref.update(time, delta);
    });

    if (this.enemies.countActive(true) === 0 && !this.portal && !this.transitioning) {
      this.portal = this.physics.add.staticImage(900, 490, 'portal');
      this.physics.add.overlap(
        this.player.sprite, this.portal,
        () => this.nextFloor(), null, this
      );
    }

    if (this.player.hp <= 0 && !this.gameOverFlag) this.triggerGameOver();
  }

  persistProgress() {
    const prevSave = loadGame();
    const highestUnlocked = Math.max(
      prevSave?.unlockedLevel || 1,
      Math.min(this.levelNumber + 1, TOTAL_LEVELS)
    );
    saveGame({
      levelNumber: this.levelNumber,
      difficultyKey: this.difficultyKey,
      unlockedLevel: highestUnlocked,
      maxHp: this.player.maxHp,
      hp: this.player.hp,
      atk: this.player.atk,
      speed: this.player.speed,
      level: this.player.level,
      xp: this.player.xp,
      xpNext: this.player.xpNext,
      kills: this.player.kills,
      critChance: this.player.critChance,
    });
  }

  nextFloor() {
    if (this.transitioning) return;
    this.transitioning = true;
    this.portal?.destroy(); this.portal = null;

    if (this.levelNumber >= TOTAL_LEVELS) {
      this.triggerVictory();
      return;
    }

    this.levelNumber++;
    this.floorManager.buildFloor();
    this.enemies.clear(true, true);
    this.floorManager.spawnEnemies(this.enemies, this.player);

    this.player.sprite.setPosition(60, 250);
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);

    this.persistProgress();
    this.events.emit('levelstart', getLevel(this.levelNumber).name, this.levelNumber);
    this.time.delayedCall(300, () => { this.transitioning = false; });
  }

  triggerGameOver() {
    this.gameOverFlag = true;
    clearSave();
    this.events.emit('gameover', {
      level: this.levelNumber,
      kills: this.player.kills,
      playerLevel: this.player.level
    });
  }

  triggerVictory() {
    this.gameOverFlag = true;
    clearSave();
    this.events.emit('victory', {
      kills: this.player.kills,
      playerLevel: this.player.level
    });
  }

  restartGame() {
    this.gameOverFlag = false;
    this.portal = null;
    this.scene.stop('UIScene');
    const saved = loadGame();
    if (saved) {
      this.scene.start('LevelMapScene', {
        difficultyKey: saved.difficultyKey,
        unlockedLevel: saved.unlockedLevel || 1
      });
    } else {
      this.scene.start('MainMenuScene');
    }
  }
}
